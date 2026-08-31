# Pitfalls

The problems below account for most of the time lost between collecting data and analyzing it.
Each one is easy to avoid once you know it exists.

## Encoding

A file is bytes.
An encoding is the rule that turns text into those bytes.
Social media text contains emoji, accented letters, and non-Latin scripts, so the choice of encoding matters.

Use UTF-8 everywhere.
Every API returns it, every modern tool reads it, and every other choice creates a file that some program will read wrong.

- Open text files with `encoding="utf-8"` in Python. The default depends on the operating system, and on Windows it is not UTF-8.
- `json.dumps` escapes non-ASCII characters as `\uXXXX` by default. The output is valid and any parser reads it back correctly. Pass `ensure_ascii=False` when a person will read the file.
- `UnicodeDecodeError` on reading means the file was written in a different encoding. Find out which one; do not pass `errors="ignore"`, which deletes characters silently.
- A CSV saved by Excel may start with a byte order mark. Read it with `encoding="utf-8-sig"`, which strips the mark.

The [JSON notebook](json.ipynb#encoding) shows the failure and the fix.

## Quoting in CSV

A post's text can contain commas, double quotes, and line breaks.
CSV handles all three by wrapping the value in double quotes.
Code that splits a line on commas does not, and it produces rows with the wrong number of fields, shifted columns, and no error message.

- Read CSV with the `csv` module or pandas, never with `line.split(",")`.
- Write CSV with `csv.writer` or `DataFrame.to_csv`. They add the quotes where needed.
- When a table comes from someone else, print the first rows and the `dtypes`. A numeric column that arrived as text is the usual sign of a shifted row.

The [Tabular data notebook](tabular.ipynb#broken-csv) shows what pandas does with a damaged file: it reads it without complaint, and the result is wrong.

## Data types

CSV has no types, so the reader guesses.
The guess fails on identifiers.

- A FIPS code `01001` becomes the integer `1001`. A ZIP code loses its leading zero.
- A 19-digit post ID is larger than a double-precision float can hold exactly. Any tool that reads it as a float, including Excel, changes the last digits.
- A YouTube video ID such as `dQw4w9WgXcQ` is text. A Bluesky DID is text. A 4chan post number is a true integer, and arithmetic on it makes sense.

Identifiers are strings.
Pass `dtype={"id": "str"}` to `read_csv`, or use Parquet, which stores the type in the file.

Timestamps are the other type that arrives wrong.
Keep the ISO 8601 string the API sent (`2025-08-26T04:36:32.229Z`), and parse it into a timezone-aware datetime in UTC when you need to compute with it.

## Broken JSON

Sometimes you will deal with broken JSON and the parser will stop at the first error.
Broken JSON comes from a few places:

- A collector that crashed while writing, leaving half a record at the end of the file.
- A language model that was asked for JSON and added a sentence before it or a trailing comma inside it.
- A file edited by hand, with single quotes or a Python `False` in it.
- A Python `print(obj)` saved to a file. The Python representation of a dict uses single quotes and is not JSON.

The error message names the line and column.
For a truncated JSONL file, you can simply drop the last line.

You can also try [`json_repair`](https://github.com/mangiucugna/json_repair), which guesses the intended structure; check the result, because it is a guess.

## Validate at the boundaries

Valid JSON is not the same as correct data.
A record can parse and still be missing a field, carry a string where a number belongs, or hold a single value where a list was expected.

It's recommended to validate data at the boundaries of the pipeline, where it enters from an API, from a user, or from a language model.
[Pydantic](https://docs.pydantic.dev/) does this from a class definition, and its error message names the field and the problem.
The [JSON notebook](json.ipynb#validate-with-pydantic) has the pattern.

## Missing fields

API responses omit fields that do not apply.
For example, a 4chan post without text has no `com` key, and a Bluesky post without an attachment has no `embed` key.
`obj["embed"]` raises `KeyError` on such a record, so we recommend using `obj.get("embed")` instead, which returns `None`.

When many records with different fields are flattened into one table, the result has every field that appeared in any record, with empty cells where a record did not have it.
That is expected.
Choose the columns you need and drop the rest.

## Memory

`json.load` on a 20 gigabyte file needs more than 20 gigabytes of memory, and then fails due to memory exhaustion.
`pd.read_csv` on a file larger than memory would fail the same way.
Here are some suggestions to avoid this:

- Store long lists of records as JSONL and read them line by line.
- Use `chunksize` in `read_csv` to process a large CSV one piece at a time.
- Use Parquet and read only the columns a question needs.
- Do not call `f.read()` on a file you have not measured.

## Spreadsheets

Excel and Google Sheets open CSV files, which makes them useful for a first look at a small table.
They are not recommended for storing or editing data.

Excel converts a value that looks like a date into a date, strips leading zeros, rounds long integers, and writes the file back with the system encoding.
A CSV that went through Excel and back is a different file.
Be careful with these files.
