/* 자문 의뢰 폼 → 이메일 (Cloudflare Pages Function, POST /api/inquiry)
   - 메일 보내기: Resend(https://resend.com) API. 키는 코드에 넣지 않고 Cloudflare Pages 환경 변수로만 둠
       RESEND_API_KEY (비밀, 필수) · TO_EMAIL (받는 주소, 필수) · FROM_EMAIL (선택, 도메인 인증 뒤 예: 의뢰 <inquiry@내도메인>)
   - 의뢰 내용은 어디에도 저장하지 않고 메일로만 전달
   - 설정 전이거나 실패하면 503/502를 돌려주고, 화면은 '복사해서 메일로 보내기'로 대신함 */
const LABELS = [
  ['firm', '법무법인·사무소'], ['lawyer', '담당 변호사'], ['email', '회신 이메일'], ['phone', '연락처'],
  ['side', '대리하는 측'], ['stage', '사건 단계'], ['hospital', '관련 의료기관'], ['deadline', '희망 회신 기한'], ['services', '필요한 자문'],
];
const MAX = { firm: 100, lawyer: 60, email: 120, phone: 40, side: 40, stage: 40, hospital: 120, deadline: 20, services: 200, summary: 5000 };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

function emailHtml(d, sentAt) {
  const rows = LABELS.map(([k, l], i) => `<tr><td style="padding:10px 14px;width:132px;color:#4d5866;font-size:13px;border-bottom:1px solid #e6e9ed;background:${i % 2 ? '#ffffff' : '#fafbfc'}">${l}</td>
    <td style="padding:10px 14px;font-size:14px;color:#17202b;border-bottom:1px solid #e6e9ed;background:${i % 2 ? '#ffffff' : '#fafbfc'}">${k === 'email' && d.email ? `<a href="mailto:${esc(d.email)}" style="color:#c42f3a">${esc(d.email)}</a>` : esc(d[k] || '—')}</td></tr>`).join('');
  return `<!doctype html><html lang="ko"><body style="margin:0;background:#f1f3f5;padding:24px 12px;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d9dee4;border-radius:6px;overflow:hidden">
    <tr><td style="background:#c42f3a;height:4px;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:22px 24px 6px">
      <div style="font-size:12px;letter-spacing:.08em;color:#c42f3a;font-weight:700">MEDICAL-LEGAL INQUIRY · 자문 의뢰</div>
      <div style="font-size:21px;font-weight:800;color:#17202b;margin-top:6px">${esc(d.firm)} · ${esc(d.lawyer)} 변호사</div>
      <div style="font-size:13px;color:#4d5866;margin-top:4px">${esc(d.side)} · ${esc(d.stage)} · 접수 ${esc(sentAt)}</div>
    </td></tr>
    <tr><td style="padding:16px 24px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e9ed;border-radius:4px;border-collapse:separate;overflow:hidden">${rows}</table></td></tr>
    <tr><td style="padding:16px 24px 4px">
      <div style="font-size:13px;color:#4d5866;font-weight:700;margin-bottom:6px">사건 개요</div>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.7;color:#17202b;background:#fbe9ea;border-left:3px solid #c42f3a;padding:12px 14px;border-radius:2px">${esc(d.summary)}</div>
    </td></tr>
    <tr><td style="padding:18px 24px 22px">
      <a href="mailto:${esc(d.email)}?subject=${encodeURIComponent('[회신] ' + d.firm + ' 자문 의뢰 건')}" style="display:inline-block;background:#c42f3a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:3px">변호사님께 회신하기</a>
      <div style="font-size:12px;color:#8a94a0;margin-top:14px;line-height:1.6">이 메일에 바로 '답장'해도 의뢰인(${esc(d.email)})에게 갑니다.<br>홈페이지 의뢰 폼에서 보낸 메일입니다. 개인정보 동의를 받았고, 내용은 서버에 저장하지 않았습니다.</div>
    </td></tr>
  </table></body></html>`;
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url), origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json({ ok: false, reason: 'origin' }, 403);
  if ((request.headers.get('content-length') | 0) > 20000) return json({ ok: false, reason: 'size' }, 413);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, reason: 'json' }, 400); }
  if (b.botcheck) return json({ ok: true });                       // 숨은 칸이 채워졌으면 로봇 — 조용히 끝냄
  const d = {};
  for (const k of Object.keys(MAX)) d[k] = String(b[k] ?? '').trim().slice(0, MAX[k]);
  if (!d.firm || !d.lawyer || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !d.side || !d.stage || !d.services || d.summary.length < 20 || b.agree !== true)
    return json({ ok: false, reason: 'invalid' }, 400);
  if (!env.RESEND_API_KEY || !env.TO_EMAIL) return json({ ok: false, reason: 'not_configured' }, 503);
  const sentAt = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' (KST)';
  const text = LABELS.map(([k, l]) => `${l}: ${d[k] || '-'}`).join('\n') + `\n\n사건 개요:\n${d.summary}\n\n접수: ${sentAt}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || '의료소송 자문 의뢰 <onboarding@resend.dev>',
      to: env.TO_EMAIL.split(',').map(s => s.trim()).filter(Boolean),
      reply_to: d.email,
      subject: `[자문 의뢰] ${d.firm} · ${d.lawyer} 변호사 · ${d.stage}`,
      html: emailHtml(d, sentAt), text,
    }),
  });
  if (!r.ok) return json({ ok: false, reason: 'send', status: r.status }, 502);
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, reason: 'method' }, 405);
