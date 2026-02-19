# Markdown Converter

A performant rich text to Markdown converter built on Angular 19's standalone component architecture. Combines Tiptap's extensible editor framework with Turndown conversion, delivering real-time Markdown output, flexible import/export options, and full WCAG 2.0 AA accessibility—all within a 726KB initial bundle.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-140%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-vitest-blue)
![Angular](https://img.shields.io/badge/Angular-19.2-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Demo

![Markdown Converter Demo](public/media/Richtext2markdown.gif)

## Key Features

- **Rich Text Editor** - Tiptap-powered WYSIWYG editor with formatting toolbar (bold, italic, headings, lists, code blocks, links)
- **Real-time Conversion** - Instant HTML to Markdown conversion using Turndown
- **Import Options** - Import from files (.md), URLs, or pre-built templates
- **Export Options** - Copy to clipboard or download as .md file
- **Dark Mode** - System-aware theme with manual toggle and localStorage persistence
- **Accessible** - WCAG 2.0 AA compliant with keyboard navigation and screen reader support
- **Responsive** - Mobile-first design that works on all screen sizes
- **Resilient** - Network retry logic with exponential backoff for URL imports

## Tech Stack

### Core

| Technology   | Version | Purpose                                             |
| ------------ | ------- | --------------------------------------------------- |
| Angular      | 19.2    | Frontend framework (standalone components, signals) |
| TypeScript   | 5.7     | Type-safe development                               |
| Tailwind CSS | 4.0     | Utility-first styling                               |
| RxJS         | 7.8     | Reactive programming                                |

### Editor & Conversion

| Technology | Purpose                                      |
| ---------- | -------------------------------------------- |
| Tiptap     | Headless WYSIWYG editor built on ProseMirror |
| Turndown   | HTML to Markdown conversion                  |
| Marked     | Markdown to HTML parsing (for imports)       |
| PrismJS    | Code syntax highlighting                     |

### Testing

| Technology | Purpose                            |
| ---------- | ---------------------------------- |
| Vitest     | Unit testing with Angular support  |
| Playwright | End-to-end testing across browsers |
| axe-core   | Automated accessibility testing    |

### Build & Quality

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| ESLint         | Code linting with Angular rules |
| Prettier       | Code formatting                 |
| Husky          | Git hooks for pre-commit checks |
| GitHub Actions | CI/CD pipelines                 |

## Architecture

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                    # Main layout component
│   │   ├── richtext/              # Tiptap editor wrapper
│   │   ├── markdown-preview/      # Conversion output display
│   │   ├── import-modal/          # File/URL/template import
│   │   ├── alert/                 # Toast notifications
│   │   ├── alert-container/       # Alert management
│   │   ├── accordion/             # Collapsible sections
│   │   ├── helpsection/           # FAQ component
│   │   └── guide/                 # Usage guide
│   │
│   ├── services/
│   │   ├── editor.service.ts      # Core editor logic & conversion
│   │   ├── theme.service.ts       # Dark mode management
│   │   ├── alert.service.ts       # Notification system
│   │   ├── analytics.service.ts   # Privacy-friendly tracking
│   │   ├── component-state.service.ts
│   │   └── error-handler.service.ts
│   │
│   └── utils/
│       └── retry.ts               # Network retry with backoff
│
├── libs/ui/                       # Shared UI components (spartan-ng)
└── e2e/                           # Playwright test suites
```

### Design Patterns

- **Signals** - Angular's reactive primitive for state management
- **Standalone Components** - Modern Angular architecture without NgModules
- **Lazy Loading** - Editor extensions and libraries loaded on demand
- **Service Injection** - Dependency injection for testability
- **Error Boundaries** - Global error handler with user-friendly messages

## Getting Started

### Prerequisites

- Node.js 18, 20, or 22
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd markdown-converter

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Available Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm start`             | Start development server |
| `npm run build`         | Production build         |
| `npm run test`          | Run unit tests           |
| `npm run test:watch`    | Run tests in watch mode  |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:e2e`      | Run Playwright E2E tests |
| `npm run test:e2e:ui`   | Run E2E tests with UI    |
| `npm run lint`          | Lint codebase            |

## Testing

### Unit Tests (Vitest)

140 tests across 17 test files covering:

- Services (editor, theme, alert, analytics, error handling)
- Components (all UI components)
- Utilities (retry logic)

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### E2E Tests (Playwright)

Comprehensive browser testing across:

- **Browsers**: Chromium, Firefox, WebKit, Edge
- **Devices**: Desktop, Pixel 5, iPhone 12

Test suites:

- `markdown-conversion.e2e.ts` - Core conversion functionality
- `import-export.e2e.ts` - File/URL import, clipboard/download export
- `theme-and-ui.e2e.ts` - Dark mode, responsive design, keyboard shortcuts
- `accessibility.e2e.ts` - WCAG 2.0 AA compliance

```bash
npm run test:e2e          # Headless
npm run test:e2e:headed   # With browser UI
npm run test:e2e:ui       # Interactive mode
```

## Code Quality

### Linting & Formatting

```bash
npm run lint              # ESLint check
```

Pre-commit hooks (via Husky) automatically:

- Format code with Prettier
- Run ESLint fixes

### Bundle Analysis

Production build stats:

- **Initial bundle**: ~726 KB (under 800 KB budget)
- **Lazy chunks**: Editor extensions loaded on demand

## Deployment

### Netlify (Configured)

```toml
# netlify.toml
[build]
  command = "ng build"
  publish = "dist/markdown_converter/browser"
```

### Manual Deployment

```bash
npm run build
# Deploy contents of dist/markdown_converter/browser/
```

## Project Structure

```
markdown-converter/
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml            # Lint, test, build
│   ├── e2e.yml           # E2E tests
│   └── dependency-review.yml
├── e2e/                   # Playwright tests
├── libs/ui/               # Shared UI components
├── public/                # Static assets
├── src/
│   ├── app/              # Application code
│   ├── index.html        # Entry HTML
│   ├── main.ts           # Bootstrap
│   └── styles.css        # Global styles
├── angular.json          # Angular CLI config
├── playwright.config.ts  # E2E config
├── vitest.config.ts      # Unit test config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies & scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow Angular style guide
- Use TypeScript strict mode
- Write tests for new features
- Ensure WCAG 2.0 AA accessibility compliance

### Comment Policy

- Comments must explain intent, tradeoffs, or constraints, not restate the code.
- Keep comments when behavior is non-obvious (cross-browser quirks, framework limitations, polyfills, lint exceptions).
- Avoid placeholder debt markers (`TODO`, `FIXME`, `XXX`) in committed code; lint blocks these terms.
- Add JSDoc for exported APIs that are consumed outside the file/module. Skip JSDoc for obvious private/internal methods.

## Performance

| Metric                 | Value  |
| ---------------------- | ------ |
| Initial Bundle         | 726 KB |
| Lighthouse Performance | 90+    |
| First Contentful Paint | < 1.5s |
| Time to Interactive    | < 2s   |

## Browser Support

| Browser | Version         |
| ------- | --------------- |
| Chrome  | Last 2 versions |
| Firefox | Last 2 versions |
| Safari  | Last 2 versions |
| Edge    | Last 2 versions |

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with Angular 19, Tiptap, and Tailwind CSS.
