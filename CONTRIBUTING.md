# Contributing

## Branching Strategy
- Create a new branch from `main` for each feature or fix.
- Use descriptive names such as `feature/short-description` or `fix/issue-id`.
- Keep commits small, focused, and well-described.

## Coding Style
- Use TypeScript and follow the existing file structure (hooks, context providers, and `types/`).
- Prefer functional React components and hooks over classes.
- Maintain 2-space indentation and run `npm run ts:check` before committing.
- Keep storage keys user-scoped as shown in existing agents.
- Update documentation and type definitions when introducing new functionality.

## Pull Requests
- Ensure `npm run ts:check` completes without errors.
- Provide a clear summary of changes and reference related issues.
- Include tests or screenshots when relevant.
- Request review from maintainers and address feedback promptly.
