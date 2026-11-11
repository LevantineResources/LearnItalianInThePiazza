/* The verbs taught so far, for the grammar drill (Studio → Verbi, ui/grammar.js). Data only.

   VERBS = [{ inf, en, irr?, note?, mood?, forms:[{ p, it, en, lesson, ex?, mood? }] }]
     inf     the infinitive (one entry per verb: 'avere')
     en      what it means, shown with every prompt ('to have'); it tells apart verbs that share an English word
             (essere / stare 'to be', avere / prendere 'to have')
     irr     true for an irregular verb (a badge in the drill and the table)
     note    one line for the conjugation table ('The polite "would like" form.')
     mood    the default mood of its forms: 'present' (default), 'conditional', 'imperative'
     forms   only the forms a lesson actually teaches (a tile, a phrase, the dialogue, How it works, the Vocabolario, or
             a highlighted row of Lesson 4's verb table: io, lui / lei / Lei, voi). Each one:
       p       the person: 'io', 'tu', 'Lei', 'lui' (lui / lei, also "it"), 'noi', 'voi', 'loro'
       it      the Italian, as typed: 'ho', 'può', 'mi piace', 'la prendo'
       en      the English prompt, starting with the person, so tu, Lei and lui / lei never look alike:
               'I …', 'you (friend) …', 'you (polite) …', 'he / she …' (or 'it …'), 'we …', 'you (all) …', 'they …'.
               Imperatives: 'go! (to a friend)', 'go! (polite)'. Unique within the verb.
       lesson  the lesson that teaches it: the form is drilled once that lesson is completed
       ex      an example sentence from the lessons (shown with the form blanked out as a clue, and in the table)
       mood    overrides the verb's mood

   Lessons 1–9 are here. A later lesson adds its verbs in its own content.js, in the handbook chapter:
     LESSONS.push({ n:10, …, verbs:[{ inf:'andare', en:'to go', irr:true, forms:[{ p:'io', it:'vado', en:'I go', ex:'Vado al museo.' }] }] })
   Forms take the chapter's lesson number unless they say otherwise; a verb that is already here (by inf) gets the new
   forms added to it. See grammarVerbs() in ui/grammar.js and CLAUDE.md ("Grammar drill"). */

VERBS.push(
  { inf:'essere', en:'to be', irr:true, forms:[
    { p:'io', it:'sono', en:'I am', lesson:4, ex:'Sono vegetariano.' },
    { p:'Lei', it:'è', en:'you (polite) are', lesson:4, ex:'Lei è di Padova?' },
    { p:'lui', it:'è', en:'he / she is', lesson:4, ex:'Lui è vegetariano.' },
    { p:'noi', it:'siamo', en:'we are', lesson:5, ex:'Siamo amici.' },
    { p:'voi', it:'siete', en:'you (all) are', lesson:4 },
  ] },
  { inf:'stare', en:'to be (how you are, how you feel)', irr:true, forms:[
    { p:'io', it:'sto', en:'I am', lesson:1, ex:'Sto bene, grazie.' },
    { p:'tu', it:'stai', en:'you (friend) are', lesson:1, ex:'Come stai?' },
    { p:'Lei', it:'sta', en:'you (polite) are', lesson:2, ex:'Come sta?' },
    { p:'lui', it:'sta', en:'he / she is', lesson:4, ex:'Mark sta bene.' },
  ] },
  { inf:'chiamarsi', en:'to be called', note:'Literally “to call yourself”: mi chiamo = I call myself.', forms:[
    { p:'io', it:'mi chiamo', en:'I am called (my name is)', lesson:1, ex:'Mi chiamo {Me}.' },
    { p:'tu', it:'ti chiami', en:'you (friend) are called', lesson:1, ex:'Come ti chiami?' },
  ] },
  { inf:'avere', en:'to have', irr:true, forms:[
    { p:'io', it:'ho', en:'I have', lesson:4, ex:'Non ho un libro blu.' },
    { p:'tu', it:'hai', en:'you (friend) have', lesson:6, ex:'Hai il mio libro?' },
    { p:'Lei', it:'ha', en:'you (polite) have', lesson:4, ex:'Ha un libro blu?' },
    { p:'lui', it:'ha', en:'he / she has', lesson:4 },
    { p:'voi', it:'avete', en:'you (all) have', lesson:4, ex:'Avete la lasagna?' },
  ] },
  { inf:'volere', en:'to want (would like)', irr:true, mood:'conditional', note:'Taught in its polite “would like” form (the conditional).', forms:[
    { p:'io', it:'vorrei', en:'I would like', lesson:2, ex:'Vorrei un caffè, per favore.' },
    { p:'Lei', it:'vorrebbe', en:'you (polite) would like', lesson:4, ex:'Cosa vorrebbe?' },
    { p:'lui', it:'vorrebbe', en:'he / she would like', lesson:4, ex:'Lui vorrebbe il risotto.' },
    { p:'voi', it:'vorreste', en:'you (all) would like', lesson:4 },
  ] },
  { inf:'potere', en:'can, to be able to', irr:true, forms:[
    { p:'io', it:'posso', en:'I can', lesson:4, ex:'Non posso mangiare la carne.' },
    { p:'tu', it:'puoi', en:'you (friend) can', lesson:3, ex:'Puoi ripetere?' },
    { p:'Lei', it:'può', en:'you (polite) can', lesson:3, ex:'Può ripetere, per favore?' },
    { p:'lui', it:'può', en:'he / she can', lesson:4, ex:'Lui non può mangiare la carne.' },
    { p:'voi', it:'potete', en:'you (all) can', lesson:4 },
  ] },
  { inf:'mangiare', en:'to eat', note:'Regular -are: -o, -i, -a, -iamo, -ate, -ano (mangi has one i).', forms:[
    { p:'io', it:'mangio', en:'I eat', lesson:4, ex:'Mangio la lasagna.' },
    { p:'tu', it:'mangi', en:'you (friend) eat', lesson:4 },
    { p:'Lei', it:'mangia', en:'you (polite) eat', lesson:4 },
    { p:'lui', it:'mangia', en:'he / she eats', lesson:4, ex:'Non mangia la carne.' },
    { p:'voi', it:'mangiate', en:'you (all) eat', lesson:4 },
  ] },
  { inf:'prendere', en:'to take, to have (food, drink)', note:'Regular -ere. La prendo / lo prendo: “I’ll take it”, the little word matches the thing.', forms:[
    { p:'io', it:'prendo', en:'I take (I’ll have)', lesson:4 },
    { p:'io', it:'la prendo', en:'I’ll take it (la maglietta)', lesson:8, ex:'La prendo.' },
    { p:'io', it:'lo prendo', en:'I’ll take it (il mazzo)', lesson:8, ex:'Lo prendo.' },
    { p:'tu', it:'prendi', en:'you (friend) take (you’ll have)', lesson:2, ex:'Cosa prendi?' },
    { p:'Lei', it:'prende', en:'you (polite) take (you’ll have)', lesson:2, ex:'Cosa prende?' },
    { p:'lui', it:'prende', en:'he / she takes (will have)', lesson:4 },
    { p:'voi', it:'prendete', en:'you (all) take (you’ll have)', lesson:4, ex:'Cosa prendete?' },
  ] },
  { inf:'parlare', en:'to speak', forms:[
    { p:'io', it:'parlo', en:'I speak', lesson:5 },
    { p:'lui', it:'parla', en:'he / she speaks', lesson:5, ex:'Non parla italiano.' },
  ] },
  { inf:'cercare', en:'to look for', note:'No word for “for”: cerco il mio libro.', forms:[
    { p:'io', it:'cerco', en:'I am looking for', lesson:6, ex:'Cerco il mio libro.' },
    { p:'Lei', it:'cerca', en:'you (polite) are looking for', lesson:7, ex:'Cosa cerca?' },
  ] },
  { inf:'sapere', en:'to know (a fact)', irr:true, forms:[
    { p:'io', it:'so', en:'I know', lesson:6, ex:'Non lo so.' },
    { p:'tu', it:'sai', en:'you (friend) know', lesson:6, ex:"Sai dov'è?" },
    { p:'Lei', it:'sa', en:'you (polite) know', lesson:6, ex:"Sa dov'è?" },
  ] },
  { inf:'costare', en:'to cost', forms:[
    { p:'lui', it:'costa', en:'it costs', lesson:7, ex:'Quanto costa?' },
  ] },
  { inf:'piacere', en:'to like (to please)', irr:true, note:'Works backwards: mi piace = it pleases me.', forms:[
    { p:'io', it:'mi piace', en:'I like it', lesson:8, ex:'Sì, mi piace!' },
    { p:'tu', it:'ti piace', en:'you (friend) like it', lesson:8, ex:'Ti piace?' },
    { p:'Lei', it:'Le piace', en:'you (polite) like it', lesson:7, ex:'Le piace?' },
  ] },
  { inf:'mancare', en:'to be missing', forms:[
    { p:'lui', it:'manca', en:'it is missing (one thing)', lesson:8, ex:'Manca un euro.' },
    { p:'loro', it:'mancano', en:'they are missing', lesson:8, ex:'Mancano due euro.' },
  ] },
  { inf:'andare', en:'to go', irr:true, mood:'imperative', note:'In directions: commands.', forms:[
    { p:'tu', it:'vai', en:'go! (to a friend)', lesson:3, ex:'Vai sempre dritto.' },
    { p:'Lei', it:'vada', en:'go! (polite)', lesson:3, ex:'Vada sempre dritto.' },
  ] },
  { inf:'girare', en:'to turn', mood:'imperative', note:'In directions: commands.', forms:[
    { p:'tu', it:'gira', en:'turn! (to a friend)', lesson:3, ex:'Gira a destra.' },
    { p:'Lei', it:'giri', en:'turn! (polite)', lesson:3, ex:'Giri a sinistra.' },
  ] },
  { inf:'attraversare', en:'to cross', mood:'imperative', note:'In directions: commands.', forms:[
    { p:'tu', it:'attraversa', en:'cross! (to a friend)', lesson:5, ex:'Attraversa il ponte.' },
    { p:'Lei', it:'attraversi', en:'cross! (polite)', lesson:5, ex:'Attraversi il ponte.' },
  ] },
);
