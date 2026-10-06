# Word embedding

A word embedding gives each word a vector, which is a list of a few hundred numbers.
Words that are used in similar contexts get vectors that are close to each other, so words with similar meanings are close.
The vectors are learned from a very large collection of text.
The two best-known methods are word2vec and GloVe.

The [Word Vectors notebook](word-vectors.ipynb) runs all the code on this page.

## Word embedding and bag of words

| | Bag of words | Word embedding |
|---|---|---|
| A word is | A dimension of its own | A point in a space shared by all words |
| Size of a vector | One number for each word in the vocabulary, mostly zeros | A few hundred numbers |
| `movie` and `film` | Unrelated, like `movie` and `bus` | Close to each other |
| Two texts are similar when | They share the same words | Their words have similar meanings |
| What it learns from | Only your own documents | A very large text collection, trained once and reused |

Two limits remain.
Each word has one vector, so the `bank` of a river and the `bank` that holds money share a vector.
The average of the word vectors of a text still ignores word order.

## When to use it

| Analysis | How | Example |
|----------|-----|---------|
| Find related words | List the nearest neighbors of a word | More keywords for a search: `scam` leads to `scams` and `fraud` |
| Compare texts by meaning | Average the word vectors of each text, then take the cosine similarity | Group posts that say the same thing with different words |
| Place words on a scale | Draw an axis between two anchor words, then project other words on it | Rich and poor ([Kozlowski et al., 2019](https://arxiv.org/abs/1803.09288)); the political leaning of hashtags |
| Measure stereotypes | Compare how close group words are to attribute words | Gender and ethnic stereotypes over 100 years ([Garg et al., 2018](https://arxiv.org/abs/1711.08412)) |
| Track changes in meaning | Train one embedding for each period or community, then compare the neighbors | The meanings of `broadcast` and `awful` over the decades ([Hamilton et al., 2016](https://arxiv.org/abs/1605.09096)) |

Pre-trained vectors have a fixed vocabulary.
The vectors on this page are lowercase and were trained on text from 2014 and earlier.
Newer words such as `covid` are missing, and so are hashtags.

## Loading pre-trained vectors

Training an embedding needs a very large collection of text, so most projects download vectors that someone else trained.
[Gensim](https://radimrehurek.com/gensim/) downloads several sets of vectors by name.
`glove-wiki-gigaword-100` is a set of [GloVe](https://nlp.stanford.edu/projects/glove) vectors that were trained on Wikipedia and on news text.
It has 400,000 words, and each word has a vector of 100 numbers.
The first call downloads a file of about 130 MB.

```python
import gensim.downloader as api

glove = api.load("glove-wiki-gigaword-100")
print(len(glove), "words,", glove.vector_size, "numbers for each word")
```

A single number of a vector has no meaning that a person can read.
What matters is how close two vectors are.
The usual measure is the cosine similarity of two vectors $u$ and $v$.

$$
\cos(u, v) = \frac{u \cdot v}{\lVert u \rVert \, \lVert v \rVert}
$$

- $u \cdot v$ is the dot product: multiply the two numbers at each position, and add the products.
- $\lVert u \rVert$ is the length of $u$: the square root of the sum of its squared numbers.

The value is 1 when two vectors point in the same direction, and it is near 0 when two words are unrelated.

```python
print("movie, film:", glove.similarity("movie", "film"))
print("movie, bus: ", glove.similarity("movie", "bus"))
```

The similarity of `movie` and `film` is 0.91, and the similarity of `movie` and `bus` is 0.30.

## Finding related words

`most_similar` returns the words whose vectors are closest to the vector of a word.

```python
glove.most_similar("scam", topn=10)
```

The list starts with `scams`, `fraud`, and `kickback`, with similarities of 0.82, 0.69, and 0.67.
One use is to extend a keyword list for a data collection.
Read every candidate before you add it.
A neighbor is a related word, not always a word with the same meaning.
Words with opposite meanings are often close, because they are used in the same contexts: the similarity of `good` and `bad` is 0.77.

## Calculations on vectors

Vectors can be added and subtracted.
The best-known example is king - man + woman, which gives a vector close to `queen`.
In `most_similar`, the words in `positive` are added and the words in `negative` are subtracted.

```python
glove.most_similar(positive=["king", "woman"], negative=["man"], topn=5)
```

The call returns `queen` first.
`most_similar` leaves out the words of the question.
When the calculation is done on the vectors themselves, the closest word to the result is `king`, and `queen` is second.
The result is near the vector of `queen`, and it is not equal to it.

## Comparing texts by meaning

A text can have a vector too.
The simplest one is the average of the vectors of its words.
`text_vector` tokenizes a text, drops the stopwords and the punctuation, skips every word that is not in the vocabulary, and averages the vectors of the remaining words.

```python
import nltk
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import TweetTokenizer

# The stopword list is a separate NLTK data package (less than 1 MB).
nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("english"))

tokenizer = TweetTokenizer(preserve_case=False, reduce_len=True, strip_handles=True)


def text_vector(text):
    words = []
    for token in tokenizer.tokenize(text):
        token = token.lstrip("#")
        if not any(ch.isalnum() for ch in token):
            continue
        if token in stop_words or token not in glove:
            continue
        words.append(token)
    if not words:
        return None
    return np.mean([glove[word] for word in words], axis=0)


def cosine(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
```

The three posts below are hand-written.
A and B say the same thing with different words, and C is about something else.

```python
posts = {
    "A": "the movie was great",
    "B": "the film was excellent",
    "C": "the bus was late",
}
vectors = {name: text_vector(text) for name, text in posts.items()}

for a, b in [("A", "B"), ("A", "C"), ("B", "C")]:
    print(a, "and", b, round(cosine(vectors[a], vectors[b]), 2))
```

| Pair | Bag of words | Word embedding |
|------|:------------:|:--------------:|
| A and B | 0 | 0.84 |
| A and C | 0 | 0.51 |
| B and C | 0 | 0.42 |

After the stopwords `the` and `was` are removed, no two posts share a word, so a bag of words gives every pair a similarity of 0.
The word vectors give A and B the highest similarity.
The two unrelated pairs do not score 0, so compare the scores with each other and do not read one score alone.

The notebook also ranks the posts of a table by their similarity to a query.

## Placing words on a scale

Two anchor words define a direction: the vector of one anchor minus the vector of the other.
The cosine similarity between a word and this direction says which anchor the word is closer to.
A positive score means the first anchor, and a negative score means the second.
In the code, `pd` is pandas.

```python
def scale(words, positive, negative):
    axis = glove[positive] - glove[negative]
    scores = {word: cosine(glove[word], axis) for word in words}
    return pd.Series(scores).sort_values(ascending=False).round(2)


words = ["excellent", "wonderful", "nice", "fine", "okay", "sad",
         "failure", "disaster", "awful", "terrible", "horrible"]

scale(words, "good", "bad")
```

On the scale from `bad` to `good`, `excellent` has the highest score, 0.52, and `horrible` has the lowest, -0.23.
`okay` is near the middle with 0.10.
Nobody labeled these words.
The order comes from how the words are used in the text that the vectors were trained on.

One pair of anchors is noisy, because the difference between two words also contains other differences between them.
Kozlowski, Taddy, and Evans (2019) average the directions of several anchor pairs that have the same meaning.

```python
def scale_from_pairs(words, pairs):
    axis = np.mean([glove[positive] - glove[negative] for positive, negative in pairs], axis=0)
    scores = {word: cosine(glove[word], axis) for word in words}
    return pd.Series(scores).sort_values(ascending=False).round(2)
```

In the notebook, five pairs such as `rich` and `poor` define a scale of wealth.
`mansion`, `banker`, `golf`, and `yacht` are at the rich end, and `janitor` and `nurse` are at the other end.

Two cautions apply to this method.

- A scale exists for any two anchor words, and every word gets a score. First check the scale with words whose position you know. Then read the words that you want to study.
- The scores describe how words are used in the training text, and they include the stereotypes of that text. Do not read the scores as facts about the world.

## Hashtag embeddings

A hashtag is a token, and a post often has several hashtags.
An embedding can therefore be trained on hashtags in the same way as on words: the hashtags of one post take the place of the words of one sentence.
Pre-trained vectors do not contain hashtags, so this embedding has to be trained on your own posts.
The [`Word2Vec`](https://radimrehurek.com/gensim/models/word2vec.html) class of Gensim trains one.

[Chen et al. (2021)](https://doi.org/10.1038/s41467-021-25738-6) use this method to measure the political leaning of hashtags.
They train word2vec on the hashtags of tweets about the 2018 U.S. midterm elections and get vectors for 54,533 hashtags.
The two anchors are `#voteblue` and `#votered`.
The position of a hashtag on the axis between the two anchors, scaled to the range from -1 to 1, is its score: a negative score means a liberal leaning, and a positive score means a conservative leaning.
The score of a post is the average of the scores of its hashtags.

This is the method of the section above, with hashtags in place of words, and the same two cautions apply.
The notebook does not train an embedding.

## Links

- [Word Vectors notebook](word-vectors.ipynb): all the code on this page
- Mikolov et al. (2013), [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781): the first word2vec paper
- Mikolov et al. (2013), [Distributed Representations of Words and Phrases and their Compositionality](https://arxiv.org/abs/1310.4546): the second word2vec paper
- Pennington, Socher, and Manning (2014), [GloVe: Global Vectors for Word Representation](https://nlp.stanford.edu/projects/glove)
- Kozlowski, Taddy, and Evans (2019), [The Geometry of Culture: Analyzing Meaning through Word Embeddings](https://arxiv.org/abs/1803.09288)
- Garg et al. (2018), [Word Embeddings Quantify 100 Years of Gender and Ethnic Stereotypes](https://arxiv.org/abs/1711.08412)
- Hamilton, Leskovec, and Jurafsky (2016), [Diachronic Word Embeddings Reveal Statistical Laws of Semantic Change](https://arxiv.org/abs/1605.09096)
- Chen, Pacheco, Yang, and Menczer (2021), [Neutral bots probe political bias on social media](https://doi.org/10.1038/s41467-021-25738-6)
- [Gensim](https://radimrehurek.com/gensim/) and the [list of vectors that it can download](https://github.com/piskvorky/gensim-data)

Next: Dictionary-based analysis scores a post with a list of words that each have a score.
