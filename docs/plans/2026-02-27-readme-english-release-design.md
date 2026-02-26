# Design: README English-First + Privacy Check + Repository Publication

Date: 2026-02-27
Project: `discord-enhanced`

## 1) Goal

Deliver an English-first project README, perform a privacy/sensitive-data review before publication, and then create and publish the project to a remote GitHub repository.

## 2) Scope

In scope:
- Rewrite `README.md` with English as the primary language.
- Keep a concise Chinese appendix for accessibility.
- Scan repository content for common secret/privacy leakage patterns.
- Initialize git repository if absent.
- Create a public GitHub repository and push current branch.
- Align plugin manifest repository metadata with final remote URL.

Out of scope:
- Feature/code behavior changes in plugin runtime logic.
- CI/CD pipeline setup.
- Release automation beyond initial repository publication.

## 3) Context Summary

- The existing README is primarily Chinese.
- Core plugin code reads Discord token from runtime OpenClaw config; no hard-coded token observed in source.
- Current working directory is not yet a git repository.

## 4) Approach Options Considered

### Option A (Recommended): Direct delivery path
- Rewrite README now, run privacy scan, publish repo.
- Pros: fastest and aligned with current user objective.
- Cons: relies on local GitHub CLI auth being available.

### Option B: Bilingual parity README
- Fully duplicate EN/ZH sections side-by-side.
- Pros: comprehensive multilingual docs.
- Cons: heavier maintenance burden; conflicts with “English-first” request.

### Option C: Governance-first
- Add secret-scanning automation and release scripts before publish.
- Pros: stronger long-term process.
- Cons: over-scoped for immediate publication request.

Recommendation: Option A.

## 5) Approved Design

### 5.1 Documentation Structure
- `README.md` main sections in English:
  - Overview
  - Features
  - Installation
  - Usage (tool examples)
  - Configuration
  - Required Permissions
  - Notes
  - License
- Keep JSON command examples while converting explanatory text to English.
- Add a final `Chinese Appendix` with concise Chinese summary (features and key cautions).

### 5.2 Privacy Review Strategy
- Search for sensitive patterns including:
  - token/secret/password/api key keywords
  - private key markers
  - webhook URLs and credential-like values
- Inspect possible sensitive files (`.env`, credentials, key files) if present.
- Classify hits:
  - benign examples/config references
  - potential real secrets
- Block publication if real sensitive data is found.

### 5.3 Publication Flow
1. Update README.
2. Run privacy scan and review findings.
3. Update `openclaw.plugin.json` `repository.url` to final GitHub URL.
4. Initialize git (if needed), stage files, commit.
5. Create GitHub public repository and push using `gh` CLI.
6. Return repository URL and summary of checks.

## 6) Error Handling

- If sensitive data is detected: stop publication and report exact files/keys needing remediation.
- If `gh auth` is missing/expired: keep local changes and ask user to run `gh auth login`.
- If repository name conflict occurs: propose fallback name (e.g., `discord-enhanced-plugin`) and confirm.

## 7) Acceptance Criteria

- `README.md` is English-first and readable, with Chinese appendix included.
- Privacy scan shows no confirmed real secrets/private data.
- Remote public GitHub repository exists and current branch is pushed.
- `openclaw.plugin.json` `repository.url` matches actual repository URL.
