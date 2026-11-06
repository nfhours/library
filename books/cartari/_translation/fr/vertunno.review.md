FRENCH_FIXES: 5
RU_ERRORS: 1
EN_ERRORS: 0

## Fixes (verse line numbers within block 1)

1. l. 44: « avec la faux je serai un moissonneur » → « avec la faucille je serai un moissonneur ». *falce* of a reaper = sickle (GLOSSARY english "sickle"; ru «серп»; saturno.md uses « faucille »); « faux » is a scythe.
2. l. 51: « et s'il t'est pénible » → « et s'il lui est pénible ». Italian « se l'aggreua » — the pronoun refers to the one who dressed him as a litigant (3rd person), not to « tu »; the switch to « tu » comes only with « mi vedrai ».
3. l. 65–66: « semblable à celui qui conduit / les coursiers qui courent d'une main forte ? » → « … qui conduit / d'une main forte les coursiers qui courent ? ». Wrong attachment: « con forte mano » goes with « regge » (the driver), not with the running horses.
4. l. 70: « celui qui garde les pas » → « celui qui surveille les traces ». « l'orme guarda » = watches the tracks; « garder les pas » is a non-French calque.
5. l. 79: « Et je te conclus que » → « Et pour conclure je te dis que ». Calque of « ti concludo che »; « conclure qqch à qqn » is not French.

## Checked, no change
- « pastèques » (cocomeri) follows GLOSSARY.tsv; Italian cocomero = watermelon, so ru «огурцы» is the error (recorded in vertunno.ru-errors.tsv).
- [?1], [?2] marks and notes kept in place; block structure and 82 verse lines unchanged; `build_chapters.py --lang fr --check vertunno` → OK.
- "Nume" does not occur in this chapter (no numen to render).
- NBSP before ; : ! ? present everywhere; straight apostrophes throughout.
- Names: Vertumne, Toscane, Tibre, Forum romain, Bacchus, Phébus, Faune, Properce, mitre, cithare — match GLOSSARY / glossary-new.

## Open doubts
- l. 7 « je ne me soucie point » — « ne … point » is literary rather than archaic; left as is (could be « nullement »).
- l. 51: « l' » in « se l'aggreua » could conceivably be read impersonally (ru and en translate it so); 3rd-person « lui » chosen as closest to the Italian.
- l. 32 ru «я приведу» (future) vs Italian « t'apporto » (present) — tense nuance only, not recorded as an error.
