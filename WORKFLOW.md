<!-- managed:linked-repos -->
## Linked Repositories
- afort93/Roamly-App
<!-- /managed:linked-repos -->

# Roamly Team Workflow

## Repository Structure
`afort93/Roamly-App` is the single repository. The project uses a monorepo layout:
- `roamly-frontend/` — React/Vite web app
- `roamly-backend/` — Python FastAPI server

## Branch Strategy
- `main` — production-ready code, protected
- Feature branches: `feat/<short-description>` (e.g., `feat/stripe-integration`)
- Fix branches: `fix/<short-description>`

## Workflow Steps
1. Create a feature branch from `main`
2. Implement the feature locally in `/home/team/shared/roamly-frontend/` or `/home/team/shared/roamly-backend/`
3. Commit with clear messages
4. Push to GitHub and open a Pull Request to `main`
5. Request review from the lead
6. Lead reviews the PR and merges when approved

## Git Setup
- Frontend code lives in: `/home/team/shared/roamly-frontend/`
- Backend code lives in: `/home/team/shared/roamly-backend/`
- The repo root is shared — configure git remote accordingly.

## Code Quality
- Backend: Python type hints, error handling, FastAPI best practices
- Frontend: TypeScript strict mode, Tailwind CSS for styling, reuse existing components
- Test endpoints with `curl` or browser before submitting PRs
