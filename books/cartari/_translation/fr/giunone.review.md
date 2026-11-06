FRENCH_FIXES: 38
RU_ERRORS: 0
EN_ERRORS: 1

# Vérification indépendante : giunone (fr)

Compared block by block with TEXT_reading.md (scans 0192–0214), pages/*.md marginalia, ru/giunone.md, en/giunone.md, GLOSSARY.tsv and fr/giunone.glossary-new.tsv. After the fixes, `python3 tools/build_chapters.py --lang fr --check giunone` prints `giunone: OK`. Block numbers follow parse_chapter `n`.

## Fixes

1. Blocks 12, 58, 73, 101, 108, 111 (6 edits): *nume / Numi / Nume* had been rendered « divinité(s) ». They are now « numen » (pl. « numina »), following GLOSSARY.tsv (Nume → Numen, rule 6) and the verified chapters (saturno « numen »; proemio keeps « divinité » only for *Nume diuino*). The edits are: « un numen adoré », « avec un numen favorable », « des numina salutaires », « principal numen de ce lieu », « la faveur de son numen », « par son numen ».
2. Block 9: « Homère … fait que Junon a de beaux bras » → « chez Homère … Junon a de beaux bras » (F5.2, *fà che*).
3. Block 17: « différer d'en donner » → « différer davantage d'en donner ». The *più* was missing.
4. Block 35: « on portât en procession dans la ville une oie » → « on portât en procession une oie ». « dans la ville » is an addition: *portata in volta*.
5. Block 37: « toute ceinturée » → « toute retroussée ». *succinta* means a gown tucked up for running, not "belted".
6. Block 43: « …blanchissant, mises là par Iris » → « une couronne, posée là par Iris, ornée de… ». *postaui* refers to the crown, not to the stones.
7. Block 47: « la commodité de coucher » → « l'occasion de coucher » (F1).
8. Block 48 (caption): « ladite déesse » → « cette déesse ». « ladite » is an archaism, which F1 forbids.
9. Block 50: « ce que sonnent les paroles » → « ce que disent les paroles » (calque).
10. Block 50: « et moi non plus je ne la dis pas » → « et c'est pourquoi moi non plus… ». *onde* had been dropped.
11. Block 50: « quand il fait représenter sur la scène le jugement de Pâris » → « quand il décrit le jugement de Pâris représenté sur la scène » (F5.2).
12. Block 59: « comme le dit Festus » → « Festus Pompeius ». *Festo Pompeo*: the name had been shortened. This now matches diana.md.
13. Block 69: « s'était ainsi usurpé » → « avait ainsi usurpé ». *usurper* is not pronominal.
14. Block 75: « Et à elle, les fables imaginent … que Jupiter lia une fois les pieds » → « Les fables imaginent … que Jupiter lui lia une fois les pieds ». The broken syntax is fixed.
15. Block 88: « mais que suffisent … ces quelques-unes » → « mais qu'il suffise … de ces quelques-unes ».
16. Block 90: « Junon, irritée une fois contre Jupiter » → « Un jour, Junon, irritée contre Jupiter ».
17. Block 90: « la feignant une jeune fille qu'il se serait faite de nouveau pour épouse » → « en la faisant passer pour une jeune fille qu'il aurait prise de nouveau pour épouse » (calque).
18. Block 91: « la trouvant une statue de bois » → « trouvant que c'était une statue de bois ».
19. Block 108: « mais bien qu'à Rome un certain lieu fut appelé » → « mais je trouve en revanche qu'à Rome un certain lieu était appelé ». « bien que » read as "although" and was ungrammatical. *si bene* = "but I do find".
20. Block 112 (caption): « mariage concordant » → « mariage harmonieux » (*concorde*).
21. Block 114: « ni de colère aucune » → « ni aucune colère » (F1).
22. Block 116: « il allait se nourrissant » → « il se nourrissait » (archaic periphrasis).
23. Block 117: « se retirèrent à terre et, retirés… » → « gagnèrent la terre et, retirés… ». *si ridussero in terra*; this also removes the repetition.
24. Block 118: « Les noces solennelles et joyeuses faites » → « Après des noces solennelles et joyeuses » (F1).
25. Block 118: « Parce donc que » → « Donc, parce que ».
26. Block 120: « Et ceci fut le fait des Grecs, comme ce fut celui des Romains » → « Et ce fut une coutume des Grecs, comme ce fut une coutume des Romains » (*cosa de i Greci*).
27. Block 120: « eut très cher » → « chérit beaucoup » (archaism).
28. Block 120: « à l'ouïe de son nom » → « en entendant son nom » (archaism).
29. Block 120: « jeté l'œil sur elle » → « jeté les yeux sur elle » (idiom).
30. Block 129: « et fût moins repoussé par la mariée » → « et que celle-ci [la fleur] fût moins défendue par la mariée ». *manco fosse diffeso dalla sposa*: the subject is the flower, not the groom.
31. Block 139: « allaient au mari » → « allaient chez leur mari » (*andauano à marito*).
32. Block 143: « comme il l'en pria ensuite bien des fois ; mais sans que cela lui servît à rien, parce qu'Ulysse…, le bon vieillard » → « il l'en pria ensuite bien des fois, mais en vain ; et comme Ulysse…, le bon vieillard ». The anacoluthon is fixed (F1).
33. Block 144: « ce qui fit comprendre fort bien au père » → « d'où il sembla au père comprendre fort bien ». The hedge *parue al padre* had been lost (F4).

(Item 1 counts 6 edits, so the total is 38.)

## Judged, not changed

- Junon Argienne (caption, block 99): this is a regular adjective formed from the glossary form Argiens. It stays capitalised as a cult epithet, like Junon Corinthienne. Accepted.
- *numero non pare* (block 84) is rendered « impair ». This is correct: the sense and the marginal note « Numero pare, e dispare » require it.
- Hyménée as son of Apollon and Calliope (block 116): this is as printed (rule 8), and the glossary agrees.
- « témoin de mariage » for *compare dall'anello* (block 79) is prescribed by GLOSSARY.tsv, so it is kept even though the "ring" is lost.
- Blocks 40, 106: « l'air, entendu par Junon » is slightly ambiguous but acceptable.
- Block 56: « demandé secours à Castor et Pollux ». It makes *loro* explicit. The reading is correct (Justin), and ru does the same.
- [?1] (aside, block 42) and [?2] (block 94, after « Jupiter ») are in the same places as in ru and carry the same numbers. The Passages douteux match ru one to one.
- All marginalia are present and in the ru positions. Typography: non-breaking spaces before ; : ! ? and inside « » were checked by script, with no violations. Straight apostrophes are used throughout. There are no curly quotes.
- The header, glossary forms (Souda, Suada, Cérauno, Scythis, Jugatin, Virginensis, Pudeur, Icarios, Luperques, flammeum, torches de pin) and Pileati/*pileus* (F5.5) are correct.

## Open doubts

- Block 127: in *Et à questo fare chiamaua in suo aiuto la Dea Virginense*, the nearest agent is *lo sposo*, who unties the knot and takes the omen. ru, en and fr all read « elle » (the bride). This was left unchanged and is worth a second look.
- Block 73: « l'air est exprimé par Junon » (*mostrata per*). « représenté » would be smoother. This is a matter of style.
- « numen » / « numina »: proemio writes « Numen » with a capital, while saturno and giunone use lowercase. Capitalisation across chapters should be unified.
