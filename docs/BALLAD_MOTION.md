# Ballad Motion Engine v1.0

バラードの「おまかせ」を、穏やかな歌詞演出に揃えるブラウザ内エンジンです。

1. テーマで「バラード」を選択します。選択だけでは現在の歌詞や演出を変えません。
2. 静かな（25%）／感動系（35%）／ドラマチック（55%）を選び、演出の強さを調整します。
3. 「おまかせで作る」または「演出を再抽選」を押します。カット単位のおまかせ・シャッフルも同じルールで動きます。
4. 詳細設定の「動きを抑える」は次の生成で反映し、JSONとMP4/PNGにも保存されます。

Soft Fade、Gentle Float、Light Trace、Emotional Bloomと、歌詞をすっきり見せる専用配置を追加しました。短い字幕と長文は静止・フェードを優先し、登場と退場の合計を表示時間の半分以下に抑えます。音源や波形解析がなくても使用できます。

ロックと手動指定を優先し、SRTの開始・終了時刻、文字、保存形式を保ちます。手動で追加した激しい演出は削除しません。他のテーマでは従来の抽選を利用します。

保存先は`balladMotion`です。設定・seed・生成済みレシピ・カット構造・音源なしでの時刻再現用データを保持します。旧JSONは設定なしで読み込め、開いただけで演出を変更しません。

## English

Select **Ballad**, choose Quiet / Emotional / Dramatic, then press Auto-compose or Reroll motion. Pending settings do not change existing results. Per-cut draws use the same safe rules. No audio or analysis is required. Manual overrides and locks take priority. Reduce motion is saved for preview and exports.

## Development

The identical pure JS core is `src/08a_ballad_core.js`. The Canvas/editor adapter is `src/11zzzzzzzzzz_ballad.js`; settings UI is `src/13z_ballad_ui.js`.

```text
node dev/ballad_test.js
python build.py
python tools/verify_release.py
python tools/sync_ballad_core.py ../synthia-layer-studio-ballad-20261014 --check
```

Exact rendering of the new expressions is verified for browser MP4/PNG. Native After Effects rendering is outside that verification; its existing fallback contract remains available.
