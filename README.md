# Social Media Analysis

Course materials for "social media analysis" class.

🌐 **Live Site**: https://yangkclab.github.io/social-media-analysis/

## Running the notebooks

Every notebook has an "Open in Colab" button on the site. To run them on your own machine instead:

```bash
git clone https://github.com/YangKCLab/social-media-analysis.git
cd social-media-analysis
uv sync                 # installs the notebook dependencies (atproto, requests, google-api-python-client, ...)
uv run jupyter lab      # then open docs/topics/<topic>/<notebook>.ipynb
```

Notebooks that need credentials (Bluesky, YouTube) read them from a `.env` file in the notebook's folder. Each notebook's setup cell lists the variable names. Never commit the `.env` file.

## Development

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

### Local Setup

```bash
# Clone repository
git clone https://github.com/YangKCLab/social-media-analysis.git
cd social-media-analysis

# Install dependencies
uv sync --group docs

# Serve documentation locally
uv run mkdocs serve --livereload   # the flag is required: without it, mkdocs 1.6.1 + click 8.2+ starts with no file watcher
```

Visit http://127.0.0.1:8000 to view the site.

### Adding Content

1. Create notebooks in appropriate `docs/topics/` subdirectory
2. Add Colab badge at top of notebook:
   ```markdown
   [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/TOPIC/NOTEBOOK.ipynb)
   ```
3. For tutorial notebooks: Execute and commit with outputs
4. For exercise notebooks: Leave cells empty and commit without outputs
5. Update `nav:` section in `mkdocs.yml`

### Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions.

## License

MIT License - see LICENSE file
