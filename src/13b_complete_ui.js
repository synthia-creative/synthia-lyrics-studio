/* Completed-export controls are created before the native editor binds on DOMContentLoaded. */
(() => {
'use strict';
if (!document.getElementById('app')) return;
const ja = document.documentElement.lang === 'ja';
for (const [anchor, id] of [['btnMP4', 'btnCompleteMP4'], ['eMP4', 'eCompleteMP4']]) {
  const original = document.getElementById(anchor);
  if (ja || document.documentElement.lang === 'en') original.textContent = ja ? 'リリックのみMP4を書き出す' : 'Export lyrics-only MP4';
  const group = document.createElement('div'); group.className = 'outbtns complete-output';
  const button = document.createElement('button'); button.id = id; button.className = 'primary';
  button.textContent = ja ? '完成動画MP4を書き出す' : 'Export completed MP4'; group.append(button);
  const direct = document.createElement('button'); direct.id = id + 'File'; direct.className = 'ghost';
  direct.textContent = ja ? '完成動画（ファイルに直接保存）' : 'Completed MP4 (save directly to file)';
  direct.hidden = typeof window.showSaveFilePicker !== 'function'; group.append(direct);
  const help = document.createElement('p'); help.className = 'muted complete-help';
  help.textContent = ja ? '選択した背景を焼き込みます。音声は読み込んだ楽曲だけです。上の通常MP4・PNGには素材背景を含めません。' : 'Includes the selected background. Only the loaded song is used for audio. Normal MP4 / PNG exclude this background.';
  group.append(help); original.closest('.outbtns').after(group);
}
window.addEventListener('pagehide', () => J.ui?.exporting?.abort());
})();
