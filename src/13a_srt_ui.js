/* Local SRT file selection; validation precedes replacement of existing lyrics. */
(() => {
'use strict';
if (!document.getElementById('app') || !J.ui) return;
const ja = document.documentElement.lang === 'ja';
const label = document.createElement('label'); label.className = 'file ghost small';
label.append(document.createTextNode(ja ? 'SRT を読み込む' : 'Load SRT'));
const input = document.createElement('input'); input.id = 'fileSrt'; input.type = 'file'; input.accept = '.srt,text/plain,application/x-subrip';
input.setAttribute('aria-label', ja ? 'SRT を読み込む' : 'Load SRT'); label.append(input);
document.getElementById('fileLrc').closest('label').after(label);
label.closest('.sec').classList.add('srt-import');
input.addEventListener('change', async event => {
  const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
  if (J.ui.tap || J.ui.exporting) { J.uiApi.toast(ja ? '再生同期・書き出しを終了してから読み込んでください' : 'Finish tapping or exporting before importing.'); return; }
  try {
    if (file.size > 2e6) throw new Error(ja ? 'SRT ファイルが大きすぎます' : 'SRT file is too large.');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
    const parsed = J.parseSrt(text);
    if (J.ui.project.lyrics.trim() && !window.confirm(ja ? '今の歌詞をSRTの内容に置き換えます。行ごとの時刻・指定・書き出す範囲も消えます。「元に戻す」で戻せます。よろしいですか？' : 'Replace the lyrics with this SRT? Per-line timing, settings and export range are cleared. Undo restores them.')) return;
    J.uiApi.loadSrt(parsed);
  } catch (error) { J.uiApi.toast(error.message || (ja ? 'SRT を読み込めませんでした' : 'Cannot load SRT.')); }
});
})();
