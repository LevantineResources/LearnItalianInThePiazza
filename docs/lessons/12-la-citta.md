# Lesson 12 · Un giorno in città — design doc (draft for review)

## Summary
- **Story beat:** The player decides to go to Venice. They ask the way to the station, follow the directions, ask
  for a ticket at the booking office, and watch a train pull out: it was the last one until tonight. The only train
  left is the **night train, 23:15**, so they buy a ticket for it and have the rest of the day to explore. The map lights up with **"!" spots**. The player does
  **3 tasks in the afternoon**; then the clock tower chimes, someone calls out *"I ristoranti sono aperti per la
  cena!"*, and it turns to **night**. **2 more tasks** at night (5 in total); then the clock reaches **23:00** and it's
  time to head back to the station for the 23:15 to Venice (Lesson 13).
- **Teaching goal (the chapter):** train travel.
  - *la stazione, il treno, il binario*
  - *un biglietto per Venezia*, *andata / andata e ritorno*, *per domani*
  - *A che ora parte il prossimo treno? Parte alle 23:15.* · *Il treno è appena partito.*
  - *stasera / stanotte / oggi* · the 24-hour clock in timetables (review of Lesson 10)
- **Each quest** brings its own 5–10 words with its own *scheda* (see the quest system doc).
- **Review:** directions and the map (Lessons 3, 5, 7, 10), time (Lesson 10), prices and the notepad, Lei vs tu.
- **Where:** piazza → **the station** (new) → the whole town (the quests' places) → the station at night.
- **Depends on:** the end of Lesson 11 (the museum). Systems: `docs/features/quests-and-night.md`.

## The loop

| # | `S.tut` | what happens |
|---|---|---|
| 1 | `l12-start` | The guide: *you'd like to see Venice; the train goes from the station*. Ask someone where the station is (Chiara, tu). |
| 2 | `l12-route` | Trace the route to the station (a map route via the `mapRoute` hook); the **Stazione** destination unlocks. |
| 3 | `l12-barrier` | **The barrier.** The station: a departures board, platforms, the ticket office. The clerk (Lei) talks fast about times and platforms, and the player doesn't follow. → handbook. |
| 4 | `l12-handbook` → `l12-vocab` → `l12-practice` | Chapter 12, its Vocabolario check, a longer practice (about 10–12 questions). |
| 5 | `l12-ticket` | *Un biglietto per Venezia, per favore.* The clerk: *Il treno per Venezia? Parte adesso, binario 3!* **Cutscene:** through the window the player sees the train pull out. The clerk: *Il prossimo treno parte stasera, alle 23:15.* The player: *Allora… per stasera.* The clerk: *Andata o andata e ritorno?* Price → notepad. The ticket (23:15, binario 3) goes in the bag. |
| 6 | `l12-explore` | **The town opens.** A short cutscene: the map opens with **"!" spots** (the afternoon and anytime quests). The phone gets the **task list** and the **passport**. Objective: *Explore the town · 0/3 this afternoon*. |
| 7 | `l12-dusk` | After the **3rd** task completed in the afternoon (the clock moves on with each task, e.g. 15:00 → 16:30 → 18:00 → 19:30): a **cutscene**. The clock tower chimes (the bell tower in the piazza), the light turns gold then dark, and a waiter or Giulia calls out *"I ristoranti sono aperti per la cena!"* → **night**. Afternoon-only quests not yet done close (marked *chiuso*, still visible on the map). Night quests appear. |
| 8 | `l12-night` | Objective: *Explore the town by night · 0/2*. |
| 9 | `l12-late` | After the **5th** task the night clock moves to **23:00**: the bell tower chimes eleven, and the guide says it's time to go to the station (a "!" on the station). The player can't start another quest after 23:00. (The clock moves with each finished night task, e.g. 20:00 → 21:30 → 23:00, so 23:00 always comes with the 5th task.) |
| 10 | `l12-done` | The station at night: the departures board shows *Venezia S. Lucia · 23:15 · binario 3*. The player finds the platform (*Da che binario parte?* if they ask), validates the ticket at the green machine (a culture beat), and boards. Completion screen (the passport of stamps, the ticket). Lesson 13 begins on the train. |

## The 12 quests (the designer's list; each gets a short spec before it's built)
**Time windows:** 3 any time · 5 afternoon only · 4 night only. The player needs **5** in total: 3 in the afternoon
and 2 at night. Within each time window **all quests are open at once**. Quests not done move into **free play**:
available any time after the unit.

### Any time
1. **Dov'è la mamma?** *(Reuniting a child with her mother.)*
   - **The trail (kept short, so Lesson 14's trail is the big one):** a little girl in the piazza: *"Mi aiuti?
     Dov'è la mia mamma?"* The player asks her to describe her mother (*Com'è la tua mamma?*) → *Ha i capelli rossi
     e una borsa gialla. Le piacciono i fiori!* → the flower stall: Gino (*Sì! È andata a prendere un caffè, al Bar
     Centrale*) → the mother, found at the bar. Reunion and thanks.
   - **Italian:** describing a person (*i capelli, gli occhiali, alta, bassa*; colours and clothes are review),
     *Ha visto una signora…?* (taught as a set phrase), and *è andata a…* (heard: the past tense, with a gloss;
     the player doesn't produce it). Review: *tu* with the child, *Lei* with adults; directions.
2. **In farmacia** *(Shopping at the pharmacy.)*
   - **The task:** a short list (sun cream, plasters, toothpaste…); the player asks where things are and whether
     they have them: *Dov'è la crema solare? È in fondo, a destra, sopra lo scaffale.* *Avete i cerotti?*
     *Mi fa male la testa: ha qualcosa?* as an optional extra.
   - **Italian:** *la crema solare, i cerotti, il dentifricio, lo spazzolino, l'aspirina, in fondo, lo scaffale*
     (Lesson 10's prepositions put to work), *Ha qualcosa per…?*
3. **Il messaggio** *(Relay a message.)*
   - **The task (Paolo → Chiara, confirmed):** a chain between friends, like a game of telephone: Paolo tells you
     *"Sono in ritardo! Arrivo alle otto."* → you tell Chiara *"Paolo dice che è in ritardo. Arriva alle otto."* → Chiara answers → you take
     it back.
   - **Italian:** **dice che** (he/she says that) in the present tense; what the original speaker said in the
     *io* form becomes *lui/lei*, so *sono → è*, *arrivo → arriva*. That person shift is the real grammar point of
     this quest. *Ha detto che* (he said) is heard as a gloss. Each stage's sentence is a typed or tile step.

### Afternoon
4. **Il mercato coperto** *(The covered market.)* Tasting, comparing and buying by weight: *un etto, mezzo chilo, Posso
   assaggiare?, È buonissimo!, stagionato / fresco, dolce / forte, morbido / duro, Qual è più …?, il prosciutto crudo / cotto,
   Quanto costa (un etto)?* (as built: see below)
5. **In basilica.** Enter properly (covered shoulders, silence), light a candle, ask when mass is: *Deve fare silenzio, Deve
   coprire le spalle, Posso prendere una candela? / Può prendere una candela, A che ora è la messa?* (as built: see below)
6. **L'aquilone** *(The kite in the tree.)* (Replaces the lost-dog quest, so the train mystery in Lesson 14 stays
   fresh.) In the park, a boy's kite is stuck in a tree; the player asks the gardener for a ladder and helps:
   *Ci può aiutare? Ha una scala? È in alto, sull'albero. Ecco l'aquilone!* (*aiutare, la scala, in alto, l'albero,
   il giardiniere*).
7. **Il caffè è finito!** *(The bar in the piazza has run out of coffee.)*
   - **The task:** Enzo: *"Il caffè è finito!"* Go to Caffè Aurora in San Lorenzo and ask Davide to lend some:
     *"Enzo ha bisogno di caffè. Ci può prestare un pacco?"* → carry it back (the bag) → *"Ecco il caffè!"* → a free
     coffee from Enzo.
   - **Italian:** *è finito* (from Lesson 8's *è finita*), *ha bisogno di* (needs), *prestare* (lend),
     *Ci può…?*, *il pacco*.
8. **Una foto sul ponte** *(A couple's photo on the bridge.)* Small talk about the weather and the bridge, then offer to take
   their photo: *Che bella giornata!, c'è il sole, fa caldo, il ponte è antico, Vi faccio una foto?, Sorridete!* (as built: see below)

### Night
9. **La gelateria.** Cone or cup, two flavours: *cono o coppetta?, due gusti, il pistacchio, la fragola, la panna.*
10. **Aperitivo con Rosa.** At the San Lorenzo bar: drinks, order, small talk while you wait, toast: *Vorrei qualcosa da bere,
    Cosa ti piace bere?, uno spritz, gli stuzzichini, Facciamo un brindisi! Salute! / Cin cin!, offro io, Di dove sei?* (as built:
    see below)
11. **Il tramonto sul ponte** *(Sunset at the bridge.)* The same bridge as quest 8, different by night: the sky
    turning orange, then the lights coming on. A different couple; this time the talk is "look at the sunset, isn't it
    lovely?" and the evening air: *il tramonto, Guarda!, Non è bello?, Che bel tramonto!, le luci, fa un po' freddo, c'è un po'
    di vento.* (If both bridge quests are done, the second couple remembers you: *"Ancora tu! Il fotografo!"*)
12. **Musica in piazza** *(Buskers and dancing in the piazza.)*
    - **The scene:** the piazza at night: buskers playing, people dancing round the fountain. The player asks
      **strangers** to dance (Lei). Each conversation follows the same arc:
      1. **Introductions:** *Buonasera! Mi chiamo {Me}. E Lei?* → *Piacere, …*
      2. **The music:** *Le piace questa musica?* → their opinion.
      3. **The invitation:** *Le va di ballare? / Vuole ballare?*
    - **The first stranger says no**, and that *no* teaches the music words: *"Mi piace la musica, ma non mi piace
      ballare la musica lenta."* (I like the music, but I don't like dancing to slow music.) *"Preferisco la musica
      veloce!"* The buskers then switch to something faster (a small beat in the scene).
    - **The second stranger says yes:** *"Sì, volentieri!"* → a short dance cutscene round the fountain.
    - **Italian:**
      - *la musica, lenta / veloce, la canzone, ballare, cantare, suonare, la chitarra*
      - *Le piace questa musica?* · *Le va di ballare?* · *Vuole ballare?*
      - *volentieri*, and the polite no: *No, grazie, …*, *non mi piace ballare…* (*piacere* + infinitive, a new
        use of Lesson 8's *mi piace*)
      - review: introductions (Lesson 1), *preferisco* (Lesson 11)

### New places needed
- **Built already:** the piazza by day and night, the flower stall, the museum and its custodian, Bar Centrale,
  Caffè Aurora.
- **New, small:** the pharmacy and the gelateria (the shared shop interior), the San Lorenzo bar.
- **New, bigger:** the covered market, the basilica interior, the park, the bridge view (used by two quests, by day
  and by night).
- The dinner and taxi quests from the first draft are dropped. The dusk line *"I ristoranti sono aperti per la
  cena!"* still works as the cue for night.

## Handbook chapter 12 (outline)
- **dialogue:** at the ticket office (*Un biglietto per Venezia… Per oggi o per domani? … Andata e ritorno? … Binario 3*).
- **phrases:**
  - *Un biglietto per …*
  - *andata / andata e ritorno*
  - *A che ora parte il prossimo treno?*
  - *Da che binario parte?*
  - *per domani mattina*
- **phrases2 (you'll hear):**
  - *L'ultimo treno è appena partito*
  - *Il primo treno parte alle …*
  - *in partenza / in arrivo*
  - *in ritardo*
- **how:**
  - *partire* (parte / partono)
  - *domani / oggi / stasera / stamattina*
  - the 24-hour clock on boards
  - *per* + place and *per* + time
- **culture:** validate regional tickets (*convalidare*, the green machines), or the conductor fines you. Departures
  boards: *Partenze* (departures), *Arrivi* (arrivals), *Binario* (platform).
- **Vocabolario + verbs:** *partire* (parte, partono), *arrivare* (arriva).

## Decided
- Quests not done: free play, available any time after the unit.
- No hotel: the only train left is the 23:15; at 23:00 the player heads back to the station.
- Within a time window, all quests are open at once.

## As built (notes)
- `l12-late` covers the whole night station (the board, the green machine, the conductor, the train's door); `l12-done` is the
  completion. The conductor (*capotreno*, night only) asks for the ticket: *Ecco il biglietto!* through the bag's tiles; an
  unstamped ticket sends you to the green machine first.
- The clerk (*bigliettaio*): the train in the cutscene is the 14:35; the night train is the *Laguna Express*, 23:15, binario 3.
  Prices: andata € 12, andata e ritorno € 24 (numbers up to 24 are taught); you pay with any amount and hear the change.
- Chiara's route: piazza → the bank → left, straight on to the end → left: [2,4] [2,3] [1,3] [0,3] [0,4] (not Paolo's museum
  route, which turns at the first street).
- After the lesson: "Keep exploring" is the next afternoon (free play); the quests not done are open at any time.
- Quests 6, 8, 11 (batch 3): the bridge is Ponte Molino (the upper bridge on the map); the park is the Giardini dell'Arena. The
  couples are Anna and Giulio (Lei) by day, Sara and Tommaso (tu) in the evening; the boy is Pietro. The sunset quest's "Ancora tu!"
  comes from the second couple having seen you take the photo that afternoon. Details: docs/features/quests-and-night.md.
- Quests 4, 5, 10 (batch 4): all twelve quests are built.
  - **Il mercato coperto** (4, afternoon): a new scene, *Sotto il Salone* (`salone`), the arcaded hall of food shops under the
    Palazzo della Ragione, entered through the Palazzo's door at the top of Piazza delle Erbe (and a *Salone* landmark and
    destination on the map). The deli vendor is **Marisa** (*Salumeria · da Marisa*, Lei). The reason on the quest card: a snack
    for the night train. Asiago, *fresco* or *stagionato*; prices per *etto*: fresco € 2, stagionato € 3, prosciutto € 3 (at most
    € 24: more prosciutto than that gets "è tanto!"). The price is a listening line, written on the notepad; the cheese stays in
    the bag afterwards (for the train). "Altro?" lets you add prosciutto or say "No, grazie".
  - **In basilica** (5, afternoon): a new interior, the Basilica di Sant'Antonio (`basilica`), entered from Piazza del Santo's door;
    dim (its own light pass), quiet (speech at lower volume). The volunteer at the door **lends you a shawl** after "Mi scusi!"
    (you wear it in there); the candle is a tap / E on the stand by the saint's chapel (a coin in the *Offerte* box); the
    sacristan's answer is **18:30** ("alle sei e mezza"), confirmed with a choice of four times (a wrong one: said again slowly).
    Candle and mass in either order. Like the museum, a desktop scene (no phone layout).
  - **Aperitivo con Rosa** (10, night): Rosa already existed (Lesson 3's lady with the dog in San Lorenzo, Lei in Lessons 3 and 6),
    so she is the one, and she proposes *diamoci del tu* at the start (then tu throughout). The bar is **Caffè Aurora** at night
    (San Lorenzo's café; Davide serves, Lei), with candles on the tables and an *Aperitivo* board, and an APERITIVO board outside in
    Via dei Mille. **Rosa pays** (*Offro io!*) when you ask for the bill (or offer yourself); the small talk is *Di dove sei? / Sono
    di …* (a few city tiles), *E tu?*, and tonight's train time (*parte alle ventitré e quindici*, from the ticket in the bag).
  - The Lesson 12 Vocabolario is unchanged (41 terms): the new words are in the three schedas.
  - The map: quest labels are laid out round their dots so none overlaps another, a landmark or the "Tu sei qui" pin (whose label
    sits a little higher); a whole spot (dot, label, note) is clickable. The guide moves to the bottom left whenever the top banner
    would cover what a scene needs in view (`guideKeep`: the market's counter and signs; the bridge's deck).
- **Quests 4, 5, 8, 10, 11 after the designer's playthrough (7 Nov 2026).** Each card stays short; below, the order of play and
  each quest's **final key words** (its Vocabolario; *heard* = said by the NPC, understood, not produced). Lesson 13's day-telling
  (`L13_DAY`) can rely on these.
  - **4 · Il mercato coperto** (Marisa, Lei). *Posso assaggiare?* → two pieces of Asiago → the player may compare, *Qual è più
    dolce?* (forte, morbido, duro, salato) → *Il fresco è più dolce. Lo stagionato è più forte del fresco.* → *Preferisco lo
    stagionato. È buonissimo!* (an adjective that doesn't fit gets "No, no: il fresco è dolce!") → *Quanto ne vuole?* (the player
    may ask *Quanto costa un etto?*: the price per etto, nothing ordered) → *Vorrei due etti, per favore.* → *Altro?* → *un etto
    di prosciutto* → *Crudo o cotto? Il crudo è più salato.* → *crudo* → *No, grazie* → the player asks *Quanto costa?* → the price
    (listening) → the notepad → *Arrivederci*. Prices per etto: fresco € 2, stagionato € 3, crudo € 3, cotto € 2.
    **Key words:** *Posso assaggiare?, il formaggio, fresco / stagionato, dolce / forte, morbido / duro, Qual è più …?, È
    buonissimo!, il prosciutto crudo / cotto, salato, un etto · mezzo chilo*; heard: *Quanto ne vuole?*; review: *Quanto costa?*
    (L7), *più … di* (L11), *preferisco*, *vorrei*. The cheese (and the ham) stay in the bag: *il formaggio*.
    **The tasting's answers (the designer's evening playtest, 7 Nov: *Sì* did nothing, *Preferisco il fresco* only made her ask
    again).** Every natural answer to her two questions gets a reply to what was said (`m4Taste`, quest.js), and she moves on (*Allora,
    quanto ne vuole?*) as soon as there is a cheese you like. *Quale preferisce?*: *Preferisco il fresco / lo stagionato*, *Mi piace il
    fresco*, *Lo stagionato è buonissimo* → chosen; a cheese alone → *Lo stagionato, eh? E… Le piace?*; *Il fresco è più dolce* (a
    comparison said) → *Esatto! Il fresco è più dolce. Allora preferisce il fresco?* (Sì: that one; No: the other); *È troppo forte* →
    the other one offered; *Qual è più dolce?* → the comparison. *Le piace?*: *Sì / Sì, mi piace / Sì, è buonissimo / È buono / Mi piace
    molto* → chosen (*Le piace molto? Che bello!*, *Buono? È buonissimo!*); *Preferisco il fresco* → that one; *Lo stagionato è più
    forte* → *Esatto!* and chosen; *No / Non mi piace / È troppo forte* → *Allora assaggi il fresco: è più dolce… Le piace?*; both said no
    to → *Non Le piace neanche il fresco? Eh… ma per il treno! Quale prende?* (then a cheese named is taken). A word that doesn't fit
    still gets *No, no: il fresco è dolce e morbido!*. *No* to *Vuole assaggiare?* → she makes you taste anyway; after choosing, *Sì* →
    *Bene! Quanto ne vuole?*, another cheese → *Lo stagionato, allora!*; *Grazie* to *Altro?* means that's all. Only the weight is pushed
    for (the hint names *un etto, due etti…* from the third try). New tiles (group *Le piace?*): *Mi piace, Non mi piace, molto, è, buono,
    più, troppo* (*buono* and *molto* in the scheda's *È buonissimo! · Mi piace molto.* card). Tests: tests/l12-quests-b4.js (twelve
    answer variants, `__debug.m4Tasting()` / `('restore')`); screenshots review/fix-l12-13/m4-*.
  - **5 · In basilica** (the volunteer and the sacristan, Lei). The volunteer stops you: *Deve fare silenzio, qui. E deve coprire
    le spalle.* → *Mi scusi!* (or *Va bene.*) → *Le presto uno scialle.* → *Posso prendere una candela?* (her or the sacristan) →
    *Sì, certo! Può prendere una candela.* (*Può prendere…?* for yourself gets feedback: posso) → the candle stand (it only says
    "ask first" before you have asked) → *Scusi, a che ora è la messa?* → *alle sei e mezza* (listening; the time noted) →
    *Grazie, arrivederci.* **Key words:** *Deve fare silenzio, Deve coprire le spalle, le spalle, Mi scusi!, lo scialle, Posso
    prendere …?, Può prendere …, la candela, la messa, A che ora è la messa?* (il sacrestano: listed, no card). Grammar: *dovere /
    potere* + an infinitive (deve, può, posso). Dropped: *Silenzio, per favore* as a card (still said), *coperto / coperte*,
    *l'offerta* (the box says *Offerte*, glossed).
  - **8 · Una foto sul ponte** (Anna and Giulio, Lei). Anna: *Buongiorno! Che bella giornata, eh?* → weather (*C'è il sole.*,
    *Fa caldo.*; *Fa freddo.* in the sun makes them laugh) → *E il ponte… bello, no?* → *Il ponte è antico / bellissimo.* → *Uffa…
    con il telefono, il ponte non entra nella foto!* → the player offers, ***Vi faccio una foto?*** (chosen over *Volete una
    foto?*: it is what an Italian says, and it teaches *faccio* — "in Italian you make a photo" — and *vi*, explained on the card)
    → *Sì! Grazie! Ci fa una foto? Che gentile! Ecco il telefono.* (their phone; no *macchina fotografica*) → the camera panel,
    *Sorridete!*, the photo → *Arrivederci, e buona giornata!* The offer may come first; the stamp needs both. **Key words:**
    *Che bella giornata!, C'è il sole., Fa caldo. / Fa freddo., il ponte, bellissimo, antico, Vi faccio una foto?, Ci fa una foto?,
    il telefono, Sorridete!* Dropped: *Mi può fare una foto?*, *Sì, certo!* as a tile, *il fiume* (still understood).
  - **10 · Aperitivo con Rosa** (Rosa, tu; Davide, Lei). Rosa (tu, no *diamoci del tu*, no *Buonasera* taught): *Prendi un
    aperitivo con me?* → *Sì, grazie!* → *Vuoi qualcosa da bere?* → *Sì, vorrei qualcosa da bere.* → *Cosa ti piace bere?* → *Mi
    piace lo spritz / il vino / l'acqua* (or *E tu? Cosa ti piace bere?*) → ***In Italia beviamo lo spritz la sera!*** (heard) →
    Davide: *Due spritz, per favore.* → he goes to the bar (cutscene 1) and **while you wait**: *Di dove sei?* → *Sono di Londra.*
    → *E tu?* → *Ah, ecco Davide!* (cutscene 2: the drinks) → *Facciamo un brindisi!* → *Salute! / Cin cin!* → *A che ora parte
    il treno?* → *alle ventitré e quindici* → ***Ancora uno stuzzichino?*** → *Sì, grazie!* / *No, grazie, basta così.* → *Il
    conto, per favore.* → *Offro io!* → *Grazie, Rosa!* **Key words:** *l'aperitivo, lo spritz, gli stuzzichini, Vorrei qualcosa
    da bere., Vuoi qualcosa da bere?, Cosa ti piace bere?, Facciamo un brindisi!, Salute! / Cin cin!, Offro io!, Di dove sei?*;
    listed without a card: *basta così*, the cities; heard: *In Italia beviamo lo spritz la sera.* Rosa's bank has **Sì / No**
    (a "Sì, no" group, unless the set phrases already carry them).
  - **11 · Il tramonto sul ponte** (Sara and Tommaso, tu). Sara: *(Ehi! Ancora tu! Il fotografo!)* *Guarda il tramonto! Non è
    bello?* → *Sì! Che bel tramonto!* (or the player says *Guarda il tramonto! Non è bello?* → *Sì, bellissimo!*) → the lights
    cutscene → *Guarda le luci! Sono bellissime!* → *Brr…* → *Fa un po' freddo.* / *C'è un po' di vento.* → *Andiamo a prendere
    qualcosa di caldo. Ciao, e buona serata!* **Key words:** *il tramonto, Guarda!, Non è bello?, Che bel tramonto!, Che bello!,
    le luci, bellissimo / bellissime, Fa un po' freddo., C'è un po' di vento.* No longer taught here (still said): *stasera*,
    *Ancora tu!*, *Buona serata!*; dropped: *fa fresco*, *fa caldo*.
