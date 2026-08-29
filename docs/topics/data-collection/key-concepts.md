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

## Credentials

Keep API keys and passwords in a `.env` file that `.gitignore` excludes.
Never paste them into a notebook you will share or commit to a public repository.
A key in a public repository gets found and used by someone else within hours, and their requests count against your quota.
In Google Colab there is no `.env` file, so set the value in a cell you delete before sharing, or use the Secrets panel.

## Run it continuously

Jupyter notebooks are perfect for exploring an API and its data.
But a study needs a collector that runs for weeks on a machine that stays on, without anyone watching it.
Typically, there are two shapes of collector, and one recommended tool for each.

### Periodic jobs: `cron`

Most collection is periodic: every few minutes or hours or days, ask the API what is new, store it, and exit.
Polling the 4chan archive, searching Bluesky for the last five minutes of posts, and fetching new comments on a set of YouTube videos all have this shape.
The scheduler on Linux and macOS is `cron`.
It starts your script on a schedule and does nothing else.
Each line in the crontab is a schedule followed by a command:

```
# minute hour day month weekday  command
*/10 * * * *  cd /home/user/collector && /home/user/collector/.venv/bin/python collect.py >> collect.log 2>&1
```

This runs `collect.py` every 10 minutes and appends everything it prints to `collect.log`.
Edit the table with `crontab -e` and list it with `crontab -l`.

Some tips on creating robust cron jobs:

- **Each run starts from disk.** The script reads what it has already fetched from a file (e.g., the seen-set in the 4chan notebook), does one round, writes the file back, and exits. Nothing lives in memory between runs, so a crash loses at most one round.
- **Overlap the windows.** Search for the last 15 minutes every 10 minutes and drop duplicates by ID. An item that the platform indexed late is otherwise lost.
- **One run at a time.** If a round takes longer than the interval, the next run starts while the previous one is still writing. Try to avoid this.
- **Use absolute paths and your own Python.** `cron` runs with almost no environment: no virtual environment, no `PATH`, and no `.env` loaded by your shell. Call the interpreter inside your `.venv` by its full path and load `.env` from inside the script.
- **Log every round**, including rounds that fetched nothing, with a timestamp. Logs are the only way to diagnose a problem with your cron jobs.

### Streams: a supervisor

Some sources push data instead of waiting to be asked.
For example, the Bluesky firehose is a WebSocket that sends every event on the network as it happens; you keep one connection open and filter on your side.
A stream collector is one long-running process, not a job that exits, so `cron` is the wrong tool.
What a stream needs is a **supervisor**, a program that starts your process once, watches it, and restarts it when it dies.

[Supervisor](http://supervisord.org/) is the common choice on a research VM (`pip install supervisor` or the system package).
Here is an example configuration for the Bluesky firehose:

```ini
[program:firehose]
command=/home/user/collector/.venv/bin/python firehose.py
directory=/home/user/collector
autostart=true
autorestart=true
startsecs=10
stdout_logfile=/home/user/collector/firehose.log
stderr_logfile=/home/user/collector/firehose.err
```

Rules for the process itself:

- **Reconnect inside the script too.** The supervisor handles crashes. A dropped connection that the client library reports as an error should be caught and reconnected after a short sleep, so the process does not restart from scratch every time the network blinks.
- **Write as you go.** Append each event to a file or a database. Anything held in memory is lost when the process dies.
- **Record the gaps.** Log every connect and disconnect with a timestamp. A stream cannot backfill, so the log is the only record of what you missed.
- **Watch the disk.** A firehose collector writes continuously. Make sure you check the disk space regularly to avoid overflow.

### Either way

Run the collector on a machine that stays on, such as a university VM or a small cloud instance, not a laptop.
Check on it daily or more frequently.
Look at the log, the size of the output, and the timestamp of the last item.
Both `cron` and Supervisor can also email or log on failure.

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
