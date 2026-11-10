# Lesson 7 · Al mercato — design doc

## Summary
- **Story beat:** Back at Bar Centrale, Mark has spilled coffee down his shirt, and he has a date tonight.
  He wants a new shirt (and maybe a tie, and flowers for his date) from the market. You ask Bruno the way,
  walk there with Mark, and get stuck at the first stall: Mark wants to know how much the shirt is, and all you have is
  a half-Italian try (*Quant'è… the blue shirt?*); the vendor gets it and says the price (out loud: no price tag or
  menu), and you can't understand the number.
- **Teaching goal:** numbers 0–20 by ear, and *Quanto costa?* Review: polite greetings (*Buongiorno, come sta?*),
  directions in the Lei form (*giri, vada*), *Può ripetere?*
- **Later lessons, not this one:** *quanti/quante* (how many), sizes and colours, actually buying. Lesson 7 ends
  with Mark choosing the shirt and saying he'll come back with cash.
- **Conversation engine:** the tile bank (Lessons 1–5 style). Prices are *heard* and then typed as digits into
  Mark's notepad.
- **New minigame:** the numbers drill (shared UI, reusable in later lessons for bigger numbers).
- **Where:** piazza (Bar Centrale) → city map → **new scene: the market, Piazza delle Erbe**.
- **Depends on:** the end of Lesson 6 (`skipL6`): Mark and Bruno sit together at Bar Centrale, Emma has gone.

## The loop

| # | `S.tut` | objective | guide banner | what happens |
|---|---|---|---|---|
| 1 | `l7-start` | Talk to Mark | Mark is waving at you from Bar Centrale, and he doesn't look happy. | Mark (English): coffee on his shirt, date tonight, "is there a market around here? Bruno will know. Ask him!" Mark's sprite shows a coffee stain until the lesson ends. |
| 2 | `l7-ask` | Ask Bruno the way to the market | Ask Bruno where the market is. He's a stranger: *Buongiorno*, *Scusi*, *Come sta?* | Tile conversation with Bruno (formal). *Scusi, dov'è il mercato?* → directions (below). Then Mark starts following you. |
| 3 | `l7-route` | Trace the route to the market | Open the map (M) and trace Bruno's directions from the piazza. | Map route tracing, like Lessons 3 and 5. When the route is right the **Mercato** destination unlocks. |
| 4 | `l7-market` | Ask how much the shirt is | (arriving) Mark wants to know how much the blue shirt on **Teresa's** stall is. Go and talk to her. · (near her) She's a stranger: greet her politely first. (Once Mark has asked: Mark wants the price: try the tile with Mark's question.) | **The barrier** (tile bank, the tiles you have from Lessons 1–6). Arriving, a toast: Mark: "There! The blue shirt, on that stall. Go and see how much it is!" 1) **Introductions:** Teresa: *Buongiorno! Cosa cerca?*; Mark: "That's the one! The blue shirt."; hint: greet her politely first. You greet her and do the how-are-you exchange (*Buongiorno! Come sta?* → *Bene, grazie. E Lei?* → *Sto bene, grazie.* → *Bene!*; the brain answers whatever you actually say). If the small talk stalls, Mark asks anyway two turns after the greeting. 2) **Mark's question:** Mark (English): "Ask her how much the shirt is!" and the tile bank gets **one** new tile, first, in a group *Mark's question*: **"Quant'è… the blue shirt?"**, a half-Italian, half-English try built from what the player knows (*Quant'è?*, Lesson 2). No card, nothing to translate. Hint (English, no Italian): "Mark wants the price. You know one way to ask a price from the bar… Try the tile with Mark's question." `S.l7.markAsked` is saved: closing and reopening the dialog, Mark says "That's her! Ask her how much the shirt is!" at once and the tile is there from the start (no small talk needed again). Other sentences keep sensible answers and nothing moves on: small talk as usual (*Come sta?* → *Bene, grazie.*, *Mi chiamo Sam* → *Piacere, Sam!*), *Dov'è il mercato?* → *Il mercato? È qui!*, introducing Mark, and anything she can't make sense of → *Eh? Non capisco.* A goodbye ends the chat (Mark: "Hang on… what about the shirt?"). 3) **The tile** (alone, or with a greeting: *Buongiorno! Quant'è… the blue shirt?*): she catches *quant'è* and answers with the price, fast (rate 1), one **listening line**, text hidden, no English: *Ah, la maglietta blu? Sono quindici euro. Bella, eh?* (the price is `S.l7.prices.maglietta`, the one later noted for the shirt). 4) Mark: "What did she say? How much?" (→ `l7-handbook`). Only choice: "I… didn't catch the number." System line: you caught *maglietta* and *euro*, but not the number; *Quant'è?* got you an answer, but at the market prices are said, not written: you need the numbers, and a proper way to ask. Leave / Open handbook. |
| 5 | `l7-handbook` | Open your handbook | Numbers! Open the handbook (H): **Lezione 7 · Al mercato**. | |
| 6 | `l7-practice` | Finish the Lesson 7 practice | Read Lezione 7, then finish its Practice tab. | Standard exercises (below). |
| 7 | `l7-numbers` | Master the numbers drill | Open the numbers drill (N, or the Numeri button). Spell 0–20 and back, then listen and type. | Spelling intro → numbers go into the dictionary → listening rounds until a 5-number sequence is right ("mastered"). |
| 8 | `l7-prices` | Ask the prices for Mark · k/3 | Ask each vendor the price: greet, *come sta?*, then *Quanto costa?* Write each price in Mark's notepad. | Three required stalls (shirt, tie, flowers). |
| 9 | `l7-done` | Lezione 7 completata | Mark has his shirt picked out. | Mark reads his notepad back, picks the shirt, and will come back after the bank machine. Completion screen. |

The Lesson 6 completion screen and the `l6-done` guide banner get a **Start Lezione 7** button.

## Directions: Bruno → the market
Bruno speaks to the player with **Lei** (polite imperatives, which are in the Lesson 3 directions table).
Route on the city map: `[[2,4],[2,3],[1,3],[1,2],[0,2],[0,1]]` (start heading north, as in Lessons 3 and 5).
- intro: *Il mercato? È in Piazza delle Erbe. Non è lontano!* / The market? It's in Piazza delle Erbe. It's not far!
- lines, one bubble each, spoken in sequence:
  1. *Vada sempre dritto, e alla prima strada giri a sinistra.* / Keep going straight, and take the first street on the left.
  2. *Poi giri a destra, fino alla farmacia.* / Then turn right, as far as the pharmacy.
  3. *Alla farmacia giri a sinistra, e poi subito a destra.* / At the pharmacy turn left, then right straight away.
  4. *Il mercato è lì, vicino alla chiesa.* / The market is there, near the church.
- confirm (if the player asks back): `left`: *Sì, a sinistra alla prima strada. Poi a destra.* · `right`: *A destra dopo la prima strada, sì, fino alla farmacia.* · `straight`: *Sì, sempre dritto fino alla prima strada.*
- far: *No, no. Cinque minuti a piedi.*
- dirBye: *Prego! E… good luck with the shirt, Mark!* (Mark: "Thanks, Bruno!")
- After the directions, `S.l5follow = true` (Mark follows you, as in Lesson 5).

## The market
New outdoor scene `mercato`, **Piazza delle Erbe**: striped awnings, crates, a central walkway. Spawn at the
bottom centre. Stalls (counter = collision box; the vendor stands behind it, the player talks from the front):

| vendor (id) | sells | role | price range (whole euros) |
|---|---|---|---|
| Teresa (`teresa`) | *magliette* (T-shirts/shirts), on a rack | required: **la maglietta blu** | 11–19 |
| Franco (`franco`) | *cravatte e sciarpe* (ties and scarves) | required: **la cravatta** | 6–14 |
| Gino (`gino`) | *fiori* (flowers, in buckets) | required: **il mazzo di fiori** (the bouquet) | 4–12 |
| Pina (`pina`) | *frutta e verdura* | optional, extra practice: **il melone** | 1–5 |

All vendors are older strangers: `formal:true`, Lei. Each price is chosen at random when the lesson starts and
saved in `S.l7.prices`, and the three required prices are all different, so the player really has to listen.
Pina's 1 euro case teaches *È un euro* (singular), versus *Sono … euro*.

### A stall conversation (`l7-prices`)
1. The player must **greet** first (*Buongiorno!*; a greeting in the same turn as the question counts, and *Come sta?*
   → *Bene, grazie. E Lei?* → *Sto bene, grazie.* is optional politeness). Asking the price before that gets:
   *Buongiorno, eh!* plus the hint *Greet first: market vendors expect a greeting before business.*
2. *Quanto costa?* or *Quanto costa questo/questa?* (the player is pointing; accept both, and the item tile
   too: *Quanto costa la cravatta?*). Mark (companion line, your side) points at the item first:
   "That blue one! How much?"
3. The vendor says the price: *Sono quindici euro.* / *Costa dodici euro.* / *È un euro.* The line is a
   **listening line**: spoken, text hidden, with a replay button.
4. Mark's **notepad** opens: "Mark's notepad · la maglietta: € ___". The player types the number in digits.
   - Right: the line's text is revealed, Mark writes it down ("Fifteen. Got it."), the vendor says
     *Prego!* or *Le piace?*, and the stall is done.
   - Wrong: Mark: "Hmm, are you sure? Ask her to repeat." Hint: *Può ripetere?* The vendor repeats it slowly
     (rate 0.7). After a second wrong answer, the line's text is revealed (the player can read *quindici*
     and look it up in the dictionary).
5. Leaving: *Grazie, arrivederci!* (or just close the dialog once the price is noted).

When all three required prices are noted → `l7-done`. Mark: "Shirt fifteen, tie nine, flowers six…
the shirt it is. I'll grab some cash and come back for it. Grazie, amico!"

## Numbers drill (shared, `ui/numbers.js`)
Opened with **N**, a header button **Numeri** (shown once `S.vocab7`), and a button on the Lesson 7 handbook page.
State in `S.numbers = { introDone, best, mastered }`.
1. **Spell out 0 → 20, then 20 → 0** (42 entries). The digit is shown big; the player types the word. Accents
   and one-letter typos are forgiven and shown corrected, as in Lesson 6. After a miss the word is shown;
   typing it then counts. Each correct word is spoken. When done: "Numbers 0–20 added to your dictionary"
   (a **Numeri** section in the dictionary).
2. **Listening rounds.** The voice says *n* random numbers (0–20, with about a 0.7 s gap between them, and
   no text). The player types them on an on-screen keypad (0–9, a separator key, backspace, submit; the
   physical keyboard works too: digits, space or comma to separate, Enter, Backspace). Typed numbers show
   as chips: `12 · 3 · 7`. **Ripeti** replays (counts as a replay, no penalty).
   - Correct → *n + 1*. Wrong → show what was said (digits and Italian words), and *n* stays the same.
   - Start at *n = 1*. Getting a 5-number sequence right marks it **mastered**: a toast, and
     `askHooks('onNumbersMastered')`. The drill can continue after that (best length kept in `S.numbers.best`).
3. No Italian voice in the browser: show each number word for 1.2 s instead (a reading drill), and say so.

## Handbook chapter
- **title:** *Al mercato* · **sub:** Numbers, and how much things cost
- **dlgNote:** At a market stall. Prices are said, not written.
- **dialogue:**
  - Tu: *Buongiorno! Come sta?* / Good morning! How are you?
  - Signora: *Bene, grazie. E Lei?* / Fine, thanks. And you?
  - Tu: *Sto bene, grazie. Quanto costa questa?* / I'm fine, thanks. How much is this one?
  - Signora: *La maglietta? Sono tredici euro.* / The T-shirt? It's thirteen euros.
  - Tu: *Può ripetere?* / Can you repeat that?
  - Signora: *Tre-di-ci. Tredici euro.* / Thir-teen. Thirteen euros.
  - Tu: *Grazie! Arrivederci!* / Thanks! Goodbye!
- **phrases (What you say):** *Quanto costa?* (How much is it?) · *Quanto costa questo / questa?* (How much is
  this one? Questa for a feminine thing like la maglietta) · *Può ripetere?* (review) · *Non ho capito.* (I didn't
  understand.) · *Grazie, arrivederci!*
- **phrases2 (What you'll hear):** *Sono … euro.* · *Costa … euro.* · *È un euro.* · *Cosa cerca?* (What are you looking
  for?) · *Le piace?* (Do you like it?) · *Prego!*
- **extra (Numbers 0–20):** a word grid, 0 *zero* … 20 *venti*.
- **how:** 11–16 end in *-dici* (*undici, dodici, tredici, quattordici, quindici, sedici*); 17–19 start with *dicia-*
  (*diciassette, diciotto, diciannove*). Careful: *sei* (6) vs *sedici* (16), *tre* (3) vs *tredici* (13).
  *Euro* never changes: *un euro, due euro*. One euro is singular: *è un euro*; everything else is *sono … euro*.
- **culture:** The market in Padua's Piazza delle Erbe runs every morning except Sunday. Greet before you ask
  anything. At fruit stalls, don't touch: the vendor picks for you. Cash is still king at many stalls.
- **exercises (6):**
  1. mc: What is *quindici*? 5 / 15 / 50 → 15
  2. mc: Which is 16? *sei* / *sedici* / *sette* → *sedici*
  3. mc: One euro. *Sono un euro.* / *È un euro.* → *È un euro.*
  4. order: How much is it? tiles *costa, quanto* → *quanto costa*
  5. mc: You walk up to a stall. What comes first? *Quanto costa?* / *Buongiorno! Come sta?* → greeting
  6. mc: What is *diciotto*? 8 / 18 / 80 → 18
- **doneTitle:** Ready to ask the price. **doneGo:** Open the numbers drill

## Vocabolario
Added after the lesson was built (the word check, `ui/vocab.js`): the full list is the chapter's `vocab` field in
`src/lessons/07-al-mercato/content.js`. The loop gains `l7-vocab` ("Learn the Lesson 7 words") between `l7-handbook` and
`l7-practice`: the practice is locked until the word check (flashcards, then a quiz) is passed.
il mercato (m), la maglietta (f), la cravatta (f), il mazzo di fiori (m), il melone (m) · *Quanto costa?*, *questo* (a masculine thing), *questa* (a feminine thing), *euro*, *Sono … euro.*, *Non ho capito.* · Polite (review): *Scusi*, *Può ripetere?*, *Sì*, *Grazie mille*, *Arrivederci* · Numbers 0–20: a pointer to the numbers drill (no cards; the drill is the test).

## Tiles and parser
- Lesson 7 pack ("Al mercato", in the bank at the market): *Quanto costa?* · *questo* · *questa* ·
  *la maglietta* · *la cravatta* · *il mazzo di fiori* · *il melone* · *Non ho capito.*
- Place tile *il mercato* in the **Places** group from Lesson 7 on, and `PLACES.mercato = ['il mercato','the market']`.
- Intents: `ask_cost` ← 'quanto costa' · `this:m`/`this:f` already exist · `item7:maglietta` etc. ·
  `notunderstood` ← 'non ho capito' (the vendor repeats slowly, the same as `repeat`).
- `QWORDS.add('costa')`.

## Shared changes needed (built before the lesson)
1. **Market scene** `mercato`: SCENES entry with stall collisions, a pre-rendered background, built in `boot.js`;
   the four vendor NPCs in `content/npcs.js` (`lesson:7, scene:'mercato', formal:true`, sensible looks: aprons,
   a hat for Gino); a map **landmark** for the market near node [0,1], and a **DEST** "Mercato · Piazza delle Erbe".
2. **Map routes from hooks:** a lesson hook can supply its own traced route (key, nodes, when tracing is active,
   OK flag), so Lesson 7 doesn't edit `map.js` again. The same goes for unlocking a DEST.
3. **Place tiles from hooks** (`placeTiles()`), so *il mercato* appears in the Places group.
4. **Stain prop:** `drawPerson` draws a coffee stain when `npc.stain` is set.
5. **Numbers drill** module and the **Numeri** header button, as above, plus the Numeri section in the dictionary.
6. **Listening lines:** `npcLine(it, en, { listen:true })` speaks the line and shows a bubble with a replay
   button and the text hidden; `revealListen()` reveals the latest one.

## Test plan (`tests/l07-mercato.js`)
Skip link to Lesson 7 → Mark → Bruno (asks the price-less way first with *ciao* to get the politeness hint,
then correctly) → map trace → market → Teresa barrier (greeting and *come sta?* answered, Mark's question and its one tile *Quant'è… the blue shirt?*, small talk and other sentences answered without moving on, the dialog closed and reopened, the tile → the shirt's price said fast and hidden, "What did she say?", "I didn't catch the number") → handbook practice → drill: spelling intro (one deliberate
typo that gets corrected, one wrong word that shows the answer), then rounds up to 5 (read the numbers from
`__dbg()`/test hooks, one deliberate wrong round) → the three stalls: one asked before greeting (hint), one
wrong notepad number (repeat + reveal), Pina optional → completion screen; dictionary shows Numeri.

## Open questions
- Should the drill later grow to 0–100 for the next lessons (same module, a range setting)? Planned: yes.
