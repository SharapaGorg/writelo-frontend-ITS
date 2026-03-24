# Landing Page Calendar Showcase Design

## Overview

Add an interactive content calendar showcase to the landing page, positioned right after the Hero section. The calendar will be fully functional with demo data, allowing visitors to explore the feature before signing up.

## Requirements

- **Placement**: New section after Hero, before features
- **Interactivity**: Full interactive (click days, see posts, navigate months, use filters)
- **Elements**: Complete ContentCalendarPage with all filters and sidebars
- **Visual framing**: Browser window mockup (macOS-style with colored dots and address bar)
- **Data**: Demo data from `demoData.ts` (already built into useContentCalendar)

## Design

### Component Structure

```
LandingPage.vue
├── LandingHero
├── LandingCalendarShowcase (NEW)
│   └── Browser mockup frame
│       └── ContentCalendarPage (showcaseMode=true)
├── LandingPromoVideo
├── LandingFeature (clients)
└── ...
```

### New Component: LandingCalendarShowcase.vue

Location: `components/landing/LandingCalendarShowcase.vue`

Structure:
- Section wrapper with padding and max-width
- Title and description text (localized)
- Browser mockup container:
  - Top bar with 3 dots (red, yellow, green) + address bar showing "writelo.app/ideas"
  - Content area containing ContentCalendarPage
- CTA button below

### Modified Component: ContentCalendarPage.vue

Add `showcaseMode` prop:
- When `false` (default): Uses `h-screen` as currently
- When `true`: Uses fixed height `h-[700px]` for landing embed

### Browser Mockup Design

```
┌─────────────────────────────────────────────────────────────┐
│ ● ● ●                    writelo.app/ideas                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [CalendarHeader - project selector]                        │
│  [Filters - networks, statuses]                             │
│  [Tags filter]                                              │
│  ┌─────────────────────────────────┬───────────────────┐   │
│  │                                 │                   │   │
│  │     Calendar Grid               │    Sidebar        │   │
│  │     + Day Detail Panel          │    (News/Post)    │   │
│  │                                 │                   │   │
│  └─────────────────────────────────┴───────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling

- Browser mockup: Dark theme (`bg-zinc-900`) to match calendar
- Top bar: `bg-zinc-800` with subtle border
- Dots: `bg-red-500`, `bg-yellow-500`, `bg-green-500`
- Address bar: Centered text in muted color
- Rounded corners on mockup container
- Subtle shadow for depth

### Localization

Add i18n keys:
- `landing.calendar.title`: Section title
- `landing.calendar.description`: Section description
- `landing.calendar.cta`: CTA button text

## Files to Modify

1. `components/landing/LandingCalendarShowcase.vue` - Create new component
2. `lib-modules/content-calendar/components/ContentCalendarPage.vue` - Add showcaseMode prop
3. `components/landing/LandingPage.vue` - Add showcase section after Hero
4. `locales/ru.json` - Add Russian translations
5. `locales/en.json` - Add English translations

## Technical Considerations

- The calendar uses demo data by default via `useContentCalendar()`
- Each instance of `useContentCalendar` creates its own reactive state, so landing page interactions won't affect the main app
- Fixed height with overflow handling prevents layout issues
- Browser mockup provides visual context and professionalism
