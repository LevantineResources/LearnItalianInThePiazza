import re, simplemma
ELIDE = {"dov":"dove","c":"ci","l":"il","un":"uno","dell":"di","all":"a","quest":"questo","nell":"in","sull":"su","com":"come","d":"di","dall":"da","quell":"quello","cos":"cosa","sant":"santo","bell":"bello","nessun":"nessuno","qual":"quale","buon":"buono","gran":"grande","s":"si","m":"mi","t":"ti","v":"vi","n":"ne","po":"poco","mezz":"mezzo","tutt":"tutto","anch":"anche"}
ARTPREP = {}
for p, base in [("del","di"),("dello","di"),("della","di"),("dei","di"),("degli","di"),("delle","di"),
                ("al","a"),("allo","a"),("alla","a"),("ai","a"),("agli","a"),("alle","a"),
                ("dal","da"),("dallo","da"),("dalla","da"),("dai","da"),("dagli","da"),("dalle","da"),
                ("nel","in"),("nello","in"),("nella","in"),("nei","in"),("negli","in"),("nelle","in"),
                ("sul","su"),("sullo","su"),("sulla","su"),("sui","su"),("sugli","su"),("sulle","su"),("col","con")]:
    ARTPREP[p] = base
FIX = {"la":"il","lo":"il","i":"il","gli":"il","le":"il","un":"uno","una":"uno","l":"il",
       "sono":"essere","è":"essere","sei":"essere","siamo":"essere","siete":"essere","era":"essere","stato":"essere","stata":"essere",
       "ho":"avere","hai":"avere","ha":"avere","abbiamo":"avere","avete":"avere","hanno":"avere",
       "po'":"poco","mi":"mi","ti":"ti","ci":"ci","vi":"vi","si":"si","ne":"ne",
       "c'è":"esserci","più":"più","perché":"perché","però":"però","già":"già","città":"città",
       "piace":"piacere","piacciono":"piacere","prego":"pregare","scusi":"scusare","scusa":"scusare",
       "grazie":"grazie","ciao":"ciao","arrivederci":"arrivederci","buongiorno":"buongiorno","buonasera":"buonasera","buonanotte":"buonanotte",
       "vorrei":"volere","potrei":"potere","sta":"stare","sto":"stare","stai":"stare","stanno":"stare","va":"andare","vado":"andare","vai":"andare","vanno":"andare",
       "fa":"fare","faccio":"fare","fai":"fare","fanno":"fare","dice":"dire","dico":"dire","dici":"dire","visto":"vedere","fatto":"fare","detto":"dire","preso":"prendere","letto":"leggere",
       "andato":"andare","andata":"andare","andati":"andare","andate":"andare","venuto":"venire","uscito":"uscire","tornato":"tornare","tornata":"tornare","arrivato":"arrivare","entrato":"entrare",
       "posso":"potere","può":"potere","puoi":"potere","possiamo":"potere","devo":"dovere","deve":"dovere","voglio":"volere","vuole":"volere","vuoi":"volere","vogliono":"volere",
       "so":"sapere","sa":"sapere","sai":"sapere","ricordo":"ricordare","ricordato":"ricordare","chiamo":"chiamare","chiami":"chiamare","chiama":"chiamare",
       "quant'è":"quanto","dov'è":"dove","com'è":"come","qual'è":"quale","cos'è":"cosa",
       "gelato":"gelato","mercato":"mercato","prato":"prato","stazione":"stazione"}
TOK = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]+'?|\d+")
def lemmas(text):
    out = []
    t = text.replace("’", "'")
    for raw in TOK.findall(t):
        w = raw.lower()
        if w.endswith("'"):
            b = w[:-1]
            out.append(ELIDE.get(b, ARTPREP.get(b, b))); continue
        if w.isdigit(): continue
        if w in ARTPREP: out += [ARTPREP[w], "il"]; continue
        if w in FIX: out.append(FIX[w]); continue
        l = simplemma.lemmatize(w, lang='it')
        out.append(l.lower())
    return out
