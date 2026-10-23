# Coordina Refactor Roadmap

## Goals

Improve maintainability, security, navigation performance, and responsive usability without unnecessarily redesigning the application.

## Planned work

- [x] Clean up obsolete Git branches
- [x] Project housekeeping and metadata
- [x] Dependency and security audit
- [x] Authentication redirect improvements
- [x] Authentication loading and pending states
- [ ] Navigation and route loading improvements
- [ ] Mobile sidebar and layout stability
- [ ] Mobile task views
- [ ] Calendar improvements
- [ ] Lightweight SEO improvements
- [ ] Final accessibility and performance review

## Development workflow

- Create a dedicated branch for each change.
- Keep pull requests focused and reviewable.
- Run relevant checks before merging.
- Merge into main only after review.

## Security audit notes

Audit date: 2026-10-22

- Updated Next.js, Auth.js, Hono, Mongoose, and related dependencies.
- Resolved all reported production dependency vulnerabilities.
- Five high-severity audit findings remain in the development-only
  ESLint dependency chain through `braces`.
- Avoid `npm audit fix --force`, which proposes an incompatible
  ESLint configuration downgrade.
- Recheck the remaining advisory during future dependency updates.
