# Key Concepts

Regardless of the platform and collection strategy, some key concepts are shared.

## What the data looks like

| Type | Examples | Where it comes from |
|---|---|---|
| Content | Posts, comments, replies, hashtags, links | Search or timeline endpoints |
| Engagement | Likes, reposts, view counts | Fields on the post record |
| Accounts | Handle, description, creation date, follower counts | Profile endpoints |
| Networks | Who follows whom, who replies to whom | Graph endpoints, or reply links inside posts |
| Media | Images, videos, link cards | URLs inside the post; the files are a separate download |

Every platform has some of these and may miss others.

## Ways to get the data

| Method | Cost | What you get | Risk |
|---|---|---|---|
| Official API | Free to expensive | Structured, documented, within the rules | Rate limits; access can be withdrawn |
| Scraping | Free | Whatever is on the page | Terms of service; breaks when the page changes |
| Published datasets | Free | Someone else's collection, already cleaned | Their question, their sample, their time window |
| Data donations, partnerships | Slow | Data the API does not expose | Months of setup |

The notebooks on this site use the first row. The [research papers](../../papers.md) page lists several datasets from the third row.

## Finding the API documentation

Search for "<platform> API" and look for a developer documentation site. For the three platforms covered here:

- Bluesky: https://bsky.network/docs/bluesky-api
- 4chan: https://github.com/4chan/4chan-API
- YouTube: https://developers.google.com/youtube/v3

Find three pages before you write code: the getting-started page (how to authenticate), the endpoint reference (what you can ask for and what comes back), and the rate-limit page (how fast you can ask).

## Pagination

An endpoint returns one page and a cursor or page token.
Pass it back for the next page.
Stop when the cursor comes back empty, when the oldest item crosses your time bound, when you reach the page budget you set, or when the same cursor comes back twice.
Most collectors are a loop over pages with a sleep in it.

## Rate limits

A rate limit is how many requests you may make in a time window.

| Platform | Limit |
|---|---|
| Bluesky | 3,000 requests per 5 minutes per IP address; logins 30 per 5 minutes and 300 per day per account |
| 4chan | 1 request per second; poll a thread no more often than every 10 seconds |
| YouTube | 100 searches per day, plus 10,000 quota units per day for every other read |

Past the limit you get an error, usually HTTP `429` (Bluesky) or `403 quotaExceeded` (YouTube).
Sleep and retry; do not retry in a tight loop.
Sleep between requests even when you are under the limit.

## What the rate limit buys you

Do this calculation before you write code.
Multiply the requests per day by the items per request.
Then compare the result with the amount of data that your question needs.

| Platform | Limit | Requests per day | Items per request | Upper bound per day |
|---|---|---|---|---|
| Bluesky | 3,000 per 5 minutes | 864,000 | 100 posts per search page | 86 million posts |
| 4chan | 1 per second | 86,400 | 1 thread with all its replies | 86,400 threads |
| YouTube | 100 searches | 100 | 50 video IDs per search page | 5,000 videos from search |
| YouTube | 10,000 units | 10,000 | 50 videos, or 100 comments | 500,000 videos, or 1 million comments |

The upper bound assumes a full page on every request and a collector that never sleeps.
Real numbers are lower.

Each platform has a different limit that matters in practice:

- **YouTube: search.** Search gives at most 5,000 video IDs a day. Get the IDs another way, such as from a channel's uploads or from playlists, and the budget for other reads is large.
- **4chan: none of the API limits.** A busy board archives a few thousand threads a day. One IP address can follow several boards at one request per second.
- **Bluesky: not the rate limit.** The number of posts that match your keywords is the limit, and then your disk space.

## Storage

Plan the storage before you plan the loop.
A Bluesky post record is a few kilobytes, so a million posts take a few gigabytes.
One request per second for a month is 2.6 million requests.

## Credentials

Keep API keys and passwords in a `.env` file that `.gitignore` excludes.
Never paste them into a notebook you will share or commit to a public repository.
A key in a public repository gets found and used by someone else within hours, and their requests count against your quota.
In Google Colab there is no `.env` file, so set the value in a cell you delete before sharing, or use the Secrets panel.

## Run it continuously

A notebook is for exploring an API. A study needs a collector that runs for weeks without anyone watching it: periodic jobs under `cron`, and stream collectors under a supervisor.
See [Run it continuously](run-it-continuously.md).

## Choosing a platform

Here we provide a comparison of the three platforms covered in this site.
Readers are encouraged to explore other platforms and their APIs.

| | Bluesky | 4chan | YouTube |
|---|---|---|---|
| Access | Free account, app password | None needed | Google API key |
| Search | Keyword and time | None | Keyword and date |
| Accounts | Handles, DIDs, profiles | None | Channels |
| Network | Follows and followers | Reply links inside a thread | None readable |
| History | Posts stay | Threads deleted in hours to days | Videos stay |
| Rate limit | 3,000 per 5 min | 1 per second | 100 searches per day |

Pick from the research question, then check that the platform can answer it.
Not the other way around.
