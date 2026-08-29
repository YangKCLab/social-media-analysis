# Sampling Strategies

A platform holds far more than one study needs. A sampling strategy is the rule that decides which posts or accounts to collect. Four common ones:

- **Keyword-based.** Collect every post that matches a list of terms. Misses relevant posts that use other words, and picks up unrelated posts when a term has more than one meaning. Snowball sampling, described below, is the usual way to build the list.
- **User-based.** Start from a curated list of accounts and collect what they post. Fits questions about specific actors, such as candidates in an election.
- **Snowball on the graph.** Start from seed accounts, collect their followers, then their followers' followers. Maps a community, but the number of requests grows by a factor of a thousand at each step, so decide the boundary before you start.
- **Whole-board or firehose.** Collect everything in a time window. Feasible only where the API allows it, such as 4chan's archive or the Bluesky firehose.

## Snowball sampling for keywords

Keyword-based collection is only as good as the keyword list, and the list is rarely complete on the first try. A researcher who starts from `vaccine` will miss posts that only say `vax`, `Pfizer`, or `VAERS`. Snowball sampling grows the list from the data itself. The procedure:

1. Start with a few **seed keywords** that are clearly about the topic.
2. Search for posts that contain the seeds. Count the other terms (words, hashtags, mentions) that appear in those posts.
3. Terms that **co-occur** with the seeds more often than expected are candidates. Read them and keep the ones that belong to the topic; drop the rest.
4. Add the kept terms to the list and search again with the new terms.
5. Repeat until a round finds nothing new. The list has **saturated**.

The picture behind this is a network. Each keyword is a node, and two keywords are connected when they appear together in posts. Snowball sampling is a search over that network, one ring of neighbors per round. It rests on two assumptions:

- **The network is connected.** Every relevant keyword can be reached from the seeds through a chain of co-occurrence. When part of the vocabulary never appears together with the rest, the seeds cannot reach it, and only adding a seed from that part fixes it.
- **The list is finite.** There is a limited set of terms about the topic, so the search eventually runs out of new terms and stops.

The **[snowball sampling demo](../../demos/snowball-sampling/index.html)** runs this search one round at a time over a network of 112 climate-related keywords. With the default seeds `climate change` and `global warming` it finds 2, 12, 52, 87, and then 98 keywords, and stops there: the 14 keywords about carbon taxes and deforestation are not reachable, because nothing in the found set co-occurs with them. Adding `carbon tax` and `deforestation` as seeds reaches all 112. The keyword network in the demo is made up for teaching; on a real platform the co-occurrence counts come from the posts you collect.

Things that go wrong in practice:

- **False positives.** A term that belongs to the topic in one context has other meanings elsewhere. In the 2022 U.S. midterm collection, `vote` matched posts about the American Music Awards and elections in other countries, and `midterm` matched posts about exams. Step 3 needs a human, not only a count.
- **Drift.** Each round moves one step away from the seeds. After a few rounds the candidates are about a neighboring topic. Stop when the candidates stop being about the question, not when the count stops growing.
- **Seeds decide coverage.** Two seeds from the same sub-community reach that sub-community and little else. Pick seeds that span the vocabularies the question needs, for example one from each side of a debate.
- **The list is a snapshot.** New terms appear as the event unfolds. For a collection that runs for weeks, repeat the search on the collected data every so often and add what turns up.

Two published datasets built this way are on the [research papers](../../papers.md) page: CoVaxxy, which grew a list of COVID-19 vaccine keywords from a handful of seeds, and the 2022 U.S. midterm election collection, which used the same method across five platforms.
