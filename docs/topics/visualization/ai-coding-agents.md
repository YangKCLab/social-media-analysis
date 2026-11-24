# Plotting with AI Coding Agents

An AI coding agent can write the plotting code for a figure.
Claude Code, Codex, Cursor, and GitHub Copilot are examples of such agents.
This page shows what an agent does without guidance, and how a skill changes the result.
It ends with the checks that you still need to do yourself.

## What an agent does without guidance

You can ask an agent for a figure in plain words.
The agent then writes Matplotlib or seaborn code and runs it.
Without guidance, the agent keeps most of the default settings of the library.
The figures often have these features:

- a title inside the figure
- a border on all four sides of the plot
- the default colors of the library
- small fonts

The page [Figure design principles](principles.md) explains why a figure for a report changes each of these.

## What a skill is

A skill is a markdown file of instructions that the agent reads before it writes code.
The file is named `SKILL.md`, and it is in a folder with the name of the skill.
The folder can also hold reference documents and data files that the instructions point to.

The top of `SKILL.md` has a short description of when the skill applies.
When your request matches this description, the agent reads the instructions and follows them.
So you do not need to repeat the rules in every request.

Many agents can read skills in this format, for example Claude Code, Cursor, and GitHub Copilot.
The Claude Code documentation explains skills on the page [Extend Claude with skills](https://code.claude.com/docs/en/skills).

## Two skills for figures

[YangLabKit](https://github.com/YangKCLab/yanglabkit) is a set of skills from the Yang Lab.
Two of its skills are for figures.

| Skill | What it does |
|-------|--------------|
| [`yanglabkit-figures`](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-figures/SKILL.md) | Styles Matplotlib and seaborn figures: the figure size, the fonts, the borders and the grid for each plot type, legends without a frame, percentage axes, gray dashed reference lines, and the export as a vector PDF file for a paper. It leaves every choice of color to `yanglabkit-scicolor`. |
| [`yanglabkit-scicolor`](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-scicolor/SKILL.md) | Picks a color palette for a figure. It first chooses the [class of the palette](color.md#classes-and-types-of-color-maps): categorical, sequential, diverging, or multi-sequential. Then it returns the hex codes of a palette from the [Scicolor](color.md#find-a-color-map-with-scicolor) collection. By default, the palette is color-blind friendly. |

`yanglabkit-scicolor` chooses the class with the method of [Crameri, Shephard, and Heron (2020)](https://doi.org/10.1038/s41467-020-19160-7).
The page [Color](color.md) uses the same paper.

Both skills refuse rainbow color maps such as `jet`.
`yanglabkit-figures` also refuses pie charts.
Both skills contain only text and data files, so they need no extra Python package.

## Install the skills

In Claude Code, type these two commands in a session, one after the other.
The first command adds the YangLabKit repository as a source of plugins.
The second command installs the YangLabKit plugin.

```text
/plugin marketplace add YangKCLab/yanglabkit
/plugin install yanglabkit@yanglabkit
```

The plugin installs all skills of YangLabKit.
Besides the two figure skills, it has a skill for writing and a skill that runs the other skills without your input.
This page uses only the two figure skills.

For another agent, clone the repository.
Then point the agent to the file `skills/<name>/SKILL.md` of each skill that you want, for example `skills/yanglabkit-figures/SKILL.md`.
The [README of YangLabKit](https://github.com/YangKCLab/yanglabkit#installation) shows the commands for Cursor and other agents.

## The same agent and data, with and without the skills

The YangLabKit repository has a [figure comparison task](https://github.com/YangKCLab/yanglabkit/tree/main/tasks/public-data-figure-comparison).
In this task, an agent gets six small public datasets and makes six figures: a line chart, a bar chart, a box plot, a heatmap, a scatter plot, and a histogram.
Every agent gets the same data.

The two images below come from Claude Code with the model Claude Opus 4.8.
The first image was made without the skills, and the second image was made with the two figure skills.
Each image is one run, so another run of the same agent can give different figures.
The gray name above each panel is the file name of the figure.
The comparison task added it, and it is not part of the figure.

![Six figures made by an AI coding agent without the skills: a line chart of temperature anomalies, a horizontal bar chart of the urban share of population by region, a box plot of penguin body mass, a heatmap of correlations between wine measurements, a scatter plot of fuel economy against vehicle weight, and a histogram of earthquake magnitudes. Each figure has a title above the plot and a border on all four sides. The lines, bars, boxes, and points have the default blue, orange, and green colors. The text of the bar chart and of the heatmap is very small.](figures/agent-figure-without-skills.png){ width="800" }

Without the skills, every figure has a title inside the figure.
Every plot has a border on all four sides.
The lines, bars, boxes, and points have the default colors of Matplotlib and seaborn.
The text of the bar chart and of the heatmap is small.

![The same six figures made with the two skills. No figure has a title, and most plots have no border on the top and on the right. The fonts are larger, and the long region names of the bar chart are wrapped onto two or three lines. The bar chart and the histogram show percent signs on the axis. The line chart has a gray dashed line at zero, and each of its three lines has its own color, marker, and line style. The scatter plot uses a circle, a square, and a triangle for the three groups. The heatmap goes from dark blue through white to dark red and has a number in each cell.](figures/agent-figure-with-skills.png){ width="800" }

With the skills, no figure has a title, and most plots have no border on the top and on the right.
The fonts are larger, and the long region names of the bar chart are wrapped onto two or three lines.
The bar chart and the histogram show percent signs on the axis.
The line chart has a gray dashed line at zero.

The colors come from color-blind friendly palettes.
The lines, bars, boxes, and points use the Okabe–Ito palette, and the heatmap uses the diverging color map `vik`.
Each line of the line chart also has its own marker and line style.
Each group of the scatter plot has its own marker.
So the reader can tell the lines and the groups apart without the colors.

## What the skills changed

Each change in the second image follows one of the design principles of this module.

| Change in the figures with the skills | Design principle |
|---------------------------------------|------------------|
| No title inside the figure | [Always label your figures](principles.md#always-label-your-figures): the caption of the report describes the figure, so a title would repeat it |
| No border on the top and on the right; legends without a frame | [Keep it simple](principles.md#keep-it-simple) |
| Larger fonts; long labels of the bar chart wrapped onto more lines | [Make the fonts readable](principles.md#make-the-fonts-readable) |
| Color-blind friendly colors; a different marker and line style for each line | [Choose colors that every reader can tell apart](principles.md#choose-colors-that-every-reader-can-tell-apart), and the page [Color](color.md) |

## What you still check yourself

A skill is a list of rules for the agent.
It does not replace your own reading of the figure.
The figures that were made with the skills still have problems:

- The legend of the line chart is too small to read.
- The numbers in the cells of the heatmap are too small to read.
- The font size changes from one figure to the next.

Before a figure goes into your report, do two things.

1. Check the figure against the [five principles](principles.md#the-principles) and against the advice on the page [Color](color.md).
2. Export the figure as a vector file, such as a PDF file. The section [Use vector or high-resolution files](principles.md#use-vector-or-high-resolution-files) explains why. The comparison task asked for PNG files, so the figures on this page are PNG files.

## Links

- [YangLabKit](https://github.com/YangKCLab/yanglabkit): the repository with the skills and the installation commands
- [`yanglabkit-figures`](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-figures/SKILL.md) and its [figure conventions](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-figures/reference/figure-conventions.md)
- [`yanglabkit-scicolor`](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-scicolor/SKILL.md) and its [selection guide](https://github.com/YangKCLab/yanglabkit/blob/main/skills/yanglabkit-scicolor/reference/selection-guide.md)
- [The figure comparison task](https://github.com/YangKCLab/yanglabkit/tree/main/tasks/public-data-figure-comparison): the data, the instructions to the agents, and the figures of every run
- The Claude Code documentation on [skills](https://code.claude.com/docs/en/skills) and on [installing plugins](https://code.claude.com/docs/en/plugins/install)
- Okabe and Ito, [Color Universal Design](https://jfly.uni-koeln.de/color/): the source of the Okabe–Ito palette
- Crameri, Shephard, and Heron (2020), [The misuse of colour in science communication](https://doi.org/10.1038/s41467-020-19160-7): the paper on scientific color maps
