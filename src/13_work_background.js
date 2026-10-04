/* SYNTHIA: session-only preview media. Independently implemented; see docs/WORK_BACKGROUND.md. */
(() => {
'use strict';
if (!document.getElementById('app') || !J.ui) return;
const $ = id => document.getElementById(id);
const copies = {
  ja: ['作業用背景','画像・動画を選択','解除','表示','背景＋リリック','通常表示','フィット','全体表示（contain）','画面いっぱい（cover）','背景不透明度','未選択','読み込み中…','作業用背景を再選択してください','この形式は読み込めません。別の画像・動画を選択してください。','プレビュー専用です。MP4・PNGには含めません。動画終了後は最後のフレームを保持します。','動画の再生を開始できません。再生ボタンを押し直してください。'],
  en: ['Work background','Select image / video','Clear','Display','Background + lyrics','Normal view','Fit','Show all (contain)','Fill frame (cover)','Background opacity','None','Loading…','Please select the work background again','Cannot load this format. Select another image or video.','Preview only; excluded from MP4 / PNG. The last video frame is held after it ends.','Video could not start. Press play again.'],
  'zh-Hant': ['工作背景','選擇圖片／影片','清除','顯示','背景＋歌詞','一般顯示','適配','完整顯示（contain）','填滿畫面（cover）','背景不透明度','未選擇','載入中…','請重新選擇工作背景','無法載入此格式，請選擇其他圖片或影片。','僅供預覽，不包含在 MP4／PNG 中。影片結束後保留最後一幀。','無法開始播放影片，請再次按播放。'],
  'zh-Hans': ['工作背景','选择图片／视频','清除','显示','背景＋歌词','正常显示','适配','完整显示（contain）','填满画面（cover）','背景不透明度','未选择','加载中…','请重新选择工作背景','无法加载此格式，请选择其他图片或视频。','仅供预览，不包含在 MP4／PNG 中。视频结束后保留最后一帧。','无法开始播放视频，请再次按播放。'],
  ko: ['작업 배경','이미지 / 동영상 선택','해제','표시','배경 + 가사','일반 표시','맞춤','전체 표시 (contain)','화면 채우기 (cover)','배경 불투명도','선택 안 됨','불러오는 중…','작업 배경을 다시 선택하세요','이 형식을 불러올 수 없습니다. 다른 이미지나 동영상을 선택하세요.','미리보기 전용이며 MP4 / PNG에 포함되지 않습니다. 동영상 종료 후 마지막 프레임을 유지합니다.','동영상을 재생할 수 없습니다. 재생 버튼을 다시 누르세요.'],
  'id-ID': ['Latar kerja','Pilih gambar / video','Hapus','Tampilan','Latar + lirik','Tampilan biasa','Ukuran','Tampilkan semua (contain)','Penuhi bingkai (cover)','Opasitas latar','Belum dipilih','Memuat…','Pilih kembali latar kerja','Format ini tidak dapat dimuat. Pilih gambar atau video lain.','Hanya pratinjau; tidak disertakan dalam MP4 / PNG. Bingkai terakhir ditahan setelah video selesai.','Video tidak dapat dimulai. Tekan putar lagi.'],
  vi: ['Nền làm việc','Chọn ảnh / video','Xóa','Hiển thị','Nền + lời bài hát','Hiển thị thường','Căn chỉnh','Hiển thị toàn bộ (contain)','Lấp đầy khung (cover)','Độ đục của nền','Chưa chọn','Đang tải…','Vui lòng chọn lại nền làm việc','Không thể tải định dạng này. Hãy chọn ảnh hoặc video khác.','Chỉ để xem trước; không xuất vào MP4 / PNG. Giữ khung hình cuối khi video kết thúc.','Không thể phát video. Hãy nhấn phát lại.'],
};
const copy = copies[document.documentElement.lang] || copies.en;
const state = { media: null, pending: null, generation: 0, project: null, playPending: false, playBlocked: false };
const lyricCanvas = document.createElement('canvas');
const lyricRenderer = new J.Renderer();
const normalize = value => ({ enabled: value?.enabled === true, fit: value?.fit === 'cover' ? 'cover' : 'contain', opacity: typeof value?.opacity === 'number' && Number.isFinite(value.opacity) ? Math.max(0, Math.min(1, value.opacity)) : 1 });
let settings = normalize(null);
const panel = document.createElement('section');
panel.id = 'workBackground'; panel.className = 'sec work-background';
// All markup comes from the fixed glossary. File names are assigned with textContent.
panel.innerHTML = `<div class="sec-h"><h2>${copy[0]}</h2></div>
  <div class="row"><label class="file">${copy[1]}<input id="wbFile" type="file" accept="image/*,video/*" aria-label="${copy[1]}"></label><button id="wbClear" class="ghost small" disabled>${copy[2]}</button></div>
  <div id="wbName" class="muted work-background-name">${copy[10]}</div>
  <div class="work-background-fields"><label>${copy[3]}<select id="wbMode" aria-label="${copy[3]}"><option value="combined">${copy[4]}</option><option value="normal" selected>${copy[5]}</option></select></label>
  <label>${copy[6]}<select id="wbFit" aria-label="${copy[6]}"><option value="contain">${copy[7]}</option><option value="cover">${copy[8]}</option></select></label></div>
  <label class="work-background-opacity" for="wbOpacity">${copy[9]} <output id="wbOpacityValue" for="wbOpacity">100%</output><input id="wbOpacity" type="range" min="0" max="100" step="1" value="100"></label>
  <p id="wbStatus" class="muted" role="status" aria-live="polite"></p><p class="muted work-background-help">${copy[14]}</p>`;
$('audioFile').closest('.sec').after(panel);
const dirty = () => { J.ui.need = true; };
const status = text => { $('wbStatus').textContent = text; };
function refreshControls() {
  $('wbMode').value = settings.enabled ? 'combined' : 'normal';
  $('wbFit').value = settings.fit;
  $('wbOpacity').value = String(Math.round(settings.opacity * 100));
  $('wbOpacityValue').value = Math.round(settings.opacity * 100) + '%';
  $('wbClear').disabled = !state.media && !state.pending;
  $('wbName').textContent = state.media?.name || copy[10];
}
function rememberSettings() {
  if (!J.ui.project) return;
  J.ui.project.workBackground = { ...settings };
  J.uiApi.flushSave();
}
function dispose(record) {
  if (!record || record.disposed) return;
  record.disposed = true;
  record.cancel?.();
  if (record.video) record.el.pause();
  record.el.removeAttribute('src');
  if (record.video) record.el.load();
  URL.revokeObjectURL(record.url);
}
function release() {
  state.generation++;
  dispose(state.pending); dispose(state.media);
  state.pending = null; state.media = null;
  state.playPending = false; state.playBlocked = false;
  $('wbFile').value = '';
}
function adoptProject(project) {
  if (!project || state.project === project) return;
  release(); state.project = project;
  settings = normalize(project.workBackground);
  // Only this allow-listed settings object survives project imports. Never retain a blob URL or file data.
  if (Object.hasOwn(project, 'workBackground')) project.workBackground = { ...settings };
  status(Object.hasOwn(project, 'workBackground') ? copy[12] : '');
  refreshControls(); dirty();
}
async function selectFile(file) {
  release();
  const generation = state.generation;
  const project = J.ui.project;
  const video = file.type.startsWith('video/') || (!file.type && /\.(mp4|webm|mov|m4v|ogv|ogg)$/i.test(file.name));
  const record = { el: document.createElement(video ? 'video' : 'img'), video, url: URL.createObjectURL(file), name: file.name, disposed: false };
  if (video) { record.el.muted = true; record.el.playsInline = true; record.el.preload = 'auto'; record.el.loop = false; }
  state.pending = record; status(copy[11]); refreshControls(); dirty();
  try {
    await new Promise((resolve, reject) => {
      const event = video ? 'loadeddata' : 'load';
      const finish = error => {
        clearTimeout(timer); record.el.removeEventListener(event, ready); record.el.removeEventListener('error', failed); record.cancel = null;
        error ? reject(error) : resolve();
      };
      const ready = () => finish();
      const failed = () => finish(new Error('decode'));
      const timer = setTimeout(() => finish(new Error('timeout')), 30000);
      record.cancel = () => finish(new Error('cancelled'));
      record.el.addEventListener(event, ready, { once: true }); record.el.addEventListener('error', failed, { once: true });
      record.el.src = record.url;
      if (video) record.el.load();
    });
    if (generation !== state.generation || project !== J.ui.project) { dispose(record); return; }
    record.width = video ? record.el.videoWidth : record.el.naturalWidth;
    record.height = video ? record.el.videoHeight : record.el.naturalHeight;
    record.duration = video ? record.el.duration : Infinity;
    if (!record.width || !record.height || (video && (!Number.isFinite(record.duration) || record.duration <= 0))) throw new Error('metadata');
    state.pending = null; state.media = record;
    if (video) {
      for (const event of ['seeked', 'loadeddata', 'ended']) record.el.addEventListener(event, () => { if (!record.disposed) dirty(); });
    }
    settings.enabled = true; state.playBlocked = false;
    rememberSettings(); status(''); refreshControls(); sync(true); dirty();
  } catch (error) {
    dispose(record);
    if (generation !== state.generation) return;
    state.pending = null; status(copy[13]); refreshControls(); dirty();
  }
}
function sync(force = false) {
  const record = state.media;
  if (!record?.video || record.disposed) return;
  const v = record.el, ui = J.ui;
  if (!settings.enabled || ui.exporting) { v.pause(); return; }
  const rate = ui.tap?.rate > 0 ? ui.tap.rate : 1;
  if (v.playbackRate !== rate) v.playbackRate = rate;
  const target = Math.max(0, Math.min(ui.t, Math.max(0, record.duration - 0.001)));
  const playing = ui.playing && ui.t < record.duration;
  if (!playing) v.pause();
  const drift = Math.abs(v.currentTime - target);
  // Native playback advances the media clock; seek only for jumps or a drift over 150 ms.
  // A paused scrub may interrupt an in-flight seek so the latest position wins.
  if (drift > (playing && !force ? 0.15 : 0.0005) && (!v.seeking || !playing || force)) v.currentTime = target;
  if (playing && v.paused && !state.playPending && !state.playBlocked) {
    state.playPending = true;
    v.play().catch(() => { if (state.media === record && !record.disposed) { state.playBlocked = true; status(copy[15]); } })
      .finally(() => { if (state.media === record) { state.playPending = false; if (!settings.enabled || !ui.playing || ui.exporting || ui.t >= record.duration) v.pause(); } });
  }
}
function draw(ctx, plan, t, opt) {
  if (!settings.enabled || !state.media || state.media.disposed || J.ui.exporting) return false;
  const record = state.media, w = ctx.canvas.width, h = ctx.canvas.height;
  if (lyricCanvas.width !== w || lyricCanvas.height !== h) { lyricCanvas.width = w; lyricCanvas.height = h; }
  lyricRenderer.frame(lyricCanvas.getContext('2d'), plan, t, { ...opt, transparent: true });
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  if (!record.video || record.el.readyState >= 2) {
    const ratio = (settings.fit === 'cover' ? Math.max : Math.min)(w / record.width, h / record.height);
    const dw = record.width * ratio, dh = record.height * ratio;
    ctx.globalAlpha = settings.opacity;
    ctx.drawImage(record.el, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  ctx.globalAlpha = 1; ctx.drawImage(lyricCanvas, 0, 0); ctx.restore();
  return true;
}
$('wbFile').addEventListener('change', event => {
  const file = event.target.files?.[0]; event.target.value = '';
  if (file) void selectFile(file);
});
$('wbClear').addEventListener('click', () => {
  release(); settings.enabled = false; rememberSettings(); status(''); refreshControls(); dirty();
});
$('wbMode').addEventListener('change', () => {
  settings.enabled = $('wbMode').value === 'combined'; state.playBlocked = false;
  rememberSettings(); status(settings.enabled && !state.media ? copy[12] : ''); sync(true); dirty();
});
$('wbFit').addEventListener('change', () => { settings.fit = $('wbFit').value === 'cover' ? 'cover' : 'contain'; rememberSettings(); dirty(); });
$('wbOpacity').addEventListener('input', () => { settings.opacity = +$('wbOpacity').value / 100; rememberSettings(); refreshControls(); dirty(); });
window.addEventListener('pagehide', () => { release(); refreshControls(); });
window.addEventListener('pageshow', () => { if (state.project && Object.hasOwn(state.project, 'workBackground') && !state.media) status(copy[12]); dirty(); });
J.workBackground = { normalize, adoptProject, sync, draw, state, resume: () => { state.playBlocked = false; sync(true); } };
})();
