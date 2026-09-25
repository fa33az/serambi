#!/usr/bin/env python3
"""Ubah teks Project Gutenberg di sources/ menjadi bab-bab bersih di content/<buku>/en/.

Format satu bab (NN.txt):
    # Judul bab
    <baris kosong>
    paragraf prosa dalam satu baris
    <baris kosong>
    ## I            <- penanda bagian (angka kecil di tengah)
    <baris kosong>
    | baris puisi
    | baris puisi

Jalankan ulang kapan saja: python3 scripts/extract.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
OUT = ROOT / "content"

ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV",
         "XV", "XVI", "XVII", "XVIII", "XIX", "XX"]
EN_ORD = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"]


def lines(name, start, end):
    """Baris start..end (1-based, inklusif) dari file sumber."""
    return "\n".join((SRC / name).read_text(encoding="utf-8").split("\n")[start - 1:end])


def blocks(text):
    return [b.strip("\n") for b in re.split(r"\n[ \t]*\n", text) if b.strip()]


def prose(b):
    b = re.sub(r"\s+", " ", b).strip()
    b = b.replace("--", "—")
    return b


def verse(b):
    out = []
    for ln in b.split("\n"):
        ln = ln.strip()
        if ln:
            out.append("| " + ln.replace("--", "—"))
    return "\n".join(out)


def clean_common(s):
    s = re.sub(r"\{\d+\}\s?", "", s)            # nomor halaman cetak {288}
    s = re.sub(r"\[\d+\]", "", s)               # penanda catatan kaki [1]
    s = re.sub(r"\[[A-Z]\]", "", s)             # penanda catatan kaki [A]
    return s


def write(slug, chapters):
    d = OUT / slug / "en"
    d.mkdir(parents=True, exist_ok=True)
    for old in d.glob("*.txt"):
        old.unlink()
    for i, (title, paras) in enumerate(chapters, 1):
        body = "\n\n".join(paras)
        (d / f"{i:02d}.txt").write_text(f"# {title}\n\n{body}\n", encoding="utf-8")
    print(f"{slug}: {len(chapters)} bab, {sum(len(p) for _, p in chapters)} blok")


# ---------------------------------------------------------------- Meditations (George Long, 1862)
def meditations():
    src = (SRC / "pg15877.txt").read_text(encoding="utf-8").split("\n")
    heads = [i for i, l in enumerate(src) if re.fullmatch(r"[IVX]+\.", l) and 2100 < i < 7175]
    heads.append(7174)
    chapters = []
    for n, (a, b) in enumerate(zip(heads, heads[1:]), 1):
        text = "\n".join(src[a + 1:b])
        paras, innote = [], False
        for bl in blocks(text):
            if bl.startswith(" "):
                if re.match(r"\s*\[[A-Z]\]", bl):
                    innote = True
                    continue
                if innote:
                    continue
                paras.append(verse(clean_common(bl)))
                continue
            innote = False
            if "Illustration:" in bl:
                continue                                    # keterangan gambar edisi cetak
            if re.match(r"\[[A-Z]\] ", bl):
                continue                                    # sisa catatan kaki: "See Aristophanes, ..."
            p = clean_common(bl)
            p = re.sub(r"\s*\((?:[ivxl]+\.\s*(?:c\.\s*)?\d+[^)]*)\)", "", p)   # rujukan silang Long: (vii. 29)
            p = re.sub(r"\[Greek:[^\]]*\]", "", p)
            p = p.replace("+", "")                             # penanda catatan kaki +
            p = re.sub(r"\[([^\]]*)\]", r"\1", p)   # kata sisipan penerjemah: [I learned] -> I learned
            p = prose(p).replace(" .", ".").replace(" The three last words are omitted in the translation.", "")
            if n == 1 and not paras:
                p = "1. " + p
            elif not paras and not re.match(r"\d+\.", p):
                p = "1. " + p
            paras.append(p)
        # gabungkan paragraf lanjutan tanpa nomor tetap sebagai paragraf sendiri
        chapters.append((f"Book {EN_ORD[n]}", paras))
    write("meditations", chapters)


# ---------------------------------------------------------------- Apology (Benjamin Jowett)
def apology():
    text = lines("pg1656.txt", 491, 1456)
    bl = [prose(b) for b in blocks(text)]
    # catatan penyunting Jowett yang terselip di tengah kalimat
    bl = [re.sub(r"\s*\((?:Or, I am certain|Aristoph\.|Probably in allusion)[^)]*\)", "", p) for p in bl]
    i2 = next(i for i, p in enumerate(bl) if p.startswith("There are many reasons why I am not grieved"))
    i3 = next(i for i, p in enumerate(bl) if p.startswith("Not much time will be gained"))
    write("apologia", [
        ("The Defence", bl[:i2]),
        ("After the Verdict", bl[i2:i3]),
        ("After the Sentence", bl[i3:]),
    ])


# ---------------------------------------------------------------- Enchiridion (T. W. Higginson)
def enchiridion():
    src = (SRC / "pg45109.txt").read_text(encoding="utf-8").split("\n")
    start = next(i for i, l in enumerate(src) if l.strip() == "THE ENCHIRIDION" and i > 300)
    end = next(i for i, l in enumerate(src) if l.strip() == "Footnotes" and i > start)
    sections, cur = [], None
    for bl in blocks("\n".join(src[start + 1:end])):
        s = clean_common(bl).strip()
        if re.fullmatch(r"[IVXL]+", s):
            cur = [s, []]
            sections.append(cur)
            continue
        bl = clean_common(bl)
        if bl.startswith("  "):
            cur[1].append(verse(bl))
        else:
            cur[1].append(prose(bl).replace("_", "*"))
    groups = [(0, 10), (10, 20), (20, 30), (30, 40), (40, 51)]
    titles = ["What Is Ours", "Roles and Rehearsals", "Keeping to Oneself", "Among Others", "Practice"]
    chapters = []
    for (a, b), t in zip(groups, titles):
        paras = []
        for num, ps in sections[a:b]:
            paras.append(f"## {num}")
            paras.extend(ps)
        chapters.append((t, paras))
    write("enchiridion", chapters)


# ---------------------------------------------------------------- Tao Te Ching (James Legge, 1891)
def tao():
    src = (SRC / "pg216.txt").read_text(encoding="utf-8").split("\n")
    p1 = next(i for i, l in enumerate(src) if l.strip() == "PART 1.")
    p2 = next(i for i, l in enumerate(src) if l.strip() == "PART II.")
    end = next(i for i, l in enumerate(src) if l.startswith("*** END"))

    def part(a, b):
        # Bab dipisah dua baris kosong; sub-paragraf Legge (1., 2., ...) dipisah satu baris kosong.
        paras = []
        groups = [g for g in re.split(r"\n[ \t]*\n[ \t]*\n+", "\n".join(src[a + 1:b])) if g.strip()]
        for n, g in enumerate(groups):
            first = True
            for bl in blocks(g):
                if first:
                    m = re.match(r"(?:Ch\. )?(\d+)\.", bl.strip())
                    paras.append(f"## {m.group(1)}")
                    bl = bl.strip()[m.end():].lstrip(" ") if not bl.startswith(" ") else bl
                    first = False
                bl = re.sub(r"^\d+\.\s*", "", bl) if not bl.startswith(" ") else bl
                if not bl.strip():
                    continue
                paras.append(verse(bl) if bl.startswith(" ") else prose(bl))
        return paras

    write("tao-te-ching", [("The Way", part(p1, p2)), ("Its Virtue", part(p2, end))])


# ---------------------------------------------------------------- On the Shortness of Life (Aubrey Stewart, 1900)
def seneca():
    src = (SRC / "pg64576.txt").read_text(encoding="utf-8").split("\n")
    start = next(i for i, l in enumerate(src) if l.strip() == "OF THE SHORTNESS OF LIFE.")
    end = next(i for i, l in enumerate(src) if i > start and l.startswith("[1] "))
    sections, cur = [], None
    for bl in blocks("\n".join(src[start + 1:end])):
        bl = clean_common(bl)
        m = re.match(r"([IVXL]+)\. ", bl)
        if m and not bl.startswith(" "):
            cur = [m.group(1), []]
            sections.append(cur)
            bl = bl[m.end():]
        if bl.startswith(" "):
            cur[1].append(verse(bl))
        else:
            cur[1].append(prose(bl).replace("_", "*"))
    groups = [(0, 5), (5, 10), (10, 15), (15, 20)]
    titles = ["Life Is Long Enough", "The Busy", "Leisure Well Spent", "Return to Yourself"]
    chapters = []
    for (a, b), t in zip(groups, titles):
        paras = []
        for num, ps in sections[a:b]:
            paras.append(f"## {num}")
            paras.extend(ps)
        chapters.append((t, paras))
    write("singkatnya-hidup", chapters)


if __name__ == "__main__":
    meditations()
    apology()
    enchiridion()
    tao()
    seneca()
