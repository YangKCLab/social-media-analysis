# Hypothesis Testing and Statistical Analysis

In this module, you will learn the statistics that an analysis of social media data needs: how to describe a set of numbers, how to test a claim about them, and how to measure whether two values change together.

Social media data is highly skewed.
A few accounts have millions of followers, and most accounts have very few.
The mean, a histogram with equal bins, and a test that assumes a normal distribution all give a wrong picture of such data.
Each page shows what to use for skewed data.

## Learning objectives

- Describe a set of numbers with the mean and the median, and say which one fits skewed data
- Plot a distribution with a histogram, a box plot, a violin plot, a CDF, and a CCDF
- Use log bins and log axes for skewed data such as follower counts
- State a null hypothesis and explain what a p-value means
- Run a binomial test and a t-test with SciPy, and choose another test when the data is not normal
- Report the p-value and the size of the difference, not only whether the result is significant
- Plot the relationship between two variables and measure it with the Spearman or the Pearson coefficient
- Explain why a correlation does not show a cause

## Pages

| Page | What it covers |
|------|----------------|
| [Descriptive statistics and distributions](descriptive-statistics.md) | The mean and the median, and five plots of a distribution: histogram, box plot, violin plot, CDF, and CCDF; log bins and log axes for skewed data |
| [Hypothesis testing](hypothesis-testing.md) | What a p-value means; a test built by simulation with a coin; the binomial test and the t-test; how to choose another test; how to report a result; significance and effect size |
| [Correlation](correlation.md) | Why a correlation does not show a cause; the scatter plot on log axes; the Spearman and the Pearson coefficient; the 2D histogram |

## Notebooks

Each notebook holds all the code of one page and runs in Colab without setup.
Two of the notebooks download a small data file (154 KB) on first run.

| Notebook | Sections | |
|----------|----------|---|
| [Distributions](distributions.ipynb) | [Mean and median](distributions.ipynb#mean-and-median), [Simulated heights](distributions.ipynb#simulated-heights), [Box plot and violin plot](distributions.ipynb#box-plot-and-violin-plot), [Load the Botwiki-2019 data](distributions.ipynb#load-the-botwiki-2019-data), [Histogram of follower counts](distributions.ipynb#histogram-of-follower-counts), [Mean and median of a skewed distribution](distributions.ipynb#mean-and-median-of-a-skewed-distribution), [Box plot on a log axis](distributions.ipynb#box-plot-on-a-log-axis), [CDF and CCDF](distributions.ipynb#cdf-and-ccdf) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/stats/distributions.ipynb){ .colab-button } |
| [Significance tests](significance-tests.ipynb) | [Toss a coin 100,000 times](significance-tests.ipynb#toss-a-coin-100000-times), [One sample of 100 tosses](significance-tests.ipynb#one-sample-of-100-tosses), [What a fair coin does](significance-tests.ipynb#what-a-fair-coin-does), [The p-value](significance-tests.ipynb#the-p-value), [A biased coin](significance-tests.ipynb#a-biased-coin), [The binomial test](significance-tests.ipynb#the-binomial-test), [Compare two groups with a t-test](significance-tests.ipynb#compare-two-groups-with-a-t-test), [Other tests](significance-tests.ipynb#other-tests), [Significance and effect size](significance-tests.ipynb#significance-and-effect-size) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/stats/significance-tests.ipynb){ .colab-button } |
| [Correlation analysis](correlation-analysis.ipynb) | [Load the Botwiki-2019 data](correlation-analysis.ipynb#load-the-botwiki-2019-data), [Scatter plot](correlation-analysis.ipynb#scatter-plot), [Log axes](correlation-analysis.ipynb#log-axes), [Spearman and Pearson](correlation-analysis.ipynb#spearman-and-pearson), [2D histogram](correlation-analysis.ipynb#2d-histogram), [Log color scale](correlation-analysis.ipynb#log-color-scale) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/stats/correlation-analysis.ipynb){ .colab-button } |

## Tools

| Tool | What it is for |
|------|----------------|
| [`scipy.stats`](https://docs.scipy.org/doc/scipy/reference/stats.html) (Python) | Statistical tests, correlation coefficients, and distributions |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) (Python) | Statistical models and more tests, such as the two-proportions z-test |
| [`matplotlib`](https://matplotlib.org/) (Python) | Histograms, box plots, CDFs, scatter plots, and 2D histograms |
| [R](https://www.r-project.org/) | A language made for statistics |

Every plot and test in this module uses `scipy.stats`, `statsmodels`, and `matplotlib`.

## Related

- [Data format and management](../data-format-management/index.md), whose tabular data notebook covers the pandas tables that these notebooks use
- [Measurements and metrics](../measurements/index.md), whose scores are the numbers that you describe and compare with these methods
