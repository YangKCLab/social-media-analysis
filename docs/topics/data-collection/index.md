# Data Collection

Collect social media data through platform APIs. Every collection job has the same shape: authenticate if the platform requires it, ask for a page of results, keep asking until there is nothing more, and store what came back.

## Learning objectives

- Authenticate with and query a platform API
- Collect posts, threads, user profiles, and social graph data
- Recognize how the platforms' data models differ, and what that means for collection
- Page through results and respect rate limits
- Choose a sampling strategy that fits the research question

## Pages

| Page | What it covers |
|------|----------------|
| [Sampling strategies](sampling-strategies.md) | Keyword-based, user-based, graph snowball, and whole-board collection; snowball sampling for growing a keyword list, with the interactive demo |
| [Key concepts](key-concepts.md) | Pagination, rate limits, storing the raw response, credentials, and running a collector continuously |
| [Research considerations](research-considerations.md) | Terms of service, offensive content, images, the people behind the posts, and ethics review |

## Platform notebooks

One notebook per platform, split into sections that build on each other. Each opens in Google Colab; the setup instructions are at the top of the notebook. Bluesky and YouTube need credentials, 4chan needs nothing.

| Platform | Access | Sections | |
|----------|--------|----------|---|
| [Bluesky](bluesky.ipynb) | Free account and app password. Posts are searchable by keyword and time, so a collector can backfill | [Search posts](bluesky.ipynb#search-posts), [User profile](bluesky.ipynb#user-profile), [Followers](bluesky.ipynb#followers) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/bluesky.ipynb){ .colab-button } |
| [4chan](4chan.ipynb) | No key. Anonymous, no search, threads expire within hours or days, so a collector must run continuously | [Boards](4chan.ipynb#boards), [Catalog](4chan.ipynb#catalog), [Thread](4chan.ipynb#thread), [Archive](4chan.ipynb#archive), [Collect a whole board](4chan.ipynb#collect-a-whole-board) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/4chan.ipynb){ .colab-button } |
| [YouTube](youtube.ipynb) | Google API key. Every request costs quota units from a daily budget | [Search videos](youtube.ipynb#search-videos), [Channel information](youtube.ipynb#channel-information), [Video information](youtube.ipynb#video-information), [Video comments](youtube.ipynb#video-comments) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-collection/youtube.ipynb){ .colab-button } |

## Related

- [Snowball sampling demo](../../demos/snowball-sampling/index.html), an interactive page that grows a keyword list one round at a time
- [Research papers](../../papers.md), including the datasets built with the methods on this page
- [Project assignment](../../project.md), whose first stage is a continuous data collection system
