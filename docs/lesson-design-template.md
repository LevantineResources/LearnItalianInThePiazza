# Lesson NN · Title — design doc

> One file per lesson in `docs/lessons/NN-name.md`. Written during planning; an agent builds the lesson
> from it. Keep it concrete: real Italian lines, real NPC ids, real tutorial-state names.

## Summary
- **Story beat:** one or two sentences. What happens and why the player cares.
- **Teaching goal:** the one new idea (plus anything reviewed).
- **Conversation engine:** tile bank / typed script / other (and why).
- **Where:** scene(s). Any new scene, NPC or map destination is listed under *Shared changes*.
- **Depends on:** the end state of Lesson NN-1 (see its `skip`).

## The loop
| step | tutorial state (`S.tut`) | objective (header) | guide banner | what happens |
|---|---|---|---|---|
| 1 | `lNN-start` | … | … | the barrier: … |
| 2 | `lNN-handbook` | Open your handbook | … | |
| 3 | `lNN-vocab` | Learn the Lesson NN words | Read Lezione NN. Then learn its words: open the **Words** tab… | the word check: flashcards, then a quiz (the practice is locked until it is passed; `onVocab()` → next state) |
| 4 | `lNN-practice` | Finish the Lesson NN practice | … | |
| 5 | `lNN-…` | … | … | the real task |
| … | `lNN-done` | Lezione NN completata | … | completion screen |

## Handbook chapter
- **dlgNote:** …
- **dialogue:** (speaker, Italian, English) × 5–8
- **phrases (What you say):** Italian · English · note
- **phrases2 (What you'll hear):** optional
- **How it works:** the grammar, in two or three short paragraphs
- **Culture note:** …
- **Exercises (5–7):** type, question, options/tiles, answer, why, nudge

## Vocabolario
**At most 50 terms**, essentials only: the words the player must say, or must understand to answer. Everything else
an NPC says gets an English gloss instead. (The word check's flashcards slow a lesson down; keep the list tight.)
 (required)
Every word the player will tap, type or must understand in this lesson that earlier lessons have not taught: every
tile of the lesson's packs and every word of the typed scripts' model answers. It becomes the chapter's `vocab` field,
is listed at the end of the chapter, and is learned in the required word check (flashcards, then a quiz) before the
practice. `tests/vocab-coverage.js` fails if a tile or model answer uses a word that no Vocabolario teaches.
Group it sensibly (things, colours, phrases…). Per word:

| Italian | g | English | note |
|---|---|---|---|
| la maglietta | f | the T-shirt | Plural: le magliette. |
| rosso / rossa | | red | Adjectives: both forms. |
| Quanto costa? | | How much is it? | Phrases keep their punctuation. |

- Nouns **with their article** and a gender (`m`, `f`, `m pl`, `f pl`); adjectives with both forms.
- English glosses are quiz answers: make each one **unique in the lesson** (*this one (a masculine thing)* /
  *this one (a feminine thing)*; *Do you like it? (polite, Lei)* / *(to a friend)*).
- Review words from earlier lessons may be listed again in a "(review)" group when the lesson leans on them.
- Numbers taught by the numbers drill: a `numbers:true` group with a note instead of cards.

## Verbs (required)
List the verbs and forms the lesson teaches: every verb form the player taps, types, or is taught in the chapter (phrases,
How it works, the Vocabolario). New forms of a verb an earlier lesson taught count too. It becomes the chapter's `verbs`
field and feeds Studio's grammar drill (ui/grammar.js), where the player types each form from its English once the lesson
is completed. Write "None" if the lesson teaches no new verb forms.

| infinitive | meaning | irregular? | person | Italian | English prompt | example |
|---|---|---|---|---|---|---|
| prendere | to take, to have (food, drink) | | io | la prendo | I'll take it (la maglietta) | La prendo. |
| piacere | to like (to please) | yes | Lei | Le piace | you (polite) like it | Le piace? |
| girare | to turn | | Lei (imperative) | giri | turn! (polite) | Giri a destra. |

- Person: `io`, `tu`, `Lei`, `lui` (he / she / it), `noi`, `voi`, `loro`. The English starts with the person so tu, Lei and
  lui / lei never look alike: *I …*, *you (friend) …*, *you (polite) …*, *he / she …*, *we …*, *you (all) …*, *they …*;
  commands end in *(to a friend)* / *(polite)*. Unique within the verb.
- Only forms the lesson really teaches: no full tables "for completeness". Mark the mood if it is not the present
  (*vorrei*: conditional; *vada*: imperative).

## Tiles and parser
- Tile pack(s): label · words · gloss, and which NPCs or situations show them
- New intents: `intent` ← 'words in order'
- Question words for `QWORDS`, if any

## NPC script
For each NPC conversation: who (id, tu/Lei), the opening line, what the player must say (with accepted
variants), the NPC's replies, the hints for common mistakes, and what ends the conversation.

## Shared changes needed
New NPCs, scenes, map destinations, engine features. Each one says exactly what is needed, so it can be
built (or approved) before the lesson agent starts.

## Hard mode
The lesson must be playable without tiles (docs/features/study-and-hard-mode.md): list the natural alternative
phrasings the lexicon must accept for each conversation.

## Test plan
The playthrough `tests/lNN-name.js` should check: … and go through the word check (`t.wordCheck({ wrong:true })`: one
wrong quiz answer that comes back) before the practice.
Mistakes it should deliberately make (wrong formality, wrong gender…) and the hint each should get.

## Open questions
