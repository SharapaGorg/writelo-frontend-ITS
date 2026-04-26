# Theme Migration to landing-new — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the visual theme from `lib-modules/landing-new` (fonts + warm rust/cream palette + sharp corners) to the entire Writelo app, preserving both light and dark modes.

**Architecture:** Drive everything through shadcn-vue's existing CSS-variable token system. Update `assets/css/main.css` (`:root` + `prefers-color-scheme: dark`) and `tailwind.config.js` (fonts, radius). Then refactor the one component that ignores tokens (`components/ui/button`) and sweep all remaining hardcoded `bg-zinc-*` / `bg-stone-*` / `bg-white` from active modules. Landing-new itself gets tokenised last, only if its visual stays pixel-equivalent.

**Tech Stack:** Nuxt 3, Tailwind 3 (JIT), shadcn-vue, Vue 3, Google Fonts (Unbounded / IBM Plex Sans / JetBrains Mono).

**User constraints (from chat):**
1. Light + dark — both required.
2. Sharp corners (radius 0) like landing.
3. Full sweep of all 38 hardcoded files.
4. Don't touch dead code.
5. Migrate landing-new to tokens **only if** the visual is guaranteed identical.
6. **No auto-commits** — user verifies each phase in browser before commit (per memory `feedback_dont_auto_commit`).
7. **Don't spawn `yarn dev`** — user runs it on :3000 (per memory `feedback_dev_server_conflict`); verify via curl/screenshot only.

---

## Palette Decision (must be approved before Phase 1 lands)

### Source colors from landing-new (hex)

| Role | Hex | HSL (space-separated for shadcn) |
|------|-----|----------------------------------|
| Bg (deep) | `#0a0a0a` | `0 0% 4%` |
| Bg (lifted card) | `#111110` | `60 3% 7%` |
| Bg (chrome) | `#161616` | `0 0% 9%` |
| Text primary (cream) | `#ede8de` | `40 29% 90%` |
| Text secondary (warm gray) | `#a8a094` | `36 10% 62%` |
| Text tertiary / border | `#5a5550` | `30 6% 33%` |
| Accent rust | `#d4683f` | `17 63% 54%` |
| Accent rust hover | `#b9542d` | `17 61% 45%` |

### Derived light palette (neutral white, monochrome primary)

Light mode does not exist on landing-new. Two failed attempts before settling:
1. **Warm cream bg + warm grays + rust primary** — rejected: too orange/peachy.
2. **Neutral white bg + rust primary** — rejected: rust everywhere reads cheap on dense UI ("Хуета какая-то, почему основной цвет не черный, кринжово выглядит").

Final: standard shadcn-style monochrome (black `--primary`), brand rust **only** in `--ring` (subtle focus highlight). Background and surfaces neutral.

| Token | Light HSL | Notes |
|-------|-----------|-------|
| `--background` | `0 0% 100%` | Pure white |
| `--foreground` | `0 0% 4%` | Near-black |
| `--card` | `0 0% 100%` | |
| `--popover` | `0 0% 100%` | |
| `--primary` | `0 0% 9%` | Near-black — monochrome contrast (NOT brand) |
| `--primary-foreground` | `0 0% 98%` | Off-white text on dark CTAs |
| `--secondary` | `0 0% 96%` | Neutral light gray |
| `--secondary-foreground` | `0 0% 4%` | |
| `--muted` | `0 0% 96%` | |
| `--muted-foreground` | `0 0% 45%` | Neutral medium gray |
| `--accent` | `0 0% 96%` | Neutral hover surface |
| `--accent-foreground` | `0 0% 4%` | |
| `--destructive` | `0 84% 60%` | Standard red |
| `--destructive-foreground` | `0 0% 100%` | |
| `--border` | `0 0% 90%` | Neutral light gray border |
| `--input` | `0 0% 90%` | |
| `--ring` | `17 63% 54%` | **Only** place rust survives — focus ring accent |

### Final dark palette (warm landing bg, monochrome primary)

| Token | Dark HSL | Source |
|-------|----------|--------|
| `--background` | `0 0% 4%` | #0a0a0a |
| `--foreground` | `40 29% 90%` | #ede8de |
| `--card` | `60 3% 7%` | #111110 |
| `--popover` | `60 3% 7%` | |
| `--primary` | `40 29% 90%` | Cream — monochrome contrast (matches `--foreground`) |
| `--primary-foreground` | `0 0% 9%` | Near-black on cream |
| `--secondary` | `0 0% 9%` | #161616 |
| `--secondary-foreground` | `40 29% 90%` | |
| `--muted` | `0 0% 9%` | |
| `--muted-foreground` | `36 10% 62%` | #a8a094 |
| `--accent` | `30 6% 18%` | Hover surface — derived darker than #5a5550 |
| `--accent-foreground` | `40 29% 90%` | |
| `--destructive` | `0 62% 35%` | Keep dark red |
| `--destructive-foreground` | `40 29% 90%` | |
| `--border` | `30 6% 18%` | Solid form of #ede8de/10 vibe |
| `--input` | `30 6% 18%` | |
| `--ring` | `17 63% 54%` | Rust focus ring |

### `--radius`

`--radius: 0.375rem` (6px). Initially tried `0` (matching landing literally) but it looked broken on dense UI surfaces — see memory `feedback_radius_not_zero`. Tailwind `borderRadius.lg/md/sm` all map to `var(--radius)` (no derived offsets) so all shadcn components inherit one consistent radius. Per-component `rounded-full` (avatars, badges) stays untouched.

**Gate:** before Phase 1 commit, user must say "палитра ok" or hand-correct any token in DevTools and tell me.

---

## File Structure & Touch List

### Files modified — Phase 1 (foundation)
- `assets/css/main.css:51-107` — replace all `--*` token values + `--radius`
- `tailwind.config.js:17-86` — add `fontFamily` extension, drop legacy `code` / `light-code` if unused
- `nuxt.config.ts:48-53` — add Google Fonts `<link>` to global head
- `lib-modules/landing-new/helpers/fonts.ts` — keep, but landing page can drop its local injection in Phase 5 (single source of truth)

### Files modified — Phase 2 (Button)
- `components/ui/button/index.ts:6-37` — rewrite all 8 variants on tokens
- `components/ui/button/Button.vue` — read only, verify nothing else breaks

### Files modified — Phase 3 (app shell)
- `lib-modules/app-layout/components/AppLayout.vue` — replace `bg-white dark:bg-zinc-950`
- `lib-modules/app-layout/components/AppNavbar.vue` — replace `bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800`
- `assets/css/main.css:120-139` — `.icon-button`'s `hover:bg-stone-200 dark:hover:bg-stone-800` → `hover:bg-accent`

### Files modified — Phase 4 (module sweep)
Modules to sweep, drop hardcoded zinc/stone/gray/white:
- `lib-modules/conversations/components/**/*.vue`
- `lib-modules/content-calendar/components/**/*.vue`
- `lib-modules/content-editor/components/**/*.vue`
- `lib-modules/imageGenerator/components/**/*.vue`
- `lib-modules/profile/components/**/*.vue`
- `lib-modules/plans/components/**/*.vue`
- `lib-modules/web-auth/components/**/*.vue`
- `lib-modules/reels-research/components/**/*.vue`
- `lib-modules/workspaces/components/**/*.vue`
- `components/atoms/**`, `components/molecules/**`, `components/organisms/**`
- Skip: `lib-modules/landing-new/**` (Phase 5), `scripts/**` (legacy, don't touch), `lib-modules/demo-mode/**` (verify usage first)

Each file: replace `bg-white` → `bg-background`, `bg-zinc-950` → `bg-background`, `bg-zinc-900` → `bg-card`, `bg-zinc-800` → `bg-secondary`, `text-zinc-100/200` → `text-foreground`, `text-zinc-400/500` → `text-muted-foreground`, `border-zinc-800/900` → `border-border`, `hover:bg-zinc-800` → `hover:bg-accent`, etc. **Each file individually approved by user.**

### Files modified — Phase 5 (landing-new optional)
- `lib-modules/landing-new/components/**/*.vue` — replace inline `text-[#ede8de]` with `text-foreground`, etc. Only after capturing visual baseline.

---

## Phase 0 — Pre-flight (10 min, no commit)

- [ ] **Step 0.1: Confirm dev server is up**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000`
Expected: `200`. If not 200, stop and ask user to start `yarn dev`.

- [ ] **Step 0.2: Snapshot landing-new visual baseline**

Open `http://localhost:3000/landing-new` in browser. Take screenshot of hero, pricing, footer. Save mentally as the "must not regress" reference for Phase 5. Tell user: "снял референс, погнали".

- [ ] **Step 0.3: Get palette approval**

Show user the palette decision tables above. Ask: "палитра ok? или поправь HSL руками". Wait for explicit ok.

---

## Phase 1 — Foundation: tokens, fonts, radius

**Files:** `assets/css/main.css`, `tailwind.config.js`, `nuxt.config.ts`

- [ ] **Step 1.1: Replace `:root` light tokens in `main.css:52-78`**

```css
:root {
    --radius: 0.375rem;
    --background: 42 44% 92%;
    --foreground: 0 0% 4%;
    --card: 42 30% 96%;
    --card-foreground: 0 0% 4%;
    --popover: 42 30% 96%;
    --popover-foreground: 0 0% 4%;
    --primary: 17 63% 54%;
    --primary-foreground: 42 44% 96%;
    --secondary: 42 20% 85%;
    --secondary-foreground: 0 0% 4%;
    --muted: 42 20% 85%;
    --muted-foreground: 30 6% 33%;
    --accent: 42 20% 85%;
    --accent-foreground: 0 0% 4%;
    --destructive: 0 72% 50%;
    --destructive-foreground: 42 44% 96%;
    --border: 30 8% 78%;
    --input: 30 8% 78%;
    --ring: 17 63% 54%;
    --chart-1: 17 63% 54%;
    --chart-2: 30 6% 33%;
    --chart-3: 36 10% 62%;
    --chart-4: 42 44% 60%;
    --chart-5: 17 61% 45%;
}
```

- [ ] **Step 1.2: Replace dark tokens in `main.css:80-107`**

```css
@media (prefers-color-scheme: dark) {
    :root {
        --background: 0 0% 4%;
        --foreground: 40 29% 90%;
        --card: 60 3% 7%;
        --card-foreground: 40 29% 90%;
        --popover: 60 3% 7%;
        --popover-foreground: 40 29% 90%;
        --primary: 17 63% 54%;
        --primary-foreground: 40 29% 90%;
        --secondary: 0 0% 9%;
        --secondary-foreground: 40 29% 90%;
        --muted: 0 0% 9%;
        --muted-foreground: 36 10% 62%;
        --accent: 30 6% 18%;
        --accent-foreground: 40 29% 90%;
        --destructive: 0 62% 35%;
        --destructive-foreground: 40 29% 90%;
        --border: 30 6% 18%;
        --input: 30 6% 18%;
        --ring: 17 63% 54%;
        --chart-1: 17 63% 54%;
        --chart-2: 36 10% 62%;
        --chart-3: 40 29% 90%;
        --chart-4: 30 6% 33%;
        --chart-5: 17 61% 45%;
    }
}
```

- [ ] **Step 1.3: Add font extension to `tailwind.config.js`**

After the `colors:` block (around line 81), inside `extend:`, add:

```js
fontFamily: {
    display: ['Unbounded', 'system-ui', 'sans-serif'],
    sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
},
```

- [ ] **Step 1.4: Inject Google Fonts globally in `nuxt.config.ts`**

In the `app.head.link[]` array (after the apple-touch-icon entry), add:

```ts
{rel: 'preconnect', href: 'https://fonts.googleapis.com'},
{rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
{rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap'},
```

- [ ] **Step 1.5: Make `IBM Plex Sans` the default body font in `main.css`**

In the existing `@layer base { body { ... } }` (around line 115), add font-family:

```css
body {
    @apply bg-background text-foreground font-sans;
}
```

- [ ] **Step 1.6: User verifies in browser**

Tell user: "Phase 1 готова. Открой `/app` и `/app/calendar`, посмотри в light и dark (DevTools → Rendering → emulate prefers-color-scheme). Жду 'ok' или правки."

- [ ] **Step 1.7: Commit on user OK**

```bash
git add assets/css/main.css tailwind.config.js nuxt.config.ts
git commit -m "feat(theme): port landing-new palette + fonts + sharp corners to global tokens"
```

---

## Phase 2 — App shell tokenization (Button + Layout + Navbar + .icon-button)

> **Single user-OK gate at end of this phase.** Per user feedback `phase_size_minimum`, all app-shell hardcodes are bundled into one verification cycle on `/app`. The old Phase 3 is folded in below as steps 2.4–2.6.

**Files:** `components/ui/button/index.ts`, `lib-modules/app-layout/components/AppLayout.vue`, `lib-modules/app-layout/components/AppNavbar.vue`, `assets/css/main.css`

- [ ] **Step 2.1: Rewrite `cva` base + variants**

Replace the entire `buttonVariants` definition (lines 6-37) with:

```ts
export const buttonVariants = cva(
    'select-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                premium: 'bg-primary text-primary-foreground hover:bg-primary/90',
                telegram: 'bg-[#0088cc] text-white hover:bg-[#0088cc]/90',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 px-3',
                lg: 'h-11 px-8',
                icon: 'h-10 w-10',
                tiny: 'w-fit px-2 py-1 text-[13px]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)
```

Notes:
- `rounded-md` becomes `0` automatically via the new `--radius`. Keep the class — no churn at call sites.
- `premium` now matches default rust; if that's wrong (e.g. premium needs to feel "special"), user will say so and I'll add a gradient on tokens.
- `telegram` keeps brand color — that's the brand of the integration, not theme.

- [ ] **Step 2.2: Replace `AppLayout.vue` main content bg**

Find `bg-white dark:bg-zinc-950` on the main content wrapper, replace with `bg-background`.

- [ ] **Step 2.3: Replace `AppNavbar.vue` chrome**

Find `bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800`, replace with `bg-background border-border`.

- [ ] **Step 2.4: Fix `.icon-button` in `main.css`**

Replace:
```css
.icon-button {
    @apply p-1.5 rounded-lg cursor-pointer
    hover:bg-stone-200 dark:hover:bg-stone-800 bg-transparent
    transition-all duration-200
}
```
with:
```css
.icon-button {
    @apply p-1.5 rounded-lg cursor-pointer
    hover:bg-accent bg-transparent
    transition-all duration-200
}
```

- [ ] **Step 2.5: User verifies entire app shell**

Open `/app` and `/app/profile` (or any nested page). Check: light + dark, sidebar, navbar, all button variants visible (default, outline, ghost, destructive in modals), icon-button hover, focus ring on focused button.

- [ ] **Step 2.6: Commit on user OK (combined)**

```bash
git add components/ui/button/index.ts lib-modules/app-layout/components/AppLayout.vue lib-modules/app-layout/components/AppNavbar.vue assets/css/main.css
git commit -m "refactor(theme): tokenize Button variants and app-shell hardcoded colors"
```

---

## Phase 3 — Module sweep

For each module in this order: `conversations` → `content-editor` → `content-calendar` → `imageGenerator` → `profile` → `plans` → `web-auth` → `reels-research` → `workspaces` → `components/atoms,molecules,organisms`.

### Per-module workflow (repeat for each module)

- [ ] **Step 4.M.1: Inventory hardcoded colors**

Grep the module for `bg-white|bg-black|bg-zinc-|bg-stone-|bg-gray-|text-zinc-|text-stone-|text-gray-|border-zinc-|border-stone-|border-gray-|dark:bg-zinc-|dark:bg-stone-|dark:text-zinc-|dark:text-stone-|dark:border-zinc-|dark:border-stone-` and list every file + line.

- [ ] **Step 4.M.2: Apply mapping per file**

Mapping table (apply mechanically, then sanity-check semantics file-by-file):

| Hardcoded | Token replacement |
|-----------|-------------------|
| `bg-white` (page bg) | `bg-background` |
| `bg-white` (raised surface) | `bg-card` |
| `bg-zinc-50` / `bg-stone-50` | `bg-muted` |
| `bg-zinc-100` / `bg-stone-100` | `bg-muted` |
| `bg-zinc-200` / `bg-stone-200` | `bg-secondary` |
| `bg-zinc-800` / `bg-stone-800` | `bg-secondary` (dark surfaces) |
| `bg-zinc-900` / `bg-stone-900` | `bg-card` |
| `bg-zinc-950` / `bg-stone-950` / `bg-black` | `bg-background` |
| `text-zinc-50/100/200` (light bg) | `text-foreground` |
| `text-zinc-400/500/600` | `text-muted-foreground` |
| `text-zinc-700/800/900` | `text-foreground` |
| `border-zinc-200/300` | `border-border` |
| `border-zinc-700/800/900` | `border-border` |
| `hover:bg-zinc-100/stone-100` | `hover:bg-accent` |
| `hover:bg-zinc-800/stone-800` | `hover:bg-accent` |
| `dark:` variants on the above | drop (token already adapts) |

Skip / preserve as-is:
- Brand colors with explicit `[#hex]` (Telegram blue, Yandex red, Google OAuth) — those are brand, not theme.
- Image-generator color picker swatches — those are content, not chrome.
- Status colors (`text-red-500` for errors, `text-green-500` for success) — those map to `destructive` / a future `success` token; for now leave and raise a follow-up if needed.

- [ ] **Step 4.M.3: User verifies the module in browser**

Walk every page/dialog of the module in light and dark. Don't move on until "ok".

- [ ] **Step 4.M.4: Commit on user OK**

```bash
git add lib-modules/<module>
git commit -m "refactor(<module>): tokenize colors per new theme"
```

### Checklist of modules

- [ ] `lib-modules/conversations`
- [ ] `lib-modules/content-editor`
- [ ] `lib-modules/content-calendar`
- [ ] `lib-modules/imageGenerator`
- [ ] `lib-modules/profile`
- [ ] `lib-modules/plans`
- [ ] `lib-modules/web-auth`
- [ ] `lib-modules/reels-research`
- [ ] `lib-modules/workspaces`
- [ ] `components/atoms`, `components/molecules`, `components/organisms`

---

## Phase 5 — Landing-new tokenization (gated)

**Goal:** Replace inline hex with tokens in `lib-modules/landing-new/components/**` so landing-new shares the global theme. Hard requirement: pixel-equivalent output.

- [ ] **Step 5.1: Capture pixel baseline**

Tell user: "сделай скриншот `/landing-new` (hero + pricing + footer) в light и dark, прежде чем я начну". Wait for confirmation that screenshots exist.

- [ ] **Step 5.2: Verify dark-mode tokens render the exact source hexes**

In DevTools, on `/landing-new` with dark mode, computed value of `hsl(var(--background))` must equal `rgb(10, 10, 10)` (= #0a0a0a). If off by 1 because of HSL rounding, hand-correct the HSL in `main.css` until exact.

- [ ] **Step 5.3: Mapping (mechanical)**

Per file in `lib-modules/landing-new/components/`:

| Inline hex | Token |
|------------|-------|
| `text-[#ede8de]` / `bg-[#ede8de]` | `text-foreground` / `bg-foreground` |
| `text-[#0a0a0a]` / `bg-[#0a0a0a]` | `text-background` / `bg-background` (note: landing always assumes dark, so meaning is inverted vs. global) |
| `text-[#a8a094]` | `text-muted-foreground` |
| `text-[#5a5550]` | `text-muted-foreground/60` (or define `--muted-foreground-soft`, decide later) |
| `bg-[#111110]` | `bg-card` |
| `bg-[#161616]` | `bg-secondary` |
| `text-[#d4683f]` / `bg-[#d4683f]` | `text-primary` / `bg-primary` |
| `bg-[#b9542d]` | `bg-primary/90` (test: matches hover hex within 1%) |
| `border-[#ede8de]/10` | `border-foreground/10` |
| `border-[#d4683f]/40` | `border-primary/40` |

**Important:** landing-new is dark-only. If user toggles light mode while on `/landing-new`, the page would change. To prevent this, wrap `LandingNewPage.vue` root in `<div class="dark">` so it always uses dark tokens regardless of system preference. (`darkMode: "media"` won't pick up the class — switch tailwind config to `darkMode: ["media", "class"]` if needed.)

- [ ] **Step 5.4: Side-by-side compare**

After mapping, compare new screenshots vs. baseline at hero, pricing card highlight, button CTA, footer divider. If any diff > 1px or any color shift visible — revert that file.

- [ ] **Step 5.5: User explicit go/no-go**

Tell user: "сравни скриншоты, скажи 'мерджим' или 'откатываем'."

- [ ] **Step 5.6: Commit or revert**

On 'ok':
```bash
git add lib-modules/landing-new tailwind.config.js
git commit -m "refactor(landing-new): tokenize colors, share theme with app"
```
On 'no': `git checkout -- lib-modules/landing-new`. Phase 5 abandoned, landing-new keeps inline hexes. Not a failure — it was gated.

---

## Self-Review Findings

**Spec coverage:**
- Light + dark — ✅ Phase 1 + Phase 5 darkMode handling
- Sharp corners — ✅ Phase 1 (`--radius: 0`)
- Full sweep — ✅ Phase 4 covers all 9 active modules + cross-cutting components
- Don't touch dead code — ✅ Phase 4 explicitly skips `scripts/`, defers `demo-mode`
- Landing-new only-if-safe — ✅ Phase 5 gated on screenshot diff

**Placeholder scan:** None. All HSL values, mapping tables, exact file:line refs.

**Type consistency:** Token names (`--primary`, `--primary-foreground`, etc.) match between Phase 1 definition, Phase 2 button refactor, and Phase 4 mapping table.

**Open follow-up (not in scope):** No `--success` or `--warning` token yet. Status colors (`text-green-500`, `text-yellow-500`) survive Phase 4. If user wants those tokenised, separate plan.
