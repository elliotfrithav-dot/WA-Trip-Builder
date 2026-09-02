import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

// Minimal from-scratch PNG encoder (no deps) — draws a solid dark-teal
// square with a simple cream mountain/wave glyph, for placeholder app icons.
// Replace these with real branded icons before shipping.

function crc32(buf) {
  let c
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c
    }
    return t
  })())
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function makeIcon(size) {
  const bg = [15, 45, 43] // #0f2d2b deep teal
  const fg = [244, 241, 233] // #f4f1e9 cream

  const px = (x, y) => {
    // simple two-peak mountain silhouette + sun dot, centered
    const cx = size / 2
    const cy = size * 0.58
    const w = size * 0.62
    const h = size * 0.34
    const left = cx - w / 2
    const right = cx + w / 2

    // sun
    const sunCx = cx + size * 0.14
    const sunCy = size * 0.28
    const sunR = size * 0.075
    if ((x - sunCx) ** 2 + (y - sunCy) ** 2 <= sunR * sunR) return fg

    if (y < cy - h || y > cy || x < left || x > right) return bg
    const t = (x - left) / w // 0..1 across the range
    // two triangular peaks
    const peak1 = 1 - Math.abs(t - 0.28) / 0.28
    const peak2 = 1 - Math.abs(t - 0.75) / 0.4
    const ridge = Math.max(peak1, peak2, 0)
    const surfaceY = cy - ridge * h
    return y >= surfaceY ? fg : bg
  }

  const raw = Buffer.alloc((size * 4 + 1) * size)
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0 // filter type: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = px(x, y)
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
      raw[offset++] = 255
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
for (const size of [192, 512, 180]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`
  writeFileSync(`public/icons/${name}`, makeIcon(size))
  console.log(`wrote public/icons/${name}`)
}
