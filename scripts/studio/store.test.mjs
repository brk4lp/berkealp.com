import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Store, atomicJSON, publishable, validateContent, publishRevision, diffContent } from './store.mjs'

const content = () => ({ photos: [{ id: 'one', title: 'Photo', src:'/photos/one.webp', thumbnail:'/photos/one-thumb.webp', width:100, height:200, location:'İzmir' }], projects:[], posts:[] })
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-studio-test-'))
  t.after(() => rm(root, { recursive:true, force:true }))
  await mkdir(join(root, 'src/data'), { recursive:true })
  for (const [key,value] of Object.entries(content())) await atomicJSON(join(root, 'src/data', `${key}.json`), value)
  const store = new Store(root); await store.init(); return store
}
test('draft edits persist without changing published files and reject stale revisions', async t => {
  const store = await fixture(t)
  const draft = await store.draft()
  draft.content.photos[0].title = 'Taslak başlık'
  await store.save(draft.content, draft.revision)
  assert.equal((await store.draft()).content.photos[0].title, 'Taslak başlık')
  assert.deepEqual(await store.published(), content())
  await assert.rejects(() => store.save(draft.content, draft.revision), {status:409})
})
test('publishing strips private fields, hides location, and excludes drafts', async t => {
  const store = await fixture(t)
  const { content: draft } = await store.draft()
  Object.assign(draft.photos[0], { original:'/api/studio/original/one', mediaId:'one', detections:[{}], warnings:[{}], labels:true, canReview:true, coordinates:{lat:38,lng:27}, showLocation:false })
  draft.posts.push({id:'draft',title:'Secret draft',publication:'draft',body:'Unpublished'})
  const output = publishable(draft)
  assert.deepEqual(Object.keys(output.photos[0]).sort(), ['height','id','src','thumbnail','title','width'])
  assert.deepEqual(output.posts, [])
})
test('unreviewed photos block publication but can be previewed', async t => {
  const store = await fixture(t)
  const draft = (await store.draft()).content
  draft.photos[0].reviewed = false
  assert.throws(() => publishable(draft), /inceleyip/)
  assert.equal(publishable(draft, {preview:true}).photos.length, 1)
  draft.photos[0].publication = 'draft'
  assert.equal(publishable(draft).photos.length, 0)
})
test('failed build restores every published collection', async t => {
  const store = await fixture(t)
  const draft = await store.draft(); draft.content.photos[0].title = 'New'
  await store.save(draft.content, draft.revision)
  await assert.rejects(() => publishRevision(store, 2, async c => c, async () => {throw new Error('Build failed')}), /Build failed/)
  assert.deepEqual(await store.published(), content())
  assert.equal((await store.draft()).revision, 2)
  assert.equal((await store.history()).length, 1)
})
test('successful publish snapshots old content and normalizes staged image URLs', async t => {
  const store = await fixture(t)
  const draft = await store.draft()
  draft.content.photos[0].src = '/studio-media/new.webp'
  await store.save(draft.content, 1)
  let built = false
  const result = await publishRevision(store, 2, async c => { c.photos[0].src='/studio/new.webp';return c }, async () => { built=true })
  assert.equal(built, true)
  assert.equal((await store.published()).photos[0].src, '/studio/new.webp')
  assert.equal((await store.draft()).content.photos[0].src, '/studio/new.webp')
  assert.equal((await store.draft()).content.photos[0].reviewed, true)
  assert.equal(result.changes[0].changed, 1)
  await assert.rejects(() => publishRevision(store, 2, async c => c, async () => {}), {status:409})
})
test('duplicate IDs, invalid URLs, impossible dates and coordinates are rejected', async t => {
  const store = await fixture(t)
  for (const patch of [{src:'javascript:alert(1)'},{date:'2026-02-31'},{coordinates:{lat:91,lng:0}},{tags:'not-an-array'}]) {
    const draft=structuredClone((await store.draft()).content)
    Object.assign(draft.photos[0],patch)
    assert.throws(()=>validateContent(draft))
  }
  const draft=(await store.draft()).content
  draft.photos.push({...draft.photos[0]})
  assert.throws(()=>validateContent(draft), /benzersiz/)
})
test('change summary includes removals and ordering', () => {
  const before=content();before.photos.push({...before.photos[0],id:'two'})
  const after=structuredClone(before);after.photos.reverse()
  assert.equal(diffContent(before,after)[0].reordered,true)
  after.photos.pop()
  assert.equal(diffContent(before,after)[0].removed,1)
})

test('history restore preserves unpublished and unreviewed items and backs up the current draft', async t => {
  const store = await fixture(t)
  const saved = (await store.draft()).content
  Object.assign(saved.photos[0], {publication:'draft',reviewed:false,title:'Private draft'})
  const id = await store.snapshot(saved, 'Draft backup')
  const restored = await store.restore(id, 1)
  assert.equal(restored.content.photos[0].publication, 'draft')
  assert.equal(restored.content.photos[0].reviewed, false)
  assert.equal((await store.history()).length, 2)
  assert.deepEqual(await store.published(), content())
  await assert.rejects(() => store.restore(id, 1), {status:409})
  assert.equal((await store.history()).length, 2)
})
