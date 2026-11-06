FRENCH_FIXES: 26
RU_ERRORS: 3
EN_ERRORS: 1

# Vérification indépendante : venere (fr)

Compared block by block with TEXT_reading.md (scans 0471–0492; marginalia from the same pages), ru/venere.md, en/venere.md, GLOSSARY.tsv and fr/venere.glossary-new.tsv. After the fixes, `python3 tools/build_chapters.py --lang fr --check venere` prints `venere: OK`. Block numbers follow parse_chapter (128 blocks, 1-based). Mark [?1] and its note are unchanged. All 7 captions and all marginalia (asides) are present and complete. NBSP typography was checked by script: no faults. Glossary forms are correct throughout (Alexandre d'Alexandre, Léon l'Hébreu, Pierre Apian, Célus, Tacite, Souda, Marcus Tullius, etc.).

## Fixes

1. Block 2: « il ne semble pas qu'un homme et une femme s'unissent presque jamais, si Amour… » → « il semble qu'un homme et une femme ne s'unissent presque jamais si Amour… ». The negation placement made the sentence illogical in French. *pare* and *quasi* are kept.
2. Block 6: « font de Vénus … une seule déesse, mais les noms en sont si nombreux… » → « tiennent que Vénus … sont une seule déesse, mais que les noms en sont si nombreux… ». *ma siano tanti i nomi* still depends on *fanno … che*, so it is part of what "some" maintain and not the author's statement.
3. Block 9: « dans ses dialogues d'amour » → « dans ses *Dialogues d'amour* ». This is the title of a work, set in italics like *Questions naturelles*.
4. Block 9: « autant qu'il était possible de la faire » → « … de la représenter » (F5.3).
5. Block 14: « Très juste est que tu te fies » → « Il est très juste que tu te fies ». The original was an archaic inversion (F1).
6. Block 15: « et il montre que l'or » → « et cela montre que l'or ». The pronoun had an unclear antecedent.
7. Block 18: « on fit de Vénus une très belle femme » → « on représenta Vénus sous les traits d'une très belle femme ». *fu per Venere fatta* means the woman stands for Venus (F5.3).
8. Block 36: « On fit cette déesse nue » → « On représenta cette déesse nue » (F5.3).
9. Block 36: « on faisait Vénus nue » → « on représentait Vénus nue » (F5.3).
10. Block 39 (aside): « Histoire des Saxons » → « Histoires des Saxons ». The margin reads *Historie de i Sessoni* (plural), and the text says « les histoires ».
11. Block 45: « données aussi : parce qu'elles » → « données aussi, parce qu'elles ». The colon was a stray punctuation mark.
12. Block 51: « comme si elle avait de si belles fesses qu'il fût impossible… » → « comme ayant de si belles fesses qu'il était impossible… ». *come che* here is "as one who had". The brother really finds them beautiful, and « comme si » implied pretence.
13. Block 53: « quand il la fait représenter sur la scène » → « quand il décrit comment on la représentait sur la scène ». This was a fare+infinitive calque (F5.2).
14. Block 53: « Celles-ci, restant presque toujours cachées avec lui, il arrivait parfois que… » → « Comme elles restaient presque toujours cachées sous ce voile, il arrivait parfois que… ». The original was an ungrammatical dangling participle.
15. Block 53: « que presque plus il n'apparaissait » → « qu'il n'apparaissait presque plus » (word order).
16. Block 58: « ils lui donnent ensuite Cupidon d'une main et Antéros de l'autre » → « lui mettent ensuite Cupidon d'un côté et Antéros de l'autre ». *dall'una mano … dall'altra* means "on one side … on the other". « donner d'une main » read as "hand over with one hand".
17. Block 63: « à presque un mille de Rome » → « hors de Rome, à presque un mille ». *fuori di Roma* had been dropped.
18. Block 85: « quand celle-ci était nue » → « quand Vénus était nue ». The antecedent was ambiguous.
19. Block 90: « une brève image de la Victoire » → « une petite image… ». This was a calque of *breue* = small.
20. Block 94: « ou, si nous voulons, un gond » → « ou, disons, un gond ». This was a calque of *ò vogliamo dire*.
21. Block 96: « arrivé par sa faute » → « arrivé par la faute de la déesse ». *sua* = Venus's, and « sa » could be read as Tyndare's.
22. Block 99: « comme si elles étaient peut-être plus que les autres obligées » → « comme étant peut-être plus que les autres obligées ». *come che* here gives the reason (they are perhaps more bound, hence they acknowledge everything from her). It is neither counterfactual « comme si » nor concessive « bien que ». *forse* is kept.
23. Block 106: « Et à elle-même on fit aussi la barbe » → « Et on lui donna aussi la barbe ». « faire la barbe à qqn » means "to shave someone", the opposite of the sense.
24. Block 115: « des personnes à peine mortes » → « … mortes depuis peu ». *pur dianzi morte* = just dead, while « à peine mortes » reads as "barely dead".
25. Block 125: « l'eau de celle-ci est crue chaude et humide, et se mouvoir souvent, et, fortement agitée, faire beaucoup d'écume » → « l'on croit que son eau est chaude et humide, qu'elle se meut souvent et que, fortement agitée, elle fait beaucoup d'écume ». The original was an ungrammatical infinitive calque.
26. Block 126: « il ne manquera pas un assez bon exemple, pour peindre ou sculpter les dieux des anciens, à qui voudra le faire » → « celui qui voudra peindre ou sculpter les dieux des anciens ne manquera pas d'un assez bon exemple ». The original was an unidiomatic calque.

## Translator doubts: decisions

- *come che* (blocks 2, 29, 62, 98, 106): « comme si » / « comme » is correct. In blocks 51 and 99, « comme si » was wrong. « bien que » would be wrong as well (fixes 12 and 22).
- *la maggiore* = « l'aînée »: kept. This is the normal sense for one of two sisters.
- *colorite* = « rouges »: kept. The contrast with *bianche* in the next block supports it.
- « Cnide … naviguaient vers Chypre »: kept as printed (rule 8).
- Aside « Dieux tous mâles et femelles » before block 106: fine. The statement it glosses (*Nè di Venere solamente … ma di tutti gli altri Dei*) is in block 106.

## Open doubts

- Block 6: *Ma secondo le cose della natura poi*. The *poi* is a weak contrastive and is not rendered in fr, ru or en. It is left as is.
- Block 106: *alla medesima* can be the same statue or Venus herself. « lui » keeps the ambiguity.
- Block 90: *alcuni adornamenti da i piedi dorati*: "gilded ornaments for the feet" or "ornaments with gilded feet". It is left as « quelques ornements dorés pour les pieds », as in ru and en.
