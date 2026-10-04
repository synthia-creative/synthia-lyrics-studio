# GitHub Pages公開

公開予定リポジトリ: https://github.com/takashige2026/synthia-lyrics-studio
公開予定URL: https://takashige2026.github.io/synthia-lyrics-studio/

この作業時点ではGitHubへアップロードしていません。
Public/Privateは利用者判断です。PublicにするとコードとGit履歴をインターネットで閲覧できます。
公開物はこのアプリのコードとライセンス・説明文です。利用者の音源・歌詞は含めません。

## 承認後の準備

GitHub CLI未認証の場合は `gh auth login --web` を実行し、利用者自身がブラウザでログインします。
Codexへトークンやパスワードを貼り付ける必要はありません。
アカウントが takashige2026 であることを `gh api user --jq .login` で確認します。
既存の同名リポジトリを上書きしないでください。

公開リポジトリの作成・アップロードを承認した場合の例:

```bash
gh repo create takashige2026/synthia-lyrics-studio --public --description "Browser-local lyric motion studio based on JIZURA"
git remote add origin https://github.com/takashige2026/synthia-lyrics-studio.git
git push -u origin feature/synthia-branding:main
```

## 推奨: GitHub Actions

Settings → Pages → Build and deployment → Source を GitHub Actions にします。
Actions → Build and deploy Pages → Run workflow（main）を実行します。
mainへのpushでもビルドが実行されます。PRではビルド検査のみで、公開しません。
`python build.py` → `python tools/verify_release.py` → 公開ファイルの組み立て → 配信を行います。
_site/ にHTML7言語、サイトマップ、ライセンス、AEダウンロード用ファイルだけを配置します。
コード全体や上流のGoogle確認ファイルをPagesに配信しません。

## 手動配信

ビルド済みHTMLもGitに保存しています。Settings → Pagesで Deploy from a branch、main、/(root)を選べます。
この場合はActionsの配信ワークフローを同時に有効化しないでください。
変更時は再ビルド・検査してから生成HTMLもコミットします。

## 公開後

- HTTPSの公開URLが200を返す
- 7言語のページ・切替が動く
- canonical/OG/hreflang/サイトマップがこの公開先を指す
- Chrome/Edgeで、音源・LRC・保存・プレビュー・MP4/PNGを再確認
- 390/430/768/1440/1920pxでレイアウト確認

独自ドメインは今回設定していません。ドメイン確定後、Pages設定とDNSを設定してビルドします。
