# (주)데이터스톤 홈페이지

공공 마이데이터 · 개인정보 분야 소개용 회사 홈페이지. **정적 HTML/CSS**로만 만들었다.

## 왜 정적인가

이 사이트를 손볼 수 있는 사람이 한 명이고, 손대는 간격이 길다.
프레임워크·번들러를 쓰면 반년 뒤에 "고치려면 환경부터 살려야" 하는 물건이 된다.
그래서 **빌드 단계가 없다.**

- 파일을 고치고 `git push` 하면 그게 배포다
- `npm install` 없음. Node 버전 신경 쓸 일 없음
- 브라우저에서 파일을 바로 열어도 그대로 보인다

## 구조

```
index.html        메인
about.html        회사소개 — 인사말·개요·연혁·인증·오시는 길
business.html     사업영역 — 마이데이터/SI/AI/데이터·클라우드
solutions.html    기술역량 — 자체 개발 도구
portfolio.html    수행실적 — 법인 실적 / 대표 경력 (분리)
contact.html      문의하기
notice.html       공지사항 (내용은 notices.json 에서 읽는다)
404.html          없는 주소

assets/css/style.css   전체 스타일 (색·간격은 :root 변수)
assets/js/main.js      메뉴·필터·문의폼 (없어도 내용은 다 읽힌다)
assets/img/logo.svg          공식 로고 — 컬러 가로형 (밝은 배경)
assets/img/logo-light.svg    공식 로고 — 흰색 반전형 (어두운 배경)
assets/img/logo-symbol.svg   심볼만 — 좁은 자리용 (현재 미사용)
assets/img/favicon.svg       탭 아이콘
assets/img/pattern-symbol.svg 하위 페이지 헤더 배경 무늬 (심볼 단색판)

notices.json      공지 데이터 — 공지 추가는 이 파일만 고친다

CONTENT.md        🔴 배포 전 채워야 할 것 — 먼저 읽을 것
```

**헤더와 푸터는 각 HTML에 그대로 들어 있다.** 메뉴를 바꾸면 8개 파일을 함께 고쳐야 한다.
JS로 끼워 넣지 않은 이유는 검색엔진과 자바스크립트 꺼진 환경에서도 메뉴가 보여야 하기 때문이다.
페이지가 10개를 넘어가면 그때 정적 사이트 생성기를 검토한다.

**공지는 예외다** — 자주 바뀌는 내용이라 `notices.json` 한 곳에 두고 JS가 읽는다.
공지 하나 올리려고 파일 8개를 고쳐야 한다면 결국 아무도 안 올리게 되기 때문이다.
(검색엔진 노출은 그만큼 약해지지만, 공지는 그게 목적이 아니다)

## 로컬에서 보기

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` — 파일을 고치고 새로고침하면 바로 반영된다.

## 배포 — GitHub Pages

1. GitHub에 저장소를 만든다 (예: `datastone-homepage`)
2. 원격을 연결하고 올린다

   ```bash
   git remote add origin https://github.com/<계정>/datastone-homepage.git
   git push -u origin master
   ```

3. 저장소 **Settings → Pages** → Source를 **Deploy from a branch**,
   Branch를 **master / (root)** 로 지정
4. 1~2분 뒤 `https://<계정>.github.io/datastone-homepage/` 에서 열린다

### 도메인 연결 — `datastone.co.kr`

`CNAME` 파일은 이미 저장소에 있다. **남은 건 DNS 설정뿐이다.**

1. 도메인 등록기관(가비아·후이즈 등) DNS 관리에서
   - 루트 `datastone.co.kr` → **A 레코드 4개**
     `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`
   - `www` → **CNAME** → `<계정>.github.io`
2. GitHub 저장소 **Settings → Pages → Custom domain**에 `datastone.co.kr` 입력
3. 검증이 끝나면 **Enforce HTTPS** 체크
   (인증서 발급까지 몇 분~한 시간. 그 전까지는 경고가 뜨는 게 정상이다)

> ⚠️ **DNS 전파에 최대 24시간**이 걸릴 수 있다. 급한 일정이 있으면 이것부터 걸어두고
> 내용 채우기를 병행하는 편이 낫다.

> 📧 메일(`esa29@datastone.co.kr`)은 이 설정과 **무관하다.**
> A 레코드는 웹 트래픽만 바꾸므로 기존 MX 레코드는 건드리지 말 것.
> 실수로 지우면 메일이 끊긴다.

## 고칠 때 지킬 것

- **색·간격은 `style.css`의 `:root` 변수만 고친다.** 각 페이지에 색을 직접 쓰지 말 것.
  색 값은 공식 로고에서 뽑은 것이라 **바꾸면 로고와 어긋난다.** 꼭 바꿔야 하면
  흰 배경 대비 4.5:1을 다시 확인할 것 (`CONTENT.md` B-5)
- **로고 SVG는 웹 전용 최적화본이다.** 인쇄물·제안서에는 원본 `Datastone.ai`를 쓸 것
- **주석은 한국어로.** "무엇을 하는가"가 아니라 **"왜 이렇게 했는가"**를 적는다
- 아직 안 채운 정보는 `<span class="ph">…</span>`로 감싼다. 화면에서 주황색으로 보여
  그대로 배포되는 사고를 막는다
- 🔴 **없는 실적·인증을 채우지 말 것.** 발주처 자격 검증에서 그대로 문제가 된다
  (자세한 기준은 `CONTENT.md` B항)

## 이 저장소의 위치

사내 저장소 여럿 중 하나이며, **다른 저장소와 코드를 공유하지 않는다.**
회사 정보의 원본은 사내 지식 볼트다 (`CONTENT.md` E항 참고).
