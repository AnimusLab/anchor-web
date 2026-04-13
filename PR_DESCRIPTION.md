# PR Description: Repository Organization & Documentation Overhaul

## 🎯 Purpose
This PR significantly improves the repository structure and baseline documentation of the `anchor-web` project. It transitions the workspace from a collection of loosely tracked files into a mature, organized repository.

## 🛠 Changes Made

### 1. Root Cleanup
- **Removed Root Redundancy**: Deleted `package.json`, `package-lock.json`, and the root `node_modules`. These were duplicating sub-project dependencies and causing environment confusion.
- **Removed Cache**: Cleaned up all `__pycache__` directories.
- **Improved Exclusions**: Updated `.gitignore` to be more comprehensive for Python, Node.js, and project-specific database files.

### 2. Module Integration
- **Staged Untracked Modules**: Officially brought `oversight/`, `root-admin/`, `server/`, and `DOCS/` into the Git repository.
- **Tracked Core Scripts**: Added `aegis_bot.py`, `anchor_sdk.py`, and `run_simulation.py` to the codebase.

### 3. Documentation Standardization
- **Master README**: Created a global `README.md` that maps the entire system architecture.
- **Landing README**: Updated with context on the Bloomberg Terminal aesthetic and 3D/chart features.
- **Dashboard README**: Replaced placeholder content with a functional overview of the User Control Plane.

## ✅ Verification Results
- `git status` confirms a clean working directory with the new branch `repo-org-cleanup`.
- Verified that all core directories are now correctly tracked.
- Manual review of all `.md` files performed for clarity and tech-stack accuracy.

---
*Note: This PR prepares the "Active Workplace" for the upcoming v6.0 Model Context Protocol (MCP) development cycle.*
