# Copilot Instructions for AI/DC Orchestrator Drift

## Project Overview

This is a React web application for AI/DC Orchestrator Drift management—a system designed to detect and remediate configuration drift across data center devices. The project is built from a Figma design and uses Vite as the build tool with Tailwind CSS for styling.

**Original design:** https://www.figma.com/design/KTrNSWTNly9sMiiKa9dSri/AI-DC-Orchestrator-Drift

## Build, Test, and Run Commands

### Development
```bash
npm run dev          # Start Vite development server (http://localhost:5173)
npm i                # Install dependencies
```

### Production
```bash
npm run build        # Build for production (output to `dist/`)
```

**Note:** No test or lint scripts currently exist in this project.

## Architecture

### High-Level Structure
- **Framework:** React 18.3.1 with React Router 7.13.0 for client-side routing
- **Build Tool:** Vite 6.3.5 with React and Tailwind CSS plugins
- **Styling:** Tailwind CSS 4.1.12 (configured as plugin) + Emotion for styled components
- **UI Components:** Radix UI primitives (accordion, dialog, select, etc.) + Material-UI for icons

### Directory Layout
```
src/
├── app/
│   ├── pages/              # Route components
│   │   ├── Dashboard.tsx   # Main landing page (index route)
│   │   ├── ComplianceStatus.tsx
│   │   ├── History.tsx
│   │   └── setup/          # Setup wizard pages
│   │       ├── Device.tsx
│   │       ├── ComplianceRules.tsx
│   │       ├── ComplianceRuleEdit.tsx
│   │       └── DriftRemediation.tsx
│   ├── components/
│   │   ├── Layout.tsx      # Main layout with sidebar navigation
│   │   ├── ui/             # Shadcn/Radix UI components (pre-built)
│   │   └── figma/          # Figma-specific components (e.g., ImageWithFallback)
│   ├── routes.tsx          # Route definitions
│   └── App.tsx             # Root app component
├── main.tsx                # Entry point
└── styles/
    └── index.css           # Global styles
```

### Routing
Routes are centralized in `src/app/routes.tsx`. All pages are wrapped in the `Layout` component, which provides:
- Top header with app title and user indicator
- Collapsible sidebar navigation with "Setup" submenu
- Mobile-responsive menu (hidden on mobile, shown via hamburger)
- Main content area via `<Outlet />`

**Navigation Structure:**
- `/` → Dashboard
- `/setup/device` → Device configuration
- `/setup/compliance-rules` → Compliance rules list
- `/setup/compliance-rules/:id` → Edit specific compliance rule
- `/setup/drift-remediation` → Remediation setup
- `/compliance-status` → Compliance status view
- `/history` → Historical data view

### Key Conventions

#### Component Organization
- **Page components** (in `pages/`) are route handlers—typically larger, page-level containers
- **UI components** (in `components/ui/`) are pre-built Radix UI wrappers with Tailwind styling (don't modify unless fixing bugs)
- **Layout component** manages navigation state and routing context for all pages

#### Tailwind + Emotion Usage
- **Tailwind:** Primary styling approach—use utility classes for layouts, spacing, colors, etc.
- **Emotion:** Used indirectly via MUI and styled component libraries; only use directly if needed for complex CSS-in-JS

#### Path Aliases
The `@` alias points to `src/` (configured in `vite.config.ts`). Use it for imports:
```tsx
import { Component } from '@/app/components/...';
```

#### Link Navigation
Use React Router's `<Link>` component (from "react-router") for all internal navigation, not `<a>` tags.

#### Asset Imports
SVG and CSV files can be imported directly as assets (configured in `vite.config.ts`):
```tsx
import logo from '@/assets/logo.svg';
```

#### Icon Library
- Use **Lucide React** (`lucide-react`) for general icons (used in Layout, Dashboard)
- Use **Material-UI Icons** (`@mui/icons-material`) for Material Design icons

## Important Notes

- **React and Tailwind plugins are required** in `vite.config.ts`—do not remove them even if not actively used
- The project uses **peer dependencies** for React/React-DOM (versions 18.3.1), allowing flexibility for consuming packages
- This is a component library export (`@figma/my-make-file`) but can also run as a standalone app
- Form handling is available via `react-hook-form`; chart rendering via `recharts`
- Drag-and-drop support is included (`react-dnd`); carousel/slider via `embla-carousel-react` and `react-slick`
