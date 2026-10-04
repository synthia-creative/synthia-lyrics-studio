# SYNTHIA Lyrics Studio 実装結果

## 公開URL

公開URL: https://takashige2026.github.io/synthia-lyrics-studio/
2026-10-04に利用者の承認を得てGitHub Pagesで公開しました。

## GitHub Repository

URL: https://github.com/takashige2026/synthia-lyrics-studio
GitHubコネクターの認証ユーザーが takashige2026 であることを確認済み。
Publicリポジトリを作成し、利用者自身による通常のブラウザ認証後にmainへpushしました。
GitHub Actionsのビルド・配信は成功しています。[公開結果](PUBLICATION.md)を参照してください。

## ベース

JIZURA: https://github.com/852wa/JIZURA
バージョン: 0.10.1
コミット: fc16bfe43ea4a6c25a21f1caf04d17326de14f00
作者: hakoniwa
原本を synthia-lyrics-studio-original/、ビルド確認用コピーを synthia-lyrics-studio-baseline/ に別保存しています。

## Custom Version

SYNTHIA Lyrics Studio: 0.1.0
作業ブランチ: feature/synthia-branding
VERSIONは原版のまま、CUSTOM_VERSIONで独自版を管理します。

## 変更ファイル

- build.py、app/i18n.py、app/body.html、app/style.css
- README.md、README.en.md、README.id.md、README.ko.md、README.vi.md、CHANGELOG.md、.gitignore
- 生成HTML7言語とsitemap.xml
- 新規: site.config.json、CUSTOM_VERSION、app/config.py
- 新規: .github/workflows/build-pages.yml、tools/verify_release.py、tools/package_pages.py
- 新規: docs/ORIGINAL_PROJECT.md、CUSTOMIZATION.md、UPSTREAM_UPDATE.md、DEPLOYMENT.md、UPSTREAM_README.md、QA.md、IMPLEMENTATION_REPORT.md

## 主な変更

- 名称と公開URL・説明文を設定ファイルへ集約
- canonical、Open Graph、hreflang、sitemapを公開先へ設定
- 黒・チャコールにシアンを合わせた操作画面
- 音源→歌詞/LRC→タイミング調整の入力順に変更
- GitHub Pagesの自動ビルド、公開用ファイルの限定、検査ツール
- 原版の保存形式・エンジン・AE版・ライセンスを保持

## 動作確認

- [x] Chrome
- [x] Edge
- [x] 音源読み込みとBPM解析
- [x] 歌詞入力
- [x] LRC読み込み・書き出し
- [x] タイムライン
- [x] プレビュー
- [x] MP4（短いテスト音源付き）
- [x] PNG（72枚のデコード確認）
- [x] プロジェクト保存・読み込み・原版との相互読み込み
- [x] 7言語起動
- [x] 390/430/768/1440/1920px
- [x] GitHub ActionsのビルドとGitHub Pages実配信
- [x] 公開版のChrome・Edgeで各22検査
- [x] 公開7言語のHTTP 200、メタデータとローカル生成HTMLの一致

詳細は [QA.md](QA.md) を参照してください。

## ライセンス

- [x] LICENSE維持
- [x] THIRD_PARTY_NOTICES維持
- [x] 元作者表記確認
- [x] mp4-muxerとvendorライセンス維持
- [x] AE/CEP関連ファイル維持

## 今後追加可能な機能

- SYNTHIA専用MVスタイル・プリセット
- Premiere向けSRT/CSV/JSONの出力拡張
- 曲・歌詞・MV企画をまとめる制作管理

## 問題・注意点

- MP4は短い720p素材で確認。長時間曲や4K、スマホ実機は未確認です。
- MP4の実視聴と聴感による最終確認は未実施です。構造と全体のデコードは検査済みです。
- 保存JSONに曲のバイナリは含みません。別端末では曲も読み込みます。
- AE版は原版のまま保持し、AE内での動作は未確認です。
- 上流のGoogle Search Console確認HTMLは原本保持のためソース側に残していますが、Pages公開用ファイルには含めません。

## 次におすすめする作業

1. 利用者の実曲と歌詞で制作し、MP4を視聴して確認
2. スマホ実機と長い曲で制作・保存を確認
3. 専用プリセットと必要な出力形式を追加
