# GitHub Pages公開

公開リポジトリ: https://github.com/takashige2026/synthia-lyrics-studio
公開URL: https://takashige2026.github.io/synthia-lyrics-studio/

利用者の承認を得て2026-10-04にPublicリポジトリへアップロードし、GitHub Pagesで公開しました。コードとGit履歴をインターネットで閲覧できます。
公開物はこのアプリのコードとライセンス・説明文です。利用者の音源・歌詞は含めません。
PagesのSourceはGitHub Actions、HTTPSは有効です。[公開結果](PUBLICATION.md)と[検証記録](QA.md)を参照してください。

## 初回公開で実施した準備

GitHubのブラウザ画面でリポジトリを作成し、Git Credential Managerが開いた通常の認証画面で利用者自身がログインしました。
Codexへトークンやパスワードを貼り付ける必要はありません。
GitHubコネクターでアカウントが takashige2026 であることを確認し、別リポジトリとして作成しました。
GitHub CLIの認証は使用していません。

設定した公開先とpush先:

```bash
git remote add origin https://github.com/takashige2026/synthia-lyrics-studio.git
git push -u origin feature/synthia-branding:main
```

## 現在の配信方法: GitHub Actions

Settings → Pages → Build and deployment → Source を GitHub Actions にします。
Actions → Build and deploy Pages → Run workflow（main）を実行します。
mainへのpushでもビルドが実行されます。PRではビルド検査のみで、公開しません。
`python build.py` → `python tools/verify_release.py` → 公開ファイルの組み立て → 配信を行います。
_site/ にHTML7言語、サイトマップ、ライセンス、AEダウンロード用ファイルだけを配置します。
コード全体や上流のGoogle確認ファイルをPagesに配信しません。
初回runはPages有効化前に開始したため失敗しましたが、有効化後の再実行で成功しています。公開結果文書を含む[後続runも成功](https://github.com/takashige2026/synthia-lyrics-studio/actions/runs/37181828772)しました。

更新時は変更を検査・コミットし、この作業ブランチから `git push origin HEAD:main` で反映します。Actionsの成功と公開URLの応答を確認してください。

## 手動配信

ビルド済みHTMLもGitに保存しています。Settings → Pagesで Deploy from a branch、main、/(root)を選べます。
この場合はActionsの配信ワークフローを同時に有効化しないでください。
変更時は再ビルド・検査してから生成HTMLもコミットします。

## 公開後に確認済み

- HTTPSの公開URLが200を返す
- 7言語のページ・切替が動く
- canonical/OG/hreflang/サイトマップがこの公開先を指す
- Chrome/Edgeで、音源・LRC・保存・プレビュー・MP4/PNGを再確認
- 390/430/768/1440/1920pxでレイアウト確認

独自ドメインは今回設定していません。ドメイン確定後、Pages設定とDNSを設定してビルドします。
