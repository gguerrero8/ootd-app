# Workspace Rules

## Naming Conventions
- Folders: lowercase (e.g., `/client`, `/api`)
- Components: PascalCase (e.g., `OutfitCard.jsx`)
- Variables & functions: camelCase
- Commits: short and descriptive (e.g., `add upload feature`)

## Commit Message Guidelines
Use the pattern:  
`<verb> <short summary>`  
Examples:  
- `create base React structure`  
- `fix image upload path`

## Branching Strategy
- `main` — stable branch  
- `dev` — active development  
- feature branches: `feature/<short-name>`

## Pull Requests
- Each feature merged into `dev` after at least one teammate review.
- Confirm all tests run locally before merging.

## Coding Workflow
1. Pull latest from `main` or `dev`
2. Create new feature branch
3. Implement & test locally
4. Commit changes
5. Push and open PR
