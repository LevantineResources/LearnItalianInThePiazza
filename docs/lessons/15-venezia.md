# Lesson 15 · Venezia — design doc

> The last lesson of Unit 1 (Padova): the review. Designed with the designer on 7 Nov 2026.

## Summary
- **Story beat:** the night train has reached Venezia Santa Lucia (end of Lesson 14). Margaret's hotel, like the
  player's, is near San Marco, and Margaret asks if she and Biscuit can tag along: the player speaks English *and*
  Italian. Getting there takes a *vaporetto* (the water bus): find it, buy the tickets, have breakfast while you wait,
  meet a Venetian on the dock, board. The unit ends with the vaporetto coming down the Grand Canal into San Marco.
- **Teaching goal:** review of the whole unit, in one real errand. New: the words of the *vaporetto* (*il vaporetto,
  la fermata, la linea, il prossimo, parte*), *Mi è piaciuto molto* as a fixed phrase, and the dog rules on board.
- **What it reviews:**
  - greetings, introductions, Lei and tu (Lessons 1–3, 6);
  - directions (3, 9);
  - ordering at a bar and *per me / per lei* (2, 4);
  - numbers, prices and times (7, 10);
  - plurals (9: *due biglietti, due cornetti*);
  - shopping words (8: what's in the cornetto);
  - comparatives (11: *Venezia è più bella di Padova?*);
  - the day told in the past (12–13);
  - both past tenses (13–14);
  - translating for Margaret (8, 13, 14).
- **Conversation engine:** tile banks (Frasi fatte, with the little words, always there), typed translation for Margaret,
  the notepad for prices, listening lines for times, cutscenes (lines wait for the reader).
- **Where:** new scenes: the station hall at Santa Lucia (platform end, the hall, the station bar), the *fondamenta*
  outside with the vaporetto stop *Ferrovia* (the ACTV ticket booth, the floating pontoon, a bench, the Grand Canal),
  and two eye-level cutscenes (boarding; the Grand Canal → San Marco).
- **Depends on:** Lesson 14's end state (the train stopped at Santa Lucia, Margaret with Biscuit following her).
- **Length:** the longest lesson so far; that is fine for the finale.

## Cast
| id | who | register | notes |
|---|---|---|---|
| `margaret` | Margaret (from Lessons 13–14) | English only | follows the player; her lines sit on the player's side |
| `biscuit` | Biscuit, her small dog | — | follows Margaret; carried in her arms on the vaporetto |
| `infopoint` | a station worker at the information desk (or a porter) | Lei | gives the directions |
| `actv` | the ACTV ticket seller at the booth | Lei | tickets, the next boat, the dog rules |
| `baristaSL` | the barista at the station bar | Lei | breakfast |
| `bepi` | **il signor Bepi** (Giuseppe), an older Venetian on the dock, on his way across town | Lei | wants to meet Biscuit; **can come back in Unit 2** |
| crowd | travellers with suitcases, a tour group | — | *Permesso!* on the dock |

## The loop
| step | `S.tut` | objective | what happens |
|---|---|---|---|
| 1 | `l15-start` | Talk to Margaret | On the platform at Santa Lucia. Margaret (English): her hotel is near San Marco too; can she and Biscuit come along, since you speak both? The player agrees (*Sì / Certo!* tiles, or an English choice). Margaret now follows. |
| 2 | `l15-ask` | Ask how to get to San Marco | In the station hall. The player greets the man at the information desk, introduces themself, and asks the way. The barrier: they don't know the word for the boat. Like Lesson 7, the bank has one half-Italian tile, **"Dov'è… the boat… per San Marco?"** He catches it: *"La barca? Ah, il vaporetto! Il vaporetto per San Marco… alla fermata Ferrovia, qui davanti."* → "The *vaporetto*? I'd better look that up." → the handbook. |
| 3 | `l15-handbook` | Open your handbook | Chapter 15: the new words, then the unit in one page. |
| 4 | `l15-vocab` | Learn the Lesson 15 words | the word check |
| 5 | `l15-practice` | Finish the Lesson 15 practice | 12 items, mixing the whole unit |
| 6 | `l15-directions` | Ask the way to the vaporetto | Back at the desk, properly this time: *Scusi, dov'è la fermata del vaporetto per San Marco?* He gives directions (*Esca dalla stazione, vada dritto, la fermata è lì, a destra: la linea 1 o la linea 2*). The player must understand them (a pick, or the route traced on a small forecourt map, as in Lessons 3 and 9). Outside: the steps, the Grand Canal, the crowd on the *fondamenta* (*Permesso!*). |
| 7 | `l15-ticket` | Buy tickets for the next vaporetto | At the ACTV booth (details below): greet, *Due biglietti per San Marco, per favore*, *A che ora parte il prossimo vaporetto?*, the price, and the dog. |
| 8 | `l15-breakfast` | Get breakfast for you and Margaret | 20 minutes to wait. Back to the station bar for a *cornetto* and a coffee each (details below). |
| 9 | `l15-bepi` | (Bepi wants to meet Biscuit) | On the dock bench. Il signor Bepi stops for Biscuit (details below). |
| 10 | `l15-board` | Board the vaporetto | The horn; the boat pulls in. The ticket readers at the gate (*Convalidi il biglietto!* — tap the tickets on the reader), then an eye-level cutscene: the pontoon, the crowd boarding, Margaret with Biscuit in her arms. |
| 11 | `l15-arrival` | — | The final cutscene, at eye level: the Grand Canal (palaces, gondolas, the Rialto bridge), then the Bacino and San Marco (the Doge's Palace, the campanile, the domes) as the vaporetto pulls in. Margaret thanks the player ("I'd never have managed without you. Same time tomorrow? Biscuit insists."). The unit-completion screen. |

### The ticket booth (`l15-ticket`)
- *Buongiorno! Due biglietti per San Marco, per favore.* Saying "one ticket" gets *"Uno? E la signora?"*; *due biglietto*
  gets a nudge about plurals (Lesson 9), never the answer.
- *A che ora parte il prossimo vaporetto?* → a listening line: *"Il prossimo parte alle nove e dieci, dalla fermata B."*
  → the notepad: the time (Lesson 10).
- The price, heard: the real 75-minute ticket costs € 9,50, so two cost € 19 (write it on the notepad, as in Lesson 7).
  Check the current fare when building; the dialogue can say whatever is current.
- **The dog** (the designer's beat; the rules are real): the player asks *E il cane? Il cane paga?* →
  *"No, il cane non paga. Ma deve avere il guinzaglio e la museruola… o in braccio, se è piccolo!"* Margaret: "What did
  he say?" → the player translates for her (typed English, or a choice): the dog travels free, but on a lead with a
  muzzle, or carried. Margaret: "Then Biscuit rides in my arms, like a king."
- Sources: Comune di Venezia FAQ (dogs on the waterbus: on a lead and muzzled; small animals in a carrier); ACTV
  conditions (one animal per passenger, free; small dogs may be carried).

### Breakfast (`l15-breakfast`)
- At the station bar: the player orders for both: *Un cappuccino e un cornetto per me, e per lei un caffè e un cornetto*.
- Margaret wants to know what's in the cornetti (translation). *Com'è il cornetto? / Che cornetti avete?* →
  *vuoto, alla crema, alla marmellata, al cioccolato*. This reviews the shopping questions of Lesson 8.
- *Quant'è?* → heard → the notepad.
- Grazie / Arrivederci (formal).

### Il signor Bepi (`l15-bepi`)
- Bepi stops at the bench: *"Che bel cagnolino! Posso?"* The player introduces themself and Margaret: *Mi chiamo Sam. Lei
  è Margaret; è inglese, non parla italiano.* Bepi greets Margaret, then Biscuit (*Ciao, bello!*).
- He asks, and the player answers with the unit:
  - *Avete preso il treno da Padova?* → *Sì, abbiamo preso il treno di notte.*
  - *Vi è piaciuto?* → *Sì, mi è piaciuto molto!* (the fixed phrase).
  - About Padova, from the player's stamps, as in Lesson 13: *Ha visto la basilica del Santo? Ha mangiato un gelato?
    Ha visto il tramonto sul ponte?* The player answers *Sì, ho…* / *No, ma ho…*. With no history, he asks about random
    places, and every word is available.
  - Comparatives: *E Venezia? È più bella di Padova?* The player gives an opinion: *Sì, Venezia è più bella*, or
    *Padova è più tranquilla* (*tranquillo* is new, or reuse Lesson 11 adjectives). Bepi reacts to the answer either way.
  - Margaret chips in once ("Tell him Biscuit found a family on the train!"), and the player translates.
- Bepi: *"Ma Lei parla bene l'italiano!"* → *Grazie! Sto imparando.* (new, fixed phrase).
- The horn: *"Ecco il vaporetto! Buon viaggio, e benvenuti a Venezia!"* → *Arrivederci!* Bepi is a friendly face for
  Unit 2 (he lives in Castello; he could be the hotel owner's uncle, the gondolier's father…).

## After the unit (the designer: free play back in Padua, and the lessons can be replayed)
- **The unit-completion screen:** a summary (words learned, quests done, stamps), then:
  - *Free play in Padova:* back to the piazza; every place, the open quests and Studio. Fast travel works.
  - *Replay a lesson:* any lesson, in normal mode or **hard mode** (no tile bank, typed answers;
    docs/features/study-and-hard-mode.md part 2).
  - *Unit 2 · Venezia — coming soon.*
- Build this as a separate small task after Lesson 15 (it touches the menu and saves, not the lesson).

## Handbook chapter 15 (outline)
- **dlgNote:** at the vaporetto stop.
- **dialogue:** at the ACTV booth (two tickets, the next boat, the dog).
- **phrases:**
  - *Dov'è la fermata del vaporetto?*
  - *Due biglietti per San Marco, per favore.*
  - *A che ora parte il prossimo vaporetto?*
  - *Il cane paga?*
  - *Mi è piaciuto molto.*
  - *Sto imparando.*
- **How it works:** *il prossimo* (the next); *parte / arriva*; *mi è piaciuto* (past of *piacere*, a fixed phrase: the
  thing you liked is the subject, so *essere*); then **the unit in one page**, a compact table linking each skill to
  its lesson.
- **Culture note:** Venice's water buses (the lines, the stops, validating your ticket before boarding, dogs on board).
- **Practice:** 12 items across the whole unit: one each for greetings, Lei/tu, directions, a price heard, a time heard,
  ordering, plurals, a comparative, avere past, essere past, a joining word, a translation.

## Vocabolario (draft; at most 50; mostly new, with the review in the practice)
- **The boat:** il vaporetto · la fermata · la linea · il prossimo (vaporetto) · parte · la barca · il molo/il pontile
  (pick one) · convalidare (*Convalidi il biglietto!*, heard).
- **The dog:** il guinzaglio · la museruola · in braccio · (il cane) paga?
- **Breakfast:** il cornetto · vuoto · alla crema · alla marmellata · al cioccolato.
- **Phrases:** Mi è piaciuto molto · Vi è piaciuto? / Le è piaciuto? (heard) · Sto imparando · Benvenuti! ·
  Buon viaggio! · tranquillo/a.

## Verbs
- **partire** (to leave): *parte*.
- **piacere** past: *mi è piaciuto*, as a phrase.
- **imparare** (to learn): *sto imparando*, as a phrase.
- **convalidare** (to validate): *Convalidi*, heard only.

## Shared changes
- **Scenes:** `santalucia` (platform end, hall, bar) and `ferrovia` (the fondamenta, the ACTV booth, the pontoon,
  the bench, the Grand Canal with boats), drawn in code in the game's top-down style.
- **Eye-level cutscenes:** boarding, and the Grand Canal → San Marco, painted in code like Lesson 14's lagoon window.
  Optional idea: end on a public-domain Canaletto view of the Molo as the last frame, since the museum already uses
  real paintings. Ask the designer.
- **NPCs:** `infopoint`, `actv`, `baristaSL`, `bepi`, the crowd.
- **The unit-completion flow:** see *After the unit*.
- Margaret and Biscuit keep following (Lesson 14's follower code); fast travel is off in Venice.

## As built (notes)
Files: `src/lessons/15-venezia/content.js` (the tiles, every line, Margaret's lines, the hints, chapter 15), `flow.js` (the hook, the states,
who is where, the doors, the bench and the voyage), `convos.js` (the conversations, the notepad for a time), `unit.js` (the unit-completion
screen, free play, replays); the scenes `src/world/venezia.js` + `src/render/venezia.js`; the cast at the end of `src/content/npcs.js`.
Tests: `tests/l15-venezia.js` (the whole lesson from the skip link to free play), `tests/l15-bar.js` (the station bar: the designer's transcript and its variants), `tests/l15-convos.js` (the desk, the booth, Bepi as a learner plays them), `tests/l15-unit.js` (Bepi's Padova questions with and
without quests done; the unit screen, the replay list, replaying Lesson 2 to its end → free play, reloads). Screenshots: `review/l15/`.

### The states (`S.tut`)
| `S.tut` | where | what happens | moves on when |
|---|---|---|---|
| `l15-start` | `santalucia`, the platform, 8:40 | Margaret (English, her own conversation): her hotel is near San Marco too; two English answers | an answer: she follows (Biscuit at her heels) |
| `l15-ask` | the information desk (`infopoint`) | Frasi fatte + Cortesia; after the first greeting (or your name) Margaret asks you to ask about the boat, and the half-English tile **“Dov'è… the boat… per San Marco?”** appears (saved: `S.l15.prompted`) → *La barca? Ah, il vaporetto! … alla fermata Ferrovia, qui davanti.* → Margaret, the narration, **Open handbook** | the tile |
| `l15-handbook` → `l15-vocab` → `l15-practice` | | chapter 15 (43 words), its practice (12) | the practice → `l15-directions` (straight there if the practice was done first) |
| `l15-directions` | the desk | *Scusi, dov'è la fermata del vaporetto?* → *Sì, ma per dove?* → *per San Marco* (also *Il vaporetto per San Marco?* in one go) → three lines of directions (*esca dalla stazione, scenda i gradini, giri a destra… la linea 1 o la linea 2*); *A destra? / A sinistra? / È lontano? / Può ripetere?* answered; Margaret's **pick** (“Which way, dear?”: three English routes) | the right pick → `l15-ticket` (the hall's glass doors open to you) |
| `l15-ticket` | `ferrovia` | four travellers with suitcases across the fondamenta (one Lesson 10 crowd group: *Permesso*); the ACTV booth (`actv`): *un biglietto* → *Uno? E la signora?*; *due biglietto* → *Due… biglietto?* and the plural nudge (Lezione 9, no answer); *Due biglietti per San Marco* → *Sono diciannove euro* (heard, hidden) → **the notepad** (9 → “that's one ticket, the sign says € 9,50”); paid: the tickets go in the bag; *A che ora parte il prossimo vaporetto?* → *Il prossimo parte alle nove e dieci, dalla fermata B* (heard) → **the time notepad** (hours : minutes, `nbTimeFb` feedback, never the time; slower from the 2nd miss, revealed from the 3rd); *E il cane? / Il cane paga?* → the dog line → Margaret's **pick** → *“Then Biscuit rides in my arms, like a king.”* Any order; Margaret nudges the next missing one | all three → `l15-breakfast` (Margaret: *ten past nine… breakfast!*) |
| `l15-breakfast` | the station bar (`baristaSL`) | Margaret wants to know the cornetti first (an order before → she stops you); *Che cornetti avete?* → *vuoti, alla crema, alla marmellata, al cioccolato* → her **pick** → she chooses one (random: `S.l15.mgPick`, crema / marmellata / cioccolato) and *a little black coffee*; then **two orders**, kept apart (`S.l15.bar`, below): the barista says back what she understood and asks; *Sì* confirms, *No, …* corrects that part; Margaret judges only hers; both confirmed → *Allora: … Ecco!*; *Quant'è?* → the total heard → the notepad (caffè 1, cappuccino 2, tè 2, cornetto 2: whole euros) | paid and goodbye → `l15-bepi` |
| `l15-bepi` | `ferrovia`, the bench | the tour group now stands at the gate; E on the bench → a cutscene: you sit, Bepi comes along the fondamenta: *Che bel cagnolino! Posso?* → his conversation in stages (`S.l15.bepi.stage`): **pet** (*Sì, certo!*) → **intro** (your name *and* Margaret: *Lei è Margaret, è inglese, non parla italiano*; one alone → he asks for the other) → **train** (*Abbiamo preso il treno di notte (da Padova)*; a bare *Sì* → *Il treno di notte?*) → **liked** (*Mi è piaciuto molto!*; a bare *Sì* → *Molto?*) → **day1 / day2** (from your stamps, as in Lesson 13: one quest you did, one you didn't or the Scrovegni Chapel; with fewer than three done, random ones and every quest's words: `l15PickDay`; *Sì (, ho …)* / *No, ma ho …* / a bare *No* → *E cosa ha fatto, allora?*) → **compare** (*Venezia è più bella di Padova* / *Padova è più tranquilla* / …; *bello* → the agreement feedback) → **family** (Margaret: “Tell him Biscuit found a family on the train!” → *Biscuit ha trovato una famiglia sul treno*) → **compliment** (*Ma Lei parla bene l'italiano!* → *Sto imparando.*; a bare *Grazie* → *Ma… studia l'italiano?*) → the horn (the boat comes in, in the world behind the dialog) → **bye** (*Arrivederci*; *ciao* gets the polite-goodbye feedback) | the goodbye → `l15-board`; Bepi walks off west |
| `l15-board` | the gate | the tour group (one crowd group) in front of the readers: *Permesso*; the deckhand calls *Convalidi il biglietto!*; E on a reader validates one ticket (*Bip!*), again for Margaret's | both → the gate opens, the voyage |
| `l15-arrival` | `vaporetto` (painted) | the cutscene `l15-voyage`: Biscuit into Margaret's arms, through the gate; the boarding view; the horn; down the Grand Canal (the palaces in perspective, gondolas, mooring poles); the Rialto ahead and overhead; the Bacino: the Doge's Palace, the campanile, the domes, the columns, the stop; *San Marco, Vallaresso!*; Margaret's thanks | the end → the unit-completion screen |
| `l15-done` | | the unit-completion screen, then free play in Padova (or a replay) | — |

The header clock: 8:40 → 8:42 → 8:45 → 8:48 → 8:52 → 9:00 → 9:01 → 9:03 → 9:08 → 9:10 (the boat leaves) → 9:25 → 9:40 (San Marco).

### How a turn is read
Every tile of ours is one parser token of its own (`'@15:<key>'`, content.js `l15T`; the parser's phrases come from the hook), so another
lesson's reading of the same words never answers first (Lesson 2's *un caffè* is an order to the brain, Lesson 3's *dov'è* asks "where…
what?"). A few tiles are plain words on purpose (`raw`: *Scusi, per favore, Grazie mille, Arrivederci, Vorrei, Quant'è?*): the brain's intents
reach our react hook all the same, and the sentence's commas come out right. Punctuation of our tokens: `q` (a "?"), `cl` (starts a
sentence), `ex` ("!"), and a few `JOIN` / `COMMA_BEFORE` pairs (*No, ma ho…*, *Sì, mi è piaciuto molto!*, *per me, e per lei*). The
react hook reads the whole turn at its first intent from the tiles' keys (`l15Keys`), so a greeting with a request counts (*Buongiorno!* first),
the little words never get in the way, and *Ancora una volta, per favore* / *Può ripetere?* on their own say the last lines again, slowly
(listening lines stay hidden). The Padova question's tiles are Lesson 13's (Ho, the participles, the day's things, the places) as our tokens.

### The station bar's order (after the designer's transcript, 8 Nov)
`S.l15.bar = { mg:{ d, p, ok }, me:{ d, p, ok }, pend, loose, nudged }` (convos.js `l15BarTurn` / `l15BarRead` / `l15BarWho` / `l15BarOrder`):
`d` the drink, `p` the cornetto `{ c:1 | 2, f }` (`f` null: not said yet), `ok` confirmed; `pend` whose order she has just said back.
- **Reading a turn:** segments, one per person: *per me / per lei* before or after its things (*Un caffè e un cornetto alla marmellata per
  lei, e un cappuccino e un cornetto vuoto per me*; *Per lei …, e per me …*; *E per me. Vorrei …*); a filling on its own goes to that
  person's cornetto (*No, alla marmellata*); *lo stesso* / *anche* with no things copies the other order (*Per me lo stesso*, *Anche per
  me*). Nobody named: the pending order if the things fill its gap or correct it (after *No*, or what Margaret objected to); if it is
  complete, the other one's (and the pending one is taken as right); with one order left, that one; with both open, *"Per chi? Per Lei o
  per la signora?"* (the things wait for *per me / per lei*).
- **What she says back:** a complete order as a question (*Allora: per la signora un caffè e un cornetto alla marmellata?*; two together:
  one question, Margaret's first); a part missing: *Per Lei un cappuccino. E un cornetto?* (*Sì* → *Che cornetto? Vuoto, alla crema…?*,
  *No* → *Niente cornetto?* and Margaret insists), *E da bere?*; one already confirmed and said again: *Sì, sì: …* and on to the other.
  *Sì* confirms the pending order(s) (*Perfetto! E per Lei?*); *No* + things changes only what was said; a correction of one of two orders
  said back together brings both back.
- **Margaret** speaks only about her own order, when it has just changed: the wrong drink (*just a little black coffee*), the wrong
  filling (*No, dear: jam, I said!*), two cornetti; *Perfect, dear!* when it is right. *Sì* to a wrong order of hers: *Va bene!* from the
  barista, *"No, dear: jam, I said! Tell her, dear!"*, and it stays open. Once hers is confirmed and yours not begun: *"And something for
  you, dear!"* (once).
- **The hints** (`l15HintFor`): who it is for, which cornetto, the drink, confirm or correct, Margaret's not right, your own; the key
  words from the third try; never the sentence.
- **Staff labels:** the information desk clerk, the barista and the ACTV seller go by their job, like the Lesson 10 cashier and the Lesson
  12 clerk: `name` *Informazioni*, *La barista*, *Biglietteria ACTV*, shown from the first line (`L15_STAFF`, `convo.known`).
- **Other conversations** (tests/l15-convos.js): a greeting with the answer is one reply everywhere (`l15React`); the desk: a bare *Grazie*
  doesn't end the barrier conversation, your name (without a greeting) also brings Margaret's prompt, *La fermata del vaporetto per San
  Marco?* gives the way; the ACTV booth: *Sì* / *Due* after *Uno? E la signora?*; Bepi: *Da Padova*, *Molto!*, *Sì, è più bella* (Venice
  understood), a greeting mid-conversation (his question again).
- `__debug.l15At(state)` now also resets the later steps' records (tickets, the bar), so a test can play a step again.

### The unit-completion screen, free play, replays (unit.js)
- `openUnitComplete()`: words in the dictionary, quests done / 12, the passport's stamps (and their icons), sentences said; your sentences
  to Bepi; then **Free play in Padova**, **Replay a lesson** (the list of Lessons 1–15, each **Replay**; *Hard mode · soon*, disabled), and
  **Unit 2 · Venezia** (*coming soon*, not a button). In Venice (at the end of the voyage), closing it brings it back. Free play's guide has a
  **Unit 1 · Riepilogo** button that opens it again.
- **Free play** (`l15ToFreeState`): `S.l15.free`; the piazza in the afternoon; Margaret and Biscuit stay in Venice (the follower and the
  lesson's `sceneOf` are off); the bag's tickets go; the town's quests are open at any time (Lesson 15's `townOpen` / `questFree` hooks:
  Lesson 12's own only work while `S.lesson === 12`); no game clock; fast travel on. A save in `l15-done` always loads into free play; the
  screen opens once if it was never seen; a save made during the voyage loads at its end.
- **Replay a lesson** (`replayLesson(n)`): the whole real save is kept in `S.replay.home` (JSON, so it survives a reload); the game is set up
  as the intro's skip links do (every earlier lesson's skip) and lesson n's own start runs; Studio's record, the verbs drill and the numbers
  carry over. When `lessonCompleted(n)`: its completion screen's *Start Lezione n+1* button (and the guide's) become **Back to free play**;
  closing that screen shows *Replay complete* (Back to free play / Replay another lesson). `replayHome()` restores the home save (plus the
  replay's sentences) and puts you in the piazza. Hard mode is not built (docs/features/study-and-hard-mode.md part 2).

### Choices made (tell me if the story should differ)
- **The directions are a pick, not a traced route:** three English routes in Margaret's voice (the forecourt is one short walk: out, down the
  steps, right). The station's glass doors stay shut to you until you have understood the way.
- **The price:** the seller says *diciannove euro* (19: a number of Lezione 7); the € 9,50 is on the booth's sign (and in his line if you ask
  the price before the tickets). The breakfast prices are whole euros so the total can be written on the notepad (digits only).
- **The tickets** are a bag item, and validating them is an E on a reader (once for each ticket). There is a deckhand (`marinaio`, ambient)
  on the pontoon who calls *Convalidi il biglietto!*.
- **Bepi's own words** for the Padova questions and replies (`L15_DAY_BEPI`): Lesson 13's were Lina's, at night (*stasera*, *noi sì*).
- **Margaret chooses her cornetto at random** (not plain: crema, marmellata or cioccolato), so the order is listened to each time.
- **The painted views** are drawn in code (no Canaletto): boarding at Ferrovia B (San Simeone Piccolo's green dome across the water), the Grand
  Canal ahead in perspective with the Rialto, the Bacino with the Doge's Palace, the campanile, the domes, the columns and the stop.
- **Lesson 14's train door** (`tr-porta`, after the arrival) now starts Lesson 15 (it said "coming soon"); its completion screen's *Start
  Lezione 15* works as it was written to.

### Walking (after the designer's playthrough, 7 Nov evening)
- `santalucia`: the desk `{ x:52, y:300, w:184, h:34 }` (the clerk at (144, 298), in reach from the front, y ≈ 348), the bar's counter
  h 30 (the barista at (800, 256)); `talkZone` (content/npcs.js: the strip in front of a counter, `npcDist` in world/scenes.js) for the
  clerk, the barista and the ACTV seller, plus their `approach` points; solid: `VSL.benches`, `VSL.pillars`, `VSL.platBench` (and the
  quay's `VFER.lamps` outside). The second traveller's stroll goes round the map column.
- `ferrovia`: Bepi at (548, 336) (in reach from the seat); the deckhand at (780, 436) (`yieldDoor`: a door in reach wins), the readers'
  doors `reach:30`, so E in the gangway's middle is his line and beside a reader is the reader; he steps onto the pontoon as you board.
- Following (world/update.js `followerUpdate`, world/travel.js `followerArrive`, world/treno.js `dogsUpdate`, world/scenes.js `blocked`,
  `nearestNpc`): see docs/playtest-notes.md (7 Nov, evening). Tests: `tests/l15-walk.js` (keys only); `__dbg().venezia.talk` (who E
  talks to now), `__dbg().l15.margaret.moving`, `__debug.walkCheck()` (who stands inside a collider).

### Shared changes
- `world/venezia.js`, `render/venezia.js` (new; in `scripts/build.js`); `content/npcs.js` (the cast); `render/sprites.js` (props
  `suitcase` (+ `suitcaseSide`), `scarf`, `flatcap`, `shopping`, `carryDog`); `world/treno.js` (dogs that follow someone do so in every scene:
  `dogsUpdate`); `world/scenes.js` `nearestNpc` (a dog at someone's heels never hides a door); `engine/state.js` (`__dbg().venezia`,
  `l15`, `unit`, before `study`); `styles.css` (the unit screen); `tests/l14-cane.js` (its completion screen now offers Lezione 15).
