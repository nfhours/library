#!/usr/bin/env python3
"""Локальный редактор обрезки гравюр.

На основе разметки/логики редактора обрезки Cartari (который работал как
Claude Artifact с базой на claude.ai) — здесь то же самое (рамки + флажок +
навигация), но полностью локально: фото берутся из ~/Projects/photos/<книга>/,
результат сохраняется сразу при каждом изменении в
~/Projects/library/books/<книга>/_crops/crops.json. Никаких внешних баз.

Одна страница скана может содержать 0, 1 или несколько гравюр — поэтому
на странице можно нарисовать несколько рамок, либо явно отметить «нет
гравюры», либо поставить флажок «что-то не так».

Запуск:
    python3 tools/crop-editor/server.py cartari
    python3 tools/crop-editor/server.py iconologie --port 8809

Работает для любой книги — просто передай имя папки из ~/Projects/photos/.
"""
import sys
import os
import csv
import json
import argparse
import mimetypes
import threading
import webbrowser
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

HERE = os.path.dirname(os.path.abspath(__file__))
LIBRARY_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))  # .../library
PHOTOS_ROOT = os.path.expanduser("~/Projects/photos")
IMG_EXT = {".jpg", ".jpeg", ".png"}


def list_images(book_dir):
    """Рекурсивно собирает все фото в папке книги (книги вроде grosson/alciato
    хранят их в подпапках raw/, raw_extracted/, pages/ — это нормально).
    Не-картиночные файлы (например служебный _index.json у cartari/verrien)
    пропускаются — это ожидаемо, не баг."""
    out = []
    skipped = []
    for root, dirs, files in os.walk(book_dir):
        dirs.sort()
        for f in sorted(files):
            ext = os.path.splitext(f)[1].lower()
            rel = os.path.relpath(os.path.join(root, f), book_dir).replace(os.sep, "/")
            if ext in IMG_EXT:
                out.append(rel)
            else:
                skipped.append(rel)
    out.sort()
    return out, skipped


def empty_entry():
    return {"boxes": [], "noPlate": False, "flagged": False, "updatedAt": None}


class CropsStore:
    """Читает/пишет crops.json. Пишет на диск сразу при каждом set()."""

    def __init__(self, path):
        self.path = path
        self.lock = threading.Lock()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {}
            self._write()

    def _write(self):
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(tmp, self.path)

    def get_all(self):
        with self.lock:
            return dict(self.data)

    def set(self, image, boxes, no_plate, flagged):
        with self.lock:
            entry = {
                "boxes": boxes or [],
                "noPlate": bool(no_plate),
                "flagged": bool(flagged),
                "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
            }
            self.data[image] = entry
            self._write()
            return dict(entry)


def box_label(box, i):
    label = (box.get("label") or "").strip() if isinstance(box, dict) else ""
    return label or str(i + 1)


def box_coords(box):
    if isinstance(box, dict):
        x, y, w, h = box.get("x"), box.get("y"), box.get("w"), box.get("h")
    else:
        x, y, w, h = box
    return "{:.2f},{:.2f},{:.2f},{:.2f}".format(x, y, w, h)


def write_inventory_csv(csv_path, images, crops_data):
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["страница", "подпись", "координаты", "флажок"])
        for img in images:
            e = crops_data.get(img)
            boxes = (e or {}).get("boxes") or []
            flagged = bool((e or {}).get("flagged"))
            for i, box in enumerate(boxes):
                w.writerow([img, box_label(box, i), box_coords(box), "да" if flagged else ""])


def make_handler(book, book_dir, images, store):
    images_set = set(images)

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass

        def _send_json(self, obj, status=200):
            body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _serve_file(self, fp, ctype):
            try:
                with open(fp, "rb") as f:
                    data = f.read()
            except OSError:
                self.send_response(404)
                self.end_headers()
                return
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            parsed = urlparse(self.path)
            path = unquote(parsed.path)
            if path in ("/", "/index.html"):
                self._serve_file(
                    os.path.join(HERE, "index.html"), "text/html; charset=utf-8"
                )
            elif path == "/api/config":
                self._send_json({"book": book, "images": images})
            elif path == "/api/crops":
                self._send_json(store.get_all())
            elif path.startswith("/photos/"):
                rel = path[len("/photos/"):]
                fp = os.path.normpath(os.path.join(book_dir, rel))
                book_dir_norm = os.path.normpath(book_dir)
                if not (fp == book_dir_norm or fp.startswith(book_dir_norm + os.sep)):
                    self.send_response(403)
                    self.end_headers()
                    return
                if not os.path.isfile(fp):
                    self.send_response(404)
                    self.end_headers()
                    return
                ctype = mimetypes.guess_type(fp)[0] or "application/octet-stream"
                self._serve_file(fp, ctype)
            else:
                self.send_response(404)
                self.end_headers()

        def do_POST(self):
            parsed = urlparse(self.path)
            if parsed.path == "/api/crops":
                length = int(self.headers.get("Content-Length", 0))
                raw = self.rfile.read(length)
                try:
                    payload = json.loads(raw.decode("utf-8"))
                except Exception:
                    self._send_json({"error": "bad json"}, 400)
                    return
                image = payload.get("image")
                if image not in images_set:
                    self._send_json({"error": "unknown image"}, 400)
                    return
                boxes = payload.get("boxes") or []
                no_plate = payload.get("noPlate", False)
                flagged = payload.get("flagged", False)
                entry = store.set(image, boxes, no_plate, flagged)
                self._send_json({"ok": True, "entry": entry})
            elif parsed.path == "/api/export":
                csv_path = os.path.join(LIBRARY_ROOT, "books", book, "_crops", "inventory.csv")
                write_inventory_csv(csv_path, images, store.get_all())
                self._send_json({"ok": True, "path": csv_path})
            else:
                self.send_response(404)
                self.end_headers()

    return Handler


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("book", help="имя папки книги, напр. cartari")
    ap.add_argument("--port", type=int, default=8808)
    ap.add_argument("--no-open", action="store_true", help="не открывать браузер сам")
    args = ap.parse_args()

    book_dir = os.path.join(PHOTOS_ROOT, args.book)
    if not os.path.isdir(book_dir):
        print(f"Нет папки с фото: {book_dir}")
        sys.exit(1)

    images, skipped = list_images(book_dir)
    if not images:
        print(f"В {book_dir} не нашлось файлов .jpg/.jpeg/.png")
        sys.exit(1)
    if skipped:
        print(f"Пропущено не-картиночных файлов: {len(skipped)} -> {', '.join(skipped[:10])}" + (" …" if len(skipped) > 10 else ""))

    crops_path = os.path.join(LIBRARY_ROOT, "books", args.book, "_crops", "crops.json")
    store = CropsStore(crops_path)

    handler = make_handler(args.book, book_dir, images, store)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    url = f"http://127.0.0.1:{args.port}/"
    print(f"{args.book}: {len(images)} фото из {book_dir}")
    print(f"Сохраняется в {crops_path}")
    print(f"Открой в браузере: {url}  (Ctrl+C — остановить)")
    if not args.no_open:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nОстановлено.")


if __name__ == "__main__":
    main()
