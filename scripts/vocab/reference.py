import json, collections, simplemma
from wordfreq import top_n_list, word_frequency
from lemmas import lemmas
fo = [(w, pos) for w, pos in json.load(open('fo.json')) if not (len(w) == 1 and w.isupper())]
# lemma frequency: sum of surface forms' frequencies
freq = collections.Counter()
for w in top_n_list('it', 60000):
    f = word_frequency(w, 'it')
    for l in set(lemmas(w)): freq[l] += f
for w, _ in fo:
    freq[w.lower()] = max(freq[w.lower()], word_frequency(w.lower(), 'it'))
ranked = sorted(fo, key=lambda x: -freq[x[0].lower()])
core = [{'rank':i+1, 'lemma':w, 'pos':pos.rstrip(','), 'zipf_sum':freq[w.lower()]} for i, (w, pos) in enumerate(ranked)]
json.dump(core, open('fo_ranked.json','w'), ensure_ascii=False, indent=0)
print(len(core)); print([c['lemma'] for c in core[:80]]); print([c['lemma'] for c in core[950:1000]])
