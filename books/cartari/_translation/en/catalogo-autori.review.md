ENGLISH_FIXES: 6
RU_ERRORS: 0

Independent review of en/catalogo-autori.md against the Italian (scans 0023–0024, 0037–0039) and ru/catalogo-autori.md, item by item. Block numbers are 1-based, as the checker counts them (78 blocks; `--check`: OK).

## English fixes
- 28, 67: *Dialoghi fatti Latini di A. Agostini*: "the dialogues of A. Agostini made Latin" → "translated into Latin". "Made Latin" is a calque and unclear in English (E1). The Doubtful-passages note was updated to match.
- 35, 74: "Giovanni Ravisius Textor" → "Joannes Ravisius Textor". *Gio.* was Italianised while the surname followed the glossary's Latin form (Ravisius Textor). The fix follows E2 (Latinised forms for lesser-known authors) and matches Andreas Schottus and Franciscus Sweertius. The note in Doubtful passages and the row in catalogo-autori.glossary-new.tsv were updated.
- 38, 77: "his Dialogue" → "his dialogue". This applies E3 and matches "dialogue" in blocks 28 and 67.
- Doubtful passages (not counted): the Dinneuo note now says "following the glossary note" instead of "following the Russian treatment". The glossary entry for Corrado Dinnero already records the second-printing form.

## Checked and kept
- 6, 45: "Phurnutus, or, as others call him, Cornutus". The glossary gives Cornutus (Phurnutus), but the Italian names two forms on purpose (*Fornuto, o come altri lo chiamano, Cornuto*). Using the glossary's bracketed variant for *Fornuto* is the only sensible rendering. Elsewhere the book uses plain "Cornutus" (gran-madre, nettuno, plutone), which is consistent.
- 73: "Conrad Dinnevo" (2nd printing *Dinneuo*) against 34 "Conrad Dinner". This follows the glossary comment, which keeps the second-printing misprint, and the note explains it.
- 2, 41: *che sono in essere* = "extant". This is correct: the phrase refers to the writings that survive. *di proposito* = "expressly" (as opposed to *di passaggio*, "in passing").
- 16 "MODERN." / 55 "Modern.", 22 "in verse" / 61 "and in verse" (*& in verso*), 75 italic heading. All three reproduce real differences between the two printings.
- [?1] is at "Book II" in block 77, as in the RU. The quotation keeps one prose block with *(Cartari)*, as in the RU.

## Russian errors
None found. The RU matches the Italian in every block. Its differences from the English are about name forms and capitalisation, which are matters of the Russian rules, not errors of sense.

## Open questions for the author
- Stork/crow in the quotation (39, 78): the GLOSSARY english column gives "Stork" and "Crow" capitalised (from RU rule 12). E3 says animals are lowercase, and most EN chapters use "stork" and "crow". Lowercase was kept; please confirm which rule wins for English.
- Should the second-printing misprint "Dinnevo" stay in the English, or be normalised silently to "Dinner" like Rocaccio, Geraldi, Arnochio, Auersa and Schotto?
- "Joannes Ravisius Textor": acceptable, or would you prefer the French "Jean Ravisius Textor" (Jean Tixier de Ravisy)?
