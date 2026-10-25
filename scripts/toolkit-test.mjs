import puppeteer from 'puppeteer-core'
const base = process.env.BASE || 'http://localhost:8799'
const shots = process.env.SHOTS || '/tmp/shots'
import fs from 'fs'; fs.mkdirSync(shots, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
const page = await b.newPage()
await page.setViewport({ width: 1280, height: 900 })
const log = []
const ok = (n, c) => { log.push(n); console.log(c ? 'PASS' : 'FAIL', n) }
const errs = []
page.on('pageerror', (e) => errs.push(String(e)))
const txt = () => page.evaluate(() => document.body.innerText)
const snap = (n) => page.screenshot({ path: `${shots}/${n}.png`, fullPage: true })
const go = async (p) => { await page.goto(base + p, { waitUntil: 'networkidle0', timeout: 30000 }) }
const click = (t, sel = 'button, a') => page.evaluate((t, sel) => { const e = [...document.querySelectorAll(sel)].find((x) => x.textContent.includes(t)); if (e) { e.click(); return true } return false }, t, sel)
const type = async (sel, v) => { await page.focus(sel); await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control'); await page.keyboard.press('Backspace'); await page.type(sel, v) }
const agree = async () => { const c = await page.$('.tk-consent input'); if (c) await c.click() }
const waitText = (t, ms = 100000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: ms }, t)

await go('/toolkit')
ok('hub renders', (await txt()).includes('Teacher and parent toolkit'))
ok('hub lists tools', (await page.$$('.tk-tool')).length >= 20)
await snap('hub')
// quick create parse
await type('input[aria-label="Quick create prompt"]', 'Grade 4 + 10 MCQs on Water Cycle')
await click('Set it up')
await page.waitForSelector('.tk-form')
const prefill = await page.evaluate(() => ({ topic: document.querySelector('input[placeholder^="e.g. Fractions"]')?.value, count: document.querySelector('input[type=number]')?.value, grade: [...document.querySelectorAll('select')][1]?.value }))
ok('quick create prefills worksheet', prefill.topic === 'Water Cycle' && prefill.count === '10' && prefill.grade === '4')

// library
await go('/toolkit/library')
ok('library lists', (await page.$$('.tk-tool')).length === 6)
await click('Grade 3: Nouns')
await page.waitForSelector('.tk-sheet')
ok('library worksheet has answer key', (await txt()).includes('Answer key: Grade 3: Nouns'))
ok('match question has two columns', (await page.$$('.tk-match')).length === 1)
await snap('library-sheet')
await page.pdf({ path: `${shots}/library.pdf`, format: 'A4', printBackground: true })

// drills
await go('/toolkit/drills')
await click('Make a new sheet')
ok('drill sheet has 20 questions', (await page.$$('.tk-qs > li')).length === 20)
await snap('drills')

// maths local
await go('/toolkit/maths')
await type('textarea', '(12 + 8) / 4 * 3')
await agree(); await click('Create')
await waitText('Answer:', 5000)
let t = await txt()
ok('math local arithmetic = 15', /Answer:\s*15/.test(t) && t.includes('device'))
await type('textarea', '2x + 5 = 17')
await click('Make another')
await waitText('x = 6', 5000)
ok('math local equation x = 6', (await txt()).includes('x = 6'))
await type('textarea', '20% of 150')
await click('Make another')
await page.waitForFunction(() => /Answer:\s*30/.test(document.body.innerText), { timeout: 5000 })
ok('math percent 30', true)
await snap('maths')

// live AI: worksheet
await go('/toolkit/worksheet')
await type('input[placeholder^="e.g. Fractions"]', 'Water cycle')
await agree(); await click('Create')
await page.waitForSelector('.tk-sheet', { timeout: 110000 })
t = await txt()
ok('worksheet generated with key', t.includes('Answer key') && (await page.$$('.tk-qs > li')).length >= 8)
await click('Edit questions'); ok('edit mode', (await page.$$('.tk-edit')).length > 0); await click('Done editing')
await snap('worksheet-ai')
await page.pdf({ path: `${shots}/worksheet.pdf`, format: 'A4' })

// quiz
await go('/toolkit/quiz')
await type('input[placeholder^="e.g. Fractions"]', 'Solar system')
await agree(); await click('Create')
await page.waitForSelector('.tk-quizq', { timeout: 110000 })
await page.evaluate(() => document.querySelectorAll('.tk-quizq').forEach((q) => q.querySelector('.tk-choice').click()))
await new Promise(r=>setTimeout(r,500)); console.log('clicked', await click('Check answers')); await snap('quiz-pre')
await waitText('Score:', 3000)
ok('quiz scores', true)
await snap('quiz')

// mind map, concept map
for (const [id, label, sel] of [['mindmap', 'Photosynthesis', 'svg[aria-label^="Mind map"]'], ['conceptmap', 'Photosynthesis', 'svg[aria-label^="Concept map"]']]) {
  await go('/toolkit/' + id)
  await type('input[placeholder^="e.g."]', label)
  await agree(); await click('Create')
  await page.waitForSelector(sel, { timeout: 110000 })
  ok(id + ' renders svg', (await page.$$(sel + ' text')).length > 5)
  await snap(id)
}
// vocab + games
await go('/toolkit/vocab')
await type('input[placeholder^="e.g. weather"]', 'weather')
await agree(); await click('Create')
await page.waitForSelector('.tk-flash', { timeout: 110000 })
await click('Memory match'); await page.waitForSelector('.tk-tile')
ok('memory game tiles', (await page.$$('.tk-tile')).length >= 12)
await snap('vocab-memory')
await click('Word scramble'); await page.waitForSelector('.tk-scr', { timeout: 3000 }).catch(() => {})
ok('scramble shows', (await page.$('.tk-scr')) !== null)
// doc tool
await go('/toolkit/lesson')
await type('input[placeholder^="e.g. Fractions"]', 'Fractions')
await agree(); await click('Create')
await page.waitForSelector('.tk-sec', { timeout: 110000 })
ok('lesson plan sections', (await page.$$('.tk-sec')).length >= 5)
// rubric
await go('/toolkit/rubric')
await type('input[placeholder^="e.g. Science project"]', 'Science project on plants')
await agree(); await click('Create'); await page.waitForSelector('.tk-table', { timeout: 110000 }); ok('rubric table', true)

// consent gate: Create disabled until checked
await go('/toolkit/worksheet')
await type('input[placeholder^="e.g. Fractions"]', 'Plants')
ok('create disabled before consent', await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Create')).disabled))
// Hindi worksheet
await page.select('select >> nth=0', 'CBSE').catch(() => {})
const sels = await page.$$('select')
for (const sEl of sels) { const opts = await sEl.evaluate((e) => [...e.options].map((o) => o.value)); if (opts.includes('Hindi') && opts.includes('Gujarati')) await sEl.select('Hindi') }
await agree(); await click('Create')
await page.waitForSelector('.tk-sheet', { timeout: 110000 })
ok('hindi worksheet has Devanagari', /[\u0900-\u097F]/.test(await txt()))
await snap('hindi')
// synthetic image upload (generated PNG with text)
const png = 'iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAIAAACsOWLGAAACyklEQVR4nO3cMUsycRzA8etRGlNDwq3BwraCaEjCu3wBQRDUcig0hBAtbUEvwBqCRAh8CyJy0dQSDtlLsBKHhiIHMYhAkvs/QyBiD3fnw/Oj4+H7mbzrf7//BV/uwMEJpZQG/Gu/fvoG8H8iLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIggLIhwCcu27YODg9XV1VQq1Wq1vEzc2dkxDMMwjGQyGY1GvVzS7Xaz2WwoFPo6/Pj42N7eNgxjeXn56urKywT4jnJULBaPjo6UUpVKZXNz03nxiFKpdHx87GXl2tra+fl5KBT6Oszn86enp0qp5+fn2dnZsTaFT7iElUwmHx8flVK9Xi+fz39fMKhhhG3bS0tLr6+vXm7i5eVleFSn0+n1ekqp6+vrubk5LxPgN0Hn59nDw4NlWZZlRSKRs7Mz7w/Cy8vLlZWVmZmZwZn7+/u9vb3B4c3NzeBzLBYbvjYSiWiaZppmpVKxLMv7pvAR5+6mpqbK5bJSqlwup9Pp4T/lcjld1wOBgK7ruVxu5MJUKtVoNMZq/PvDr1qtmqY51hD4hEtY8/Pz/X5fKdXv96PR6PcFf3wV3t3dbWxsjJxsNBr6EIdR+/v7n5+fX5tOT0+7/QvwI5dXYTqdrtVq6+vrtVptcXHR41Pw5OTk8PBw5GQikRh+/Tl4e3urVqtbW1u3t7eJRMLjpvCVCeX4oyDtdnt3d/f9/T0YDF5cXMTjcdeJzWbTNM16vT7urYTD4W63q2na09NTJpOxbXtycrJQKCwsLIw7Cj/OJSzg7/DNO0QQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkQQFkT8Bhr6Y/k99w1JAAAAAElFTkSuQmCC'
fs.writeFileSync('/tmp/fixture.png', Buffer.from(png, 'base64'))
await go('/toolkit/grader')
await type('textarea', 'What is 6 + 7?')
const inputs = await page.$$('textarea')
await inputs[2].type('The student wrote that the answer is 13.')
const file = await page.$('input[type=file]')
await file.uploadFile('/tmp/fixture.png')
await page.waitForFunction(() => document.body.innerText.includes('Attached: fixture.png'), { timeout: 5000 })
await agree(); await click('Create')
await page.waitForSelector('.tk-title', { timeout: 110000 }).catch(()=>{})
await page.waitForFunction(() => document.body.innerText.includes('Suggested mark') || document.querySelector('.tk-err'), { timeout: 110000 })
ok('grader with image upload returns mark', (await txt()).includes('Suggested mark'))
await snap('grader-upload')
// chat
await go('/toolkit/homework')
await type('textarea', 'What is 7 x 8? Please give me a hint.')
await agree(); await click('Send')
await page.waitForSelector('.tk-msg.model', { timeout: 100000 })
await page.waitForFunction(() => ![...document.querySelectorAll('.tk-msg.model')].some((m) => m.textContent.includes('Thinking')), { timeout: 100000 })
ok('homework chat replies', (await page.$$('.tk-msg.model')).length === 1)
await snap('chat')
// mobile
await page.setViewport({ width: 390, height: 844, isMobile: true })
await go('/toolkit'); await snap('mobile-hub')
ok('mobile no horizontal overflow hub', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
await go('/toolkit/library'); await click('Grade 3: Nouns'); await page.waitForSelector('.tk-sheet'); await snap('mobile-sheet')
ok('mobile no horizontal overflow sheet', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
ok('no page errors', errs.length === 0)
console.log(log.join('\n')); console.log(errs.join('\n'))
await b.close()
