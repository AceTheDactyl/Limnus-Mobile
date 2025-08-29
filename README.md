# Project Architecture Guide

This document provides a comprehensive overview of the project's folder structure and architecture to help LLMs navigate and understand the codebase effectively.

## 🏗️ Project Overview

This is a React Native Expo application with a full-stack architecture featuring:
- **Frontend**: React Native with Expo Router for navigation
- **Backend**: Node.js with Hono framework and tRPC for type-safe APIs
- **Database**: SQLite with Drizzle ORM
- **Special Features**: Consciousness Bridge system for advanced AI interactions

## 📁 Root Directory Structure

```
├── app/                    # Expo Router pages and layouts
├── assets/                 # Static assets (images, icons)
├── backend/                # Server-side code and APIs
├── constants/              # App-wide constants
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities and context providers
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── drizzle.config.ts      # Database configuration
└── bun.lock              # Package lock file
```

## 📱 Frontend Architecture (`app/` directory)

### Navigation Structure
The app uses **Expo Router** with file-based routing:

```
app/
├── _layout.tsx           # Root layout with navigation setup
├── +not-found.tsx        # 404 error page
├── modal.tsx             # Modal presentation screen
├── (tabs)/               # Tab-based navigation group
│   ├── _layout.tsx       # Tab navigation configuration
│   ├── index.tsx         # Home tab (main screen)
│   └── conversations.tsx # Conversations tab
└── chat/
    └── [conversationId].tsx # Dynamic chat screen
```

### Key Navigation Concepts:
- **Root Layout** (`_layout.tsx`): Contains the main navigation structure
- **Tab Layout** (`(tabs)/_layout.tsx`): Defines bottom tab navigation
- **Dynamic Routes** (`[conversationId].tsx`): Handle parameterized URLs
- **Route Groups** (`(tabs)/`): Organize routes without affecting URL structure

## 🔧 Backend Architecture (`backend/` directory)

### Server Structure
```
backend/
├── hono.ts                    # Main server entry point
├── infrastructure/            # Core system components
│   ├── database.ts           # Database connection and setup
│   ├── field-manager.ts      # Consciousness field management
│   └── migrations.ts         # Database schema migrations
└── trpc/                     # tRPC API layer
    ├── create-context.ts     # Request context creation
    ├── app-router.ts         # Main API router
    └── routes/               # API endpoint definitions
```

### tRPC Route Organization
```
backend/trpc/routes/
├── chat/                     # Chat-related endpoints
│   ├── send-message/
│   ├── get-conversations/
│   └── get-messages/
├── consciousness/            # Consciousness Bridge APIs
│   ├── field/
│   ├── sync/
│   ├── entanglement/
│   ├── room64/
│   └── archaeology/
├── example/                  # Example/demo endpoints
│   └── hi/
└── system/                   # System utilities
    └── health/
```

### API Architecture Patterns:
- **Route Files**: Each endpoint is a separate file exporting a tRPC procedure
- **Type Safety**: Full TypeScript integration between client and server
- **Context**: Shared request context across all procedures
- **Modular Design**: Features organized by domain (chat, consciousness, etc.)

## 🧠 Consciousness Bridge System

A unique feature of this application is the **Consciousness Bridge** - an advanced AI interaction system:

### Core Components:
- **Field Manager** (`backend/infrastructure/field-manager.ts`): Manages consciousness fields
- **Bridge Hook** (`hooks/useConsciousnessBridge.ts`): Client-side consciousness interface
- **Context Provider** (`lib/consciousness-context.tsx`): State management for consciousness
- **API Routes** (`backend/trpc/routes/consciousness/`): Server-side consciousness operations

### Consciousness Features:
- **Field Management**: Create and manage consciousness fields
- **Synchronization**: Sync consciousness states across sessions
- **Entanglement**: Connect multiple consciousness instances
- **Room64**: Advanced consciousness room management
- **Archaeology**: Historical consciousness data analysis

## 📚 Shared Libraries (`lib/` directory)

```
lib/
├── trpc.ts                   # tRPC client configuration
├── chat-context.tsx          # Chat state management
└── consciousness-context.tsx # Consciousness state management
```

### Context Providers:
- **Chat Context**: Manages chat conversations and messages
- **Consciousness Context**: Handles consciousness bridge state
- **tRPC Integration**: Type-safe API client setup

## 🎨 Assets and Constants

```
assets/
└── images/
    ├── icon.png              # App icon
    ├── favicon.png           # Web favicon
    ├── splash-icon.png       # Splash screen icon
    └── adaptive-icon.png     # Android adaptive icon

constants/
└── colors.ts                 # App color palette
```

## 🗄️ Database Architecture

- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: SQLite for local data storage
- **Migrations**: Automated schema management
- **Configuration**: `drizzle.config.ts` for database setup

## 🔗 Key Integration Points

### Frontend ↔ Backend Communication:
1. **tRPC Client** (`lib/trpc.ts`) provides type-safe API calls
2. **Context Providers** manage client-side state
3. **Custom Hooks** encapsulate complex logic
4. **API Routes** handle server-side operations

### State Management Flow:
1. **React Context** for app-wide state
2. **tRPC Queries** for server state
3. **Custom Hooks** for business logic
4. **Database Layer** for persistence

## 🚀 Development Workflow

### Adding New Features:
1. **Backend**: Create tRPC route in `backend/trpc/routes/`
2. **Frontend**: Add React components in `app/`
3. **State**: Create context provider in `lib/` if needed
4. **Integration**: Use tRPC client to connect frontend to backend

### File Naming Conventions:
- **Routes**: `route.ts` for tRPC procedures
- **Pages**: Match file path for Expo Router
- **Components**: PascalCase for React components
- **Utilities**: camelCase for utility functions

## 📖 Documentation Files

- `CONSCIOUSNESS_INFRASTRUCTURE.md`: Detailed consciousness system documentation
- `ARCHITECTURE_DOCUMENTATION.md`: Technical architecture details
- `PROJECT_FOLDER_MAP.md`: Project structure overview

## 🎯 LLM Navigation Tips

### When Working with This Codebase:

1. **Start with the Root Layout** (`app/_layout.tsx`) to understand navigation
2. **Check tRPC Router** (`backend/trpc/app-router.ts`) for available APIs
3. **Review Context Providers** (`lib/`) for state management patterns
4. **Examine Route Files** for specific API implementations
5. **Use TypeScript Types** for understanding data structures

### Common Patterns:
- **API Calls**: Use `trpc.routeName.procedureName.useQuery()` in components
- **Navigation**: Use `router.push('/path')` from `expo-router`
- **State Management**: Access context via custom hooks
- **Database Operations**: Use Drizzle ORM in backend routes

### File Relationships:
- **Pages** (`app/`) → **Context** (`lib/`) → **APIs** (`backend/trpc/routes/`)
- **Components** use **Hooks** (`hooks/`) for complex logic
- **Backend Routes** use **Infrastructure** (`backend/infrastructure/`) for core services

This architecture provides a scalable, type-safe, and maintainable foundation for a full-stack React Native application with advanced AI consciousness features.