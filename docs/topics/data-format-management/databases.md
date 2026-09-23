# Databases

Files carry a collection a long way.
For example, JSONL holds the raw records, Parquet holds the analysis tables, and the [format pages](formats.md) cover both.
But files have many limitations that a database can handle.

## When files stop being enough

A program that stores data in a file must parse the file every time it reads or updates a record.

- There is no search without scanning the whole file.
- There is no random access to one record. Finding a post by its ID means reading every record before it.
- A file larger than RAM cannot be loaded at all, only streamed.

Files also offer no protection for the data itself.

- Nothing stops duplicate records.
- Nothing stops a program from writing an invalid value where a number belongs.
- Two processes appending to the same file at the same time interleave their bytes.
- A crash in the middle of a write leaves half a record at the end of the file.

A collector that runs for months hits every one of these.

## What a DBMS gives you

A database management system (DBMS) is software that stores and retrieves data on behalf of applications, according to some data model.
In exchange for defining your data up front, it gives you:

- persistent storage with efficient query and update,
- structure changes without rewriting files,
- simultaneous updates from several processes,
- crash recovery,
- security and integrity checks.

The application worries about high-level logic.
The DBMS decides how the bytes are laid out on disk.

## Data models

A data model is the collection of concepts a database uses to describe data: the types of things that can exist and how they relate.

| Data model | What a record is | Databases |
|---|---|---|
| Relational | A row in a typed table | PostgreSQL, MySQL, Oracle |
| Key/value | A value looked up by its key | Redis |
| Document | A JSON document | MongoDB |
| Graph | A node or an edge | Neo4j |

The last three are together called NoSQL databases; see [NoSQL databases](#nosql-databases) below.

## The relational model

A relational database stores data in **relations**, which everyone calls tables.
A **tuple** (row) is one record.
The **attributes** (columns) each have a name and a type.

The schema declares all of this, and the database rejects any row that violates it:

```sql
CREATE TABLE people (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    age         INT            NOT NULL CHECK (age >= 18),
    occupation  VARCHAR(120)   NOT NULL,
    salary      DECIMAL(12,2)  CHECK (salary >= 0)
);
```

Three ideas carry most of the model.

**Primary keys.**
A relation's primary key uniquely identifies a single tuple, so no two rows can be identical.
The database can generate keys (`SERIAL`), but be explicit about which column is the key.
For social media data, the platform already assigned one: the post ID.

**Foreign keys.**
A foreign key states that an attribute in one table refers to a tuple in another.
In the tables below, `people.company_id` is a foreign key to `companies.id`, so the database refuses a `company_id` that matches no company.
The foreign key goes on the "many" side of the relationship: a company has many employees, and each person works at one company.
This is how tables connect.

`people`

| id | name | … | company_id |
|---|---|---|---|
| 10001 | Alice Johnson | … | 11 |
| 10002 | Bob Smith | … | 12 |
| 10003 | Carol Lee | … | 11 |

`companies`

| id | name | location |
|---|---|---|
| 11 | Acme | New York |
| 12 | Globex | San Francisco |
| 13 | Initech | Boston |

**Constraints.**
Constraints are conditions that must hold for every row.
The database rejects any insert or update that would break one.
This is the integrity checking that flat files never do.
The schema below uses the five common kinds:

```sql
CREATE TABLE companies (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,
    location  VARCHAR(100)
);

CREATE TABLE people (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    age         INT CHECK (age >= 18),
    occupation  VARCHAR(120),
    salary      DECIMAL(12,2) CHECK (salary >= 0),
    company_id  INT REFERENCES companies(id)
);
```

| Constraint | What it rejects |
|---|---|
| `PRIMARY KEY` | A duplicate or NULL `id` |
| `UNIQUE` | A second company with the same name |
| `NOT NULL` | A person without a name |
| `CHECK` | An age below 18 |
| `REFERENCES` | A `company_id` that matches no company |

`REFERENCES` is how SQL declares a foreign key.

## SQL

SQL (pronounced "sequel") is the standard language for relational data, first introduced in the 1970s.
It has many dialects and extensions; the principles below work everywhere.

### Changing data

```sql
INSERT INTO people (name, age, occupation, salary)
VALUES ('Alice Johnson', 28, 'Software Engineer', 85000);

UPDATE people SET salary = 90000 WHERE name = 'Alice Johnson';

DELETE FROM people WHERE name = 'Alice Johnson';
```

The `WHERE` clause picks the rows a statement touches.
An `UPDATE` or `DELETE` without `WHERE` touches every row, and there is no undo.

A collector sees the same post twice all the time, so the statement it runs most is the **upsert**: insert the record, or update it if it already exists.
In PostgreSQL:

```sql
INSERT INTO posts (id, text, like_count)
VALUES (%s, %s, %s)
ON CONFLICT (id) DO UPDATE
SET like_count = EXCLUDED.like_count;
```

The first time the collector sees a post, there is no conflict, and PostgreSQL inserts the row.
The next time, the `id` already exists, so PostgreSQL updates the row instead.
A plain `INSERT` would fail with a duplicate-key error.
`EXCLUDED` is the row you tried to insert.
Only the columns listed in `SET` change; `text` is not listed, so it keeps its old value.

### Queries and aggregations

```sql
SELECT COUNT(id) FROM people;
SELECT COUNT(id) FROM people WHERE age > 30;
SELECT AVG(age)  FROM people;
```

`AVG`, `MIN`, `MAX`, `SUM`, and `COUNT` aggregate over rows.
NULL values are not counted, so be careful when counting a column that can be missing.

`GROUP BY` projects the rows into subsets and aggregates each subset, producing one output row per group:

```sql
SELECT occupation, AVG(salary)
  FROM people
  GROUP BY occupation;
```

`WHERE` filters rows before the groups form, so the two clauses combine naturally:

```sql
SELECT product, SUM(quantity)
  FROM purchase
  WHERE price > 1
  GROUP BY product;
```

### Sorting, naming, and reading a query

```sql
SELECT product, SUM(quantity) AS units
  FROM purchase
  WHERE price > 1
  GROUP BY product
  ORDER BY units DESC
  LIMIT 10;
```

| product | units |
|---|---|
| ice cream | 40 |
| apple | 30 |

- `AS` names an output column.
- `ORDER BY ... DESC` sorts largest first. `ASC`, smallest first, is the default.
- `LIMIT 10` keeps the first 10 rows.

The clauses are written in one order but run in another:

1. `FROM` and `JOIN` choose the rows.
2. `WHERE` drops rows.
3. `GROUP BY` forms groups.
4. `SELECT` computes the output columns, including the aggregates.
5. `ORDER BY` and `LIMIT` sort and cut the result.

To say what a query returns, read it in this order.
The query above returns, for purchases above $1 per unit, the total units per product, largest first, at most 10 products.
The order also explains a common error: `WHERE` runs before `SELECT`, so `WHERE` cannot use the alias `units`, but `ORDER BY` can.

### Joins

A join answers a question that needs two tables, matching rows through the foreign key:

```sql
SELECT people.name, salary, companies.name, companies.location
  FROM people JOIN companies ON people.company_id = companies.id;
```

The plain (inner) join keeps only the rows that match on both sides.
With the `people` and `companies` tables above, Initech has no employees, so it disappears:

```sql
SELECT companies.name, people.name
  FROM companies JOIN people
    ON people.company_id = companies.id;
```

| companies.name | people.name |
|---|---|
| Acme | Alice Johnson |
| Acme | Carol Lee |
| Globex | Bob Smith |

A `LEFT JOIN` keeps every row of the left table, even without a match.
The columns from the right table are NULL for those rows:

```sql
SELECT companies.name, people.name
  FROM companies LEFT JOIN people
    ON people.company_id = companies.id;
```

| companies.name | people.name |
|---|---|
| Acme | Alice Johnson |
| Acme | Carol Lee |
| Globex | Bob Smith |
| Initech | NULL |

`RIGHT JOIN` keeps every row of the right table, and `FULL JOIN` keeps the rows of both.
`LEFT JOIN` is the outer join you will use most.

**Counting zero.**
Questions of the form "for each X, how many Y" usually need a `LEFT JOIN` from X.
Otherwise the Xs with no Y are missing from the answer instead of showing 0:

```sql
SELECT companies.name, COUNT(people.id) AS n_employees
  FROM companies LEFT JOIN people
    ON people.company_id = companies.id
  GROUP BY companies.id, companies.name;
```

| name | n_employees |
|---|---|
| Acme | 2 |
| Globex | 1 |
| Initech | 0 |

Count a column from the right table, not `*`.
`COUNT(people.id)` skips the NULL in Initech's row and returns 0.
`COUNT(*)` counts rows, and Initech still has one row, so it would return 1.

### Normalization

Joins exist because well-designed databases split their data.
Consider one wide table of orders, straight from the raw data:

| order_id | employee | department | product | supplier | supplier_contact |
|---|---|---|---|---|---|
| 10001 | Alice | Sales | Laptop | HP | 555-0101 |
| 10002 | Alice | Sales | Mouse | HP | 555-0101 |
| 10003 | Bob | R&D | Keyboard | Dell | 555-0202 |
| 10004 | Alice | Sales | Keyboard | Dell | 555-0202 |

The same facts repeat: Alice's department appears three times, and each supplier's contact appears twice.
This is **redundancy**, and every repeated copy is a chance for the copies to disagree.
Redundancy causes three kinds of errors, called anomalies:

- **Update anomaly.** Alice moves to R&D. All three of her rows must change. If one is missed, the table says she is in two departments.
- **Insert anomaly.** A new supplier with no orders yet has no row to go in.
- **Delete anomaly.** Deleting order 10003, Bob's only order, also deletes the only record of Bob's department.

**Normalization** splits the raw data into related tables so each fact is stored once.
A recipe:

1. Find the entities, the things that have their own facts: employees, suppliers, products, and orders.
2. Make one table per entity, and give each table a primary key.
3. Put each fact in the table of the entity it describes. `department` describes an employee; `contact` describes a supplier.
4. Link the tables with foreign keys, on the "many" side. A supplier has many products, so `products.supplier_id` refers to `suppliers`.
5. Check that every column of the wide table now lives in exactly one table.

The result:

| Table | Primary key | Foreign keys | Other columns |
|---|---|---|---|
| `employees` | `employee_id` | | `name`, `department` |
| `suppliers` | `supplier_id` | | `name`, `contact` |
| `products` | `product_id` | `supplier_id` → `suppliers` | `name` |
| `orders` | `order_id` | `employee_id` → `employees`, `product_id` → `products` | |

When Alice moves to R&D, one row in `employees` changes.
`orders` also links employees and products: one employee orders many products, and one product is ordered by many employees.
A many-to-many relationship like this always gets its own table, with a foreign key to each side.

**A list gets its own table.**
The same rule applies to a list inside one record, such as the hashtags of a post.
Repeated columns look simple but break quickly:

| uri | text | tag1 | tag2 | tag3 |
|---|---|---|---|---|
| p1 | … | election | vote | NULL |
| p2 | … | nba | NULL | NULL |

- A post with a fourth hashtag does not fit without changing the schema.
- Posts with fewer hashtags carry NULLs.
- "Which posts use #vote?" must check every tag column: `WHERE tag1 = 'vote' OR tag2 = 'vote' OR tag3 = 'vote'`.

Instead, keep `posts(uri, text)` and add a child table `post_tags` with one row per hashtag.
Its primary key is `(uri, tag)`, and `uri` is a foreign key to `posts`:

| uri | tag |
|---|---|
| p1 | election |
| p1 | vote |
| p2 | nba |

A post can now have any number of hashtags.
`WHERE tag = 'vote'` finds the posts, and `GROUP BY uri` counts each post's hashtags.

**Joins and GROUP BY together.**
Joins reassemble the wide table when a question needs it.
Orders do not store the supplier, so "how many orders did each supplier get?" follows the foreign keys one hop at a time:

```sql
SELECT suppliers.name, COUNT(*) AS n_orders
  FROM orders
  JOIN products
    ON orders.product_id = products.product_id
  JOIN suppliers
    ON products.supplier_id = suppliers.supplier_id
  GROUP BY suppliers.supplier_id, suppliers.name;
```

The same query in words:

1. Start from `orders`: one row per order.
2. Match each order to its product on `product_id`.
3. Match each product to its supplier on `supplier_id`.
4. Group the rows by supplier, and count the rows in each group.

Group by the ID, not only the name, because two suppliers can share a name.

## Indexes

A database stores data in files too, so how does it search without scanning everything?
It builds **indexes**: additional structures that map a search key (an attribute value, often the ID) to the location of the record.

Two structures dominate.
A **B+ tree** keeps keys sorted, gives O(log n) insert, delete, and search, and supports ranges and ordering.
A **hash table** gives O(1) search but only exact match.
B+ tree is the default in practice, because `WHERE age < 30` and `ORDER BY age` need order.

```sql
CREATE INDEX index_name ON people(name);

CREATE INDEX index_occ_age ON people(occupation, age);   -- composite index
```

A composite index covers filters on several columns together, and the order of its columns matters: equality filter first, range filter later.
The `(occupation, age)` index serves all three of these:

```sql
WHERE occupation = 'Data Scientist';
WHERE occupation = 'Data Scientist' AND age < 30;
WHERE occupation = 'Data Scientist' ORDER BY age;
```

To choose an index, start from a frequent query and read its `WHERE` clause.
Suppose a dashboard shows one account's posts from the past 7 days, refreshes every minute, and the collector keeps inserting posts:

```sql
SELECT uri, text, created_at
  FROM posts
  WHERE author_did = 'did:plc:abc123'
    AND created_at >= now() - interval '7 days'
  ORDER BY created_at DESC;
```

The `WHERE` clause has an equality on `author_did` and a range on `created_at`.
Put the equality column first and the range column second:

```sql
CREATE INDEX posts_author_time ON posts(author_did, created_at);
```

The same index also returns the rows already sorted for the `ORDER BY`.
Without it, the database scans every post, every minute.

Do not index everything: every insert updates every index, so too many indexes slow the database down.
A collector table takes inserts all the time, so an index that no query uses only slows the collector down.
Index the columns your frequent queries filter on — IDs and timestamps are the common cases — and profile before adding more.
"Premature optimization is the root of all evil."

## Transactions

A transaction is a logical set of operations treated as a single unit: either all of it happens, or none of it does.
The classic example is a bank transfer — check the balance, debit one account, credit the other — where a failure halfway through must undo the whole thing.

For social media data, transactions matter most during insertion.
A post and its author's profile row should either both land or neither, even if the collector crashes between the two statements.

## Practical recommendations

Use PostgreSQL.

- Free, reliable, and installed from every Linux distribution's package manager.
- JSONB columns store a JSON document inside a table and query into it, which suits API data well; see [Querying JSON with JSONB](#querying-json-with-jsonb).
- The pgvector extension adds vector search.

From Python, two common routes:

- [SQLAlchemy](https://www.sqlalchemy.org/) is an ORM (object relational mapping) tool: it maps Python classes to tables so you never write SQL. Probably overkill for course projects.
- [Psycopg 3](https://www.psycopg.org/) is a PostgreSQL adapter: you write the SQL, it runs it. Simple, transparent, and easy to control.

```python
import psycopg  # the module name is psycopg, not psycopg3

with psycopg.connect("dbname=test user=postgres") as conn:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE test (id serial PRIMARY KEY, num integer, data text)
        """)
        cur.execute(
            "INSERT INTO test (num, data) VALUES (%s, %s)",
            (100, "abc'def"),   # placeholders: psycopg escapes, no SQL injection
        )
        cur.execute("SELECT * FROM test")
        print(cur.fetchone())
    conn.commit()  # make the changes persistent
```

Always pass values through placeholders (`%s`), never by pasting them into the SQL string.
Post text contains quotes, and a pasted string is both a bug and an injection risk.

### Querying JSON with JSONB

A JSONB column stores a whole JSON document in one cell.
PostgreSQL parses the document when it is stored, so queries can reach inside it.
(The older `JSON` type stores the text as it is; use `JSONB`.)
A common pattern is to keep each raw API record in a JSONB column:

```sql
CREATE TABLE posts (
    uri  TEXT PRIMARY KEY,
    raw  JSONB NOT NULL    -- the whole API record
);
```

One row of `raw` looks like this:

```json
{"author": {"handle": "alice.bsky.social"},
 "record": {"text": "Hello world", "langs": ["en"]},
 "likeCount": 12}
```

This query returns the handle and like count of every English post, most liked first:

```sql
SELECT raw -> 'author' ->> 'handle'  AS handle,
       (raw ->> 'likeCount')::int    AS likes
  FROM posts
  WHERE raw @> '{"record": {"langs": ["en"]}}'
  ORDER BY likes DESC;
```

| handle | likes |
|---|---|
| carol.bsky.social | 40 |
| alice.bsky.social | 12 |

- `->` returns JSON and `->>` returns text. Chain them to reach a nested field: `raw -> 'author' ->> 'handle'`.
- `::int` turns the text into an integer. Without it, `ORDER BY` compares strings, and `'100'` sorts before `'12'`.
- `@>` means "contains": it is true when the document contains the given JSON fragment.

**GIN indexes.**
A B+ tree indexes a column's whole value, so it cannot look inside a document.
A GIN (generalized inverted index) index works like the index at the back of a book.
A book index maps each word to the pages that contain it; a GIN index maps each key and value inside the documents to the rows that contain it.

```sql
CREATE INDEX posts_raw ON posts USING GIN (raw);
```

This index speeds up `@>` and the key-exists operators `?`, `?|`, and `?&`, whichever fields the query names.
It does not help `ORDER BY` or a range filter on an extracted value.
For those, index the expression with an ordinary B+ tree:

```sql
CREATE INDEX posts_likes ON posts (((raw ->> 'likeCount')::int));
```

A GIN index is large and slows inserts, because each document adds many entries.
The advice from [Indexes](#indexes) still applies: create it only for queries you run often.

JSONB does not replace the relational model.
Keep the raw record in JSONB, and copy the fields you query often into typed columns.
The typed columns get constraints and small indexes.
The JSONB column keeps the fields you did not expect to need.

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

## Next

[Modeling social media data](social-media-databases.md) applies all of this: table designs for 4chan, YouTube, and Bluesky.
