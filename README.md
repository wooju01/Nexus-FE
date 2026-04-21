# Nexus Frontend

> 팀의 대화·작업·문서를 연결하는 실시간 협업 대시보드 **Nexus**의 Frontend 레포.
> 백엔드 레포: [Nexus-BE](https://github.com/wooju01/Nexus-BE)

---

## 제품 개요 (요약)

Nexus는 Slack의 대화, Linear/Jira의 이슈 트래킹, Notion의 문서를 단일 제품 경험으로 통합하는 실시간 협업 플랫폼입니다. 타겟은 10~200명 규모의 프로덕트/엔지니어링/디자인 팀입니다.

**핵심 가치**
- Context preservation — 채널 대화 ↔ Task/Project 양방향 연결
- Single home — Inbox / Mentions / My tasks / Approvals 통합
- Real-time — 스레드, Presence, 보드 즉시 반영
- AI-native — Daily digest, Summarize thread

📖 **제품 전체 문서 (기능 상세, 데이터 모델, 디자인 가이드라인, 로드맵, 키스크린 매핑)는 [`docs/product.md`](./docs/product.md)를 참고하세요.** 이 문서가 Nexus 제품의 단일 진실원(SSOT)입니다.

---

## 기술 스택

| 분류 | 현재 설치 |
|---|---|
| 프레임워크 | **Next.js 16.2.4** (App Router) |
| 런타임 | **React 19.2.4** + react-dom 19.2.4 |
| 언어 | **TypeScript 5** (`strict: true`) |
| 스타일 | **Tailwind CSS v4** + `@tailwindcss/postcss` |
| Lint | **ESLint 9** + `eslint-config-next@16.2.4` |
| 패키지 매니저 | **npm** (`package-lock.json`) |

**미도입 (도입 시 [CLAUDE.md](./CLAUDE.md) 업데이트 필요)**
Zustand, TanStack Query, react-hook-form, Zod, tiptap, @dnd-kit, Framer Motion, @tanstack/react-virtual, Vitest, React Testing Library, Playwright, MSW, Sentry, PostHog, WebSocket 클라이언트.

---

## ⚠️ Next.js 16 주의

이 프로젝트는 **Next.js 16**입니다. 학습 자료(13~15)와 다른 API/컨벤션이 있습니다.
자세한 내용은 [AGENTS.md](./AGENTS.md)와 `node_modules/next/dist/docs/`를 참고하세요.

---

## 시작하기

```bash
# 1. 클론
git clone git@github.com:wooju01/Nexus-FE.git
cd Nexus-FE

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (아래 "환경 변수" 참조)
cp .env.example .env.local
# .env.local 편집 → NEXT_PUBLIC_API_URL 등 입력

# 4. 개발 서버
npm run dev              # http://localhost:3000
```

### 요구 사항
- Node.js LTS (18.x 이상 권장, Next.js 16은 Node 18+ 필요)
- Backend 서버(Nexus-BE)가 로컬에서 실행 중이어야 API 연동 기능이 동작합니다.

---

## 주요 명령어

```bash
npm run dev              # 개발 서버 (Hot Reload)
npm run build            # 프로덕션 빌드
npm run start            # 빌드된 결과 실행
npm run lint             # ESLint 검사

# 타입 체크 (스크립트 미정의 상태 → 수동 실행)
npx tsc --noEmit
```

> `typecheck`, `test`, `format` 스크립트는 아직 `package.json`에 정의되어 있지 않습니다. 러너 도입 시 추가 예정.

---

## 폴더 구조

```
Nexus-FE/
├── AGENTS.md            # Next.js 16 경고 (필독)
├── CLAUDE.md            # Claude Code 작업 지침
├── README.md            # 이 파일
├── package.json         # name: "nero-fe"
├── tsconfig.json        # strict: true, alias: "@/*" → "./*"
├── next.config.ts
├── postcss.config.mjs   # @tailwindcss/postcss
├── eslint.config.mjs
├── public/
└── app/                 # App Router (src/ 폴더 없음)
    ├── layout.tsx
    ├── page.tsx
    └── globals.css      # Tailwind v4 진입점
```

**주의 사항**
- `src/` 폴더는 사용하지 않습니다. 코드는 `app/`과 루트 직속 디렉토리(`components/`, `lib/` 등)에 배치합니다.
- 경로 alias는 `@/*` → `./*` (프로젝트 루트 기준).

### 도메인 코드 추가 시 권장 구조
```
app/                     # 라우트만 (페이지/레이아웃)
components/              # 재사용 UI (ui/, chat/, board/, inbox/)
features/                # 도메인 단위 모듈 (UI + 훅 + 로직)
hooks/                   # 커스텀 훅
lib/                     # api 클라이언트, ws 클라이언트, util
stores/                  # Zustand 스토어 (도입 후)
types/                   # FE 전용 타입
```

---

## 환경 변수

`.env.local` (커밋 금지, `.env.example`에 키 목록만 유지)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

# (도입 후) 관측성
# NEXT_PUBLIC_SENTRY_DSN=
# NEXT_PUBLIC_POSTHOG_KEY=
```

`NEXT_PUBLIC_*` prefix가 붙은 값만 브라우저에 노출됩니다. Secret은 해당 prefix 없이 서버 컴포넌트에서만 사용하세요.

---

## Tailwind v4 주의

설정은 **CSS 파일 안**에서 합니다 (v3의 `tailwind.config.ts` 방식 아님).

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-surface: #0B0D10;
  --color-surface-elevated: #15181D;
  /* ... */
}
```

PostCSS 플러그인은 `@tailwindcss/postcss` 하나만 필요합니다.

---

## 컨벤션 요약

- 언어: 모든 응답·주석·커밋·PR은 **한국어** ([CLAUDE.md](./CLAUDE.md) §1 참고)
- 커밋: Conventional Commits (예: `feat(fe/board): 칸반 DnD 구현 (NX-119)`)
- 브랜치: `feat/<area>-<short-desc>`, `fix/…`, `chore/…`
- PR: 제목에 Task ID, 본문에 변경 요약 / 이유 / 테스트 방법 / 스크린샷
- 파일명: `kebab-case.tsx`, 컴포넌트/타입: `PascalCase`, 함수/변수: `camelCase`

상세는 [CLAUDE.md](./CLAUDE.md)에 있습니다.

---

## 트러블슈팅

**`Cannot find module 'next/...'`**
→ `rm -rf .next node_modules && npm install` 재시도.

**Tailwind 클래스가 적용 안 됨**
→ `postcss.config.mjs`가 `@tailwindcss/postcss`를 포함하는지 확인.
→ `app/globals.css`의 `@import "tailwindcss";`가 `app/layout.tsx`에서 import되는지 확인.

**API 요청이 CORS 오류**
→ Backend의 허용 오리진 설정 확인. 로컬 개발 시 `http://localhost:3000` 허용 필요.

---

## 관련 문서

- [`docs/product.md`](./docs/product.md) — **제품 전체 문서 (SSOT)** — 기능 상세, 데이터 모델, 디자인 가이드라인, 로드맵
- [CLAUDE.md](./CLAUDE.md) — Claude Code 작업 지침 (공통 + FE 전용)
- [AGENTS.md](./AGENTS.md) — Next.js 16 경고
- [Nexus-BE](https://github.com/wooju01/Nexus-BE) — 백엔드 레포

---

## 팀 & 라이선스

- **조직**: Aether Labs
- **라이선스**: TBD (내부 전용 / 추후 결정)
