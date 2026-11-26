# kang-medlegal — AI 작업 안내

- 빌드 없는 정적 사이트: `index.html` 한 장 + `profile.jpg`. 의뢰 폼은 `functions/api/inquiry.js`(Cloudflare Pages Function)가 Resend로 메일 발송
- 환경 변수(Cloudflare Pages에서 사용자가 직접 입력): `RESEND_API_KEY`(비밀), `TO_EMAIL`, 선택 `FROM_EMAIL`. 없으면 폼이 "복사해서 메일로 보내기" 안내로 대신 동작
- main에 올리면 Cloudflare Pages 자동 배포
- 공개 저장소: 키·개인 정보를 넣지 않는다
- 문구·디자인 변경은 사용자 요청이 있을 때만
- 작업을 마치면 `STATUS.md`를 갱신한다
