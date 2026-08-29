# Data Collection

Collect social media data through platform APIs. Every collection job has the same shape: authenticate if the platform requires it, ask for a page of results, keep asking until there is nothing more, and store what came back.

## Learning objectives

- Authenticate with and query a platform API
- Collect posts, threads, user profiles, and social graph data
- Recognize how the platforms' data models differ, and what that means for collection
- Page through results and respect rate limits
- Choose a sampling strategy that fits the research question

## Platform tutorials

One notebook per platform, each split into sections that build on each other. Every notebook opens in Google Colab. The Bluesky and YouTube notebooks need credentials; the setup instructions are at the top of each notebook. The 4chan notebook needs nothing.

### Bluesky (AT Protocol)

Bluesky is built on the open AT Protocol. Reading public posts, profiles, and follow graphs requires a free account and an app password. Posts are searchable by keyword and time, so a collector can backfill.

[Bluesky notebook](bluesky.ipynb) · [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/bluesky.ipynb){ .colab-button }

| Section | What it does |
|----------|--------------|
| [Search posts](bluesky.ipynb#search-posts) | Keyword search with a time bound, paged with a cursor |
| [User profile](bluesky.ipynb#user-profile) | One account's public metadata and counts |
| [Followers](bluesky.ipynb#followers) | The accounts that follow one account |

### 4chan

4chan is an anonymous imageboard. There are no accounts, and threads expire within hours or days. Its read-only JSON API needs no key. Because there is no search and no history, a collector must run continuously; it cannot backfill. The `/pol/` board is the one most often studied, for its role in the spread of extremist content and memes.

[4chan notebook](4chan.ipynb) · [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan.ipynb){ .colab-button }

| Section | What it does |
|----------|--------------|
| [Boards](4chan.ipynb#boards) | List every board and the settings that matter for collection |
| [Catalog](4chan.ipynb#catalog) | Every live thread on a board, with a preview of its last replies |
| [Thread](4chan.ipynb#thread) | One complete thread, and how to recover who replies to whom |
| [Archive](4chan.ipynb#archive) | The IDs of threads that have expired and no longer change |
| [Collect a whole board](4chan.ipynb#collect-a-whole-board) | Poll the archive, fetch every new thread, store it as JSONL |

### YouTube

The YouTube Data API v3 gives structured access to videos, channels, and comments. It requires a Google API key, and every request costs quota units from a daily budget.

[YouTube notebook](youtube.ipynb) · [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube.ipynb){ .colab-button }

| Section | What it does |
|----------|--------------|
| [Search videos](youtube.ipynb#search-videos) | Keyword search with a publication-date filter |
| [Channel information](youtube.ipynb#channel-information) | Subscriber counts, view counts, and metadata for one channel |
| [Video information](youtube.ipynb#video-information) | Views, likes, duration, and metadata for one or more videos |
| [Video comments](youtube.ipynb#video-comments) | Top-level comments and their replies, one page at a time |

## Sampling strategies

A platform holds far more than one study needs. A sampling strategy is the rule that decides which posts or accounts to collect. Four common ones:

- **Keyword-based.** Collect every post that matches a list of terms. Misses relevant posts that use other words, and picks up unrelated posts when a term has more than one meaning. Snowball sampling, described below, is the usual way to build the list.
- **User-based.** Start from a curated list of accounts and collect what they post. Fits questions about specific actors, such as candidates in an election.
- **Snowball on the graph.** Start from seed accounts, collect their followers, then their followers' followers. Maps a community, but the number of requests grows by a factor of a thousand at each step, so decide the boundary before you start.
- **Whole-board or firehose.** Collect everything in a time window. Feasible only where the API allows it, such as 4chan's archive or the Bluesky firehose.

### Snowball sampling for keywords

Keyword-based collection is only as good as the keyword list, and the list is rarely complete on the first try. A researcher who starts from `vaccine` will miss posts that only say `vax`, `Pfizer`, or `VAERS`. Snowball sampling grows the list from the data itself. The procedure:

1. Start with a few **seed keywords** that are clearly about the topic.
2. Search for posts that contain the seeds. Count the other terms (words, hashtags, mentions) that appear in those posts.
3. Terms that **co-occur** with the seeds more often than expected are candidates. Read them and keep the ones that belong to the topic; drop the rest.
4. Add the kept terms to the list and search again with the new terms.
5. Repeat until a round finds nothing new. The list has **saturated**.

The picture behind this is a network. Each keyword is a node, and two keywords are connected when they appear together in posts. Snowball sampling is a search over that network, one ring of neighbors per round. It rests on two assumptions:

- **The network is connected.** Every relevant keyword can be reached from the seeds through a chain of co-occurrence. When part of the vocabulary never appears together with the rest, the seeds cannot reach it, and only adding a seed from that part fixes it.
- **The list is finite.** There is a limited set of terms about the topic, so the search eventually runs out of new terms and stops.

The **[snowball sampling demo](../../demos/snowball-sampling/index.html)** runs this search one round at a time over a network of 112 climate-related keywords. With the default seeds `climate change` and `global warming` it finds 2, 12, 52, 87, and then 98 keywords, and stops there: the 14 keywords about carbon taxes and deforestation are not reachable, because nothing in the found set co-occurs with them. Adding `carbon tax` and `deforestation` as seeds reaches all 112. The keyword network in the demo is made up for teaching; on a real platform the co-occurrence counts come from the posts you collect.

Things that go wrong in practice:

- **False positives.** A term that belongs to the topic in one context has other meanings elsewhere. In the 2022 U.S. midterm collection, `vote` matched posts about the American Music Awards and elections in other countries, and `midterm` matched posts about exams. Step 3 needs a human, not only a count.
- **Drift.** Each round moves one step away from the seeds. After a few rounds the candidates are about a neighboring topic. Stop when the candidates stop being about the question, not when the count stops growing.
- **Seeds decide coverage.** Two seeds from the same sub-community reach that sub-community and little else. Pick seeds that span the vocabularies the question needs, for example one from each side of a debate.
- **The list is a snapshot.** New terms appear as the event unfolds. For a collection that runs for weeks, repeat the search on the collected data every so often and add what turns up.

Two published datasets built this way are on the [research papers](../../papers.md) page: CoVaxxy, which grew a list of COVID-19 vaccine keywords from a handful of seeds, and the 2022 U.S. midterm election collection, which used the same method across five platforms.

## Key concepts

- **Pagination.** An endpoint returns one page and a cursor or page token. Pass it back for the next page, and stop when it comes back empty, when the oldest item crosses your time bound, or when you reach the page budget you set.
- **Rate limits.** Sleep between requests even when you are under the limit. On an error, wait and retry; do not retry in a tight loop.
- **Store the raw response.** One JSON object per line in a `.jsonl` file, as it arrived. Derive fields later. Record when you collected each item, not only when it was posted.
- **Credentials.** Keep API keys and passwords in a `.env` file that `.gitignore` excludes. Never paste them into a notebook you will share.
- **Run it continuously.** A collector for an ephemeral platform runs from `cron` for the length of the study. Log every round, so a collector that stops is noticed.

## Research considerations

- **Terms of service.** Read the platform's API rules before collecting. Prefer the official API to scraping.
- **Offensive content.** 4chan boards, and parts of every platform, contain material that is offensive, hateful, or not safe for work. Decide in advance which boards or communities the research question needs, and collect only those. Think about your own exposure and that of anyone who will read the data.
- **Images.** Post records carry file names, not files. Download images only when the research question needs them.
- **People.** Anonymous posts still describe real people. Do not try to identify posters, do not republish posts with identifying details, and do not collect private or deleted content.
- **Ethics review.** Ask your institution's review board whether a study of public social media data needs review before you collect. The answer depends on what you collect and what you do with it.
