# Nexus — 제품 문서

> 팀의 대화, 작업, 문서를 하나로 연결하는 실시간 협업 대시보드
> *Chat, tasks, and docs — connected.*

이 문서는 **Nexus 제품 전체의 단일 진실원(SSOT)**입니다. FE/BE 레포 양쪽에서 이 문서를 참조합니다.

- Frontend: [Nexus-FE](https://github.com/wooju01/Nexus-FE) (이 문서가 포함된 레포)
- Backend: [Nexus-BE](https://github.com/wooju01/Nexus-BE)

---

## 1. 프로젝트 개요 (Overview)

**Nexus**는 분산된 팀이 하나의 워크스페이스에서 커뮤니케이션하고, 작업을 추적하고, 맥락을 잃지 않고 협업할 수 있도록 설계된 실시간 협업 플랫폼입니다. Slack의 대화, Linear/Jira의 이슈 트래킹, Notion의 문서 기능을 단일 제품 경험으로 통합하는 것을 목표로 합니다.

### 핵심 가치 제안
- **맥락 보존(Context preservation)** — 채널의 대화가 자연스럽게 Task, Project, Doc과 양방향 연결됩니다 (`launch-q2` 채널 ↔ Launch · Q2 보드의 `auto-linked` 필드 참고).
- **단일 홈(Single home)** — Inbox / Mentions / My tasks / Approvals가 한 화면에서 통합 관리됩니다.
- **실시간 공동 편집(Real-time)** — 스레드, 프레즌스(who's online), 타이핑 인디케이터, 즉시 반영되는 보드 상태.
- **AI-native** — Daily digest, Summarize thread 등 AI 어시스트 기능이 워크플로우에 내장되어 있습니다.

### 타겟 사용자
소프트웨어 제품을 반복 출시하는 10~200명 규모의 프로덕트/엔지니어링/디자인 팀 (스크린 기준: Aether Labs 워크스페이스, Launch Q2 제품 출시 팀).

---

## 2. 주요 기능 (Key Features)

키스크린 분석을 기반으로 도출된 1차 릴리스 기능입니다.

### 2.1 Home — 개인화된 대시보드
- 시간대별 인사말 + 당일 요약 ("You have 3 tasks due today and 2 mentions waiting.")
- 4개 KPI 카드: **Unread in Inbox / Due Today / Active Threads / Focus Time**
- Inbox 스트림 (All · Mentions · Assigned · Approvals 탭 필터)
- My tasks 리스트 (우선순위 + 마감일 + 연결된 프로젝트/채널)
- Team 프레즌스 (Who's online, 현재 활동)
- 상단 Daily digest / Quick add 버튼

### 2.2 Channels — 실시간 채팅
- Public / Private 채널 (`# product-design`, `# engineering`, `# launch-q2`, `# general`, `# random`)
- 메시지 이모지 리액션, 핀(Pinned), 스레드 답글
- 멤버 아바타 스택 + 총원 표시 (예: "8 members")
- **Linked board**: 채널에 Project 보드를 1:1로 연결
- 첨부 파일 미리보기 (예: `Landing hero — copy variants v1.md`)
- 메시지 편집기: Bold / Italic / Strike / Link / Code + AI 어시스트 아이콘
- **Send & create task**: 메시지를 그대로 Task로 승격

### 2.3 Threads — 맥락 분리형 토론
- 우측 사이드 패널로 열리는 스레드
- 참여자 프로필 + 답글 수 표시 ("8 replies · Hana Jeong, Ethan Park, +3")
- 답글 내부에서도 리액션 / PR 링크 / 멘션 사용 가능
- 스레드 단위 `Summarize thread` AI 기능

### 2.4 Direct Messages
- 1:1 및 그룹 DM
- 읽지 않은 메시지 뱃지 (예: Sora Kim 옆 `2`)
- 온라인 상태 인디케이터

### 2.5 Projects & Boards — 작업 관리
- 프로젝트 목록: Launch · Q2, Platform migration, Design system v3, Customer onboarding
- 4가지 뷰: **Board / Table / Timeline / Calendar**
- Kanban 컬럼: Backlog → To do → In progress → (다음 상태)
- 컬럼 헤더에 WIP 카운터 (예: `To do 4 / 8`)
- Task 카드 구성: 우선순위(P1/P2/P3) · 티켓 ID(`NX-142`) · 제목 · 라벨 · 담당자 아바타 · 댓글/첨부 수 · 마감일
- 필터(Filter) · 그룹(Group) · 검색
- `+ New task` 빠른 생성

### 2.6 Task Detail
Task 패널은 우측에서 열리며 다음 필드를 관리합니다.
- Status, Priority, Assignees, Due date, Project, Labels
- **Linked channel** (자동 연결 표시: `auto-linked`)
- 탭: **Conversation** / Description / Sub-tasks / Activity
- 액션: Mark in review, Reassign, **Summarize thread (AI)**
- 인라인 코멘트 + `⌘ + Enter` 전송

### 2.7 Inbox — 통합 알림함
- 멘션, 스레드 답글, 승인 요청(Approvals), Task 할당이 한곳에 모임
- 항목별 출처 링크 (채널·프로젝트), 경과 시간 표시
- 읽음/안읽음/스누즈 처리

### 2.8 My tasks / My week
- 담당 Task만 모은 전용 뷰
- 주간 플래너(My week)로 일정 계획

### 2.9 검색 & 커맨드 팔레트
- `⌘K` 글로벌 검색 ("Search or jump to...")
- 채널, 사람, Task, 메시지, 파일 통합 인덱싱

### 2.10 알림 & Presence
- 상단 벨 아이콘 + 뱃지 카운트
- 사이드바 아바타의 실시간 온라인 도트

### 2.11 테마
- 기본 Dark mode (키스크린 전체가 다크 팔레트)
- Light mode는 후속 릴리스 대상

---

## 3. 정보 구조 (Information Architecture)

```
Workspace (Aether Labs)
└── Organization (Nexus)
    ├── Home
    ├── Inbox
    ├── My tasks
    ├── My week
    ├── Projects
    │   ├── Launch · Q2
    │   ├── Platform migration
    │   ├── Design system v3
    │   └── Customer onboarding
    ├── Channels
    │   ├── # product-design
    │   ├── # engineering
    │   ├── # launch-q2   ←→ Launch · Q2 (linked board)
    │   ├── # general
    │   └── # random
    └── Direct Messages
```

사이드바 좌측 끝의 세로 레일은 Home / Inbox / Messages / Boards / Docs / People 으로 구성된 **글로벌 네비게이션**입니다.

---

## 4. 데이터 모델 (초안)

> 스크린에서 확인되는 엔티티 기반의 초안. 구현 시 세부 스키마는 별도 문서화.

| Entity | 주요 필드 |
|---|---|
| `User` | id, name, email, avatarColor, presence, role |
| `Workspace` | id, name, members[] |
| `Project` | id, name, color, status (Active/Archived), members[], linkedChannelId |
| `Channel` | id, name, type (public/private/dm), topic, members[], pinnedMessageIds[] |
| `Message` | id, channelId, authorId, body (rich text), reactions[], threadId?, attachments[], createdAt |
| `Thread` | id, rootMessageId, replyCount, participantIds[] |
| `Task` | id (e.g. `NX-142`), title, description, status, priority (P1/P2/P3), assigneeIds[], dueDate, labels[], projectId, linkedChannelId, commentCount, attachmentCount |
| `Comment` | id, taskId, authorId, body, createdAt |
| `InboxItem` | id, userId, type (mention/reply/assigned/approval), sourceRef, isRead, createdAt |
| `Notification` | id, userId, payload, readAt |

### ID 컨벤션
- Task: `NX-<number>` (예: `NX-119`, `NX-142`)
- Pull Request 참조: `PR #<number>` (예: `PR #2415`)

### 상태값
- Task Status: `Backlog` · `To do` · `In progress` · `In review` · `Done`
- Priority: `P1` (red) · `P2` (orange) · `P3` (yellow)
- Labels 예시: `design`, `launch-q2`, `eng`, `copy`, `a11y`, `spec`, `security`, `design-sys`, `research`

---

## 5. 디자인 가이드라인

### 5.1 컬러 (토큰)
- Surface: near-black (`#0B0D10` 계열) / elevated panel (`#15181D` 계열)
- Text primary / secondary / tertiary 3-tier
- Accent (CTA): Bright blue (`Send` 버튼, 하이라이트)
- Priority colors: P1 Red · P2 Orange · P3 Yellow
- Label colors: Purple, Blue, Green, Red, Yellow (카테고리별 고정 매핑)
- Presence: Green dot (online)

### 5.2 타이포그래피
- 제목 및 인사말: Display-grade sans (예: Inter Display)
- 본문 UI: Sans-serif (Inter, Pretendard 한글 지원)
- 코드 / ID / 단축키 배지: Mono

### 5.3 간격 & 그리드
- 좌측 글로벌 레일(약 72px) + 2차 사이드바(약 280px) + 메인 콘텐츠 + 선택적 우측 패널(스레드/Task detail)
- 카드 모서리: 12px radius
- 입력창은 Sticky bottom 고정

### 5.4 상호작용
- 모든 목록 항목은 Hover 상태에서 액션 아이콘 노출 (이모지, 스레드 열기, 핀, 플래그, 더보기)
- 키보드 단축키 우선: `⌘N` 새로 만들기, `⌘K` 검색, `⌘+Enter` 전송
- 드래그-앤-드롭으로 보드 컬럼 간 Task 이동

---

## 6. QA 체크리스트 (스크린 기반 최소 요건)

- 다크 모드 컬러 대비 WCAG AA 통과 (참고: `NX-143 Audit color contrast on all dark surfaces`)
- 키보드 내비게이션 / 포커스 트랩
- 긴 채널/보드 가상 스크롤 성능
- 오프라인/재연결 시 메시지 재전송 큐
- i18n 없이 한국어 UI 기반 (텍스트 오버플로우 주의)

---

## 7. 로드맵 (초안)

**Milestone 1 — Foundation (4주)**
- 인증, 워크스페이스, Channels, Messages(read/write), Threads, Inbox 기본

**Milestone 2 — Projects & Tasks (4주)**
- Projects, Board/Table 뷰, Task CRUD, 채널 ↔ 보드 연결

**Milestone 3 — Home & Realtime (3주)**
- Home 대시보드, Presence, 알림, 검색

**Milestone 4 — AI & Polish (3주)**
- Daily digest, Summarize thread, Quick add, 모바일 반응형, 접근성 감사

---

## 8. 키스크린 요약 (디자인 목업 매핑)

| # | 화면 | 핵심 요소 |
|---|---|---|
| 1 | `#launch-q2` 채널 | 메시지 리스트, 리액션, 멤버 아바타, Pinned / Linked board / Search |
| 2 | `#launch-q2` + Thread 패널 | 우측 스레드, 답글 수, `Reply to thread...` 입력 |
| 3 | Launch · Q2 Board + Task detail | Backlog/To do 컬럼, NX-142 상세 (Conversation / Description / Sub-tasks / Activity) |
| 4 | Home | 인사말, KPI 4카드, Inbox 필터(All/Mentions/Assigned/Approvals), My tasks, Team |
| 5 | Launch · Q2 Board (확장) | Backlog/To do/In progress 3컬럼, 우선순위·라벨·담당자·댓글/첨부 수 |

---

## 9. 팀 & 라이선스

- **팀**: Aether Labs — Product, Design, Engineering
- **코어 팀원 (스크린 기준)**: Sejun Yun, Sora Kim, Minho Lee, Ethan Park, Hana Jeong, Yuna Choi
- **라이선스**: TBD (내부 전용 / 추후 결정)

---

*본 문서는 1차 디자인 목업(더미 데이터)을 기반으로 작성된 제품 개요입니다. 구현 진행에 따라 각 섹션을 업데이트하세요.*
