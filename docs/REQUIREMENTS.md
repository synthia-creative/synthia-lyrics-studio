# 動作環境と検査ツール

## アプリの利用

ChromeまたはEdgeでHTMLを開きます。PythonやNode.jsは公開済みアプリの利用者には不要です。
MP4にはWebCodecsと対応エンコーダーが必要です。非対応環境ではPNGを利用します。
Google Fontsは必要な書体だけ取得します。オフラインでは端末の代替書体を使います。

## ローカルビルド・配信

Python 3.10以降が必要です。build.pyは標準ライブラリだけで動き、pip installは不要です。
`python -m http.server 8080 --bind 127.0.0.1` でローカルHTTP配信ができます。

## リリース検査

`python tools/verify_release.py` はインラインJavaScriptを `node --check` で検査するため、Pythonに加えてNode.jsがPATHに必要です。
検査ツール用のnpmパッケージのインストールは不要です。
GitHub ActionsはPythonとNode.jsを用意する設定です。
ローカルの自動ブラウザ検証は同梱済みPlaywrightを使いました。アプリ本体の依存関係には追加していません。

## 今回確認した範囲

このPCのChromeとEdge、短い720p素材、指定の5画面幅で確認しました。
長時間の曲・4K・スマホ実機・AE本体は未確認です。
