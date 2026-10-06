# Validating a measurement

A classifier gives each post a label or a score.
A validation compares this output with labels that a person assigns by hand to a sample of the same posts.
The comparison shows how often the classifier is right, and on which kind of post it is wrong.

On this page, "classifier" means any tool that labels or scores a post: a [dictionary](dictionaries.md), a [trained classifier or a toxicity scorer](classifiers.md), a [large language model](index.md#large-language-models), or a [cutoff on a score](domains.md#from-scores-to-categories).
The steps are the same for all of them, and for units other than posts, such as images or domains.

This page has no notebook: its code blocks run on one small table that is written by hand, and the output under each block is the output of that code.

## When to use it

Validate a classifier before you rely on its output, and validate it on your own data.
The makers of a tool measured its accuracy on their data and with their definition of each label.
Your posts can differ from that data in platform, topic, language, and time.
A validation answers one question: how often does the classifier give the same label as a person who follows a written definition?
It does not show that the definition is a good one.

A validation needs a fixed set of labels.
A [topic model](topic-modeling.md) has none, so a person reads its topics instead.
A plain count, such as the number of posts that contain a link, needs a check of the code and no hand labels.

## The hand labels

Every later number is measured against the hand labels, so make them in three steps, in this order.

1. Write a definition of each label. The definition says what the label includes and what it does not include, with an example of a borderline case. Without a written definition, two people label the same post differently.
2. Draw a random sample of your own posts. Every post must have the same chance to be in the sample. The first rows of a file are not a random sample, and the results of a keyword search are not one either. The pandas method `DataFrame.sample` draws a random sample of a table, and its argument `random_state` makes the draw repeatable.
3. Label the sample before you look at the output of the classifier. If you see the output first, it can influence your label, and the agreement is then too high.

The size of the sample limits what the validation can show, so label enough posts that every label appears often.
If 5% of your posts have a label, a sample of 100 posts holds about 5 posts with that label, and every number for that label then depends on about 5 posts.

When two people are available, both label the same posts separately and then compare their labels.
A post on which they disagree shows that the definition is unclear, so correct the definition and not only the label.
If the two people still cannot agree, the task is not well defined, and no classifier can be right.

## The agreement table

The agreement table, which is also called a confusion matrix, counts the posts for each combination of a hand label and a classifier label.
It has one row for each hand label and one column for each classifier label, so three labels give three rows and three columns.
The posts on which the two labels agree are on the diagonal.

The example of this page has two labels, `toxic` and `not toxic`.
The table `sample` has one row for each of 40 posts, with the hand label and a toxicity score between 0 and 1.
The scores are invented, and no tool produced them.
The classifier label is `toxic` when the score is above a cutoff of 0.5.

```python
import pandas as pd

sample = pd.DataFrame({
    "hand_label": ["toxic"] * 8 + ["not toxic"] * 32,
    "score": [
        0.97, 0.93, 0.88, 0.81, 0.66, 0.58, 0.34, 0.14, 0.78, 0.55,
        0.52, 0.41, 0.33, 0.27, 0.21, 0.16, 0.13, 0.13, 0.12, 0.12,
        0.11, 0.11, 0.09, 0.09, 0.08, 0.08, 0.07, 0.07, 0.06, 0.06,
        0.05, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01, 0.01,
    ],
})
sample["classifier_label"] = (sample["score"] > 0.5).map({True: "toxic", False: "not toxic"})

pd.crosstab(sample["hand_label"], sample["classifier_label"], margins=True)
```

```text
classifier_label  not toxic  toxic  All
hand_label
not toxic                29      3   32
toxic                     2      6    8
All                      31      9   40
```

`pd.crosstab` counts the combinations, and `margins=True` adds the totals as the row and the column `All`.
In the example, the two labels agree on 35 of the 40 posts: 29 posts are `not toxic` in both, and 6 posts are `toxic` in both.
The percentage that agree, which is also called accuracy, is the share of the posts on the diagonal: 87.5% in the example.

The total is not enough when one label is much more frequent than the others.
In the example, 32 of the 40 posts are `not toxic` by hand, so a classifier that answers `not toxic` for every post agrees on 80% of the sample and finds no toxic post.
The classifier of the example agrees on 3 posts more.
Read each row of the table, and not only the total.

## Precision and recall

Precision and recall describe one label at a time.
Research papers report them for each label, because the total hides a weak result on a rare label.

$$
\mathrm{precision} = \frac{\mathit{TP}}{\mathit{TP} + \mathit{FP}}
\qquad
\mathrm{recall} = \frac{\mathit{TP}}{\mathit{TP} + \mathit{FN}}
$$

- Choose one label, for example `toxic`. $\mathit{TP}$, the true positives, is the number of posts that have this label from you and from the classifier.
- $\mathit{FP}$, the false positives, is the number of posts that have the label from the classifier and not from you.
- $\mathit{FN}$, the false negatives, is the number of posts that have the label from you and not from the classifier.

Precision is computed within one column of the agreement table: among the posts that the classifier labels as `toxic`, it is the share that you labeled as `toxic` too.
Recall is computed within one row: among the posts that you labeled as `toxic`, it is the share that the classifier labels as `toxic` too.
The F1 score combines the two values: $F_1 = 2 \times \mathrm{precision} \times \mathrm{recall} \,/\, (\mathrm{precision} + \mathrm{recall})$.
It is between 0 and 1, and it is high only when precision and recall are both high.

The scikit-learn function `classification_report` computes the three values for each label.
Its first argument is the hand labels and its second argument is the classifier labels, and precision and recall change places if you exchange the two.

```python
from sklearn.metrics import classification_report

print(classification_report(sample["hand_label"], sample["classifier_label"], digits=3))
```

```text
              precision    recall  f1-score   support

   not toxic      0.935     0.906     0.921        32
       toxic      0.667     0.750     0.706         8

    accuracy                          0.875        40
   macro avg      0.801     0.828     0.813        40
weighted avg      0.882     0.875     0.878        40
```

- In the example, the precision of `toxic` is 0.667: 6 of the 9 posts that the classifier labels as toxic are toxic by hand. The recall of `toxic` is 0.750: the classifier finds 6 of the 8 posts that are toxic by hand.
- The precision and the recall of `not toxic` are 0.935 and 0.906. The frequent label has high values, and the weaker result is in the row of the rare label.
- `support` is the number of posts with each hand label, and `accuracy` is the percentage that agree. `macro avg` is the plain mean of the two label rows, and `weighted avg` weights each label by its support.

Low precision means that the classifier counts posts that do not have the label, and low recall means that it misses posts that have it.
Which of the two matters more depends on your question, so report both.

## Reading the disagreements

The numbers say how often you and the classifier disagree.
To find out why, read the posts on which the two labels differ.

```python
sample[sample["hand_label"] != sample["classifier_label"]]
```

```text
   hand_label  score classifier_label
6       toxic   0.34        not toxic
7       toxic   0.14        not toxic
8   not toxic   0.78            toxic
9   not toxic   0.55            toxic
10  not toxic   0.52            toxic
```

In the example, the labels differ on 5 posts, and the table has no text column.
In your own table, each of these rows holds a post to read.

- Read every disagreement when there are few. When there are many, read a random sample of them, for example 20 or more.
- Write down which kind of post the classifier gets wrong. A toxicity scorer reacts to swear words, so [praise that contains a swear word](classifiers.md#toxicity-scoring-with-detoxify) gets a high score. A dictionary [misses sarcasm and some negations](dictionaries.md#where-vader-fails).
- This description is the main result of the validation. The percentage that agree can be computed without reading a single post, and it does not say which of your findings the errors can change.
- Sometimes the classifier is right and your label is wrong. Then your definition has a gap. Correct the definition, label the affected posts again, and report the change.
- An explanation that a large language model gives for its label is not evidence. A model can write a fluent explanation for a wrong label.

## Scores and cutoffs

Many classifiers return a score, and a score is not a label.
A cutoff turns the score into a label, and [you choose the cutoff](classifiers.md#from-scores-to-labels).
Each cutoff gives another classifier, with its own agreement table.
The code computes the precision, the recall, and the F1 score of the label `toxic` for four cutoffs.

```python
from sklearn.metrics import f1_score, precision_score, recall_score

is_toxic = sample["hand_label"] == "toxic"

rows = []
for cutoff in [0.1, 0.2, 0.5, 0.8]:
    above = sample["score"] > cutoff
    rows.append({
        "cutoff": cutoff,
        "posts above": above.sum(),
        "precision": precision_score(is_toxic, above),
        "recall": recall_score(is_toxic, above),
        "f1": f1_score(is_toxic, above),
    })

pd.DataFrame(rows).set_index("cutoff").round(3)
```

```text
        posts above  precision  recall     f1
cutoff
0.1              22      0.364   1.000  0.533
0.2              14      0.500   0.875  0.636
0.5               9      0.667   0.750  0.706
0.8               4      1.000   0.500  0.667
```

In the example, a cutoff of 0.1 finds all 8 toxic posts, but only 36.4% of the 22 posts above it are toxic by hand.
With a cutoff of 0.8, all 4 posts above it are toxic by hand, but they are only half of the 8 toxic posts.
A lower cutoff raises the recall and lowers the precision.

No cutoff is correct for every use.
The cutoff with the highest F1 score treats the two kinds of error as equally bad, and in the example, 0.5 has the highest F1 score of the four cutoffs, 0.706.
Choose a higher cutoff when a false positive costs more, and a lower cutoff when a missed post costs more.
State the cutoff and how you chose it.

A cutoff that you choose on a sample fits this sample, so the precision and the recall on the same posts are somewhat too high.
The same holds when you change the prompt of a large language model until its labels agree with the sample.
To avoid this, split the hand-labeled posts in two parts: choose the cutoff or the prompt on the first part, and use the second part once, at the end, for the numbers that you report.

### The ROC curve and the AUC score

The ROC (receiver operating characteristic) curve describes a score without a cutoff.
For every possible cutoff, it plots the recall against the false positive rate.
The false positive rate is computed among the posts that do not have the hand label: it is the share that the classifier gives the label by mistake.

```python
from sklearn.metrics import roc_auc_score, roc_curve

false_positive_rate, recall, cutoffs = roc_curve(is_toxic, sample["score"])
roc = pd.DataFrame({"cutoff": cutoffs, "false positive rate": false_positive_rate, "recall": recall})

print(roc.round(3))
print("AUC score:", round(roc_auc_score(is_toxic, sample["score"]), 3))
```

```text
   cutoff  false positive rate  recall
0     inf                0.000   0.000
1    0.97                0.000   0.125
2    0.81                0.000   0.500
3    0.78                0.031   0.500
4    0.58                0.031   0.750
5    0.41                0.125   0.750
6    0.34                0.125   0.875
7    0.16                0.250   0.875
8    0.14                0.250   1.000
9    0.01                1.000   1.000
AUC score: 0.945
```

Each row is one point of the curve, and the rows go from the highest cutoff to the lowest.
`roc_curve` counts a score that is equal to the cutoff as above it, and it lists only the cutoffs at which the curve changes direction.
The first row has the cutoff `inf`, which means infinity: no post is above it, so both values are 0.
In the example, a cutoff of 0.81 finds half of the toxic posts with no false positive.
A cutoff of 0.14 finds all toxic posts, and it also gives the label to 25% of the posts that are not toxic by hand.
In the last row, every post is above the cutoff, so both values are 1.

The curve of a perfect score goes up to a recall of 1 while the false positive rate is still 0.
The curve of a random score follows the diagonal, where the two values are equal.
The AUC score is the area under the curve: 1 is a perfect score, and 0.5 is a random guess.
It is also the probability that a post with the label has a higher score than a post without it, when both are drawn at random.
In the example, the AUC score is 0.945.
The AUC score describes the score and not a label, so when you use a cutoff, report the precision and the recall at that cutoff too.

### A published example: the localness score

The [localness score of DomainDemo](domains.md#audience-metrics-from-domaindemo) says how strongly the users who share a domain are concentrated in a few U.S. states.
It has no natural cutoff between local and national news domains.
Its authors (Yang et al., 2025) validate the score against existing labels, first without a cutoff and then with one.

- The labels come from five existing lists that label news outlets as local or national. The merged list has 12,905 domains, and the authors remove the 40 domains that the lists label differently. 4,853 of the labeled news domains have a localness score.
- Without a cutoff, the AUC score of the localness score against these labels is 0.983.
- The authors compute the F1 score for each cutoff. A cutoff of 0.243 gives the highest F1 score, 0.978.

The labels are lists of U.S. news domains, so the cutoff is validated for such domains only.
For other domains, the authors suggest that users label a set of their own domains first and choose the cutoff from these labels.
A natural cutoff needs the same check: the authors note that a value of 0 of the audience partisanship [does not have to mean a politically neutral audience](domains.md#from-scores-to-categories).

## What can still go wrong

A validation describes one classifier on one kind of data at one time, so validate again in each of the four cases below.

- The provider changes the model. A model name such as `-latest` points to a new model after an update. Use a dated or numbered name for a hosted model, and fix the version of a package or of a downloaded model.
- You change the classifier after the validation. Another model, another prompt, another dictionary, and another cutoff each give a new classifier.
- The classifier is biased. It can label the same content differently when the author, the dialect, or the group that the text mentions changes. The total does not show this, so look for it when you read the disagreements.
- Your data changes. A classifier that works on the posts of one month can work less well after a major event changes what people post. The same holds for another platform or another community.

Report the validation together with your findings: the definition of each label, the size of the sample and how you drew it, the agreement table, the precision and the recall of each label, the cutoff, the kinds of post that the classifier gets wrong, and the name and the version of the classifier.

## Links

- [`pandas.crosstab`](https://pandas.pydata.org/docs/reference/api/pandas.crosstab.html): the function for the agreement table
- [`classification_report`](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html): precision, recall, and the F1 score for each label
- [`roc_curve`](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_curve.html) and [`roc_auc_score`](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html): the points of the ROC curve and the AUC score
- [Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html) in the scikit-learn user guide: the definitions of these and of other measures
- Yang et al. (2025), [DomainDemo: a dataset of domain-sharing activities among different demographic groups on Twitter](https://doi.org/10.1038/s41597-025-05604-6): the paper, with the validation of the localness score
- [DomainDemo validation code](https://github.com/LazerLab/DomainDemo/tree/main/code/validation): the scripts that compute the AUC score and the F1 score, next to the [label file](https://github.com/LazerLab/DomainDemo/tree/main/data/existing_labels)

This is the last page of the module, and the [overview page](index.md) lists all pages and notebooks.
