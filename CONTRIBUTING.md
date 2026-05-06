# Contributing

This repository uses a simple Git branching and commit strategy to keep history clean and CI stable.

Branching

- `main` — protected, always green; PRs required to merge.
- `develop` — optional integration branch for ongoing work.
- Feature branches: `feat/<short-desc>`
- Chore branches: `chore/<short-desc>`
- Fix branches: `fix/<short-desc>`

Commit messages

- Use conventional commit-style messages for clarity:
  - `feat(scope): short description` for new features
  - `fix(scope): short description` for bug fixes
  - `chore(scope): short description` for maintenance
  - `docs: short description` for doc changes

Pull Requests

- Open PRs against `main` (or `develop` if used).
- Each PR should contain a clear description and link to any issue.
- Keep PRs focused and small — one logical change per PR.

CI

- GitHub Actions runs lint and build on push and pull_request against `main`.

If you need help with an interactive rebase or cleaning commits, ask and I can prepare an example sequence.
