# Measurements and Metrics

In this module, you will learn how to measure the content of social media posts: the text, the images, the audio, the video, and the links.
For text, you will learn how to count words, how to compare the words of two groups of posts, how to score a post for a concept such as sentiment or toxicity, and how to find the topics of a collection.
You will also learn how to validate a measurement against labels that you assign by hand.

An analysis needs numbers.
A measurement turns a post, or a group of posts, into numbers that you can count and compare.
Most of the pages are about text.
The text methods go from simple to complex: word counts, dictionaries, word vectors, and trained models.
One page covers images, audio, and video, and two pages cover the URLs in posts and the websites that they lead to.
Each of these pages says what a method measures, when to use it, and what its limits are.
The last page shows how to check any of these measurements against hand labels before you rely on it.

## Learning objectives

- Tokenize social media posts, count words, and reweight the counts with TF-IDF
- Find the words that separate two groups of posts with the log-odds ratio
- Use pre-trained word vectors to find related words, compare posts by meaning, and place words on a scale
- Score posts with a dictionary and with a pre-trained classifier, and state what each tool measures
- Find the topics of a collection of posts with LDA and BERTopic
- Describe the options for images, audio, and video, and when to turn them into text first
- Extract, expand, and clean the URLs in posts, and describe their domains with public domain lists
- Validate a measurement against hand labels before you rely on it

## Pages

| Page | What it covers |
|------|----------------|
| [Bag of words and TF-IDF](bag-of-words.md) | Tokenizers for social media posts; lowercasing and stopwords; word counts and a bar plot of the top words; TF-IDF by hand and with scikit-learn |
| [Comparing corpora](comparing-corpora.md) | The words that one group of posts uses more than another group: the difference of frequencies, the log-odds ratio, and the log-odds ratio with a prior; word shift graphs |
| [Word embedding](word-embedding.md) | Words as vectors; pre-trained GloVe vectors with Gensim; related words, calculations on vectors, the similarity of two texts, and words on a scale; hashtag embeddings |
| [Dictionary-based analysis](dictionaries.md) | Sentiment with VADER, and where VADER fails; moral foundations with the eMFD; vec-tionaries; what a dictionary measures |
| [Classifiers and toxicity](classifiers.md) | A pre-trained sentiment classifier from Hugging Face; toxicity scoring with Detoxify; the cutoff that turns a score into a label; hosted scorers that need a key |
| [Topic modeling](topic-modeling.md) | LDA with Gensim and BERTopic on the same tweets; how to read the topics; a comparison of the two results; TopicGPT |
| [Multimodal content](multimodal.md) | The formats and features of visual content; four approaches to images; image embedding, and models that place text and images in one space; vision language models; turning the content into text first; transcription of audio; video. An overview with links and no code |
| [Processing URLs](urls.md) | The four steps that prepare the links in posts: extracting URLs from text, expanding shortened links, removing query parameters, and extracting the domain; counting domains; URL-level analysis |
| [Domain-level analysis](domains.md) | The type of a website; a public list of news domains; credibility ratings of news domains; the audience metrics of DomainDemo; the join of a domain table to a public list; the cutoff that turns a score into a category |
| [Validating a measurement](validation.md) | The hand labels; the agreement table and the percentage that agree; precision, recall, and the F1 score for each label; how to read the disagreements; cutoffs, the ROC curve, and the AUC score; when to validate again |

## Notebooks

The five notebooks run in Colab without setup.
Four of them need one or two packages that Colab does not have, and their first code cell installs these packages there.
They hold all the code of the six text pages and of the two URL pages.
Three notebooks serve two pages each: Word counts serves the first two pages, Scoring text serves the dictionary page and the classifier page, and URL processing serves the page on URLs and the page on domains.
The multimodal page has no code.
The validation page has short code blocks and no notebook: the code runs on one small table that is written by hand on the page.

The four text notebooks download TweetTopic from Hugging Face on first run.
TweetTopic is a public research dataset of 6,090 English tweets with topic labels, and the file is 0.9 MB.
Three of them also download a model on first use: Word vectors downloads about 130 MB, Topic models downloads about 90 MB, and Scoring text downloads two models of about 500 MB each.

The URL processing notebook downloads four data files from GitHub on first run, 5.3 MB in total: one day of Reddit posts about the 2022 U.S. midterm elections, a list of U.S. news domains, and two files of audience metrics.
It downloads no model.
Its section on shortened links sends 7 requests to live websites, so the output of that section can change from one run to the next.

No notebook needs a GPU.

| Notebook | Sections | |
|----------|----------|---|
| [Word counts](word-counts.ipynb) | [Tokenize a post](word-counts.ipynb#tokenize-a-post), [Normalize and remove stopwords](word-counts.ipynb#normalize-and-remove-stopwords), [Tokens in large language models](word-counts.ipynb#tokens-in-large-language-models), [Count words](word-counts.ipynb#count-words), [Plot the top words](word-counts.ipynb#plot-the-top-words), [TF-IDF by hand](word-counts.ipynb#tf-idf-by-hand), [TF-IDF with scikit-learn](word-counts.ipynb#tf-idf-with-scikit-learn), [Compare two corpora](word-counts.ipynb#compare-two-corpora), [Log-odds ratio with a prior](word-counts.ipynb#log-odds-ratio-with-a-prior) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/measurements/word-counts.ipynb){ .colab-button } |
| [Word vectors](word-vectors.ipynb) | [Load pre-trained vectors](word-vectors.ipynb#load-pre-trained-vectors), [Find related words](word-vectors.ipynb#find-related-words), [Calculations on vectors](word-vectors.ipynb#calculations-on-vectors), [Compare texts by meaning](word-vectors.ipynb#compare-texts-by-meaning), [Place words on a scale](word-vectors.ipynb#place-words-on-a-scale) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/measurements/word-vectors.ipynb){ .colab-button } |
| [Scoring text](scoring-text.ipynb) | [Sentiment with VADER](scoring-text.ipynb#sentiment-with-vader), [Score a table of posts](scoring-text.ipynb#score-a-table-of-posts), [Moral foundations with eMFD](scoring-text.ipynb#moral-foundations-with-emfd), [A classifier from Hugging Face](scoring-text.ipynb#a-classifier-from-hugging-face), [Toxicity with Detoxify](scoring-text.ipynb#toxicity-with-detoxify), [From scores to labels](scoring-text.ipynb#from-scores-to-labels), [Hosted scorers that need a key](scoring-text.ipynb#hosted-scorers-that-need-a-key) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/measurements/scoring-text.ipynb){ .colab-button } |
| [Topic models](topic-models.ipynb) | [Prepare the documents](topic-models.ipynb#prepare-the-documents), [LDA with Gensim](topic-models.ipynb#lda-with-gensim), [Read the topics](topic-models.ipynb#read-the-topics), [BERTopic](topic-models.ipynb#bertopic), [Compare the two results](topic-models.ipynb#compare-the-two-results) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/measurements/topic-models.ipynb){ .colab-button } |
| [URL processing](url-processing.ipynb) | [Extract URLs from posts](url-processing.ipynb#extract-urls-from-posts), [Expand shortened links](url-processing.ipynb#expand-shortened-links), [Remove query parameters](url-processing.ipynb#remove-query-parameters), [Extract the domain](url-processing.ipynb#extract-the-domain), [Count domains](url-processing.ipynb#count-domains), [Join to a domain list](url-processing.ipynb#join-to-a-domain-list), [From scores to categories](url-processing.ipynb#from-scores-to-categories) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/measurements/url-processing.ipynb){ .colab-button } |

The last section of the Scoring text notebook calls two hosted scorers.
Its cells run only when you set an API key, and the other sections need no key.

## Choosing a text method

The table compares five approaches to text.
The first four have a page in this module.

| Approach | What it looks at | What you need | Main limit |
|----------|------------------|---------------|------------|
| [Bag of words](bag-of-words.md) | Word counts | Only your own posts | No meaning and no word order |
| [Dictionary](dictionaries.md) | Word counts and word scores | A dictionary for your concept | [Misses sarcasm and shifts in meaning](dictionaries.md#what-a-dictionary-measures) |
| [Word embedding](word-embedding.md) | One vector per word | A pre-trained embedding | One vector per word, no word order |
| [Deep learning classifier](classifiers.md) | The whole text, in order | A trained model, or labeled data | Only the labels it was trained on |
| [Large language model (LLM)](#large-language-models) | The text and your instructions | A prompt, and a budget | Cost, speed, and models that change |

Each approach understands more of the text than the one above it, and it costs more to run.

Topic modeling follows the same order.
LDA works on word counts, BERTopic works on document embeddings, and TopicGPT uses a large language model.
The [topic modeling](topic-modeling.md) page runs the first two on the same tweets and [compares the two results](topic-modeling.md#comparing-the-two-results).

Start with the simplest approach that can answer your question.
Then [validate the approach that you choose](validation.md): score a sample of your own posts, label the same posts by hand, and compare the two.
A dictionary and a classifier return a score, and a score is not a label.
The section [From scores to labels](classifiers.md#from-scores-to-labels) shows how the choice of a cutoff changes a result, and the section [Scores and cutoffs](validation.md#scores-and-cutoffs) shows how to check a cutoff against hand labels.

### Large language models

A large language model (LLM) can also label text.
You write the labels and their definitions in a prompt, and the model returns a label for each post.
This module does not cover that method.
The tutorial [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/) covers it: API keys, the first call, structured output, parallel requests, batch processing, other providers, and decision models.
Check the labels of an LLM against hand labels in the same way as the labels of any other classifier; see [Validating a measurement](validation.md).

## Related

- [Data collection](../data-collection/index.md), whose notebooks collect the posts that these methods measure
- [Data format and management](../data-format-management/index.md), whose tabular data notebook covers the pandas tables that these notebooks use
- [Hypothesis testing and statistical analysis](../stats/index.md), whose methods describe and compare the scores that this module produces
