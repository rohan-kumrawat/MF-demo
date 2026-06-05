#!/usr/bin/env python3
import re
import sys
import os
import argparse
from pathlib import Path

MONTHS = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'sept': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
}

# File extensions to process
TEXT_EXTS = {'.md', '.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.htm', '.css', '.yml', '.yaml', '.sql', '.txt', '.py', '.mdx'}

# Patterns and replacement functions
# (compiled below after helper functions)
patterns = []

# Helper functions defined after patterns list for readability

def _convert_slash_date(m):
    d1 = int(m.group(2))
    d2 = int(m.group(3))
    year = m.group(4)
    # If first component > 12, it's likely already DD/MM/YYYY — leave unchanged
    if d1 > 12:
        return m.group(0)
    # Otherwise assume MM/DD/YYYY and swap to DD/MM/YYYY
    return f"{d2:02d}/{d1:02d}/{year}"


def _convert_monthname(m):
    mon = m.group(2).lower()
    day = int(m.group(3))
    year = m.group(4)
    mon_num = MONTHS.get(mon[:3], None) if mon else None
    if mon_num is None:
        mon_num = MONTHS.get(mon, '01')
    return f"{day:02d}/{mon_num}/{year}"


def _convert_day_month_year(m):
    day = int(m.group(2))
    mon = m.group(3).lower()
    year = m.group(4)
    mon_num = MONTHS.get(mon[:3], None) if mon else None
    if mon_num is None:
        mon_num = MONTHS.get(mon, '01')
    return f"{day:02d}/{mon_num}/{year}"

# Because some patterns refer to helpers, recompile correct patterns now
patterns = []
patterns.append((re.compile(r"(\b)(\d{4})-(\d{2})-(\d{2})(?=[T\s\)\.,;\"']|$)"), lambda m: f"{m.group(4)}/{m.group(3)}/{m.group(2)}"))
patterns.append((re.compile(r"(\b)(\d{4})/(\d{1,2})/(\d{1,2})(?=[\s\)\.,;\"']|$)"), lambda m: f"{int(m.group(4)):02d}/{int(m.group(3)):02d}/{m.group(2)}"))
patterns.append((re.compile(r"(\b)(\d{4})\.(\d{1,2})\.(\d{1,2})(?=[\s\)\.,;\"']|$)"), lambda m: f"{int(m.group(4)):02d}/{int(m.group(3)):02d}/{m.group(2)}"))
patterns.append((re.compile(r"(\b)(\d{1,2})-(\d{1,2})-(\d{4})(?=[\s\)\.,;\"']|$)"), lambda m: f"{int(m.group(3)):02d}/{int(m.group(2)):02d}/{m.group(4)}"))
patterns.append((re.compile(r"(\b)(\d{1,2})/(\d{1,2})/(\d{4})(?=[\s\)\.,;\"']|$)"), _convert_slash_date))
month_names_regex = '|'.join(sorted(set([k for k in MONTHS.keys()]), key=lambda s: -len(s)))
patterns.append((re.compile(rf"(\b)({month_names_regex})\s+(\d{{1,2}})(?:st|nd|rd|th)?,?\s+(\d{{4}})(?=[\s\)\.,;\"']|$)", re.IGNORECASE), _convert_monthname))
patterns.append((re.compile(rf"(\b)(\d{{1,2}})(?:st|nd|rd|th)?\s+({month_names_regex}),?\s+(\d{{4}})(?=[\s\)\.,;\"']|$)", re.IGNORECASE), _convert_day_month_year))

IGNORE_DIRS = {'.git', 'node_modules', 'dist', 'build', '.venv', '__pycache__'}


def should_process(path: Path):
    if any(part in IGNORE_DIRS for part in path.parts):
        return False
    if path.is_dir():
        return False
    if path.suffix.lower() in TEXT_EXTS:
        return True
    # allow files without suffix but small and text
    try:
        if path.stat().st_size > 2000000:
            return False
    except Exception:
        return False
    return True


def process_file(path: Path, apply: bool):
    text = path.read_text(encoding='utf-8', errors='ignore')
    original = text
    changed = False
    snippets = []
    for pat, repl in patterns:
        def _sub(m):
            new = repl(m)
            if new != m.group(0):
                nonlocal changed
                changed = True
                snippets.append((m.group(0), new))
            return new
        text = pat.sub(lambda mm: _sub(mm), text)
    if changed:
        if apply:
            bak = str(path) + '.bak'
            try:
                Path(bak).write_text(original, encoding='utf-8')
            except Exception:
                pass
            path.write_text(text, encoding='utf-8')
        return True, snippets
    return False, []


def scan_and_apply(root: str, apply: bool):
    rootp = Path(root)
    results = {}
    for p in rootp.rglob('*'):
        if not should_process(p):
            continue
        ok, snippets = process_file(p, apply)
        if ok:
            results[str(p)] = snippets
    return results


def main():
    parser = argparse.ArgumentParser(description='Normalize dates to DD/MM/YYYY across repository files.')
    parser.add_argument('--root', '-r', default='.', help='Root directory to scan')
    parser.add_argument('--apply', action='store_true', help='Apply changes (creates .bak files). Default is dry-run')
    args = parser.parse_args()

    results = scan_and_apply(args.root, args.apply)
    total_files = len(results)
    total_replacements = sum(len(v) for v in results.values())
    if args.apply:
        print(f"Applied changes in {total_files} file(s), {total_replacements} replacements total.")
    else:
        print(f"Dry-run: {total_files} file(s) would be changed, {total_replacements} replacements total.")
    for f, snippets in sorted(results.items()):
        print(f"\nFile: {f}")
        for old, new in snippets[:10]:
            print(f"  - {old}  =>  {new}")
        if len(snippets) > 10:
            print(f"  ... and {len(snippets)-10} more replacements in this file")

if __name__ == '__main__':
    main()
