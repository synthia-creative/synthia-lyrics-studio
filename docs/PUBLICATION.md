# SYNTHIA Lyrics Studio 実装結果

公開確認日: 2026-10-04（日本時間）。この文書が公開後の結果です。利用者の承認後、READMEと公開・実装・検証文書にも公開結果を反映しました。

## 公開URL

URL: https://takashige2026.github.io/synthia-lyrics-studio/

GitHub Pagesへの配信が成功し、HTTPSで利用できます。

## GitHub Repository

URL: https://github.com/takashige2026/synthia-lyrics-studio

Publicリポジトリのmainへ公開。原版の履歴と独自変更のコミットを保持しています。
GitHub Actions: https://github.com/takashige2026/synthia-lyrics-studio/actions/runs/37181334109 （再実行2で成功）。初回はPagesの有効化前に起動したため失敗し、有効化後の再実行で解消しました。

## ベース

JIZURA: https://github.com/852wa/JIZURA

バージョン: 0.10.1 / fc16bfe43ea4a6c25a21f1caf04d17326de14f00

作者: hakoniwa。原本は隣接する synthia-lyrics-studio-original/ に別保存しています。

## Custom Version

SYNTHIA Lyrics Studio: 0.1.0

## 変更ファイル

- build.py、app/config.py、app/i18n.py、app/body.html、app/style.css
- site.config.json、CUSTOM_VERSION、生成HTML7言語、sitemap.xml
- .github/workflows/build-pages.yml、tools/verify_release.py、tools/package_pages.py
- README各言語、CHANGELOG.md、.gitignore、docs/ の出典・カスタマイズ・公開・上流更新・検証資料

## 主な変更

- SYNTHIAの名称、説明、公開URLを設定ファイルに集約
- 黒・チャコールとシアンの操作画面、音源→歌詞/LRC→タイミング調整の入力順
- 7言語のcanonical・Open Graph・hreflang・sitemapを独自公開先へ設定
- GitHub Pagesの自動ビルドと配信、公開ファイル限定、リリース検査
- エンジン、プロジェクト形式、AE/CEPファイル、ライセンスを保持

## 動作確認

- [x] Chrome
- [x] Edge
- [x] 音源読み込み・BPM解析
- [x] 歌詞入力
- [x] LRC読み込み・書き出し
- [x] タイムライン
- [x] プレビュー
- [x] MP4
- [x] PNG
- [x] プロジェクト保存・復元
- [x] GitHub ActionsのビルドとPages配信
- [x] 公開版でChrome・Edgeの各22検査
- [x] 公開7言語のHTTP 200、canonical・OG、ローカル生成HTMLとの一致
- [x] 390/430/768/1440/1920pxの幅で横はみ出しなし

ローカル版と公開版で3秒の合成WAV（約120BPM）、2行のLRCを使用しました。利用者の音源や歌詞は使用していません。
公開版の両ブラウザでJSON保存・読み込み、リロード後のIndexedDB音源復元、再生、スクラブ、スタイル変更、LRC出力を確認しています。
MP4は1280×720、24fps、H.264 HighとAACをffprobeで確認し、ffmpegで全体をデコードしてエラーなし。PNG ZIPの72枚はすべて1280×720でデコードできました。
コンソールエラー、ページ例外、404、失敗リクエストは0。操作中の外部POSTなどは0でした。
原版と独自版のJSON相互読み込みも確認しました。

公開対象は7言語HTML、sitemap、ライセンス、AE/CEPダウンロードなどに限定。src/、app/、原版のGoogle Search Console確認HTMLはPages側で404となることを確認しています。

検証スクリプト、結果JSON、出力、画像は隣接する synthia-lyrics-studio-qa/ に保存し、公開リポジトリには含めていません。

## ライセンス

- [x] LICENSE維持
- [x] THIRD_PARTY_NOTICES維持
- [x] 元作者表記確認
- [x] mp4-muxer・vendorのライセンス維持
- [x] AE/CEP関連ファイル維持

src/、vendor/、ae/、cep/、LICENSE、THIRD_PARTY_NOTICES.md、VERSION、AE/CEP生成物の111ファイルは原版とSHA-256で一致しています。公開ライセンスファイルもローカルと一致しています。

## 今後追加可能な機能

- SYNTHIA専用MVプリセット
- Premiere向けSRT/CSV/JSON出力
- 曲・歌詞・MV企画をまとめる制作管理

## 問題・注意点

- スマートフォン実機、Safari、Firefox、長時間曲、4K、全モーション組み合わせは未確認です。
- MP4の実視聴と聴感による最終確認は未実施です。ファイル構造とデコードは検査済みです。
- AE本体でのインストール・動作は未確認です。
- プロジェクトJSONには音源バイナリを含みません。別端末では音源も読み込みます。

## 次におすすめする作業

1. 実曲と歌詞で制作し、MP4を視聴して確認
2. スマートフォン実機と長い曲で制作・保存を確認
3. 専用プリセットと必要な出力形式を追加
