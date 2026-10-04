# SYNTHIA Lyrics Studio

JIZURAをベースにカスタマイズした、個人向けリリックモーション・MV制作Webアプリです。

公開予定URL: https://takashige2026.github.io/synthia-lyrics-studio/
GitHub予定先: https://github.com/takashige2026/synthia-lyrics-studio
公開前のローカル候補です。公開状態と動作確認は docs/QA.md を参照してください。

Base: JIZURA v0.10.1 / Custom: SYNTHIA Lyrics Studio v0.1.0

## Based on JIZURA

This project is based on JIZURA by hakoniwa.
Original project: https://github.com/852wa/JIZURA
Licensed under the MIT License. The original notices are preserved in LICENSE and THIRD_PARTY_NOTICES.md.

## ローカル起動

Python 3.10以降（追加パッケージ不要）と、ChromeまたはEdgeを利用します。

```powershell
python build.py
python tools/verify_release.py
python -m http.server 8080 --bind 127.0.0.1
```

http://127.0.0.1:8080/ を開いてください。

1. 「曲を読み込む」から音源を選びます。
2. 歌詞を入力するか、LRCを読み込みます。
3. 「おまかせで作る」でモーションを生成します。
4. プレビュー、タイミング、スタイルを調整します。
5. MP4またはPNGをローカルへ書き出します。

## 保存とプライバシー

音源、歌詞、動画はブラウザ内で処理します。バックエンド、ログイン、解析サービスは追加していません。
Google Fontsは元の仕組みで必要な書体だけ取得します。
`.jizura.json` と既存の保存キーを維持します。JSONに音源そのものは含まれないため、別端末では曲も読み込んでください。
同じオリジンで別のJIZURA版も使う場合、保存キーを共有するためブラウザ内の自動保存が共有されます。

## 設定・公開・保守

- [カスタマイズ](docs/CUSTOMIZATION.md): 名前、配色、公開URL
- [GitHub Pages公開](docs/DEPLOYMENT.md): 公開承認後の手順
- [上流更新](docs/UPSTREAM_UPDATE.md): JIZURA更新の取り込み
- [原版の出典](docs/ORIGINAL_PROJECT.md)
- [機能ガイド](docs/UPSTREAM_README.md): 元の操作説明
- [確認結果](docs/QA.md)

AE版はPhase 2対象です。ファイルを維持していますが、SYNTHIAへの名称変更やAE内での動作確認は行っていません。
