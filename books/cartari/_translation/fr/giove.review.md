FRENCH_FIXES: 27
RU_ERRORS: 1
EN_ERRORS: 0

# Vérification indépendante : giove (fr)

Compared block by block with TEXT_reading.md (scans 0155–0191), pages/*.md marginalia (echo answers), ru/giove.md, en/giove.md, GLOSSARY.tsv and fr/giove.glossary-new.tsv. After the fixes, `python3 tools/build_chapters.py --lang fr --check giove` prints `giove: OK`. Block numbers follow parse_chapter `n` (244 blocks). Marks [?1], [?2], [?3] and their notes are in place and unchanged. NBSP typography was checked by script: no faults.

## Fixes

1. Block 30: « qu'ils entendaient un grand piétinement de chevaux et que les ennemis venaient contre eux » → « …et voyaient les ennemis venir contre eux ». *di vedere* had been dropped.
2. Blocks 35, 40, 58, 59: « (V)verge pastorale », « la verge » → « houlette (pastorale) », « la houlette » (5 places). *verga pastorale ritorta* is the curved shepherd's staff. « verge » is ambiguous in modern French (F1).
3. Block 36: « si ruineux qu'ils soient » → « si croulants qu'ils soient ». In modern French « ruineux » means "costly".
4. Block 42: « Macrobe est d'avis qu'elle s'entend aussi par Écho » → « …que cette harmonie est aussi ce qu'il faut entendre par Écho ». The antecedent was unclear (flûte or harmonie?). Macrobius means the harmony.
5. Block 49: « je naîs » → « je nais » (spelling).
6. Block 51: « Cela, le cœur ne me le donne pas de le faire » → « Cela, je n'ai certes pas le cœur de le faire ». The original was a calque of *non mi dà l'animo*; *già* is kept as « certes ».
7. Block 52: « si l'amour te ramène … et te rend ta forme ôtée » → « puisse ainsi l'amour te ramener … et te rendre ta forme ôtée ». *S'amor ti torne … e che ti renda* is the deprecative *se* + subjunctive, a wish and not a condition. EN has it right.
8. Block 54: « à mon chaste ardeur » → « à ma chaste ardeur » (gender).
9. Block 54: « Que j'espérerai ? » → « Qu'espérerai-je ? » (*Che spererò?*). The original was ungrammatical.
10. Block 54: « impitoyable, impie crainte » → « discourtoise, impie crainte » (*discortese*).
11. Block 58: « qu'ils tiennent pour avoir été connue » → « dont ils soutiennent qu'elle a été connue ». The construction was clumsy (*vogliono*, F5.1).
12. Block 63: « ils le provoquaient » → « ils l'incitaient ». *provocare* is a false friend here.
13. Block 77: « le nez grimaçant » → « le nez crochu ». *naso sgrignuto* follows Jerome's *aduncis naribus*, and EN has "hooked nose". A grimacing nose is nonsense.
14. Block 80: « pourquoi ils le faisaient tel » → « pourquoi ils le représentaient ainsi » (F5.3).
15. Block 138: « bien que la divinité fût la même » → « bien que le numen fût le même » (*Nume*, glossary Numen).
16. Block 140 (caption): « auquel sa divinité est attribuée » → « auquel son numen est attribué » (*il suo nume*).
17. Block 154: « la divinité de Bacchus » → « le numen de Bacchus » (*il nume di Bacco*).
18. Block 154: « …, comme le rapporte Pausanias, que Polyclète en fit un » → « … ; ainsi, Pausanias rapporte que Polyclète en fit un ». The original was an ungrammatical calque of *come recita Pausania, che*.
19. Block 182: « c'est à Jupiter seul qu'on l'a placée » → « …qu'on l'a donnée ». « placer à quelqu'un » is not idiomatic.
20. Block 182: « et d'autres manières encore l'ont fait sculpter et peindre » → « et on l'a sculptée et peinte de diverses autres manières ». The subject was wrong: *è stato scolpito, & dipinto*.
21. Block 185: « Et il ne la lançait pas toujours … mais, comme je l'ai déjà dit souvent, avec le conseil » → « Il ne la lançait pourtant pas toujours … mais, comme je l'ai déjà dit, souvent avec le conseil ». *però* had been lost. *spesso* goes with *col consiglio* (Seneca, NQ II 41), as in RU and EN.
22. Block 209: « il s'imagina de le montrer » → « il imagina de le montrer » (*imaginossi*). « s'imaginer de » is incorrect here.
23. Block 213: « nue de la moitié vers le haut » → « nue de la ceinture en haut ». This matches block 59 for *dal mezo in su*.
24. Block 223 (caption): « du dit oracle d'Ammon » → « de cet oracle d'Ammon ». « ledit » is a forbidden archaism (F1).
25. Block 227: « et l'adoraient pour lui » → « et l'adoraient comme Jupiter lui-même ». *per lui l'adorauano* means they worshipped the oak as Jupiter. « pour lui » read as "for his sake".
26. Block 242: « adorée comme divinité salutaire » → « comme numen salutaire » (*Nume salutare*). This matches giunone's « numina salutaires ».
27. Block 244: « Les nombreuses fables qu'on lit encore de Jupiter donnent matière » → « …qu'on lit de Jupiter donnent aussi matière ». *ancora* means "also" and goes with *danno*. In the old position « encore » read as "still read".
Consistency: after items 15–17 and 26, *Nume/nume* is rendered « numen » (lowercase, as in saturno and giunone) everywhere in the chapter. No « divinité » for *Nume* remains.

## RU errors (giove.ru-errors.tsv)

- Block 52: the deprecative *S'amor ti torne … e che ti renda* is rendered as a condition (« если любовь вернёт … »). It is a wish (« пусть / да вернёт »).

## EN errors

None found that are meaning errors against the Italian.

## Open doubts

- Block 140 (caption *Bacco à cui è attribuito il suo nume*): the grammar says "Bacchus, to whom his numen is attributed". The body text (scan 0179, *gli diedero parimente il nume di Bacco*) suggests "Bacchus, whose numen is attributed to him (Jupiter)", which is RU's reading. FR keeps the literal, ambiguous « auquel son numen est attribué ». This is not counted as an RU error.
- Block 141: the Latin inscriptions HONOR / VERITAS are translated (« HONNEUR », « VÉRITÉ »), as in RU, but DIUS FIDIUS stays in Latin. EN keeps all three in Latin. Unifying them is left to the editor.
- Block 190: « Roche Tarpéienne » follows the glossary. Cartari's *Monte Tarpeio* is literally « mont Tarpéien » (the Capitoline).
- Block 8: « cette suprême principauté » (*sommo principato*) is literal; « souveraineté » would be smoother. Left unchanged.
- Block 13: « comme si toutes choses dépendaient … et que l'ordre … venait » uses the indicative after « et que ». This is acceptable, so it was left to avoid an archaic « vînt ».
- Capitalisation of « numen »: proemio uses « Numen », saturno, giunone and giove use lowercase. This should be unified across chapters.
- [?1] note: the reading *colpo mortale* is conjectural, inherited from RU. The echo answer *tale* fits either reading.
