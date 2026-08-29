# Run It Continuously

Jupyter notebooks are perfect for exploring an API and its data.
But a study needs a collector that runs for weeks on a machine that stays on, without anyone watching it.
Typically, there are two shapes of collector, and one recommended tool for each.

## Periodic jobs: `cron`

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

## Streams: a supervisor

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

## Either way

Run the collector on a machine that stays on, such as a university VM or a small cloud instance, not a laptop.
Check on it daily or more frequently.
Look at the log, the size of the output, and the timestamp of the last item.
Both `cron` and Supervisor can also email or log on failure.
