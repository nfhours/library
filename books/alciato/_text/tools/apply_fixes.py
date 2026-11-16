"""
Применяет список точечных правок к pages/NNNN.md, присланный субагентом после
сверки черновика с картинкой — без переписывания всей страницы.

Формат входного файла (TSV, через ' | '), одна правка на строку:

    NNNN | текст | было | стало
    NNNN | Колонтитул | | De gli Antichi. 93
    NNNN | Кустод | | ouero
    NNNН | Сигнатура | | B2
    NNNN | Маргиналии | | Festo.

- поле "текст" — substring-замена в теле страницы, "было" должно встречаться
  в теле ровно один раз (иначе правка не применяется, печатается ошибка —
  уточни правку так, чтобы "было" было однозначным, например с соседними словами);
- поле "Колонтитул" / "Кустод" / "Сигнатура" — заменяет значение одноимённой
  строки в хвосте файла (было игнорируется, берётся "стало");
- поле "Маргиналии" — добавляет новый пункт `- стало` в список маргиналий,
  если такого пункта там ещё нет;
- строки, начинающиеся с #, и пустые строки — игнорируются.

После применения всех правок для скана: `state: done`, `source` — если было
`grok`, становится `grok+verified` (не трогает уже `new`/другие значения).

Использование: python3 tools/apply_fixes.py путь/к/файлу_правок.tsv
"""

import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(HERE, "pages")

HEADER_FIELDS = {"Колонтитул", "Кустод", "Сигнатура"}


def parse_fixes(path):
    fixes = []
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.rstrip("\n")
            if not line.strip() or line.strip().startswith("#"):
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) != 4:
                print(f"строка {lineno}: пропущена, не 4 поля через ' | ': {line!r}")
                continue
            scan, field, old, new = parts
            fixes.append((scan, field, old, new))
    return fixes


def set_header_field(text, field, value):
    pattern = re.compile(rf"^{re.escape(field)}:.*$", re.MULTILINE)
    new_line = f"{field}: {value}"
    if pattern.search(text):
        return pattern.sub(new_line, text, count=1)
    return text.rstrip("\n") + f"\n{new_line}\n"


def add_marginalia(text, value):
    bullet = f"- {value}"
    if bullet in text:
        return text, False
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line.strip() == "Маргиналии:":
            j = i + 1
            while j < len(lines) and lines[j].startswith("- "):
                j += 1
            lines.insert(j, bullet)
            return "\n".join(lines), True
    return text, False


def set_state_verified(text):
    text = re.sub(r"state: \w[\w+]*", "state: done", text, count=1)

    def fix_source(m):
        val = m.group(1)
        if val == "grok":
            return f"source: grok+verified"
        return m.group(0)

    text = re.sub(r"source: (\S+)", fix_source, text, count=1)
    return text


def main():
    if len(sys.argv) != 2:
        print("использование: python3 tools/apply_fixes.py путь/к/файлу_правок.tsv")
        sys.exit(1)

    fixes = parse_fixes(sys.argv[1])
    by_scan = {}
    for scan, field, old, new in fixes:
        by_scan.setdefault(scan, []).append((field, old, new))

    applied, failed, scans_touched = 0, 0, 0

    for scan, items in sorted(by_scan.items()):
        path = os.path.join(PAGES_DIR, f"{scan}.md")
        if not os.path.exists(path):
            print(f"скан {scan}: pages/{scan}.md не найден, пропущен")
            failed += len(items)
            continue
        text = open(path, encoding="utf-8").read()
        scan_ok = True
        for field, old, new in items:
            if field in HEADER_FIELDS:
                text = set_header_field(text, field, new)
                applied += 1
            elif field == "Маргиналии":
                text, added = add_marginalia(text, new)
                applied += 1
                if not added:
                    print(f"скан {scan}: маргиналия уже была, пропущена: {new!r}")
            else:
                count = text.count(old)
                if count == 1:
                    text = text.replace(old, new, 1)
                    applied += 1
                elif count == 0:
                    print(f"скан {scan}: 'было' не найдено: {old!r}")
                    failed += 1
                    scan_ok = False
                else:
                    print(f"скан {scan}: 'было' встречается {count} раз (неоднозначно): {old!r}")
                    failed += 1
                    scan_ok = False
        text = set_state_verified(text)
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        scans_touched += 1

    print(f"\nПравок применено: {applied}, с ошибкой: {failed}, сканов тронуто: {scans_touched}")


if __name__ == "__main__":
    main()
