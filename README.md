# 의료소송 자문 홈페이지 무료 배포 가이드

## 파일
- `index.html`: 홈페이지 전체(디자인, 내용, 의뢰 폼)
- `profile.jpg`: 프로필 사진

## 1. 의뢰 폼 연결 (Web3Forms, 무료)
1. https://web3forms.com 에 접속해 의뢰를 받을 이메일 주소를 넣고 Access Key를 발급받습니다. 키는 메일로 옵니다.
2. `index.html` 아래쪽에서 `var WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";` 를 찾아 따옴표 안을 발급받은 키로 바꿉니다.
3. 키를 넣기 전에는 폼이 "내용을 복사해 메일로 보내 주세요" 안내로 대신 동작합니다.

의뢰 내용은 공개 게시판에 올라가지 않고 이메일로만 전달됩니다.

## 2. 무료 호스팅 (GitHub Pages)
1. github.com 에 가입합니다.
2. 새 저장소(Repository)를 만듭니다. 예: `kang-medlegal`, 공개(Public).
3. "Add file → Upload files"로 `index.html`, `profile.jpg`를 올립니다.
4. Settings → Pages → Branch를 `main` / `root`로 지정하고 저장합니다.
5. 1~2분 뒤 `https://<아이디>.github.io/kang-medlegal/` 주소로 열립니다.

Netlify(https://app.netlify.com/drop)에 폴더를 끌어다 놓는 방법도 무료이며 더 간단합니다.

## 3. 검색 등록 (무료)
- 네이버 서치어드바이저: https://searchadvisor.naver.com → 사이트 등록 → 소유 확인
- 구글 서치콘솔: https://search.google.com/search-console → URL 접두어로 등록

## 4. 선택 사항
- 개인 도메인(연 1~2만 원대): 구매 후 GitHub Pages 설정의 Custom domain에 연결
- 내용 수정: `index.html`을 메모장 등으로 열어 문구만 고친 뒤 다시 업로드
