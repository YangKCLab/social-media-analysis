# Introduction

This course is about building social media data science pipelines: systems that collect social media data continuously, store it in a form you can query, measure what happens on the platforms, test hypotheses about it, and present the results.
Each of the four words in the title carries part of the course:

- **Social media**: the platforms, their data models, and their rules
- **Data**: what is recorded, what is missing, and how to keep it
- **Data science**: measurements, statistics, visualization, and networks
- **Pipelines**: the parts run together, on a schedule, and survive restarts

## Learning objectives

- Build a continuous data collection system for social media
- Manage the collected data so that it can be queried and shared
- Design and execute measurements on social media
- Model and analyze online behavior through social media data
- Create visualizations that help understand social media phenomena

## What social media are

Social media are hard to define, and the platforms differ more than the label suggests.
A working definition is "I know it when I see it": a service where people post content, see what others post, and interact with it.
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
- The data is large, much larger than a survey can reach
- Many platforms provide their data to the public through an API

## Why social media are hard for data science

- A scattered system is difficult to study: every platform has its own data model and rules
- Not everything is recorded. What people post is visible; what they see usually is not
- Large data is difficult to handle
- Public access has narrowed in recent years, though good options remain
- Not all the data you need is available, such as user demographics
- The data is noisy: fake accounts, fake content, spam

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

## Generative AI and social media

Generative AI is changing both the object of study and the tools.
On the platforms, AI-generated content, AI agents that post and reply, and social networks built for AI agents are new phenomena to measure.
In the analysis, large language models can classify posts, extract topics, and label sentiment, with the usual caution that their outputs must be verified.
The course covers both sides where they meet the pipeline stages.

## How to use this site

- Each topic page introduces the concepts and links to notebooks that open in Google Colab. See [Getting Started](../../getting-started.md) for local setup and credentials
- The [demos](../../demos/index.md) page holds interactive demos used in lectures
- The [project assignment](../../project.md) page describes the course project, which builds a pipeline in stages across the semester
- The [resources](../../resources.md) page lists libraries and tools for each stage
