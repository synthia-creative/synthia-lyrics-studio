# 上流の更新を取り込む

upstream: https://github.com/852wa/JIZURA.git
初期状態: JIZURA v0.10.1, `fc16bfe43ea4a6c25a21f1caf04d17326de14f00`
originはユーザーのリポジトリを作成した後に設定します。upstreamへpushしないでください。

```bash
git status
git remote -v
git fetch upstream
git log --oneline HEAD..upstream/main
git diff HEAD...upstream/main -- src app build.py VERSION
```

作業前にプロジェクトJSONを保存し、未コミットの変更を保護してください。
更新内容と競合を確認してから、更新用ブランチで取り込みます。

```bash
git switch -c maintenance/upstream-update
git merge --no-commit --no-ff upstream/main
python build.py
python tools/verify_release.py
```

競合はソース側で解決します。生成HTMLは競合解決後に再ビルドします。
build.py、app/i18n.py、app/body.html、app/style.cssは独自変更のある主要な確認対象です。
LICENSEとTHIRD_PARTY_NOTICES.mdは上流の新しい表記も維持してください。
保存JSON、LRC、音源、プレビュー、MP4/PNG、5画面幅を再確認してからコミットします。
取り込みを中止する場合は、作業ツリー保護と対象確認の後に git merge --abort を使います。
VERSIONは上流版に合わせ、独自変更のバージョンはCUSTOM_VERSIONとCHANGELOGで別に管理します。
