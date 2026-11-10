import json, re
d = json.load(open('nvdb_words_fonts.json'))
toks = [x for x in d if x[2] == 9.8]
# join hyphenated line breaks: a non-POS token ending in '-' + the next token
j = []
i = 0
while i < len(toks):
    t, f, s = toks[i]
    if t.endswith('-') and '.' not in t and i + 1 < len(toks) and len(t) > 1:
        n = toks[i + 1]
        j.append([t[:-1] + n[0], f, s]); i += 2; continue
    j.append([t, f, s]); i += 1
isPOS = lambda t: '.' in t or t in ('e', 'e,')
heads = []
for i, (t, f, s) in enumerate(j):
    if isPOS(t) or not re.match(r"^[a-zàèéìòù'][a-zàèéìòù' ]*,?$", t): continue
    tier = 'FO' if 'Bold' in f else ('AD' if 'Italic' in f else 'AU')
    pos = []
    k = i + 1
    while k < len(j) and isPOS(j[k][0]): pos.append(j[k][0]); k += 1
    heads.append((t.rstrip(','), tier, ' '.join(pos)))
words = [l.strip() for l in open('ext/nvdb/nvdb.words.txt') if l.strip()]
hs = {h[0] for h in heads}
print('heads', len(heads), 'FO', sum(1 for h in heads if h[1]=='FO'), 'missing vs words.txt', len([w for w in words if w not in hs]), [w for w in words if w not in hs][:30])
fo = [(h[0], h[2]) for h in heads if h[1] == 'FO']
json.dump(fo, open('fo.json','w'), ensure_ascii=False)
for w in ['prendere','partire','aiutare','camicia','treno','persona','mezzogiorno','arrivederci']: print(w, [h for h in heads if h[0]==w])
