import json, csv, collections
r = json.load(open('result15.json')); rows = r['rows']; R = {x['lemma']: x for x in rows}
THEMES = [
 ("Little words that hold sentences together", "connectors, quantity, frequency; they appear in almost every sentence",
  "se quando cui ogni qualche qualcuno mentre però invece quindi comunque insieme fuori durante contro oltre ciò alcuno tale quasi almeno spesso infatti soprattutto circa nulla nemmeno neanche oppure magari piuttosto ormai tuttavia né dunque anzi entro chiunque qualsiasi qualunque sia ma anche o perché molto così dopo già mai poco tanto qui là qua cioè subito finalmente insomma intorno dentro abbastanza veramente probabilmente purtroppo sicuramente ovviamente semplicemente esattamente assolutamente direttamente completamente soltanto infine"),
 ("Everyday verbs", "high-frequency actions an A1–A2 speaker needs",
  "pensare mettere credere seguire lasciare riuscire portare diventare tenere vivere rimanere usare iniziare cominciare lavorare cambiare servire provare perdere rispondere sperare ricevere decidere scegliere spiegare mandare nascere raccontare succedere cadere crescere incontrare imparare studiare dimenticare preparare chiedere leggere conoscere passare scrivere pagare giocare restare continuare comprare ascoltare dormire bere sedere chiudere aprire mostrare vendere ridere smettere fermare scoprire costruire aiutare invitare sposare scendere salire tornare sognare muovere rompere nascondere aspettare finire trovare capire mangiare"),
 ("Time, dates, calendar", "the week, months, seasons, ages and dates",
  "settimana mese anno giorno ora minuto momento tempo volta inizio fine data età stagione estate inverno primavera autunno domenica lunedì martedì mercoledì giovedì venerdì sabato gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre futuro passato scorso presto tardi notte sera mattina oggi ieri domani"),
 ("People and family", "family members, people around you, jobs",
  "famiglia padre madre figlio figlia fratello sorella moglie marito genitore gente ragazzo ragazza bambino uomo donna amico professore studente medico artista direttore giornalista cliente scrittore collega"),
 ("Home, work and daily life", "the home, work, money, school, free time",
  "casa lavoro ufficio scuola lezione festa cibo letto porta macchina auto telefono soldo prezzo costo spesa carta lettera pagina giornale film gioco sport calcio musica libro radio regalo"),
 ("Places and the wider world", "countries, nationalities, nature, geography",
  "mondo paese città centro zona mare terra isola cielo sud nord regione lingua estero straniero europeo americano francese tedesco cinese russo inglese luogo posto spazio strada piazza montagna monte fiume campagna stella sole aria fuoco acqua"),
 ("Body, health, feelings", "the body, feeling ill, emotions",
  "corpo occhio mano piede cuore faccia voce testa dolore malattia sangue bocca capello paura amore voglia fortuna speranza ospedale"),
 ("Describing things and giving opinions", "adjectives and opinion nouns",
  "importante possibile difficile facile semplice interessante famoso ottimo migliore meglio peggio serio libero vero sicuro diverso unico speciale normale utile brutto ricco povero vivo morto antico nuovo caro aperto forte grosso perfetto pronto dolce idea opinione problema esempio motivo domanda risposta parola nome storia vita modo tipo caso ragione errore verità differenza"),
]
def cell(l):
    x = R.get(l); return x
out = []
for title, sub, words in THEMES:
    items = [R[w] for w in dict.fromkeys(words.split()) if w in R]
    out.append((title, sub, sorted(items, key=lambda x: x['rank'])))
json.dump([[t, s, [(x['lemma'], x['rank'], x['status']) for x in it]] for t, s, it in out], open('themes.json','w'), ensure_ascii=False)
for t, s, it in out:
    c = collections.Counter(x['status'] for x in it)
    print(t, dict(c))
    print('   missing:', ' '.join(f"{x['lemma']}({x['rank']})" for x in it if x['status']=='missing'))
    print('   seen   :', ' '.join(f"{x['lemma']}({x['rank']})" for x in it if x['status']=='seen'))
with open('core1000-coverage.csv','w',newline='') as f:
    w = csv.writer(f); w.writerow(['rank','lemma','pos','status','times_in_dictionary','strings_seen_in'])
    for x in rows: w.writerow([x['rank'], x['lemma'], x['pos'], x['status'], x['taught'], x['exposed']])
