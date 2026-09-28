import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises'
import { join, resolve, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Store, kinds, assert, cleanId, atomicJSON, publishable, publishRevision } from './store.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const store = new Store(root)
await store.init()
const port = Number(process.env.STUDIO_PORT || 5174)
const origin = `http://127.0.0.1:${port}`
const token = randomBytes(32).toString('hex')
const pipelineHome = resolve(process.env.STUDIO_PIPELINE_HOME || join(root, '../yazilim/berkealp_galari'))
const python = process.env.STUDIO_PYTHON || join(pipelineHome, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python')
const run = promisify(execFile)
const jobs = new Map()
let queue = Promise.resolve()
let mutation = Promise.resolve()
const serialize = fn => {
  const result = mutation.then(fn)
  mutation = result.catch(() => {})
  return result
}
async function body(req, maximum = 5 * 1024 * 1024) {
  let size = 0; const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    assert(size <= maximum, 'Dosya çok büyük (fotoğraflar en fazla 40 MB).', 413)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}
async function jsonBody(req) { try { return JSON.parse((await body(req)).toString()) } catch (e) { if (e.status) throw e; throw new Error('JSON okunamadı.') } }
function json(res, value, status = 200) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)) }
async function mediaFile(res, path, type = 'image/webp') { res.setHeader('Content-Type', type); res.end(await readFile(path)) }
async function exists(path) { try { await access(path); return true } catch { return false } }
async function state() {
  const draft = await store.draft()
  return { ...draft, published: await store.published(), history: await store.history(), jobs: [...jobs.values()],
    token, pipelineReady: await exists(python), pipelineHome }
}
function enqueue(label, action) {
  const job = { id: randomUUID(), label, status: 'queued', createdAt: new Date().toISOString() }
  jobs.set(job.id, job)
  queue = queue.then(async () => {
    job.status = 'running'
    try { job.result = await action(); job.status = 'complete' }
    catch (e) { job.status = 'error'; job.error = e.message }
  })
  return job
}
async function worker(id, payload) {
  const directory = join(store.directory, 'media', id)
  await mkdir(directory, { recursive: true })
  const request = join(directory, 'request.json')
  await atomicJSON(request, { ...payload, id, directory, assets: join(store.directory, 'assets'), models: join(pipelineHome, 'models') })
  try {
    const { stdout } = await run(python, [join(root, 'scripts/studio/image_worker.py'), request], { cwd: pipelineHome, windowsHide: true, timeout: 600000, maxBuffer: 4 * 1024 * 1024 })
    return JSON.parse(stdout.trim().split(/\r?\n/).at(-1))
  } catch (e) { throw new Error((e.stderr || e.message).slice(-1500)) }
}
async function materialize(content) {
  const result = structuredClone(content)
  const copyAsset = async name => {
    assert(/^[a-z0-9-]+\.webp$/.test(name), 'Görsel adresi geçersiz.')
    await mkdir(join(root, 'public/studio'), { recursive: true })
    await copyFile(join(store.directory, 'assets', name), join(root, 'public/studio', name))
    return `/studio/${name}`
  }
  for (const kind of kinds) for (const item of result[kind]) for (const key of ['src', 'thumbnail', 'cover']) {
    const value = item[key]
    if (!value) continue
    assert(!value.startsWith('/api/'), 'Özel dosyalar yayımlanamaz.')
    if (value.startsWith('/studio-media/')) {
      const name = value.slice('/studio-media/'.length)
      item[key] = await copyAsset(name)
    } else if (value.startsWith('/')) {
      assert(!value.includes('..') && !value.includes('\\'), 'Görsel yolu geçersiz.')
      assert(await exists(join(root, 'public', value.slice(1))), `Görsel bulunamadı: ${value}`)
    }
  }
  for (const kind of ['projects','posts']) for (const item of result[kind]) for (const key of ['body','details']) {
    if (!item[key]) continue
    assert(!item[key].includes('/api/studio/'), 'Özel görseller yazıda yayımlanamaz.')
    const matches = [...item[key].matchAll(/\/studio-media\/([a-z0-9-]+\.webp)/g)]
    for (const match of matches) item[key] = item[key].replaceAll(match[0], await copyAsset(match[1]))
  }
  return result
}
async function build() {
  try { await run(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root, windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 }) }
  catch (e) { throw new Error(`Derleme başarısız: ${(e.stderr || e.stdout || e.message).slice(-1500)}`) }
}
async function gitPush() {
  const git = async args => (await run('git', args, { cwd: root, windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 })).stdout.trim()
  const allowed = p => /^src\/data\/(photos|projects|posts)\.json$/.test(p) || p.startsWith('public/studio/')
  assert(!(await git(['diff', '--cached', '--name-only'])), 'Git indexinde başka değişiklikler var. Önce onları tamamlayın.')
  const changed = (await git(['diff', '--name-only'])).split('\n').filter(Boolean)
  assert(changed.every(allowed), 'Panel dışındaki kod değişikliklerini önce commit edin; ardından içerikleri gönderin.')
  const branch = await git(['branch', '--show-current'])
  assert(/^[a-zA-Z0-9/_-]+$/.test(branch), 'Geçerli bir Git dalı gerekli.')
  await build()
  const paths = ['src/data/photos.json', 'src/data/projects.json', 'src/data/posts.json']
  if (await exists(join(root, 'public/studio'))) paths.push('public/studio')
  await git(['add', '--', ...paths])
  if (await git(['diff', '--cached', '--name-only'])) await git(['commit', '-m', 'Publish content from local studio'])
  await git(['push', 'origin', branch])
  return { commit: await git(['rev-parse', '--short', 'HEAD']), branch }
}

const server = await createServer({
  configFile: false, root, plugins: [react(), {
    name: 'local-content-studio',
    handleHotUpdate(context) {
      // Publishing updates the public data files. Keep the editor mounted until
      // its request finishes; new preview frames fetch the latest saved draft.
      if (/\/src\/data\/(photos|projects|posts)\.json$/.test(context.file.replaceAll('\\', '/'))) return []
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, origin).pathname
        // The management service is loopback-only and rejects foreign origins,
        // cross-site reads and DNS-rebinding hostnames. No CORS is enabled.
        if (req.headers.host !== `127.0.0.1:${port}` || (req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site') {
          return json(res, { error: 'Bu panel yalnızca yerel adresinden açılabilir.' }, 403)
        }
        if (pathname === '/__studio' || pathname === '/__studio/') { req.url = '/studio.html'; return next() }
        if (!pathname.startsWith('/api/studio') && !pathname.startsWith('/studio-media/')) return next()
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        try {
          if (req.method !== 'GET') assert(req.headers.origin === origin && req.headers['x-studio-token'] === token, 'Yerel oturum doğrulanamadı.', 403)
          if (pathname.startsWith('/studio-media/')) {
            const name = pathname.slice('/studio-media/'.length)
            assert(/^[a-z0-9-]+\.webp$/.test(name), 'Geçersiz dosya.')
            return await mediaFile(res, join(store.directory, 'assets', name))
          }
          if (pathname === '/api/studio/state' && req.method === 'GET') return json(res, await state())
          if (pathname === '/api/studio/preview' && req.method === 'GET') return json(res, publishable((await store.draft()).content, { preview: true }))
          if (pathname.startsWith('/api/studio/original/') && req.method === 'GET') {
            const id = pathname.split('/').at(-1)
            assert(cleanId(id), 'Geçersiz fotoğraf.')
            return await mediaFile(res, join(store.directory, 'media', id, 'original-preview.webp'))
          }
          if (pathname === '/api/studio/draft' && req.method === 'PUT') {
            const data = await jsonBody(req)
            return json(res, await serialize(async () => {
              // Only server-created images can be placed in the photo collection.
              const current = await store.draft()
              const known = new Map(current.content.photos.map(i => [i.id, i]))
              for (const photo of data.content.photos) {
                const old = known.get(photo.id)
                assert(old && ['src','thumbnail','mediaId','original','width','height'].every(k => old[k] === photo[k]), 'Fotoğraf kaynağını değiştirmek için yüklemeyi kullanın.')
              }
              return store.save(data.content, data.revision)
            }))
          }
          if (pathname === '/api/studio/upload' && req.method === 'POST') {
            const mode = req.headers['x-upload-mode']
            assert(['raw', 'processed', 'cover'].includes(mode), 'Yükleme türü geçersiz.')
            const name = decodeURIComponent(req.headers['x-file-name'] || 'photo.png')
            assert(['.png', '.jpg', '.jpeg', '.webp'].includes(extname(name).toLowerCase()), 'JPEG, PNG veya WebP seçin.')
            assert(await exists(python), 'Python ortamı bulunamadı. STUDIO_PYTHON ayarını kontrol edin.')
            const id = randomUUID()
            const directory = join(store.directory, 'media', id)
            await mkdir(directory, { recursive: true })
            const source = join(directory, `upload${extname(name).toLowerCase()}`)
            await writeFile(source, await body(req, 40 * 1024 * 1024))
            const job = enqueue(basename(name), async () => {
              const result = await worker(id, { mode, source })
              if (mode === 'cover') return { src: result.src }
              await serialize(async () => {
                const draft = await store.draft()
                draft.content.photos.push({ id, title: basename(name, extname(name)), album: 'Camera Roll', tags: [], publication: 'draft', reviewed: false,
                  ...result, mediaId: id, original: `/api/studio/original/${id}`, labels: mode === 'raw', canReview: mode === 'raw' })
                await store.save(draft.content, draft.revision)
              })
              return { id }
            })
            return json(res, job, 202)
          }
          if (pathname === '/api/studio/review' && req.method === 'POST') {
            const data = await jsonBody(req)
            const draft = await store.draft()
            const photo = draft.content.photos.find(p => p.id === data.id)
            assert(photo?.canReview && cleanId(photo.mediaId), 'Bu fotoğrafın orijinal pipeline kaydı yok.')
            assert(Array.isArray(data.detections) && data.detections.length <= 1000 && typeof data.labels === 'boolean', 'Bölge listesi geçersiz.')
            // Queue re-renders per image; always sample its private upright original.
            const job = enqueue(`${photo.title} · yeniden işle`, async () => {
              const result = await worker(photo.mediaId, { mode: 'review', detections: data.detections, labels: data.labels })
              await serialize(async () => {
                const current = await store.draft()
                const target = current.content.photos.find(p => p.id === data.id)
                assert(target, 'Fotoğraf taslaktan kaldırılmış.')
                Object.assign(target, result, { labels: data.labels, reviewed: false })
                await store.save(current.content, current.revision)
              })
              return { id: data.id }
            })
            return json(res, job, 202)
          }
          if (pathname === '/api/studio/publish' && req.method === 'POST') {
            const data = await jsonBody(req)
            const result = await serialize(() => publishRevision(store, data.revision, materialize, build))
            return json(res, result)
          }
          if (pathname === '/api/studio/restore' && req.method === 'POST') {
            const { id, revision } = await jsonBody(req)
              return json(res, await serialize(() => store.restore(id, revision)))
          }
          if (pathname === '/api/studio/push' && req.method === 'POST') return json(res, await serialize(gitPush))
          return json(res, { error: 'İşlem bulunamadı.' }, 404)
        } catch (error) { json(res, { error: error.message }, error.status || 400) }
      })
    }
  }],
  server: { host: '127.0.0.1', port, strictPort: true, fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.studio/**'] } },
})
await server.listen()
console.log(`Studio: ${origin}/__studio`)
