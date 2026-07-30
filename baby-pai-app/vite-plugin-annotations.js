import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, normalize, sep } from 'node:path'

/* Dev-only middleware so the browser can write annotations to disk.

   Without this, in-browser authoring produces a blob you have to paste
   somewhere. With it, a note you pin lands in the repo as a diff you can read
   in a PR — which is the whole point of keeping annotations in the codebase.

   Not mounted in a build. Paths are constrained to src/ and to
   *.annotations.json, so a malformed request can't write anywhere else. */
export default function annotationsPlugin({ root }) {
  const SRC = join(root, 'src')

  const safe = (rel) => {
    const abs = normalize(join(SRC, rel))
    return abs.startsWith(SRC + sep) && abs.endsWith('.annotations.json') ? abs : null
  }

  const read = (abs) => {
    if (!existsSync(abs)) return []
    try {
      const v = JSON.parse(readFileSync(abs, 'utf8'))
      return Array.isArray(v) ? v : []
    } catch { return [] }
  }

  const write = (abs, list) => {
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, JSON.stringify(list, null, 2) + '\n')
  }

  return {
    name: 'baby-pai-annotations',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__annotations', (req, res) => {
        const send = (code, body) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return send(405, { error: 'POST only' })

        let raw = ''
        req.on('data', (c) => { raw += c })
        req.on('end', () => {
          let body
          try { body = JSON.parse(raw) } catch { return send(400, { error: 'bad JSON' }) }

          const abs = safe(body.file ?? '')
          if (!abs) return send(400, { error: `refused path: ${body.file}` })

          const list = read(abs)

          if (body.action === 'delete') {
            const next = list.filter((a, i) => i !== body.index)
            if (next.length === list.length) return send(404, { error: 'no such annotation' })
            write(abs, next)
            return send(200, { ok: true, file: body.file, count: next.length })
          }

          const a = body.annotation ?? {}
          if (!a.anchor || !a.verdict || !a.note) return send(400, { error: 'anchor, verdict and note are required' })
          if (a.verdict === 'bad' && !a.instead) return send(400, { error: 'a "bad" needs an "instead"' })
          if (!a.rule) return send(400, { error: 'a rule slug is required — it is the join key' })

          list.push(a)
          write(abs, list)
          send(200, { ok: true, file: body.file, count: list.length })
        })
      })
    },
  }
}
