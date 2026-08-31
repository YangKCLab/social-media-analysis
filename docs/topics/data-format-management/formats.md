# Choosing a format

Four formats cover almost everything in this course.
Two of them hold nested records and two of them hold tables.

| Format | Shape | Types | Readable by a person | Read part of a file | Use it for |
|--------|-------|-------|----------------------|---------------------|------------|
| JSON | One value, nested as deep as needed | No, text only | Yes | No, the whole file is parsed | One API response, a config file, one record |
| JSONL | One JSON value per line | No | Yes | Yes, line by line | Raw collector output, logs, any long list of records |
| CSV | Rows and columns, text | No | Yes | Yes, row by row | Small tables, sharing with people who use spreadsheets |
| Parquet | Rows and columns, binary | Yes | No | Yes, by column | Analysis tables, anything larger than a few hundred megabytes |

## JSON

JSON (JavaScript Object Notation) is the text format that every social media API returns.
It has six kinds of value:

- strings,
- numbers,
- booleans (`true`, `false`),
- `null`,
- arrays (`[...]`),
- and objects (`{"key": value}`).

Arrays and objects nest, which is why one JSON value can describe a post with its author, its embedded images, and the post it replies to.

The syntax is stricter than Python's dictionary.
Strings and keys use double quotes only.
`true`, `false`, and `null` are lowercase.
There are no trailing commas and no comments.
A file that breaks any of these rules is not JSON, and a parser rejects it.

Python's `json` module maps the types directly: an object becomes a `dict`, an array a `list`, `null` becomes `None`, and the booleans become `True` and `False`.
The [JSON notebook](json.ipynb) covers reading, writing, encoding, validation, and repair.

## JSONL

A collector produces a long list of records.
As one JSON array, the list has to be parsed in full before the first record is available, and the whole thing has to fit in memory.
A file of 100 gigabytes does not load on a machine with 32 gigabytes of RAM.

[JSON Lines](https://jsonlines.org/) (JSONL, extension `.jsonl`) stores one JSON value per line, with nothing else in the file.
Each line is parsed on its own, so a program reads a file of any size one record at a time.
A collector appends a record by writing one line, and a crash loses at most the line being written.
Every data-collection notebook on this site writes JSONL.

## CSV

CSV (comma-separated values) is a text table.
The first line names the columns.
Every other line is one row, with a comma between values.

A value that contains a comma, a double quote, or a line break is wrapped in double quotes, and a double quote inside such a value is written twice: `"Bob ""Bobby"" Smith"`.
Social media text contains all three characters, so a CSV of posts is full of quoted values.
Never split a CSV line on commas yourself; the `csv` module and `pandas` apply the quoting rules correctly.

CSV has no types.
Every value is text, and the reader guesses what it is.
The guesses are often wrong.
A common mistake is the type of an identifier with leading zeros or a large integer, which could cause serious errors for downstream analysis.
Tell the reader the type of those columns (see [Pitfalls](pitfalls.md#data-types)).

The separator does not have to be a comma.
Tab-separated files (`.tsv`) and pipe-separated files are common when the values themselves contain commas.
The [Tabular data notebook](tabular.ipynb) reads all of them.

## Parquet

[Apache Parquet](https://parquet.apache.org/) is a binary table format.
Each column carries its type, so a string column of ZIP codes comes back as strings without any argument to the reader.
Data is stored by column and compressed, so a reader can load the columns of interest without reading the rest.
`pandas` reads and writes it through the `pyarrow` or `fastparquet` packages: `to_parquet` and `read_parquet`.

Parquet is for tables that are read many times, by analysis code.
It is not for humans, and it is not for a collector to append to.

## Compression

JSON and CSV are text, and text compresses very well: the field names repeat on every line.
A JSONL file of posts shrinks by a factor of 5 to 10 under `gzip`.
Python opens compressed files directly (`gzip.open` for JSON, and `pandas` handles a `.gz` extension on its own), and every command-line tool has a compressed variant (`zcat`, `zless`).

Compress a file once it is complete.
The file a collector is still appending to stays uncompressed.

## JSON versus tables

JSON is flexible.
A record can nest, fields can be optional, and two records in the same file can have different fields.
That is what an API response looks like, and it is the right shape for storing what the API returned.

A table is what analysis wants.
Statistics, plots, joins, and machine learning all start from one row per observation and one column per variable.

A table converts to JSON without loss: one object per row, column names as keys.
The other direction is the hard one, because a table cell holds one value and a JSON field can hold an object or a list.
We demonstrate a three-step process in the [Tabular data notebook](tabular.ipynb#json-to-tabular).

1. **Flatten nested objects** into dotted column names: `author.handle`, `record.text`.
   `pandas.json_normalize` does this.
2. **Decide what to do with lists.** A list of images belongs in a second table, one row per image, joined to the post by its ID.
   A list that is only carried along can stay as a JSON string in one cell.
3. **Pick the columns.** `json_normalize` produces the union of every field in every record, most of them empty for most rows.
   Keep the columns the question needs, rename them, and set their types.

Do not force everything into one table.
Posts, authors, and media are three tables connected by identifiers.
When those tables grow and the questions need joins across them, a database is the next step.

## A storage layout for a collector

```
data/
  raw/
    2026-09-14.jsonl        # today: the collector appends to this file
    2026-09-13.jsonl.gz     # complete days, compressed
    2026-09-12.jsonl.gz
  tables/
    posts.parquet           # derived from raw/ by a script
    authors.parquet
```

- **Keep the raw responses.** The tables are derived from them, and the next question will need a field the tables left out.
- **One file per day or per round.** A single file that grows for months is hard to copy, hard to inspect, and lost in one bad write.
- **Compress complete files**, never the one being written.
- **Derive the tables with a script that can be rerun** from `raw/`. When the schema changes, rerun it.
- **Record when each item was collected**, not only when it was posted. Engagement counts are a snapshot at collection time.
