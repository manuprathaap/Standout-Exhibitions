import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import multer from 'multer'
import { neon } from '@neondatabase/serverless'
import { list as listBlobs } from '@vercel/blob'
import { handleUpload } from '@vercel/blob/client'

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(root, '..')
const dataRoot = path.join(projectRoot, 'data')
const uploadRoot = path.join(dataRoot, 'uploads')
const dataFile = path.join(dataRoot, 'portfolio.json')
const secretFile = path.join(dataRoot, 'session-secret')
const app = express()
const port = Number(process.env.PORT || 3001)
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = Boolean(process.env.VERCEL)
const loginAttempts = new Map()

if (!isVercel) {
  fs.mkdirSync(uploadRoot, { recursive: true })
  if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(48), { mode: 0o600 })
}
if (isVercel && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error('Set SESSION_SECRET to a random value of at least 32 characters in Vercel.')
}
const sessionSecret = isVercel ? Buffer.from(process.env.SESSION_SECRET) : fs.readFileSync(secretFile)
const database = isVercel
  ? neon(process.env.DATABASE_URL || (() => { throw new Error('Set DATABASE_URL for the Neon database in Vercel.') })())
  : null
let databaseReady

const starterData = {
  admin: null,
  portfolio: {
    id: 'standout-main',
    slug: 'standout',
    title: 'Standout — Exhibitions, Events & Interiors',
    brandLogo: '',
    brandLogoAlt: 'Standout logo',
    status: 'published',
    visibility: 'public',
    theme: { primary: '#5834a4', ink: '#201d25', paper: '#f8f7f5' },
    sections: [
      { id: 'hero', type: 'hero', title: 'We make your dream stand out.', eyebrow: 'Exhibitions · Events · Interiors', body: 'We create exhibition stands and brand experiences that bring ambitious ideas to life — across the GCC, Europe and the rest of the world.', image: '/media/p07-03.jpg', imageAlt: 'Standout exhibition stand', primaryLabel: 'Explore our work', secondaryLabel: 'Start a conversation', visible: true },
      { id: 'about', type: 'about', title: 'Built to make an impression.', eyebrow: 'A little about us', body: 'Standout is a creative exhibition and events company with a passion for creating memorable brand experiences. From the first sketch to the final detail, our team brings design, craftsmanship and production together under one roof.', image: '/media/p16-01.jpg', visible: true },
      { id: 'services', type: 'services', title: 'What we do best.', eyebrow: 'Our services', body: 'A complete creative and production partner for the moments that matter.', visible: true },
      { id: 'projects', type: 'projects', title: 'Selected work.', eyebrow: 'Made to stand out', body: 'A selection of exhibition spaces and environments from our company profile.', visible: true },
      { id: 'clients', type: 'clients', title: 'In good company.', eyebrow: 'Trusted by brands', body: 'Brands featured in our company profile.', visible: true },
      { id: 'global', type: 'global', title: 'Made for a global stage.', eyebrow: 'Our reach', body: 'We offer exhibition stand design and construction services in the GCC, Europe, Africa, the US and Southeast Asia.', visible: true },
      { id: 'contact', type: 'contact', title: 'Let’s make something stand out.', eyebrow: 'Start a conversation', body: 'Tell us about your next exhibition, event or interior project.', visible: true },
    ],
    services: [
      { title: 'Exhibition stand design & building', description: 'Custom exhibition stands, designed and built to make your brand stand out.', image: '/media/p07-03.jpg', imageAlt: 'Exhibition stand design and build' },
      { title: 'Interiors & fit-outs', description: 'Considered interior spaces and fit-outs, from concept through to the finishing details.', image: '/media/p16-02.jpg', imageAlt: 'Contemporary interior fit-out' },
      { title: 'Corporate branding & graphic design', description: 'Branding and graphic production that keep your message clear and consistent.', image: '/media/pdf-page3-image3.jpg', imageAlt: 'Graphic production equipment' },
      { title: 'AV production', description: 'Audio-visual production to bring presentations, events and live experiences to life.', image: '/media/pdf-page3-image5.jpg', imageAlt: 'Event stage and audio-visual production' },
      { title: 'Giveaways', description: 'Branded giveaways selected to help your event make a lasting impression.', image: '/media/pdf-page3-image7.jpg', imageAlt: 'Promotional giveaway items' },
      { title: 'Hostess support for events & exhibitions', description: 'Professional hostess support for events and exhibitions.', image: '/media/pdf-page3-image8.jpg', imageAlt: 'Event hostess support' },
      { title: 'Signage', description: 'Signage and visual graphics made to guide and represent your brand.', image: '/media/p17-02.jpg', imageAlt: 'Standout signage project' },
    ],
    projects: [
      { id: 'halliburton', title: 'Halliburton', category: 'Exhibition stands', image: '/media/p04-01.jpg', location: 'Exhibition portfolio', gallery: ['/media/p04-01.jpg', '/media/p04-02.jpg'] },
      { id: 'technology', title: 'Technology in focus', category: 'Exhibition stands', image: '/media/p05-02.jpg', location: 'Exhibition portfolio', gallery: ['/media/p05-02.jpg', '/media/p05-03.jpg'] },
      { id: 'brand-experience', title: 'A bold brand experience', category: 'Exhibition stands', image: '/media/p07-03.jpg', location: 'Exhibition portfolio', gallery: ['/media/p07-03.jpg', '/media/p07-04.jpg'] },
      { id: 'brother', title: 'Brother', category: 'Exhibition stands', image: '/media/p08-03.jpg', location: 'Exhibition portfolio', gallery: ['/media/p08-03.jpg'] },
      { id: 'retail', title: 'Retail & activation', category: 'Exhibition stands', image: '/media/p09-02.jpg', location: 'Exhibition portfolio', gallery: ['/media/p09-02.jpg', '/media/p09-03.jpg'] },
      { id: 'automotive', title: 'Automotive showcase', category: 'Exhibition stands', image: '/media/p10-04.jpg', location: 'Exhibition portfolio', gallery: ['/media/p10-04.jpg', '/media/p10-05.jpg'] },
      { id: 'interiors', title: 'Thoughtful interiors', category: 'Interiors', image: '/media/p16-01.jpg', location: 'Interiors portfolio', gallery: ['/media/p16-01.jpg', '/media/p16-02.jpg', '/media/p16-03.jpg'] },
      { id: 'signage', title: 'Signage with presence', category: 'Signage', image: '/media/p17-02.jpg', location: 'Signage portfolio', gallery: ['/media/p17-02.jpg', '/media/p17-03.jpg'] },
    ],
    clients: [
      { name: 'Halliburton', image: '/media/p18-01.png' },
      { name: 'LG', image: '/media/p18-02.jpg' },
      { name: 'Berger Paints', image: '/media/p18-03.png' },
      { name: 'Drydocks World', image: '/media/p18-04.jpg' },
      { name: 'Hikvision', image: '/media/p18-06.jpg' },
      { name: 'NAFFCO', image: '/media/p18-08.jpg' },
      { name: 'Bapco', image: '/media/p18-09.jpg' },
      { name: 'Eastern', image: '/media/p18-10.jpg' },
      { name: 'RTA', image: '/media/p18-13.png' },
      { name: 'Al Tayer', image: '/media/p18-15.png' },
      { name: 'LuLu', image: '/media/p18-16.jpg' },
      { name: 'Brother', image: '/media/p18-21.png' },
    ],
    contact: {
      website: 'www.standoutuae.com',
      email: 'info@standoutuae.com',
      marketingEmail: 'marketing@standoutuae.com',
      phone: '+971 4 589 7752',
      mobile: '+971 56 919 1407',
      whatsapp: '+971569191407',
      offices: [
        { name: 'United Arab Emirates', address: 'FNC Compound DIP 2, Warehouse B4-10, Dubai, PO Box 49540, U.A.E.' },
        { name: 'Saudi Arabia', address: '2421 Sulaiman Bin Khalaf Street, Workshop #27, Riyadh, Kingdom of Saudi Arabia' },
        { name: 'Italy', address: 'Via Pellagrino Rossi 49, Milan, Cap 20161, Italy' },
      ],
    },
  },
  publishedPortfolio: null,
}

function localReadData() {
  try {
    const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    const data = { ...starterData, ...saved, portfolio: { ...starterData.portfolio, ...saved.portfolio } }
    if (!data.publishedPortfolio && data.portfolio.status === 'published') {
      data.publishedPortfolio = structuredClone(data.portfolio)
    }
    return data
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const data = structuredClone(starterData)
    data.publishedPortfolio = structuredClone(data.portfolio)
    return data
  }
}

async function readData() {
  if (!isVercel) return localReadData()
  if (!databaseReady) {
    databaseReady = database`
      CREATE TABLE IF NOT EXISTS standout_state (
        id integer PRIMARY KEY CHECK (id = 1),
        payload jsonb NOT NULL
      )
    `.catch(error => {
      databaseReady = undefined
      throw error
    })
  }
  await databaseReady
  const rows = await database`SELECT payload FROM standout_state WHERE id = 1`
  if (rows[0]) return rows[0].payload
  const initial = structuredClone(starterData)
  initial.publishedPortfolio = structuredClone(initial.portfolio)
  await database`
    INSERT INTO standout_state (id, payload)
    VALUES (1, ${JSON.stringify(initial)}::jsonb)
    ON CONFLICT (id) DO NOTHING
  `
  const initializedRows = await database`SELECT payload FROM standout_state WHERE id = 1`
  return initializedRows[0].payload
}

async function writeData(data) {
  if (isVercel) {
    await database`
      INSERT INTO standout_state (id, payload)
      VALUES (1, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload
    `
    return
  }
  const tempFile = `${dataFile}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), { mode: 0o600 })
  fs.renameSync(tempFile, dataFile)
}

function makeToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function sessionEmail(req) {
  const token = req.cookies?.standout_session
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = crypto.createHmac('sha256', sessionSecret).update(payload).digest()
  let actual
  try { actual = Buffer.from(signature, 'base64url') } catch { return null }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return session.expires > Date.now() ? session.email : null
  } catch {
    return null
  }
}

async function requireAdmin(req, res, next) {
  const data = await readData()
  if (!sessionEmail(req) || !data.admin || data.admin.email !== sessionEmail(req)) {
    return res.status(401).json({ error: 'Please sign in to continue.' })
  }
  next()
}

app.use(express.json({ limit: '2mb' }))
app.use((req, _res, next) => {
  const cookie = req.headers.cookie || ''
  req.cookies = Object.fromEntries(cookie.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=')
    return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))]
  }))
  next()
})
if (!isVercel) app.use('/uploads', express.static(uploadRoot, { index: false, maxAge: '1d' }))
app.use('/media', express.static(path.join(projectRoot, 'public', 'media'), { index: false, maxAge: '7d' }))

const upload = multer({
  storage: isVercel ? multer.memoryStorage() : multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadRoot),
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase()
      callback(null, `${crypto.randomUUID()}${ext}`)
    },
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.mimetype)) {
      callback(new Error('Choose a JPEG, PNG, WebP, GIF or AVIF image.'))
      return
    }
    callback(null, true)
  },
})

app.get('/api/setup', async (_req, res) => {
  const data = await readData()
  res.json({ needsSetup: !data.admin })
})

app.post('/api/setup', async (req, res) => {
  const data = await readData()
  if (data.admin) return res.status(409).json({ error: 'An editor account already exists.' })
  const { email, password } = req.body || {}
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (typeof password !== 'string' || password.length < 12) return res.status(400).json({ error: 'Use a password with at least 12 characters.' })
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 64)
  data.admin = { email: email.toLowerCase(), salt: salt.toString('hex'), hash: hash.toString('hex') }
  await writeData(data)
  res.cookie('standout_session', makeToken(data.admin.email), { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/' })
  res.json({ email: data.admin.email })
})

app.post('/api/auth/login', async (req, res) => {
  const key = req.ip
  const attempts = loginAttempts.get(key) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 }
  if (attempts.resetAt < Date.now()) {
    attempts.count = 0
    attempts.resetAt = Date.now() + 15 * 60 * 1000
  }
  if (attempts.count >= 5) return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' })
  const data = await readData()
  const { email, password } = req.body || {}
  if (!data.admin) return res.status(409).json({ error: 'Create the editor account first.' })
  const candidate = typeof password === 'string' ? crypto.scryptSync(password, Buffer.from(data.admin.salt, 'hex'), 64) : Buffer.alloc(64)
  const stored = Buffer.from(data.admin.hash, 'hex')
  const valid = typeof email === 'string' && email.toLowerCase() === data.admin.email && candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)
  if (!valid) {
    attempts.count += 1
    loginAttempts.set(key, attempts)
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }
  loginAttempts.delete(key)
  res.cookie('standout_session', makeToken(data.admin.email), { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/' })
  res.json({ email: data.admin.email })
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('standout_session', { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/' })
  res.status(204).end()
})

app.get('/api/auth/session', async (req, res) => {
  const email = sessionEmail(req)
  const { admin } = await readData()
  res.json(email && admin?.email === email ? { authenticated: true, email } : { authenticated: false })
})

app.get('/api/admin/portfolio', requireAdmin, async (_req, res) => {
  const data = await readData()
  res.json({ portfolio: data.portfolio })
})

app.get('/api/admin/media', requireAdmin, async (_req, res) => {
  let uploaded
  if (isVercel) {
    const blobs = []
    let cursor
    do {
      const result = await listBlobs({ prefix: 'uploads/', cursor })
      blobs.push(...result.blobs)
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)
    uploaded = blobs.map(blob => ({
      name: path.posix.basename(blob.pathname),
      url: blob.url,
    }))
  } else {
    uploaded = fs.readdirSync(uploadRoot, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => ({ name: entry.name, url: `/uploads/${encodeURIComponent(entry.name)}` }))
  }
  const bundled = fs.readdirSync(path.join(projectRoot, 'public', 'media'), { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name))
    .map(entry => ({ name: entry.name, url: `/media/${encodeURIComponent(entry.name)}` }))
  res.json({ media: [...uploaded, ...bundled], uploadMode: isVercel ? 'blob' : 'local' })
})

app.get('/api/admin/upload-mode', requireAdmin, (_req, res) => {
  res.json({ uploadMode: isVercel ? 'blob' : 'local' })
})

app.put('/api/admin/portfolio', requireAdmin, async (req, res) => {
  const portfolio = req.body?.portfolio
  if (!portfolio || !Array.isArray(portfolio.sections) || !Array.isArray(portfolio.projects) || !Array.isArray(portfolio.services)) {
    return res.status(400).json({ error: 'Portfolio data is incomplete or invalid.' })
  }
  const data = await readData()
  data.portfolio = { ...data.portfolio, ...portfolio, status: 'draft' }
  await writeData(data)
  res.json({ portfolio: data.portfolio })
})

app.post('/api/admin/publish', requireAdmin, async (_req, res) => {
  const data = await readData()
  if (!data.portfolio.sections.some(section => section.visible && section.type === 'hero')) {
    return res.status(400).json({ error: 'Add a visible hero section before publishing.' })
  }
  data.portfolio.status = 'published'
  data.portfolio.publishedAt = new Date().toISOString()
  data.publishedPortfolio = structuredClone(data.portfolio)
  await writeData(data)
  res.json({ portfolio: data.portfolio })
})

app.post('/api/admin/unpublish', requireAdmin, async (_req, res) => {
  const data = await readData()
  data.portfolio.status = 'draft'
  data.publishedPortfolio = null
  await writeData(data)
  res.json({ portfolio: data.portfolio })
})

app.post('/api/admin/upload-token', requireAdmin, async (req, res, next) => {
  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async pathname => {
        if (!/^uploads\/[a-zA-Z0-9._-]+$/.test(pathname)) {
          throw new Error('Invalid upload path.')
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          maximumSizeInBytes: 12 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/upload', requireAdmin, (req, res, next) => {
  upload.array('images', 12)(req, res, error => {
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    if (!req.files?.length) return res.status(400).json({ error: 'Choose at least one image to upload.' })
    if (isVercel) return res.status(400).json({ error: 'Use the direct upload endpoint on Vercel.' })
    res.json({ files: req.files.map(file => ({ name: file.originalname, url: `/uploads/${file.filename}`, size: file.size })) })
  })
})

app.get('/api/portfolio/:slug', async (req, res) => {
  const { publishedPortfolio: portfolio } = await readData()
  if (portfolio.status !== 'published' || portfolio.slug !== req.params.slug) {
    return res.status(404).json({ error: 'This portfolio is not available.' })
  }
  res.set('Cache-Control', 'no-store')
  res.json({ portfolio: { ...portfolio, status: undefined } })
})

app.use('/api', (error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must contain valid JSON.' })
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' })
  console.error('API request failed:', error.message)
  res.status(500).json({ error: 'Something went wrong while processing your request.' })
})

if (isProduction && !isVercel) {
  const dist = path.join(projectRoot, 'dist')
  app.use(express.static(dist))
  app.get('*path', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

if (!isVercel) {
  app.listen(port, () => {
    console.log(`Standout portfolio server listening on http://localhost:${port}`)
  })
}

export default app
