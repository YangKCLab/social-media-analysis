# Multimodal content

Many social media posts contain more than text.
A post can carry an image, an audio clip, or a video.
On some platforms, such as TikTok, most posts are videos.
Content in more than one of these forms is called multimodal content.
This page covers the methods that measure images, audio, and video: simple image processing, trained image models, image embedding, vision language models, and transcription.

This page is an overview with links to the tools and the papers.
It has no notebook and no code.

## When to use it

Use these methods when the research question is about something that the text of a post does not contain.
Three examples are what the memes of a community show, what the speakers of a podcast say, and what the videos about a topic show.

Start with the text when the text of the posts can answer the question.
The methods for text are older and better tested than the methods on this page.
The methods on this page also have three costs.

- The files are large. Images, audio, and video take more time to collect and more space to store than text.
- The models are large. Some of them need a GPU or a paid service.
- The results are harder to check. To check one label, a person has to look at an image or listen to a clip, which takes longer than reading a short post.

## Visual content: formats and features

Peng, Lu, and Shen (2023) list what a study can measure in visual content.
They name four formats: photograph, video, meme, and data visualization.
They separate two kinds of features.

| Kind of feature | What it is | Examples from the paper |
|-----------------|------------|-------------------------|
| Objective | A property of the image itself | Color: brightness, hue, saturation. Composition: visual complexity, symmetry. People and objects: faces, facial expressions, objects, symbols, settings. Video: length, camera cuts |
| Perceived | A judgment that a viewer makes | Professional quality, aesthetic appeal, perceived realism, vividness, sentiment, impression |

The paper is about the credibility of visual misinformation.
The two kinds of features are useful for other studies too, because they need different methods.
A program can compute an objective feature such as brightness directly from the pixels.
A perceived feature such as aesthetic appeal exists only in the judgment of people.
To measure it, you need labels from people, or a model whose output was compared with labels from people.

Decide the format and the feature first, and choose the method after that.

## Four approaches to images

| Approach | What it does | What it needs | Main limit |
|----------|--------------|---------------|------------|
| Simple image processing | Computes numbers from the pixels, such as the brightness or the main colors | An image library and no trained model | It measures objective features only. It does not know what the image shows |
| End-to-end deep learning model | A model that was trained on labeled images takes an image and returns a label, such as an object or a facial expression | A trained model for your label, or labeled images to train one | It returns only the labels that it was trained on |
| Embedding | A model turns each image into a vector. Similar images get vectors that are close to each other | A pre-trained embedding model and no labels | A similarity is not a label. You still have to read the similar images or the clusters and say what they mean |
| Vision language model | You give the model an image and a question in plain language, and it answers in text | Access to a large model, often through a paid service, and a written prompt | The answer can be wrong, and it can change with the wording of the prompt |

The table goes from the simplest approach to the most flexible one.
A more flexible approach costs more for each image and needs a more careful check.
The second approach has the same limit as a text [classifier](classifiers.md).

## Image embedding

An image embedding is a vector for an image, in the same way as a [word embedding](word-embedding.md) is a vector for a word.
A model that was trained on a very large collection of images produces the vector.
Similar images get similar vectors, and the cosine similarity measures how close two vectors are.

The article [The Super Effectiveness of Pokémon Embeddings Using Only Raw JSON and Images](https://minimaxir.com/2024/06/pokemon-embeddings/) by Max Woolf shows this with drawings of game characters.
It embeds the official drawing of each character and ranks the other drawings by their similarity to one drawing.
The drawing of a bird is closest to the drawings of other birds.
The drawing of a character with the shape of a ball is closest to other round characters, and the drawing of a blue character is closest to other blue characters.
The author concludes that the model reacts to simple visual properties, such as shape and color.

This result shows what "similar" means here.
Two images are similar when the model gives them close vectors.
The model can group images by a property that does not matter for your question, such as the main color.
Look at the most similar images of several examples before you use the similarities.

Image embeddings make two analyses possible without any labels.

- Find similar images. Start from one image and list its nearest neighbors. This finds copies and edited versions of the same picture, for example the variants of one meme.
- Cluster the images. Group the vectors with a clustering method, and look at a sample of each group. This gives a first description of the kinds of images in a collection, in the way [topic modeling](topic-modeling.md) does for text.

## Text and images in one space

Some models have two parts: one part embeds images, and the other part embeds text.
The two parts are trained on pairs of an image and its caption, so that a text and an image with the same content get close vectors.
The vectors of texts and the vectors of images are then in the same space, and you can compare a text with an image.

This makes two more analyses possible.

- Search images with a text query. Embed a query such as "a crowd at a protest" as text, and rank the images by their similarity to the query.
- Assign labels without training. Write one short description for each label, embed the descriptions, and give each image the label whose description is closest. This is called zero-shot classification.

The article above tests the search with questions.
It embeds a question such as "what looks like an ice cream cone?" as text and ranks the drawings by their similarity to it.
Most of the top results fit the question, and some do not.
The article also reports that the similarity between a text and an image is low, about 0.10 in the best case.
Compare the similarities of one query with each other, and do not use one fixed cutoff for all queries.

[CLIP](https://github.com/openai/CLIP) from OpenAI is a well-known model of this kind.
The [Sentence Transformers](https://sbert.net/examples/sentence_transformer/applications/image-search/README.html) package loads it under the name [`clip-ViT-B-32`](https://huggingface.co/sentence-transformers/clip-ViT-B-32).
This model is a download of about 600 MB, and it runs on a CPU.
The article above uses another pair of models, `nomic-embed-vision-v1.5` for the images and `nomic-embed-text-v1.5` for the text.

## Vision language models

A vision language model takes an image and a text prompt, and it returns text.
You show the model an image and ask a question in plain language.
The model can describe the image, answer a question about it, or choose one label from a list of labels that you define.
No training is needed, so one model serves many tasks.

Alexander et al. (2024) test this on charts that were posted in tweets.
A chart can mislead by its design, for example with a truncated axis, or by its reasoning, for example with data that were selected to support a claim.
The authors give three GPT-4 models the text of the tweet and the chart, and they ask whether the chart has one specific problem of this kind.
They compare four designs of the prompt.
The models detect misleading charts with moderate accuracy when the prompt gives no guidance.
The accuracy is higher when the prompt contains the definition of the problem.
No single prompt design is the best for all kinds of misleading charts.

Three points follow for your own use of such a model.

- The result depends on the prompt. Write the labels and their definitions into the prompt, use the same prompt for every image, and report it.
- Many vision language models are hosted services. With a hosted service, your images leave your machine, so check first that the rules for your data allow this.
- The answer is the output of a model. It needs a [check against labels that you assign by hand](validation.md).

Many vision language models are large language models that also accept images, and you call them through the same API.
The tutorial site [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/) covers the steps for text: the API key, the first call, structured output, and batch processing.

## Turn the content into text first

One general method works for images, audio, and video: turn the content into text, and then analyze the text.

- An image becomes a description that a vision language model writes.
- An audio clip becomes a transcript.
- A video becomes the descriptions of some of its frames and the transcript of its audio.

After this step you have a text analysis task, and the text pages of this section apply.
You can count the words of the transcripts as a [bag of words](bag-of-words.md), score them with a [dictionary](dictionaries.md) or a [classifier](classifiers.md), find their themes with [topic modeling](topic-modeling.md), or compare them by meaning with an [embedding](word-embedding.md).

The text keeps only a part of the content.
A description contains what the model chose to write, and it leaves out most of the image.
A transcript contains the words, and it leaves out the voice.
When your question is about a feature that the text does not keep, this method does not answer it.

## Audio

The main method for audio is transcription: a speech recognition model turns the speech into text.
Whisper and Parakeet are two open models for this task.
You download a model and run it on your own machine, so you need no key and the audio stays on your machine.

- [Whisper](https://github.com/openai/whisper) from OpenAI is a general-purpose speech recognition model. Its documentation says that it recognizes speech in many languages and that its accuracy varies widely by language. The code and the models have the MIT license. Whisper has several model sizes. The three smallest ones, `tiny`, `base`, and `small`, are downloads of about 75 MB to 480 MB and run on a CPU. Whisper needs the command-line tool `ffmpeg` to read audio files.
- [Parakeet](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2) from NVIDIA is a model for English transcription. Its model card says that the output has punctuation, capital letters, and a time for each word. The model card states the license CC BY 4.0 and says that the model is optimized for NVIDIA GPUs. The model is a download of about 2.5 GB.

A transcript does not contain everything in an audio clip.
The emotion in a voice, the music, and the genre of a recording are not in the words.
Measuring them needs other models, which this page does not cover.

## Video

A video has three parts.

| Part | How to analyze it |
|------|-------------------|
| Visual content | Save some frames as images, and use the image methods above |
| Audio | Transcribe it, and use the text methods |
| Time | This part is still difficult to analyze |

The first two rows turn a video into images and text, so the methods above apply.
You choose how many frames to save, for example one frame for every few seconds.
More frames cost more, and fewer frames can miss a short scene.

The third row is the hard part.
The meaning of a video depends on the order of its scenes and on how one event leads to the next.
Separate frames lose this information.
Video is an important form of content, and its analysis is still difficult.
Say in your report which parts of the videos you analyzed and which parts you did not.

## Check the output before you trust it

A description, a transcript, a label, and a similarity are all outputs of a model.
A model can make errors, and it makes them more often on content that differs from its training data.
The check is [the same as for any classifier](validation.md).

- Read a sample. Open a random sample of the images next to their descriptions or labels. Listen to a random sample of the clips while you read their transcripts.
- Label a sample by hand. Assign your own labels to the sample without looking at the output of the model, and then count how often the two agree.
- Read the disagreements. They show which kinds of content the model gets wrong.
- Check each step. When a transcript goes into a text classifier, an error can come from the transcript or from the classifier.

Report the model, its version, the prompt, and the result of this check together with your findings.

## Links

- Peng, Lu, and Shen (2023), [An Agenda for Studying Credibility Perceptions of Visual Misinformation](https://doi.org/10.1080/10584609.2023.2175398): the formats and the two kinds of features, in Figure 3 of the paper
- Max Woolf (2024), [The Super Effectiveness of Pokémon Embeddings Using Only Raw JSON and Images](https://minimaxir.com/2024/06/pokemon-embeddings/): the article on image embeddings, with the similarity plots
- Alexander et al. (2024), [Can GPT-4 Models Detect Misleading Visualizations?](https://arxiv.org/abs/2408.12617): the paper on misleading charts, with examples of the charts and the four prompt designs
- Radford et al. (2021), [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020): the CLIP paper
- [CLIP](https://github.com/openai/CLIP): the code and the models from OpenAI
- [`clip-ViT-B-32`](https://huggingface.co/sentence-transformers/clip-ViT-B-32) and the [image search examples](https://sbert.net/examples/sentence_transformer/applications/image-search/README.html) of Sentence Transformers: image search, image clustering, duplicate images, and zero-shot classification
- [Whisper](https://github.com/openai/whisper): the code and the table of model sizes
- [Parakeet](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2): the model card of `parakeet-tdt-0.6b-v2`
- [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/): a tutorial on calling large language models from code

Next: [Processing URLs](urls.md) covers how to extract the links in posts, expand shortened links, and find their domains.
