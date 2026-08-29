# Key Concepts

Every collector, on every platform, runs into the same things: what the data looks like, how to get it, how to page through it without hitting the rate limit, and how to store it. The platform notebooks show each of them in code; this page states the rules once.

## What the data looks like

| Type | Examples | Where it comes from |
|---|---|---|
| Content | Posts, comments, replies, hashtags, links | Search or timeline endpoints |
| Engagement | Likes, reposts, view counts | Fields on the post record |
| Accounts | Handle, description, creation date, follower counts | Profile endpoints |
| Networks | Who follows whom, who replies to whom | Graph endpoints, or reply links inside posts |
| Media | Images, videos, link cards | URLs inside the post; the files are a separate download |

Every platform has some of these and is missing others. 4chan has no accounts. YouTube has no follow graph you can read. Check what the platform exposes before you commit to a research question that needs it.

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

- Bluesky: https://docs.bsky.app
- 4chan: https://github.com/4chan/4chan-API
- YouTube: https://developers.google.com/youtube/v3

Find three pages before you write code: the getting-started page (how to authenticate), the endpoint reference (what you can ask for and what comes back), and the rate-limit page (how fast you can ask). A Python SDK saves work, but it is one more thing that can be out of date, so keep the HTTP reference open next to it.

## Pagination

An endpoint returns one page and a cursor or page token. Pass it back for the next page. Stop when the cursor comes back empty, when the oldest item crosses your time bound, when you reach the page budget you set, or when the same cursor comes back twice. Every collector is a loop over pages with a sleep in it.

## Rate limits

A rate limit is how many requests you may make in a time window.

| Platform | Limit |
|---|---|
| Bluesky | 3,000 requests per 5 minutes per IP address; logins 30 per 5 minutes and 300 per day per account |
| 4chan | 1 request per second; poll a thread no more often than every 10 seconds |
| YouTube | 100 searches per day, plus 10,000 quota units per day for every other read |

Past the limit you get an error, usually HTTP `429` (Bluesky) or `403 quotaExceeded` (YouTube). Sleep and retry; do not retry in a tight loop. Sleep between requests even when you are under the limit. Log in or build the client once per run, not once per request.

## Store the raw response

Write one JSON object per line to a `.jsonl` file, as it arrived. Derive fields later. Record when you collected each item, not only when it was posted; engagement counts are a snapshot at collection time.

## Credentials

Keep API keys and passwords in a `.env` file that `.gitignore` excludes. Never paste them into a notebook you will share. A key in a public repository gets found and used by someone else within hours, and their requests count against your quota. In Google Colab there is no `.env` file, so set the value in a cell you delete before sharing, or use the Secrets panel.

## Run it continuously

A collector for an ephemeral platform runs from `cron` for the length of the study. Keep the record of what has already been fetched on disk, so a restart does not refetch everything. Log every round, so a collector that stops is noticed. Overlap consecutive time windows by a minute or two and drop duplicates, so an item indexed late is not lost.

## Choosing a platform

| | Bluesky | 4chan | YouTube |
|---|---|---|---|
| Access | Free account, app password | None needed | Google API key |
| Search | Keyword and time | None | Keyword and date |
| Accounts | Handles, DIDs, profiles | None | Channels |
| Network | Follows and followers | Reply links inside a thread | None readable |
| History | Posts stay | Threads deleted in hours to days | Videos stay |
| Rate limit | 3,000 per 5 min | 1 per second | 100 searches per day |

Pick from the research question, then check that the platform can answer it. Not the other way around.
