# Figure types

The right figure depends on what you want to show.
This page has a table that leads from what you want to show to a figure type.
It then shows two ways to plot data that has many columns: the pair plot and principal component analysis (PCA).

The [Pair Plots and PCA notebook](pair-plots-and-pca.ipynb) runs all the code on this page.
A comment after a line of code shows the result of that line.
The code uses these imports.

```python
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
```

## Choose the figure by what you want to show

| You want to show | Figures to consider | Where to find the code |
|------------------|---------------------|------------------------|
| The distribution of one number | Histogram, box plot, violin plot, CDF | [Descriptive statistics and distributions](../stats/descriptive-statistics.md) |
| The relationship between two numbers | Scatter plot, 2D histogram | [Correlation](../stats/correlation.md) |
| A change over time | Line plot | [Figure design principles](principles.md), whose worked example is a line plot |
| A comparison between groups | Bar plot, box plots side by side | For the box plot, see [Box plot and violin plot](../stats/descriptive-statistics.md#box-plot-and-violin-plot). For the bar plot, see the Matplotlib documentation of [`bar`](https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.bar.html) |
| Many numbers for each data point | Pair plot, dimension reduction | [Pair plot](#pair-plot) and [Dimension reduction with PCA](#dimension-reduction-with-pca) on this page |
| Values by place | Map | [Further topics](#further-topics) on this page |
| Connections between accounts | Network plot | [Network analysis](../network/index.md) |

The [Python Graph Gallery](https://python-graph-gallery.com/) lists many more figure types, each with its code.

## Data with many columns

A figure shows two columns of a table easily, and a dataset often has more columns.

The example is the iris data: four measurements, in centimeters, of 150 iris flowers of three species.
R. A. Fisher published the measurements in 1936 ([Fisher, 1936](https://doi.org/10.1111/j.1469-1809.1936.tb02137.x)).
The code downloads the file `iris.csv` from the repository of the seaborn example data, [mwaskom/seaborn-data](https://github.com/mwaskom/seaborn-data), at a fixed commit.

```python
IRIS_URL = (
    "https://raw.githubusercontent.com/mwaskom/seaborn-data/"
    "71e2436a092d714350de0fc409ca8a8714e7e78f/iris.csv"
)
iris = pd.read_csv(IRIS_URL)
iris
```

The table has 150 rows, one for each flower, and 5 columns.

| | sepal_length | sepal_width | petal_length | petal_width | species |
|---|---|---|---|---|---|
| 0 | 5.1 | 3.5 | 1.4 | 0.2 | setosa |
| 1 | 4.9 | 3.0 | 1.4 | 0.2 | setosa |
| ... | ... | ... | ... | ... | ... |
| 149 | 5.9 | 3.0 | 5.1 | 1.8 | virginica |

Four columns are measurements: the length and the width of a sepal, and the length and the width of a petal.
The sepals are the outer parts of the flower, and the petals are the inner parts.
The fifth column is the species: `setosa`, `versicolor`, or `virginica`, with 50 flowers each.

## Pair plot

A pair plot draws every pair of columns.

- Off the diagonal, each panel is a scatter plot of two columns.
- On the diagonal, each panel is the histogram of one column.

`sns.pairplot` uses every number column of the table.

```python
sns.pairplot(iris)
plt.show()
```

![A pair plot of the four iris measurements: a grid of 4 by 4 panels. The four panels on the diagonal are histograms, and the other twelve panels are scatter plots. All points have the same blue color. In most scatter plots the points form two separate groups.](figures/iris-pair-plot.png){ width="640" }

Four columns give 16 panels.
Each scatter plot appears twice, once above and once below the diagonal, with the two axes swapped.
The panel of `petal_length` and `petal_width` shows that flowers with long petals also have wide petals.
In most panels the points form two groups.
The plot does not show which species a point belongs to.

Use a pair plot for a first look at a table with a few number columns.
The number of panels grows fast: ten columns give 100 panels.

## Pair plot with color

Color adds one more column to every panel.
`hue="species"` gives each species its own color and adds a legend.
With `hue`, seaborn draws smooth density curves on the diagonal by default.
`diag_kind="hist"` keeps the histograms.

```python
sns.pairplot(iris, hue="species", diag_kind="hist")
plt.show()
```

![The same pair plot with one color for each species: blue for setosa, orange for versicolor, and green for virginica, with a legend on the right. The blue points form their own group in every scatter plot. The orange and the green points are next to each other and overlap.](figures/iris-pair-plot-species.png){ width="720" }

Setosa is separate from the other two species in every panel.
Versicolor and virginica are next to each other, and they overlap.
The two groups of the first pair plot are setosa on one side and the other two species on the other side.

## Dimension reduction with PCA

A dimension reduction method turns many columns into two, so that one scatter plot shows all of them.
Principal component analysis (PCA) is a common method of this kind.
It finds new axes, called principal components.

- The first component is the direction along which the data points differ the most.
- The second component is the direction with the most remaining variance, at a right angle to the first.

`StandardScaler` first gives each column a mean of 0 and a standard deviation of 1.
Without this step, a column with large values dominates the result.
`explained_variance_ratio_` is the share of the variance that each component holds.

```python
features = iris.drop(columns="species")
scaled = StandardScaler().fit_transform(features)
pca = PCA(n_components=2)
components = pca.fit_transform(scaled)
pca.explained_variance_ratio_    # array([0.72962445, 0.22850762])
```

The first component holds 73% of the variance of the four standardized columns, and the second holds 23%.
Together they hold 96%, so a scatter plot of the two components keeps most of the differences between the flowers.

`components` has 150 rows and 2 columns: the position of each flower on the two components.
The next code plots them, with one color for each species.

```python
ratio = pca.explained_variance_ratio_

fig, ax = plt.subplots(layout="constrained")
for species in ["setosa", "versicolor", "virginica"]:
    mask = (iris["species"] == species).to_numpy()
    ax.scatter(components[mask, 0], components[mask, 1], label=species)
ax.set_xlabel(f"PC1 ({ratio[0]:.0%} of the variance)")
ax.set_ylabel(f"PC2 ({ratio[1]:.0%} of the variance)")
ax.legend(title="species", frameon=False, loc="center left", bbox_to_anchor=(1.0, 0.5))
ax.spines[["top", "right"]].set_visible(False)
plt.show()
```

![A scatter plot of the first two principal components of the iris data. The x-axis is PC1 with 73% of the variance, and the y-axis is PC2 with 23% of the variance. The blue setosa points form a group on the left, far from the other points. The orange versicolor points and the green virginica points are next to each other on the right and overlap a little.](figures/iris-pca.png){ width="520" }

Each point is one flower.
Setosa is far from the other two species along the first component.
Versicolor and virginica are next to each other and overlap a little.
One scatter plot now shows the main pattern of the 16 panels of the pair plot.

- `layout="constrained"` makes room for the legend, which is outside the plot.
- A principal component is a mix of the four measurements, so its axis has no unit. The axis label gives the share of the variance instead.

PCA is also useful for data with many more columns.
An example is the embeddings of posts, which have hundreds of columns.

## Further topics

This page does not cover the three topics below.
Each one has a link to start from.

- **t-SNE.** t-SNE places data points that are similar close to each other in two dimensions, but the sizes of the groups and the distances between the groups in the plot often mean nothing, and the plot changes with the setting `perplexity`; see [How to Use t-SNE Effectively](https://distill.pub/2016/misread-tsne/).
- **UMAP.** UMAP is a faster method of the same kind and a common choice for text embeddings: for example, BERTopic reduces the embedding of each post with UMAP before it groups the posts into topics; see [the UMAP documentation](https://umap-learn.readthedocs.io/en/latest/).
- **Maps.** A map gives a large area more attention than a small area, also when few people live in the large area, so compare the values with the number of people before you read a pattern from a map; for the code, see [the map examples of Plotly](https://plotly.com/python/maps/).

## Links

- [Pair Plots and PCA notebook](pair-plots-and-pca.ipynb): all the code on this page
- [Python Graph Gallery](https://python-graph-gallery.com/): many figure types, each with its code
- The seaborn documentation of [`pairplot`](https://seaborn.pydata.org/generated/seaborn.pairplot.html)
- The scikit-learn documentation of [`PCA`](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html) and [`StandardScaler`](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html)
- Fisher (1936), [The use of multiple measurements in taxonomic problems](https://doi.org/10.1111/j.1469-1809.1936.tb02137.x): the paper with the iris measurements
- [mwaskom/seaborn-data](https://github.com/mwaskom/seaborn-data): the repository with the file `iris.csv`

Next: [Figure design principles](principles.md) turns a default plot into a figure for a report.
