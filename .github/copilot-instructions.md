<!--
Rules for AI coding agents working on the `website-crocco` repository.
Purpose: give an immediately actionable set of checks and behaviors so an AI agent
can be productive even when repository contents are sparse or unknown.
-->

# Copilot / AI agent instructions — website-crocco

Summary
- This repository currently contains only Git metadata and `.gitattributes`.
- Treat the project as an empty website project by default. Probe for common
  web and backend indicators (files named below). Ask the human if the
  assumption is wrong before making large changes.

Quick rules (do these first)
- Look for project type markers in repo root: `package.json`, `pyproject.toml`,
  `requirements.txt`, `pom.xml`, `README.md`, `src/`, `public/`, `index.html`.
- If none exist, create minimal scaffolding only after confirming with the user.
- Prefer small, self-contained PRs (one feature/fix per PR) and include tests
  or a smoke-run where applicable.

How to detect and act (examples)
- Node/JavaScript: if `package.json` is present, prefer running `npm ci` then
  `npm run build` / `npm start` depending on scripts. Look for `scripts.build`.
- Static/frontend: if `index.html` or `public/` exists, treat it as a static site
  and avoid adding heavy server-side code unless requested.
- Python: if `pyproject.toml` or `requirements.txt` exists, use venv and run
  `python -m pip install -r requirements.txt` and `pytest` if tests are present.

Project-specific notes
- Repo name is `website-crocco` and default branch is `main` (use `main` for PR base).
- There is a top-level `.gitattributes` — respect any binary/line-ending settings.

Code and commit conventions (when present)
- Match existing package.json/tsconfig/.eslintrc settings when adding code.
- Keep changes minimal and add/update a `README.md` describing any new feature.
- Use conventional commits for clear history (e.g., `feat:`, `fix:`, `docs:`).

Integration and external services
- If you find CI config (`.github/workflows`, `.gitlab-ci.yml`, etc.), mirror
  their expectations (node/pip versions, test commands) in your changes.
- If adding new dependencies, prefer pinned versions and add them to the
  project manifest (`package.json`/`requirements.txt`) instead of ad-hoc installs.

When to ask the human
- Before creating major scaffolding (new frameworks, monorepo layout).
- If tests are failing after a small change and failure is ambiguous.
- If you cannot find a build/test command after probing common files.

If you add files
- Add a one-line purpose comment at the top of new source files and update
  `README.md` with how to run locally. Include a simple smoke-test command.

Contact for missing context
- If uncertain about the project's language or intent, add a brief note to the
  PR: "Assumed X because Y; please correct if wrong." This saves time for reviewers.

-- End --