import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { randomUUID } from 'node:crypto'

export const kinds = ['photos', 'projects', 'posts']
export const cleanId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,99}$/.test(value)
export function assert(condition, message, status = 400) {
  if (!condition) throw Object.assign(new Error(message), { status })
}
export async function readJSON(path) { return JSON.parse(await readFile(path, 'utf8')) }
export async function atomicJSON(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n')
  await rename(temporary, path)
}
const text = (value, max = 10000) => typeof value === 'string' && value.length <= max
export function validURL(value) { return !value || /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value) }
export function validateContent(content) {
  assert(content && kinds.every(k => Array.isArray(content[k])), 'İçerik biçimi geçersiz.')
  for (const kind of kinds) {
    assert(content[kind].length <= 5000, 'Koleksiyon çok büyük.')
    const seen = new Set()
    for (const item of content[kind]) {
      assert(cleanId(item.id) && !seen.has(item.id), 'Adresler/kimlikler benzersiz ve küçük harfli olmalı.')
      seen.add(item.id)
      assert(text(item.title, 200) && item.title.trim(), 'Başlık gerekli (en fazla 200 karakter).')
      assert(['draft', 'published'].includes(item.publication), 'Yayın durumu geçersiz.')
      for (const key of ['alt', 'caption', 'description', 'excerpt', 'location', 'album', 'status']) {
        assert(item[key] == null || text(item[key]), `${key} çok uzun veya geçersiz.`)
      }
      for (const key of ['body', 'details']) assert(item[key] == null || text(item[key], 200000), 'Yazı çok uzun.')
      for (const key of ['src', 'thumbnail', 'cover', 'url']) assert(item[key] == null || (text(item[key], 2000) && validURL(item[key])), 'Bağlantı http(s) veya yerel adres olmalı.')
      assert(item.tags == null || (Array.isArray(item.tags) && item.tags.length <= 50 && item.tags.every(t => text(t, 80))), 'En fazla 50 kısa etiket kullanın.')
      assert(!item.date || (/^\d{4}-\d{2}-\d{2}$/.test(item.date) && !Number.isNaN(Date.parse(item.date)) && new Date(item.date).toISOString().startsWith(item.date)), 'Tarih geçersiz.')
      if (item.coordinates) assert(Number.isFinite(item.coordinates.lat) && Math.abs(item.coordinates.lat) <= 90 && Number.isFinite(item.coordinates.lng) && Math.abs(item.coordinates.lng) <= 180, 'Koordinatlar geçersiz.')
      if (kind === 'photos') assert(item.src && item.thumbnail && Number.isFinite(item.width) && Number.isFinite(item.height), 'Fotoğraf dosyası eksik.')
      if (kind === 'projects') assert(Array.isArray(item.color) && item.color.length === 2 && item.color.every(c => /^#[0-9a-f]{6}$/i.test(c)), 'Proje renkleri geçersiz.')
    }
  }
  return content
}
export function publishable(content, { preview = false } = {}) {
  const result = {}
  for (const kind of kinds) result[kind] = content[kind].filter(item => item.publication === 'published').map(item => {
    if (kind === 'photos' && !preview) assert(item.reviewed === true, `“${item.title}” fotoğrafını önce inceleyip onaylayın.`)
    const { publication, reviewed, original, mediaId, detections, warnings, labels, canReview, ...publicItem } = item
    if (publicItem.showLocation === false) { delete publicItem.location; delete publicItem.coordinates }
    delete publicItem.showLocation
    return publicItem
  })
  return result
}
export function diffContent(before, after) {
  return kinds.map(kind => {
    const old = new Map(before[kind].map(i => [i.id, i]))
    const next = new Map(after[kind].map(i => [i.id, i]))
    return { kind, added: after[kind].filter(i => !old.has(i.id)).length,
      changed: after[kind].filter(i => old.has(i.id) && JSON.stringify(old.get(i.id)) !== JSON.stringify(i)).length,
      removed: before[kind].filter(i => !next.has(i.id)).length,
      reordered: before[kind].filter(i => next.has(i.id)).map(i => i.id).join() !== after[kind].filter(i => old.has(i.id)).map(i => i.id).join() }
  })
}
export class Store {
  constructor(root) { this.root = resolve(root); this.directory = join(this.root, '.studio') }
  async init() {
    for (const name of ['', 'assets', 'media', 'history', 'jobs']) await mkdir(join(this.directory, name), { recursive: true })
    try { await readFile(join(this.directory, 'draft.json')) }
    catch (error) {
      if (error.code !== 'ENOENT') throw error
      const content = await this.published()
      for (const kind of kinds) content[kind] = content[kind].map(item => ({ ...item, publication: 'published', ...(kind === 'photos' ? { reviewed: true } : {}) }))
      await atomicJSON(join(this.directory, 'draft.json'), { revision: 1, content, updatedAt: new Date().toISOString() })
    }
  }
  async published() { return Object.fromEntries(await Promise.all(kinds.map(async k => [k, await readJSON(join(this.root, 'src/data', `${k}.json`))]))) }
  async draft() { return readJSON(join(this.directory, 'draft.json')) }
  async restore(id, revision) {
    assert(cleanId(id), 'Sürüm kimliği geçersiz.')
    const current = await this.draft()
    assert(current.revision === revision, 'Taslak değişti; önce sayfayı yenileyin.', 409)
    const content = await readJSON(join(this.directory, 'history', id, 'content.json'))
    for (const kind of kinds) content[kind] = content[kind].map(item => ({ ...item,
      publication: item.publication ?? 'published',
      ...(kind === 'photos' ? { reviewed: item.reviewed ?? true } : {}) }))
    validateContent(content)
    await this.snapshot(current.content, 'Geri yükleme öncesi taslak')
    return this.save(content, revision)
  }
  async save(content, revision) {
    const previous = await this.draft()
    assert(previous.revision === revision, 'Taslak başka bir işlemde değişti. Sayfayı yenileyip tekrar deneyin.', 409)
    validateContent(content)
    const next = { revision: revision + 1, content, updatedAt: new Date().toISOString() }
    await atomicJSON(join(this.directory, 'draft.json'), next)
    return next
  }
  async history() {
    const entries = await readdir(join(this.directory, 'history'))
    return Promise.all(entries.filter(cleanId).sort().reverse().slice(0, 30).map(async id => ({ id, ...await readJSON(join(this.directory, 'history', id, 'meta.json')) })))
  }
  async snapshot(content, note) {
    const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
    await mkdir(join(this.directory, 'history', id))
    await atomicJSON(join(this.directory, 'history', id, 'content.json'), content)
    await atomicJSON(join(this.directory, 'history', id, 'meta.json'), { note, createdAt: new Date().toISOString() })
    return id
  }
  async writePublished(content) {
    for (const kind of kinds) await atomicJSON(join(this.root, 'src/data', `${kind}.json`), content[kind])
  }
}

export async function publishRevision(store, revision, prepare, build) {
  const draft = await store.draft()
  assert(revision === draft.revision, 'Taslak değişti; yayın özetini yeniden açın.', 409)
  validateContent(draft.content)
  const next = await prepare(publishable(draft.content))
  const before = await store.published()
  const historyId = await store.snapshot(before, 'Yayın öncesi sürüm')
  try { await store.writePublished(next); await build() }
  catch (error) { await store.writePublished(before); throw error }
  // Keep private review metadata, but point the saved draft at the published
  // immutable assets so the next diff does not count identical photos again.
  for (const kind of kinds) for (const item of draft.content[kind]) {
    const published = next[kind].find(p => p.id === item.id)
    if (!published) continue
    for (const key of ['src', 'thumbnail', 'cover', 'body', 'details']) if (key in published) item[key] = published[key]
  }
  await store.save(draft.content, draft.revision)
  return { historyId, changes: diffContent(before, next) }
}
