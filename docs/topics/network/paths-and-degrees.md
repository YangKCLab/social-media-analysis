# Paths and degree distributions

This page covers three features that many real networks share.

- The distances between the nodes are short. Such a network is called a small world.
- A few nodes have very many edges, and most nodes have few. The degree distribution is highly skewed.
- On average, the neighbors of a node have more edges than the node. This is the friendship paradox.

Check these features first when you describe a new network: the average distance, and the degree distribution.
They also explain why the mean degree is a poor summary of a social network.

The [NetworkX Basics notebook](networkx-basics.ipynb) runs all the code on this page.
A comment after a line of code shows the result of that line, rounded.
The code uses these imports and figure settings.

```python
import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import pandas as pd

# Figure settings: a larger font, and tick marks drawn behind the data.
plt.rcParams.update({"font.size": 14, "axes.axisbelow": True})
```

Two parts of the page use Zachary's karate club network, which has 34 members and 78 edges.
[Network basics](network-basics.md#load-a-network-from-a-file) describes the data.
The next code loads the network.

```python
import pathlib
import urllib.request

import networkx as nx

# The file is not in the site repository. This cell downloads it once from the
# public course repository, at a fixed commit.
url = (
    "https://raw.githubusercontent.com/YangKCLab/social-media-ds-course/"
    "cb145f40a693e111025273947d0e430d7d325a33/demos/network/karate.edgelist"
)
path = pathlib.Path("data") / "karate.edgelist"
path.parent.mkdir(exist_ok=True)
if not path.exists():
    urllib.request.urlretrieve(url, path)

karate_g = nx.read_edgelist(path)
karate_g.number_of_nodes()    # 34
karate_g.number_of_edges()    # 78
```

## Paths and distances

- A **path** is a route that runs along the edges of a network.
- The **length** of a path is the number of edges in it.
- There can be many paths between two nodes. The **shortest path** is the one with the fewest edges.
- The **distance** between two nodes is the length of the shortest path between them.

```python
nx.shortest_path(karate_g, "16", "17")    # ['16', '33', '3', '1', '6', '17']
nx.shortest_path_length(karate_g, "16", "17")    # 5
nx.average_shortest_path_length(karate_g)    # 2.41
```

- `nx.shortest_path` returns one shortest path between two nodes. The path from member `16` to member `17` has six nodes and five edges. Two nodes can have several shortest paths of the same length, and the function returns one of them.
- `nx.shortest_path_length` returns the distance without the path. The distance between the two members is 5.
- `nx.average_shortest_path_length` returns the average distance over all pairs of nodes. On average, two members of the club are 2.41 steps apart.

`nx.average_shortest_path_length` raises an error on a network that is not connected, because some pairs of nodes have no path between them.
See [Connected components](networks-from-posts.md#connected-components) for how to find the connected parts of a network and how to keep the largest one.

[Section 2.8 of the *Network Science* book](https://networksciencebook.com/chapter/2#paths) has drawings of paths and shortest paths in a small network.

## Small worlds

A network is a small world when the distances are short compared with the size of the network.
Many real networks are small worlds.

- **Letters.** In 1967, Stanley Milgram asked people in the United States to send a letter to a stranger through people whom they knew. The letters that arrived needed about six steps. The phrase "six degrees of separation" comes from this experiment.
- **Facebook.** In 2016, Facebook measured the distances in its friendship network of 1.59 billion people. Two people were connected through 3.57 other people on average. See the post [Three and a half degrees of separation](https://research.facebook.com/blog/2016/2/three-and-a-half-degrees-of-separation/).
- **Co-author networks.** In a co-author network, a node is a researcher, and an edge connects two researchers who wrote a paper together. The website [csauthors.net](https://www.csauthors.net/distance) finds the shortest path between two authors of computer science papers.

## Degree distributions of real networks

The degree distribution of a real network is usually highly skewed.

- A few nodes have very high degrees. These nodes are called **hubs**.
- Most nodes have low degrees.

A network whose degree distribution follows a power law is called a **scale-free** network.
In a power law, $p_k \sim k^{-\gamma}$: the share $p_k$ of the nodes with degree $k$ falls as a power of $k$, and $\gamma$ is a constant.
[Chapter 4 of the *Network Science* book](https://networksciencebook.com/chapter/4) starts with a map of the web that shows a few hubs and many pages with few links.

Two rules follow for your own analysis.

- The mean does not describe such a distribution well. Report the median.
- A plot of the distribution needs log scales.

The example is the number of followers of 698 Twitter accounts.
The number of followers is the in-degree of an account in the follower network.

The data is Botwiki-2019: 698 Twitter accounts that identified themselves as bots.
The dataset comes from the [Bot Repository](https://botometer.osome.iu.edu/bot-repository/datasets.html) ([Yang et al., 2020](https://doi.org/10.1609/aaai.v34i01.5460)), and it has the license [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).

```python
import gzip
import json
import pathlib
import urllib.request

import pandas as pd

# The file is not in the site repository. This cell downloads it once from the
# public course repository, at a fixed commit.
url = (
    "https://raw.githubusercontent.com/YangKCLab/social-media-ds-course/"
    "b4a210426ebfec34f2e983983efde03eeb3dba8d/demos/stats/botwiki-2019_tweets.json.gz"
)
path = pathlib.Path("data") / "botwiki-2019_tweets.json.gz"
path.parent.mkdir(exist_ok=True)
if not path.exists():
    urllib.request.urlretrieve(url, path)

with gzip.open(path) as f:
    botwiki = json.load(f)
botwiki_df = pd.DataFrame.from_records([item["user"] for item in botwiki])
botwiki_df = botwiki_df[["followers_count", "friends_count"]]
len(botwiki_df)    # 698
```

The code downloads the file (154 KB) into a folder `data/`, unless the file is already there.
It keeps two fields of each account, and this page plots only `followers_count`.

The follower counts differ by orders of magnitude, so a histogram with bins of the same size does not work.
`np.logspace(0, 6.2, num=20)` returns 20 bin edges from 10^0 = 1 to 10^6.2, which is about 1.6 million.
`plt.xscale("log")` puts the x-axis in log scale as well.

```python
plt.hist(botwiki_df.followers_count, bins=np.logspace(0, 6.2, num=20))
plt.xscale("log")
plt.xlabel("Number of followers")
plt.ylabel("Frequency")
plt.show()
```

![A histogram of the follower counts of 698 accounts with log bins and a log x-axis from 1 to about 1.6 million followers. The bars are highest between 10 and 100 followers. They get lower toward 100,000 followers, and one short bar is near 1 million followers.](figures/followers-histogram.png){ width="480" }

About 70% of the 698 accounts have between 10 and 1,000 followers.
A few accounts have far more, and one account has more than 1 million followers.
A log axis cannot show 0, so the one account with 0 followers is not in the plot.

[Descriptive statistics and distributions](../stats/descriptive-statistics.md#skewed-data) explains the log bins, and it shows two more plots for skewed data, the CDF and the CCDF.

## Preferential attachment

The Barabási-Albert model gives one explanation for the hubs of real networks.

1. The network starts with a few nodes and grows by one node at a time.
2. Each new node connects to a fixed number of existing nodes.
3. The probability that the new node chooses an existing node is proportional to the degree of that node. So a node with many links gets new links faster.

This rule is called preferential attachment, and the model produces scale-free networks.
[`nx.barabasi_albert_graph`](https://networkx.org/documentation/stable/reference/generated/networkx.generators.random_graphs.barabasi_albert_graph.html) creates a network with this model.
[Section 5.3 of the *Network Science* book](https://networksciencebook.com/chapter/5#barabasi-model) shows the growth of such a network step by step.

## Friendship paradox

On average, the friends of a person have more friends than the person.
This is the friendship paradox.

Let $x_i$ be the number of friends of person $i$.
There are $n$ people.
The mean of the $x_i$ is $\mu$, and their variance is $\sigma^2$.

$$
\begin{aligned}
\text{mean number of friends} &= \mu = \frac{\sum_i x_i}{n} \\
\text{mean number of friends of a friend} &= \frac{\sum_i x_i^2}{\sum_i x_i} = \mu + \frac{\sigma^2}{\mu}
\end{aligned}
$$

The reason is that a person with $x_i$ friends is counted $x_i$ times as a friend of someone.
People with many friends are counted more often.
The second mean is larger than the first one whenever people have different numbers of friends, because the variance is then larger than 0.

In the karate club network, the number of friends of a member is the degree of the node.

```python
degrees = np.array([d for _, d in karate_g.degree()])

# The mean number of friends
print(round(degrees.mean(), 2))    # 4.59
```

```python
# The mean number of friends of a friend is sum(k^2) / sum(k)
print(round((degrees**2).sum() / degrees.sum(), 2))    # 7.77
```

A member has 4.59 friends on average, and a friend has 7.77 friends on average.

The next code counts the members who have fewer friends than their own friends have on average.
`karate_g[v]` gives the neighbors of the node `v`.

```python
below = sum(
    karate_g.degree(v) < np.mean([karate_g.degree(u) for u in karate_g[v]])
    for v in karate_g
)
print(f"{below} of {karate_g.number_of_nodes()}")    # 29 of 34
```

29 of the 34 members have fewer friends than their friends have on average.

## Where the friendship paradox is used

One use is contact tracing during an epidemic.

- Forward tracing finds the people that a patient may have infected.
- Backward tracing finds the person who infected the patient.

Backward tracing follows an edge of the contact network.
A person at the end of an edge has more contacts than a random person, for the same reason as in the friendship paradox.
So backward tracing reaches the people with many contacts, who may have infected many others.
See [Kojaku et al. (2021)](https://www.nature.com/articles/s41567-021-01187-2).

The same idea works on social media data: an account that you reach by following an edge, such as a follow or a reply, tends to have more edges than a random account.

## Links

- [NetworkX Basics notebook](networkx-basics.ipynb): all the code on this page
- The NetworkX documentation of the [shortest path functions](https://networkx.org/documentation/stable/reference/algorithms/shortest_paths.html)
- Barabási, *Network Science*: [section 2.8](https://networksciencebook.com/chapter/2#paths) on paths and distances, [section 3.8](https://networksciencebook.com/chapter/3#small-worlds) on small worlds, [chapter 4](https://networksciencebook.com/chapter/4) on scale-free networks, and [chapter 5](https://networksciencebook.com/chapter/5) on the Barabási-Albert model
- The Wikipedia page on the [friendship paradox](https://en.wikipedia.org/wiki/Friendship_paradox)
- Kojaku, Hébert-Dufresne, Mones, Lehmann, and Ahn (2021), [The effectiveness of backward contact tracing in networks](https://www.nature.com/articles/s41567-021-01187-2)
- [Bot Repository](https://botometer.osome.iu.edu/bot-repository/datasets.html): the source of the Botwiki-2019 dataset, which has the license [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)

Next: [Centrality](centrality.md) measures how important each node of a network is.
