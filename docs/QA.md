# 動作確認

確認日: 2026-10-04（日本時間）
対象: SYNTHIA Lyrics Studio v0.1.0 / JIZURA v0.10.1
対象URL: http://127.0.0.1:8089/ （Pagesに配信する _site/ をローカルHTTPで配信）
ブラウザ: このPCにインストールされたGoogle Chrome / Microsoft EdgeをPlaywrightから起動
Browser plugin not available: 既存のPlaywrightとブラウザを使用。追加インストールなし。

## 検証した操作

起動→歌詞入力→3秒の合成WAV読み込み→LRC読み込み→プレビュー→タイムライン操作→スタイル変更→保存と再読み込み→リロード後の音源復元→LRC・MP4・PNG出力。
利用者の音源・歌詞はテストに使用していません。

| 項目 | Chrome | Edge | 確認内容 |
| --- | --- | --- | --- |
| ページ識別・空白画面 | 合格 | 合格 | タイトル、歌詞欄、Canvasが表示 |
| フレームワークエラー表示 | なし | なし | 既存の静的HTML構成 |
| 音源/BPM | 合格 | 合格 | 合成WAV 3秒、約120BPM、波形・音源状態 |
| 歌詞・LRC | 合格 | 合格 | 2行、開始0秒/1秒、LRC出力にも保持 |
| プレビュー | 合格 | 合格 | 再生状態と再生時刻の進行 |
| タイムライン | 合格 | 合格 | スクラブで時刻が変わる |
| スタイル | 合格 | 合格 | 選択で保存データのスタイルが変わる |
| JSON保存・復元 | 合格 | 合格 | version 1、歌詞・設定を再読み込み |
| 音源の再読み込み | 合格 | 合格 | リロード後、IndexedDBから復元 |
| MP4 | 合格 | 合格 | 1280×720、24fps、H.264 HighとAAC、3秒 |
| PNG | 合格 | 合格 | ZIPに72枚、全画像をデコード、1280×720 |
| Google Fonts | 合格 | 合格 | 実際に読み込まれたFontFaceを確認 |
| コンソール・HTTP | 合格 | 合格 | pageerror/console error/404/failed requestが0 |
| 素材の外部送信 | なし | なし | 操作中、外部へのPOSTなどが0 |
| 390/430/768/1440/1920px | 合格 | 合格 | 横方向のはみ出しなし、スクリーンショット |

MP4はffprobeで映像・音声トラックを確認し、ffmpegで全体をデコードしてエラーがないことも確認しました。
デスクトップ初期画面、390pxのスマホモード、原版の画面を目視比較しました。
7言語も実際に起動し、ヘッダー、canonical、言語選択、実行時エラーがないことを確認しました。
原版で保存したJSONをSYNTHIAで、SYNTHIAで保存したJSONを原版で読み込み、歌詞、スタイル、タイミング、シード、演出、手法、行指定を比較しました。

## 原版との比較

改造前にも同じChrome操作テストを実行しています。
原版はアプリアイコン未配置の /favicon.ico に404がありました。SYNTHIAはインラインSVGアイコンで解消しています。
src/、vendor/、ae/、cep/、LICENSE、THIRD_PARTY_NOTICES.md、VERSION、AE/CEPの生成済みファイルはSHA-256で一致を検査しています。
元リポジトリのローカル原本はGitで変更なしです。

## 再検査

```bash
python build.py
python tools/verify_release.py
python tools/package_pages.py --output _site-new
```

package_pages.pyは既存出力を上書きしません。再実行は新しい出力フォルダを指定します。
ブラウザ操作スクリプト、結果JSON、画像、テスト出力は、ローカルの隣接フォルダ synthia-lyrics-studio-qa/ に保存しています。公開リポジトリには含めません。

## 未確認

- GitHub Pages実配信、公開先での操作（公開承認待ち）
- GitHub Actionsでの実行（設定・ローカルの同等ビルド検査まで）
- スマートフォン実機、Safari、Firefox
- 長時間の曲、4K、全モーションの全組み合わせ
- AE本体へのインストールと動作
- MP4の実視聴と聴感による最終確認（構造・デコードは検査済み）
