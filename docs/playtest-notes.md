# Playtest notes — to implement

Notes from the designer's playthroughs. Each item says what to change, and the lesson or feature it belongs to.

## General rules (already in CLAUDE.md)
- Hints help the player find the answer; they never give it.
- Every NPC reply follows from what the player actually said.
- A greeting in the same turn as a request counts as greeting.
- Every word a task needs is in the tile bank and findable in the dictionary.

## Lesson 3 · Dov'è? (Chiara's directions)
- When you ask Chiara for directions, she opens with *Ciao {Me}, come stai?*. The hint that suggests asking the way
  in Italian (the guidance on what to ask) must **stay available** if the player first does the *come stai?* exchange.
  It currently disappears.

## Lessons 2 and 4 · prices before numbers are taught
- At the bar (Lesson 2) and the restaurant (Lesson 4), prices are spoken and written in words
  (*Sono trentuno euro e cinquanta*), but numbers aren't taught until Lesson 7.
- In those lessons, show prices **as digits**: *Sono 31,50 euro* (written; the designer suggests the form
  "Sono 31 e 50 euro"). The voice may say it naturally.
- Check everything that uses `euroWords`/`priceIt` in Lessons 2 and 4: price lines, totals, the bill, the price
  prompts.

## Lesson 5 / Piazza del Santo · the statue
- Make the **Gattamelata statue much bigger** in the Piazza del Santo scene, something to actually see: the
  equestrian statue on its tall pedestal, recognisable from above.
- Make it **interactive**: walk up to it and press **E** (or tap it) → a picture opens showing the statue on its
  pedestal from a normal, eye-level viewpoint (an original illustration drawn in the game's style: rider on
  horseback on a tall plinth, the basilica behind), with a short caption: *Il Gattamelata, Donatello, 1453*.
  This works in every lesson once the scene is open.

## Lesson 7 · Al mercato · a different opening
- New start at the market: once you arrive, Mark asks you to find out how much the shirt is.
- You approach Teresa, do the basic introductions exchange (greeting, how are you), and then the English prompt
  appears: **"How much is the shirt?"**
- You can't say it (no *quanto costa* yet), so she doesn't understand, and she says something about the price
  anyway, which you can't understand either: the numbers barrier. Then the handbook, as before.
- This replaces the current barrier sequence. Check the rest of Lesson 7 (the stalls, the notepad, the numbers
  drill) still follows.

## Feature · grammar drill (after the restaurant lesson)
- A **grammar tab** where you drill the conjugations of the verbs taught so far. You **type** the Italian form from
  the English (*"he would like"* → *vorrebbe*; *"you (friend) have"* → *hai*).
- It unlocks after Lesson 4 (the restaurant, where conjugation is first taught), and grows with each lesson's verbs.
  Lessons should list their verbs and forms in their design docs from now on.
- It belongs with Studio (vocabulary study) as part of the practice tools.
- **Built:** Studio → *Verbi* (`src/ui/grammar.js`, `src/content/verbs.js`, `tests/grammar.js`). Design docs list their
  verbs in a *Verbs* section (`docs/lesson-design-template.md`).

## Lesson 7 · the new opening (replay, after the playtest fixes) — DONE
- At Teresa's stall the English prompt card at the bottom ("How much is the shirt?", Mark's question to say in
  Italian) doesn't show up in the designer's replay. Without it the player has no idea what to try, and any
  random sentence moves the conversation on. Find out why the card is missing in a real playthrough (the test
  passes, so check the difference: e.g. the order of Teresa's opening *Cosa cerca?*, the introductions, closing
  and reopening the dialog, a saved game from before the change, the phone layout) and make sure it always appears
  once the introductions are done. Small edit, batch it with the next round of fixes.
- **Done, redesigned** (the designer: the card made no sense, the player can't say it in Italian yet). The card is gone.
  After the introductions Mark asks "Ask her how much the shirt is!" and the tile bank offers **one** special tile, a
  half-Italian try from what the player knows: **"Quant'è… the blue shirt?"** (*Quant'è?* is from Lesson 2). Teresa catches
  *quant'è* and says the price, fast and hidden → "What did she say? How much?" → "I… didn't catch the number" → the
  handbook. Other sentences get sensible answers and move nothing on; the hint points at the tile (English only). Mark's
  question is saved (`S.l7.markAsked`), so after closing and reopening the dialog he asks again at once and the tile is
  there; old saves mid-opening work as a first visit. Design: docs/lessons/07-al-mercato.md, row 4; tests/l07-mercato.js,
  tests/layout.js (an old save, reopened, at six window sizes).

## Vocabolario size — DONE
- The designer: the flashcards are bogging the lessons down. **Every lesson's Vocabolario: at most 50 terms,
  essentials only** (words the player must say or must understand to answer; everything else gets an English gloss).
- Check Lessons 7–10 against this. Lesson 10 has 60 words: trim it. Make the coverage test also fail a lesson with
  more than 50 Vocabolario terms (the cap, in `tests/vocab-coverage.js`), and document the cap in CLAUDE.md.
- **Done:** Lessons 7–14 are within the cap (16, 29, 36, 49, 44, 40, 49, 45). Lesson 10 went from 60 to 49: Bruno's reactions in
  Vedo, vedo (*Vedo, vedo…*, *Giusto!*, *Esatto!*, *Bravo!*, *No, sbagliato!*, *Ritenta!*, *È lì!*, *Tocca a te!*, *Eccolo! / Eccola!*,
  *Non lo vedo!*) are no longer cards (they show their English under them in the game and stay in the chapter's phrases), and
  *l'ora / le ore* (inside *Che ore sono?*, *A che ora?*) went. `tests/vocab-coverage.js` fails a lesson over 50; CLAUDE.md has the cap.

## Lesson 9 · the designer's playthrough
- (Notes to come after the designer plays Lesson 9.)

## The designer's playthrough of Lessons 12–13 (7 Nov 2026)

### General
- **Map: fast travel.** Once the player has been given directions to a place, that place appears on the map as a button
  that takes the player straight there. — **DONE:** every place you know the way to is a button in the *Go straight there* list
  beside the map (the old "Walk to" buttons; after a follow-up from the designer, no ▸ buttons on the map itself: too crowded): San Lorenzo and Caffè Aurora (Lesson 3), Piazza del Santo (5), the market (7), the museum (10), the
  station (12), and the town's quest places (12: the bridge, the park, the pharmacy, the covered market by day, the gelateria at
  night). It fades, arrives at the entrance facing in, closes the map. Remembered in the save (`S.fast`, filled in for older saves).
  Off during a cutscene, on the train, and when a lesson's `fastTravel()` hook says so (Lucia's museum tour, Bruno's crowd lesson).
  tests/fast-travel.js.
- **Little words, early.** Teach *e* (and), *poi* (then), *ma* (but), *quindi* (so) and "again, please" (*Ancora una volta,
  per favore*) in Lesson 1 or 2. From then on they stay in **Frasi fatte** (set phrases) in every tile bank, along with
  *E Lei?*, *Sì* and *No*. (Sì and No were missing when Rosa asked *Ancora uno stuzzichino?*) — **DONE:** taught in Lesson 2 (the
  dialogue: the price, *Ancora una volta, per favore*, the price again, *Quindi 2,50 euro*; a *Little words* list; How it works; two
  practice items; Enzo's hint after the price). From then on Frasi fatte (the set phrases group, now labelled so) has them in every
  bank, a global rule in conversation/bank.js (a lesson's own tile with the same words wins, so nothing is doubled). *Ancora una
  volta, per favore* makes the NPC say their last line again anywhere. In the dictionary and in Studio. tests/set-phrases.js.
- **Cutscene text goes by too fast.** Lines in a cutscene should wait for a button (or a key) once the player has read them.
  — **DONE:** a line said in a cutscene (and a new guide line before a pause) keeps its bubble and shows **▸ Continua**
  until it is clicked or Space / Enter / E is pressed; walks keep their timing; Esc still skips. tests/cutscene-read.js.
- (Still open from before: the Vocabolario cap of 50, with Lesson 10 trimmed; formal NPCs saying *Ciao, Sam! A presto!*) — **DONE**
  (the cap: above). The generic goodbye follows the register: someone who uses Lei says *Arrivederci! Buona giornata!* (or
  *Buonasera!* in the evening); the hint says to say goodbye politely.

### Lesson 12 · the quests
- **DONE · In basilica:** needs more interesting words: you need to be quiet, you need to cover your shoulders, you can take a candle.
- **DONE · Il mercato coperto:** more words to describe cheese and ham. Tiles for "How much does it cost?". Maybe "the older cheese is
  stronger than the young cheese" (comparatives are from Lesson 11).
- **DONE · Una foto sul ponte:** start by talking about the weather and the bridge; then the player offers to take a photo ("Would you
  like me to take a photo?"), and they say yes, could you take one? *Ecco la macchina fotografica* sounds odd: most people use
  their phone.
- **DONE · Il tramonto sul ponte:** *stasera* is already taught at the start of the lesson; *Ancora tu!* and *Buona serata* are
  redundant. Add "it's a little cold", "it's a little windy". The conversation should become "look at the sunset, isn't it
  pretty?".
- **DONE · Aperitivo con Rosa:** no *diamoci del tu*: she just asks *Prendi un aperitivo con me?* *Buonasera* is redundant (from the
  first lessons). Focus on drinking: "I'd like something to drink", "Do you want something to drink?", "What do you like to
  drink?", "In Italy we drink spritz in the evening". *Il brindisi* wasn't covered. Move the *Di dove sei?* talk to the wait
  between ordering and the drinks arriving. Sì and No must be in the tiles (*Ancora uno stuzzichino?*).
- (The five above, as built, with each quest's final key words: docs/lessons/12-la-citta.md, *As built (notes)*.)

### Lesson 13 · the train — DONE
- **The past tense comes first:** the handbook, its words and practice happen in the compartment, right after boarding.
- *Per lei* was covered earlier; it doesn't need to be in this chapter.
- The word review shouldn't include words like *sentire / heard* in a way that makes the answer obvious.
- Teach **prima** and **dopo** (before / after): *Prima di ballare, ho mangiato con un'amica* combines many earlier pieces.
- **Dinner, reordered:** sit with Margaret and have dinner; then introduce yourself *and Margaret* to everyone; then a full
  conversation with Lina and Ernesto about what you did. Margaret chips in ("Tell her I saw the church too!") and the player
  translates (*Anche Margaret ha visto la chiesa*).
- **Not enough to say.** "I saw / ate / took the train / museum / ticket" isn't interesting. Tie the day to the quests the
  player did, from their stamps: *Ho aiutato un bambino con l'aquilone*, *Ho mangiato un gelato*, *Ho visto la basilica*.
  Lina also asks about them: *Ha visto la basilica? Ha assaggiato il gelato? Ha visto il tramonto sul ponte? Ha fatto delle
  foto? Ha comprato il formaggio al mercato?* (the words are known from those quests). With no history, she asks about random
  quests, and every word is available.
- **Then la signora Ferri** calls the two of you over: she wants to tell Margaret the dog is cute and that her children love
  dogs (the player translates). Then the cutscene as now, with lines waiting for a button.
- **Done** (docs/lessons/13-il-treno-della-notte.md, *As built*): chapter 13, its word check (48 words, 36 cards; *e, poi, ma* listed as a Lesson 2 recap, no cards) and practice (12) in
  compartment 17 right after boarding (a card on the table: dinner at 23:45; on a train people always ask what you did today); the dinner
  barrier is gone. *Per lei* is out; the cards' English no longer names the infinitive and the rule items use verbs that are on no card
  (*parlare, dormire*); *prima, prima di + a verb, dopo* and *anche* are taught. Dinner: Nino seats you with Margaret, the typed order for
  her, dinner; then Margaret asks you to introduce her: at each table your name, *Lei è / Questa è / Le presento Margaret*, *È inglese, di
  Londra*, *Non parla italiano*. The Bassis: the day from the quests done (every quest's things when fewer than three are done), *E dopo?*,
  Lina's question about a quest you did (*Sì, ho…*), one about a quest you didn't (or the Scrovegni Chapel: *No, ma ho…*), Margaret's "Tell
  them I saw the church too!" (*Anche Margaret ha visto la chiesa / la basilica*), *E perché Venezia?*, Margaret's "Ask them why…". Then la
  signora Ferri calls you both over: a typed translation (*È carino! Come si chiama?* → *Si chiama Biscuit.* → *I miei bambini amano i cani.
  Vogliono sempre un cane!* → *Anche Biscuit ama i bambini!*). Then the beats, Nino's *quando*, bed. Tests: tests/l13-train.js; screenshots
  review/l13-rework/.

### Lesson 14 · the designer's playthrough (7 Nov 2026) — DONE
"Overall the mystery is fun and engaging. I really like this level." Margaret and Biscuit could become characters in the next
unit, in Venice (noted in docs/curriculum.md).
- **Handbook** — DONE. The line about the dog hidden in the driver's cab is gone. Nothing in the chapter, its Vocabolario, practice,
  dialogue or the Verbi examples gives the mystery away (no *il cane del macchinista*, *ci sono due cani*, Brigante, the trail's names;
  the dialogue is now a friend gone off on a train). The discoveries' tiles (*Ci sono due cani!*, *il cane del macchinista*, *il cane
  della signora*) appear in the tile bank and the dictionary only once the second dog has been seen; their words are findable before
  (*cani*, *del / della*). The Vocabolario repeats no earlier chapter's words (*il macchinista, il cuoco, il vagone ristorante, il cane,
  visto, sentito, permesso, stamattina…* stay usable in the tiles): 34 terms; `__l14Repeats()` / `__l14Spoilers()` check it.
- **Rinaldi and la signora Ferri** — DONE. After "non ho visto niente" the player is pressed (Margaret: "Is he quite sure?"; the hint:
  "Ask if he's sure.", the key word only after three tries) to ask *È sicuro?* / *È sicura?* (the agreement: a man / a woman; the wrong
  ending gets a puzzled answer and feedback on it); then *Non ho visto niente. Chieda alla coppia della camera 14. Forse sanno dov'è il
  cane.* (Ferri in her voice).
- **Sa dov'è andato il cane?** — DONE: the main question (tiles *Sa …?* + *Dov'è andato?* + *il cane*; the chapter's first phrase and a
  practice item). *Ha visto un cane?* and *Dov'è andato?* still work.
- **Chi è?** — DONE: *Siamo io e Margaret* (also *Sono io*, *Sono Sam, con Margaret*); *Sono io e Margaret* is understood, with a tip
  (two people: *siamo*). The tiles are in the door's bank (*Siamo, Sono, io, e, con, Margaret*, your name).
- **The notebook** — DONE: entries in Italian only (people's roles too); the chrome stays English. (The "where did it go?" pick inside a
  conversation keeps English options: it checks what was understood.)
- **The chef and the cab** — DONE. After the Bassis Margaret says "The chef feeds everyone — let's ask him!"; Nino: *C'è un cane davanti,
  con il macchinista!*; at the cab, *Scusi il disturbo, permesso?* → *No, no! Esco io!* → a cutscene: Gianni steps out, pulls the door
  to, and Brigante (big, dark brown) slips past him, runs down the car and back; *Ehm… niente, niente!*; Margaret's typed *Non è il mio
  cane!*; the promise; *Chieda al cuoco!*; back to Nino: *Ci sono due cani!* → *voleva un osso!*; then Ernesto's memory and room 15.
  The Confronta page no longer gates the trail (its "two dogs?" is a hunch the cab confirms).
- **The reunion** — DONE: *Ti piace?*, *Ti piace il cane?*, *Ti piace Biscuit?* all accepted.

## The designer's playthrough, 7 Nov 2026 (evening)
- **Flashcards and quizzes:** the font must always be the same, one readable font. Some fonts have thin lines and are hard
  to read. — DONE: the word check (cards, quiz prompts and options), the Vocabolario list, the handbook's practice, Studio (its
  lesson list, cards, quiz, typed answers), Verbi and Vedo, vedo all use the dialogs' sans (Titillium Web), upright, weight 600–700;
  Bodoni (the display serif with hairlines) is left for the big titles and stamps only (styles.css, the block at the end).
  `tests/fonts.js` checks the computed font in Lessons 7, 11, 13, 15 and Studio.
- **Lesson 12 · Marisa's tasting** — DONE: after a taste she asks *Lo stagionato, eh? E… le piace?* Saying *Sì* does nothing,
  and *Preferisco il fresco* only makes her repeat until you say *buonissimo*. Accept a wider range of natural answers.
  **Done:** every natural answer to *Quale preferisce?* and *Le piace?* gets a reply to what was said, and she moves on as soon as
  there is one you like: *Sì / Sì, mi piace (molto) / Sì, è buonissimo / È buono*, *Preferisco il fresco / lo stagionato*, *Mi piace il
  fresco*, a comparison (*Il fresco è più dolce* → *Esatto! Allora preferisce il fresco?*); *No / Non mi piace / È troppo forte* → she
  offers the other one. New tiles *Mi piace, Non mi piace, molto, è, buono, più, troppo*. Only the weight is pushed for. Details:
  docs/lessons/12-la-citta.md (quest 4); tests/l12-quests-b4.js; review/fix-l12-13/m4-*.
- **Lesson 13 · Lina and Ernesto** — DONE: the conversation gets stuck on *Ha assaggiato il gelato?*: answering *No, ma …*, they
  ask the same question again. After the player has said three things they did, Margaret should chime in with her "I did
  that too" line. **Done:** the causes: a thing alone (*Sì, un gelato*, *No, ma il formaggio*) crashed the sentence reader, so the
  conversation stuck until it was reopened with the same question; and any answer but a clause about the thing or *No* made Lina ask
  again. Now any natural answer closes the question (*Sì*, *Sì, ho assaggiato il gelato*, *Sì, un gelato*, *No*, *No, non ho…*, *No,
  ma ho…*, *Ma ho…*, another thing you did) and no question is asked twice. Margaret chimes in once, as soon as three things are told
  (or after the second question), then the remaining questions, *E perché Venezia?* and la signora Ferri follow. Details:
  docs/lessons/13-il-treno-della-notte.md; tests/l13-day.js (six more runs, different histories and answers), tests/l13-train.js;
  review/fix-l12-13/l13-*.
- **Lesson 15:** the player gets stuck on the departures sign and can't move; can't talk to the information desk person;
  Margaret's following doesn't work as expected. — DONE (`tests/l15-walk.js` plays it by the keys only):
  - *Stuck under the board:* Biscuit, at Margaret's heels, was an obstacle (any NPC within 30 px blocks the player). Walking back
    up the hall (after reading the board) made Margaret walk her trail back onto the player, Biscuit sat down at the player's feet,
    and no step could get 30 px clear of him: trapped until he moved, which he never did. Now a dog following someone is never an
    obstacle, and in general a step that does not go deeper into something the player already overlaps is always allowed (someone
    walking onto you, arriving inside a collider), so nothing can trap the player. The hall's benches, the platform's bench and
    pillars and the quay's lamp posts are solid now (they were walked through).
  - *The information desk:* the clerk stood 64 px from the nearest spot in front of the desk (E reaches 58), so E fell through to
    Biscuit ("Bau!") or Margaret. The desk is shallower (the clerk 50 px from its front, like Enzo at the piazza's bar) and
    counter NPCs (the clerk, the barista, the ACTV seller) are in reach from anywhere along their counter's front (`talkZone`) and
    have an approach point for a tap; the barista had the same problem (60 px). Bepi stands nearer the bench (in reach from the
    seat); the deckhand stands at the gangway's foot between the two readers (E in the middle: his line; beside a reader: the
    reader). The travellers crossing the hall no longer take the E at the glass doors.
  - *Margaret's following:* she walked the trail faster than the player and stopped every few steps (a stutter), walked back onto
    the player when they turned round, and arrived after a door at a fixed offset that could be inside something; Biscuit arrived
    from where he had been in the last scene, twitched with every turn of hers, ran into walls and tables, and took E from
    everyone (so Margaret could not be talked to either). Now she keeps 44 px behind along the path at the player's own pace,
    waits when the player turns back (and steps aside if walked into), arrives beside the player outside any collider with
    Biscuit beside her; Biscuit settles at her heels (not inside things, never on the player) and is talked to only when nothing
    else is in reach; Margaret is talked to when the player turns to her (walking on with her behind, E never opens her
    conversation by surprise). The same code serves Mark, Bruno, Lucia and Lesson 14's Margaret.
- **Lesson 15 · the station bar** (the designer's transcript, now `tests/data/l15-bar-transcript.txt`) — DONE: the barista's
  confirmation of the player's own order was judged by Margaret (*"No, dear: jam, I said!"* after *per Lei un cappuccino e un cornetto
  vuoto?*); *Sì* to the confirmation got *"Sì?"*; the orders weren't kept (each turn was read as the whole order, checked against
  Margaret's wish, so a second turn re-checked or wiped the first); *"Buongiorno!"* and the answer came as two replies; the staff were
  "???". The causes: one reader (`l15ReadOrder`) took a turn's things as *the* order, put anything not marked *per lei* in Margaret's
  "pool", and only accepted the order when one sentence held everything; nothing remembered what the barista had said back, so *Sì* /
  *No* meant nothing. **Done:** the order is a small state, `S.l15.bar = { mg:{ drink, cornetto, ok }, me:{ … }, pend }` (convos.js
  `l15BarTurn`): each turn is read for who (*per me / per lei*, before or after the things; nobody named → the order she just said back if
  the things fit or correct it, else the other one, else *"Per chi? Per Lei o per la signora?"*), what (the drink, the cornetto, its
  filling, *lo stesso*, *anche*) and Sì / No. She says back what she understood (*Allora: per la signora …?*, or the part missing: *E un
  cornetto?*, *Che cornetto? …*, *E da bere?*); *Sì* confirms it, *No, …* changes only the part said; naming the other person after a
  complete (and, for Margaret, right) order takes it as right. Margaret speaks only about her own order (wrong drink, filling, two
  cornetti; *"Perfect, dear!"* when it is said back right), nudges once (*"And something for you, dear!"*) and insists on a cornetto for
  you. Both confirmed → *Allora: … Ecco!* → *Quant'è?* → the notepad, as before. New tiles *anche*, *lo stesso* (*Per me lo stesso*,
  *Anche per me*; *lo stesso* in the Vocabolario: 43 words). A greeting and the answer are one reply in every Lesson 15 conversation.
  The staff go by their job, as the Lesson 10 cashier and the Lesson 12 clerk do: *Informazioni*, *La barista*, *Biglietteria ACTV*.
  Playing the other conversations as a learner found: a bare *Grazie* ended the information desk's first conversation, and your name
  without a greeting never brought Margaret's "ask about the boat"; *La fermata del vaporetto per San Marco?* (no *Dov'è*) wasn't
  understood; at the ACTV booth *Sì* / *Due* after *"Uno? E la signora?"* got *"Prego? Biglietti?"*; Bepi didn't take *Da Padova* (after
  *Da dove, allora?*), *Molto!* (*"Sì? Molto?"*), *Sì, è più bella* (*"Bella… chi?"*), or a greeting mid-conversation (*"sono un po'
  sordo"*). All fixed. Tests: `tests/l15-bar.js` (the transcript replayed through the tiles, step by step, and six variants),
  `tests/l15-convos.js` (the desk, the ACTV booth, Bepi); screenshots `review/fix-l15b/`.
