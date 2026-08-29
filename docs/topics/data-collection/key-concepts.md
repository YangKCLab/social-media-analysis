# Key Concepts

Every collector, on every platform, runs into the same five things. The platform notebooks show each of them in code; this page states the rules once.

- **Pagination.** An endpoint returns one page and a cursor or page token. Pass it back for the next page, and stop when it comes back empty, when the oldest item crosses your time bound, or when you reach the page budget you set.
- **Rate limits.** Sleep between requests even when you are under the limit. On an error, wait and retry; do not retry in a tight loop.
- **Store the raw response.** One JSON object per line in a `.jsonl` file, as it arrived. Derive fields later. Record when you collected each item, not only when it was posted.
- **Credentials.** Keep API keys and passwords in a `.env` file that `.gitignore` excludes. Never paste them into a notebook you will share.
- **Run it continuously.** A collector for an ephemeral platform runs from `cron` for the length of the study. Log every round, so a collector that stops is noticed.
