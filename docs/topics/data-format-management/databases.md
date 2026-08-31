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
A foreign key states that an attribute in one table maps to a tuple in another.
If `companies.employee` is a foreign key to `people.id`, the database refuses an employee value that matches no person.
This is how tables connect.

**Constraints.**
User-defined conditions that must hold for every row: `NOT NULL`, `CHECK (age >= 18)`, uniqueness.
The database prevents any modification that would violate them.
This is the integrity checking that flat files never do.

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

### Joins

A join answers a question that needs two tables, matching rows through the foreign key:

```sql
SELECT people.name, salary, companies.name, companies.location
  FROM people JOIN companies ON people.id = companies.employee;
```

The plain (inner) join keeps only the rows that match on both sides.
Outer joins (`LEFT`, `RIGHT`, `FULL`) also keep the rows without a match; they are rarely needed compared to inner joins.

### Normalization

Joins exist because well-designed databases split their data.
Consider one wide table of orders, straight from the raw data:

| order_id | name | department | product | supplier | supplier contact |
|---|---|---|---|---|---|
| 10001 | Alice | Sale | Laptop | HP | xxxxxx |
| 10002 | Bob | R&D | Keyboard | Dell | yyyyy |

The same employee, product, and supplier repeat across rows, and every repeated copy is a chance for the copies to disagree.
What happens when Alice switches departments, or a supplier changes its contact?

**Normalization** splits the raw data into related tables so each fact is stored once:

- `employees(employee_id, name, department)`
- `suppliers(supplier_id, name, contact)`
- `products(product_id, name, supplier_id)`
- `orders(order_id, product_id, employee_id)`

When Alice switches departments, one row changes.
Joins reassemble the wide table when a question needs it.

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

Do not index everything: every insert updates every index, so too many indexes slow the database down.
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
- JSONB columns store a JSON document inside a table and query into it, which suits API data well.
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
