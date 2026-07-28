#!/usr/bin/env node
// Guards the fix for the crash where the game exhausted a phone tab's memory
// budget and the browser reloaded or killed the page mid-run.
//
// Background music must STREAM, not decode. Decoded audio costs
//   duration * sampleRate * channels * 4 bytes
// which has nothing to do with the mp3 bitrate, so these 3-7 minute 44.1kHz
// stereo tracks cost 54-152MB each (~1.8GB for all 20) once decoded. Routing
// music through Phaser's loader calls Web Audio decodeAudioData and pays that
// cost; a media element decodes a small rolling window and pays a few MB.
//
// This is a cheap source-level check for the specific regression. For the real
// end-to-end measurement, run tools/measure-audio-memory.mjs.

import { readFileSync } from 'node:fs'

const FILE = 'src/scenes/GameScene.ts'
const src = readFileSync(new URL(`../${FILE}`, import.meta.url), 'utf8')

const failures = []

const banned = [
  {
    pattern: /this\.load\.audio\s*\(/,
    label: 'this.load.audio(',
    why:
      "Phaser's loader decodes audio into memory via decodeAudioData. Music must\n" +
      '     be streamed with a media element instead - see GameScene.startMusic().',
  },
  {
    pattern: /lazyLoadRemainingTracks/,
    label: 'lazyLoadRemainingTracks',
    why:
      'This background-loaded all 20 tracks and never released them (~1.8GB).\n' +
      '     It was removed deliberately; do not reintroduce it.',
  },
  {
    pattern: /this\.sound\.add\s*\(\s*[`'"]?bgm/,
    label: 'this.sound.add(bgm...)',
    why:
      "Adding a bgm key to Phaser's sound manager implies it was decoded into\n" +
      '     the audio cache. Music should not go through Phaser audio at all.',
  },
]

for (const { pattern, label, why } of banned) {
  const line = src.split('\n').findIndex((l) => pattern.test(l))
  if (line !== -1) {
    failures.push(`  ${FILE}:${line + 1}  reintroduces \`${label}\`\n     ${why}`)
  }
}

// Positive assertion: the streaming path must still be present, so that
// deleting it doesn't silently pass by virtue of nothing banned being found.
if (!/new Audio\s*\(/.test(src)) {
  failures.push(
    `  ${FILE}  no media element found - the streaming music path appears to be gone.\n` +
      '     Music must be played via a streaming media element.'
  )
}

if (failures.length) {
  console.error('\nAudio memory guard FAILED:\n')
  console.error(failures.join('\n\n'))
  console.error(
    '\nThis check exists because decoded music once grew unbounded to ~2.2GB in\n' +
      '120 seconds, which crashed the page. See tools/measure-audio-memory.mjs.\n'
  )
  process.exit(1)
}

console.log('Audio memory guard passed: background music streams rather than decoding.')
