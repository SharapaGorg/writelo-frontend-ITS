# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
# Start dev server with local backend (http://localhost:8000)
yarn dev

# Start dev server with remote backend
yarn devo

# Install dependencies
yarn install
```

### Production
```bash
# Build for production
yarn build

# Generate static files
yarn generate

# Preview production build
yarn preview
```

## Architecture Overview

### Component Organization (Atomic Design)
- **atoms/**: Basic UI components (buttons, inputs, spinners)
- **molecules/**: Composed components (messages, tiers)
- **organisms/**: Complex features (navbar, dialogs content blocks)
- **templates/**: Page sections (MessagesSection, SendMessageSection, SettingsSection)
- **ui/**: Shadcn-vue components

### State Management
The app uses singleton composables for state management:
- `useUserController()`: Authentication and user state
- `useSettings()`: Application settings and feature toggles
- `useEnv()`: Global environment state (current dialog, attached files, etc.)
- `eventBus`: Event-driven communication between components (mitt)

### API Communication
All API calls go through `scripts/shared/api/controller.ts`:
- Token-based authentication from Telegram Web App
- Streaming support for real-time message responses
- Typed request/response interfaces in `scripts/shared/types/`

### Key Technical Details
- **No SSR**: This is a client-side only application (`ssr: false`)
- **Telegram Integration**: Uses Telegram Web App SDK for authentication
- **Real-time Messaging**: Server-sent events for streaming AI responses
- **File Uploads**: Support for attachments with progress tracking
- **i18n**: Multi-language support (en/ru) via @nuxtjs/i18n

### Important Files
- `pages/conversations/[id].vue`: Main chat interface
- `scripts/shared/api/controller.ts`: API client
- `composables/`: Global state management
- `scripts/shared/types/`: TypeScript type definitions

### Development Notes
- The app heavily integrates with Telegram Web App, so testing requires Telegram environment
- API URL is configured via environment variables (see package.json scripts)
- File uploads include special handling for Telegram file references
- Message streaming uses custom SSE parsing logic