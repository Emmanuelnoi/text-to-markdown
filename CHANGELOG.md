# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Added

- **Global Error Handler** - Centralized error handling with user-friendly messages

  - Intelligent error message mapping for common error types
  - Integration with AlertService for user notifications
  - Support for network, storage, file, permission, and timeout errors
  - 13 comprehensive tests
  - Ready for error tracking service integration (Sentry)

- **Analytics Integration (Plausible)** - Privacy-friendly analytics tracking

  - AnalyticsService with SSR support
  - Localhost detection (silent in development, active in production)
  - Event tracking for exports, imports, templates, and theme changes
  - No cookies, GDPR compliant
  - 16 comprehensive tests
  - Events tracked:
    - Export (format: markdown, method: copy/download)
    - Import (method: file/url, fileType)
    - Template Used (template: readme/blog/meeting/docs)
    - Theme Changed (theme: dark/light)

- **GitHub Actions CI/CD Pipeline** - Automated testing and deployment

  - CI Workflow (`ci.yml`)
    - Runs on every push/PR to main and develop branches
    - Automated ESLint linting
    - Automated testing (122 tests with code coverage)
    - Production build verification
    - Bundle size reporting
    - PR comments with bundle size
    - Build artifact uploads (7-day retention)
    - Codecov integration for coverage reports
  - Dependency Review Workflow (`dependency-review.yml`)
    - Security scanning on PRs
    - Fails on high-severity vulnerabilities
    - Automated security summary comments
  - Dependabot Configuration (`dependabot.yml`)
    - Weekly npm dependency updates (Mondays at 9 AM)
    - Monthly GitHub Actions updates
    - Grouped minor/patch updates
    - Max 5 PRs for npm, 3 for GitHub Actions
    - Auto-labeling (dependencies, automated, github-actions)

- **Documentation**
  - `CHANGELOG.md` - This file

### Changed

- **Updated `src/index.html`**

  - Added Plausible Analytics script (disabled on localhost)
  - Added `mobile-web-app-capable` meta tag (fixes deprecation warning)
  - Disabled PWA manifest link (temporary, until icons are created)
  - Improved mobile web app meta tags

- **Enhanced Services with Analytics**

  - `EditorService` - Tracks export and import events
  - `ImportModalComponent` - Tracks template usage
  - `ThemeService` - Tracks theme changes

- **Updated GitHub Actions Workflows**
  - Fixed build output paths (`markdown_converter` vs `markdown-converter`)
  - Using latest action versions (v4 for checkout, setup-node, etc.)
  - Node.js version: 22 (latest LTS)

### Fixed

- **Console Errors**

  - Fixed Plausible "Ignoring Event: localhost" spam
  - Fixed deprecated Apple `mobile-web-app-capable` warning
  - Fixed missing PWA icon 404 errors
  - Clean console in development environment

- **Analytics Behavior**

  - Silent operation on localhost (no console logs)
  - Proper hostname detection (localhost, 127.0.0.1)
  - No tracking in development mode
  - Graceful degradation when Plausible script unavailable

- **Build Paths**
  - Corrected CI workflow build path to `dist/markdown_converter/browser`
  - Aligned with Angular project configuration

### Tests

- **Added 29 new tests** (109 → 122 total)
  - GlobalErrorHandler: 13 tests
  - AnalyticsService: 16 tests
- **All 122 tests passing** ✅
- **Test coverage maintained** at 84%

### Security

- **Zero vulnerabilities** in dependencies
- **Automated security scanning** via Dependency Review workflow
- **Privacy-friendly analytics** (no cookies, GDPR compliant)

---

## [1.0.0] - 2025-04-01

### Added

- Initial release with full markdown converter functionality
- Rich text editor with TipTap
- Markdown import/export features
- Dark mode support
- Import modal with drag & drop, URL import, and templates
- Local storage auto-save
- Side-by-side preview mode
- Multiple export formats (markdown, HTML, PDF, copy)

### Features

- **Editor**

  - Rich text to Markdown conversion
  - Real-time preview
  - Support for headings, lists, bold, italic, code blocks
  - Link insertion
  - Code syntax highlighting

- **Import/Export**

  - Import from .md files
  - Import from URLs
  - Template library (README, blog, meeting notes, documentation)
  - Export to Markdown, HTML, PDF
  - Copy to clipboard

- **UI/UX**

  - Dark mode with automatic system detection
  - Responsive design
  - Alert system for user feedback
  - Auto-save to localStorage

- **Technical**
  - Angular 19.2 with SSR
  - TipTap editor with lazy loading
  - Tailwind CSS v4
  - TypeScript strict mode
  - 96 tests with 84% coverage

---

## Release Notes Template

Use this template for future releases:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features

### Changed

- Changes in existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security fixes
```

---

## Semantic Versioning Guide

- **MAJOR (X.0.0)** - Incompatible API changes
- **MINOR (0.X.0)** - Add functionality (backwards compatible)
- **PATCH (0.0.X)** - Bug fixes (backwards compatible)

---

**Note:** This project follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).
