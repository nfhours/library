FRENCH_FIXES: 31
RU_ERRORS: 3
EN_ERRORS: 1

# Vérification indépendante : diana (fr)

Compared block by block with TEXT_reading.md (scans 0129–0154), the marginalia of pages/0129–0154.md, ru/diana.md, en/diana.md, GLOSSARY.tsv and fr/diana.glossary-new.tsv. Block numbers = parse_chapter `n`. After the fixes `python3 tools/build_chapters.py --lang fr --check diana` prints `diana: OK` (179 blocks). Typography check (NBSP before ; : ! ? and inside « », straight ' throughout): no problems. No [?N] marks in this chapter. All printed marginal notes are present at the ru positions (the cropped «[?]» note of scan 0138 is omitted, as in ru).

## Fixes

1. Block 8: « Ovide, qui le fait doré et fait de corne celui des nymphes » → « qui le représente doré, et de corne celui des nymphes » (F5.3, *lo fà dorato*).
2. Block 10: « comme qui dirait *Deuiana* ; car la Lune dévie (*deuia*) » → « comme qui dirait Déviane ; car la Lune dévie » — glossary gives *Déviane* (rule 6); with « Déviane / dévie » the etymology is visible in French, so the *(deuia)* gloss is superfluous (F5.5). *(per deuie strade)* kept: « chemins détournés » does not show the link.
3. Block 12: « et elle ne voulut pas, pour autant, qu'il fût sacrifié » → « et pour cette raison elle ne voulut pas… » — *nè volle perciò* = therefore; « pour autant » means "for all that", the opposite logic.
4. Block 12: « lesquels adoptèrent l'usage de cette cérémonie » → « transformèrent l'usage » — *si conuertirono all'vso … in questa maniera*: the Spartans changed the rite (flogging instead of killing).
5. Block 20: « un très beau bœuf, ou une vache, selon le cas » → « ou peut-être une vache » (*ò vacca che fosse*; same solution as apollo fix 11).
6. Block 24: « de l'épaule duquel pendait un carquois » → « des épaules » (*da gli homeri*).
7. Block 26: « on faisait le tour de la ville en ce que nous appellerions une grande procession » → « circulait, comme nous dirions, une grande procession » — « de la ville » was an addition (*andaua in volta, come diremmo noi vna gran processione*).
8. Block 32 (Properce, line 3): « la Lune ne rougeoyât pas au milieu du Ciel » → « la Lune rougeoyât au milieu du Ciel » — the Italian *non* governs only *calcasse*; the Moon does redden (Prop. I.10.8 *et mediis caelo Luna ruberet equis*). The ru error was copied.
9. Block 36: « Festus Pompeius » → « Festus » — glossary French form for *Festo Pompeio* (rule 6).
10. Block 50: « pour la remercier de ce que, grâce à elle, l'enfantement… venait à la lumière » → « pour la remercier, comme si c'était grâce à elle que l'enfantement… était venu à la lumière » — the hedge *quasi che* had been dropped (F4).
11. Block 88: « qu'on récolte ensuite avec les mêmes corbeilles » → « dans des corbeilles » — « mêmes » is an addition (*con le ceste*; ru has the same addition).
12. Block 100: « Vient ensuite la vérité : c'est un mauvais démon » → « Il poursuit ensuite en disant que la vérité est que c'est un mauvais démon » — *Seguita poi* = Prudentius goes on to say (cf. *Seguita poi Platone*, *Seguita poi Pausania* elsewhere).
13. Block 108: « bien qu'ils sacrifiassent des bœufs » → « bien qu'ils sacrifient » (F1, archaic imperfect subjunctive).
14. Block 112: « ou bien en vérité la Nature des choses » → « ou bien la Nature des choses » — *ò veramente* = "or else" (ovvero), not "truly".
15. Block 112: « comme pour montrer que l'univers prend nourriture » → « comme si l'univers prenait nourriture » — « montrer » was added; *come che* = comme si (F4).
16. Block 120: « Quelques-uns ont mis … et lui ont donné » → « Il y en eut ensuite qui mirent … et lui donnèrent » — *Sono poi stati di quelli*: « poi » restored (F4).
17. Block 122: « Lucien écrit que Jupiter ordonne » → « C'est pourquoi, chez Lucien, Jupiter ordonne » — *Onde* restored; F5.2 (*Luciano fà, che*).
18. Block 128: « Ovide, la faisant apparaître en songe » → « quand il la montre apparaissant en songe » (F5.2, *la fà apparire*).
19. Block 129 (Ovide, line 10): « celui qui exhortait » → « celui qui exhorte » (*conforta*, present).
20. Block 129 (line 12): « d'une main escortant le bel apaisement du silence » → « guidant de la main vers le beau silence » — *Al bel tacer con man facendo scorta*; « apaisement » was an addition and the line was obscure.
21. Block 134: « Martianus Capella fait entrer Philologie dans l'orbe… où elle voit » → « décrit Philologie entrant dans l'orbe… et y voyant » (F5.2; same as apollo fix 10).
22. Block 145: « faire aux dieux tout le mal qu'on voudra » → « toutes sortes de grands maux » (*ogni gran male*; « qu'on voudra » was an addition and duplicated *à suo piacere*).
23. Block 145: « (peut-être pour que tout tombât en bas) » → « (peut-être pour qu'ils tombent tous en bas) » — *tutti* = the gods, masculine plural; also F1.
24. Block 145: « au dieu sur lequel ils voulaient avoir prise » → « auquel ils voulaient faire violence » (*cui voleuano fare forza*; consistent with « faire violence aux étoiles », block 143).
25. Block 146: « bien que les Romains condamnassent … et n'en voulussent » → « aient ensuite condamné … et n'en aient voulu » (F1).
26. Block 155: « Et ce ne sont que des fables » → « Et ce sont toutes des fables » — *tutte sono fauole*; « ne… que » added dismissiveness.
27. Block 158: « de sorte qu'ils n'avaient plus ensuite de force contre elle » → « et que, pour cette raison, ils n'avaient ensuite plus de force » — *& perciò* belongs inside the *quasi che* clause.
28. Block 164: « D'autres ont voulu que la cymbale » → « ont soutenu » (F5.1).
29. Block 168: « dont les yeux se modifient selon que la lumière de la Lune décroît ou croît » → « dont les yeux changent, leur lumière croissant ou diminuant selon que… » — *crescendo, ò diminuendosi la luce* had been omitted.
30. Block 170: « D'où certains ont voulu que » → « D'où vient que certains ont soutenu que » (F5.1; *Onde è, che*).
31. Block 174: « parce qu'ils voulaient avoir existé » → « parce qu'ils prétendaient avoir existé » (F5.1; ru fixed the same point earlier, FROM_EN_CHECK block 174).

## Judged, not changed

- « numen / numens » for *Nume / Numi* (blocks 52, 78, 120, 122, 146): lowercase « numen », as in saturno (block with *cardini*); proemio has « Numen » once, capitalised in a list with « dieu ». No *Nume diuino* occurs in this chapter, so the « divinité » rule does not apply; *Deità* (block 108) is « divinité ». Plural « numens » kept (en uses *numina*); acceptable French.
- Marginal note *Epuleio* (scan 0146): a misprint for Apuleio; rendered « Apulée » (block 123), as ru/en. Correct.
- *che vi vede la notte* (cat, block 168): « qui voit la nuit » — *vi* is a pleonastic adverb; correct.
- *Marcellino* → « Ammien Marcellin »: glossary French form (rule 6), although the glossary comment notes that ru keeps the printed « Марцеллин ».
- *Ausonio Gallo* → « Ausone le Gaulois » (text and margin), citation « (Ausone) »: consistent with the glossary comment.
- *Diana scorta, & duce* → « Diane Guide et Conductrice » (glossary-new): acceptable.
- Block 32: « les paupières qui tombaient » for *gli occhi cadenti*: slight shift (eyes → eyelids), kept as a natural French image.
- Block 43 (Claudien): the verbs *asperge, e bagna* from line 4 are moved to line 2; the line count is preserved, so this is kept.
- Block 95: *come che non fosse fatta sempre con tre faccie* → « bien qu'elle n'ait pas toujours été faite » (concessive *come che*): defensible; en reads "as though".
- Block 174: *Però non dichiamo più di lei* → « Mais ne parlons plus d'elle »; *però* here could be « aussi » (= perciò). Kept, minor.
- Block 17: « débonnaire » for *piaceuole*: slightly dated, but acceptable.
- Remaining imperfect subjunctives in the 3rd person singular (« sacrifiât », « s'aperçût », « fût », « vînt ») are kept as normal literary French.

## Open doubts

- Block 143: *Et glie ne sacrificauano vno ancora di sei mesi, dicono alcuni il settimo dì…* The Italian is elliptic (a six-month-old victim vs. the 7th/10th day after birth). French follows the letter, like ru/en.
- Block 12: *se ne fuggì via con lui … & andò a porlo ad Aricia*: the subject of *andò* is grammatically Iphigenia (as in fr/ru/en), though the tradition credits Orestes. Kept as printed (rule 8).
