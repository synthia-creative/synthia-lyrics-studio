/* SYNTHIA completed MP4: fixed timeline frames + H.264/AAC + mp4-muxer.
   Existing lyric-only export remains in src/11_export.js. */
(() => {
'use strict';
const fail = signal => { if (signal?.aborted) throw new DOMException('キャンセルしました', 'AbortError'); };
const yieldTask = () => new Promise(resolve => setTimeout(resolve, 0));
class BlockStore {
  constructor() { this.blocks = []; this.end = 0; }
  write(data, position) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    if (position > this.end) { this.blocks.push({ position: this.end, bytes: new Uint8Array(position - this.end) }); this.end = position; }
    for (const b of this.blocks) {
      const lo = Math.max(position, b.position), hi = Math.min(position + bytes.length, b.position + b.bytes.length);
      if (hi > lo) b.bytes.set(bytes.subarray(lo - position, hi - position), lo - b.position);
    }
    if (position + bytes.length > this.end) { const offset = Math.max(0, this.end - position); this.blocks.push({ position: this.end, bytes: bytes.slice(offset) }); this.end = position + bytes.length; }
  }
  blob() { return new Blob(this.blocks.map(b => b.bytes), { type: 'video/mp4' }); }
}
function seeded(seed, fn) { const old = Math.random; Math.random = J.rng(seed); try { return fn(); } finally { Math.random = old; } }
J.completeFileName = project => ((String(project.title || 'SYNTHIA').replace(/[\\/:*?"<>|\x00-\x1f]+/g, '_').replace(/[. ]+$/g, '').slice(0, 100) || 'SYNTHIA') + '.mp4');
async function audioChunks(buffer, span, duration, muxer, signal, onProgress) {
  const sr = 48000, channels = Math.min(2, buffer.numberOfChannels), frames = Math.round(duration * sr);
  const cfg = { codec: 'mp4a.40.2', sampleRate: sr, numberOfChannels: channels, bitrate: 192000 };
  let error, chunks = 0;
  const encoder = new AudioEncoder({ output: (chunk, meta) => { try { muxer.addAudioChunk(chunk, meta); chunks++; } catch (e) { error = e; } }, error: e => { error = e; } });
  try {
    encoder.configure(cfg);
    // Bounded 20-second resampling windows; timestamps use absolute output sample indices.
    for (let offset = 0; offset < frames; offset += sr * 20) {
      fail(signal); if (error) throw error;
      const count = Math.min(sr * 20, frames - offset), offline = new OfflineAudioContext(channels, count, sr);
      const sourceTime = span.t0 + offset / sr;
      if (sourceTime < buffer.duration) { const source = offline.createBufferSource(); source.buffer = buffer; source.connect(offline.destination); source.start(0, Math.max(0, sourceTime)); source.stop(Math.max(0, Math.min(count / sr, span.dur - offset / sr))); }
      const pcm = await offline.startRendering();
      for (let n = 0; n < count; n += 4800) {
        fail(signal); if (error) throw error;
        const length = Math.min(4800, count - n), data = new Float32Array(length * channels);
        for (let c = 0; c < channels; c++) data.set(pcm.getChannelData(c).subarray(n, n + length), c * length);
        const block = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: length, numberOfChannels: channels, timestamp: Math.round((offset + n) * 1e6 / sr), data });
        try { encoder.encode(block); } finally { block.close(); }
        let waits = 0;
        while (encoder.encodeQueueSize > 8) { fail(signal); if (error) throw error; await yieldTask(); if (!document.hidden && ++waits > 30000) throw new Error('音声エンコーダーが応答しません'); }
      }
      onProgress?.(.9 + .09 * (offset + count) / frames, '楽曲をAACでエンコード中'); await yieldTask();
    }
    await encoder.flush(); if (error) throw error; if (!chunks) throw new Error('AAC音声が出力されませんでした');
  } finally { if (encoder.state !== 'closed') encoder.close(); }
}
async function encode(o, vc) {
  const { plan, project, media, range, file, signal, onProgress } = o;
  const [w, h] = J.outputSize(project), fps = plan.fps, span = J.exportSpan(plan, range);
  const total = Math.max(1, Math.ceil(span.dur * fps - 1e-8)), duration = total / fps;
  const config = J.finalBackground.normalize(o.background);
  const audio = project.includeAudio !== false ? o.audio?.buffer : null;
  const store = file ? null : new BlockStore();
  const target = file ? new Mp4Muxer.FileSystemWritableFileStreamTarget(file, { chunkSize: 8 * 1048576 }) : new Mp4Muxer.StreamTarget({ onData: (data, pos) => store.write(data, pos), chunked: true, chunkSize: 8 * 1048576 });
  const options = { target, video: { codec: 'avc', width: w, height: h, frameRate: fps }, fastStart: false, firstTimestampBehavior: 'strict' };
  if (audio) options.audio = { codec: 'aac', numberOfChannels: Math.min(2, audio.numberOfChannels), sampleRate: 48000 };
  const muxer = new Mp4Muxer.Muxer(options);
  let reader, encoder, error, returned = 0;
  const previousRes = J.glyphs.maxRes;
  try {
    fail(signal);
    reader = await J.finalBackground.BackgroundReader.create(media, config, span, fps, total, signal);
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });
    const lyrics = document.createElement('canvas'); lyrics.width = w; lyrics.height = h;
    const lyricCtx = lyrics.getContext('2d');
    const renderer = seeded(J.h(project.seed || 0, 117), () => new J.Renderer());
    J.glyphs.maxRes = h >= 1000 ? 768 : 512;
    encoder = new VideoEncoder({ output: (chunk, meta) => { try { muxer.addVideoChunk(chunk, meta); returned++; } catch (e) { error = e; } }, error: e => { error = e; } });
    encoder.configure({ ...vc.cfg, latencyMode: 'quality' });
    for (let i = 0; i < total; i++) {
      fail(signal); if (error) throw error;
      const t = span.t0 + i / fps;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      const decoded = await reader.draw(ctx, t);
      // Renderer draws motion first, then its title/HUD overlays. No preview canvas or guides.
      seeded(J.h(project.seed || 0, Math.round(t * 1e6), 118), () => renderer.frame(lyricCtx, plan, t, { transparent: true, scale: w / plan.W }));
      ctx.drawImage(lyrics, 0, 0);
      const timestamp = Math.round(i * 1e6 / fps), end = Math.round((i + 1) * 1e6 / fps);
      o.onFrame?.({ index: i, timeline: t, timestamp, decoded }, canvas);
      const frame = new VideoFrame(canvas, { timestamp, duration: end - timestamp });
      try { encoder.encode(frame, { keyFrame: i % Math.round(fps * 2) === 0 }); } finally { frame.close(); }
      let waits = 0;
      while (encoder.encodeQueueSize > 4) { fail(signal); if (error) throw error; await yieldTask(); if (!document.hidden && ++waits > 30000) throw new Error('動画エンコーダーが応答しません'); }
      if (i % 3 === 0) { onProgress?.(.9 * (i + 1) / total, `完成動画 フレーム ${i + 1}/${total}`); await yieldTask(); }
    }
    await encoder.flush(); fail(signal); if (error) throw error;
    if (returned !== total) throw new Error(`動画フレーム数が一致しません (${returned}/${total})`);
    if (audio) await audioChunks(audio, span, duration, muxer, signal, onProgress);
    fail(signal); muxer.finalize();
    if (file) await file.close();
    onProgress?.(1, '完成動画を書き出しました');
    return { blob: store?.blob() || null, width: w, height: h, fps, frames: total, duration, codec: vc.label, audio: audio ? 'aac' : null, audioWanted: !!audio, toFile: !!file };
  } finally {
    if (encoder && encoder.state !== 'closed') encoder.close();
    J.glyphs.maxRes = previousRes; await reader?.close();
  }
}
J.exportCompleteMP4 = async o => {
  // Freeze this job's inputs while the editor remains visible. No preview changes affect export.
  o = { ...o, project: structuredClone(o.project), background: J.finalBackground.normalize(o.background),
    media: o.media ? { file: o.media.file, video: o.media.video, disposed: o.media.disposed } : null,
    range: o.range ? { ...o.range } : null };
  const [w, h] = J.outputSize(o.project), fps = o.plan.fps;
  if (!o.media?.file || o.media.disposed) throw new Error('画像または動画の背景素材を選択してください');
  if (o.project.includeAudio !== false && !o.audio?.buffer && o.project.audioName) throw new Error('楽曲を読み込み直してください。完成MP4は背景動画内の音声を使用しません');
  if (o.project.includeAudio !== false && o.audio?.buffer) {
    if (typeof AudioEncoder === 'undefined' || !(await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: Math.min(2, o.audio.buffer.numberOfChannels), bitrate: 192000 })).supported) throw new Error('このブラウザではAAC音声を書き出せません。Chrome / Edgeを使用してください');
  }
  const attempts = (await J.videoAttempts(w, h, fps, J.videoBitrate(w, h, fps, o.quality || 'high'))).filter(c => c.mux === 'avc');
  if (!attempts.length) throw new Error('この解像度・fpsのH.264出力に対応していません。解像度またはfpsを下げてください');
  const tried = [];
  for (const vc of attempts) {
    fail(o.signal);
    try {
      if (o.file && tried.length) { await o.file.seek(0); await o.file.truncate(0); }
      const result = await encode(o, vc); result.tried = tried; return result;
    } catch (e) {
      fail(o.signal); tried.push(e.message || String(e));
      if (e.name === 'AbortError') throw e;
    }
  }
  throw new Error('完成MP4を書き出せませんでした: ' + [...new Set(tried)].join(' / '));
};
})();
