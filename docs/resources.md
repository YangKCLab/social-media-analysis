# Resources

This page contains a curated list of useful resources for social media analysis, including tools, libraries, datasets, and learning materials.
The topic pages give the context for each resource, and the [research papers](papers.md) have their own page.

## Data Collection

Platform APIs:

- [Bluesky HTTP API](https://endpoints.bsky.app/#bluesky-app/description/introduction) - Reference of the Bluesky API
- [Bluesky developer guidelines](https://docs.bsky.app/docs/support/developer-guidelines) - The rules of Bluesky for API use
- [4chan API](https://github.com/4chan/4chan-API) - Documentation of the 4chan API
- [YouTube Data API v3](https://developers.google.com/youtube/v3/docs) - Documentation of the YouTube Data API

Running a collector:

- [Supervisor](http://supervisord.org/) - A tool that keeps a collector running on a server

## Data Formats

File formats:

- [JSON Lines](https://jsonlines.org/) - A file format with one JSON value per line
- [Apache Parquet](https://parquet.apache.org/) - A binary table format

Python libraries:

- [pandas](https://pandas.pydata.org/) - Python library for tables
- [orjson](https://github.com/ijl/orjson) and [ujson](https://github.com/ultrajson/ultrajson) - Faster replacements for the `json` module of Python
- [Pydantic](https://docs.pydantic.dev/) - Python library for checking the fields of a record
- [json_repair](https://github.com/mangiucugna/json_repair) - Python library that tries to repair broken JSON

Command-line tools:

- [jq](https://jqlang.github.io/jq/) - A command-line tool for viewing and querying JSON
- [bat](https://github.com/sharkdp/bat) - A version of `cat` with syntax highlighting and line numbers
- [jsonlint.com](https://jsonlint.com/) - A validator for JSON that runs in the browser

## Databases

Useful resources and tools for working with PostgreSQL:

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [psycopg3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python library that maps Python classes to tables

Other kinds of databases:

- [MongoDB](https://www.mongodb.com/) - A database that stores each record as a JSON document
- [Redis](https://redis.io/) - A key-value store that keeps the data in memory
- [Neo4j](https://neo4j.com/) - A database that stores nodes and edges

## Text Analysis Tools


Natural language processing:

- [spaCy](https://spacy.io/) - Python library for natural language processing
- [NLTK](https://www.nltk.org/) - Python library for natural language processing, with tokenizers and stopword lists
- [Gensim](https://radimrehurek.com/gensim) - Python library for topic modeling
- [langdetect](https://github.com/Mimino666/langdetect) - Python library for language detection
- [lingua](https://github.com/pemistahl/lingua) - Python library for language detection
- [shifterator](https://github.com/ryanjgallagher/shifterator) - Python library for word shift graphs, which compare two sets of texts

Word embedding:

- [gensim-data](https://github.com/piskvorky/gensim-data) - The list of pre-trained word vectors that Gensim can download
- [GloVe](https://nlp.stanford.edu/projects/glove) - Pre-trained word vectors from Stanford

Dictionaries:

- [VADER Sentiment](https://github.com/cjhutto/vaderSentiment) - Python library for sentiment analysis
- [eMFD](https://github.com/medianeuroscience/emfd) - The extended Moral Foundations Dictionary
- [eMFDscore](https://github.com/medianeuroscience/emfdscore) - Python library that scores text with the eMFD
- [vMFD](https://github.com/ZeningDuan/vMFD) - Python library for moral foundation analysis

Classifiers:

- [Text classification models on Hugging Face](https://huggingface.co/models?pipeline_tag=text-classification) - A list of trained classifiers that you can download
- [twitter-roberta-base-sentiment-latest](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest) - A sentiment classifier trained on tweets
- [Detoxify](https://github.com/unitaryai/detoxify) - Python library for toxicity detection

Topic modeling:

- [BERTopic](https://maartengr.github.io/BERTopic/index.html) - Python library for topic modeling

Content moderation:

- [Moderate Hate Speech](https://moderatehatespeech.com) - API for hate speech detection
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) - API for content moderation

Large language models:

- [LLM for Computational Social Science](https://yang3kc.github.io/llm_for_css/) - A tutorial on calling large language models from code

## Multimodal Content

Images:

- [CLIP](https://github.com/openai/CLIP) - A model from OpenAI that places text and images in one space
- [clip-ViT-B-32](https://huggingface.co/sentence-transformers/clip-ViT-B-32) - A CLIP model for the Sentence Transformers library
- [Image search examples](https://sbert.net/examples/sentence_transformer/applications/image-search/README.html) - Examples of image search, image clustering, and zero-shot classification with Sentence Transformers

Audio transcription:

- [Whisper](https://github.com/openai/whisper) - A speech recognition model from OpenAI for many languages
- [Parakeet v2](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2) and [Parakeet v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) - Speech recognition models from NVIDIA for English (v2) and for 25 European languages (v3)
- [Cohere Transcribe](https://huggingface.co/CohereLabs/cohere-transcribe-03-2026) - A speech recognition model from Cohere for 14 languages

Video:

- [Video understanding with the Gemini API](https://ai.google.dev/gemini-api/docs/video-understanding) - Documentation of a language model that accepts a video as input

## URLs and Domains

URL processing:

- [URLExtract](https://github.com/lipoja/URLExtract) - Python library for extracting URLs and domains from text
- [requests](https://requests.readthedocs.io/) - Python library for HTTP requests, used to expand shortened links
- [tldextract](https://github.com/john-kurkowski/tldextract) - Python library that finds the domain of a URL
- [Public Suffix List](https://publicsuffix.org/) - The list of domain endings that `tldextract` uses
- [The URL code of MEIU22](https://github.com/osome-iu/MEIU22/blob/main/code/package/midterm/url.py) - Code that expands shortened links, with a list of shortening services

Classification and characterization of domains:

- [List of news domains](https://github.com/yang3kc/list_of_news_domains) - A list of news domains
- [Domain quality ratings](https://github.com/hauselin/domain-quality-ratings) - A list of domains and their quality ratings
- [Media Bias/Fact Check](https://mediabiasfactcheck.com) - An organization that rates news sources
- [NewsGuard](https://www.newsguardtech.com) - An organization that rates news sources
- [DomainDemo dataset](https://github.com/LazerLab/DomainDemo) - A dataset of five metrics that describe the audience demographics of different domains
- [DomainDemo explorer](https://domaindemoexplorer.streamlit.app/) - A web page for looking up the metrics of a domain
- [FortiGuard Web Filter Lookup](https://www.fortiguard.com/webfilter) - A lookup page for the category of a domain

## Statistics

Statistical computing:

- [Scipy](https://scipy.org/) - Python library for scientific computing
- [scipy.stats](https://docs.scipy.org/doc/scipy/reference/stats.html) - The statistics functions of SciPy
- [Statsmodels](https://www.statsmodels.org/stable/index.html) - Python library for statistical modeling
- [R](https://www.r-project.org/) - A language made for statistics

Checking a measurement against labels:

- [Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html) - The part of the scikit-learn user guide on precision, recall, the F1 score, and the AUC score

Learning materials:

- [Spurious Correlations](https://www.tylervigen.com/spurious-correlations) - A collection of correlations between unrelated values
- [Berkson's paradox](https://brilliant.org/wiki/berksons-paradox/) - An explanation of how the selection of the data can create a correlation

Datasets:

- [Bot Repository](https://botometer.osome.iu.edu/bot-repository/datasets.html) - Datasets of social bot accounts and human accounts, including Botwiki-2019

## Data Visualization Tools and Resources

Data visualization libraries:

- [Matplotlib](https://matplotlib.org/) - Python library for creating static plots
- [Seaborn](https://seaborn.pydata.org/) - Python library for creating static plots
- [Plotly](https://plotly.com/python/) - Python library for creating interactive and web-based plots
- [ggplot2](https://ggplot2.tidyverse.org/) - A plotting library for the language R
- [Word cloud](https://github.com/amueller/word_cloud) - A tool for creating word clouds

Galleries of examples:

- [Python Graph Gallery](https://python-graph-gallery.com/) - A collection of examples for data visualization with Python
- [Matplotlib gallery](https://matplotlib.org/stable/gallery/index.html) - Examples of Matplotlib figures, each with its code
- [Seaborn gallery](https://seaborn.pydata.org/examples/index.html) - Examples of seaborn figures, each with its code

Figure design:

- [Ten Simple Rules for Better Figures](https://doi.org/10.1371/journal.pcbi.1003833) - An article on figure design by Rougier, Droettboom, and Bourne (2014)
- [The misuse of colour in science communication](https://doi.org/10.1038/s41467-020-19160-7) - An article on scientific color maps by Crameri, Shephard, and Heron (2020)

Color palettes and accessibility:

- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - A tool for checking the contrast of text and background colors
- [Color Oracle](https://colororacle.org/) - A tool that simulates color-vision deficiency on the whole screen
- [Scicolor](https://yang3kc.github.io/scicolor/) - A collection of color palettes for scientific data visualization
- [Scicolor on PyPI](https://pypi.org/project/scicolor/) - A Python library for selecting color palettes for scientific data visualization
- [Choosing color maps in Matplotlib](https://matplotlib.org/stable/users/explain/colors/colormaps.html) - The Matplotlib guide on its color maps

## Interactive Dashboards

- [Streamlit](https://streamlit.io/) - A library for creating interactive web applications
- [Streamlit documentation](https://docs.streamlit.io/) - The documentation of Streamlit
- [Bokeh](https://bokeh.org/) - A library for creating interactive web applications
- [Plotly Express](https://plotly.com/python/plotly-express/) - A library for creating interactive web applications
- [Altair](https://altair-viz.github.io/) - A library for creating interactive web applications

## Network Science

Network science basics:

- [A First Course in Network Science](https://www.amazon.com/First-Course-Network-Science/dp/1108471137/) - A hands-on introduction to network science and network analysis
- [Network Science Book](https://networksciencebook.com/) - Free online textbook on network science
- [Periodic table of network centrality](http://schochastics.net/sna/periodic.html) - More than one hundred centrality measures, each with a link to its paper

Network analysis:

- [NetworkX](https://networkx.org/) - Python library for network analysis and graph algorithms
- [NetworkX tutorial](https://networkx.org/documentation/stable/tutorial.html) - The tutorial of NetworkX on creating and reading networks
- [igraph](https://igraph.org/) - Fast network analysis library for Python, R, and C
- [graph-tool](https://graph-tool.skewed.de/) - Efficient Python library for network analysis with C++ backend

Network visualization:

- [Gephi](https://gephi.org/) - Software for visualizing and exploring network data
- [Gephi quick start](https://gephi.org/quickstart/) - A short guide to the first steps in Gephi
- [Helios Web](https://github.com/filipinascimento/helios-web/) - Interactive web-based network visualization tool

Datasets:

- [Character networks of A Song of Ice and Fire](https://github.com/mathbeveridge/asoiaf) - The character interaction networks of the book series, made by Andrew Beveridge
