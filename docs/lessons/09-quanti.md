# Lesson 9 · Due magliette, tre rose — design doc

## Summary
- **Story beat:** Mark's story is finished: he no longer appears, and nothing explains why. The player is at the market
  with a shopping list (no reason given; it's simply the player's list). At the first stall the player asks for *due maglietta* and the vendor gets
  confused, so it's off to the handbook for plurals. Then the player buys everything on the list, stall by stall.
  As the player is leaving, a stranger, **Sofia**, a visitor from Milan, introduces herself and asks the way to
  San Lorenzo. The player gives her directions with the city map open: each sentence draws the next part of the
  route on the map as it is said.
- **Teaching goal:** **plurals**. Nouns (*-o → -i*, *-a → -e*, *-e → -i*) and agreement with a number
  (*due magliette*, *tre rose*, *cinque arance*); articles in the plural (*i, le*, and *gli* seen once); *quanti / quante*.
- **Planted for later:** plurals come back at the museum (Lesson 11): *Quante persone ci sono? Ci sono tre angeli.*
  Lesson 9 doesn't teach *ci sono*.
- **Review:**
  - directions: the player *gives* them in the polite form (*Vada dritto*, *Giri a destra*); Lesson 3 taught
    understanding them
  - introductions: Lesson 1, formal
  - numbers by ear and the notepad: Lessons 7–8
  - colours and agreement: Lesson 8
  - *vorrei*, *Ha …?*, *Lei*
- **Modes:** shopping alone → TILES (+ LISTEN for prices, the notepad for totals); directions → TILES with the map
  beside the tile bank.
- **Where:** the market. The scene with Sofia is at the market exit.
- **Depends on:** the end of Lesson 8. From now on, `S.lesson >= 9` hides Mark everywhere.

## The loop

| # | `S.tut` | mode | objective | what happens |
|---|---|---|---|---|
| 1 | `l9-start` | — | Check your shopping list | The player starts at the market. The **shopping list** opens: the notepad's checklist mode (below). No mention of Mark. |
| 2 | `l9-barrier` | TILES | Buy the shirts at Teresa's | **The barrier.** The player says *Vorrei due maglietta* with the singular tiles they have. Teresa: *Due… maglietta? Una maglietta… o due magliette?* She repeats *magliette*, stressing the ending, and looks puzzled. The guide: "She heard *two* and *one shirt* at the same time. Check the handbook." |
| 3 | `l9-handbook` → `l9-vocab` → `l9-practice` | — | Open your handbook → Learn the words → Finish the practice | Chapter 9, its **Vocabolario** check (required), then the practice. |
| 4 | `l9-shopping` | TILES + LISTEN | Buy everything on your list · k/4 | Four stalls, any order (below). Each finished item is ticked on the list. |
| 5 | `l9-sofia` | TILES (intro) | Someone wants to talk to you | Sofia comes up to you near the market exit and introduces herself. |
| 6 | `l9-directions` | TILES + MAP | Tell Sofia how to get to San Lorenzo | The **dictated route** (below). |
| 7 | `l9-done` | — | Lezione 9 completata | Sofia: *Grazie mille! Lei è molto gentile.* Completion screen with the shopping list (with plurals) and the route you gave. |

## The shopping list
Shown in the notepad as a checklist, in **English**, so the player has to make the plural themselves. The numbers
vary a little between playthroughs so nobody can memorise them:
- Teresa: **2 T-shirts** (*due magliette*), in a colour you choose: *due magliette rosse* is a bonus, not required
- Franco: **2 ties** (*due cravatte*) and **1 scarf** (*una sciarpa*)
- Gino: **3 roses** (*tre rose*) and **2 sunflowers** (*due girasoli*)
- Pina: **5 oranges** (*cinque arance*), **6 tomatoes** (*sei pomodori*) and **1 melon** (*un melone*)

That covers every pattern the chapter teaches: *-a → -e* (magliette, cravatte, rose), *-o → -i* (pomodori),
*-e → -i* (girasoli), *-cia → -ce* (arance), and the singular with *un/una* (una sciarpa, un melone).

## A stall conversation (`l9-shopping`)
1. Greet and how-are-you (the vendors' Lesson 7 behaviour, with the same hint if skipped).
2. *Vorrei due magliette, per favore.* Variants accepted: *Ha due magliette?* and adding a colour
   (*due magliette rosse*; the colour has to agree: *rossa* → "plural: **rosse**").
   Wrong plural → the vendor's confused echo, plus a hint that points at the ending:
   *maglietta → magliette* ("-a becomes **-e** in the plural").
3. Vendors sometimes check: *Quante? Due?* → *Sì, due.* (or *Sì, due magliette.*). Gino asks *Quante rose?*, which
   gives *quante* in context.
4. The total price (LISTEN) → the notepad, then pay, like in Lessons 7–8. Change isn't required this time.
5. The list item is ticked. Leaving: *Grazie, arrivederci!*

A wrong *number* (*tre magliette* when the list says 2) → the vendor gives three; the player notices on the list and
says *No, scusi, due magliette.* This happens naturally; the test triggers it once.

## Sofia and the dictated route (`l9-sofia`, `l9-directions`)
**Sofia** (`sofia`), new: a woman of about 30 with a backpack, from Milan, visiting Padua. She speaks only Italian,
politely (*Lei*), and slowly enough to follow.
1. Sofia: *Scusi! Buongiorno. Mi chiamo Sofia, sono di Milano.* The player: greet + *Mi chiamo …* (review).
   Sofia: *Piacere! Lei è di Padova?* → a CHOICE-free answer with tiles: *No, sono …* is not taught. Accept *No* /
   *Sì* plus anything polite. Keep it light: one exchange.
2. Sofia: *Sa come si arriva a San Lorenzo? Il quartiere, sa?* → `l9-directions`. **The map opens beside the
   dialog** (a split layout: the map on the left or top, the tile bank below).
3. **Dictating.** A cursor (a little walking figure) starts at the market's map node, facing out of the market. Each
   sentence the player says moves it, and the drawn route grows as the player speaks:
   - *Vada dritto* → straight on to the next crossroads.
   - *Vada sempre dritto* → straight on until something stops it: the edge, the river, or a landmark.
   - *Giri a destra / a sinistra* → turn, then go to the next crossroads.
   - *Alla prima / seconda strada giri a destra* → go 1 or 2 crossroads, then turn.
   - *fino alla farmacia / alla chiesa / alla banca* → straight on until that landmark.
   - *Poi …* chains instructions in one sentence.
   - Sofia confirms each step out loud (*A destra, va bene…*), so the player hears that they were understood.
   - An impossible step (into the river, off the map) → Sofia: *Lì c'è il fiume!* (or *Lì non c'è una strada*). The
     segment is drawn red and taken back.
   - *No, scusi…* or a **Cancella** tile undoes the last step.
4. **Any route that reaches San Lorenzo is accepted**, however long. Once the cursor is in the San Lorenzo area, the
   player finishes with *San Lorenzo è lì.* (or *È lì*). Sofia: *Perfetto! È lontano?* → *No, non è lontano.* (review;
   accept anything) → `l9-done`.
5. Guidance without giving it away: the map shows the landmarks, the guide says "Say one step at a time; watch your
   route on the map", and after 3 impossible steps the guide shows one valid next step.

The direction tiles are the *Lei* forms from the Lesson 3 table, which the player has so far only heard:
*Vada dritto*, *Vada sempre dritto*, *Giri a destra*, *Giri a sinistra*, *alla prima strada*, *alla seconda strada*,
*fino alla farmacia / chiesa / banca*, *poi*, *San Lorenzo è lì*, *non è lontano*, *No, scusi*.
The Vocabolario lists them under "Giving directions (Lei)".

## Handbook chapter
- **title:** *Due magliette, tre rose* · **sub:** Plurals: more than one
- **dlgNote:** A customer buying several things at a flower stall.
- **dialogue:**
  - *Buongiorno! Vorrei tre rose e due girasoli.* — *Tre rose… e due girasoli. Altro?*
  - *Sì, una pianta, per favore.* — *Ecco! Sono quindici euro.*
- **phrases:**
  - *una maglietta → due magliette*
  - *un limone → due limoni*
  - *un girasole → tre girasoli*
  - *una rosa → tre rose*
  - *Quanti? / Quante?*
  - *Vorrei due … , per favore.*
- **how** (a table, the centrepiece):

  | singular | plural | example |
  |---|---|---|
  | -o (m) | -i | il pomodoro → i pomodori |
  | -a (f) | -e | la maglietta → le magliette, la rosa → le rose |
  | -e (m or f) | -i | il girasole → i girasoli, il melone → i meloni |
  | -cia / -gia | -ce / -ge | l'arancia → le arance |
  | accented words | don't change | il caffè → i caffè (from Lesson 2) |

  Then the articles: **il → i**, **la → le**, **l' → gli** (m) / **le** (f). Adjectives agree too: *due magliette
  rosse*, *due girasoli gialli*. Careful: *rosa* the flower is regular (*le rose*), but *rosa* the colour (pink) never
  changes: *due magliette rosa*. That's the chapter's "aha" note.
- **culture:** at markets, people often buy flowers by the stem (*a stelo*). Giving an odd number of flowers is
  traditional (even numbers are for funerals in some regions). Chrysanthemums are for cemeteries, never a gift!
- **exercises (6–7):**
  - plural of *maglietta* / *pomodoro* / *girasole* / *arancia*
  - *due magliette rossa / rosse*
  - *quanti / quante* + noun
  - an order exercise: *vorrei tre rose*
  - spot the mistake: *due cravatta*
  - the odd-number culture question

## Vocabolario (required)
- **Clothes:** la maglietta / le magliette · la cravatta / le cravatte · la sciarpa / le sciarpe
- **Flowers:** la rosa / le rose · il girasole / i girasoli · la pianta / le piante
- **Fruit and vegetables:** l'arancia / le arance · il pomodoro / i pomodori · il melone / i meloni
- **Plural words:** i · le · quanti? · quante? · due … · tre …
- **Giving directions (Lei):** the tiles listed in the Sofia section above
- **Meeting Sofia:** Sono di … · Lei è di …? · Sa come si arriva a …? (you'll hear)

## Shared changes needed
1. **Mark leaves.** `S.lesson >= 9` hides Mark in every scene (`sceneOf` hook). No other lesson logic depends on him
   after Lesson 8.
2. **The notepad checklist mode** (`src/ui/notepad.js`): a titled list of items with ticks, openable any time with a
   button during the lesson, and shown next to the tile bank at a stall.
3. **The dictated map:** a new map mode, *dictation*, in `world/map.js`:
   - a cursor (node + heading); `mapStep(op)` where `op` is `straight` | `straightUntil(stop)` | `turn(L|R)` |
     `nth(n, L|R)` | `until(landmark)`
   - validity checks (river, edges); undo
   - an "arrived" test for an area: the San Lorenzo nodes
   - a compact layout shown *inside* the dialog (or beside it) while the conversation goes on

   Reusable: Lesson 13 (Venice) can use the same mode. The lesson's `react` hook turns direction intents into
   `mapStep` calls.
4. **Sofia:** a new NPC at the market (`lesson:9`, formal, backpack prop), who walks up to the player when `l9-sofia`
   starts. A short scripted walk to the player is enough.

## Test plan (`tests/l09-plurali.js`)
Skip link to Lesson 9 → the shopping list → the barrier (*due maglietta*) → handbook, word check (one wrong answer),
practice → shopping:
- Teresa: *due magliette rossa* → the agreement hint, then correct
- Franco: *tre cravatte* → the wrong-number fix (*No, scusi, due cravatte*)
- Gino: *quante rose?* exchange
- Pina: *cinque arancia* → the -cia → -ce hint; *sei pomodoro* → hint
- one total into the notepad at each stall

Then Sofia: the introduction, then the dictated route: one impossible step (the river) → undo, then a valid winding
route, then *San Lorenzo è lì*. Completion screen.

## Later
- Sofia comes back in Lesson 11, at the museum.
