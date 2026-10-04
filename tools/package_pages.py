"""Pagesへ配信するファイルだけを新しいディレクトリに組み立てる。"""
from pathlib import Path
import argparse
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app.i18n import EDITIONS

parser = argparse.ArgumentParser()
parser.add_argument('--output', default='_site')
args = parser.parse_args()
target = (ROOT / args.output).resolve()
if not target.is_relative_to(ROOT) or target == ROOT:
    raise ValueError('出力先はプロジェクト内の新しいサブフォルダにしてください')
if target.exists():
    raise FileExistsError('既存の出力先を上書きしません。別の --output を指定してください')
files = ['vendor/mediabunny.min.mjs', 'vendor/LICENSE.mediabunny.txt', 'vendor/mediabunny-1.61.1-source.tar.gz', 'sitemap.xml', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'vendor/LICENSE.mp4-muxer.txt',
         'JIZURA_AE.jsx', 'JIZURA_AE_en.jsx', 'JIZURA_CEP.zip', 'JIZURA_CEP_en.zip']
files += [(folder + '/' if folder else '') + 'index.html' for _, folder, _, _ in EDITIONS]
if (ROOT / 'CNAME').is_file(): files.append('CNAME')
for name in files:
    dest = target / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / name, dest)
(target / '.nojekyll').touch()
print('Pages artifact:', target, len(files), 'files + .nojekyll')
