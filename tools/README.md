# tools

Diagnostics for the memory crash that caused the game to reload itself mid-run
and eventually kill the browser tab.

## The bug, for context

`GameScene` loaded the current music track through Phaser's loader and then
background-loaded the other 19, holding every one in the audio cache.

Decoded audio costs `duration * sampleRate * channels * 4 bytes` and has nothing
to do with the mp3 bitrate, so a 9.8MB download became 152MB of RAM:

| on disk | if all decoded and held |
| --- | --- |
| 116MB of mp3 | ~1790MB |

Measured Chromium process-tree RSS over a single 120s run:

| | growth over the run |
| --- | --- |
| before the fix | **+2202MB**, still climbing (~18MB/sec) |
| decoding one track at a time | +308MB, flat |
| streaming (current) | +232MB, flat |

A phone tab's budget is gone in roughly the first 15 seconds at the original
rate, which is exactly when players reported the game restarting.

The fix is that music **streams** through a media element instead of being
decoded. There is deliberately no device detection: `navigator.deviceMemory` is
Chromium-only and absent on iOS Safari (the platform most likely to crash), and
`performance.memory` reports the JS heap, which never sees decoded audio at all.

## `check-audio-streaming.mjs`

Cheap source-level guard against the specific regression. Runs in CI via
`npm run check:audio`; no browser or dependencies needed.

## `measure-audio-memory.mjs`

The real end-to-end measurement. Serves `dist/`, drives the game in Chromium,
and asserts that no full track is decoded and that RSS plateaus.

```sh
npm run build
npm i --no-save playwright     # intentionally not a project dependency
node tools/measure-audio-memory.mjs
```

Exits non-zero if music is being decoded or memory is still climbing. Not wired
into CI because it needs a browser download; run it when touching audio.
