# Study mode and hard mode — design doc

Two features that work across lessons, both available once a lesson is **completed**. They come before the bigger
practice menu planned for the end of Unit 1, and that menu will reuse them.

## 1. Studying a lesson's vocabulary on its own

**Builds on** the Vocabolario word check (`src/ui/vocab.js`, built for Lessons 7+): the per-lesson word list, the
flashcards and the quiz.

- **Where:**
  - a **Studia** button on every completed chapter in the handbook
  - a **Studio** screen opened from the header (a "Studio" button, key **S**), listing every completed lesson with
    its word count
- **What:** the same two parts as the required check, with no effect on progress:
  1. **Flashcards:** Italian ↔ English (a toggle for which side shows first), spoken, with gender and plural shown.
  2. **Quiz:** each word must be answered right once; missed words come back. Three item types:
     - hear the Italian → pick the English
     - read the English → pick the Italian
     - from Lesson 9 on, also **type** the Italian (accent-forgiving, with the correction shown)
- **Scope:** one lesson, several lessons, or **"My weak words"** (see the next point).
- **Remembering mistakes:** each word keeps a small record (`S.study[wordKey] = { right, wrong, last }`).
  "My weak words" picks the words with the worst right/wrong ratio first. The record is shared with the word checks
  and the tile bank: a word misused in a conversation counts as wrong.
- **Lessons 1–6** have no Vocabolario section. Build their study lists from their existing data (VOCAB1, VOCAB2 /
  ITEMS, DIR_TILES, the L4 menu and verbs, L5_TILES, L6_TILES, SET_PHRASES), grouped the same way. They appear in
  Studio only, so the old chapters are unchanged.

### The grammar drill (Studio → Verbi)
Built from the playtest notes ("Feature · grammar drill"): a second Studio tab, unlocked after Lesson 4, where the player
types each verb form taught so far from its English. Data in `src/content/verbs.js` plus each later chapter's `verbs`
field; code in `src/ui/grammar.js`; see CLAUDE.md ("Grammar drill").

## 2. Hard mode: replaying a lesson without tiles

- **Unlocks** when a lesson is completed: a **Rigioca · Modalità difficile** button on the completed chapter in the
  handbook, and on the lesson-complete screen.
- **A separate run.** Hard mode plays in its own save slot (`piazza-hard-<n>`), starting from that lesson's beginning,
  with the state from the previous lesson's `skip`. The player's real progress and save are never touched. Leaving
  hard mode (a header badge "Modalità difficile · Esci") restores the real game exactly where it was.
- **No tiles.** Every tile-bank conversation uses the **typing box** instead (Lesson 6's `readTyped` + `parse`
  pipeline):
  - accents and small typos forgiven, the correction shown
  - the typed words parsed into the same intents the tiles would make, so every NPC and every lesson hook works
    unchanged
  - the tile-bank hints still appear when something is wrong
- **Typed translation scenes** (Lessons 6 and 8) never show the model answer.
- **Unchanged:** handbook reading, map tracing, listening lines, the notepad, English choices.
- **Skipped:** the handbook's practice questions and the Vocabolario check, which were already passed. The handbook
  stays available for reading.
- **The lexicon.** Typing only accepts words the game knows. In hard mode, every lesson's lexicon should include the
  natural alternatives a player might type (for example *grazie tante* as well as *grazie mille*). Each lesson's hard
  mode test types at least one alternative phrasing per conversation.
- **The reward:** a **star** on the chapter, plus stats on the completion screen: sentences right first time, hints
  used, words looked up.

## Shared changes
- **`src/ui/study.js`:** the Studio screen and per-lesson study, reusing `vocab.js`'s flashcards and quiz. Word
  lists for Lessons 1–6 built from their data. The weak-word record.
- **`src/engine/hard.js`:**
  - hard-mode sessions (separate save, `S.hard = n`, entering and leaving)
  - a single switch in `conversation/dialog.js` and `bank.js`: when `S.hard`, tile-bank conversations show the typer
    and send the typed text through `readTyped` → the same `submit` path as tiles
  - typed scripts with `modelAfter = Infinity`
- **Handbook:** the Studia and Rigioca buttons on completed chapters; the star.
- **Tests:**
  - `tests/study.js`: study a lesson, the quiz requeues a miss, weak words.
  - `tests/hard-mode.js`: hard-mode playthroughs of Lesson 1, Lesson 3 (directions) and Lesson 7 (stalls), typing
    every line. Check that the real save is untouched afterwards.

## Order
1. The Vocabolario check (being built).
2. **Study mode**, which reuses it directly.
3. **Hard mode.**

Lessons 9+ are built with both in mind: their design docs list their Vocabolario, and each lesson's test also plays
one conversation in hard mode.
