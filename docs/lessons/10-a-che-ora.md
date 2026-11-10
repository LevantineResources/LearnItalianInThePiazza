# Lesson 10 · A che ora? — design doc

## Summary
- **Story beat:** The player wants to see the masterpieces exhibition at the **Museo d'Arte · I Capolavori** (a fictional
  gallery of famous Italian art: Leonardo, Botticelli, Caravaggio, Boccioni; entry by timed ticket, as at any
  blockbuster exhibition). Paolo gives directions in the piazza, and the player traces them on the map and walks there.
  The museum square is crowded. Bruno is there and, in English, teaches *permesso* to get people to let you
  through. At the ticket booth the cashier asks *A che ora?* and the player can't answer. Handbook: telling the time.
  The next free slot is in an hour, so the player sits with Bruno and they play **Vedo, vedo** (I spy) in an
  eye-level view of the square, with the clock tower ticking towards the slot. At the hour: *Sono le quattro!
  Andiamo!* and the player goes into the museum. The next lesson takes place inside.
- **Teaching goal:** **telling the time.**
  - *Che ore sono?* · *Sono le tre* · *È l'una* · *È mezzogiorno / mezzanotte*
  - *e un quarto, e mezza, meno un quarto*, and *e cinque / e dieci / e venti*
  - *A che ora …? Alle quattro.* · *tra un'ora* · the 24-hour clock in writing (*16:00*, read *le sedici*)
  - Numbers 21–24 are taught as obvious compounds (*ventuno, ventidue, ventitré, ventiquattro*).
- **Also introduced, for recognition (heard in I spy, not produced except in the bonus round):**
  - **vedere:** *vedo, vedi*
  - **prepositions:** *sotto, sopra, vicino a, davanti a, dietro, accanto a*
  - **game words:** *Giusto! / Esatto! / Sbagliato! / Ritenta!*
  - **permesso**
- **Review:** directions by ear and map tracing (Lessons 3, 5, 7), numbers (Lesson 7), colours and agreement
  (Lesson 8), plurals (Lesson 9), Lei vs tu, *un biglietto* and prices with the notepad (Lesson 7).
- **Modes:** TILES (Paolo, the ticket booth, telling Bruno the time); the MAP (follow directions); **PERMESSO**
  (a quick pick when you bump into the crowd); the **I SPY** game (click on what Bruno describes).
- **Where:** piazza → map → **new scene: the museum square** (a half-plaza: museum doors at the top, the ticket booth
  beside them, a crowd in front, a bench, the clock tower) → **new eye-level view** of the same square for I spy.
- **Depends on:** the end of Lesson 9. No story reason is needed for why the player wants to go (none is given).

## The loop

| # | `S.tut` | mode | objective | what happens |
|---|---|---|---|---|
| 1 | `l10-start` | TILES | Ask Paolo the way to the museum | The piazza. The guide: you'd like to see the masterpieces at the Museo d'Arte; ask someone the way. Paolo (tu) gives directions. |
| 2 | `l10-route` | MAP | Trace the route to the museum | Like Lessons 3, 5 and 7: trace Paolo's route; the **Museo d'Arte** destination unlocks. |
| 3 | `l10-crowd` | PERMESSO | Get to the ticket booth | The museum square. Bruno waves you over, then says in English: "You'll never get through like that! Say *permesso*: it means 'may I pass'." The first person moves when Bruno demonstrates. Then each crowd member you bump into gets a quick pick (below). |
| 4 | `l10-booth` | TILES | Buy a ticket | **The barrier.** Cashier (Lei): *Buongiorno! Un biglietto? A che ora?* The player has no time words. Whatever they try: *Per le tre e mezza è pieno. Il prossimo ingresso è alle quattro.* (fast, as a listening line). System line: you didn't understand a single time. → handbook. |
| 5 | `l10-handbook` → `l10-vocab` → `l10-practice` | — | Open your handbook / Learn the words / Finish the practice | Chapter 10 with its required Vocabolario check. |
| 6 | `l10-ticket` | TILES + LISTEN | Buy a ticket for the next entry | Back at the booth (below). |
| 7 | `l10-wait` | — | Wait with Bruno | Bruno, on the bench: "An hour to kill. Let's play *Vedo, vedo*!" → the **I spy** view opens. |
| 8 | `l10-ispy` | I SPY | Play Vedo, vedo · k/10 | 10 correct finds (below). The clock tower moves on 6 minutes per correct find, from 15:00 to 16:00. |
| 9 | `l10-done` | — | Lezione 10 completata | At 16:00 Bruno: *Sono le quattro! Andiamo!* You show your ticket and go in. Completion screen. |

## Paolo's directions
Paolo (tu, `marco`) in the piazza. *Scusa, dov'è il museo?* (accept *il Museo d'Arte*).
- intro: *Il Museo d'Arte? È vicino alla stazione. Non è lontano!*
- lines, informal imperatives (tu: *vai, gira*):
  1. *Vai dritto fino alla banca.*
  2. *Alla banca gira a sinistra.*
  3. *Poi alla prima strada gira ancora a sinistra.*
  4. *Il museo è lì, vicino alla stazione.*
- Grid route: [2,4] → [2,3] (bank) → [1,3] → [1,4]. It ends at the **Museo** landmark (node [1,4], between the
  park and the station). Confirms and *È lontano?* work
  like Lesson 7's Bruno. *ancora* (again) is new: add it to the Vocabolario.

## The museum square (new scene `museo`)
A half-plaza, top-down like the other scenes:
- **Top:** the museum building with its doors (enterable only at the end).
- **Beside the doors:** the ticket booth (*Biglietteria*).
- **Front:** a crowd of about 6–8 people who block the way to the booth (tourists with backpacks and cameras, a
  school group).
- **Elsewhere:** a bench (Bruno), the clock tower (a clock face readable from above, showing 15:00 → 16:00), trees,
  pigeons.

### Permesso
- **The crowd members** are a new kind of NPC (`crowd:true`) that blocks the walkway.
- **Bumping into one or pressing E** shows a quick pick of three choices above the player: **Permesso** /
  **Scusi** / **Prego**.
  - *Permesso* → a speech bubble *Permesso!* above the player, the person answers *Prego!* and steps aside
    (a short walk, then they stay out of the way).
  - *Scusi* → they turn around: *Sì?*, then stay put. Hint: "*Scusi* gets someone's attention. To get past, use
    the word Bruno taught you."
  - *Prego* → a puzzled look. Hint: "*Prego* is what *they* say back."
- **The first person** is moved by Bruno's demonstration (he says it, they move): use the teacher (`maestra`), so the
  player still has to move two people themselves (one of the three at the mouth of the booth bay, and `turista4`).
- This is a reusable mechanic: the train and Venice crowds can use it later.

## The ticket booth (`l10-ticket`)
The cashier is formal. All lines are spoken; prices and times are listening lines where understanding is the task.
1. Greet (a greeting in the same turn counts).
2. Cashier: *Un biglietto? A che ora?* Player: *Un biglietto per le quattro, per favore.* or *Alle quattro, per
   favore.* (accept both).
   - Asking for 15:30: *Mi dispiace, alle tre e mezza è pieno.* (pieno is in the Vocabolario).
   - Asking for a time before now: *Ma… sono già le tre!*
   - Asking for a later time (*alle cinque*): fine, but Bruno will say it's a long wait; the slot is set to the one
     the player chose, and I spy runs until that time with the same 10 finds (the clock just jumps more per find).
     Keep it simple: accept any slot from 16:00 to 18:00.
3. Cashier: *Sono quattordici euro.* (listening line) → the notepad (as in Lesson 7). Pay: *Ecco venti euro.* → the
   change (listening) → the notepad.
4. Cashier: *Ecco il biglietto. Ingresso alle quattro: tra un'ora.* Player: *Grazie, arrivederci!*

## Vedo, vedo (I spy) — new minigame `ui/ispy.js`
An **eye-level view** of the museum square (a new illustration style for the game: a street-level scene, not top
down). It is **generated from parts** so every round is different, and it is reused later (the practice menu, and
paintings in the museum lesson):
- **The scene:**
  - background: the museum façade, the clock tower, café tables and chairs, the fountain, trees
  - people: men, women, children; shirt colours from the Lesson 8 colours; hats, bags, umbrellas
  - animals and things: a cat, a dog, pigeons, a bicycle, a balloon
  - small idle animations (people shifting, pigeons hopping, a dog's tail) so it feels alive
- **Bruno says** *Vedo, vedo… un gatto!* (spoken; the text appears as well, since this is listening + reading
  practice, but Bruno's English gloss is hidden). The player **clicks on (or near)** the thing. Feedback:
  - **right:** *Giusto! / Esatto! / Bravo!*, the clock moves on 6 minutes, and the next round starts
  - **wrong:** *No, sbagliato! Ritenta!*, the same round again; after 2 misses Bruno adds a clue in Italian
    (*È vicino alla fontana*); after 3 misses the target sparkles briefly
- **Difficulty grows over the 10 finds:**

  | finds | Bruno says | skill |
  |---|---|---|
  | 1–3 | *un gatto*, *un piccione*, *una bicicletta* | nouns |
  | 4–6 | *una donna con una maglietta blu*, *un uomo con un cappello nero* | adjectives and colours (agreement) |
  | 7–8 | *un tavolo con tre uomini*, *due bambini* | numbers and plurals (*uomo → uomini* is irregular: in the handbook) |
  | 9–10 | *il cane sotto il tavolo*, *la borsa sopra la sedia*, *il bambino dietro la fontana* | prepositions |

  Bruno can say combined forms naturally (*sul tavolo*); the handbook teaches the plain forms and mentions in one
  line that *su + il = sul* will come later.
- **The clock:** the clock tower is visible in the view. At 15:15, 15:30 and 15:45 (after finds 2–3, 5 and 7–8),
  Bruno asks *Che ore sono?*. The player reads the clock and answers with tiles: *Sono le tre e un quarto*,
  *Sono le tre e mezza*, *Sono le quattro meno un quarto*. Accept *le quindici e quindici* etc. as correct too
  (24-hour). Wrong answers get feedback on the player's own words ("mezza is half past").
- **Bonus round, optional, after the 10th find: *Tocca a te!*** The player builds *Vedo un … [con …] [sotto …]*
  with tiles, and Bruno finds it (or says *Non lo vedo!* if it isn't in the scene). It doesn't block completion.
- **Afterwards:** the I spy game is available in Studio (a "Vedo, vedo" tab or card) once Lesson 10 is complete.

## Handbook chapter
- **title:** *A che ora?* · **sub:** Telling the time
- **dlgNote:** At a museum ticket desk.
- **dialogue:**
  - *Buongiorno! Un biglietto, per favore.* — *A che ora?*
  - *Che ore sono adesso?* — *Sono le tre e dieci.*
  - *Alle tre e mezza, per favore.* — *Mi dispiace, è pieno. Alle quattro?*
  - *Va bene, alle quattro.* — *Sono quattordici euro. Ingresso tra un'ora.*
- **phrases:**
  - *Che ore sono?*
  - *Sono le tre. / È l'una.*
  - *Sono le tre e un quarto / e mezza.*
  - *Sono le quattro meno un quarto.*
  - *A che ora …? Alle quattro.*
  - *tra un'ora*
  - *Permesso!*
- **phrases2 (you'll hear):** *È pieno.* · *Il prossimo ingresso è alle …* · *Vedo, vedo…* · *Giusto! / Sbagliato! / Ritenta!*
- **extra:**
  - a clock face diagram with *e cinque … e mezza … meno venti … meno cinque*
  - *ventuno, ventidue, ventitré, ventiquattro*
  - six preposition pictures (*sotto, sopra, vicino a, davanti a, dietro, accanto a*)
- **how:**
  - Hours are feminine plural: *sono le tre* (*le ore*); one o'clock, midday and midnight are singular:
    *è l'una*, *è mezzogiorno*.
  - **At** a time = **alle** (*alle quattro*), **all'una**.
  - Minutes after the hour: **e**; to the hour: **meno**.
  - Timetables and tickets use the 24-hour clock (*16:00 = le sedici*): 21–24 are *venti* + the number, with
    ventuno and ventotto dropping the i.
  - *Vedo* = I see, *vedi* = you see (friend). Irregular plural: *l'uomo → gli uomini*.
- **culture:**
  - Big exhibitions and famous works in Italy are often seen with a **timed ticket** (*biglietto a orario*): to see
    Leonardo's Last Supper in Milan you book a 15-minute slot weeks ahead. Booking a time slot is normal.
  - *Permesso* is also what you say when entering someone's home.
- **exercises (6–7):**
  - read a clock (picture) → *Sono le tre e mezza*
  - *Che ore sono?* → 4:45
  - *alle* vs *le*
  - *permesso* vs *scusi* (which one to get past?)
  - a preposition from a picture
  - *vedo* vs *vedi*

## Vocabolario (required)
- **Time:** Che ore sono? · Sono le … · È l'una · È mezzogiorno · È mezzanotte · e un quarto · e mezza ·
  meno un quarto · alle … · A che ora? · tra un'ora · adesso · l'ora / le ore
- **Numbers:** ventuno · ventidue · ventitré · ventiquattro (+ a note: the rest follow the same pattern)
- **At the museum:** il museo · la cappella · il biglietto · l'ingresso · è pieno · Permesso!
- **I spy:**
  - Vedo, vedo… · vedo · vedi
  - Giusto! · Esatto! · Sbagliato! · Ritenta!
  - the people: l'uomo / gli uomini · la donna / le donne · il bambino / i bambini · la bambina
  - the animals: il gatto · il cane · il piccione
  - the things: il tavolo · la sedia · la bicicletta · il cappello · la borsa · l'ombrello · la fontana ·
    l'orologio (the clock)
  - the prepositions: sotto · sopra · vicino a · davanti a · dietro · accanto a

## Verbs (for the grammar drill)
- **vedere:** vedo (I see), vedi (you, friend, see), vede (he/she sees; you, polite, see)
- **essere** in times: sono le … / è l'una (review)
- **The informal imperatives Paolo uses** (*vai, gira*) are already in the drill's Lesson 3 set.

## Tiles and parser
- **Time tiles:**
  - *Sono le*, *È l'una*, *alle*, *all'una*
  - the hours 1–12 and 13–24 (number tiles)
  - *e*, *meno*, *un quarto*, *mezza*, *cinque*, *dieci*, *venti*
  - *Che ore sono?*, *A che ora?*
- **Intents:** `time:H:M` (built from the parts, validated: *meno un quarto* subtracts, *le quattro meno un quarto* =
  15:45), `ask_time`, `at_time:H:M`, `ticket`.
- **Format:** *Sono le tre e mezza.* and *Alle quattro, per favore.* (QWORDS: *ore*, *ora*).

## Shared changes needed
1. **The museum scene** `museo` (scenes.js, backgrounds.js, boot.js), with the map landmark **Museo** near the
   station, a DEST, and the route hooks (Lesson 7's `mapRoute` / `dests`).
2. **Crowd NPCs and the permesso pick** (a reusable mechanic: `crowd:true` NPCs, a quick-pick bubble over the
   player, a step-aside walk).
3. **`ui/ispy.js`:**
   - the eye-level procedural scene renderer: a new canvas view, built from parts, with idle animation
   - the round generator: the difficulty tiers, the target and its description, and the hit area for clicks
   - the clock
   - Bruno's lines, feedback, the bonus round, `__dbg` state (the current target and its position, for tests)
   - reuse in Studio once Lesson 10 is complete
4. **Time parsing:** the time intents in the parser, plus the `time:H:M` arithmetic.
5. **The clock tower** shows the game's time in the museum square, and the I spy view shows it too.

## Hard mode
Natural alternatives the lexicon must accept: *Alle quattro* / *Per le quattro* / *Un biglietto per le quattro* /
*Le sedici*; *Sono le tre e trenta* (for *e mezza*); *Sono le quattro meno quindici*; *È l'una e un quarto*;
*Mi scusi*; *Grazie mille*.

## Test plan (`tests/l10-a-che-ora.js`)
Skip link to Lesson 10 → Paolo's directions → the map trace → the museum square → Bruno's permesso demo → one *Scusi*
(the hint) and one *Prego* (the hint), then *permesso* through the crowd → the booth barrier → handbook, word check
(one wrong answer), practice → the ticket:
- *alle tre e mezza* → *pieno*
- *alle quattro* → the price into the notepad, then the change

Then I spy: read the targets from `__dbg()`:
- click near each target
- one deliberate miss → *Sbagliato! Ritenta!*
- the three *Che ore sono?* answers (one wrong, with feedback; one in 24-hour form)
- the bonus round once

At 16:00 → *Andiamo!* → completion screen. No hint contains the Italian answer.
