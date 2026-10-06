# Network Analysis

In this module, you will learn how to describe social media data as a network and how to analyze the network: how to create and load a network, how to measure its distances and degrees, how to find its most important nodes, and how to find its communities.

Social media data has many networks.
Accounts follow each other and reply to each other, and hashtags appear in the same post.
The data usually comes as a table of posts, so you have to build the network first.
The first four pages use networks that come as a file or as a few lines of code.
The last page builds four networks from a table of posts.

## Learning objectives

- Describe data as a network: nodes, edges, direction, and weights
- Create, load, and inspect a network with NetworkX
- Compute degrees, a degree distribution, shortest paths, and distances
- Explain small worlds, hubs, and the friendship paradox
- Compute centrality measures and say what each one measures
- Find communities with the Louvain method and report the modularity
- Build a user-hashtag network, a hashtag co-occurrence network, and a reply network from posts
- Find the connected components of a network and keep the largest one

## Pages

| Page | What it covers |
|------|----------------|
| [Network basics](network-basics.md) | Nodes and edges; directed, undirected, and weighted networks; creating a network with NetworkX; degree and degree distribution; edge list and adjacency matrix; loading a network from a file; bipartite networks |
| [Paths and degree distributions](paths-and-degrees.md) | Paths and distances; small worlds; hubs, scale-free networks, and a histogram with log bins; preferential attachment; the friendship paradox and one use of it |
| [Centrality](centrality.md) | Five centrality measures; PageRank; the measures on a character network; how the ranking depends on the measure and on the time period |
| [Communities](communities.md) | What a community is; modularity and the Louvain method; the communities of the karate club network and of a character network, with a drawing of each |
| [Networks from posts](networks-from-posts.md) | A user-hashtag network, its projection, a hashtag co-occurrence network, and a reply network from ten posts; connected components; saving a network for Gephi; three further topics |

## Notebooks

The notebooks hold all the code of the pages and run in Colab without setup.
The NetworkX basics notebook serves the first two pages, and the Centrality and communities notebook serves the centrality page and the communities page.
The Posts to networks notebook serves the last page.

Two of the notebooks download small data files on first run.
NetworkX basics downloads the karate club network (407 bytes) and a data file on 698 Twitter accounts (154 KB).
Centrality and communities downloads the karate club network and two character networks (28 KB and 32 KB).
Posts to networks downloads nothing, because the ten posts are in the notebook.

| Notebook | Sections | |
|----------|----------|---|
| [NetworkX basics](networkx-basics.ipynb) | [Create a network](networkx-basics.ipynb#create-a-network), [Network methods](networkx-basics.ipynb#network-methods), [Node degrees](networkx-basics.ipynb#node-degrees), [Edge list and adjacency matrix](networkx-basics.ipynb#edge-list-and-adjacency-matrix), [Load the karate club network](networkx-basics.ipynb#load-the-karate-club-network), [Paths and distances](networkx-basics.ipynb#paths-and-distances), [Degree distribution of a real network](networkx-basics.ipynb#degree-distribution-of-a-real-network), [Friendship paradox](networkx-basics.ipynb#friendship-paradox) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/network/networkx-basics.ipynb){ .colab-button } |
| [Centrality and communities](centrality-and-communities.ipynb) | [Load the character network](centrality-and-communities.ipynb#load-the-character-network), [Compute the centrality measures](centrality-and-communities.ipynb#compute-the-centrality-measures), [The most central characters](centrality-and-communities.ipynb#the-most-central-characters), [Book 1 and book 2](centrality-and-communities.ipynb#book-1-and-book-2), [Load the karate club network](centrality-and-communities.ipynb#load-the-karate-club-network), [Communities with the Louvain method](centrality-and-communities.ipynb#communities-with-the-louvain-method), [Draw the communities](centrality-and-communities.ipynb#draw-the-communities), [Communities of the character network](centrality-and-communities.ipynb#communities-of-the-character-network) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/network/centrality-and-communities.ipynb){ .colab-button } |
| [Posts to networks](posts-to-networks.ipynb) | [The posts](posts-to-networks.ipynb#the-posts), [Extract the hashtags](posts-to-networks.ipynb#extract-the-hashtags), [User-hashtag network](posts-to-networks.ipynb#user-hashtag-network), [Projection onto the accounts](posts-to-networks.ipynb#projection-onto-the-accounts), [Hashtag co-occurrence network](posts-to-networks.ipynb#hashtag-co-occurrence-network), [Reply network](posts-to-networks.ipynb#reply-network), [Connected components](posts-to-networks.ipynb#connected-components), [Save the network](posts-to-networks.ipynb#save-the-network) | [Open in Colab](https://colab.research.google.com/github/YangKCLab/social-media-analysis/blob/main/docs/topics/network/posts-to-networks.ipynb){ .colab-button } |

## Tools

| Tool | What it is |
|------|------------|
| [NetworkX](https://networkx.org/) | A Python package written in pure Python. It is easy to use and slow on large networks |
| [graph-tool](https://graph-tool.skewed.de/) | A Python package implemented in C++. It is very fast |
| [igraph](https://igraph.org/) | A library in C, with interfaces for R, Python, Mathematica, and C/C++ |
| [Gephi](https://gephi.org/) | A desktop application to draw and explore networks. [Save the network](networks-from-posts.md#save-the-network) writes a file that Gephi opens |
| [Helios-web](https://github.com/filipinascimento/helios-web) | Network visualization in the web browser, for large networks |

Every page and notebook in this module uses NetworkX.
Use graph-tool or igraph when NetworkX is too slow for your network.
The [performance page of graph-tool](https://graph-tool.skewed.de/performance.html) compares the three packages on a directed network with about 40,000 nodes and 300,000 edges: betweenness takes under 2 minutes with graph-tool on 16 threads and about 6.7 hours with NetworkX.

## Book

The book [*Network Science*](https://networksciencebook.com/) by Albert-László Barabási is free to read online.
The pages of this module link to the chapters and sections of the book that cover their topics.

## Related

- [Data collection](../data-collection/index.md), whose notebooks collect the posts that a network is built from
- [Hypothesis testing and statistical analysis](../stats/index.md), whose page on descriptive statistics covers the histogram with log bins that a skewed degree distribution needs
