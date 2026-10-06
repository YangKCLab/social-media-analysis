# Communities

A community is a group of nodes that are densely connected with each other, with fewer edges to the rest of the network.
Community detection finds such groups from the edges alone.
Use it when you expect groups in a network and have no labels for them.

The [Centrality and Communities notebook](centrality-and-communities.ipynb) runs all the code on this page.
A comment after a line of code shows the result of that line, rounded.
The code uses these imports.

```python
import matplotlib.pyplot as plt
import networkx as nx
import pandas as pd
```

## What a community is

The nodes of a community have many edges to each other and fewer edges to the rest of the network.
The communities of a network often have a meaning.

| Network | What a community can be |
|---------|-------------------------|
| A social network | A group of friends |
| A repost network | One side of a political debate |
| A network of hashtags | A topic |

The method does not know these meanings.
It returns groups of nodes, and you have to look at the members of each group to say what the group is.

## Modularity and the Louvain method

There are many methods to find communities.
A popular one is the Louvain method.

- **Modularity** is a number for the quality of a division of the nodes into communities. It is high when there are many more edges inside the communities than in a random network with the same degrees.
- The **Louvain method** searches for the division with the highest modularity.

You do not tell the method how many communities to find.
The method puts each node in exactly one community.

## Find the communities

The first example is Zachary's karate club network, which has 34 members and 78 edges.
[Network basics](network-basics.md#load-a-network-from-a-file) describes the data.

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

`nx.community.louvain_communities` runs the Louvain method.
The method has random steps, so the result can change between runs.
Set the argument `seed` to get the same result each time.

```python
communities = nx.community.louvain_communities(karate_g, seed=415)

len(communities)    # 4
sorted(len(c) for c in communities)    # [4, 5, 11, 14]
nx.community.modularity(karate_g, communities)    # 0.415
```

- The result is a list of sets. Each set holds the nodes of one community.
- The method finds 4 communities, with 4, 5, 11, and 14 members.
- `nx.community.modularity` returns the modularity of a division. Here it is 0.415.

When you report communities, give the method, the number of communities, their sizes, and the modularity.

## Draw the communities

Give each community its own color, and pass the colors to `nx.draw` as `node_color`.
`node_color` needs one color for each node, in the order of the nodes of the network.

```python
# Put the largest community first
communities = sorted(communities, key=len, reverse=True)

colors = plt.get_cmap("Set2").colors
node_color = {}
for i, community in enumerate(communities):
    for node in community:
        node_color[node] = colors[i]

plt.figure(figsize=(6.4, 5))
nx.draw(
    karate_g,
    pos=nx.spring_layout(karate_g, seed=415),
    with_labels=True,
    node_color=[node_color[v] for v in karate_g],
    node_size=380,
    font_size=11,
    edge_color="#888888",
)
plt.show()
```

![The karate club network with its 34 nodes in four colors, one for each community. The largest community, with 14 nodes, is on the left around the nodes 33 and 34. The community with 11 nodes is around the node 1. The communities with 5 and 4 nodes are at the right and at the bottom.](figures/karate-club-communities.png){ width="560" }

The picture has four colors, one for each community.
The nodes of one community are close together, because they share many edges.

## Example: a character network

The second example is the character network of book 1 of "A Song of Ice and Fire", which has 187 characters and 684 edges.
The code below needs the network `G_1`.
[Centrality](centrality.md#example-a-character-network) describes the data and has the code that loads it.

The Louvain method has random steps, so the code sets a seed.
The result also depends on the version of NetworkX: the sizes on this page come from NetworkX 3.7, and an older version can put a few characters in another community.

```python
communities_1 = nx.community.louvain_communities(G_1, seed=415)
communities_1 = sorted(communities_1, key=len, reverse=True)

len(communities_1)    # 7
[len(c) for c in communities_1]    # [41, 39, 30, 27, 26, 22, 2]
nx.community.modularity(G_1, communities_1)    # 0.48
```

The method finds 7 communities, with a modularity of 0.48.
Six communities have 22 to 41 characters, and one has 2.

![The character network of book 1 with the nodes in seven colors, one for each community. Larger nodes have more edges. Six communities have a label with the name of one character: Catelyn Stark, Robert Baratheon, Tyrion Lannister, Eddard Stark, Jon Snow, and Daenerys Targaryen. The nodes of one community are close together. The community of Daenerys Targaryen is far from the others, at the right.](figures/character-network-communities.png){ width="680" }

Data: the character interaction networks of "A Song of Ice and Fire" by Andrew Beveridge, from [mathbeveridge/asoiaf](https://github.com/mathbeveridge/asoiaf), under the license [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
The figure of book 1 on this page was drawn from the edge list of book 1 and is shared under the same license.

In the figure:

- Each color is one community.
- The size of a node shows its degree.
- The label of a community is its character with the highest degree. The community with two characters has no label.
- The layout pulls the nodes of one community together.

The drawing code has about 35 lines.
It is in the notebook section [Communities of the character network](centrality-and-communities.ipynb#communities-of-the-character-network).

## Links

- [Centrality and Communities notebook](centrality-and-communities.ipynb): all the code on this page, and the drawing code of the character network
- The NetworkX documentation of the [community functions](https://networkx.org/documentation/stable/reference/algorithms/community.html) and of [`louvain_communities`](https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.community.louvain.louvain_communities.html)
- Blondel, Guillaume, Lambiotte, and Lefebvre (2008), [Fast unfolding of communities in large networks](https://arxiv.org/abs/0803.0476): the paper of the Louvain method
- [mathbeveridge/asoiaf](https://github.com/mathbeveridge/asoiaf): the repository of the character networks, which have the license [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Next: [Networks from posts](networks-from-posts.md) builds networks from a table of posts.
