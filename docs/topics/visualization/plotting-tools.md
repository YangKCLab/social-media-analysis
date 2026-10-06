# Plotting tools

Python has several tools for figures, and each one has its own use.
This page covers four of them: Matplotlib for any static figure, seaborn for common statistical figures, Plotly for interactive figures, and Streamlit for a web page with controls and figures.

The [Seaborn and Plotly notebook](seaborn-and-plotly.ipynb) runs the seaborn code and the Plotly code on this page.
The Streamlit script is not in the notebook, because it runs as a program on your own computer.
A comment after a line of code shows the result of that line.
The seaborn code and the Plotly code use these imports.

```python
import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.express as px
import seaborn as sns
```

## Matplotlib

[Matplotlib](https://matplotlib.org/) is the basic plotting library of Python.
It has almost every figure type, and other tools, such as seaborn, are built on it.
The [Matplotlib gallery](https://matplotlib.org/stable/gallery/index.html) shows many examples, each with its code.

Use Matplotlib when you need control over the details of a figure.
You can change almost every part of a Matplotlib figure.
The worked example on the page [Figure design principles](principles.md) changes the labels, the borders, the legend, the size, the font size, and the colors of one plot.

A figure that is saved as a PDF or SVG file can be opened in a vector editor, such as Inkscape or Adobe Illustrator, and finished there.
For an example, see Figure 5 of [Yang et al. (2021)](https://arxiv.org/abs/2012.09353), which was drawn with Matplotlib and finished in a vector editor.

Extensions add more figure types to Matplotlib.
For example, [python-ternary](https://github.com/marcharper/python-ternary) draws a ternary plot, which shows three shares that add up to 100%.

## Seaborn

[Seaborn](https://seaborn.pydata.org/) is built on Matplotlib.
It makes common statistical figures with one call.
For some changes to a seaborn figure, you still need Matplotlib calls.

Use seaborn when one of its figure types fits your data.
The [pair plot](figure-types.md#pair-plot) on the page Figure types is a seaborn figure.
The [seaborn gallery](https://seaborn.pydata.org/examples/index.html) shows more figure types, each with its code.
The two examples below come from this gallery.

### Joint plot

A joint plot shows two numbers together in the middle, and the histogram of each number on the sides.
The example is [the joint plot with hexagons](https://seaborn.pydata.org/examples/hexbin_marginals.html) of the seaborn gallery.
The data is 1,000 pairs of random numbers.

- `sns.set_theme(style="ticks")` changes the look of every later figure: the fonts, the colors, and the axes.
- `kind="hex"` draws the middle as a grid of hexagons, and a darker hexagon holds more points.

```python
sns.set_theme(style="ticks")

rs = np.random.RandomState(11)
x = rs.gamma(2, size=1000)
y = -.5 * x + rs.normal(size=1000)

sns.jointplot(x=x, y=y, kind="hex", color="#4CB391")
plt.show()
```

![A joint plot. The middle is a grid of green hexagons, with x from 0 to 8 and y from about -5 to 2.5. The darkest hexagons are near x = 1 and y = -1, and the hexagons get lighter toward the lower right. A histogram of x is above the middle, and a histogram of y is on its right side.](figures/seaborn-joint-plot.png){ width="440" }

The darkest hexagons are near `x` = 1 and `y` = -1, so most points are there.
The histogram on top shows that `x` is skewed to the right.
The middle shows that `y` falls when `x` rises.

One call draws the three parts and lines them up.
With Matplotlib alone, the same figure takes many more lines.

### Annotated heatmap

A heatmap shows a table of numbers as a grid of colored cells.
An annotated heatmap also writes the number into each cell.

The data is the number of international airline passengers in each month from 1949 to 1960, in thousands.
It is the airline data of Box, Jenkins, and Reinsel (1976), *Time Series Analysis, Forecasting and Control*.
The code downloads the file `flights.csv` from the repository of the seaborn example data, [mwaskom/seaborn-data](https://github.com/mwaskom/seaborn-data), at a fixed commit.

```python
FLIGHTS_URL = (
    "https://raw.githubusercontent.com/mwaskom/seaborn-data/"
    "71e2436a092d714350de0fc409ca8a8714e7e78f/flights.csv"
)
flights_long = pd.read_csv(FLIGHTS_URL)
# Keep the months in calendar order, as sns.load_dataset does.
months = flights_long["month"].str[:3]
flights_long["month"] = pd.Categorical(months, months.unique())
flights_long.head(3)
```

The table has 144 rows, one for each month of the 12 years.

| | year | month | passengers |
|---|---|---|---|
| 0 | 1949 | Jan | 112 |
| 1 | 1949 | Feb | 118 |
| 2 | 1949 | Mar | 132 |

The file has the full names of the months.
The last two lines before `head` shorten each name to three letters and store the calendar order of the months.
Without them, the next code sorts the months by the alphabet: April, August, December, and so on.

A heatmap needs a table with one row for each month and one column for each year.
`pivot` builds it.

```python
flights = flights_long.pivot(index="month", columns="year", values="passengers")
flights.shape    # (12, 12)
```

The example is [the annotated heatmap](https://seaborn.pydata.org/examples/spreadsheet_heatmap.html) of the seaborn gallery.

- `sns.set_theme()` sets the default theme of seaborn, which replaces the theme of the joint plot.
- `annot=True` writes the number into each cell, and `fmt="d"` writes it as a whole number.

```python
sns.set_theme()

f, ax = plt.subplots(figsize=(9, 6))
sns.heatmap(flights, annot=True, fmt="d", linewidths=.5, ax=ax)
plt.show()
```

![An annotated heatmap with 12 rows for the months from Jan to Dec and 12 columns for the years from 1949 to 1960. Each cell holds a number of passengers, from 104 to 622. The cells go from black on the left to light orange on the right, and the cells of July and August are the lightest in every column. A color bar on the right goes from about 100 to about 600.](figures/seaborn-heatmap.png){ width="640" }

Each cell is one month of one year, and a lighter cell has more passengers.
The numbers are in thousands: the cell of July 1960 says 622, which is 622,000 passengers.

The figure shows two patterns at once.

- The numbers grow from left to right, so more people fly each year.
- In every column the cells of July and August have the highest numbers, so most people fly in the summer.

## Plotly

[Plotly](https://plotly.com/python/) makes interactive figures for a web page.
The reader can move the mouse over a point to see its values, zoom into a part of the figure, and hide a group.

Use Plotly when the reader explores the figure on a screen.
A report on paper needs a static figure.

Plotly Express (`px`) is the short interface of Plotly: one call makes a figure from a table.
The example plots the iris data, which is four measurements of 150 flowers of three species.
`px.data.iris()` is the copy of the iris data inside Plotly.
Two of its 150 rows differ from the table on the page [Figure types](figure-types.md#data-with-many-columns).
`hover_data` adds two more columns to the box that appears when the mouse is over a point.

```python
iris = px.data.iris()
fig = px.scatter(
    iris, x="sepal_length", y="petal_length", color="species",
    hover_data=["sepal_width", "petal_width"],
)
fig.show()
```

The frame below holds the figure that this code makes.
The figure is interactive on this page.

<iframe src="../figures/iris-scatter.html" title="Interactive scatter plot of the iris data: petal length against sepal length, with one color for each species" width="100%" height="460" loading="lazy" style="border: 1px solid #bdbdbd;"></iframe>

If the frame is empty, open [the figure on its own page](figures/iris-scatter.html).
The figure loads the Plotly library from the web, so it needs a network connection.

Try three things.

- Move the mouse over a point. A box shows the species and the four measurements of that flower.
- Drag a rectangle to zoom in. A double click resets the view.
- Click a species in the legend to hide it. Click it again to show it.

`fig.write_html` saves the figure as a web page that keeps the interactions.
You can open the file in a browser, send it to someone, or embed it in a website.
The frame above shows the file that the next code writes.

```python
os.makedirs("output", exist_ok=True)
fig.write_html("output/iris-scatter.html", include_plotlyjs="cdn")
```

With `include_plotlyjs="cdn"`, the file is small, less than 20 KB, and it loads the Plotly library from the web when a reader opens it.
Without this argument, the file holds the whole library and has more than 4 MB.

For a static image, use the camera button in the toolbar of the figure.
It downloads the current view as a PNG file.

For a dashboard that was built with Plotly, see [CoVaxxy](https://osome.iu.edu/tools/covaxxy).
It shows online discussion and vaccine adoption for each US state on two maps.
The website is no longer updated.

## Streamlit

[Streamlit](https://streamlit.io/) is not a plotting library.
It turns a Python script into a web page with controls and figures.

Use Streamlit when you want to let other people explore your data in a browser and you do not want to write a website.

The script below is a small explorer of the iris data.
Its page has a title, two select boxes for the columns of the two axes, one box for the species, the number of selected flowers, and the Plotly scatter plot.

```python
import plotly.express as px
import streamlit as st

iris = px.data.iris()
columns = ["sepal_length", "sepal_width", "petal_length", "petal_width"]

st.title("Iris explorer")
x = st.selectbox("x-axis", columns, index=0)
y = st.selectbox("y-axis", columns, index=2)
species = st.multiselect(
    "Species", iris["species"].unique(), default=iris["species"].unique()
)

selected = iris[iris["species"].isin(species)]
st.write(f"{len(selected)} flowers")
st.plotly_chart(px.scatter(selected, x=x, y=y, color="species"))
```

To run the script:

1. Save it as `app.py`.
2. Install the two packages.
3. Start Streamlit in the folder of the script.

```bash
pip install streamlit plotly
streamlit run app.py
```

Streamlit starts a web server on your computer, prints its address, and opens the page in your browser.
The address is `http://localhost:8501`, unless that port is in use.
Stop the server with Ctrl+C in the terminal.

Streamlit runs the whole script again after every change of a control.
So when you remove a species from the box, the count and the figure change with it.

For an app that was built with Streamlit, see the [DomainDemo explorer](http://domaindemo.info).
It explores a dataset of the web domains that different demographic groups shared on Twitter.
The app stops when nobody has used it for some time, and its page then has a button that starts it again.

## Links

- [Seaborn and Plotly notebook](seaborn-and-plotly.ipynb): the seaborn code and the Plotly code on this page
- [Matplotlib](https://matplotlib.org/) and the [Matplotlib gallery](https://matplotlib.org/stable/gallery/index.html)
- [Seaborn](https://seaborn.pydata.org/) and the [seaborn gallery](https://seaborn.pydata.org/examples/index.html)
- [Plotly for Python](https://plotly.com/python/), [Plotly Express](https://plotly.com/python/plotly-express/), and the Plotly guide on [saving a figure as an HTML file](https://plotly.com/python/interactive-html-export/)
- [Streamlit](https://streamlit.io/), the [Streamlit documentation](https://docs.streamlit.io/), and its page on [`st.plotly_chart`](https://docs.streamlit.io/develop/api-reference/charts/st.plotly_chart)
