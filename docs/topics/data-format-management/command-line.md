# Command-line tools

It's a good habit to look at a data file before writing code for it.
Here are five common questions about a data file, each can be answered in seconds from a terminal.

1. How big is it?
2. How many records does it hold?
3. What does one record look like?
4. What fields does a record have?
5. Does it parse?

The examples use the sample files from the notebooks.
Replace the file names with your own.

## Size and length

```
$ ls -lh data/
$ wc -l data/sample.csv
       5 data/sample.csv
```

`wc -l` counts newline characters.
For a CSV that is the number of rows, minus one for the header.
For a JSONL file it is the number of records.

## The first record

```
$ head -n 3 data/sample.csv
name,age,city,occupation,salary
Alice Johnson,28,New York,Software Engineer,85000
Bob Smith,34,San Francisco,Data Scientist,95000
```

`head -n 3` prints the first three lines.
For a JSON file that is one long line, `head -c 500` prints the first 500 characters instead.

[`bat`](https://github.com/sharkdp/bat) is `cat` with syntax highlighting and line numbers.
`bat data/sample.json` shows a JSON file with colored keys and values, which makes a structure easier to read than plain text.

## jq

[`jq`](https://jqlang.github.io/jq/) is a command-line tool for viewing and querying JSON.
Install it with `brew install jq` on macOS or `apt install jq` on Ubuntu.

`jq .` pretty-prints a file.
The dot is the filter: it means "the whole value".

```
$ jq . data/sample.json
{
  "name": "Alice Johnson",
  "age": 28,
  ...
```

A filter picks out part of the value.
Keys are reached with a dot, array items with square brackets.

```
$ jq '.name' data/sample.json
"Alice Johnson"

$ jq '.address.city' data/sample.json
"New York"

$ jq '.hobbies[0]' data/sample.json
"reading"

$ jq 'keys' data/sample.json
[
  "address",
  "age",
  ...
```

Two flags you will use often.
`-c` prints one compact line instead of an indented block.
`-r` prints strings without their quotes, which is what you want when the output goes to another tool.

```
$ jq -c '.address' data/sample.json
{"street":"123 Main St","city":"New York","zipCode":"10001","coordinates":{"latitude":40.7128,"longitude":-74.0060}}

$ jq -r '.hobbies[]' data/sample.json
reading
cycling
photography
```

On a JSONL file, `jq` runs the filter on every line.
This is enough for a first look at a collection, without writing Python:

```
$ head -n 1 posts.jsonl | jq .                      # the first record, indented
$ jq -r '.author.handle' posts.jsonl | sort | uniq -c | sort -rn | head    # most frequent authors
$ jq 'select(.likeCount > 100) | .uri' posts.jsonl   # the posts with more than 100 likes
```

## Compressed files

`gzip file` compresses a file in place and adds `.gz`; `gzip -k` keeps the original.
`gunzip` reverses it.
There is no need to decompress a file to look at it: `zcat` prints it, and the output goes into the same tools.

```
$ zcat posts.jsonl.gz | wc -l
$ zcat posts.jsonl.gz | head -n 1 | jq .
```

On macOS, `zcat` may expect a `.Z` file; use `gzcat` or `gzip -dc` instead.

## Does it parse?

`jq` reports the first place a file stops being valid JSON.

```
$ jq . data/sample_broken.json
jq: parse error: Invalid numeric literal at line 2, column 17
```

Python's standard library does the same without `jq`:

```
$ python -m json.tool data/sample_broken.json
Expecting value: line 2 column 11 (char 12)
```

For a small file, a browser-based validator such as [jsonlint.com](https://jsonlint.com/) shows the same error next to the highlighted line.
For a JSON API that needs no authentication, the browser itself is a viewer: open the URL, and Firefox and Safari show the response as a collapsible tree.

## CSV in the terminal

`column` lines the values up so a CSV can be read by eye.

```
$ column -s, -t < data/sample.csv
name           age  city           occupation         salary
Alice Johnson  28   New York       Software Engineer  85000
Bob Smith      34   San Francisco  Data Scientist     95000
```

`column` does not understand quoting, so a quoted value with a comma inside it lands in the wrong column.

`bat` from the JSON section works on CSV files too.
It adds line numbers and pages a long file instead of flooding the terminal.
Its `-A` flag prints every invisible character, which settles what the separator actually is: a file that looks comma-separated may be tab-separated.
A space prints as `·`, a tab as `├──┤`, and a carriage return from a file written on Windows as `␍`.

```
$ bat -A data/sample.csv
name,age,city,occupation,salary␊
Alice·Johnson,28,New·York,Software·Engineer,85000␊
Bob·Smith,34,San·Francisco,Data·Scientist,95000␊
```

Every line here ends with a plain line feed (`␊`) and the separators are real commas, so the file is what it claims to be.

For anything beyond a first look, load the file with pandas and print `df.head()` and `df.dtypes`.
