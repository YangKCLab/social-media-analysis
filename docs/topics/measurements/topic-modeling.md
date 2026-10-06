# Topic modeling

A topic model finds the themes of a large collection of documents without labels.
It returns groups of words that occur together.
A person reads each group and decides what it is about.

This page runs two topic models on the same tweets.
LDA works on word counts, and BERTopic works on document embeddings.
The page also describes TopicGPT, which uses a large language model.

The [Topic Models notebook](topic-models.ipynb) runs all the code on this page.

## When to use it

Use a topic model to explore a collection when you do not know the categories in advance.
It needs a few thousand documents or more.

A topic model does not name its topics, and it does not say whether a topic is meaningful.
A person has to read the top words and the documents of each topic.
The topics also change when you change a setting or the random seed, so run a model more than once before you report its topics.
When you already know your categories, use a [classifier](classifiers.md).

## The example

The sample data of the notebook is TweetTopic ([Antypas et al., 2022](https://arxiv.org/abs/2209.09824)), a research dataset of 6,090 English tweets.
Annotators gave each tweet one or more labels from a list of 19 topics.
The topic models do not see these labels.
The notebook uses them only afterwards, to check the topics.
The labels are very uneven: the largest label, `news_&_social_concern`, is on 29.3% of the tweets, and the smallest labels are on about 100 tweets each.

A document here is one tweet, and the two models need the documents in two forms.
`docs` is the list of cleaned texts, for BERTopic.
`doc_tokens` is the list of token lists, for LDA.
In the code, `df` is the pandas table of the tweets, and `pd` is pandas.
`clean_text` and `tokenize` are the functions of the [bag of words page](bag-of-words.md#counting-words).

```python
docs = [clean_text(text) for text in df["text"]]
doc_tokens = [[token for token in tokenize(text) if len(token) > 2] for text in df["text"]]

lengths = pd.Series([len(tokens) for tokens in doc_tokens])
print("Median number of tokens in a document:", lengths.median())
```

A tweet is a very short document.
After the stopwords are removed, the median number of tokens in a tweet is 15.

## LDA

LDA (Latent Dirichlet Allocation) is a model of how the documents were written.
It assumes two things.

- Each topic is a mixture of words. A sports topic gives a high probability to `game` and `team`.
- Each document is a mixture of topics. One document can be 70% sports and 30% news.

The model sees only the word counts of the documents.
From these counts it estimates the words of each topic and the topics of each document.
It ignores the order of the words, so it is a bag-of-words method.

[Gensim](https://radimrehurek.com/gensim) needs two objects.
The `Dictionary` gives a number to each different word.
The corpus holds each document as a list of pairs of a word number and a count.

```python
from gensim.corpora import Dictionary

dictionary = Dictionary(doc_tokens)
print(len(dictionary), "different words")

dictionary.filter_extremes(no_below=5, no_above=0.5)
print(len(dictionary), "words after the filter")

corpus = [dictionary.doc2bow(tokens) for tokens in doc_tokens]
```

`filter_extremes` removes the words that are in fewer than 5 documents and the words that are in more than half of the documents.
In the notebook, the filter keeps 3,141 of the 22,567 different words.

You must choose the number of topics before the training.
The dataset has 19 labels, so the notebook asks for 20 topics.
With your own data you do not know this number.
The usual way is to try several values and to read the topics of each.

```python
from gensim.models import LdaModel

num_topics = 20

lda = LdaModel(corpus, id2word=dictionary, num_topics=num_topics, passes=10, random_state=42)
```

`passes=10` lets the model go through all documents 10 times, and `random_state` fixes the random start.
The training takes about 5 seconds on a recent laptop.

## Reading the LDA topics

A topic is a list of words with probabilities, and it has a number and no name.
`lda.show_topic(topic, topn=10)` returns the 10 words of one topic with the highest probability.

The model also gives each document a mixture of topics.
For a simple summary, give each tweet its main topic, which is the topic with the largest share.

```python
def main_topic(bow):
    topics = lda.get_document_topics(bow, minimum_probability=0)
    return max(topics, key=lambda pair: pair[1])


main_topics = [main_topic(bow) for bow in corpus]
df["lda_topic"] = [topic for topic, share in main_topics]
df["lda_share"] = [share for topic, share in main_topics]
```

In the notebook, the main topic has only 40% of a tweet on average.
For many tweets, the model is not sure which topic they belong to.

This dataset has labels, so one more check is possible.
For each topic, the notebook finds the label that is most common among its tweets, and the share of the tweets of the topic that have this label.
A topic that matches one label has a share near 1.
The function is `topics_against_labels`, in the section [Read the topics](topic-models.ipynb#read-the-topics).

The table shows 5 of the 20 topics.
Two words are left out of the second row, because each is the name of a person or of a music group.

| Top words | Tweets | Most common label | Share with that label |
|-----------|:------:|-------------------|:---------------------:|
| new, music, album, apple, check, listen, youtube, video, live, distrokid | 360 | `music` | 0.78 |
| via, news, give, follow, fresh, discover, online, daily | 497 | `news_&_social_concern` | 0.70 |
| win, team, teams, permission, game, group, football, favorite, project, two | 446 | `sports` | 0.59 |
| time, one, people, please, like, keep, family, never, may, around | 585 | `news_&_social_concern` | 0.30 |
| today, day, time, first, special, book, many, free, watching, still | 280 | `news_&_social_concern` | 0.41 |

- The first two rows are easy to name: new music on streaming services, and news. They are the only two topics with a share above 0.6.
- The third row is the next best topic. It has `win`, `team`, and `football`, and it also has `permission` and `project`.
- The last two rows are typical of the other 17 topics. Their words do not belong to one theme, and general words such as `time`, `day`, and `love` are in several topics. For most of these topics, the most common label is one of the three large labels, and fewer than half of the tweets of the topic have it.

LDA is weak on short posts, and the reason is the length of the documents.
LDA learns from the words that occur together in a document.
A news article has hundreds of words.
A tweet has about 15 tokens, so each tweet gives the model very few pairs of words to learn from.
For short posts, a common fix is to join the posts of one author or of one thread into one document.
The notebook does not do this.

## BERTopic

[BERTopic](https://maartengr.github.io/BERTopic) starts from the meaning of whole documents, not from word counts.
It works in six steps.

1. Embed each document: a language model turns the text into a vector. Documents with similar meanings get similar vectors.
2. Reduce the dimensions of the vectors with UMAP, because clustering works poorly on vectors with hundreds of dimensions.
3. Cluster the reduced vectors with HDBSCAN. Each cluster is a topic. Documents that fit no cluster are outliers.
4. Tokenize the documents of each topic.
5. Weight the tokens with a variant of [TF-IDF](bag-of-words.md#tf-idf) that treats all documents of a topic as one long document.
6. Represent each topic by its top tokens.

Each document gets one topic, not a mixture.
You do not choose the number of topics: it follows from the clusters that HDBSCAN finds.

The first step is the slow one, so the notebook runs it on its own.
[`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) is a small embedding model with the Apache 2.0 license.
The first run downloads it, which is about 90 MB.
It turns each tweet into a vector of 384 numbers.

```python
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = embedding_model.encode(docs, show_progress_bar=True)
```

The next block sets up the other steps and fits the model.

```python
from bertopic import BERTopic
from sklearn.feature_extraction.text import CountVectorizer
from umap import UMAP

umap_model = UMAP(n_neighbors=15, n_components=5, min_dist=0.0, metric="cosine", random_state=42)
vectorizer_model = CountVectorizer(stop_words="english")

topic_model = BERTopic(
    embedding_model=embedding_model,
    umap_model=umap_model,
    vectorizer_model=vectorizer_model,
    min_topic_size=30,
)

topics, probabilities = topic_model.fit_transform(docs, embeddings)
```

- `umap_model` is the UMAP step with the default settings of BERTopic, plus `random_state=42`. UMAP has a random part, and without a fixed seed every run gives other topics.
- `vectorizer_model` is the tokenizer of step 4. `stop_words="english"` keeps words such as `the` and `and` out of the topic words. The embedding step still reads the full text.
- `min_topic_size=30` is the smallest number of tweets that can form a topic. The default is 10, which gives many small topics on this data.

On a recent laptop, the embedding takes less than 10 seconds and the fit takes about 15 seconds.

## Reading the BERTopic topics

The numbers in this section are approximate.
The seed makes a rerun on the same machine give the same topics.
On another machine or with other package versions, the topics and their order differ a little.

In the notebook, BERTopic finds 27 topics.
About 35% of the 6,090 tweets fit no cluster, and BERTopic gives these tweets no topic.
`topic_model.get_topic_info()` returns one row for each topic, `get_topic` returns the top words of one topic, and `get_representative_docs` returns a few documents that are typical for it.

The table shows 6 of the topics, with the same columns as the LDA table.
One word is left out of the first row, because it is the name of an account.

| Top words | Tweets (about) | Most common label | Share with that label (about) |
|-----------|:--------------:|-------------------|:-----------------------------:|
| music, video, love, album, new, youtube, official, song, day | 1,070 | `music` | 0.7 |
| nfl, browns, chiefs, 49ers, game, win, bowl, super, cowboys, titans | 300 | `sports` | 1.0 |
| league, fc, manchester, final, city, club, premier, champions, chelsea, game | 240 | `sports` | 1.0 |
| covid, coronavirus, 19, vaccine, virus, pandemic, covid19, government, travel, news | 160 | `news_&_social_concern` | 0.9 |
| twitch, stream, crossing, animal, game, live, come, halo, games, xbox | 130 | `gaming` | 0.7 |
| app, service, phone, apple, internet, delay, hours, hour, ios, uber | 70 | `science_&_technology` | 0.5 |

Most topics are easy to name: a football league, a soccer league, the pandemic, video game streams.
The topics are narrower than the 19 labels.
The label `sports` is split into several topics, one for each sport or league.
About two thirds of the topics have a share above 0.8.

Three things need attention.

- The group of outliers is large. A statement about "the topics of the collection" then covers only about two thirds of the tweets.
- The largest topic is much larger than the others. It holds most of the music tweets together with tweets on other subjects, so its share is lower than the share of the narrow topics.
- Many top words are names of people, teams, and events. These tweets were collected from trending topics, so a topic is often one event of one week.

## Comparing the two results

The labels allow one summary number for each model.
Take the most common label of each topic.
Then count the tweets that have the most common label of their topic among their own labels.
The outliers of BERTopic are left out of its count.
The notebook computes this number in the section [Compare the two results](topic-models.ipynb#compare-the-two-results).

| | LDA | BERTopic |
|---|---|---|
| Works on | Word counts | Document embeddings from a language model |
| Cost | Runs in seconds | A model download and more time |
| A document gets | A mixture of topics | One topic, or none |
| Number of topics | You choose it | It follows from the clusters and the settings |
| Topics in the example | 20 | 27 |
| Tweets with a topic | 100% | About 65% |
| Of these, tweets with the most common label of their topic | 45.5% | About 83% |

The baseline for the last row is 29.3%, the share of the largest label.
A model that puts every tweet into one topic would reach it.
LDA is above the baseline, but not by much.
BERTopic matches the labels for most of the tweets that it assigns.

The comparison is not fully fair.
BERTopic may drop the tweets that are hard to place, and LDA must place every tweet.
The two models also have different numbers of topics.

With your own data, you have no labels, and reading the top words and the documents of each topic is the check.

## TopicGPT

TopicGPT uses a large language model (LLM) in two steps.
First, the LLM reads a sample of the documents and writes a list of topics.
Then the LLM assigns a topic from the list to each document.
Each topic has a name and a description in plain language, so nobody has to guess a theme from a list of top words.
A person can also edit the list of topics before the second step.
The method sends the documents to an LLM, so it costs more money and time than the two models above.

Pham et al. (2024) describe the method in [TopicGPT: A Prompt-based Topic Modeling Framework](https://arxiv.org/abs/2311.01449), and the code is in the [repository of the authors](https://github.com/chtmp223/topicGPT).
The notebook does not run it.

## Links

- [Topic Models notebook](topic-models.ipynb): all the code on this page
- [Gensim](https://radimrehurek.com/gensim) and its [`LdaModel`](https://radimrehurek.com/gensim/models/ldamodel.html) class
- Blei, Ng, and Jordan (2003), [Latent Dirichlet Allocation](https://www.jmlr.org/papers/v3/blei03a.html): the paper of LDA
- Papasavva et al. (2020), [Raiders of the Lost Kek: 3.5 Years of Augmented 4chan Posts from the Politically Incorrect Board](https://arxiv.org/abs/2001.07487): an example of LDA in research. The paper lists the top topics of each year on one 4chan board. Its topic table contains hateful words.
- [BERTopic](https://maartengr.github.io/BERTopic) and the [description of its steps](https://maartengr.github.io/BERTopic/algorithm/algorithm.html)
- Grootendorst (2022), [BERTopic: Neural topic modeling with a class-based TF-IDF procedure](https://arxiv.org/abs/2203.05794)
- Pham et al. (2024), [TopicGPT: A Prompt-based Topic Modeling Framework](https://arxiv.org/abs/2311.01449)

Next: the [overview of this section](index.md) compares the text methods side by side.
