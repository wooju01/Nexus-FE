@AGENTS.md

# CLAUDE.md — Nexus Frontend

> 이 파일은 Claude Code가 **Nexus Frontend** 작업 시 따라야 하는 전체 지침입니다.
> **첫 줄의 `@AGENTS.md`는 Next.js 16 학습 데이터 차이에 대한 경고입니다 — 코드 작성 전 반드시 읽으세요.**

---

# Part 1. 공통 규칙

이 섹션은 FE/BE 양쪽 모두에 적용되는 프로젝트 공통 규칙입니다.

---

## 1. 언어 및 커뮤니케이션

- **모든 응답은 한국어로 작성.**
- 코드 주석, 커밋 메시지, PR 제목/본문, 이슈 설명도 한국어.
- 단, 다음은 **영어 원문 유지**:
  - 코드 식별자 (변수명, 함수명, 클래스명, 파일명)
  - 라이브러리/API/프레임워크 명칭 (예: `useEffect`, `PostgreSQL`, `WebSocket`)
  - 에러 메시지 원문 및 스택 트레이스
  - Task ID (`NX-142`), PR 번호 (`PR #2415`) 등 식별자

---

## 2. 프로젝트 개요

**Nexus**는 팀의 대화·작업·문서를 연결하는 실시간 협업 대시보드입니다.

- **조직**: Aether Labs
- **타겟**: 10~200명 규모의 프로덕트/엔지니어링/디자인 팀
- **핵심 가치**: Context preservation · Single home · Real-time · AI-native
- **현재 단계**: 스캐폴드 단계 (도메인 구현 전)
- **레포 구조**: FE([Nexus-FE](https://github.com/wooju01/Nexus-FE))와 BE([Nexus-BE](https://github.com/wooju01/Nexus-BE))는 **독립 Git 레포**. 패키지 매니저는 양쪽 모두 **npm**.
- FE는 BE 코드를 직접 import 할 수 없으며, 반드시 **HTTP/WebSocket 경계**를 통해 통신합니다.

주요 도메인 엔티티: `User`, `Workspace`, `Project`, `Channel`, `Message`, `Thread`, `Task`, `Comment`, `InboxItem`, `Notification`

---

## 3. 도메인 규칙

- **Task ID**: `NX-<숫자>` 형식. 클라이언트 수동 지정 금지, 서버 시퀀스에서 할당.
- **Priority**: `P1`(red) / `P2`(orange) / `P3`(yellow) 세 단계만.
- **Status**: `Backlog` → `To do` → `In progress` → `In review` → `Done`.
- **Channel 자동 연결**: Project 생성 시 동명의 Channel이 자동 생성·링크 (`auto-linked`).
- **Linked Channel** Task에 코멘트 → 연결된 채널 스레드에 자동 브리지 (순환 방지 필수).
- **Presence**: 30초 미활동 시 offline 처리.
- **실시간 이벤트**: Workspace 단위로 namespace 분리.
- **Label 컬러 매핑**은 디자인 토큰에서 단일 진실원(SSOT) 유지.

---

## 4. 공통 코드 컨벤션

### TypeScript
- `any` 지양. 부득이할 경우 `unknown` + 타입 가드, PR 설명에 이유 명시.
- 타입은 `type` 우선, 확장이 필요한 경우에만 `interface`.
- Enum 대신 `as const` 객체 + union 타입 선호 (NestJS 데코레이터 등 예외).
- 타입 전용 import는 `import type { ... }` 사용.

### 네이밍
- 파일: `kebab-case.ts(x)` (NestJS 컨벤션 `*.module.ts`, `*.service.ts` 등은 유지)
- 컴포넌트 / 클래스 / 타입: `PascalCase`
- 함수 / 변수: `camelCase`
- 상수: `SCREAMING_SNAKE_CASE`
- Boolean: `is`, `has`, `can`, `should` 접두사

### 주석
- "왜(why)" 위주로 작성. "무엇(what)"은 코드와 타입으로 표현.
- TODO에는 작성자/이슈 ID 포함: `// TODO(jiwoo, NX-201): ...`

---

## 5. Git / 브랜치 / 커밋 / PR

### 브랜치
- `main`: 보호 브랜치, 항상 배포 가능 상태
- Feature: `feat/<area>-<short-desc>` (예: `feat/fe-kanban-dnd`)
- Fix: `fix/<area>-<short-desc>`
- Chore: `chore/<desc>`

### 커밋 (Conventional Commits)
- 형식: `<type>(<scope>): <subject>`
- type: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `style`
- scope 예시: `fe`, `be`, `chat`, `board`, `auth`, `db`, `ws`, `ai`, `prisma`
- 제목은 한국어 허용, 50자 이내
- 관련 Task ID를 제목 또는 본문에 포함
  ```
  feat(fe/board): 칸반 드래그 앤 드롭 구현 (NX-119)
  fix(be/chat): 스레드 답글 카운트 동시성 문제 수정 (NX-205)
  ```

### PR
- 제목에 Task ID 포함
- 본문: **변경 요약 / 변경 이유 / 테스트 방법 / 스크린샷(FE)**
- 리뷰어 최소 1명 승인 + CI 초록 후 머지 (Squash merge 기본)
- FE/BE를 동시에 수정해야 한다면, 가능하면 PR을 분리하고 **BE를 먼저 머지**

**Claude는 사용자가 명시적으로 요청하지 않는 한 자동으로 커밋·푸시·PR 생성을 하지 않습니다.**

---

## 6. 보안

- 환경 변수는 `.env.local`에만. 저장소에 커밋 금지 (`.env.example`에 키 목록만 유지).
- Secret/토큰을 로그·에러 메시지·커밋 메시지에 포함 금지.
- 사용자 입력은 항상 검증.
- 민감 파일 (`.env*`, `*.pem`, `secrets/*`, `*.key`) 읽기·수정 금지.
- 의존성 추가 전 라이선스 확인 (MIT/Apache-2.0/BSD 외에는 사용자 확인).

---

# Part 2. Frontend 전용 규칙

---

## 7. Next.js 16 주의

이 프로젝트는 **Next.js 16.2.4**입니다. 학습 데이터(주로 Next.js 13~15)와 API/규칙이 다를 수 있습니다.

- 새 패턴 사용 전 **`node_modules/next/dist/docs/`** 관련 가이드를 먼저 확인.
- Deprecation 경고가 보이면 새 API로 전환.
- `app/` (App Router) 기본. Pages Router 사용 금지.

---

## 8. 기술 스택

### 현재 설치
- **Next.js 16.2.4** (App Router) + **React 19.2.4** + **react-dom 19.2.4**
- **TypeScript 5** (`strict: true`)
- **Tailwind CSS v4** (`tailwindcss@^4`) + `@tailwindcss/postcss`
- **ESLint 9** + `eslint-config-next@16.2.4`
- 패키지 매니저: **npm** (`package-lock.json`)

### 미도입 (도입 시 사용자 확인 필수)
- 상태 관리 (Zustand, TanStack Query)
- 폼 (react-hook-form, zod)
- 리치 텍스트 (tiptap), 보드 DnD (@dnd-kit), 모션 (Framer Motion)
- 가상 스크롤 (@tanstack/react-virtual)
- 테스트 (Vitest, React Testing Library, Playwright, MSW)
- 관측성 (Sentry, PostHog), WebSocket 클라이언트

---

## 9. 폴더 구조

### 현재
```
fe/
├── package.json          # name: "nero-fe"
├── tsconfig.json         # strict: true, paths: { "@/*": ["./*"] }
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── AGENTS.md
├── public/
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

- **`src/` 폴더 없음** — 코드는 `app/` 및 루트 직속 디렉토리에 둡니다.
- **경로 alias: `@/*` → `./*`** (프로젝트 루트 기준)

### 도메인 코드 추가 시 권장 구조
```
fe/
├── app/                  # 라우트만 (페이지/레이아웃)
├── components/           # 재사용 UI (ui/, chat/, board/, inbox/)
├── features/             # 도메인 단위 모듈 (UI + 훅 + 로직)
├── hooks/
├── lib/                  # api 클라이언트, ws 클라이언트, util
├── stores/               # Zustand 스토어 (도입 후)
└── types/                # FE 전용 타입
```

---

## 10. 주요 명령어

```bash
npm run dev       # next dev — http://localhost:3000
npm run build     # next build
npm run start     # next start
npm run lint      # eslint
```

**Claude는 변경 후 다음을 실행해 검증합니다:**
1. `npm run lint`
2. `npx tsc --noEmit`

---

## 11. React / 컴포넌트 규칙

- **함수형 컴포넌트만** 사용. `function ComponentName()` 선언 (화살표 함수보다 stack trace 명확).
- **Server Component가 기본**. Client Component는 `"use client"` 명시.
- Props 타입:
  ```tsx
  type ButtonProps = {
    variant?: "primary" | "ghost";
    children: React.ReactNode;
  };

  export function Button({ variant = "primary", children }: ButtonProps) { ... }
  ```
- 훅 호출 순서: `useState` → `useRef` → `useMemo` / `useCallback` → `useEffect` → 커스텀 훅
- 이벤트 핸들러: 내부 `handleClick`, props `onClick`
- 조건부 렌더링: `&&` 대신 **삼항 연산자** 또는 **Early return** (falsy 숫자 버그 방지)
  ```tsx
  // ❌ count가 0이면 0이 그대로 렌더링됨
  {count && <Badge>{count}</Badge>}
  // ✅
  {count > 0 ? <Badge>{count}</Badge> : null}
  ```
- 한 파일 ≤ 250줄 권장. 단일 책임 원칙으로 분해.

---

## 12. CSS / Tailwind v4

- 설정은 **CSS 파일 안 `@import "tailwindcss"; @theme { ... }`** (v3의 `tailwind.config.ts` 방식 아님).
- `app/globals.css`가 Tailwind 진입점, PostCSS 플러그인은 `@tailwindcss/postcss`.
- 인라인 `style` 금지. Tailwind 유틸리티 클래스 사용.
- 컬러는 **디자인 토큰**으로 (예: `bg-surface-elevated`, `text-fg-secondary`) — 매직 hex 값 금지.
- 다크 모드가 기본. Priority/Status 컬러는 토큰화: `text-priority-p1`, `bg-status-in-progress`.
- 복잡한 클래스 조합은 `cn()` 헬퍼(clsx + tailwind-merge) 도입 후 정리.

---

## 13. 상태 관리 (도입 후)

> 현재는 React 내장 훅만 사용.

- **Zustand**: 글로벌 UI 상태만 (사이드바, 모달, 테마). 서버 데이터를 복제하지 말 것.
- **TanStack Query**: 모든 API 호출은 Query/Mutation 훅으로 래핑. Query Key: `["channel", channelId, "messages", { cursor }]`.
- **도입 전**: Server Component에서 fetch 처리, Client에는 props로 전달.

---

## 14. 실시간 / 성능 / 접근성

### 실시간 (WebSocket — 도입 후)
- 단일 WebSocket 연결을 `lib/ws/client.ts`에서 관리 (싱글톤).
- 재연결: exponential backoff (최대 30초), 재연결 직후 누락분 fetch.

### 성능
- 긴 목록은 가상 스크롤 필수 (도입 후 `@tanstack/react-virtual`).
- 이미지: `next/image` + AVIF/WebP, `priority`는 LCP 후보에만.
- 번들 영향 큰 라이브러리는 동적 import (`next/dynamic`).
- **예산**: 초기 JS ≤ 200KB gzip, LCP ≤ 2.5s, INP ≤ 200ms.

### 접근성
- 모든 인터랙티브 요소 키보드 접근 가능. 색 대비 WCAG AA 이상.
- 아이콘 전용 버튼에 `aria-label` 필수. 모달은 포커스 트랩 + ESC 닫기.
- 새 메시지·알림은 `aria-live="polite"` 라이브 영역으로 전달.

---

## 15. Import 순서

1. Node / React 기본 (`react`, `next/...`)
2. 외부 라이브러리
3. `@/*` 내부 alias 경로
4. 상대 경로 (`./`, `../`)
5. 타입 전용 import (`import type { ... }`)

---

## 16. 테스트 (도입 후)

- **단위**: Vitest + React Testing Library. 사용자 관점 쿼리 우선 (`getByRole`, `getByLabelText`).
- **E2E**: Playwright. 주요 플로우: 로그인, 메시지 송수신, Task 생성/이동, 보드 DnD.
- **커버리지**: 핵심 비즈니스 로직 80%+. Snapshot 테스트 지양, 명시적 assertion 선호.
- 테스트 위치: 대상 파일 옆 `__tests__/` 또는 `*.test.tsx`. 모킹은 MSW 권장.

---

# Part 3. 작업 원칙

---

## 17. Claude Code 작업 원칙

### 항상 하기
- 변경 전 관련 파일 먼저 읽어 맥락 파악
- 기존 코드 스타일·패턴 따르기
- 작업 후 `npm run lint` + `npx tsc --noEmit` 실행
- 의미 있는 변경이면 테스트도 함께 추가/수정 (테스트 러너 도입 후)
- 모호한 요구사항은 추측 대신 질문
- 단계별 계획을 먼저 공유한 뒤 구현
- 새 의존성 추가 전 사용자에게 확인
- **FE 변경이 BE 계약(API 스키마)을 건드린다면 BE 영향 범위를 먼저 보고**

### 절대 하지 않기
- 요청 범위 밖의 리팩토링
- `any`, `@ts-ignore`, `eslint-disable`을 설명 없이 추가
- 의존성을 독단적으로 추가
- 민감 파일 읽기·수정
- `git push --force`, `git reset --hard` 등 파괴적 명령 자동 실행
- 사용자가 요청하지 않은 커밋·푸시·PR 생성
- 테스트를 삭제·스킵하여 통과시키기

### FE 전용 금기 사항
- ❌ `be/` 레포의 파일을 직접 import
- ❌ Pages Router 사용 — App Router만
- ❌ Next.js 13~15 시절 deprecated API 사용 (`node_modules/next/dist/docs/` 확인)
- ❌ `pnpm` / `yarn` 사용 — `npm`만
- ❌ `src/` 디렉토리 신설
- ❌ `useEffect` 안에서 fetch 직접 수행
- ❌ `localStorage`/`sessionStorage`를 SSR 코드에서 가드 없이 접근
- ❌ 인라인 `style` 또는 직접 hex 컬러 값 사용
- ❌ 큰 라이브러리를 SSR 번들에 포함 (client-only 동적 import 사용)

### 불확실할 때
- 사용자에게 구체적 선택지를 제시하고 확인을 받습니다.
- "이렇게 진행하려고 합니다: A, B, C. 이 방향 맞을까요?" 형식으로 질문.

---

*이 문서는 프로젝트 상태와 컨벤션 변경에 따라 업데이트합니다. 새 라이브러리 도입 시 "8. 기술 스택" 섹션도 함께 수정하세요.*
