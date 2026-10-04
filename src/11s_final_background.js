/* SYNTHIA background composition, independently implemented.
   Mediabunny 1.61.1 is used unmodified under MPL-2.0; see THIRD_PARTY_NOTICES.md. */
(() => {
'use strict';
const number = (v, d, lo, hi) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d;
const normalize = v => ({
  enabled: v?.enabled === true, fit: v?.fit === 'contain' ? 'contain' : 'cover',
  opacity: number(v?.opacity, 1, 0, 1), scale: number(v?.scale, 1, .1, 10),
  x: number(v?.x, 0, -2, 2), y: number(v?.y, 0, -2, 2),
  mediaStart: number(v?.mediaStart, 0, 0, 86400), timelineStart: number(v?.timelineStart, 0, 0, 86400),
  endMode: ['hold', 'loop', 'black'].includes(v?.endMode) ? v.endMode : 'hold',
});
function timeAt(t, config, duration = Infinity) {
  if (t < config.timelineStart) return null;
  const elapsed = t - config.timelineStart, start = config.mediaStart;
  if (!Number.isFinite(duration)) return elapsed + start;
  if (start >= duration) return config.endMode === 'hold' ? Infinity : null;
  if (config.endMode === 'loop') return start + (elapsed % (duration - start));
  const target = start + elapsed;
  return target < duration ? target : config.endMode === 'hold' ? Infinity : null;
}
function paint(ctx, source, config) {
  if (!source) return;
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const sw = source.videoWidth || source.naturalWidth || source.width, sh = source.videoHeight || source.naturalHeight || source.height;
  const ratio = (config.fit === 'cover' ? Math.max : Math.min)(w / sw, h / sh) * config.scale;
  const dw = sw * ratio, dh = sh * ratio;
  ctx.save(); ctx.globalAlpha = config.opacity;
  ctx.drawImage(source, (w - dw) / 2 + config.x * w, (h - dh) / 2 + config.y * h, dw, dh);
  ctx.restore();
}
let library;
async function getLibrary() {
  // Local vendored module; media bytes never go to a remote service.
  if (!library) {
    const prefix = document.documentElement.lang === 'ja' ? './' : '../';
    library = import(new URL(prefix + 'vendor/mediabunny.min.mjs', location.href).href).catch(e => { library = null; throw e; });
  }
  return library;
}
const cancelled = () => new DOMException('キャンセルしました', 'AbortError');
class BackgroundReader {
  constructor(signal) { this.signal = signal; this.abort = () => this.dispose(); }
  dispose() { if (!this.disposed) { this.disposed = true; this.input?.dispose(); } }
  async wait(promise) {
    let timer, abort;
    try {
      if (this.signal?.aborted) throw cancelled();
      return await Promise.race([promise, new Promise((_, reject) => {
        abort = () => reject(cancelled()); this.signal?.addEventListener('abort', abort, { once: true });
        timer = setTimeout(() => { this.dispose(); reject(new Error('背景動画のデコードがタイムアウトしました')); }, 30000);
      })]);
    } finally { clearTimeout(timer); this.signal?.removeEventListener('abort', abort); }
  }
  static async create(media, config, span, fps, total, signal) {
    const r = new BackgroundReader(signal); r.media = media; r.config = config;
    try {
      if (!media?.file || media.disposed) throw new Error('背景素材を選択し直してください');
      if (!media.video) {
        // A separate bitmap survives preview changes and blob URL release.
        r.image = await r.wait(createImageBitmap(media.file)); return r;
      }
      if (typeof VideoDecoder === 'undefined') throw new Error('動画背景の出力にはChrome / EdgeのVideoDecoderが必要です');
      const MB = await r.wait(getLibrary());
      r.input = new MB.Input({ source: new MB.BlobSource(media.file), formats: MB.ALL_FORMATS });
      signal?.addEventListener('abort', r.abort, { once: true });
      const track = await r.wait(r.input.getPrimaryVideoTrack());
      if (!track || !await r.wait(track.canDecode())) throw new Error('背景動画の映像コーデックをデコードできません');
      const last = await r.wait(new MB.EncodedPacketSink(track).getPacket(Infinity, { metadataOnly: true }));
      r.duration = await r.wait(track.computeDuration());
      if (!last || !Number.isFinite(last.timestamp) || !Number.isFinite(r.duration) || r.duration <= 0) throw new Error('背景動画の長さを取得できません');
      r.lastTimestamp = last.timestamp;
      function* timestamps() {
        for (let i = 0; i < total; i++) {
          const target = timeAt(span.t0 + i / fps, config, r.duration);
          if (target !== null) yield target === Infinity ? r.lastTimestamp : target;
        }
      }
      r.iterator = new MB.CanvasSink(track, { poolSize: 2, alpha: true }).canvasesAtTimestamps(timestamps());
      return r;
    } catch (e) { await r.close(); throw e; }
  }
  async draw(ctx, t) {
    if (this.signal?.aborted) throw cancelled();
    if (this.image) { if (timeAt(t, this.config) !== null) paint(ctx, this.image, this.config); return null; }
    const target = timeAt(t, this.config, this.duration);
    if (target === null) return null;
    const result = await this.wait(this.iterator.next());
    if (result.done) throw new Error('背景動画のフレームが不足しています');
    if (result.value) paint(ctx, result.value.canvas, this.config);
    return result.value ? { requested: target === Infinity ? this.lastTimestamp : target, timestamp: result.value.timestamp, duration: result.value.duration } : null;
  }
  async close() {
    this.signal?.removeEventListener('abort', this.abort); this.dispose(); this.image?.close();
    if (this.iterator) await Promise.allSettled([this.iterator.return()]);
  }
}
async function probeVideo(file, signal) {
  const reader = new BackgroundReader(signal);
  try {
    const MB = await reader.wait(getLibrary());
    reader.input = new MB.Input({ source: new MB.BlobSource(file), formats: MB.ALL_FORMATS });
    signal?.addEventListener('abort', reader.abort, { once: true });
    const track = await reader.wait(reader.input.getPrimaryVideoTrack());
    if (!track) throw new Error('映像トラックがありません');
    const duration = await reader.wait(track.computeDuration());
    const firstTimestamp = await reader.wait(track.getFirstTimestamp());
    const last = await reader.wait(new MB.EncodedPacketSink(track).getPacket(Infinity, { metadataOnly: true }));
    if (!Number.isFinite(duration) || duration <= 0 || !last) throw new Error('映像時刻を取得できません');
    return { duration, firstTimestamp, lastTimestamp: last.timestamp };
  } finally { await reader.close(); }
}
J.finalBackground = { normalize, timeAt, paint, BackgroundReader, probeVideo };
})();
