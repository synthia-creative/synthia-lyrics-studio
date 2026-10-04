# Third-party notices

## mp4-muxer 5.2.2 (bundled)

`vendor/mp4-muxer.min.js` is embedded in `index.html` and is used to write MP4 files.
Source: https://github.com/Vanilagy/mp4-muxer — licensed under the MIT License:

```
MIT License

Copyright (c) 2023 Vanilagy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fonts (not bundled)

The web app loads the following typefaces at runtime from Google Fonts (https://fonts.google.com/); they are not
included in this repository. They are distributed by their authors under the SIL Open Font License 1.1:
Noto Sans JP, Noto Serif JP, Dela Gothic One, Zen Kaku Gothic New, Zen Old Mincho, Kaisei Tokumin,
M PLUS Rounded 1c, Mochiy Pop One, DotGothic16, Yuji Syuku, IBM Plex Mono, IBM Plex Sans JP.

## Mediabunny 1.61.1 (unmodified bundled module)

Copyright (c) 2026-present, Vanilagy and contributors. Licensed under Mozilla Public License 2.0 (MPL-2.0).

The completed-video exporter loads `vendor/mediabunny.min.mjs` locally to decode background video by presentation timestamps. The module is the unmodified npm 1.61.1 bundle. It is a separate MPL-covered file; SYNTHIA additions are separate files under the existing MIT license.

A full license copy is provided at [vendor/LICENSE.mediabunny.txt](vendor/LICENSE.mediabunny.txt). The complete corresponding source package, including TypeScript sources, shared sources, license and package metadata, is available at [vendor/mediabunny-1.61.1-source.tar.gz](vendor/mediabunny-1.61.1-source.tar.gz) without charge. It is also available from https://registry.npmjs.org/mediabunny/-/mediabunny-1.61.1.tgz and https://github.com/Vanilagy/mediabunny/tree/v1.61.1 . Source form remains licensed under MPL-2.0. No Mediabunny source or bundle changes were made.

No code was transplanted from JIZURA Layer Studio. Its timestamp-reader architecture was consulted; SYNTHIA implementation is independent. Existing JIZURA copyright and MIT license remain unchanged.
