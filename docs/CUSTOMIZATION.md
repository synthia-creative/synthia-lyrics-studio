# カスタマイズ

アプリ名: SYNTHIA Lyrics Studio
公開URL: https://synthia-creative.github.io/synthia-lyrics-studio/ （設定値。公開確認とは別）
Custom: 0.1.0 / Base: JIZURA 0.10.1

## 設定

`site.config.json` の app_name、app_short_name、site_url、説明文を変更して `python build.py` を実行します。
Customバージョンは CUSTOM_VERSION、Baseバージョンは上流の VERSION を使います。
独自ドメインを利用するときは PagesのCustom domainを設定し、site_urlを独自ドメインへ変更します。
手動のブランチ配信ではルートにCNAMEも作成します。DNS設定はドメイン確定後に行います。
Actions配信ではPagesの設定から得たURLを SYNTHIA_SITE_URL でビルドに渡します。

## 変更したファイル

- build.py: メタデータ、ブランドトークン、インラインSVGアイコン
- app/i18n.py: 公開先を app/config.py から取得
- app/body.html: ヘッダーと入力パネルの順番
- app/style.css: CSS変数、シアン・チャコールの操作画面
- README*.md、CHANGELOG.md、.gitignore
- 生成物: 7言語の index.html、sitemap.xml

## 新規追加

- site.config.json、CUSTOM_VERSION、app/config.py
- .github/workflows/build-pages.yml
- tools/verify_release.py、tools/package_pages.py
- docs/ の出典・保守・公開・検証資料

## 元JIZURAとの違い

音源→歌詞/LRC→行とカットの順番に入力欄を並べます。
モードは既存のかんたん・詳細・スマホを維持します。
機能追加・削除はありません。src/、vendor/、ae/、cep/を変更していません。
保存形式、generator、localStorage、IndexedDBキーも維持します。
JIZURAという名前は互換データ、ソースコメント、出典、AE版の表記に残します。
QUICK/STANDARD/ADVANCEDや外部APIは未実装です。
