# Centrality

A centrality measure gives each node of a network a number for its importance.
Use one to find the nodes that matter most: the accounts that get the most replies, the accounts that connect two groups, or the pages that many other pages link to.

Importance can mean different things, so there are many measures.
Different measures can rank the same nodes in different orders.
Choose the measure that fits your question, and say which one you used.

The [Centrality and Communities notebook](centrality-and-communities.ipynb) runs all the code on this page.
A comment after a line of code shows the result of that line, rounded.
The code uses these imports.

```python
import matplotlib.pyplot as plt
import networkx as nx
import pandas as pd
```

## What centrality measures

| Measure | What it measures | A node has a high value when | Function |
|---------|------------------|------------------------------|----------|
| Degree centrality | The number of edges of a node, divided by the number of other nodes | It has many neighbors | `nx.degree_centrality` |
| Closeness | The inverse of the average distance from a node to all other nodes | It can reach the other nodes in few steps | `nx.closeness_centrality` |
| Betweenness | How often a node is on the shortest path between two other nodes | Many shortest paths pass through it, so it connects parts of the network | `nx.betweenness_centrality` |
| PageRank | The chance that a random walk along the edges is at the node | Important nodes link to it | `nx.pagerank` |
| Eigenvector centrality | A value for each node that is proportional to the sum of the values of its neighbors | Its neighbors have high values | `nx.eigenvector_centrality_numpy` |

There are many more measures.
The [periodic table of network centrality](http://schochastics.net/sna/periodic.html) lists more than one hundred of them.
The [Wikipedia page on centrality](https://en.wikipedia.org/wiki/Centrality) shows one network colored by six measures, and each measure marks different nodes as the most central.

## PageRank

PageRank was made to rank webpages.
A page is important if important pages link to it.

One way to think about it is a random surfer.
The surfer visits the pages by following the links at random.
The PageRank of a page is the chance of finding the surfer at that page.

$$
PR(p_i) = \frac{1-d}{N} + d \sum_{p_j \in M(p_i)} \frac{PR(p_j)}{L(p_j)}
$$

- $N$ is the number of pages.
- $M(p_i)$ is the set of pages that link to the page $p_i$.
- $L(p_j)$ is the number of links on the page $p_j$.
- $d$ is the damping factor. The surfer follows a link with probability $d$ and jumps to a random page with probability $1-d$.

The damping factor is usually 0.85, and this is the default of `nx.pagerank` (the argument `alpha`).
On an undirected network, `nx.pagerank` counts each edge as two links, one in each direction.

The [Wikipedia page on PageRank](https://en.wikipedia.org/wiki/PageRank) has a drawing of a small network with the PageRank of each page.

## Example: a character network

The example uses the character interaction networks of the book series "A Song of Ice and Fire", made by Andrew Beveridge: [mathbeveridge/asoiaf](https://github.com/mathbeveridge/asoiaf).
A node is a character.
An edge connects two characters whose names appear within 15 words of each other in a book.
Each book has its own edge list.

```python
import pathlib
import urllib.request

import networkx as nx
import pandas as pd

# The files are not in the site repository. This cell downloads them once from
# the repository of the data, at a fixed commit.
url = (
    "https://raw.githubusercontent.com/mathbeveridge/asoiaf/"
    "4003f7928ee65da712e9db44b3df860375d958e5/data/"
)
data_dir = pathlib.Path("data")
data_dir.mkdir(exist_ok=True)
for name in ["asoiaf-book1-edges.csv", "asoiaf-book2-edges.csv"]:
    if not (data_dir / name).exists():
        urllib.request.urlretrieve(url + name, data_dir / name)

got_book_1_edges = pd.read_csv(data_dir / "asoiaf-book1-edges.csv")
got_book_2_edges = pd.read_csv(data_dir / "asoiaf-book2-edges.csv")
len(got_book_1_edges)    # 684
len(got_book_2_edges)    # 775
```

The code downloads the two files (28 KB and 32 KB) into a folder `data/`, unless the files are already there.
Each row of a table is one edge.
The columns `Source` and `Target` hold the names of the two characters, and the column `weight` holds the number of times that the two names appear close to each other.

`nx.from_pandas_edgelist` builds a network from an edge list in a table.
The arguments `source` and `target` name the two columns that hold the nodes.

```python
G_1 = nx.from_pandas_edgelist(
    got_book_1_edges, source="Source", target="Target", create_using=nx.Graph()
)
G_2 = nx.from_pandas_edgelist(
    got_book_2_edges, source="Source", target="Target", create_using=nx.Graph()
)

print(G_1.number_of_nodes(), G_1.number_of_edges())    # 187 684
print(G_2.number_of_nodes(), G_2.number_of_edges())    # 259 775
```

The network of book 1 has 187 nodes and 684 edges.
The network of book 2 has 259 nodes and 775 edges.
This code ignores the column `weight`, so every edge counts the same.

## Compute the measures

NetworkX has one function for each measure.
Each function returns a dictionary from node to value.
The function below puts the five dictionaries in one table, with one row for each node.

```python
def centrality_table(G):
    return pd.DataFrame(
        {
            "degree_centrality": nx.degree_centrality(G),
            "betweenness": nx.betweenness_centrality(G, normalized=True),
            "closeness": nx.closeness_centrality(G),
            "pagerank": nx.pagerank(G),
            "eigenvector": nx.eigenvector_centrality_numpy(G),
        }
    )


centrality_df_1 = centrality_table(G_1)
centrality_df_2 = centrality_table(G_2)
```

`nx.pagerank` and `nx.eigenvector_centrality_numpy` need the package `scipy`.

Degree centrality in NetworkX is the degree divided by the number of other nodes.
The next code checks this for one character.

```python
print(G_1.degree("Eddard-Stark"))    # 66
print(G_1.degree("Eddard-Stark") / (G_1.number_of_nodes() - 1))    # 0.355
print(centrality_df_1.loc["Eddard-Stark", "degree_centrality"])    # 0.355
```

Eddard Stark has 66 edges, and book 1 has 186 other characters.
66 / 186 = 0.355, which is the value in the table.

Sort the table by one measure to find the most central nodes.
`kind="stable"` keeps two nodes with the same value in the order of the table, so each run gives the same order.

```python
ranked = centrality_df_1.sort_values("degree_centrality", ascending=False, kind="stable")
ranked.head(10).round(3)
```

The code returns the ten characters with the highest degree centrality in book 1.
A node name has a hyphen in place of each space.

| | degree_centrality | betweenness | closeness | pagerank | eigenvector |
|---|---|---|---|---|---|
| Eddard-Stark | 0.355 | 0.270 | 0.564 | 0.046 | 0.296 |
| Robert-Baratheon | 0.269 | 0.214 | 0.545 | 0.030 | 0.269 |
| Tyrion-Lannister | 0.247 | 0.190 | 0.511 | 0.033 | 0.225 |
| Catelyn-Stark | 0.231 | 0.151 | 0.505 | 0.030 | 0.213 |
| Jon-Snow | 0.199 | 0.172 | 0.493 | 0.027 | 0.170 |
| Robb-Stark | 0.188 | 0.073 | 0.497 | 0.022 | 0.193 |
| Sansa-Stark | 0.188 | 0.037 | 0.489 | 0.020 | 0.232 |
| Bran-Stark | 0.172 | 0.056 | 0.487 | 0.020 | 0.194 |
| Cersei-Lannister | 0.161 | 0.026 | 0.484 | 0.017 | 0.216 |
| Joffrey-Baratheon | 0.161 | 0.019 | 0.481 | 0.017 | 0.221 |

Data: the character interaction networks of "A Song of Ice and Fire" by Andrew Beveridge, from [mathbeveridge/asoiaf](https://github.com/mathbeveridge/asoiaf), under the license [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
The tables on this page were computed from the edge lists of book 1 and book 2 and are shared under the same license.

## The ranking depends on the measure

To compare the rankings, put the names side by side.
The function below returns the names of the ten nodes with the highest values of one measure.

```python
def top_names(table, column, n=10):
    top = table.sort_values(column, ascending=False, kind="stable").head(n)
    return top.index.tolist()


pd.DataFrame(
    {
        "degree_centrality": top_names(centrality_df_1, "degree_centrality"),
        "pagerank": top_names(centrality_df_1, "pagerank"),
        "betweenness": top_names(centrality_df_1, "betweenness"),
    },
    index=range(1, 11),
)
```

The table has one row for each rank in book 1.

| Rank | degree_centrality | pagerank | betweenness |
|---|---|---|---|
| 1 | Eddard-Stark | Eddard-Stark | Eddard-Stark |
| 2 | Robert-Baratheon | Tyrion-Lannister | Robert-Baratheon |
| 3 | Tyrion-Lannister | Catelyn-Stark | Tyrion-Lannister |
| 4 | Catelyn-Stark | Robert-Baratheon | Jon-Snow |
| 5 | Jon-Snow | Jon-Snow | Catelyn-Stark |
| 6 | Robb-Stark | Robb-Stark | Daenerys-Targaryen |
| 7 | Sansa-Stark | Sansa-Stark | Robb-Stark |
| 8 | Bran-Stark | Bran-Stark | Drogo |
| 9 | Cersei-Lannister | Jaime-Lannister | Bran-Stark |
| 10 | Joffrey-Baratheon | Cersei-Lannister | Sansa-Stark |

- Eddard Stark is first with all three measures.
- The order of the other characters changes with the measure. Robert Baratheon is second by degree centrality and by betweenness, and fourth by PageRank.
- Daenerys Targaryen and Drogo are in the top ten only by betweenness. By degree, they are 15th and 17th. They have fewer links, but they connect their own group to the rest of the network.

When two measures disagree about a node, look at where the node is in the network.
A node with a low degree and a high betweenness often connects two groups that have few other connections.

## The network changes over time

A network that is built from another time period has other nodes and other edges, so the centrality of a node changes.
Here the two time periods are book 1 and book 2.

```python
pd.DataFrame(
    {
        "book_1": top_names(centrality_df_1, "degree_centrality"),
        "book_2": top_names(centrality_df_2, "degree_centrality"),
    },
    index=range(1, 11),
)
```

The table has the ten characters with the highest degree centrality in each book.
Book 1 has 187 characters, and book 2 has 259.

| Rank | book_1 | book_2 |
|---|---|---|
| 1 | Eddard-Stark | Tyrion-Lannister |
| 2 | Robert-Baratheon | Joffrey-Baratheon |
| 3 | Tyrion-Lannister | Cersei-Lannister |
| 4 | Catelyn-Stark | Arya-Stark |
| 5 | Jon-Snow | Stannis-Baratheon |
| 6 | Robb-Stark | Robb-Stark |
| 7 | Sansa-Stark | Catelyn-Stark |
| 8 | Bran-Stark | Theon-Greyjoy |
| 9 | Cersei-Lannister | Renly-Baratheon |
| 10 | Joffrey-Baratheon | Bran-Stark |

Eddard Stark is not in the top ten of book 2.
The next code computes his rank in book 2.
`method="min"` gives nodes with the same value the same rank.

```python
rank_2 = centrality_df_2["degree_centrality"].rank(ascending=False, method="min")
print(int(rank_2.loc["Eddard-Stark"]))    # 14
print(int(rank_2.loc["Tyrion-Lannister"]))    # 1
```

Eddard Stark is first in book 1 and 14th in book 2.
Tyrion Lannister goes from third to first.

For social media data, this means that a ranking holds only for the time period of the data.
Compute the measures again for each period that you compare.

## Directed networks

In a directed network, such as a citation network or a reply network, the in-degree is the simplest centrality measure.
A common figure of such a network sets the size of each node by its in-degree.
[Reply network](networks-from-posts.md#reply-network) shows how to compute the in-degree.

## Links

- [Centrality and Communities notebook](centrality-and-communities.ipynb): all the code on this page
- The NetworkX documentation of the [centrality functions](https://networkx.org/documentation/stable/reference/algorithms/centrality.html) and of [`pagerank`](https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html)
- The Wikipedia pages on [centrality](https://en.wikipedia.org/wiki/Centrality) and on [PageRank](https://en.wikipedia.org/wiki/PageRank)
- The [periodic table of network centrality](http://schochastics.net/sna/periodic.html): more than one hundred measures, each with a link to its paper
- [mathbeveridge/asoiaf](https://github.com/mathbeveridge/asoiaf): the repository of the character networks, which have the license [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Next: [Communities](communities.md) finds groups of nodes that are densely connected.
