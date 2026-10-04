"""7言語の生成HTML、公開URL、ライセンスとJavaScriptを検査する。"""
from html.parser import HTMLParser
from pathlib import Path
import os
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app import config, i18n

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.meta, self.ids, self.options, self.scripts = [], {}, [], [], []
        self.in_script = False
        self.current_script = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if tag == 'link': self.links.append(attr)
        if tag == 'meta': self.meta[attr.get('property', attr.get('name'))] = attr.get('content')
        if 'id' in attr: self.ids.append(attr['id'])
        if tag == 'option' and 'lang' in attr: self.options.append(attr['value'])
        if tag == 'script': self.in_script = True; self.current_script = []

    def handle_data(self, data):
        if self.in_script: self.current_script.append(data)

    def handle_endtag(self, tag):
        if tag == 'script':
            self.scripts.append(''.join(self.current_script))
            self.in_script = False

def require(condition, message):
    if not condition: raise ValueError(message)

def main():
    for code, folder, _, _ in i18n.EDITIONS:
        path = ROOT / folder / 'index.html'
        html = path.read_text(encoding='utf-8')
        parsed = Page(); parsed.feed(html)
        expected = config.SITE_URL + (folder + '/' if folder else '')
        canonical = [l['href'] for l in parsed.links if l.get('rel') == 'canonical']
        require(canonical == [expected], f'{code}: canonical')
        require(parsed.meta.get('og:url') == expected, f'{code}: og:url')
        require(config.APP_NAME in parsed.meta.get('og:title', ''), f'{code}: title')
        require(parsed.meta.get('description') and parsed.meta.get('og:description'), f'{code}: description')
        require(parsed.meta.get('twitter:card') == 'summary', f'{code}: twitter:card')
        require(any(l.get('rel') == 'icon' for l in parsed.links), f'{code}: icon')
        require(len(parsed.ids) == len(set(parsed.ids)), f'{code}: duplicate ID')
        for element in ['lyrics', 'audioFile', 'fileLrc', 'view', 'timeline', 'btnMP4', 'btnPNG', 'btnSave', 'fileProject']:
            require(element in parsed.ids, f'{code}: missing control {element}')
        for token in ['@APP_NAME@', '@APP_SHORT_NAME@', '@APP_SUBTITLE@', '@CUSTOM_VERSION@', '@VERSION@']:
            require(token not in html, f'{code}: unresolved {token}')
        require('https://852wa.github.io/JIZURA/' not in html, f'{code}: upstream publication URL')
        expected_alts = {config.SITE_URL + (f + '/' if f else '') for _, f, _, _ in i18n.EDITIONS}
        require({l['href'] for l in parsed.links if l.get('rel') == 'alternate'} == expected_alts, f'{code}: alternate URLs')
        require(len(parsed.options) == len(i18n.EDITIONS), f'{code}: language menu')
        for href in parsed.options:
            require((path.parent / href).resolve().is_file(), f'{code}: language link {href}')
        for script in parsed.scripts:
            process = subprocess.run(['node', '--check'], input=script, text=True, encoding='utf-8', capture_output=True)
            require(process.returncode == 0, f'{code}: JavaScript syntax {process.stderr[:500]}')
        print(code, 'OK')
    tree = ET.parse(ROOT / 'sitemap.xml')
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    require({e.text for e in tree.findall('.//s:loc', ns)} == expected_alts, 'sitemap locations')
    for e in tree.iter():
        if 'href' in e.attrib:
            require(e.attrib['href'] in expected_alts, 'sitemap alternate')
    require('Copyright (c) 2026 hakoniwa' in (ROOT / 'LICENSE').read_text(encoding='utf-8'), 'upstream copyright')
    require('Copyright (c) 2023 Vanilagy' in (ROOT / 'THIRD_PARTY_NOTICES.md').read_text(encoding='utf-8'), 'muxer copyright')
    require((ROOT / 'vendor/mp4-muxer.min.js').is_file(), 'muxer file')
    for f in ['JIZURA_AE.jsx', 'JIZURA_AE_en.jsx', 'JIZURA_CEP.zip', 'JIZURA_CEP_en.zip']:
        require((ROOT / f).is_file(), f'missing AE file {f}')
    print('Release checks passed:', config.SITE_URL)

if __name__ == '__main__':
    try: main()
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print('FAIL:', error, file=sys.stderr)
        sys.exit(1)
