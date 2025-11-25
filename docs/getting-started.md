# Getting Started

## Prerequisites

To effectively complete this course, you should be familiar with the following:

- Basic Python knowledge
- Jupyter notebooks

This course contains some notebooks that are designed to help you understand the concepts and techniques used in the course.
You can run them locally or in Google Colab.

## Local Setup

If you prefer to run the notebooks locally, you can clone the repository and install the dependencies locally.

```bash
# Clone the repository
git clone https://github.com/YangKCLab/social-media-analysis.git
cd social-media-analysis
```

We use the package manager [uv](https://docs.astral.sh/uv/) to manage the dependencies.
Once you have `uv` installed, you can install the dependencies by running:

```bash
uv sync
```

To run the notebooks locally, you can use the following command:
```bash
uv run jupyter lab
```

This will start the JupyterLab server and you can open the notebooks in your browser.

## Using Google Colab

It might be easier to run the notebooks in Google Colab.
You can do so following the instructions below:

1. Click "Open in Colab" on any notebook page
2. Sign in with your Google account
3. Run cells directly in your browser
4. Your changes are saved to your Google Drive