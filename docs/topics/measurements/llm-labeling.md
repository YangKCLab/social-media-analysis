# Labeling Text with an LLM

A large language model (LLM) can label posts with a set of labels that you define.
You write the labels and their definitions into a prompt, send the prompt with one post to the model, and the model returns a label.
No trained model and no training data are needed.
This makes an LLM useful for a concept that no existing tool measures.

This page covers the method: the codebook, the prompt, the tuning of the prompt, the choice of a model, and the cost.
The tutorial [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/) covers the code: API keys, the first call, structured output, and parallel requests.
The page [Validating a measurement](validation.md) covers the hand labels, the agreement table, and the split of the hand labels into two parts.
This page links to both and does not repeat them.

This page has no notebook.
Its two code blocks build a prompt and count tokens, and they need no API key.
The output under the second block is the output of the two blocks.
The code that calls a model needs an API key, and it is in the tutorial.

## When to use it

Use an existing tool when it measures what you need.
Use an LLM when no tool exists for your concept, and you can define the concept in words.

| | An existing tool, such as [Detoxify](classifiers.md#toxicity-scoring-with-detoxify) | An LLM |
|---|---|---|
| The task | Fixed by the tool | You define it |
| Cost | Free, except for the hardware | You pay for every post |
| Speed | Depends on your hardware | Depends on the provider and the network |
| Same input, same output? | Yes | Not always |
| Do you have to validate it? | Yes | Yes |

An LLM does not remove the need for hand labels.
You need them to write the definitions, to tune the prompt, and to measure how often the model is right.

## Prompts and answers

An LLM API takes a list of messages and returns one answer.
Each message has a role.

| Role | Written by | Example |
|------|------------|---------|
| `system` | You | You are an expert on sentiment analysis. [...] |
| `user` | You | Given the following text message: 'The service here is very good!', please evaluate [...] |
| `assistant` | The model | The sentiment score is \*\*1.0\*\*, indicating a very positive sentiment. [...] |

- The prompt is what you send: the `system` message and the `user` message. The `system` message sets the task, and the `user` message holds the input of this request.
- The answer is the `assistant` message, the text that the model writes back.
- The model remembers nothing between two calls. Every request must contain everything that the model needs: the instructions, the label definitions, and the post.
- You pay per token. A token is a piece of a word. You pay for the input tokens of the prompt, the output tokens of the answer, and the reasoning tokens that some models spend before they answer.

The tutorial chapter [Basics](https://yang3kc.github.io/llm_for_css/basics/) makes a first call, and the chapter [Structured output](https://yang3kc.github.io/llm_for_css/structured_output/) makes the model return a label in a fixed format that a program can store.
For labels, use structured output that allows only your labels as values.
Do not read the label out of a free-text answer.

## Write a codebook

A codebook is the set of labeling instructions that people and the model both follow.
It holds the question, the labels, a definition and an example of each label, and rules for the difficult cases.
A good codebook passes one test: two or three people who label the same post with it give the same label.

The table is an example for the question "What does this post do?".
The example posts are invented for this page.

| Label | Definition | Example |
|-------|------------|---------|
| `news` | The post reports an event and gives or links a source | City council votes to close two branch libraries next year, via the local paper: [link] |
| `opinion` | The post gives the author's judgment of an event, a person, or an idea | Closing the libraries is a terrible decision. |
| `experience` | The post describes something that happened to the author | I spent every summer of my childhood in that library. |
| `other` | None of the above | Happy Friday, everyone! |

- Add a label such as `other`, because your labels may not cover every post.
- Add a rule for each difficult case that you find. For example: "A post that reports an event and also judges it is `opinion` when the judgment is the main point."
- Label a sample of your own posts by hand before you write the prompt. The section [The hand labels](validation.md#the-hand-labels) shows how to draw the sample and how two people label it. When two people disagree on a post, correct the codebook and not only the label.

## Put the codebook in the prompt

The prompt holds the same definitions as the codebook.
The code keeps the definitions in one dictionary and builds the prompt from it.
The example is the sentiment task from the [tutorial](https://yang3kc.github.io/llm_for_css/jev/): it labels the sentiment of a message about a service.

```python
criteria = {
    "positive": "The message gives a favorable evaluation of the service overall",
    "negative": "The message gives an unfavorable evaluation of the service overall",
    "neutral": ("The message gives no evaluation of the service, "
                "or the favorable and unfavorable parts have about equal weight"),
}
label_definitions = "\n".join(f"- {label}: {definition}" for label, definition in criteria.items())

system_prompt = ("You are an expert on sentiment analysis. "
                 "Your job is to label the sentiment of the given text message.")


def make_user_prompt(text_message):
    return f"""Given the following text message: '{text_message}', please choose the label
that describes its overall sentiment about the service.
The labels are:
{label_definitions}
"""
```

- The model reads the same definitions as the people who label by hand.
- The definitions are in one place in the code, so the prompt and the codebook cannot differ.
- You can add a few labeled example posts to the prompt. This is called few-shot learning. The examples must not come from the posts that you use for the final validation.
- You can ask the model for an explanation with every label. An explanation helps you while you tune the prompt. It also adds output tokens to every post, and output tokens cost more than input tokens. An explanation is not evidence that the label is right.

## Tune the prompt

The first version of a prompt is rarely the best one.
Tune it in a loop.

1. Run the prompt on posts that you labeled by hand.
2. Compute how often the model agrees with your labels.
3. Read the posts on which the model disagrees with you, and find what they have in common.
4. Change one thing in the prompt.
5. Run the prompt again on the same posts and compare the agreement.

Change one thing at a time, so that you know which change caused a difference.
These are the things that you can change.

- A definition that is too vague
- A rule for a difficult case that comes back often
- A few labeled examples in the prompt
- An instruction to reason before the answer, which is called chain of thought, or the reasoning setting of the model

Keep a record of every version of the prompt: the text, what you changed, and the agreement.

### An example

The tutorial labels 60 short messages about services with the three labels above.
One of the messages is "I love my new phone. I used it to book a table with you for Friday."
The hand label is `neutral`, because the message says nothing about the service.
The decision model of the tutorial, which reads the same three definitions, labeled it `positive`.
A likely cause is the phrase "I love".

- The error shows that the model did not apply the words "evaluation of the service" strictly.
- A possible change is a new rule in the prompt: "Judge only what the message says about the service. Ignore opinions about other things."
- After the change, run the prompt again on all the hand-labeled posts. A rule that corrects one post can change the label of other posts.

### Do not tune and report on the same posts

A prompt that you change until it agrees with 100 posts fits those 100 posts.
Its agreement on new posts is then lower than the number that you saw.
Split the hand-labeled posts in two parts: tune the prompt on the first part, and use the second part once, at the end, for the numbers that you report.
The section [Scores and cutoffs](validation.md#scores-and-cutoffs) explains this split for a cutoff, and the same reasoning holds for a prompt.
The examples in a few-shot prompt must come from the first part.

## Compare models

Run each candidate model with the same prompt on the same hand-labeled posts.
Record three numbers for each model.

- The agreement with your hand labels, as in the section [The agreement table](validation.md#the-agreement-table)
- The cost per 1,000 posts
- The time per post

Choose the cheapest model that is accurate enough for your question.
A more expensive model is not always more accurate on your task.
A prompt that you tuned for one model is not always the best prompt for another model, so check the prompt again after you switch.

The tutorial chapter [Decision models (Jev)](https://yang3kc.github.io/llm_for_css/jev/) compares two models on its 60 hand-labeled messages.
Both models use the same three definitions.
The costs come from the token counts of the responses and the list prices on 2026-10-01.

| Model | Agreement with the hand labels | Cost per 1,000 messages |
|-------|:------------------------------:|:-----------------------:|
| Jev (`jev-1.13.0`), a decision model | 59 of 60 (98.3%) | $0.016 |
| `gpt-5.6-luna`, a small LLM | 57 of 60 (95.0%) | $0.051 |

In this example, the cheaper model agrees more often with the hand labels.
This is one result on 60 messages that were written for the tutorial.
It does not rank the two models on other tasks, so run the comparison on your own posts.

## A decision model or an LLM?

An LLM writes text.
A decision model picks an answer.
You give a decision model a text and a question with a fixed set of answers.
It returns one of the answers, a probability for each possible answer, and a confidence value.
There is no prompt to write, no explanation to read, and no answer to parse.

[Jev](https://docs.typesafe.ai) is a hosted decision model from the company TypeSafe.
It has its own Python package, `typesafe-sdk`, and it is also available through OpenRouter.
You pay for the input tokens only: $0.042 per 1 million input tokens, and the output is free.
For comparison, `gpt-5.6-luna` costs $0.20 per 1 million input tokens and $1.20 per 1 million output tokens.
The tutorial chapter [Decision models (Jev)](https://yang3kc.github.io/llm_for_css/jev/) shows the code and the three question types.

Ibrahim and Zaki (2026) compared Jev with 19 LLMs on 15 social science annotation tasks.

- Jev scored lower than the best LLM on 14 of the 15 tasks, by a median of 11.6 macro-F1 points.
- The best LLM for each task cost a median of 44 times as much as Jev.
- On an empathy task, Jev gave a confidence of 0.9 or above to 78% of the items. The accuracy on these items was 0.383, and the paper reports a base rate of 0.371 for this task. The model was confident, and its accuracy was close to chance. A high confidence does not mean that the label is right.

The two lists summarize when each kind of model fits.
They come from the tutorial, which cites the preprints of September 2026 and the limitations page of the vendor.
They describe `jev-1.13`, and a later version can behave differently.

A decision model is a good fit when:

- The task is to label text with a fixed set of answers, and you have many posts.
- Cost and time matter more than the highest accuracy.
- You want a probability for each label.
- You want an answer that is always one of your labels and needs no parsing.

Use an LLM when:

- You need text back, such as an explanation or a summary.
- The question needs counting, numbers, dates, or several steps of reasoning.
- The concept is affective, such as empathy.
- Accuracy matters more than cost.
- The text is long, or it is not in English.

### Cascades

A cascade combines a cheap model with a more expensive one.

1. The decision model labels every post.
2. The posts with a confidence at or above a threshold keep that label.
3. The other posts go to an LLM.

A cascade helps only when the LLM is more accurate than the decision model on the posts below the threshold.
Check this on your hand labels before you use a cascade.

- On the 60 messages of the tutorial, with a threshold of 0.9, the cascade sent 9 messages to `gpt-5.6-luna`. Jev gave the hand label on 8 of the 9 messages and the LLM on 6. The cascade agreed with the hand labels on 95.0% of the messages, lower than Jev alone.
- Ibrahim and Zaki (2026) report cascades from Jev to three LLMs on their annotation tasks. The cascades matched or exceeded the accuracy of the LLM alone at about a quarter to half of the cost of the LLM.
- Li et al. (2026) use Jev to judge which of two answers is better, and they send the uncertain cases to GPT-6. In version 6 of their preprint, with a threshold fixed in advance, the cascade was 0.9 percentage points more accurate than GPT-6 alone on 1,610 held-out pairs, at 41% of the fee of GPT-6.

The confidence threshold needs the same check as a [cutoff on a score](validation.md#scores-and-cutoffs): choose it on one part of the hand labels and report the result on the other part.

## API providers

A provider runs the model on its servers, and you send each request over the network.
The tutorial has a chapter for each of the four options in the table.
The prices are list prices per 1 million tokens on 2026-11-24.

| Provider | Example model | Price per 1 million tokens, input / output | Tutorial chapter |
|----------|---------------|:------------------------------------------:|------------------|
| OpenAI | `gpt-5.6-luna` | $0.20 / $1.20 | [Basics](https://yang3kc.github.io/llm_for_css/basics/) |
| Anthropic | `claude-haiku-4-5` | $1.00 / $5.00 | [Anthropic API](https://yang3kc.github.io/llm_for_css/anthropic/) |
| OpenRouter | `deepseek/deepseek-v4-flash` | $0.09 / $0.18 | [Open-source models](https://yang3kc.github.io/llm_for_css/open_source_models/) |
| Ollama, on your own computer | `gemma4:e2b` | Free, except for the hardware | [Local LLMs](https://yang3kc.github.io/llm_for_css/local_llms/) |

Prices change.
In September 2026, the price of `deepseek/deepseek-v4-flash` was $0.08 per 1 million input tokens and $0.15 per 1 million output tokens.
Check the pricing page of the model before a large run.

With a hosted provider, your posts leave your computer.
Check that the rules for your data allow this.
With Ollama, the model and the posts stay on your computer.

### OpenRouter

[OpenRouter](https://openrouter.ai/models) gives you access to several hundred models from different companies with one account and one API key.
They include proprietary models and open-weight models, such as DeepSeek, Qwen, and Gemma.
The [model list](https://openrouter.ai/models) shows the price per token of each model.

- A model name has the form `creator/model-name`, for example `deepseek/deepseek-v4-flash`. To switch to another model, you change this one string.
- The `openai` Python package works with OpenRouter. You change the `base_url` of the client and the model name, as the tutorial chapter [Open-source models](https://yang3kc.github.io/llm_for_css/open_source_models/) shows.
- Not every model supports structured output. The model list has a [filter for models that support it](https://openrouter.ai/models?supported_parameters=structured_outputs).
- For the same model, OpenRouter can send your request to different hosting providers, with different prices and speeds. You can [pin one provider](https://openrouter.ai/docs/features/provider-routing).

Some models are free, and their names end in `:free`.
The free models are for testing: use them to check that your code runs and that your prompt returns labels in the right format.
Do not use them as the classifier of a study, for three reasons.

- They have [low limits](https://openrouter.ai/docs/api-reference/limits): 20 requests per minute, and 50 requests per day for an account that has bought less than 10 dollars of credit. An account that has bought at least 10 dollars of credit can send 1,000 requests per day to the free models.
- They can change or be removed without notice. On 2026-11-24, the model list had 12 free models.
- Most models have no free version. On 2026-11-24, `deepseek/deepseek-v4-flash` had none. The labels of a free model tell you nothing about the accuracy of the model that you will pay for.

## Estimate the cost before you start

You pay per token, and input tokens and output tokens have different prices.

$$
\text{cost of one post} = \text{input tokens} \times \text{input price} + \text{output tokens} \times \text{output price}
$$

Do not guess the token counts.
There are two ways to get them.

- Before you call any API, count the tokens with a tokenizer, as the next section shows.
- After a first small run, read the token counts from the field `usage` of each response.

### Count the tokens with tiktoken

[tiktoken](https://github.com/openai/tiktoken) is the tokenizer of the OpenAI models, and it runs on your computer without a key.
The estimate takes four steps.

1. Write the codebook and the prompt, and take a sample of your own posts.
2. Decide the format of the answer, and write a fake answer in that format.
3. Count the tokens of the prompts and of the fake answer.
4. Multiply the counts by the prices of the model.

The code uses `system_prompt` and `make_user_prompt` from the section [Put the codebook in the prompt](#put-the-codebook-in-the-prompt).
The five messages are short example messages from the tutorial.
The prices are those of `deepseek/deepseek-v4-flash` on 2026-11-24.

```python
import tiktoken

posts = [
    "The service here is very good!",
    "The service here is good.",
    "The service here is ok.",
    "The service here is not very good.",
    "The service here is terrible!",
]

enc = tiktoken.get_encoding("o200k_base")    # the tokenizer of recent OpenAI models

# The full prompt is sent once per post: the system message and the user message.
input_tokens = [len(enc.encode(system_prompt)) + len(enc.encode(make_user_prompt(post))) for post in posts]
mean_input = sum(input_tokens) / len(input_tokens)

fake_answer = '{"label": "neutral"}'
output_tokens = len(enc.encode(fake_answer))

input_price = 0.09 / 1_000_000     # US dollars per input token
output_price = 0.18 / 1_000_000    # US dollars per output token
cost_per_1000 = 1000 * (mean_input * input_price + output_tokens * output_price)

print("Input tokens per post:", input_tokens)
print("Mean input tokens:", mean_input)
print("Output tokens per post:", output_tokens)
print(f"Cost per 1,000 posts: ${cost_per_1000:.4f}")
```

```text
Input tokens per post: [104, 103, 103, 105, 103]
Mean input tokens: 103.6
Output tokens per post: 6
Cost per 1,000 posts: $0.0104
```

In the example, the prompt has about 104 tokens and the answer has 6 tokens.
The cost is about 1 cent for 1,000 posts, so 100,000 posts cost about $1.04.

The result is an estimate, so add a margin.

- Each model has its own tokenizer. A model from another company counts the same text as a different number of tokens.
- The API adds a few tokens for each message, and a tokenizer does not count them.
- A tokenizer cannot count the reasoning tokens that a model spends before it answers. A reasoning model can spend many more tokens on reasoning than on the answer.
- Real posts are usually longer than the five messages of the example. A long codebook and few-shot examples add input tokens to every post. An explanation adds output tokens to every post.

## Watch the cost during a run

An estimate can be wrong, so compare it with the real cost.

- Run the classifier on a small sample first, for example 100 posts. Compare the real cost per post with your estimate.
- Read the token counts from the field `usage` of each response, and add them up. OpenRouter also returns the cost of each request in the field `usage`, as its [documentation on usage accounting](https://openrouter.ai/docs/use-cases/usage-accounting) shows.
- During a long run, check the remaining credit of your account regularly, and compare the real cost per day with your estimate.
- Decide in advance what you do if the real cost is much higher than the estimate, for example ten times higher. Two options are to label a smaller random sample of the posts, or to switch to a cheaper model. A cheaper model is a new classifier, so validate it again.

## Store the model name and the prompt version with every label

Store each label together with the information that produced it.

| Column | Example | Why |
|--------|---------|-----|
| `post_id` | `3k2j9x` | To join the label to the post |
| `label` | `neutral` | The result |
| `model` | `deepseek/deepseek-v4-flash` | The exact model that gave the label |
| `prompt_version` | `v3` | The version of the prompt and the codebook |
| `labeled_at` | `2026-11-24T14:05:00Z` | The time of the request |
| `input_tokens`, `output_tokens` | `104`, `6` | To compute the real cost |

- Use the exact name of the model. A name that ends in `-latest` can point to a new model after an update. Use a dated or numbered name.
- Give each version of the prompt a name, and keep the text of every version, for example in a file under version control. A label without its prompt version cannot be reproduced.
- The same post can get a different label on a second run. Store the label once, and do not compute it again each time that you need it.
- Requests fail and time out. Set a timeout, retry a few times, and keep the posts that failed for the next run.
- A new model or a new prompt is a new classifier, so validate it again. The section [What can still go wrong](validation.md#what-can-still-go-wrong) lists the other cases that need a new validation.

## Links

- [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/): the tutorial, with chapters on [API keys](https://yang3kc.github.io/llm_for_css/api_key/), the [first call](https://yang3kc.github.io/llm_for_css/basics/), [structured output](https://yang3kc.github.io/llm_for_css/structured_output/), [parallel requests](https://yang3kc.github.io/llm_for_css/async_programming/), [batch processing](https://yang3kc.github.io/llm_for_css/batch_processing/), other providers, and [decision models](https://yang3kc.github.io/llm_for_css/jev/)
- [Validating a measurement](validation.md): the hand labels, the agreement table, precision and recall, and the split of the hand labels
- [OpenRouter model list](https://openrouter.ai/models), its [rate limits](https://openrouter.ai/docs/api-reference/limits), and its [usage accounting](https://openrouter.ai/docs/use-cases/usage-accounting)
- [tiktoken](https://github.com/openai/tiktoken): the tokenizer of the OpenAI models
- [Jev documentation](https://docs.typesafe.ai): the decision model from TypeSafe
- Ibrahim and Zaki (2026), [Evaluating Decision Models for Text Annotation in Computational Social Science](https://arxiv.org/abs/2609.24574): a preprint that compares Jev with 19 LLMs on 15 annotation tasks, with cascades
- Li et al. (2026), [JEV-as-a-Judge: Accept When Confident, Escalate When Unsure](https://arxiv.org/abs/2609.26550): a preprint on a cascade from Jev to GPT-6

Next: [Topic modeling](topic-modeling.md) finds the themes of a collection of posts without labels.
