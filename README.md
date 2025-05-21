# 🚀 iExec Launchpad

A **starter template** for all iExec repositories, pre‑configured with GitHub Actions workflows and a development container. Kickstart your project with best practices out of the box!

---

## 📦 Features

- 🕰️ **Stale Workflow**  
  Automatically closes inactive issues and PRs after a configurable period.

- 🏷️ **Release Workflow (Release Please)**  
  Generates changelogs, creates draft releases, and bumps versions based on Conventional Commits.

- 📝 **Conventional Commits Linting**  
  Validates commit messages to ensure a consistent, machine‑readable history.

- 🐳 **Devcontainer**  
  A fully configured development container with a curated toolset for iExec projects.

---

## 🛠️ Development Container

This repo includes a [VS Code Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) configured with:

- **Node.js** LTS
- **Docker CLI** & **Docker Compose**  
- **Git**  
- **prettier**, **eslint**, **commitlint**  
- Any other team‑approved CLI tools (e.g. `iexec-cli`, `ethers.js`, etc.)

> **To use:**  
> 1. Open this folder in VS Code.  
> 2. When prompted, **Reopen in Container**.  
> 3. Your environment will be built automatically.

---

## 🚦 GitHub Actions Workflows

### 1. Stale  
- Path: `.github/workflows/stale.yml`  
- Marks issues and PRs as stale after 30 days of inactivity, then closes after 7 days without response.

### 2. Release Please  
- Path: `.github/workflows/release-please.yml`  
- Uses [release-please](https://github.com/googleapis/release-please) to automate semantic releases based on Conventional Commits.

### 3. Conventional Commits Lint  
- Path: `.github/workflows/commitlint.yml`  
- Runs on every push to validate that commit messages follow the [Conventional Commits spec](https://www.conventionalcommits.org/).

---

## 🚀 Getting Started

1. **Generate a new repo** from this template:
   ```bash
   # via GitHub UI: New → Choose “iExec Launchpad” template
   ```

2. **Clone & enter**:
   ```bash
   git clone git@github.com:YOUR-ORG/YOUR-REPO.git
   cd YOUR-REPO
   ```

3. **Open in Dev Container** using VS Code (see 🛠️ above).

4. **Verify workflows** by pushing a dummy commit and opening an issue/PR.

---

## 📖 Customization

- **Stale:** Edit `.github/stale.yml` to adjust days until stale/close.
- **Release Please:** Configure labels, release branches, and monorepo settings in `release-please-config.json`.

---

## 🤝 Contributing

Feel free to suggest improvements!
1. Open an issue.
2. Fork the repo and submit a PR.
3. Ensure CI passes and commit messages follow Conventional Commits.

---

*Happy building with iExec!* 🚀