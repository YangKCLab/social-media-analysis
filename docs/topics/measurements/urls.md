# Processing URLs

Many social media posts contain a link to a web page.
A link shows what the author shared, and it can be analyzed without reading the text of the post.
A URL is the address of a web page, such as `https://www.example.com/news/story`, and this page uses the words "URL" and "link" for the same thing.

Raw links cannot be counted as they are.
This page covers the four steps that prepare them: extract the URLs from the text, expand shortened links, remove query parameters, and extract the domain.
Most analyses then describe the domain of a link, which is the name of the website, and not the linked page.

The [URL Processing notebook](url-processing.ipynb) runs all the code on this page.

## When to use it

Use these steps when your research question is about what people share: which websites a community links to, how much of it is news, or how the sources of two groups differ.

The steps describe the address of a link.
They do not describe the content of the linked page, and they do not say whether the author agrees with it.
A post can share a link to criticize it.

The sample data of the notebook is one day of Reddit submissions about the 2022 U.S. midterm elections, from the public MEIU22 dataset.
A submission is a post that starts a thread on Reddit, and the notebook uses 1,832 of them.

## Extracting URLs from text

Some platforms return the links of a post in a separate field, so check the documentation of the API first.
Reddit returns the link of a link post in the field `url`.
When the links are only in the text, you have to find them yourself.

[`urlextract`](https://github.com/lipoja/URLExtract) finds URLs in plain text.
It looks for a known ending of a domain name, such as `.com`, and then extends the match to both sides, so it also finds a link without `https://`.
The posts below are hand-written.

```python
posts = [
    "The video is at https://youtu.be/jNQXAC9IVRw and the paper is at doi.org/10.1093/pan/mpn018",
    "County results are on a map (https://www.example.org/results/#map). Refresh often.",
    "Read www.nytimes.com/section/politics, then come back.",
    "I did not expect this.It was close.",
]
```

```python
from urlextract import URLExtract

extractor = URLExtract()

for post in posts:
    print(extractor.find_urls(post))
```

```text
['https://youtu.be/jNQXAC9IVRw', 'doi.org/10.1093/pan/mpn018']
['https://www.example.org/results/#map']
['www.nytimes.com/section/politics,']
['this.It']
```

The first two results are correct, and the other two show what can go wrong.

- The third link ends with a comma that belongs to the sentence.
- The last post has no link. A space is missing after `this.`, and `.it` is the ending of Italian domain names, so `this.It` looks like a domain.

The function below repairs what a rule can repair.
It removes punctuation at the end of a link, and it adds `https://` to a link that has no scheme, because the later steps need the scheme.

```python
def extract_urls(text):
    """Return the URLs in a text, without punctuation at the end and with a scheme."""
    urls = []
    for url in extractor.find_urls(text, only_unique=True):
        url = url.rstrip(".,;:!?")
        if not url.lower().startswith(("http://", "https://")):
            url = "https://" + url
        urls.append(url)
    return urls
```

The false link `https://this.It` remains.
An error of this kind shows up later as a strange domain with one link.

In the notebook, 214 of the 1,832 submissions have a URL in their text, and `extract_urls` finds 1,289 URLs in them.
The text of a Reddit post is written in Markdown, and 43 of the 1,289 URLs, about 3%, still contain a piece of Markdown, such as a backslash.
Extraction from text is never perfect.
When the platform returns the link in a field, use the field, and when you extract links from text, read a sample of the results.

## Expanding shortened links

A shortened link is a short address that forwards the visitor to the real address.
Some platforms shorten every outside link, and some users share links from a shortening service.
`https://youtu.be/jNQXAC9IVRw` is the short form of `https://www.youtube.com/watch?v=jNQXAC9IVRw`.

A shortened link hides where it goes.
You need the long form before you can count or classify anything.
For most services, the only way to get it is to send an HTTP request with [`requests`](https://requests.readthedocs.io/) and follow the redirects.

```python
import requests


def expand_url(url, timeout=10):
    """Follow the redirects and return the final URL."""
    try:
        r = requests.head(url, allow_redirects=True, timeout=timeout)
        return r.url
    except requests.RequestException:
        return url    # keep the original URL if the request fails
```

- A `HEAD` request asks for the headers only, so the page itself is not downloaded.
- `timeout=10` stops the request when the server does not answer within 10 seconds.
- A failed request raises an exception. The function catches it and returns the link unchanged.

In the notebook, `expand_url("https://youtu.be/jNQXAC9IVRw")` returns `https://www.youtube.com/watch?v=jNQXAC9IVRw&feature=youtu.be`.
A link to a host that does not exist comes back unchanged.
So does `doi.org/10.1093/pan/mpn018`, because `requests` refuses a link without a scheme.

This step depends on other websites, so it is the least reliable of the four.

- A failed link looks the same as a link that was never shortened. Count the links that come back unchanged.
- Some sites answer a `HEAD` request with an error, and some block requests that come from a program or from a cloud service. The function then returns the last address that it reached.
- The last address can be a page that asks for a login or for consent to cookies.
- The target of a link can change after the post was written, and shortening services shut down.

Send as few requests as you can.
Expand only the links of known shortening services, expand each distinct link once, pause between two requests to the same site, and save the results.
In the notebook, the link posts contain 31 links on `youtu.be`, which are 9 distinct links, and the notebook expands five of them with a pause of one second.
The MEIU22 repository has a [fuller version](https://github.com/osome-iu/MEIU22/blob/main/code/package/midterm/url.py) of this step, with a list of about 140 shortening services.

## Removing query parameters

[`urlsplit`](https://docs.python.org/3/library/urllib.parse.html) from the standard library separates the parts of a URL.
For the hand-written URL `https://www.example.com/news/2022/how-votes-are-counted?utm_source=reddit&utm_medium=social#comments`, the netloc is `www.example.com`, the path is `/news/2022/how-votes-are-counted`, and the query is `utm_source=reddit&utm_medium=social`.
The netloc is the name of the server, and the path names the page.
The query follows the `?` and is a list of `key=value` pairs, which are called query parameters.

Many query parameters only track where a visitor came from.
The parameters that start with `utm_` are the most common ones.
The page is the same with and without them, so without a cleaning step, one article that was shared from five apps counts as five different URLs.

The simplest rule removes the whole query.
It is wrong for the sites that keep the content in the query.
YouTube keeps the ID of the video in the parameter `v`, so this rule turns `https://www.youtube.com/watch?v=jNQXAC9IVRw` into `https://www.youtube.com/watch`, which is the same address for every video.

A more careful rule removes only the parameters that are known to track visitors.

```python
from urllib.parse import parse_qsl, urlencode

tracking_keys = {"fbclid", "gclid", "igshid", "feature", "ref"}


def remove_tracking(url):
    """Remove the tracking parameters and the fragment of a URL."""
    parts = urlsplit(url)
    kept = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not key.startswith("utm_") and key not in tracking_keys
    ]
    return parts._replace(query=urlencode(kept), fragment="").geturl()
```

This rule keeps every tracking parameter that is not in the set.
To find them, count the keys in your own data.
In the notebook, 219 of the 1,832 links have a query, and these are the most frequent keys.

| Key | Links | What it is |
|-----|:-----:|------------|
| `feed_id` | 112 | Unknown at first |
| `_unique_id` | 112 | Unknown at first |
| `utm_source` | 32 | Tracking |
| `utm_medium` | 25 | Tracking |
| `v` | 23 | The ID of a YouTube video. It must stay |

For an unknown key, read some of the links.
In the example, the 112 links with `_unique_id` are only 70 different addresses without the query, and the path of each link already names one article.
The two keys do not select the page, so the notebook adds them to `tracking_keys`.
The count alone does not show this: the YouTube links also share one path, and there the key selects the video.

In the notebook, the 1,832 submissions hold 1,281 distinct links, and 1,237 remain after `remove_tracking`.
No rule is right for every website, so report the rule that you used.

## Extracting the domain

The netloc is not the domain yet, because it can start with a subdomain, such as `www.` or `news.`.
Taking the last two parts of the name does not work.
For `news.bbc.co.uk` it returns `co.uk`, because the ending of a domain can have two parts.

[`tldextract`](https://github.com/john-kurkowski/tldextract) uses the [Public Suffix List](https://publicsuffix.org/), a public list of all endings under which people can register a domain.
It splits a URL into the subdomain, the domain, and the suffix.
The function below joins the domain and the suffix, which gives the registered domain.

```python
def get_domain(url):
    """Return the registered domain of a URL in lowercase, or None if it has none."""
    e = tldextract.extract(url)
    if not e.domain or not e.suffix:
        return None
    return f"{e.domain}.{e.suffix}".lower()


for url in [
    "https://WWW.NYTimes.com/section/politics",
    "https://news.bbc.co.uk/2/hi/uk_news",
    "https://example.github.io/project/",
    "/r/AskReddit/comments/abc123/",
]:
    print(get_domain(url), "<-", url)
```

```text
nytimes.com <- https://WWW.NYTimes.com/section/politics
bbc.co.uk <- https://news.bbc.co.uk/2/hi/uk_news
github.io <- https://example.github.io/project/
None <- /r/AskReddit/comments/abc123/
```

- The function lowercases the result, because `NYTimes.com` and `nytimes.com` are the same website.
- The function drops the subdomain. This is the usual choice for news sites, and it is wrong for a hosting service: every website on GitHub Pages becomes `github.io`. `tldextract.TLDExtract(include_psl_private_domains=True)` builds an extractor that keeps `example.github.io`. Decide this before you count.
- The last URL is a relative address, which is valid only inside one website. It has no domain.

In the notebook, 33 of the 1,832 links have no domain, and 654 stay on Reddit, on `reddit.com` or `redd.it`.
The other 1,145 links go to 210 other domains.

## Counting domains

A count of links for each domain is the simplest result, and it can mislead.
The code below counts three numbers for each domain: the links, the distinct links, and the distinct communities that posted them.
In the code, `outside` is the table of the 1,145 links, with the cleaned link in `clean_url`.

```python
domain_table = (
    outside.groupby("domain")
    .agg(
        links=("clean_url", "size"),
        distinct_links=("clean_url", "nunique"),
        subreddits=("subreddit", "nunique"),
    )
    .sort_values("links", ascending=False)
)
```

The table shows the eight domains with the most links, and no full links, because the path of a link can contain the name of an account.
The notebook replaces the `subreddit` value of every post on a user profile with the text `user profile`, so all these posts count as one community.

| Domain | Links | Distinct links | Subreddits |
|--------|:-----:|:--------------:|:----------:|
| `google.com` | 298 | 25 | 3 |
| `twitter.com` | 77 | 73 | 16 |
| `youtube.com` | 58 | 32 | 44 |
| `foxnews.com` | 54 | 25 | 5 |
| `cnn.com` | 35 | 11 | 19 |
| `cnbc.com` | 30 | 10 | 8 |
| `theguardian.com` | 24 | 10 | 8 |
| `nytimes.com` | 17 | 12 | 5 |

- One website can have two domains. The row for `youtube.com` includes 31 links on `youtu.be`. Every `youtu.be` link leads to `youtube.com`, so the notebook replaces the domain with a dictionary and sends no request.
- A link count does not say how many people shared a domain. The 298 links to `google.com` are 25 distinct links from 3 subreddits, and the 35 links to `cnn.com` come from 19 subreddits. The number of links measures volume, and a few very active accounts can produce most of it.
- The domain is not always the publisher. Almost all of the `google.com` links show a page of another website through Google, and that page is on a service where anyone can build a website. A link to a social media platform has the same limit.

## URL-level analysis

An analysis at the level of the URL uses the content of the linked page: its title, its text, or its images.
To get the content, you have to scrape the page, which means that a program downloads it and takes the content out of the HTML.

This is harder than the steps above, and this page does not cover it.
Many pages need a login or a subscription, many sites block programs, and a page can change or disappear after the post was written.

Do the four steps first in every case: clean the URLs and remove the duplicates, so that the program requests each page once.
In the example, the 1,145 links to other websites are 575 distinct links after the cleaning step.

## Links

- [URL Processing notebook](url-processing.ipynb): all the code on this page
- [`urlextract`](https://github.com/lipoja/URLExtract): finds URLs in text
- [`requests`](https://requests.readthedocs.io/) for HTTP requests, and [`urllib.parse`](https://docs.python.org/3/library/urllib.parse.html) in the Python documentation for `urlsplit`, `parse_qsl`, and `urlencode`
- [`tldextract`](https://github.com/john-kurkowski/tldextract) and the [Public Suffix List](https://publicsuffix.org/)
- [The URL code of MEIU22](https://github.com/osome-iu/MEIU22/blob/main/code/package/midterm/url.py): a fuller version of the expansion step, with a list of shortening services
- Aiyappa et al. (2023), [A Multi-Platform Collection of Social Media Posts about the 2022 U.S. Midterm Elections](https://arxiv.org/abs/2301.06287): the paper of the MEIU22 dataset

Next: [Domain-level analysis](domains.md) describes the domains with public lists: the type of a website, its credibility, and its audience.
