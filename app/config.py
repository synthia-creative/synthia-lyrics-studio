"""SYNTHIAのブランドと公開先を一か所から読む。"""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
SETTINGS = json.loads((ROOT / 'site.config.json').read_text(encoding='utf-8'))
APP_NAME = SETTINGS['app_name']
APP_SHORT_NAME = SETTINGS['app_short_name']
APP_SUBTITLE = APP_NAME.removeprefix(APP_SHORT_NAME).strip() or APP_NAME
CUSTOM_VERSION = (ROOT / 'CUSTOM_VERSION').read_text(encoding='utf-8').strip()
SITE_URL = os.environ.get('SYNTHIA_SITE_URL', SETTINGS['site_url']).rstrip('/') + '/'
parts = urlsplit(SITE_URL)
if parts.scheme not in ('http', 'https') or not parts.netloc or parts.query or parts.fragment or parts.username or parts.password:
    raise ValueError('site_url はクエリや認証情報のない絶対HTTP(S) URLにしてください')
if any(c in SITE_URL for c in '<>"\'\n\r '):
    raise ValueError('site_url に使用できない文字があります')
DESCRIPTION_JA = SETTINGS['description_ja']
DESCRIPTION_EN = SETTINGS['description_en']
BRAND_TOKENS = {
    '@APP_NAME@': APP_NAME, '@APP_SHORT_NAME@': APP_SHORT_NAME,
    '@APP_SUBTITLE@': APP_SUBTITLE, '@CUSTOM_VERSION@': CUSTOM_VERSION,
}
