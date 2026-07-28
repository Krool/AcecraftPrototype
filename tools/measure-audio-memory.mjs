#!/usr/bin/env node
// End-to-end memory measurement for the crash described in tools/README.md.
//
//   npm run build && node tools/measure-audio-memory.mjs
//
// Serves dist/, drives the game in Chromium, and reports the two numbers that
// actually matter:
//   1. full-track decodeAudioData calls  - must be 0 (streaming, not decoding)
//   2. Chromium process-tree RSS         - must plateau, not climb
//
// RSS rather than performance.memory / JSHeapUsedSize on purpose: decoded audio
// is native memory, so JS heap metrics never saw this bug at all.
//
// Requires playwright, which is intentionally not a project dependency:
//   npm i --no-save playwright

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT || 4173)
const BASE = '/AcecraftPrototype/'
const SECONDS = Number(process.env.SECONDS || 120)
const DIST = new URL('../dist/', import.meta.url).pathname

let chromium
try {
  ({ chromium } = await import('playwright'))
} catch {
  console.error('playwright is required:  npm i --no-save playwright')
  process.exit(1)
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain',
}

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (p.startsWith(BASE)) p = p.slice(BASE.length)
    // Contain path traversal: normalize, then refuse anything escaping DIST.
    const full = join(DIST, normalize('/' + p))
    if (!full.startsWith(DIST)) { res.writeHead(403).end(); return }
    const target = (await stat(full)).isDirectory() ? join(full, 'index.html') : full
    const body = await readFile(target)
    res.writeHead(200, { 'content-type': MIME[extname(target)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
})
await new Promise((r) => server.listen(PORT, r))
console.log(`serving dist/ at http://localhost:${PORT}${BASE}\n`)

const browser = await chromium.launch({
  args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
})
const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 } })

await ctx.addInitScript(() => {
  window.__probe = { decodes: [] }
  const orig = AudioContext.prototype.decodeAudioData
  AudioContext.prototype.decodeAudioData = function (buf, ...rest) {
    window.__probe.decodes.push(buf?.byteLength || 0)
    return orig.call(this, buf, ...rest)
  }
})

const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('crash', () => errors.push('renderer crashed'))

// Sum RSS across the whole Chromium tree (browser + renderer + gpu).
const rssMB = () => Number(
  execSync("ps -eo rss=,cmd= | grep '[c]hrome-linux/chrome' | awk '{s+=$1} END {print s+0}'").toString().trim()
) / 1024

await page.goto(`http://localhost:${PORT}${BASE}index.html`, { waitUntil: 'networkidle' })
const before = rssMB()
await page.click('.start-button')

const samples = []
for (let t = 10; t <= SECONDS; t += 10) {
  await page.waitForTimeout(10000)
  const rss = rssMB()
  samples.push(rss)
  console.log(`t=${String(t).padStart(3)}s  RSS=${rss.toFixed(0).padStart(5)}MB  (+${(rss - before).toFixed(0)}MB since load)`)
}

const decodes = await page.evaluate(() => window.__probe.decodes.filter((b) => b > 1_000_000).length)
const growth = samples[samples.length - 1] - samples[0]

console.log('\nRESULT')
console.log(`  full-track decodeAudioData calls : ${decodes} ${decodes === 0 ? 'OK' : 'FAIL - music is being decoded, not streamed'}`)
console.log(`  RSS growth over the run          : ${growth.toFixed(0)}MB ${growth < 150 ? 'OK (plateaued)' : 'FAIL - still climbing'}`)
console.log(`  page errors                      : ${errors.length ? errors.slice(0, 3).join(' | ') : 'none'}`)
console.log('\n  for reference: before the fix this was 1 decode per run and +1843MB over 120s')

await browser.close()
server.close()
process.exit(decodes === 0 && growth < 150 ? 0 : 1)
