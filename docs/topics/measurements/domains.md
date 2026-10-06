# Domain-level analysis

A domain is the name of a website, such as `nytimes.com`.
A domain-level analysis describes the links in a collection of posts by the websites that they lead to.
The descriptions come from public lists of domains, which you join to your own table of domains.

This page covers three descriptions: the type of a website, the credibility of a news site, and the audience that shares a domain.
It then shows how a cutoff turns a score into a category.

The [URL Processing notebook](url-processing.ipynb) runs all the code on this page.
The page [Processing URLs](urls.md) covers the steps that produce the table of domains.

## When to use it

Use a domain-level analysis when you want to describe the sources that a community shares, and when a list exists for the property that you need.
The method is fast and needs no scraping, because it never opens the linked pages.

A domain-level result has three limits.

- It describes the website and not the page. A reliable news site can publish a wrong article, and a platform such as YouTube hosts every kind of content.
- It covers only the domains that are on the list. Report how many of your domains and links matched.
- It takes over the definitions of the authors of the list. A credibility rating and an audience score measure what their authors defined.

The sample data of the notebook is one day of Reddit submissions about the 2022 U.S. midterm elections.
Its link posts hold 1,145 links to other websites.
These links go to 209 domains, after `youtu.be` is counted as `youtube.com`.
In the code, `domain_table` is a pandas table with one row for each domain and the number of links in the column `links`.
`pd` is pandas, and `pathlib` and `urllib.request` are modules of the standard library.

## Domain classification

The first question is what kind of website a domain is: a news site, a social media platform, a government site, a shop, or something else.

Two types are easy.
Social media platforms are few, so a short hand-written set covers them.
U.S. government, education, and military sites end with `.gov`, `.edu`, and `.mil`.
The function below checks these two rules first and then a list of news domains.
`news_domains` is the set of domains from the next section.

```python
platforms = {
    "twitter.com", "x.com", "youtube.com", "facebook.com", "instagram.com",
    "tiktok.com", "reddit.com", "twitch.tv", "t.me",
}


def domain_type(domain):
    if domain in platforms:
        return "social media"
    if domain.endswith((".gov", ".edu", ".mil")):
        return "government or education"
    if domain in news_domains:
        return "news"
    return "other"
```

In the notebook, the function gives these counts for the links of the link posts and for the links that were extracted from the text of the posts.

| Type | Links of link posts | Links in the text |
|------|:-------------------:|:-----------------:|
| News | 509 | 609 |
| Social media | 140 | 89 |
| Government or education | 1 | 113 |
| Other | 495 | 478 |
| All | 1,145 | 1,289 |

The two columns differ.
Links to government sites are almost all in the text of posts, and most of them go to websites of U.S. states and counties.
Where the links come from changes the result, so say which links you counted.

The rules have limits.
The set of platforms is hand-written, and the three endings are those of the United States.
Other countries use other forms, such as `.gov.uk` and `.ac.uk`.

The type `other` is the difficult part, and there are two options for it.

- A lookup service returns a category for a domain. [FortiGuard Labs](https://www.fortiguard.com/webfilter) has a Web Filter Lookup page: you enter a domain, and the page returns the category that the service assigns to it. A lookup page is made for single lookups by a person. Read the terms of a service before you send many requests from a program.
- Label the domains by hand. Start with the domains that have the most links, because a small number of domains usually covers most of the links.

## News domains

News is the type that research on social media uses most, for studies of news consumption, media bias, and related topics.
The [list of news domains](https://github.com/yang3kc/list_of_news_domains) holds U.S. news domains that were compiled from several existing datasets.
The file has one column, `domain`.
The notebook downloads the file from a fixed commit of the repository, so every run gets the same version, and reads it into the table `news`.
With one column, the join is a membership test.

```python
news_domains = set(news["domain"])

domain_table["is_news"] = domain_table.index.isin(news_domains)
```

In the notebook, the list has 23,516 domains.
121 of the 209 domains of the example are on the list, and 509 of the 1,145 links go to them, which is 44%.

Two points apply to every join with a domain list.

- A join matches two values only if they are written in exactly the same way. The domains of your table and of the list must have the same form: lowercase, without `www.`, and with the same choice about subdomains. This list also has entries with a subdomain, and a table of registered domains never matches them.
- "Not on the list" does not mean "not news". The list covers U.S. news domains, and it can miss a new site, a small site, and a site from another country. In the example, the most frequent domains that are not on the list are `google.com`, `twitter.com`, and `youtube.com`, followed by small websites that the list does not know.

## News domain credibility

Several organizations rate the quality of news domains.
[Media Bias/Fact Check](https://mediabiasfactcheck.com) publishes ratings of the political bias and the factual reporting of news sources on its website.
[NewsGuard](https://www.newsguardtech.com) is a company that rates news websites and licenses its ratings.

Do the rating sets agree with each other?
Lin et al. (2023) compare six sets of expert ratings and find that they generally correlate highly with one another.
The authors combine the sets into one aggregate rating for 11,520 domains and publish it in a [repository](https://github.com/hauselin/domain-quality-ratings).

A rating file is one more domain list.
It has a domain column and a score column, and you join it in the same way as the audience scores in the next section.
A rating describes the domain at the time of the rating, and it does not rate single articles.

## Audience metrics from DomainDemo

[DomainDemo](https://github.com/LazerLab/DomainDemo) (Yang et al., 2025) describes who shares a domain.
Its authors matched more than 1.5 million Twitter accounts to U.S. voter records, which give the state, age, race, gender, and party of each user.
For each domain that these users shared between 2011 and 2022, the dataset compares the users who shared it with all users in the data.
It includes the domains that at least 50 users shared.

The repository has one public file for each metric.

| Metric | File | Compares | Range | How to read it |
|--------|------|----------|:-----:|----------------|
| Localness | `derived_state_kl.csv.gz` | U.S. states | 0 or more | A larger value means a more local audience |
| Race deviation | `derived_race_kl.csv.gz` | Race categories | 0 or more | A larger value means that the shares are concentrated in some race categories |
| Age deviation | `derived_age_kl.csv.gz` | Age groups | 0 or more | A larger value means that the shares are concentrated in some age groups |
| Audience partisanship | `derived_party_leaning.csv.gz` | Democrats and Republicans | -1 to 1 | A negative value means more shares from Democrats, and a positive value more from Republicans |
| Gender leaning | `derived_gender_leaning.csv.gz` | Men and women | -1 to 1 | A negative value means more shares from men, and a positive value more from women |

A sixth file, `derived_partyreg_leaning.csv.gz`, holds the audience partisanship from party registration records.

The first three metrics use one formula, the Kullback-Leibler (KL) divergence between two distributions.
For localness:

$$
\mathcal{L}_\delta = \sum_s F_{\delta,s} \log_2 \frac{F_{\delta,s}}{F_s}
$$

- $F_{\delta,s}$ is the share of the users who shared domain $\delta$ that live in state $s$.
- $F_s$ is the share of all users in the data that live in state $s$.
- The value is 0 when the two distributions are the same. It grows when the users of the domain are concentrated in a few states.
- For the race deviation and the age deviation, the race categories or the age groups take the place of the states.

The last two metrics compare two groups.
For the audience partisanship:

$$
\mathcal{P}_\delta = \frac{\dfrac{C_{\delta,r}}{C_r} - \dfrac{C_{\delta,d}}{C_d}}{\dfrac{C_{\delta,r}}{C_r} + \dfrac{C_{\delta,d}}{C_d}}
$$

- $C_{\delta,r}$ and $C_{\delta,d}$ are the numbers of Republican and Democratic users who shared domain $\delta$.
- $C_r$ and $C_d$ are the numbers of all Republican and all Democratic users in the data. Independent users are left out.
- The value is -1 when only Democrats shared the domain, and 1 when only Republicans did.
- For the gender leaning, women and men take the place of Republicans and Democrats.

An invented example: 3% of the Republican users and 0.5% of the Democratic users shared a domain.
Its score is (0.03 - 0.005) / (0.03 + 0.005) = 0.71.

The code downloads two of the files from a fixed commit and puts them into one table, `scores`.

```python
demo_base = (
    "https://raw.githubusercontent.com/LazerLab/DomainDemo/"
    "a2a834400ad582d1c8a5150338a146f2af2a95b0/"
    "data/derived_metrics/"
)
metric_files = {
    "localness": "derived_state_kl.csv.gz",
    "party_leaning": "derived_party_leaning.csv.gz",
}

metrics = []
for name, file_name in metric_files.items():
    path = pathlib.Path("data") / file_name
    if not path.exists():
        urllib.request.urlretrieve(demo_base + file_name, path)
    metric = pd.read_csv(path).set_index("domain")
    metric.columns = [name]
    metrics.append(metric)

scores = pd.concat(metrics, axis=1)
```

In the notebook, `scores` has 129,127 domains.
These are the scores of five of them.

| Domain | Localness | Audience partisanship |
|--------|:---------:|:---------------------:|
| `cnn.com` | 0.013 | -0.132 |
| `news9.com` | 2.072 | 0.297 |
| `wickedlocal.com` | 2.221 | -0.387 |
| `msnbc.com` | 0.065 | -0.411 |
| `breitbart.com` | 0.014 | 0.302 |

People in all states share `cnn.com`, and `news9.com` and `wickedlocal.com` are local news sites in Oklahoma City and in Boston.
Democrats share `msnbc.com` more than Republicans do, and Republicans share `breitbart.com` more.

The join uses the domain as the key, and `how="left"` keeps every domain of your table, also when DomainDemo has no score for it.

```python
domain_table = domain_table.join(scores, how="left")

has_score = domain_table["localness"].notna()
```

In the notebook, 154 of the 209 domains have a score, and 989 of the 1,145 links go to them, which is 86%.
All 121 news domains have a score.

- The scores describe the Twitter users of the panel who shared a domain between 2011 and 2022. They do not describe the users in your own data.
- The scores describe an audience. They do not rate the content of the website.

The [DomainDemo explorer](https://domaindemoexplorer.streamlit.app/) shows the metrics of one domain in a browser.

## From scores to categories

Many analyses need a category and not a score: is a news domain local or national, and is its audience more Democratic or more Republican?
A rule with a cutoff turns a score into a category, and you choose the cutoff.

- The audience partisanship and the gender leaning have a natural candidate, 0.
- Localness has no natural cutoff. The authors of DomainDemo compared the score with existing lists that label news domains as local or national. They report that a cutoff of 0.243 gives the best agreement with these lists.

The cutoff for localness was chosen on news domains, so the code applies it to the news domains only.

```python
news_table = domain_table[domain_table["is_news"] & has_score].copy()

news_table["scope"] = (news_table["localness"] > 0.243).map({True: "local", False: "national"})
news_table["audience"] = (news_table["party_leaning"] > 0).map(
    {True: "more Republican", False: "more Democratic"}
)

pd.crosstab(news_table["scope"], news_table["audience"], margins=True)
```

| | More Democratic audience | More Republican audience | All |
|---|:---:|:---:|:---:|
| Local, domains | 27 | 3 | 30 |
| National, domains | 74 | 17 | 91 |
| Local, links | 54 | 12 | 66 |
| National, links | 346 | 97 | 443 |

In the example, 25% of the news domains are local (30 of 121), and 13% of the links to news domains go to local domains (66 of 509).
Both numbers are correct, and they answer different questions, so say which one you report.

The cutoff changes the result.
The notebook counts the local domains for four cutoffs.

| Cutoff for localness | Local domains, of 121 | Links to them, of 509 |
|:--------------------:|:---------------------:|:---------------------:|
| 0.1 | 55 | 138 |
| 0.243 | 30 | 66 |
| 0.5 | 15 | 25 |
| 1.0 | 6 | 8 |

![A scatter plot of 121 news domains. The horizontal axis is the audience partisanship, and the vertical axis is the localness on a log scale. Dashed lines mark the cutoffs 0 and 0.243. Most points are left of 0 and below 0.243, and many points are close to the horizontal line.](figures/news-domain-scores.png){ width="420" }

The plot shows both scores of the 121 news domains, and the size of a point grows with the number of links.
On the localness axis, the points do not form two separate groups, and many domains are close to the cutoff.

A cutoff from a paper was chosen on the data of that paper.
Read the rows near the cutoff before you use it on your own data.

- In the example, four of the ten local domains with the lowest localness are news sites from other countries, such as `lemonde.fr`. A foreign news site is not a local U.S. news site. A high localness says only that the panel users who share the domain are concentrated in a few states. The cutoff was chosen on lists of U.S. news domains, and it does not fit these rows.
- The cutoff of 0 gives a domain with a score of -0.01 the same label as a domain with a score of -0.5. In the example, 19 of the 121 news domains have a score between -0.1 and 0.1. The authors of DomainDemo also note that the score is relative, so 0 does not have to mean a politically neutral audience. Two options are a third category for the scores near 0, and an analysis that uses the score itself.

A category from a cutoff is a measurement, and it can be wrong.
Before you rely on it, [label a sample of your own domains by hand](validation.md) and compare your labels with the categories.

## Links

- [URL Processing notebook](url-processing.ipynb): all the code on this page
- [List of news domains](https://github.com/yang3kc/list_of_news_domains): the list of U.S. news domains and its sources
- [FortiGuard Web Filter Lookup](https://www.fortiguard.com/webfilter): a lookup page for the category of a domain
- [Media Bias/Fact Check](https://mediabiasfactcheck.com) and [NewsGuard](https://www.newsguardtech.com): two organizations that rate news sources
- Lin et al. (2023), [High level of correspondence across different news domain quality rating sets](https://doi.org/10.1093/pnasnexus/pgad286), and the [aggregate ratings](https://github.com/hauselin/domain-quality-ratings)
- Yang et al. (2025), [DomainDemo: a dataset of domain-sharing activities among different demographic groups on Twitter](https://doi.org/10.1038/s41597-025-05604-6): the paper, with the validation of the localness score
- [DomainDemo repository](https://github.com/LazerLab/DomainDemo): the six metric files, and the [explorer](https://domaindemoexplorer.streamlit.app/)

Next: [Validating a measurement](validation.md) covers how to check a classifier, a score, or a cutoff against labels that you assign by hand.
