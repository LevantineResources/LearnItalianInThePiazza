import json, re, sys, os, glob, collections
from wordfreq import zipf_frequency
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from lemmas import lemmas
repo, dictjson, outjson = sys.argv[1], sys.argv[2], sys.argv[3]
core = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fo_ranked_unique.json')))[:1000]
CORE = {c['lemma']: c for c in core}

# 1) taught: every dictionary entry (tiles, Vocabolario, schede, set phrases, numbers, names)
d = json.load(open(dictjson))
taught = collections.Counter(); raw = set()
for e in d['entries']:
    for l in lemmas(e['w']): taught[l] += 1
    for t in re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ]+", e['w'].replace("’","'")): raw.add(t.lower())
# articles / homographs: count a core form taught when the form itself appears in the taught text
for f in ('la','le','lo','gli','una','i','sei','era','stato','fa','ora','parte','dato','fatto','visto','detto','tanto','prima','sotto','sopra','meglio'):
    if f in raw: taught[f] += 1

# 2) exposure: Italian in string literals across the game's source
STR = re.compile(r"'(?:[^'\\\n]|\\.){2,}'|\"(?:[^\"\\\n]|\\.){2,}\"|`(?:[^`\\]|\\.){2,}`")
def italianish(w):
    w = w.lower()
    if re.search(r"[àèéìòù]", w): return True
    zi, ze = zipf_frequency(w, 'it'), zipf_frequency(w, 'en')
    return zi >= 2.5 and zi >= ze + 0.8
exposed = collections.Counter(); exposed_by = collections.defaultdict(set)
files = [f for f in glob.glob(os.path.join(repo, 'src', '**', '*.js'), recursive=True)]
for f in files:
    src = open(f, encoding='utf-8').read()
    src = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    src = re.sub(r"(?m)^\s*//.*$", " ", src)
    area = os.path.relpath(f, os.path.join(repo, 'src')).split(os.sep)
    area = '/'.join(area[:2]) if area[0] in ('lessons', 'quests') else area[0]
    for m in STR.finditer(src):
        s = m.group(0)[1:-1]
        s = re.sub(r"<[^>]+>|\$\{[^}]*\}", " ", s)
        toks = re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ']+", s)
        if not toks: continue
        it = [t for t in toks if italianish(t.strip("'"))]
        en = [t for t in toks if zipf_frequency(t.lower().strip("'"), 'en') > zipf_frequency(t.lower().strip("'"), 'it') + 0.8]
        if len(it) == 0 or len(it) < len(en): continue
        forms = set(lemmas(s)) | {t.lower().strip("'") for t in toks if italianish(t.strip("'"))}
        for l in forms:
            if italianish(l) or l in CORE:
                exposed[l] += 1; exposed_by[l].add(area)

rows = []
for c in core:
    l = c['lemma']
    status = 'taught' if taught[l] else ('seen' if exposed[l] >= 2 else 'missing')
    rows.append({**c, 'status':status, 'taught':taught[l], 'exposed':exposed[l], 'where':sorted(exposed_by[l])[:6]})
summary = collections.Counter(r['status'] for r in rows)
bands = {}
for lo in range(0, 1000, 100):
    b = rows[lo:lo+100]; bands[f'{lo+1}-{lo+100}'] = {k: sum(1 for r in b if r['status'] == k) for k in ('taught','seen','missing')}
json.dump({'summary':summary, 'bands':bands, 'rows':rows,
           'taught_lemmas':len([l for l in taught if l.isalpha()]),
           'taught_outside_core':sorted([l for l in taught if l not in CORE and l.isalpha()])}, open(outjson,'w'), ensure_ascii=False, indent=1)
print(summary, 'taught lemmas', len(taught)); print(json.dumps(bands))
