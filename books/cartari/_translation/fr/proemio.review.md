FRENCH_FIXES: 17
RU_ERRORS: 1
EN_ERRORS: 1

# Vérification indépendante — proemio (fr)

Compared against: TEXT_reading.md scans 0041–0063, pages/0041–0063.md (marginalia), ru/proemio.md, en/proemio.md, GLOSSARY.tsv, fr/proemio.glossary-new.tsv. `python3 tools/build_chapters.py --lang fr --check proemio` → OK (before and after the fixes; 181 blocks as in ru/en).

## Fixes

1. Block 81: « ce qu'il lui demanderait pour cela » → « tout ce qu'il saurait lui demander pour cela ». Reason: *quello che… le hauesse saputo addimandare*, "saputo" was left out.
2. Block 86: « celle que nous usons aujourd'hui » → « celle dont nous usons ». Reason: grammar (*user de*).
3. Block 86: « (*pacchetto*, selon le Français) » → « (*pacchetto*, comme disent les Français) ». The note in Passages douteux was updated to match. Reason: *secondo il Francese* means French usage, not "a Frenchman". Capital « le Français » read as a person.
4. Block 89: « que certains voulaient être d'Esculape » → « que certains tenaient pour celle d'Esculape ». Reason: F5.1 (*voleuano* = held). The old wording was also a calque and ungrammatical.
5. Block 94: « On voit combien » → « On voit en outre combien ». Reason: F4, *Vedesi poi* — "poi" had been dropped.
6. Block 96: « Cela fut jugé avoir trop du licencieux et ne pas convenir » → « On jugea que cela tenait trop de la licence et ne convenait pas ». Reason: F1, an ungrammatical calque.
7. Block 103: « un ennemi très grave » → « un ennemi très redoutable ». Reason: *grauissimo nimico*; « ennemi grave » is not idiomatic French.
8. Block 111 (aside): « Ammien Marcellin » → « Marcellin ». Reason: the margin prints *Marcellino*. The glossary comment says to keep the printed form, and the text of block 114 already uses « Marcellin ». This makes the two consistent.
9. Block 117: « prise du Capitole » → « prise au Capitole ». Reason: grammar.
10. Block 122: « les principaux, et les plus propres, étaient ceux qui signifiaient » → « les statues principales, et les plus propres, étaient celles qui signifiaient ». Reason: meaning. *le principali, & più proprie erano quelle* is feminine and refers to the statues, not the *cognomi*. The masculine form had shifted the meaning to the surnames.
11. Block 127: « ce que lui montrait le Pontife et les autres prêtres » → « montraient ». Reason: agreement with a compound subject.
12. Block 141: « des choses pour lesquelles on est envié de qui les possède » → « des choses qui font envier ceux qui les possèdent ». Reason: meaning reversed. *è hauuta inuidia à chi le possiede* means the owner is the one envied. The old French made the owner the one who envies.
13. Block 147: « du vitex » → « du gattilier ». Reason: glossary (Vitice → gattilier).
14. Block 155: « pour en faire des statues » → « pour leur en faire des statues ». Reason: *per farne loro delle statoe*, "loro" (for the gods) was omitted.
15. Block 157: « avaient coutume de ne faire de marbre que… » → « avaient souvent coutume… ». Reason: *soleuano spesso*, "spesso" was omitted.
16. Block 171: « Claudien… fait qu'un serpent entoure l'antre » → « chez Claudien, …, un serpent entoure l'antre ». Reason: F5.2 (*fà che* used of an author).
17. Block 174, stanza 2, lines 1–2: « Elle, de son corps sinueux, est enlacée / par un serpent » → « Autour d'elle, de son corps sinueux, s'enroule / un serpent ». Reason: the old wording made *flessuoso corpo* sound like the cave's body. It belongs to the serpent (*Questa col flessuoso corpo cinge / Vn serpe*). Line count is unchanged.

## Judged, not changed

- Blocks 128 and 133: *disegnare* is rendered « dessiner » (« image que j'aurai dessinée », « en dessinant les images »). RU and EN use describe/описать. « Dessiner » in the older sense of "delineate" is acceptable, so I kept it. A later editor may prefer « décrire ».
- Block 9: « Numen », against « divinité(s) » in blocks 50, 52, 72, 83 and 160. This follows the translator's note (no pleonasm with *diuino*) and the glossary (Nume → Numen).
- Block 65: « parut vouloir dire » for *parue volere*. This is already explained in Passages douteux and is acceptable ("seemed to mean"). It is not the forbidden « veut ».
- Block 101: « observèrent ensuite de faire » (*Osseruarono poi*). Slightly old-fashioned but correct.
- Block 85: « le jeu des Chevaux », capitalised as in the source (*Caualli*). Kept.
- [?1]–[?4] are in the same places and have the same numbers as in ru. The notes are translated, and so are the unnumbered items. Typography: no missing non-breaking spaces before ; : ! ? or inside « », and apostrophes are uniformly straight.
- All 88 marginal notes (as in the source and ru) are present, as `<aside>` blocks in the same places as in ru. All four captions are present and complete.

## Open doubts

- Block 11, RU: the RU file merges « ogni casa, & ogni persona » (logged in proemio.ru-errors.tsv). FR is correct.
- Block 174, EN: lines 3–4 of the last stanza are in reversed order (logged in proemio.en-errors.tsv). FR keeps the Italian order.
- Block 114 / aside 111: the glossary's french form is « Ammien Marcellin », but its comment prescribes the printed « Marcellin » in the text. I followed the comment for both places. The glossary owner may want to state explicitly which form marginal notes should use.
