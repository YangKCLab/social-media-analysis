# Data Format and Management

In this module, you will learn how social media data is stored: the file formats that APIs return and that analysis tools read, and the databases that hold a collection once files are no longer enough.

Every platform API returns JSON.
Every analysis tool wants a table.
Most of the work between collecting data and analyzing it is moving records between those two shapes without losing anything on the way.

## Learning objectives

- Read and write JSON, JSONL, CSV, and Parquet files in Python
- Choose a format for raw data, for analysis tables, and for sharing
- Inspect a data file from the command line before writing code for it
- Recognize the common failures: text encoding, quoting, lost leading zeros, broken JSON, and files too large for memory
- Convert nested JSON into tables, and tables back into JSON
- Explain what a database adds over files: search, integrity, concurrency, and crash recovery
- Design relational tables for social media data and query them with SQL
- Decide when PostgreSQL is enough and when a NoSQL database fits better

## Pages

| Page | What it covers |
|------|----------------|
| [Choosing a format](formats.md) | JSON, JSONL, CSV, and Parquet: what each is for and how they compare; JSON versus tables; compression; a storage layout for a collector |
| [Command-line tools](command-line.md) | Look at a file before writing code: `head`, `wc`, `jq`, `bat`, `gzip`, and the questions to ask of a new file |
| [Pitfalls](pitfalls.md) | Encoding, quoting, data types, broken JSON, validation, memory, and spreadsheets |
| [Databases](databases.md) | Why files stop being enough; the relational model, SQL, indexes, transactions; PostgreSQL and psycopg; NoSQL databases and when to use them |
| [Modeling social media data](social-media-databases.md) | Table designs for 4chan, YouTube, and Bluesky, and a cross-platform worked example |

## Notebooks

The notebooks use small sample files that they download on first run, so they work in Colab without setup.

| Notebook | Sections | |
|----------|----------|---|
| [JSON](json.ipynb) | [Load JSON](json.ipynb#load-json), [Dump JSON](json.ipynb#dump-json), [Encoding](json.ipynb#encoding), [Faster JSON libraries](json.ipynb#faster-json-libraries), [Broken JSON](json.ipynb#broken-json), [Validate with Pydantic](json.ipynb#validate-with-pydantic), [JSONL](json.ipynb#jsonl), [Compression](json.ipynb#compression) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-format-management/json.ipynb){ .colab-button } |
| [Tabular data](tabular.ipynb) | [Plain Python](tabular.ipynb#plain-python), [The csv module](tabular.ipynb#the-csv-module), [pandas](tabular.ipynb#pandas), [Broken CSV](tabular.ipynb#broken-csv), [Other separators](tabular.ipynb#other-separators), [Data types](tabular.ipynb#data-types), [Compression](tabular.ipynb#compression), [Parquet](tabular.ipynb#parquet), [Large files](tabular.ipynb#large-files), [Tabular to JSON](tabular.ipynb#tabular-to-json), [JSON to tabular](tabular.ipynb#json-to-tabular) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/data-format-management/tabular.ipynb){ .colab-button } |

## Related

- [Data collection](../data-collection/index.md), whose notebooks produce the JSON that this module stores and converts
- [Project assignment](../../project.md), whose first stage stores what a collector produces
