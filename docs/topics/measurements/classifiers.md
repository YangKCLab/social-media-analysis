# Classifiers and toxicity

A classifier is a model that was trained on pairs of a text and a label.
Most current classifiers are transformer models, such as BERT and RoBERTa.
A transformer model reads the whole text in order, so it can use the context of a word.
Training one needs labeled data, but many trained models are public, so most projects download a model and do not train one.

This page shows a sentiment classifier, three toxicity scorers, and the step from a score to a label.

The [Scoring Text notebook](scoring-text.ipynb) runs all the code on this page.

## When to use it

Use a classifier when a trained model exists for the concept that you want to measure.
It handles many sentences that a [dictionary](dictionaries.md) gets wrong, because it reads the words in their context.

A classifier returns only the labels that it was trained on.
It measures the label that the annotators of its training data would most likely give to the text.
It knows nothing that its training data does not contain, such as slang from later years.
When no trained model exists for your concept, there are two options: train a model on your own labeled posts, or give the labels and their definitions to a large language model.

A classifier also costs more than a dictionary.
Each of the two models that this page downloads is about 500 MB.
Scoring 500 posts takes several seconds on a recent laptop, and a dictionary needs less than one second.
Neither model needs a GPU.

## A pre-trained classifier from Hugging Face

[Hugging Face](https://huggingface.co/models?pipeline_tag=text-classification) hosts thousands of trained text classifiers.
The `transformers` package downloads and runs a model by its name.

The example uses [`cardiffnlp/twitter-roberta-base-sentiment-latest`](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest).
Its model card says that it is a RoBERTa model that was trained on about 124 million tweets and then fine-tuned for sentiment on the TweetEval benchmark.
It returns one of three labels: `negative`, `neutral`, or `positive`.
The model card states the license CC BY 4.0.
The first run downloads about 500 MB.
`revision` fixes the version of the model, so every run uses the same weights.

```python
import os

from transformers import pipeline

# This model stores its weights in an older file format. Without the next line,
# transformers also downloads a converted copy of the weights (another 500 MB).
os.environ["DISABLE_SAFETENSORS_CONVERSION"] = "1"

classifier = pipeline(
    "text-classification",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    revision="3216a57f2a0d9c45a2e6c20157c20c49fb4bf9c7",
)

classifier("The food is not good.")
```

The call returns the label `negative` with a score of 0.93.
The score is the probability that the model gives to this label.
It says how sure the model is, and it does not say how strong the sentiment is.

The [dictionary page](dictionaries.md#where-vader-fails) has six hand-written sentences that VADER gets wrong.
The classifier gets five of the six right.
It labels "Great, the bus is late again." as negative, and it learned from tweets how `fire`, `killed it`, and `banger` are used.
It still labels the sarcastic sentence "I love waiting two hours for a late bus." as positive.

`classifier` also takes a list of texts.
`batch_size=32` sends 32 texts through the model at a time, and `truncation=True` cuts a text that is too long for the model.
The sample data of the notebook is TweetTopic, a research dataset of English tweets.
In the notebook, the classifier labels 211 of 500 tweets as positive, 208 as neutral, and 81 as negative.

## Toxicity scoring with Detoxify

A toxicity scorer is a classifier that returns a score for how toxic a text is.
This page shows three scorers.
Detoxify runs on your own machine.
ModerateHatespeech and the OpenAI Moderation API are hosted services that need a key.
Google shuts down the Perspective API, an older scorer, on December 31, 2026, so this page does not cover it.

[Detoxify](https://github.com/unitaryai/detoxify) is an open-source Python library with trained models for toxic comment classification.
It needs no key and has no rate limit, and a CPU is enough.
The library has the Apache 2.0 license.

The models were trained on comments from Wikipedia and from news sites.
Human annotators labeled these comments, and Jigsaw released them for three Kaggle challenges.
The library has three models: `original`, `unbiased`, and `multilingual`, which covers seven languages.
`unbiased` is a RoBERTa model that was also trained to reduce the bias against comments that mention an identity, such as a religion or a gender.
The first run downloads the model, which is about 500 MB.
In the code, `pd` is pandas.

```python
from detoxify import Detoxify

toxicity_model = Detoxify("unbiased")

examples = [
    "Thanks for sharing, this is really helpful.",
    "I disagree with this policy.",
    "You are an idiot.",
    "I will find you and hurt you.",
    "That was a damn good game.",
]

pd.DataFrame(toxicity_model.predict(examples), index=examples).round(3)
```

`predict` takes a list of texts and returns seven scores between 0 and 1 for each text: `toxicity`, `severe_toxicity`, `obscene`, `identity_attack`, `insult`, `threat`, and `sexual_explicit`.
The five sentences are hand-written, and the table shows four of the seven scores.

| Text | `toxicity` | `insult` | `threat` | `obscene` |
|------|:----------:|:--------:|:--------:|:---------:|
| Thanks for sharing, this is really helpful. | 0.000 | 0.000 | 0.000 | 0.000 |
| I disagree with this policy. | 0.001 | 0.000 | 0.000 | 0.000 |
| You are an idiot. | 0.996 | 0.994 | 0.000 | 0.007 |
| I will find you and hurt you. | 0.952 | 0.047 | 0.873 | 0.020 |
| That was a damn good game. | 0.776 | 0.048 | 0.001 | 0.795 |

- The first two sentences have scores near 0. A disagreement is not toxic.
- The other scores say why a text is scored as toxic. The third sentence has a high `insult` score, and the fourth has a high `threat` score.
- The model reacts to swear words and insults, not to the intent of the author. The last sentence is praise, and its `toxicity` score is still 0.776. The authors of Detoxify list this limit themselves: such a text is likely to get a high score even when the tone is friendly or the author makes a joke.
- "Toxic" means what the annotators of the training data were told it means: a rude, disrespectful, or unreasonable comment that is somewhat likely to make you leave a discussion. State this definition when you report Detoxify scores.

The notebook scores 500 tweets in batches of 50 with the function `detoxify_scores`.
Most tweets have a toxicity score very close to 0, and the median is about 0.001.
A small number of tweets have a high score.
This is the usual shape of toxicity scores.
It is stronger than usual in this dataset, because its authors removed tweets with abusive words before they published it.

## From scores to labels

A score is not a label.
A statement such as "4% of the tweets are toxic" needs a rule that turns each score into `toxic` or `not toxic`.
The rule is a cutoff, and you choose it.

Detoxify has no suggested cutoff.
In the code below, the column `toxicity` of the table `sample` holds the toxicity score of each of the 500 tweets.

```python
cutoffs = [0.1, 0.2, 0.5, 0.8]

pd.DataFrame({
    "tweets above": [(sample["toxicity"] > cutoff).sum() for cutoff in cutoffs],
    "percent": [100 * (sample["toxicity"] > cutoff).mean() for cutoff in cutoffs],
}, index=pd.Index(cutoffs, name="cutoff"))
```

| Cutoff | Tweets above the cutoff, of 500 | Percent |
|:------:|:-------------------------------:|:-------:|
| 0.1 | 27 | 5.4 |
| 0.2 | 14 | 2.8 |
| 0.5 | 4 | 0.8 |
| 0.8 | 3 | 0.6 |

The share of "toxic" tweets is nine times larger with a cutoff of 0.1 than with a cutoff of 0.8.
Every one of these numbers is a correct count.
They answer different questions, so a report must state the cutoff.
The counts are also small: with a cutoff of 0.5, the result depends on 4 tweets, and another sample of 500 would give another number.
When the thing that you measure is rare, score more posts.

The same holds for a sentiment score.
With the [typical cutoff of VADER](dictionaries.md#sentiment-with-vader), 0.05, VADER labels 279 of the 500 tweets as positive, 118 as negative, and 103 as neutral.
With a cutoff of 0.5, the counts are 196, 57, and 247, so the neutral group is the largest.
The tweets did not change, and only the rule did.

Two tools that claim to measure the same concept can also disagree.
In the notebook, VADER and the Hugging Face classifier give the same label to 306 of the 500 tweets.
The largest group of disagreements is the 81 tweets that VADER calls positive and the classifier calls neutral.
This comparison does not say which tool is right.

Every classifier needs a check against hand labels before you rely on it.
Label a sample of your own posts by hand, and compare your labels with the labels of the tool.
To choose a cutoff, compare your labels with the labels that each cutoff gives.
A lower cutoff finds more of the toxic posts and also labels more harmless posts as toxic.

## Hosted scorers that need a key

A hosted scorer does not run on your machine.
You send each text to the server of a provider, and the server returns the scores.
You need an account and an API key.
Your posts leave your machine, so check first that the rules for your data allow this.
Never write a key into a notebook or a script.
The code below reads each key from an environment variable, and it runs only when the key is set.

Each example response in this section is copied from the documentation of the provider.
It is not the output of the notebook.

[ModerateHatespeech](https://moderatehatespeech.com) is a hosted model that flags hateful and toxic comments.
The request is a JSON object with the key and one text.

```python
import os

import requests

hosted_posts = [
    "Thanks for sharing, this is really helpful.",
    "You are an idiot.",
]

mhs_key = os.environ.get("MODERATEHATESPEECH_API_KEY")

if mhs_key is None:
    print("MODERATEHATESPEECH_API_KEY is not set, so this cell was skipped.")
else:
    for post in hosted_posts:
        response = requests.post(
            "https://api.moderatehatespeech.com/api/v1/moderate/",
            json={"token": mhs_key, "text": post},
            timeout=30,
        )
        print(post, response.json())
```

The [documentation](https://moderatehatespeech.com/docs/) gives this example response.

```json
{
  "response": "Success",
  "class": "flag",
  "confidence": "0.993"
}
```

- `response` is `Success`, or an error message.
- `class` is `flag` if the model flags the text as toxic, and `normal` if not. The service makes the cutoff decision for you.
- `confidence` is the confidence in the class that was returned, from 0.5 to 1. It is not a toxicity score: a `normal` text with a confidence of 0.99 is a text that the model is sure is harmless.
- To use your own cutoff, turn the two fields into one score: the confidence for a `flag` text, and 1 minus the confidence for a `normal` text. The example writes the number as a string, so convert it with `float` first.

The [OpenAI Moderation API](https://developers.openai.com/api/docs/guides/moderation) needs an OpenAI account and a key.
Its documentation says that the endpoint is free to use.
The request can hold a list of texts.
`omni-moderation-2024-09-26` is a dated version of the model.
With the name `omni-moderation-latest`, the provider can replace the model, and the scores of the same text can then change.

```python
openai_key = os.environ.get("OPENAI_API_KEY")

if openai_key is None:
    print("OPENAI_API_KEY is not set, so this cell was skipped.")
else:
    response = requests.post(
        "https://api.openai.com/v1/moderations",
        headers={"Authorization": f"Bearer {openai_key}"},
        json={"model": "omni-moderation-2024-09-26", "input": hosted_posts},
        timeout=30,
    )
    for post, result in zip(hosted_posts, response.json()["results"]):
        print(post)
        print("  flagged:", result["flagged"])
        print("  harassment score:", round(result["category_scores"]["harassment"], 3))
```

The documentation gives an example response for an image from a war movie.
The block below is one entry of the list `results` from that example, with 2 of its 13 categories.
A request for a text returns the same fields.

```json
{
  "flagged": true,
  "categories": {"harassment": false, "violence": true},
  "category_scores": {"harassment": 0.0011643905680426018, "violence": 0.8599265510337075}
}
```

- `results` has one entry for each input, in the same order.
- `category_scores` has a score between 0 and 1 for each category. The categories are harassment, hate, illicit acts, self-harm, sexual content, and violence, with subcategories.
- `categories` has `true` or `false` for each category, and `flagged` is `true` if the model classifies the input as potentially harmful. The documentation does not state the cutoffs behind these values. To use your own cutoff, work with `category_scores`.
- No score is called toxicity. The closest categories are `harassment` and `hate`. A study that uses this API must say which category it used as its measure.

Both hosted scorers are classifiers, like Detoxify.
Each one measures the definition of its own provider, and each one needs the same check against hand labels.

## Links

- [Scoring Text notebook](scoring-text.ipynb): all the code on this page
- [Text classification models on Hugging Face](https://huggingface.co/models?pipeline_tag=text-classification)
- [`cardiffnlp/twitter-roberta-base-sentiment-latest`](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest): the model card of the sentiment classifier
- [Detoxify](https://github.com/unitaryai/detoxify): the library, its three models, and the limits that its authors list
- [ModerateHatespeech](https://moderatehatespeech.com) and its [API documentation](https://moderatehatespeech.com/docs/)
- [OpenAI Moderation API](https://developers.openai.com/api/docs/guides/moderation): the guide, with the list of categories

Next: [Topic modeling](topic-modeling.md) finds the themes of a collection of posts without labels.
