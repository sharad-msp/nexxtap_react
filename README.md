# Admin Dashboard

A modern React admin dashboard built with TypeScript, Vite, and Tailwind CSS using a feature-based architecture.

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── Layout.tsx      # Main layout component
│   └── Sidebar.tsx     # Navigation sidebar
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard page
│   └── Login.tsx       # Login page
├── features/           # Feature-based modules
│   ├── users/          # Users feature
│   │   ├── components/ # User-specific components
│   │   ├── pages/      # User-specific pages
│   │   ├── store/      # User state management
│   │   ├── types/      # User type definitions
│   │   └── index.ts    # User feature exports
│   ├── stores/         # Stores feature
│   │   ├── components/ # Store-specific components
│   │   ├── pages/      # Store-specific pages
│   │   ├── store/      # Store state management
│   │   ├── types/      # Store type definitions
│   │   └── index.ts    # Store feature exports
│   ├── roles/          # Roles feature
│   │   ├── components/ # Role-specific components
│   │   ├── pages/      # Role-specific pages
│   │   ├── store/      # Role state management
│   │   ├── types/      # Role type definitions
│   │   └── index.ts    # Role feature exports
│   ├── products/       # Products feature
│   │   ├── components/ # Product-specific components
│   │   ├── pages/      # Product-specific pages
│   │   ├── store/      # Product state management
│   │   ├── types/      # Product type definitions
│   │   └── index.ts    # Product feature exports
│   ├── categories/     # Categories feature
│   │   ├── components/ # Category-specific components
│   │   ├── pages/      # Category-specific pages
│   │   ├── store/      # Category state management
│   │   ├── types/      # Category type definitions
│   │   └── index.ts    # Category feature exports
│   └── index.ts        # All features exports
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── store/              # Global state management
│   └── index.ts        # Admin store
├── types/              # Global TypeScript types
│   └── index.ts        # Main types
├── utils/              # Utility functions
│   └── index.ts        # Common utilities
├── lib/                # Third-party library configurations
│   ├── axios.ts        # Axios configuration
│   └── utils.ts        # Utility re-exports
├── config/             # Application configuration
│   └── index.ts        # App config
├── styles/             # Global styles
│   └── index.css       # Main CSS file
├── api/                # API service functions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## Feature-Based Architecture

This project follows a **feature-based architecture** where each feature is self-contained with its own:

- **Components**: UI components specific to the feature
- **Pages**: Page components for the feature
- **Store**: State management using Zustand
- **Types**: TypeScript type definitions
- **API**: API service functions (if needed)

### Feature Structure Example

```
features/users/
├── components/         # User-specific components
│   ├── UserForm.tsx
│   ├── UserTable.tsx
│   └── index.ts       # Component exports
├── pages/             # User-specific pages
│   ├── UserPage.tsx
│   ├── UserFormPage.tsx
│   └── index.ts       # Page exports
├── store/             # User state management
│   └── index.ts       # Zustand store
├── types/             # User type definitions
│   └── index.ts       # Type exports
└── index.ts           # Main feature exports
```

### Benefits of Feature-Based Architecture

- **🎯 Separation of Concerns**: Each feature is self-contained
- **📦 Scalability**: Easy to add new features without affecting others
- **🔄 Maintainability**: Changes to one feature don't impact others
- **👥 Team Collaboration**: Multiple developers can work on different features
- **🧪 Testing**: Features can be tested in isolation
- **📚 Code Organization**: Clear structure makes code easier to navigate

## Features

- **TypeScript**: Full type safety throughout the application
- **Feature-Based Architecture**: Modular, scalable code organization
- **Path Mapping**: Clean imports using `@/` aliases
- **State Management**: Zustand for simple state management
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS for styling
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT-based authentication
- **Responsive Design**: Mobile-first responsive design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Path Mapping

The project uses TypeScript path mapping for clean imports:

- `@/` - Points to `src/`
- `@/components/*` - Points to `src/components/*`
- `@/pages/*` - Points to `src/pages/*`
- `@/hooks/*` - Points to `src/hooks/*`
- `@/store/*` - Points to `src/store/*`
- `@/types/*` - Points to `src/types/*`
- `@/utils/*` - Points to `src/utils/*`
- `@/lib/*` - Points to `src/lib/*`
- `@/config/*` - Points to `src/config/*`
- `@/styles/*` - Points to `src/styles/*`
- `@/features/*` - Points to `src/features/*`
- `@/api/*` - Points to `src/api/*`

## Import Examples

```typescript
// Import from features
import { useUserStore, UserForm, UserPage } from '@/features/users';
import { useStoreData, StoreTable } from '@/features/stores';
import { useRoleStore, RoleForm } from '@/features/roles';

// Import from shared modules
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';
import { config } from '@/config';
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Adding New Features

To add a new feature:

1. Create a new directory in `src/features/`
2. Follow the standard feature structure:
   ```
   features/new-feature/
   ├── components/
   ├── pages/
   ├── store/
   ├── types/
   └── index.ts
   ```
3. Export the feature from `src/features/index.ts`
4. Use the feature in your components with clean imports

## Best Practices

- **Feature Isolation**: Keep features self-contained
- **Type Safety**: Define types for all data structures
- **Clean Imports**: Use path mapping for all imports
- **State Management**: Use Zustand for feature-specific state
- **Component Composition**: Build reusable components within features
- **API Organization**: Group API calls by feature

