# Color

Color can add information to a figure.
A poor choice of colors can mislead a reader, and some readers cannot tell the colors apart.
This page explains what a scientific color map is and how to check a color map in gray scale.
It also shows which class of color map fits which data, and how to find a color map with the Scicolor package.

The [Color Maps notebook](color-maps.ipynb) runs all the code on this page.
A comment after a line of code shows the result of that line.
The code uses these imports.
Scicolor is a package of color maps for scientific figures.
The part [Find a color map with Scicolor](#find-a-color-map-with-scicolor) shows how to install it and how to search it.

```python
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import scicolor
```

## What color does in a figure

Color can add one more column of the data to a figure.
In the [pair plot with color](figure-types.md#pair-plot-with-color), the color shows the species of each flower.

A color map turns numbers or groups into colors.
A poorly chosen color map can mislead a reader.

## Two common problems

- **Uneven steps.** In some color maps, the colors change fast in some parts of the value range and slowly in other parts. Equal steps in the data then do not look equal, so the color map distorts the data. Rainbow color maps such as `jet` have this problem.
- **Colors that some readers cannot tell apart.** People with a color-vision deficiency cannot read some color maps, such as the ones that go from red to green.

The example draws the same data with two color maps.
The first code computes a smooth surface with two peaks on a grid of 300 by 300 points.

```python
x = np.linspace(-3, 3, 300)
X, Y = np.meshgrid(x, x)
Z = np.exp(-((X + 1) ** 2 + Y ** 2)) + 0.6 * np.exp(-((X - 1.2) ** 2 + (Y - 0.5) ** 2) / 2)
Z.shape    # (300, 300)
```

The next code draws the surface twice with `imshow`: with the color map `jet` and with the color map `batlow`.
Scicolor does not have `jet`, so the code takes it from Matplotlib by its name.

```python
fig, axes = plt.subplots(1, 2, figsize=(9, 3.6), layout="constrained")
for ax, name, cmap in zip(axes, ["jet", "batlow"], ["jet", scicolor.get_cmap("batlow")]):
    image = ax.imshow(Z, cmap=cmap, origin="lower", extent=(-3, 3, -3, 3))
    ax.set_title(name)
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    fig.colorbar(image, ax=ax, label="Value")
plt.show()
```

![Two panels show the same surface with two peaks, each with a color bar from 0 to 1. The left panel uses the color map jet: the surface goes from dark blue through a bright cyan band, green, and a bright yellow band to dark red. The right panel uses the color map batlow: the surface goes evenly from dark blue through green and orange to light pink, with no band.](figures/jet-and-batlow.png){ width="720" }

Both panels show the same numbers.
The surface is smooth: it has no steps and no edges.

- With `jet`, the panel shows bright bands in cyan and in yellow around the peaks. The bands look like edges in the data, and the data has none.
- With `batlow`, the color changes evenly from the low values to the high values, and the panel shows no band.

Figure 1 of [Crameri, Shephard, and Heron (2020)](https://doi.org/10.1038/s41467-020-19160-7) shows three pictures in their original colors, with `jet`, and with `batlow`.

## What a scientific color map is

A scientific color map has two properties.

- Equal steps in the data look like equal steps in color. A color map with this property is called perceptually uniform.
- The color map stays readable for people with a color-vision deficiency.

`batlow`, `viridis`, and `cividis` are scientific color maps.
`jet` is not.

## Check a color map in gray scale

A color map that gets steadily lighter keeps the order of the values when the figure is printed in black and white.
Such a color map is also easier to read for people with a color-vision deficiency, because they can still see the lightness.

The function below turns each color of a color map into a gray value between 0 (black) and 1 (white).
It uses a weighted sum of red, green, and blue.
Green has the largest weight, because the eye is most sensitive to green.

```python
def to_gray(cmap):
    """Return the gray values of 256 colors of a color map, from 0 (black) to 1 (white)."""
    rgb = cmap(np.linspace(0, 1, 256))[:, :3]
    return rgb @ [0.2126, 0.7152, 0.0722]


cmaps = {
    "viridis": scicolor.get_cmap("viridis"),
    "cividis": scicolor.get_cmap("cividis"),
    "batlow": scicolor.get_cmap("batlow"),
    "jet": matplotlib.colormaps["jet"],
}
for name, cmap in cmaps.items():
    gray = to_gray(cmap)
    print(f"{name:8} first {gray[0]:.2f}   highest {gray.max():.2f}   last {gray[-1]:.2f}")
```

The code prints the gray value of the first color, the highest gray value, and the gray value of the last color.

```text
viridis  first 0.08   highest 0.87   last 0.87
cividis  first 0.12   highest 0.88   last 0.88
batlow   first 0.10   highest 0.85   last 0.85
jet      first 0.04   highest 0.92   last 0.11
```

For `viridis`, `cividis`, and `batlow`, the last color is the lightest one.
For `jet`, the lightest color is in the middle, and the last color is almost as dark as the first.

The next code draws each color map as a strip, next to the same strip in gray scale.

```python
gradient = np.linspace(0, 1, 256).reshape(1, -1)

fig, axes = plt.subplots(len(cmaps), 2, figsize=(8, 2.6), layout="constrained")
for row, (name, cmap) in zip(axes, cmaps.items()):
    row[0].imshow(gradient, aspect="auto", cmap=cmap)
    row[1].imshow(to_gray(cmap).reshape(1, -1), aspect="auto", cmap="gray", vmin=0, vmax=1)
    row[0].set_ylabel(name, rotation=0, ha="right", va="center")
for ax in axes.flat:
    ax.set_xticks([])
    ax.set_yticks([])
axes[0, 0].set_title("In color")
axes[0, 1].set_title("In gray scale")
plt.show()
```

![Four rows of two strips. The rows are the color maps viridis, cividis, batlow, and jet. The left strip of each row shows the color map in color, and the right strip shows it in gray scale. The gray strips of viridis, cividis, and batlow go from dark on the left to light on the right. The gray strip of jet is dark at both ends and light in the middle.](figures/color-maps-gray-scale.png){ width="680" }

The gray strips of `viridis`, `cividis`, and `batlow` go from dark to light in one direction.
A reader of a black-and-white print can still tell low values from high values.

The gray strip of `jet` is dark at both ends and light in the middle.
In a black-and-white print, the lowest and the highest values look almost the same.

Figure 2 of [Crameri, Shephard, and Heron (2020)](https://doi.org/10.1038/s41467-020-19160-7) shows `jet` and several perceptually uniform color maps as people with three types of color-vision deficiency see them.

To check a finished figure, use [Color Oracle](https://colororacle.org/), a free tool that shows the whole screen as a person with a color-vision deficiency sees it.

## Classes and types of color maps

The class of a color map says how its colors change.

- **Sequential**: the colors go from light to dark, or from dark to light. Use it for values from low to high, such as a count.
- **Diverging**: two sets of colors go in opposite directions from a neutral middle. Use it for values in two directions from a central value, such as a score from negative to positive.
- **Multi-sequential**: two sequential color maps are joined at a break. Use it when the values on the two sides of a threshold mean different things, such as heights below and above sea level.
- **Cyclic**: the last color is the same as the first color. Use it for values on a circle, such as the hour of the day.

The type of a color map says how many colors it has.

- **Continuous**: the colors change smoothly.
- **Discrete**: a few colors in a fixed order, for values in a few bins.
- **Categorical**: colors with no order, for groups such as platforms.

The next code draws one example of each.
It uses `gradient` from the code above.
Scicolor has no cyclic color map, so the code takes `twilight` from Matplotlib.
The categorical color map `Archambault` has seven colors.

```python
examples = {
    "sequential: batlow": scicolor.get_cmap("batlow"),
    "diverging: vik": scicolor.get_cmap("vik"),
    "multi-sequential: oleron": scicolor.get_cmap("oleron"),
    "cyclic: twilight": matplotlib.colormaps["twilight"],
    "continuous: batlow": scicolor.get_cmap("batlow"),
    "discrete: batlow10": scicolor.get_cmap("batlow10"),
    "categorical: Archambault": scicolor.get_cmap("Archambault"),
}

fig, axes = plt.subplots(len(examples), 1, figsize=(8, 3.6), layout="constrained")
for ax, (label, cmap) in zip(axes, examples.items()):
    ax.imshow(gradient, aspect="auto", cmap=cmap)
    ax.set_ylabel(label, rotation=0, ha="right", va="center")
    ax.set_xticks([])
    ax.set_yticks([])
plt.show()
```

![Seven color strips, each with a label. Sequential, batlow: from dark blue to light pink. Diverging, vik: from dark blue through white to dark red. Multi-sequential, oleron: shades of blue on the left half, and green to light brown on the right half, with a break in the middle. Cyclic, twilight: light at both ends and dark purple in the middle. Continuous, batlow: a smooth strip. Discrete, batlow10: ten blocks of color in the order of batlow. Categorical, Archambault: seven blocks of color, which are light blue, dark purple, muted purple, pink, red, orange, and yellow.](figures/color-map-classes.png){ width="680" }

The first four strips show the four classes, and the last three strips show the three types.

- `vik` goes from dark blue through white to dark red.
- `oleron` has a break in the middle: shades of blue on one side, and green and brown on the other side.
- `twilight` starts and ends with the same light color.
- `batlow10` has ten colors of `batlow` in the same order.
- `Archambault` has seven colors with no order: light blue, dark purple, muted purple, pink, red, orange, and yellow.

## Which class fits your data

| Your data | Class or type | Example |
|-----------|---------------|---------|
| Groups with no order, such as platforms | Categorical | `Archambault` |
| Values from low to high, such as a count or a score | Sequential | `batlow` |
| Values in two directions from a central value, such as political leaning from left to right | Diverging | `vik` |
| Values on a circle, such as the hour of the day | Cyclic | `twilight` of Matplotlib |

Figure 6 of [Crameri, Shephard, and Heron (2020)](https://doi.org/10.1038/s41467-020-19160-7) is a guide that leads from the properties of the data to a class and a type.

## Find a color map with Scicolor

[Scicolor](https://pypi.org/project/scicolor/) is a Python package with a collection of color maps for scientific figures.
It returns each color map as a Matplotlib color map, so every Matplotlib and seaborn function can use it.
Install it with `pip install scicolor`.

`scicolor.list_cmaps()` returns a table of all color maps of the package.
With an argument, it returns only the rows that match.

```python
scicolor.list_cmaps(color_blind_friendly=True)    # a table with 67 rows
```

67 of the 79 color maps of the package are color-blind friendly.
The other filters of `list_cmaps` are `cm_class`, `cm_type`, and `perceptually_uniform`.
The filters can be combined: `scicolor.list_cmaps(cm_class="diverging", cm_type="continuous")` returns 6 color maps.

`scicolor.get_cmap` returns one color map by its name.
A notebook shows a color map as a strip of its colors.

```python
cmap = scicolor.get_cmap("batlow")
cmap
```

Pass the color map to a plot function with the `cmap` argument, as the call `ax.imshow(Z, cmap=cmap, ...)` does in the code above.
If the name does not exist, `get_cmap` prints a message and returns `None`.

Scicolor also has [a color picker in the browser](https://yang3kc.github.io/scicolor/).

## Contrast between text and background

Text in a figure needs enough contrast with its background.

- The contrast ratio of two colors goes from 1:1 (the same color) to 21:1 (black on white).
- The accessibility guideline WCAG asks for a contrast ratio of at least 4.5:1 for normal text (level AA).
- For example, blue (`#0000FF`) on white has a contrast ratio of 8.59:1.

The [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) computes the contrast ratio of two colors.

## Links

- [Color Maps notebook](color-maps.ipynb): all the code on this page
- Crameri, Shephard, and Heron (2020), [The misuse of colour in science communication](https://doi.org/10.1038/s41467-020-19160-7): the paper on scientific color maps
- [Scicolor on PyPI](https://pypi.org/project/scicolor/) and the [Scicolor color picker](https://yang3kc.github.io/scicolor/)
- The Matplotlib guide on [choosing color maps](https://matplotlib.org/stable/users/explain/colors/colormaps.html)
- [Color Oracle](https://colororacle.org/): a tool that simulates color-vision deficiency on the whole screen
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)

Next: [Plotting tools](plotting-tools.md) covers Matplotlib, seaborn, Plotly, and Streamlit.
