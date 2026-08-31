# Modeling social media data

The [Databases](databases.md) page covers the relational model in the abstract.
This page applies it to the three platforms whose data the [collection notebooks](../data-collection/index.md) produce, then looks at the NoSQL alternatives.

The recipe is the same for every platform:

1. One table per kind of record the API returns.
2. The platform's IDs become primary keys.
3. References between records become foreign keys.
4. Keep the raw JSON as well. The tables are derived, and the next question will need a field they left out.

## 4chan

The [4chan API](https://github.com/4chan/4chan-API) has three concepts:

- **Post**: the unit. Every post has a numeric ID (`no`) and a timestamp (`time`).
- **Thread**: an OP post plus its replies. A reply's `resto` field holds the OP's post number; an OP has `resto = 0`.
- **Board**: a container of threads, identified by a short name like `pol`.

There are no users to model, since posting is mostly anonymous.

Post numbers repeat across boards, so a post is identified by the pair `(board, no)`:

```sql
CREATE TABLE posts (
    board       VARCHAR(10)  NOT NULL,
    no          BIGINT       NOT NULL,
    resto       BIGINT       NOT NULL,   -- 0 for an OP, else the thread's OP
    time        TIMESTAMP    NOT NULL,
    name        TEXT,
    com         TEXT,                    -- the post body, HTML
    PRIMARY KEY (board, no)
);
```

A thread is a query, not a table: `WHERE board = %s AND (no = %s OR resto = %s)`.

## YouTube

The [YouTube Data API](https://developers.google.com/youtube/v3/docs) returns four kinds of records, each with its own ID:

- **Video**: `id`, `snippet.channelId`, `snippet.publishedAt`, title, description, statistics.
- **Channel**: `id`, title, country.
- **Comment**: `id`, text, like count, and `snippet.parentId` when it replies to another comment.
- **Comment thread**: a top-level comment on a video (`snippet.videoId`) plus its replies.

Four record kinds, four tables, connected by the IDs the API already provides:

- `videos.channel_id` references `channels.id`
- `comments.video_id` references `videos.id`
- `comments.parent_id` references `comments.id`, NULL for a top-level comment

## Bluesky

In the [Bluesky lexicons](https://github.com/bluesky-social/atproto/tree/main/lexicons/app/bsky):

- **Post**: the unit, identified by its `uri` (and content hash `cid`), carrying the text in `record` and the engagement counts.
- **Replies are also posts.** A reply's `reply` object points at two other posts: `parent` and `root`.
- **Profile**: the author. The `did` is the stable identifier; the `handle` can change, so it is an attribute, not a key.

```sql
CREATE TABLE profiles (
    did         TEXT PRIMARY KEY,
    handle      TEXT,
    created_at  TIMESTAMP
);

CREATE TABLE posts (
    uri         TEXT PRIMARY KEY,
    author_did  TEXT REFERENCES profiles(did),
    text        TEXT,
    created_at  TIMESTAMP,
    parent_uri  TEXT,      -- NULL when the post is not a reply
    root_uri    TEXT,
    like_count  INT,
    repost_count INT
);
```

`parent_uri` is deliberately not declared as a foreign key: a collection often contains a reply without its parent, and a strict constraint would reject the reply.
Which constraints to enforce is a design decision, not an automatism.

Engagement counts are a snapshot of the moment of collection.
If the change over time matters, store one row per observation with a `collected_at` timestamp instead of overwriting.

## Worked example: YouTube videos shared on Bluesky

A study of which YouTube videos circulate on Bluesky needs both platforms in one database.
The collector stores Bluesky posts.
A script then extracts the YouTube links from the post text and fetches each video from the YouTube API.

The recipe still applies: four kinds of records, four tables, and the references become foreign keys.
The `posts` table gains one column, `video_id`, which is the bridge between the two platforms.
The YouTube tables are created first, because a foreign key's target table must exist before the key can point at it:

```sql
CREATE TABLE channels (
    id     TEXT PRIMARY KEY,
    title  TEXT
);

CREATE TABLE videos (
    id            TEXT PRIMARY KEY,
    channel_id    TEXT REFERENCES channels(id),
    title         TEXT,
    published_at  TIMESTAMP
);

CREATE TABLE profiles (
    did     TEXT PRIMARY KEY,
    handle  TEXT
);

CREATE TABLE posts (
    uri         TEXT PRIMARY KEY,
    author_did  TEXT REFERENCES profiles(did),
    text        TEXT,
    created_at  TIMESTAMP,
    video_id    TEXT REFERENCES videos(id)
);
```

`video_id` is NULL when the post links no video.
This design keeps only the first video link per post.
A post with several links would need a separate table that maps posts to videos, one row per pair.

The payoff is that questions spanning both platforms become single queries.
Which videos does one handle share?

```sql
SELECT videos.title
  FROM posts
  JOIN profiles ON posts.author_did = profiles.did
  JOIN videos   ON posts.video_id   = videos.id
  WHERE profiles.handle = 'example.bsky.social';
```

## Databases behind dashboards

A database that a collector keeps filling is what sits under a live dashboard.
Two examples from the Observatory on Social Media:

- [Midterm 2022 election dashboard](https://osome.iu.edu/tools/midterm22)
- [CoVaxxy vaccine-discussion dashboard](https://osome.iu.edu/tools/covaxxy)

## NoSQL databases

Relational databases have two structural limits.
They scale vertically — a bigger server, more RAM — which gets expensive and eventually hits hardware limits, and their strong constraints make it hard to split the data across machines.
And they are not flexible: a schema that changes frequently, or data that is not tabular at all, fights the model.

NoSQL ("not a relational DBMS", despite the name) databases give up the strict schema and the joins in exchange for horizontal scaling — add machines to a cluster to share the load — and flexible record shapes.

### Document databases: MongoDB

A document database skips normalization and stores each record as is.
Some data is duplicated, but one read operation answers a query, and the document carries its own structure.
[MongoDB](https://www.mongodb.com/) is the best-known example: each record is a JSON document, and queries reach into fields with dot notation such as `"contact.phone.number"`.

The drawbacks mirror the benefits.
The flexibility becomes a liability when different writers use inconsistent field names, so the integrity checks a relational schema did for you become your job, repeated in every application.
Storage as BSON (binary JSON) adds metadata to every document, and the redundancy of denormalized data is inevitable.
Query capabilities are weaker than SQL's.

### Key-value stores: Redis

[Redis](https://redis.io/) (REmote DIctionary Server) is an in-memory key-value store: a giant hashtable that lives in memory, extremely fast and lightweight.
Typical uses are caching frequent queries, managing user sessions, and rate limiting.
It usually runs alongside another database rather than replacing it.

### Graph databases: Neo4j

[Neo4j](https://neo4j.com/) stores nodes, edges, and their properties natively, which makes relationship queries fast, and it ships graph operations such as shortest paths.
Queries use a declarative language called Cypher:

```
MATCH p = SHORTEST 1 (wos:Station)-[:LINK]-+(bmv:Station)
WHERE wos.name = "Worcester Shrub Hill" AND bmv.name = "Bromsgrove"
RETURN length(p) AS result
```

## Final thoughts

Most of the time, use PostgreSQL.
It is free, reliable, and rich in features, and it also covers the neighboring use cases: JSONB for document-shaped data and pgvector for embeddings.
Consider a NoSQL database only when PostgreSQL cannot fulfill the need, which for course-scale projects is very rare.
