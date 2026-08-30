# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains course materials for the "social media analysis" class. The goal is to create an online website with all materials and resources using Material for MkDocs.

**Linear Project Details:**
- Project: Social media analysis class
- Status: Infrastructure Complete ✅ / Content Development In Progress
- Priority: Urgent
- Timeline: Nov 24, 2025 → Jan 31, 2026
- Linear URL: https://linear.app/kevinlinear/project/social-media-analysis-class-b087aefbe485
- Infrastructure Issues: 11/11 completed (KEV-906 through KEV-916) ✅
- Live Site: https://yangkclab.github.io/social-media-analysis/
- Repository: https://github.com/YangKCLab/social-media-analysis

**Technical Stack:**
- Package Manager: UV (Python 3.12)
- Documentation: Material for MkDocs with mkdocs-jupyter plugin
- Deployment: GitHub Pages via GitHub Actions
- Interactive Learning: Google Colab integration

## Common Commands

### Development
```bash
# Install all dependencies (including docs group)
uv sync --group docs

# Start local development server
uv run mkdocs serve --livereload

# Build static site
uv run mkdocs build

# Build with strict error checking
uv run mkdocs build --strict
```

### Adding Dependencies
```bash
# Add documentation dependencies
uv add --group docs <package-name>

# Add regular project dependencies
uv add <package-name>

# Sync environment after updating dependencies
uv sync
```

## Project Structure

```
social-media-analysis/
├── docs/                        # Documentation source
│   ├── index.md                # Homepage
│   ├── getting-started.md      # Setup guide
│   ├── syllabus.md            # Course syllabus
│   ├── topics/                # Topic-based content
│   │   ├── apis/              # API tutorials
│   │   ├── data-collection/   # Data collection tutorials
│   │   ├── sentiment-analysis/ # Sentiment analysis tutorials
│   │   └── visualization/     # Visualization tutorials
│   ├── exercises/             # Practice notebooks (empty cells)
│   ├── stylesheets/           # Custom CSS
│   │   └── extra.css         # Colab button styling
│   └── assets/               # Images and other assets
├── .github/
│   └── workflows/
│       └── deploy.yml        # Auto-deployment to GitHub Pages
├── mkdocs.yml                # MkDocs configuration
├── pyproject.toml            # UV project configuration
└── uv.lock                   # Dependency lockfile (commit this!)
```

## Content Organization

### Topic-Based Structure
- Content organized by topics (APIs, Sentiment Analysis, etc.) rather than weeks
- Each topic has an `index.md` overview page
- Notebooks are placed in topic subdirectories
- Navigation structure defined in `mkdocs.yml`

### Adding New Topics
1. Create directory: `docs/topics/new-topic/`
2. Create overview: `docs/topics/new-topic/index.md`
3. Add notebooks: `docs/topics/new-topic/tutorial.ipynb`
4. Update navigation in `mkdocs.yml`:
   ```yaml
   nav:
     - Topics:
       - New Topic:
         - topics/new-topic/index.md
         - Tutorial: topics/new-topic/tutorial.ipynb
   ```

## Notebook Guidelines

### Tutorial Notebooks
**Purpose**: Demonstrate concepts; students run them in Colab or from a clone of the repo

**Workflow**:
1. Create notebook in appropriate `docs/topics/` subdirectory
2. Add Colab badge at the top (markdown cell):
   ```markdown
   [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/TOPIC/NOTEBOOK.ipynb)
   ```
3. Write content with explanations and code
4. Execute all cells to check that they run
5. Run `make clean-notebooks` to strip the outputs, then commit
6. Add to navigation in `mkdocs.yml`

### Exercise Notebooks (empty cells)
**Purpose**: Practice problems for students to solve

**Workflow**:
1. Create notebook in `docs/exercises/`
2. Add Colab badge at the top
3. Write problem statements in markdown cells
4. Create code cells with `# Your code here` comments
5. Run `make clean-notebooks` before committing so no outputs are stored
6. Commit notebook WITHOUT outputs
7. Add to navigation in `mkdocs.yml`

## Google Colab Integration

### Colab Link Format
```
https://colab.research.google.com/github/{user}/{repo}/blob/{branch}/{path}
```

**Example**:
```
https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/apis/twitter-api.ipynb
```

### Adding Colab Links

**Method 1: Colab Badge in Notebook** (Recommended for notebooks)
Add as first cell in notebook (markdown):
```markdown
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/apis/twitter-api.ipynb)
```

**Method 2: Styled Button in Topic Overview** (Recommended for index.md pages)
Add to topic overview markdown:
```markdown
!!! tip "Interactive Learning"
    Open this notebook in Google Colab to run the code interactively:

    [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/apis/twitter-api.ipynb){ .colab-button }
```

### Custom Colab Styling
The `.colab-button` class is defined in `docs/stylesheets/extra.css` with:
- Orange background (#f9ab00)
- Hover effects
- Rocket emoji prefix
- Dark mode support

## MkDocs Configuration

### Key Settings (mkdocs.yml)
- **Theme**: Material with dark/light mode toggle
- **Plugins**:
  - `search` - Full-text search
  - `mkdocs-jupyter` - Notebook rendering (execute: false, include_source: true)
- **Features**: Navigation tabs, sections, code copy buttons, TOC
- **Markdown Extensions**: Syntax highlighting, admonitions, tabs, etc.

### Navigation Structure
Edit the `nav:` section in `mkdocs.yml` to add/remove pages. Structure:
```yaml
nav:
  - Home: index.md
  - Topics:
    - Topic Name:
      - topics/topic-name/index.md
      - Page Title: topics/topic-name/notebook.ipynb
```

## Deployment

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Process**: Build → Upload artifacts → Deploy to GitHub Pages
- **Live Site**: https://yangkclab.github.io/social-media-analysis/
- **GitHub Actions**: Deployment typically completes in 30-40 seconds

### Monitoring Deployment
1. Push changes to `main` branch
2. Go to repository **Actions** tab
3. Watch for workflow run
4. Check build and deploy jobs
5. Visit site URL after successful deployment

### Local Testing Before Deployment
```bash
# Build site locally
uv run mkdocs build --strict

# Serve locally to test
uv run mkdocs serve --livereload

# Visit http://127.0.0.1:8000
```

## Troubleshooting

### Build Fails with "strict mode" errors
- Check for broken links in markdown files
- Ensure all files referenced in `nav:` exist
- Verify image paths are correct

### Notebooks not rendering
- Verify mkdocs-jupyter is installed: `uv sync --group docs`
- Check notebook is valid JSON (not corrupted)
- Ensure notebook path in `mkdocs.yml` is correct

### Colab links not working
- Verify repository is public (required for Colab GitHub integration)
- Check link format matches: `github.com/USER/REPO/blob/BRANCH/PATH`
- Ensure notebook is pushed to GitHub

### Local serve does not reload on file changes
- Pass `--livereload` explicitly. With mkdocs 1.6.1 and click 8.2 or newer, plain `uv run mkdocs serve` starts without a file watcher, so edits never rebuild. The fix is confirmed when the startup log prints `Watching paths for changes: 'docs', 'mkdocs.yml'`.

### Local serve shows wrong content
- Clear browser cache
- Restart mkdocs server: `Ctrl+C` then `uv run mkdocs serve --livereload`
- Check you're on the correct git branch

## Best Practices

1. **Always commit uv.lock** - Ensures reproducible builds
2. **Test locally before pushing** - Use `uv run mkdocs serve --livereload`
3. **Use --strict flag** - Catches errors early: `uv run mkdocs build --strict`
4. **Commit notebooks without outputs** - `make clean-notebooks` before every commit; students run the code themselves
6. **Add Colab links consistently** - Every notebook should be Colab-accessible
7. **Update navigation** - Remember to add new pages to `mkdocs.yml`
8. **Write clear markdown** - Use headings, lists, and code blocks effectively

## Project Status

### ✅ Completed Infrastructure (Phase 1)
All infrastructure setup is complete and deployed:
- UV project initialized with Python 3.12
- Directory structure created
- MkDocs configured with Material theme
- Google Colab integration implemented
- GitHub Actions workflow deployed
- Core documentation pages created (homepage, getting started, syllabus)
- Sample topic structure and notebooks created
- GitHub Pages configured and live
- Documentation updated (CLAUDE.md, README.md)

### 🚀 Current Phase: Content Development
The next phase involves creating comprehensive course content:
- Expanding tutorial notebooks for each topic
- Creating more exercise notebooks for practice
- Adding detailed content to topic overview pages
- Including datasets and examples
- Adding images and diagrams to support learning

### Repository Cleanup
- Local `init` branch has been deleted (no longer needed)
- All changes are on `main` branch
- Repository is optimized with git garbage collection
