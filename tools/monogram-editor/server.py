#!/usr/bin/env python3
"""Локальный Monogram Box Editor для Verrien, часть II (155 пластин-указателей
монограмм, v2-1.jpg … v2-155.jpg).

На основе логики и интерфейса старого редактора (который работал как Claude
Artifact с базой на claude.ai — title "Monogram Box Editor") — здесь то же
самое: на каждой пластине фиксированная сетка из 15 рамок (id/номер уже
заданы изначально), рамку можно подвинуть и изменить размер, «Сбросить
к сетке» возвращает к исходной раскладке, «Сохранить пластину» фиксирует
текущее положение. Разница только в хранении: вместо базы на claude.ai —
локальный файл на диске, который пишется сразу при каждом сохранении.
Никаких внешних баз, работа не тратит лимиты Claude.

Запуск:
    python3 tools/monogram-editor/server.py
"""
import os
import sys
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
IMG_DIR = os.path.join(LIBRARY_ROOT, "books", "verrien", "img")
DEFAULTS_PATH = os.path.join(HERE, "plates_default.json")
DATA_PATH = os.path.join(LIBRARY_ROOT, "books", "verrien", "_crops", "monograms.json")


def load_defaults():
    with open(DEFAULTS_PATH, "r", encoding="utf-8") as f:
        d = json.load(f)
    return d["plateOrder"], d["plates"]


class MonogramStore:
    """Читает/пишет monograms.json. Пишет на диск сразу при каждом save().
    Если файла ещё нет — создаёт его из сетки по умолчанию (импорт), ни одна
    пластина не считается подтверждённой."""

    def __init__(self, path, plate_order, plates_default):
        self.path = path
        self.lock = threading.Lock()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {}
            for pimg in plate_order:
                self.data[pimg] = {
                    "items": [dict(it) for it in plates_default.get(pimg, [])],
                    "confirmed": False,
                    "updatedAt": None,
                }
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

    def save_plate(self, pimg, items):
        with self.lock:
            entry = {
                "items": items,
                "confirmed": True,
                "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
            }
            self.data[pimg] = entry
            self._write()
            return dict(entry)


def make_handler(plate_order, plates_default, store):
    plate_set = set(plate_order)

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
                self._serve_file(os.path.join(HERE, "index.html"), "text/html; charset=utf-8")
            elif path == "/api/config":
                self._send_json({"plateOrder": plate_order, "platesDefault": plates_default})
            elif path == "/api/monograms":
                self._send_json(store.get_all())
            elif path.startswith("/photos/"):
                rel = path[len("/photos/"):]
                fp = os.path.normpath(os.path.join(IMG_DIR, rel))
                img_dir_norm = os.path.normpath(IMG_DIR)
                if not (fp == img_dir_norm or fp.startswith(img_dir_norm + os.sep)):
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
            if parsed.path == "/api/monograms":
                length = int(self.headers.get("Content-Length", 0))
                raw = self.rfile.read(length)
                try:
                    payload = json.loads(raw.decode("utf-8"))
                except Exception:
                    self._send_json({"error": "bad json"}, 400)
                    return
                pimg = payload.get("plate")
                if pimg not in plate_set:
                    self._send_json({"error": "unknown plate"}, 400)
                    return
                items = payload.get("items") or []
                entry = store.save_plate(pimg, items)
                self._send_json({"ok": True, "entry": entry})
            else:
                self.send_response(404)
                self.end_headers()

    return Handler


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--port", type=int, default=8812)
    ap.add_argument("--no-open", action="store_true", help="не открывать браузер сам")
    args = ap.parse_args()

    if not os.path.isdir(IMG_DIR):
        print(f"Нет папки с опубликованными пластинами: {IMG_DIR}")
        sys.exit(1)

    plate_order, plates_default = load_defaults()
    missing = [p for p in plate_order if not os.path.isfile(os.path.join(IMG_DIR, p))]
    if missing:
        print(f"Внимание: {len(missing)} пластин из сетки не найдены в {IMG_DIR}: {', '.join(missing[:5])}")

    store = MonogramStore(DATA_PATH, plate_order, plates_default)

    handler = make_handler(plate_order, plates_default, store)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    url = f"http://127.0.0.1:{args.port}/"
    print(f"Verrien monogram editor: {len(plate_order)} пластин из {IMG_DIR}")
    print(f"Сохраняется в {DATA_PATH}")
    print(f"Открой в браузере: {url}  (Ctrl+C — остановить)")
    if not args.no_open:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nОстановлено.")


if __name__ == "__main__":
    main()
