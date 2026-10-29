import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const manifestUrl = new URL('../package.json', import.meta.url)
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))

assert.equal(
    manifest.version,
    '0.0.55',
    'the next release after v0.0.54 uses version 0.0.55'
)
