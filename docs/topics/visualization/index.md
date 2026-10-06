# Visualization

In this module, you will learn how to make a figure that a reader can read easily: which figure type to use, how to design the figure, which colors to use, and which tool to use.

A plot with the default settings of a plotting library is not ready for a report.
The labels, the size of the text, the colors, and the file type all need a decision.
Each page answers one question about a figure, and one page changes a default plot into a figure for a report, step by step.

## Learning objectives

- Choose a figure type by what you want to show
- Plot data that has many columns with a pair plot and with PCA
- Apply five principles to a figure: a clear message, labels, only the elements you need, readable fonts, and vector or high-resolution files
- Turn a default Matplotlib plot into a figure for a report, and export it as PDF and PNG
- Choose a color map by the class of your data, and check it in gray scale
- Find color-blind friendly color maps with Scicolor
- Make figures with Matplotlib and seaborn, an interactive figure with Plotly, and a small dashboard with Streamlit

## Pages

| Page | What it covers |
|------|----------------|
| [Figure types](figure-types.md) | A table that leads from what you want to show to a figure type; data with many columns: the pair plot, the pair plot with color, and dimension reduction with PCA; one link each for t-SNE, UMAP, and maps |
| [Figure design principles](principles.md) | Five principles: think about your message, label the figure, keep it simple, make the fonts readable, and use vector or high-resolution files; a worked example that changes a default plot into a figure for a report in five steps |
| [Color](color.md) | What a scientific color map is; how to check a color map in gray scale; the classes and types of color maps, and which class fits which data; how to find a color map with Scicolor; the contrast between text and background |
| [Plotting tools](plotting-tools.md) | Matplotlib and when to use it; two seaborn examples, a joint plot and an annotated heatmap; an interactive Plotly figure that you can try on the page; a Streamlit script for a small dashboard |

## Notebooks

Each notebook holds the code of one page and runs in Colab without setup.
The Pair plots and PCA notebook and the Seaborn and Plotly notebook each download one small CSV file when they run.
The Figure for a report notebook and the Color maps notebook use the Scicolor package, and their first code cell installs it in Colab.

| Notebook | Sections | |
|----------|----------|---|
| [Pair plots and PCA](pair-plots-and-pca.ipynb) | [Load the iris data](pair-plots-and-pca.ipynb#load-the-iris-data), [Pair plot](pair-plots-and-pca.ipynb#pair-plot), [Pair plot with color](pair-plots-and-pca.ipynb#pair-plot-with-color), [Dimension reduction with PCA](pair-plots-and-pca.ipynb#dimension-reduction-with-pca) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/visualization/pair-plots-and-pca.ipynb){ .colab-button } |
| [A figure for a report](report-figure.ipynb) | [The message and the data](report-figure.ipynb#the-message-and-the-data), [The default plot](report-figure.ipynb#the-default-plot), [Step 1: labels](report-figure.ipynb#step-1-labels), [Step 2: fewer elements](report-figure.ipynb#step-2-fewer-elements), [Step 3: figure size and font size](report-figure.ipynb#step-3-figure-size-and-font-size), [Step 4: color](report-figure.ipynb#step-4-color), [Step 5: export as PDF and PNG](report-figure.ipynb#step-5-export-as-pdf-and-png), [The complete code](report-figure.ipynb#the-complete-code) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/visualization/report-figure.ipynb){ .colab-button } |
| [Color maps](color-maps.ipynb) | [Install and import Scicolor](color-maps.ipynb#install-and-import-scicolor), [Find a color map](color-maps.ipynb#find-a-color-map), [One dataset with two color maps](color-maps.ipynb#one-dataset-with-two-color-maps), [Color maps in gray scale](color-maps.ipynb#color-maps-in-gray-scale), [Classes and types of color maps](color-maps.ipynb#classes-and-types-of-color-maps) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/visualization/color-maps.ipynb){ .colab-button } |
| [Seaborn and Plotly](seaborn-and-plotly.ipynb) | [Joint plot](seaborn-and-plotly.ipynb#joint-plot), [Annotated heatmap](seaborn-and-plotly.ipynb#annotated-heatmap), [Interactive scatter plot with Plotly](seaborn-and-plotly.ipynb#interactive-scatter-plot-with-plotly), [Save the interactive figure](seaborn-and-plotly.ipynb#save-the-interactive-figure) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/visualization/seaborn-and-plotly.ipynb){ .colab-button } |

The Streamlit script of the Plotting tools page is not in a notebook, because it runs as a program on your own computer.

## Tools

| Tool | What it is for | In this module |
|------|----------------|----------------|
| [Matplotlib](https://matplotlib.org/) (Python) | The basic plotting library of Python, with almost every figure type | [Matplotlib](plotting-tools.md#matplotlib), and the worked example on [Figure design principles](principles.md) |
| [seaborn](https://seaborn.pydata.org/) (Python) | Built on Matplotlib; it makes common statistical figures with one call | [Seaborn](plotting-tools.md#seaborn), and the pair plots on [Figure types](figure-types.md#pair-plot) |
| [Plotly](https://plotly.com/python/) (Python) | Interactive figures for a web page | [Plotly](plotting-tools.md#plotly) |
| [Streamlit](https://streamlit.io/) (Python) | Not a plotting library; it turns a Python script into a web page with controls and figures | [Streamlit](plotting-tools.md#streamlit) |
| [ggplot2](https://ggplot2.tidyverse.org/) (R) | A plotting library for the language R | Not covered |

Every figure in this module is made with Matplotlib, seaborn, or Plotly.
The notebooks also use [Scicolor](color.md#find-a-color-map-with-scicolor), a Python package of color maps for scientific figures, and scikit-learn for PCA.

## Related

- [Hypothesis testing and statistical analysis](../stats/index.md), whose pages have the code for the histogram, the box plot, the violin plot, the CDF, the scatter plot, and the 2D histogram
- [Network analysis](../network/index.md), the module for plots of the connections between accounts
