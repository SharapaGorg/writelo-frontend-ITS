# SMM Platform UX Redesign

**Date:** 2026-03-27
**Status:** Approved

## Problem Statement

Current product is built as an "AI aggregator" with chat as the central hub. This doesn't fit SMM/content-making workflows where users think in terms of:
1. Research trends
2. Plan content
3. Create content
4. Publish

The chat-centric model confuses users and makes it hard to add new features.

## Target Users

- SMM specialists / agencies
- Content makers / reels creators
- In-house brand marketers
- B2B scenarios planned

All essentially do the same thing: manage brands across social networks.

## Design Decisions

### Core Principle
**Brand/Project is the center**, not chat. Users manage content for brands.

### Platform
- Desktop only (mobile not needed)

### Hierarchy
```
User
└── Brands (projects)
    └── Social Accounts (IG, TG, VK, YouTube - multiple per network possible)
        └── Content (posts, stories, reels, carousels)
```

---

## Navigation Structure

### Layout
```
┌──────┬───────────────────────────────────────────────────────────┐
│ [≡]  │  [Brand ▾]                       [Subscription] [Profile] │
├──────┼───────────────────────────────────────────────────────────┤
│      │                                                           │
│ 📅   │                                                           │
│      │              PAGE CONTENT                                 │
│ ✏️   │                                                           │
│      │                                                           │
│ 📊   │                                                           │
│      │                                                           │
├──────┤                                                           │
│ ⚙️   │                                                           │
└──────┴───────────────────────────────────────────────────────────┘
```

### Sidebar Sections
| Icon | Section | Description |
|------|---------|-------------|
| 📅 | Calendar | Main screen. Content planning. |
| ✏️ | Content Editor | Create/edit posts with AI assistance |
| 📊 | Trends | Instagram Reels research |
| ⚙️ | Settings | Profile, subscription, social accounts |

### Header
- Brand switcher (always visible)
- Subscription status
- User profile

---

## Section 1: Calendar (Main Screen)

**Already implemented.** Only change needed:

### Change Required
- **Current:** Filter by social network (IG, TG, VK...)
- **New:** Filter by social **account** (Brand can have 2 YouTube accounts, etc.)

### Existing Features (keep as-is)
- Month/week view
- Post status indicators (colors = post type, icons = status)
- News sidebar with Twitter trends
- Drag-drop from news to calendar
- Click on post → opens editor

---

## Section 2: Content Editor

Full-page navigation from calendar. Dual-panel layout.

### Layout
```
┌─────────────────────────────┬──────────────────────────────┐
│  [← Calendar]  New Post     │  Preview: [IG ▾] [Post ▾]   │
├─────────────────────────────┼──────────────────────────────┤
│                             │                              │
│   LEFT PANEL                │   RIGHT PANEL                │
│   ──────────                │   ───────────                │
│   [💬 Chat] [🖼 Images]     │                              │
│                             │   Post preview with          │
│   Chat with AI              │   image, description,        │
│   OR                        │   hashtags, date             │
│   Image generation          │                              │
│   (switchable)              │   [Save Draft]               │
│                             │   [Ready to Publish]         │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

### Left Panel Modes

**Chat Mode:**
- Standard AI chat
- Context: current brand + content type
- Helps with text, ideas, hashtags

**Images Mode:**
- Image generation with multi-input
- Up to 14 reference images
- UI: stacked cards (like iOS app switcher)
- Result can be added directly to post

### Right Panel: Content Types

**Post:**
- Single image
- Description (textarea)
- Hashtags
- Publish date

**Stories:**
- Vertical image (9:16)
- Optional text overlay

**Carousel:**
- Multiple images (up to 10)
- Description, hashtags

**Reels (see Section 3):**
- Script with timeline

---

## Section 3: Reels Script Editor

When content type is "Reels", right panel shows script editor.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Preview: [IG ▾] [Reels ▾]                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PREVIEW (if generated)                                          │
│  ┌────────────────────────────────────┐                          │
│  │   (generated frame preview         │                          │
│  │    or placeholder)                 │                          │
│  └────────────────────────────────────┘                          │
│  [✨ Generate Frame Preview]                                     │
│                                                                  │
│  TIMELINE (each tick = 1 second)                                 │
│  ════════════════════════════════════════════════════════        │
│  │0│1│2│3│4│5│6│7│8│9│10│11│12│13│14│15│...                      │
│   ▼ ▼   ▼     ▼           ▼                                      │
│   ● ●   ●     ●           ●  ← frames with content               │
│       ▲                                                          │
│       └── current position (second 2)                            │
│                                                                  │
│  ──────────────────────────────────────────────────────          │
│                                                                  │
│  SECOND 2                                                        │
│  ─────────                                                       │
│  Visual: ┌──────────────┐                                        │
│          │   ?          │  [🖼 Upload] [✨ Generate]             │
│          │   (empty)    │                                        │
│          └──────────────┘                                        │
│                                                                  │
│  Description: [Close-up of product_____________________]         │
│  Text/VO:     [Look at this color!_____________________]         │
│                                                                  │
│  ──────────────────────────────────────────────────────          │
│  Total Duration: [30 sec ▾]                                      │
│  Reel Description: [___________________________]                 │
│  Hashtags: [___________________________]                         │
│                                                                  │
│  [Save Draft] [Ready to Publish]                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Timeline Logic
- Timeline divided into seconds: 0, 1, 2, 3... up to total duration
- Each second can have a frame (with content) or be empty
- Scrubbing the timeline shows frame details for current second

### Frame Details (always visible)
- **Description:** Action/scene description
- **Text/Voiceover:** What to say or show as text
- **Visual (optional):**
  - Upload image
  - Or generate via image generator

### Total Duration
- Can be changed (adds/removes seconds from timeline)

---

## Section 4: Trends (Instagram Reels Research)

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Instagram Reels    [Search: _____________] [Category ▾]         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │         │  │         │  │         │  │         │             │
│  │  Reel   │  │  Reel   │  │  Reel   │  │  Reel   │             │
│  │         │  │         │  │         │  │         │             │
│  │ 1.2M ▶  │  │ 890K ▶  │  │ 650K ▶  │  │ 420K ▶  │             │
│  │ @author │  │ @author │  │ @author │  │ @author │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│                                                                  │
│  (grid with reels, infinite scroll)                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Features
- **Currently:** Instagram only (more platforms later)
- Search by topic/hashtag
- Category filter
- Infinite scroll grid

### Reel Card Actions
- Click → Details (description, hashtags, stats)
- "Create Similar" → Opens editor with pre-filled idea
- "Add to Calendar" → Creates post on selected date

### Note
News and Twitter trends stay inside Calendar (as currently implemented), not in this section.

---

## Section 5: Image Generation (Multi-Input)

Part of Content Editor's left panel.

### Layout
```
┌─────────────────────────────────────┐
│  [💬 Chat] [🖼 Images●]             │
├─────────────────────────────────────┤
│                                     │
│  REFERENCES (stacked cards)         │
│  ─────────────────────────          │
│  ┌─────────────────────────┐        │
│  │  ┌───────────────────┐  │        │
│  │  │  ┌─────────────┐  │  │        │
│  │  │  │             │  │  │  ←stack│
│  │  │  │   Photo 3   │  │  │        │
│  │  │  │             │  │  │        │
│  │  │  └─────────────┘  │  │        │
│  │  │     Photo 2       │  │        │
│  │  └───────────────────┘  │        │
│  │       Photo 1           │        │
│  └─────────────────────────┘        │
│                                     │
│  [+ Add Photo] (up to 14)           │
│  Added: 3/14                        │
│                                     │
│  ───────────────────────────        │
│  Prompt:                            │
│  [Generate banner with these       │
│   products on white background___] │
│                                     │
│  Aspect Ratio: [1:1 ▾]              │
│                                     │
│  [✨ Generate]                      │
│                                     │
│  ───────────────────────────        │
│  RESULT                             │
│  ┌─────────────────────────┐        │
│  │                         │        │
│  │   Generated image       │        │
│  │                         │        │
│  └─────────────────────────┘        │
│  [📋 Copy] [💾 Download]            │
│  [→ Add to Post]                    │
└─────────────────────────────────────┘
```

### Stacked Cards UI (iOS App Switcher Style)
- Cards overlap each other
- Swipe/click to view each
- X button to remove
- [+] to add new
- Limit: 14 images

### Use Case
Primary use: Adding brand products to generated images (e.g., 5 product line items combined into one promotional image).

### Result Actions
- Copy to clipboard
- Download
- "Add to Post" → Adds to current post in right panel

---

## What Changes

| Current | New |
|---------|-----|
| Top navbar navigation | Left sidebar with icons |
| Chat as main screen | Calendar as main screen |
| Chat as separate page | Chat as part of Content Editor |
| Image gen as separate page | Image gen as part of Content Editor |
| Social network filters | Social account filters |
| — | Reels script editor with timeline |
| — | Multi-input image generation (up to 14) |

## What Stays

- Calendar (with account filter change)
- News/Twitter trends in calendar sidebar
- Instagram Reels research (existing page, minor updates)
- Basic image generation flow (enhanced with multi-input)

---

## Implementation Notes

### New Modules Needed
- `lib-modules/content-editor/` — New editor with dual-panel layout
- `lib-modules/reels-script/` — Script timeline component
- `lib-modules/image-stack/` — Stacked cards UI for multi-input

### Modified Modules
- `lib-modules/content-calendar/` — Account filter instead of network filter
- `lib-modules/imageGenerator/` — Support for multiple input images

### Routes
- `/app/calendar` — Calendar (main)
- `/app/editor/:postId?` — Content Editor
- `/app/trends` — Instagram Reels Research
- `/app/settings` — Settings

### Layout
- New layout with left sidebar (replace current top navbar)
- Sidebar collapsible (icons only ↔ icons + text)
