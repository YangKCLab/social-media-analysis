# Data Collection

Collect social media data through platform APIs. Every collection job has the same shape: authenticate if the platform requires it, ask for a page of results, keep asking until there is nothing more, and store what came back.

## Learning objectives

- Authenticate with and query a platform API
- Collect posts, threads, user profiles, and social graph data
- Recognize how the platforms' data models differ, and what that means for collection
- Page through results and respect rate limits
- Choose a sampling strategy that fits the research question

## Platform tutorials

Each notebook opens in Google Colab. The Bluesky and YouTube notebooks need credentials; the setup instructions are at the top of each notebook. The 4chan notebooks need nothing.

### Bluesky (AT Protocol)

Bluesky is built on the open AT Protocol. Reading public posts, profiles, and follow graphs requires a free account and an app password. Posts are searchable by keyword and time, so a collector can backfill.

| Notebook | What it does |
|----------|--------------|
| [Search posts](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/bluesky_search_posts.ipynb){ .colab-button } | Keyword search with a time bound, paged with a cursor |
| [User profile](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/bluesky_get_user_profile.ipynb){ .colab-button } | One account's public metadata and counts |
| [Followers](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/bluesky_get_followers.ipynb){ .colab-button } | The accounts that follow one account |

### 4chan

4chan is an anonymous imageboard. There are no accounts, and threads expire within hours or days. Its read-only JSON API needs no key. Because there is no search and no history, a collector must run continuously; it cannot backfill. The `/pol/` board is the one most often studied, for its role in the spread of extremist content and memes.

| Notebook | What it does |
|----------|--------------|
| [Boards](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan_boards.ipynb){ .colab-button } | List every board and the settings that matter for collection |
| [Catalog](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan_catalog.ipynb){ .colab-button } | Every live thread on a board, with a preview of its last replies |
| [Thread](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan_thread.ipynb){ .colab-button } | One complete thread, and how to recover who replies to whom |
| [Archive](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan_archive.ipynb){ .colab-button } | The IDs of threads that have expired and no longer change |
| [Collect a whole board](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan_collect_board.ipynb){ .colab-button } | Poll the archive, fetch every new thread, store it as JSONL |

### YouTube

The YouTube Data API v3 gives structured access to videos, channels, and comments. It requires a Google API key, and every request costs quota units from a daily budget.

| Notebook | What it does |
|----------|--------------|
| [Search videos](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube_search_videos.ipynb){ .colab-button } | Keyword search with a publication-date filter |
| [Channel information](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube_channel_information.ipynb){ .colab-button } | Subscriber counts, view counts, and metadata for one channel |
| [Video information](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube_video_information.ipynb){ .colab-button } | Views, likes, duration, and metadata for one or more videos |
| [Video comments](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube_video_comments.ipynb){ .colab-button } | Top-level comments and their replies, one page at a time |

## Sampling strategies

- **Keyword-based.** Collect every post that matches a list of terms. Misses relevant posts that use other words, and picks up unrelated posts when a term has more than one meaning. The [snowball sampling demo](../../demos/snowball-sampling/index.html) shows how to grow a keyword list from a few seeds.
- **User-based.** Start from a curated list of accounts and collect what they post. Fits questions about specific actors.
- **Snowball on the graph.** Start from seed accounts, collect their followers, then their followers' followers. Maps a community, but the number of requests grows by a factor of a thousand at each step, so decide the boundary before you start.
- **Whole-board or firehose.** Collect everything in a time window. Feasible only where the API allows it, such as 4chan's archive.

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
