NOTEBOOKS := $(shell find docs -name '*.ipynb' -not -path '*/.ipynb_checkpoints/*')

.PHONY: clean-notebooks serve build

# Strip outputs and execution counts from every notebook under docs/.
# Run before committing: the site publishes code only, students run the notebooks themselves.
clean-notebooks:
	uv run jupyter nbconvert --clear-output --inplace $(NOTEBOOKS)

serve:
	uv run mkdocs serve --livereload

build:
	uv run mkdocs build --strict
