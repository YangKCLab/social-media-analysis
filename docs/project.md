# Build Your Own Pipeline

The best way to learn the material on this site is to build a pipeline of your own.
A pipeline collects social media data continuously, stores the data, measures them, and uses the results to answer research questions.
This guide describes the stages of such a pipeline in order.
Each stage lists the questions to consider and links to the topic pages that teach the methods.
You can follow the guide on your own, with research questions of your choice.

## The stages

| Stage | What you produce | Topic pages |
|---|---|---|
| 1. Ask | A few research questions that social media data can answer | [Research Papers](papers.md) |
| 2. Collect | A collector that gathers posts from two or more platforms and keeps running | [Data Collection](topics/data-collection/index.md) |
| 3. Store | A format and a schema that you can query across platforms | [Data Format and Management](topics/data-format-management/index.md) |
| 4. Explore | Tables and figures that describe your data | [Measurements](topics/measurements/index.md), [Statistics](topics/stats/index.md), [Visualization](topics/visualization/index.md), [Network Analysis](topics/network/index.md) |
| 5. Classify | A classifier that labels your posts, checked against your own labels | [Measurements](topics/measurements/index.md) |
| 6. Answer | Answers to your research questions, with statistical tests | [Statistics](topics/stats/index.md), [Network Analysis](topics/network/index.md) |
| 7. Share | An interactive dashboard and a short demonstration | [Visualization](topics/visualization/index.md) |

Each stage uses the output of the stages before it.
If the collector stops, every later stage has less data to work with.
For this reason, start the collector early and check it often.

## Start with research questions

Write down a few research questions before you collect any data.
The questions decide which platforms you collect from, which data you keep, and which analyses you run.
Your questions will change as you learn about the data.
This is normal.

A good research question for a pipeline has three properties:

- The platforms make the data it needs available.
- It compares something, such as platforms, groups of accounts, topics, or periods of time.
- It needs data that keep arriving, not a single snapshot.

Read the papers under [Dataset and Collection](papers.md#dataset-and-collection) to see which questions other researchers asked and which data they used.
The section [Example project ideas](#example-project-ideas) at the end of this page lists more questions.

## Collect data from two or more platforms

Every other stage depends on the collector.
Without data, no other stage can run.
Collect from at least two platforms, so that you can compare them.
The [Data Collection](topics/data-collection/index.md) topic has notebooks for Bluesky, 4chan, and YouTube.

Before you build the collector, check three things:

- You can collect the data you plan to collect.
- There is enough data for meaningful measurements and analysis.
- New data keep arriving every day.

Here are the main decisions to make:

- **Research questions**: Let your research questions decide which data you collect and which fields you keep.
- **Collection methods**: Decide which API endpoints to call and which parameters to pass.
    Decide whether you need a sample, and how to keep the sample representative.
    See [Sampling Strategies](topics/data-collection/sampling-strategies.md).
- **Volume**: Estimate how many posts you will collect per day and how much disk space they need.
    Compare the estimate with the real numbers after the first week.
- **Robustness**: The collector runs for weeks or months.
    It must handle errors, rate limits, and restarts without losing data.
    See [Run It Continuously](topics/data-collection/run-it-continuously.md).
- **Ethics**: Learn the ethical issues of collecting social media data, and follow the rules of each platform.
    See [Research Considerations](topics/data-collection/research-considerations.md) and the papers under [Ethics and Data Access](papers.md#ethics-and-data-access).

When the collector runs, plot the number of posts that you collect each day, with one line per platform.
Look at this plot regularly.
A gap or a sudden drop in a line means that the collector stopped or that a platform changed something.

## Store the data

Decide how to store the data before the first post arrives.

- Keep the raw response from each API, so that you can compute new fields later.
- Record the time when your collector stored each post, in addition to the time when the post was created.
- Choose a format and a schema that let you query the data of all platforms together.

See [Data Format and Management](topics/data-format-management/index.md) and [Modeling Social Media Data](topics/data-format-management/social-media-databases.md).

## Explore the data

When the data arrive, explore them to understand what you have.
Exploration checks both the collection process and the data.
It tells you whether the data can answer your research questions.
It can also show patterns that you did not expect.

During exploration, you clean the data and decide which measurements to compute from them.
If the data cannot answer a research question, collect more data or revise the question.

Here are some questions to ask:

- Is the collection complete? Are there missing values or gaps in time?
- Are there outliers or anomalies in the data?
- What is the volume of the data, and how is it distributed over platforms, accounts, and time?
- What are the key characteristics of the data, such as temporal patterns, account types, and content types?
- How can you measure the quantities that your research questions ask about?
- Which visualizations help you understand the data?

Compare the platforms directly.
Where possible, put all platforms in the same figure on the same axes.
If you use one panel per platform, give every panel the same axis ranges.

These topics help at this stage:

- [Measurements and Metrics](topics/measurements/index.md) turns posts and accounts into numbers.
- [Hypothesis Testing and Statistical Analysis](topics/stats/index.md) describes distributions and summary statistics.
- [Visualization](topics/visualization/index.md) shows how to design a clear figure.
- [Network Analysis](topics/network/index.md) builds networks of who replies to or reposts whom.

## Run and validate a classifier

Many research questions need a label for each post, such as whether it is toxic or which topic it covers.
A classifier produces these labels for many posts.
It can be a toxicity scorer, or a large language model that performs a classification task that you define.
See [Classifiers and Toxicity](topics/measurements/classifiers.md) for the tools, and [Labeling Text with an LLM](topics/measurements/llm-labeling.md) for a classifier built from a prompt.

Follow these rules when you run a classifier:

- **Define what it measures.** Different tools define the same word differently.
    For example, one toxicity scorer counts any profanity as toxic, while another counts only attacks on a person.
- **Record the classifier.** Store the name and the version of the classifier with every label that it produces.
- **Sample at random.** If you have more posts than you can classify, classify a random sample.
    Do not take only the first posts of each day, or only the posts that match a keyword.
    Record what fraction of the posts you classified.
- **Keep up with the collector.** Classify the new posts every day with a scheduled job, so that the labels do not fall behind.
- **Watch the cost.** If a hosted service charges per request, estimate the cost per 1,000 posts before you start.
    Then compare the real cost with your estimate every week.

Every classifier makes mistakes.
You cannot trust its results until you know what its mistakes look like.
To validate the classifier against your own judgment, follow these steps:

1. Label at least 100 of your own posts by hand, without looking at the output of the classifier.
2. If the classifier returns a score, choose a cutoff that turns the score into a label.
3. Make a table of how often your labels and the labels of the classifier agree.
4. Read at least 20 of the posts where you and the classifier disagree.
5. Describe in a paragraph what kind of post the classifier gets wrong.

The paragraph in step 5 is the most important part.
An agreement rate alone does not tell you how the classifier fails.
If you switch to another classifier, validate the new one as well.
See [Validating a Measurement](topics/measurements/validation.md), and the papers under [Generative AI and Social Media](papers.md#generative-ai-and-social-media).

## Answer the research questions

After the exploration, you understand the data and its patterns.
Now finalize your research questions and answer them with the data.
For each research question, do the following:

- State the research question.
- State your hypothesis: what you expect to find, and why.
- Describe the method that you use to answer the question.
- Report the result, and say what it means for the question.

If a question compares groups, or claims a relationship between two things, test it with a statistical test.
Report the test and its p-value, and interpret the result.
A question that only describes the data does not need a test.
See [Hypothesis Testing](topics/stats/hypothesis-testing.md) and [Correlation](topics/stats/correlation.md).

### A negative control

A result can describe your data, or it can describe your pipeline.
A negative control helps you tell the two apart.
Build a synthetic set of posts that resembles your real data in shape but not in content.
Match the number of posts, the distribution over time, the post lengths, and the vocabulary.
Do not match the quantity that you measure.
Then run one of your analyses on both sets of posts and compare the results.
If the synthetic posts give a similar result, the result comes from your method and not from your data.
Report this finding.

### Write up the results

Document your findings in the form of a research paper.
A common structure has these sections: an abstract, an introduction, background and related work, a description of the data, the results, a discussion of implications and limitations, and references.
Cite the papers that you discuss and the tools that you rely on, such as your classifier.
Every reference must be a real source that you have read.

## Build an interactive dashboard

An interactive dashboard lets other people explore your data and your results.
It helps you communicate what you found.
A dashboard does not need to be complex.
It should let a reader change at least one parameter, such as the platform, the time range, or the cutoff of the classifier.
Include the output of your validated classifier as one of the analyses.

Here are some examples of interactive dashboards built on social media data:

- [CoVaxxy](https://osome.iu.edu/tools/covaxxy): a dashboard that shows the relationship between COVID-19 vaccine uptake and social media data.
- [DomainDemo](https://domaindemoexplorer.streamlit.app): a dashboard that shows the audience demographics of web domains, based on social media data.
- [IRL (In Real Life) Streaming Ecosystem Dashboard](https://alexmicael-irl-ecosystem-dashboard-app-wgmceg.streamlit.app): a dashboard about the ecosystem of in-real-life live streaming.
- [NBA social sentiment](https://nba-social-sentiment.streamlit.app): a dashboard that asks how the social media popularity of NBA players correlates with their season leader rankings.

The [Resources](resources.md#interactive-dashboards) page lists frameworks and libraries for interactive dashboards.

## Present your work

Prepare a short demonstration of the whole pipeline.
Show four parts:

- The collection system: the data sources, the collection process, and the system architecture.
- The exploration: the main tables and figures, and what you learned from them.
- The research questions: why you chose them, how you answered them, and the results.
- The live interactive dashboard.

Decide in advance what you will show for each part.
Rehearse the demonstration once with a timer.
You can use slides, a video, a live demo, or a combination.
Leave time for questions.

## Good habits

These habits make a pipeline easier to run, check, and share.
Keep them in every project.

- **A README**: Describe what the code does and how to run it.
    Every result in your write-up should come from code in the repository.
- **A check script**: Write a script, such as `check.sh`, that verifies the pipeline runs.
    For example, it can check that new posts arrived from each platform in the last hour, that the classifier labeled the posts of the previous day, and that the required files exist.
    Run it before you share or present results.
    A passing check shows that the pipeline runs, not that the results are correct.
- **A credits file**: In a file such as `CREDITS.md`, list the data sources, the libraries and tools, and any code that you reused, with links.
    If you work with other people, also say who did what.
- **A note on AI use**: In a file such as `AI_USE.md`, record each AI tool that you used, what you asked it, how you used the output, and how you checked the output.

!!! warning "You are responsible for every output of an AI tool"
    AI tools can write collection, analysis, and plotting code, and they can label posts.
    They also make mistakes, and the mistakes often look correct.
    Check every output that an AI tool gives you before you use it.
    Run the code and compare its numbers with the data.
    Read the posts that a language model labels.
    Check that every reference an AI tool suggests exists, because these tools sometimes invent papers.

## Example project ideas

Here are some example questions to start from:

- Are discussions about certain celebrities more toxic on some platforms than on others?
- How do discussions on different topics vary across platforms?
- How does the general sentiment toward a brand or product vary across platforms?
- Which types of content (text, images, videos) receive the most engagement on different platforms?
- How do user interaction patterns (replies, shares, likes) differ between platforms?
- How does the timing of a post affect its reach and engagement on different platforms?
- How do the communication strategies of influencers differ across platforms?
