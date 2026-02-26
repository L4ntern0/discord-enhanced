# README English + Privacy Check + GitHub Publish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert `README.md` to English-first (with a concise Chinese appendix), verify no sensitive data is exposed, then publish this project to a public GitHub repository.

**Architecture:** This plan uses a docs-first then release workflow: update documentation, run explicit privacy scans with manual triage, align repository metadata, then initialize git and publish via GitHub CLI. The sequence is intentionally gated so publishing only happens after privacy checks pass.

**Tech Stack:** Markdown, TypeScript project metadata (`openclaw.plugin.json`), git, GitHub CLI (`gh`), shell validation commands.

---

### Task 1: Rewrite README to English-first structure

**Files:**
- Modify: `README.md`
- Reference: `docs/plans/2026-02-27-readme-english-release-design.md`
- Test: `README.md` (section/keyword checks via shell)

**Step 1: Write the failing test**

Define required README sections and verify current file does not meet English-first requirement.

```bash
rg -n "^## (功能|安装|使用方法|配置|权限要求|注意事项|许可证)$" README.md
```

Expected: Matches found (current Chinese section headers), indicating requirement not yet satisfied.

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "^## (功能|安装|使用方法|配置|权限要求|注意事项|许可证)$" README.md
```

Expected: Non-empty output.

**Step 3: Write minimal implementation**

Rewrite `README.md` with these sections in English:
- Overview
- Features
- Installation
- Usage (JSON examples retained)
- Configuration
- Required Permissions
- Notes
- License
- Chinese Appendix (concise)

**Step 4: Run test to verify it passes**

Run:

```bash
rg -n "^## (Overview|Features|Installation|Usage|Configuration|Required Permissions|Notes|License|Chinese Appendix)$" README.md
```

Expected: All required English-first sections found.

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README to English-first with Chinese appendix"
```

### Task 2: Run privacy/sensitive data audit and gate publication

**Files:**
- Scan: `README.md`, `index.ts`, `src/thread-tools.ts`, `package.json`, `openclaw.plugin.json`
- Scan (if exists): `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `credentials*.json`
- Test: CLI scan output logs (manual triage)

**Step 1: Write the failing test**

Run keyword-based scans that should fail if real secrets exist.

```bash
rg -n -i "(api[_-]?key|secret|token|password|private[_ -]?key|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|webhook)" .
```

Expected: Possible matches (including benign config references) that require manual triage.

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n -i "(api[_-]?key|secret|token|password|private[_ -]?key|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|webhook)" .
```

Expected: Output exists; treat as “needs review,” not auto-fail.

**Step 3: Write minimal implementation**

Manually classify matches:
- Benign: placeholders, docs text, config access patterns.
- Blocking: hardcoded credentials, private keys, personal/private identifiers.

If blocking matches exist: stop plan and remediate before publication.

**Step 4: Run test to verify it passes**

Re-run targeted scans after triage/remediation:

```bash
rg -n -i "(BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|ghp_[A-Za-z0-9]{36}|xox[baprs]-|AKIA[0-9A-Z]{16})" .
```

Expected: No confirmed real credential patterns.

**Step 5: Commit**

```bash
git add README.md
# Include only if any remediation edits were made
git commit -m "chore: verify repository privacy before publication"
```

### Task 3: Align plugin manifest repository metadata

**Files:**
- Modify: `openclaw.plugin.json`
- Test: `openclaw.plugin.json`

**Step 1: Write the failing test**

Check whether `repository.url` points to final GitHub repository.

```bash
rg -n '"url"\s*:\s*"https://github.com/.+"' openclaw.plugin.json
```

Expected: Existing URL is placeholder/non-final.

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n '"url"\s*:\s*"https://github.com/.+"' openclaw.plugin.json
```

Expected: URL present but not equal to final newly created repository.

**Step 3: Write minimal implementation**

Update `openclaw.plugin.json` `repository.url` to actual target repo URL.

**Step 4: Run test to verify it passes**

Run:

```bash
rg -n '"url"\s*:\s*"https://github.com/<owner>/discord-enhanced(\.git)?"' openclaw.plugin.json
```

Expected: Exact final URL pattern matched.

**Step 5: Commit**

```bash
git add openclaw.plugin.json
git commit -m "chore: set manifest repository URL to published GitHub repo"
```

### Task 4: Initialize git repository and publish to GitHub

**Files:**
- Create: `.git/` (repository metadata)
- Modify: repository history
- Test: git/gh command output

**Step 1: Write the failing test**

Check current git state and remote availability.

```bash
git rev-parse --is-inside-work-tree
git remote -v
```

Expected: Not a git repository / no remotes.

**Step 2: Run test to verify it fails**

Run:

```bash
git rev-parse --is-inside-work-tree
```

Expected: Command fails before init.

**Step 3: Write minimal implementation**

Initialize repo, stage intended files, commit, then create and push GitHub repo.

```bash
git init
git add README.md openclaw.plugin.json index.ts package.json src/thread-tools.ts AGENTS.md docs/plans/2026-02-27-readme-english-release-design.md docs/plans/2026-02-27-readme-english-release.md
git commit -m "feat: publish discord-enhanced plugin with English docs"
# If not authenticated first:
# gh auth login
gh repo create discord-enhanced --public --source . --remote origin --push
```

**Step 4: Run test to verify it passes**

Run:

```bash
git status --short
git remote -v
gh repo view --json name,url,visibility
```

Expected:
- Clean working tree (or only intentional untracked files)
- `origin` remote configured
- GitHub repo exists and visibility is `PUBLIC`

**Step 5: Commit**

No additional commit required after publish unless follow-up metadata/doc fixes are made.

---

## Verification Checklist

- `README.md` is English-first with a concise `Chinese Appendix`.
- No confirmed real secrets/private data in repository.
- `openclaw.plugin.json` repository URL matches final remote.
- GitHub repository is created and branch is pushed.
