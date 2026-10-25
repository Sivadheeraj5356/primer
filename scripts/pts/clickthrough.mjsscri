import puppeteer from 'puppeteer-core'
const base = 'http://localhost:4184/'
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,900'] })
const page = await b.newPage()
await page.setViewport({ width: 1280, height: 900 })
const log = []
const ok = (name, cond) => log.push(`${cond ? 'PASS' : 'FAIL'} ${name}`)
const clickLink = (text) => page.evaluate((t) => {
  const a = [...document.querySelectorAll('a')].find(x => x.textContent.includes(t))
  if (a) { a.click(); return true } return false
}, text)

// Landing page
await page.goto(base, { waitUntil: 'networkidle0', timeout: 20000 })
ok('landing renders hero', await page.$('.lp-hero') !== null)
ok('landing shows product peek', await page.$('.lp-peek img') !== null)
ok('landing has no learner state UI', await page.evaluate(() => !document.body.innerText.includes('Learning as')))
ok('landing has public header, not app chrome', await page.evaluate(() => {
  const t = document.querySelector('.landing-header')?.innerText || ''
  return !t.includes('Learning as') && !t.includes('For parents') && t.includes('Primer')
}))
ok('landing CTA present', await clickLink('Open the app'))
await new Promise(r => setTimeout(r, 1200))
ok('app route reached', page.url().endsWith('/app'))

// Learning home at /app
ok('pathway cards render', (await page.$$('.sb-path')).length === 3)
await page.evaluate(() => [...document.querySelectorAll('.sb-stamp')].find(x => x.textContent.includes('Rock'))?.click())
ok('wrong stamp marked', await page.$('.sb-stamp.picked-wrong') !== null)
await page.evaluate(() => [...document.querySelectorAll('.sb-stamp')].find(x => x.textContent.includes('Wind'))?.click())
ok('right stamp marked', await page.$('.sb-stamp.picked-right') !== null)

// Play
ok('open story link', await clickLink("Open today's story"))
await new Promise(r => setTimeout(r, 1200))
ok('play page reached', page.url().includes('/play/'))
const answered = await page.evaluate(() => {
  const c = document.querySelector('.answer-card')
  if (c) { c.click(); return true } return false
})
await new Promise(r => setTimeout(r, 800))
ok('activity answer clickable', answered)
ok('tutor avatar is image', await page.$('img[alt*="Barnaby"]') !== null)

// Learn via trail map
await page.goto(base + 'app', { waitUntil: 'networkidle0' })
ok('trail map link', await clickLink('Trail map'))
await new Promise(r => setTimeout(r, 1200))
ok('learn page reached', page.url().includes('/learn/'))

// Header boundary: brand goes to landing, My Learning World goes to /app
ok('header has My Learning World', await clickLink('My Learning World'))
await new Promise(r => setTimeout(r, 900))
ok('back at /app', page.url().endsWith('/app'))

// Parents
ok('parents link', await clickLink('For parents'))
await new Promise(r => setTimeout(r, 1200))
ok('parents page reached', page.url().includes('/parents'))
ok('parents shows privacy note', await page.evaluate(() => document.body.innerText.includes('Privacy')))

console.log(log.join('\n'))
await b.close()
