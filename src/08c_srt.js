/* SYNTHIA SRT import adapter. Existing LRC and planner behaviour remain the default. */
(() => {
'use strict';
J.parseSrt = raw => {
  const en = document.documentElement.lang !== 'ja';
  const fail = n => { throw new Error(en ? `Invalid or overlapping SRT cue ${n}. Use sequential, non-overlapping cues.` : `SRTの${n}番目の字幕が不正、または重複しています。時刻順で重ならない字幕を使用してください。`); };
  const text = String(raw).replace(/^\ufeff/, '').replace(/\r\n?/g, '\n').trim();
  if (!text) fail(1);
  const cues = [];
  const stamp = token => {
    const m = token.match(/^(\d+):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/);
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +(m[4].padEnd(3, '0')) / 1000 : NaN;
  };
  for (const block of text.split(/\n[ \t]*\n+/)) {
    const rows = block.split('\n');
    if (/^\d+$/.test(rows[0].trim())) rows.shift();
    const m = rows.shift()?.trim().match(/^(\S+)\s*-->\s*(\S+)$/);
    const n = cues.length + 1;
    if (!m) fail(n);
    const start = stamp(m[1]), end = stamp(m[2]);
    // SRT line breaks become spaces within a single lyric phrase. Formatting tags are not executed.
    const caption = rows.join(' ').replace(/<\/?(?:b|i|u|font)(?:\s[^>]*)?>/gi, '').trim();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !caption || (cues.length && (start < cues.at(-1).end || start - cues.at(-1).start < 0.05))) fail(n);
    cues.push({ start, end, text: caption });
  }
  const tag = t => { const ms = Math.round(t * 1000); return `[${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}]`; };
  return { lyrics: cues.map(c => tag(c.start) + c.text).join('\n'), ends: Object.fromEntries(cues.map((c, i) => [i, c.end])), count: cues.length };
};
})();
