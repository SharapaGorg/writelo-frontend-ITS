# CLAUDE.md

Guidance for Claude Code when working with the Writelo frontend.

## Hard Rules

### Styling
- NEVER write plain CSS. Tailwind classes only.
- For composite components use shadcn-vue from `components/ui/`.
- Merge classes with `cn()` from `lib-modules/utils.ts`.

### API
- ALWAYS use `ApiController` from `scripts/shared/api/controller.ts`. No raw fetch/axios.
- For a new domain, extend `ApiController` (see `WorkspacesApiController`, `AuthApiController`).
- Endpoints live in `ApiAliases` enum (`scripts/shared/types/`), URLs built via `buildUrl()`.
- Most endpoints are workspace-scoped — get the id via `useWorkspaceContext().requireWorkspaceId()`.

### Components
- Atomic design: atoms → molecules → organisms → templates.
- Reuse `components/ui/` primitives.
- New features go in `lib-modules/<feature>/`, not scattered files.

### Utilities
- Before writing a utility, check whether one already exists under:
  - `lib-modules/utils.ts` — `cn()`
  - `scripts/features/utils/` — `generateUUID`, `isMobile`, `getScreenSize`, `downloadFile`
  - `scripts/features/utils/toater.ts` — toasts (note the filename typo, real file is `toater.ts`)
  - `scripts/features/conversations/formatting.ts` — date grouping for chat lists
  - `lib-modules/shared/services/` — `uploadFile` / `uploadFiles` / `getDownloadUrl`

## Imports

### Aliases
- `~/` (preferred) and `@/` — both point to project root.

### Rules
- From outside a module — import only from its `index.ts` public API:
  ```ts
  import { useWorkspaceContext } from '~/lib-modules/workspaces' // ✅
  import { useWorkspacesStore } from '~/lib-modules/workspaces/stores/workspacesStore' // ❌ internals
  ```
- Inside a module — use relative paths (`../stores`, `./types`).
- No `lib-modules/...` without `~/`. No `@lib-modules/...`, no `app-modules/...` — these aliases don't exist.

## Code organization

| Code type | Location |
|-----------|----------|
| New feature (UI + logic + state) | `lib-modules/<feature>/` |
| Cross-module reusable component | `components/` (atoms/molecules/organisms) |
| shadcn primitives | `components/ui/` |
| Global state / composables | `composables/` |
| Shared services/utilities | `lib-modules/shared/` |
| **Legacy** — do NOT add new code | `scripts/` |

### New module skeleton
```
lib-modules/my-feature/
├── components/
├── composables/
├── stores/
├── helpers/         # API controller, toasts, formatting
├── types/
└── index.ts         # public API — re-export here only
```

## Existing modules (`lib-modules/`)

Self-contained. Always import via `index.ts`. Browse the module's `index.ts` for its public surface — don't rely on a table in this file, it drifts.

- **workspaces** — workspace context, CRUD. Provides `useWorkspaceContext()` (required for all workspace-scoped calls) and `useWorkspaces()`.
- **conversations** — chat UI, messages, dialogs, streaming.
- **imageGenerator** — txt2img / img2img, history slider.
- **content-calendar** — calendar of scheduled posts.
- **content-editor** — post editor (draft, publish, platform-specific content).
- **plans** — subscription plans & pricing UI.
- **profile** — account, subscription, gifts.
- **web-auth** — email + OAuth (Google/Telegram/Yandex) auth.
- **reels-research** — Reels discovery/analysis.
- **demo-mode** — guest/demo experience.
- **app-layout** — shared app shell (sidebar, navbar).
- **shared** — `uploadFile`, `uploadFiles`, `getDownloadUrl`.

## Global composables (`composables/`)

| Composable | File | Purpose |
|------------|------|---------|
| `useUserController()` | `user.ts` | Auth, user data, token |
| `useWorkspaceContext()` | `lib-modules/workspaces` | Current workspace id |
| `useSettings()` | `settings.ts` | App config, language |
| `useEnv()` | `environment.ts` | Env state, current dialog, attached files |
| `eventBus` | `eventBus/` | Cross-component pub/sub |

### Event bus
```ts
import { eventBus } from '~/composables/eventBus'

eventBus.emit('dialog:titleUpdated', { id, title })
eventBus.on('dialog:titleUpdated', handler)
// Cleanup
onUnmounted(() => eventBus.off('dialog:titleUpdated', handler))
```

## API patterns

### Basic call
```ts
import { ApiController } from '~/scripts/shared/api/controller'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const api = new ApiController()
const { requireWorkspaceId } = useWorkspaceContext()
const conversations = await api.getWorkspaceConversations(requireWorkspaceId(), 0, 20)
```

### Extending for a new domain
```ts
// lib-modules/my-feature/helpers/api.ts
import { ApiController, RequestMethod } from '~/scripts/shared/api/controller'
import { buildUrl, ApiAliases } from '~/scripts/shared/types'

export class MyFeatureApiController extends ApiController {
  getItems(workspaceId: string) {
    return this.request(buildUrl(ApiAliases.workspaceItems, { workspaceId }))
  }
  createItem(workspaceId: string, data: CreateItemInput) {
    return this.request(buildUrl(ApiAliases.workspaceItems, { workspaceId }), RequestMethod.POST, data)
  }
}
```

### File upload
```ts
import { uploadFile } from '~/lib-modules/shared'

const result = await uploadFile(file, (progress) => {
  console.log(`${progress.phase}: ${progress.percent}%`)
})
// result.storageObjectId
```

> Для медиа к постам использовать отдельную пару `posts/uploads/init` + `finalize` (см. `docs/api-changelog-2026-04-23.md`), НЕ общий `uploadFile()`.

### Streaming messages (SSE)
```ts
const stream = await api.sendWorkspaceMessage(requireWorkspaceId(), convId, text)
const reader = stream.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
  for (const line of lines) {
    const data: MessageStreamData = JSON.parse(line.slice(6))
    // Server assigns ids via request_message_id / response_message_id events.
    // Handle: text_chunk, set_title, response_end, etc.
  }
}
```

## Dev commands

```bash
yarn dev       # dev server
yarn devo      # dev server against remote backend
yarn build     # build
yarn preview   # preview built app
yarn test      # vitest
```

## Reference docs

- `docs/api-changelog-2026-04-23.md` — latest API spec diff (IG/TG integrations, post uploads).
- `docs/migration-summary-2026-04-14.md` — Neovision → Writelo migration.
- `docs/v1-23.04.json` — current OpenAPI spec.
- `docs/modules/projects.md` — historical context (projects → workspaces).
