# Social Media Analysis

Course materials for "social media analysis" class.

🌐 **Live Site**: https://yangkc.github.io/social-media-analysis/

## Development

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

### Local Setup

```bash
# Clone repository
git clone https://github.com/yangkc/social-media-analysis.git
cd social-media-analysis

# Install dependencies
uv sync --group docs

# Serve documentation locally
uv run mkdocs serve
```

Visit http://127.0.0.1:8000 to view the site.

### Adding Content

1. Create notebooks in appropriate `docs/topics/` subdirectory
2. Add Colab badge at top of notebook:
   ```markdown
   [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/yangkc/social-media-analysis/blob/main/docs/topics/TOPIC/NOTEBOOK.ipynb)
   ```
3. For tutorial notebooks: Execute and commit with outputs
4. For exercise notebooks: Leave cells empty and commit without outputs
5. Update `nav:` section in `mkdocs.yml`

### Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions.

## License

MIT License - see LICENSE file
