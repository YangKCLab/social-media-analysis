# Introduction

This course is about building social media data science pipelines.
These are systems that collect social media data continuously, store it in a form you can query, measure what happens on the platforms, test hypotheses about it, and present the results.
Each of the four words in the title carries part of the course:

- **Social media**: the platforms, their data models, and their rules
- **Data**: what is recorded, what is missing, and how to keep it
- **Data science**: measurements, statistics, visualization, and network analysis
- **Pipelines**: the parts run together, on a schedule, and survive restarts

## Learning objectives

- Build a continuous data collection system for social media
- Manage the collected data so that it can be queried and shared
- Design and execute measurements on social media
- Model and analyze online behavior through social media data
- Create visualizations that help understand social media phenomena

## What social media are

Social media are hard to define, and the platforms differ more than the label suggests.
Our working definition is "I know it when I see it": a service where people post content, see what others post, and interact with it.
Some of the most used platforms in the United States, by the share of adults who say they ever use them (Pew Research Center, 2025):

| Platform | Share | Platform | Share |
|---|---|---|---|
| YouTube | 84% | Snapchat | 25% |
| Facebook | 71% | X (formerly Twitter) | 21% |
| Instagram | 50% | Threads | 8% |
| TikTok | 37% | Bluesky | 4% |
| WhatsApp | 32% | Truth Social | 3% |
| Reddit | 26% | | |

Source: [Pew Research Center, Social Media Fact Sheet](https://www.pewresearch.org/internet/fact-sheet/social-media/).

## Why social media are useful for data science

- There are many platforms, each with its own community and norms
- They are digital: most user behavior is recorded as data, including posts, likes, reposts, replies, social networks, and profiles
- The data is larger than a survey can reach
- Many platforms provide their data to the public through an API

## The pipeline

The course follows the stages of a pipeline, one topic each.

| Stage | Topic | What you learn |
|---|---|---|
| Collect | [Data Collection](../data-collection/index.md) | Query platform APIs, page through results, respect rate limits, choose a sampling strategy |
| Store | [Data Format and Management](../data-format-management/index.md) | Choose a data format and a schema, store raw and derived data, keep the collection running |
| Measure | [Measurements and Metrics](../measurements/index.md) | Turn posts and accounts into numbers that answer a question |
| Test | [Hypothesis Testing and Statistical Analysis](../stats/index.md) | Decide whether a difference is real, and how large it is |
| Show | [Visualization](../visualization/index.md) | Present the results so that a reader understands them |
| Connect | [Network Analysis](../network/index.md) | Represent who follows, replies to, or reposts whom, and analyze the structure |

## Reading research papers

Research on social media moves fast, and the best way to keep up is to read the papers.
The [research papers](../../papers.md) page lists readings by topic: datasets and collection, algorithms, inauthentic behaviors, ethics and data access, generative AI and social media, and social media for AI agents.
When the course is offered in person, students read the papers before class and discuss them during class.

## Course project

The best way to learn the material is to build a pipeline of your own.
The course project does exactly that, in three stages that build on each other: a data collection system that gathers social media data continuously, an exploratory analysis of the collected data, and a final stage that uses the data to answer research questions.
Each stage starts with a short plan of what to do, continues with the implementation, and ends with a write-up of what was found.
Students in the classroom version complete the project in small groups with feedback from the instructor; self-directed learners can follow the same three stages on their own, with a research question of their choice.
See the [project assignment](../../project.md) page for the details and the considerations at each stage.

## Other useful resources

- The [demos](../../demos/index.md) page holds interactive demos used in lectures
- The [project assignment](../../project.md) page describes the course project, which builds a pipeline in stages across the semester
- The [resources](../../resources.md) page lists libraries and tools for each stage
