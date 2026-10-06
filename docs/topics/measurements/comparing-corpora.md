# Comparing corpora

A corpus is a collection of texts, and the plural is corpora.
This page answers one question: we have posts from two groups, and we want the words that one group uses more than the other.

The page follows Monroe, Colaresi, and Quinn (2008), [Fightin' Words](https://doi.org/10.1093/pan/mpn018).
The paper shows three measures in order, and each one fixes a problem of the one before.

| Measure | What happens |
|---------|--------------|
| Difference of word frequencies | Frequent words dominate the result |
| Log-odds ratio | Rare words distort the result, and a word that is in only one group gets no score |
| Log-odds ratio with an informative Dirichlet prior | It handles both problems. It needs a background collection |

The [Word Counts notebook](word-counts.ipynb#compare-two-corpora) runs all three measures.

## When to use it

Use these measures when you have posts from two groups.
The groups can be two communities, two sets of accounts, or the same community before and after an event.

A common approach is to draw a word cloud for each group and to put the two side by side.
This does not answer the question.
Each cloud shows the frequent words of one group, and most frequent words are the same in both groups.
A reader has to find a word in both clouds and compare two font sizes, and no number says how large a difference is.

The result of every measure on this page is a ranked list of words.
A person still has to read the list and decide what the words mean.

## The example

The numbers on this page come from the notebook.
Its sample data is TweetTopic, a research dataset of English tweets with topic labels.
The sports group is the 1,659 tweets that have the label `sports` and do not have the label `music`.
The music group is the 1,107 tweets that have the label `music` and do not have the label `sports`.
The two groups together have 12,214 different words.
The stopwords stay in, so the results show what each measure does with them.

For one word, the measures use these symbols:

- $y_a$ is the count of the word in group A, and $n_a$ is the number of tokens in group A.
- $f_a = y_a / n_a$ is the frequency of the word in group A.
- $y_b$, $n_b$, and $f_b$ are the same for group B.

## Measure 1: the difference of frequencies

The first measure is $f_a - f_b$.

Frequent words dominate this measure.
A frequent word has a large difference even when the two groups use it at nearly the same rate.
In the example, the 15 words with the largest difference on the sports side include `the`, `in`, `for`, `to`, `a`, and `at`.

Removing the stopwords first hides the problem, and it also removes real differences.
In the example, the music group uses `i` and `you` about twice as often as the sports group.

## Measure 2: the log-odds ratio

The odds of a word are $f / (1 - f)$.
The log-odds ratio is the logarithm of the odds in group A divided by the odds in group B.

$$
\ln \frac{f_a / (1 - f_a)}{f_b / (1 - f_b)}
$$

The value is 0 when the two groups use the word at the same rate.
It is positive when group A uses the word more, and negative when group B uses it more.
The measure compares rates, so a frequent word has no advantage.

It has two new problems.

- A word that is in only one group has a ratio of zero or infinity, so it gets no score. In the example, 10,105 of the 12,214 words are in only one group.
- Rare words distort the result. Of the 20 words with the most extreme ratios in the example, 15 have a count of 1 or 2 in the other group. A ratio that is built on a count of 1 is not stable: one more occurrence would cut it in half.

## Measure 3: the log-odds ratio with a prior

Monroe, Colaresi, and Quinn solve both problems with a prior.
Before we look at the two groups, we assume that each group uses every word at the rate that the word has in a large background collection.
In practice, the counts of the background collection are added to the counts of each group.

$$
\delta = \ln \frac{y_a + \alpha}{n_a + \alpha_0 - y_a - \alpha} - \ln \frac{y_b + \alpha}{n_b + \alpha_0 - y_b - \alpha}
$$

$$
z = \frac{\delta}{\sqrt{\dfrac{1}{y_a + \alpha} + \dfrac{1}{y_b + \alpha}}}
$$

- $\alpha$ is the count of the word in the background collection, and $\alpha_0$ is the number of tokens in the background collection. The code calls them `a` and `a_0`.
- $\delta$ is the log-odds ratio after the background counts are added.
- $z$ is $\delta$ divided by its standard error. It is a z-score.

The prior changes three things.
A word that is missing from one group no longer has a count of 0, so every word gets a score.
A rare word stays close to the background rate, because a few occurrences change little.
The z-score is large only when the difference is large compared with its uncertainty.

The full name of the method is the log-odds ratio with an informative Dirichlet prior.

## Code

`count_words` counts the tokens of a list of posts and keeps the stopwords.
It uses the `tokenize` function of the [bag of words page](bag-of-words.md#counting-words).
In the code, `sports` and `music` are two pandas tables of posts.

```python
def count_words(texts):
    word_counts = Counter()
    for text in texts:
        word_counts.update(tokenize(text, remove_stopwords=False))
    return word_counts


counts_sports = count_words(sports["text"])
counts_music = count_words(music["text"])
```

`log_odds_with_prior` computes the z-score of every word from three `Counter` objects.
It needs the `math` module and pandas as `pd`.

```python
def log_odds_with_prior(counts_a, counts_b, counts_prior):
    """Return the z-score of the log-odds ratio of each word, A against B."""
    n_a = sum(counts_a.values())
    n_b = sum(counts_b.values())
    a_0 = sum(counts_prior.values())

    rows = []
    for word in set(counts_a) | set(counts_b):
        y_a = counts_a.get(word, 0)
        y_b = counts_b.get(word, 0)
        a = counts_prior.get(word, 0)
        delta = math.log((y_a + a) / (n_a + a_0 - y_a - a)) - math.log((y_b + a) / (n_b + a_0 - y_b - a))
        std = math.sqrt(1 / (y_a + a) + 1 / (y_b + a))
        rows.append({"word": word, "count_a": y_a, "count_b": y_b, "z": delta / std})

    result = pd.DataFrame(rows)
    return result.sort_values(["z", "word"], ascending=[False, True]).reset_index(drop=True)
```

The background collection of the example is all 6,090 tweets of the dataset, in the table `df`.

```python
counts_all = count_words(df["text"])

result = log_odds_with_prior(counts_sports, counts_music, counts_all)
result.head(15)
```

## Reading the result

The table shows the eight words with the highest z-scores for each group.
Three words on the music side are left out, because each is the name of a person or of an account.

| Rank | Sports group | z-score | Music group | z-score |
|------|--------------|---------|-------------|---------|
| 1 | `game` | 7.59 | `music` | -11.20 |
| 2 | `vs` | 5.70 | `album` | -8.25 |
| 3 | `the` | 5.46 | `song` | -7.33 |
| 4 | `ufc` | 5.15 | `video` | -6.93 |
| 5 | `football` | 4.89 | `new` | -5.97 |
| 6 | `league` | 4.82 | `youtube` | -5.97 |
| 7 | `win` | 4.74 | `official` | -5.91 |
| 8 | `sports` | 4.66 | `spotify` | -4.90 |

- Words that are in only one group are now ranked. `ufc`, `football`, `league`, and `sports` do not appear in the music group.
- No word with a count of 1 or 2 in its own group is at the top.
- A few stopwords remain: `the` on the sports side, and `i` and `you` on the music side. These are real differences in how the two groups write. A stopword list would have removed them.
- A z-score above 1.96 or below -1.96 is the usual cutoff for a difference that is unlikely to come from chance. Only 173 of the 12,214 words pass it. Most stopwords do not.

The choice of the background collection matters.

- The background must contain every word of the two groups. The function fails on a word that has a count of 0 in the background and in one group.
- With a larger background, the z-score of every word moves toward 0, so fewer words pass the cutoff.
- Use a collection of the same kind of text as your two groups, for example all the posts that you collected.

## Word shift graphs

A word shift graph is a horizontal bar chart that ranks the words by how much each one contributes to the difference between two texts.
The difference can be a difference of word frequencies, of an average dictionary score such as sentiment, or of an entropy-based measure.
Gallagher et al. (2021) describe the method in [Generalized word shift graphs](https://doi.org/10.1140/epjds/s13688-021-00260-3), and the figures of the paper show examples.

The Python package is [`shifterator`](https://github.com/ryanjgallagher/shifterator), with [documentation](https://shifterator.readthedocs.io/).
Install it from the GitHub repository, because the release on PyPI is from 2021.
The notebook does not draw a word shift graph.

## Links

- [Word Counts notebook](word-counts.ipynb#compare-two-corpora): the three measures on the sample data
- Monroe, Colaresi, and Quinn (2008), [Fightin' Words: Lexical Feature Selection and Evaluation for Identifying the Content of Political Conflict](https://doi.org/10.1093/pan/mpn018)
- [Another implementation in Python](https://github.com/yang3kc/ai_search_arena/blob/main/workflow/analysis/citation_analysis/scripts/generate_overrepresented_sources.py) of the log-odds ratio with a prior, in the function `logodds`
- Gallagher et al. (2021), [Generalized word shift graphs: a method for visualizing and explaining pairwise comparisons between texts](https://doi.org/10.1140/epjds/s13688-021-00260-3)
- [`shifterator`](https://github.com/ryanjgallagher/shifterator): the package that draws word shift graphs

Next: [Word embedding](word-embedding.md) turns each word into a vector, so that words with similar meanings are close to each other.
