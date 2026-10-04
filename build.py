"""Build the single-file browser editions from src/, app/ and vendor/: Japanese, English, 繁體中文, 简体中文, 한국어, Bahasa Indonesia, Tiếng Việt.
usage: python3 build.py            -> index.html, en/, zh-hant/, zh-hans/, ko/, id/, vi/ index.html (GitHub Pages)
       python3 build.py --dev      -> also dev/www/jizura.js + dev/www/test.html for the test tools"""
import glob, os, sys
from html import escape
from app import config
from app.english import localize_body, localize_js
from app import i18n
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
read = lambda p: open(p, encoding='utf-8').read()
VERSION = read('VERSION').strip()
sources = sorted(glob.glob('src/*.js'))
js = '\n'.join(read(f) for f in sources)
mux = '/*! mp4-muxer v5.2.2 | MIT License | (c) 2023 Vanilagy | see THIRD_PARTY_NOTICES.md */\n' + read('vendor/mp4-muxer.min.js')
def build(lang):
    english = lang == 'en'
    local = lang in i18n.MODULES
    m = i18n.module(lang) if local else None
    title = escape(config.APP_NAME + (' - Lyric Motion Video Maker' if english else ''))
    description = escape(config.DESCRIPTION_EN if english else m.DESCRIPTION if local else config.DESCRIPTION_JA, quote=True)
    folder = dict((c, f) for c, f, _, _ in i18n.EDITIONS)[lang]
    canonical = i18n.BASE + (folder + '/' if folder else '')
    language_nav = i18n.nav(lang)
    body = read('app/body.html').replace('@VERSION@', VERSION).replace('    <div class="acts">', '    ' + language_nav + '\n    <div class="acts">', 1)
    if english: body = localize_body(body)
    elif local: body = i18n.localize_body(lang, body)
    # 翻訳後にブランド値を入れるため、各言語の辞書を変更する必要はない。
    for key, value in config.BRAND_TOKENS.items():
        body = body.replace(key, escape(value, quote=True))
    if english: script = '\n'.join(localize_js(read(f), f) for f in sources)
    elif local: script = '\n'.join(i18n.localize_js(lang, read(f), f) for f in sources)
    else: script = js
    script = script.replace('@VERSION@', VERSION)
    if english or local:
        marker = '/* ============================================================\n   JIZURA — editor UI'
        if marker not in script: raise ValueError('Could not find browser UI entry point')
        inject = read('app/english.js') + ('\n' + i18n.labels_js(lang) if local else '')
        script = script.replace(marker, inject + '\n' + marker, 1)
    alternates = '\n'.join(f'<link rel="alternate" hreflang="{hl}" href="{i18n.BASE}{f + "/" if f else ""}">' for c, f, hl, _ in i18n.EDITIONS)
    html_lang = dict((c, hl) for c, _, hl, _ in i18n.EDITIONS)[lang]
    html = f'''<!doctype html>
<html lang="{html_lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
{alternates}
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2212%22 fill=%22%230b0d12%22/%3E%3Cpath d=%22M44 18H26L20 24V30L38 34V40L32 46H18%22 fill=%22none%22 stroke=%22%2300d9ff%22 stroke-width=%226%22/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
{read('app/style.css')}
</style>
</head>
<body>
{body}
<script>
{mux}
</script>
<script>
{script}
</script>
</body>
</html>
'''
    target = (folder + '/' if folder else '') + 'index.html'
    os.makedirs(os.path.dirname(target) or '.', exist_ok=True)
    open(target, 'w', encoding='utf-8').write(html)
    print(target, len(html), 'bytes')
for code, _, _, _ in i18n.EDITIONS:
    if code in i18n.MODULES and not i18n.has_module(code):
        print('skip', code, '(no translation module yet)'); continue
    build(code)
# sitemap.xml for search engines: every edition, with its language alternates
import datetime
alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{hl}" href="{i18n.BASE}{f + "/" if f else ""}"/>' for c, f, hl, _ in i18n.EDITIONS)
alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{i18n.BASE}"/>'
today = datetime.date.today().isoformat()
urls = ''.join(f'\n  <url>\n    <loc>{i18n.BASE}{f + "/" if f else ""}</loc>\n    <lastmod>{today}</lastmod>{alts}\n  </url>' for c, f, hl, _ in i18n.EDITIONS)
open('sitemap.xml', 'w', encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + urls + '\n</urlset>\n')
print('sitemap.xml', len(i18n.EDITIONS), 'urls')
if '--dev' in sys.argv:
    os.makedirs('dev/www', exist_ok=True)
    open('dev/www/jizura.js', 'w', encoding='utf-8').write(js)
    open('dev/www/test.html', 'w', encoding='utf-8').write(read('dev/test.html'))
    print('dev/www ready: cd dev/www && python3 -m http.server 8765')
