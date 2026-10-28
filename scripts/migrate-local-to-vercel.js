import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localDataFile = path.join(projectRoot, 'data', 'portfolio.json')
const localUploadDirectory = path.join(projectRoot, 'data', 'uploads')
const mimeTypes = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing. Pull the Vercel project environment first.')
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is missing. Connect a Vercel Blob store first.')
if (!fs.existsSync(localDataFile)) throw new Error('Local data/portfolio.json was not found.')

const data = JSON.parse(fs.readFileSync(localDataFile, 'utf8'))
const database = neon(process.env.DATABASE_URL)
await database`
  CREATE TABLE IF NOT EXISTS standout_state (
    id integer PRIMARY KEY CHECK (id = 1),
    payload jsonb NOT NULL
  )
`
const existingRows = await database`SELECT payload FROM standout_state WHERE id = 1`
if (existingRows[0]?.payload?.admin && !process.argv.includes('--overwrite')) {
  throw new Error('The Vercel database already has an editor account. Use --overwrite only if replacing its data is intended.')
}
const uploadNames = fs.existsSync(localUploadDirectory)
  ? fs.readdirSync(localUploadDirectory, { withFileTypes: true }).filter(entry => entry.isFile()).map(entry => entry.name)
  : []
const uploadedUrls = new Map()

function referencedUploadNames(value, names = new Set()) {
  if (typeof value === 'string') {
    const match = value.match(/^\/uploads\/([^?#]+)/)
    if (match) {
      try {
        names.add(decodeURIComponent(match[1]))
      } catch {
        throw new Error(`Invalid encoded upload path: ${value}`)
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach(item => referencedUploadNames(item, names))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => referencedUploadNames(item, names))
  }
  return names
}

for (const name of referencedUploadNames(data)) {
  if (!uploadNames.includes(name)) throw new Error(`The portfolio references a local upload that is missing: ${name}`)
}

for (const name of uploadNames) {
  const extension = path.extname(name).toLowerCase()
  const contentType = mimeTypes[extension]
  if (!contentType) throw new Error(`Unsupported local upload file type: ${extension || '(none)'}`)
  const source = path.join(localUploadDirectory, name)
  const blob = await put(`uploads/${crypto.randomUUID()}${extension}`, fs.readFileSync(source), {
    access: 'public',
    contentType,
  })
  uploadedUrls.set(name, blob.url)
}

function migrateUploadUrls(value) {
  if (typeof value === 'string') {
    const match = value.match(/^\/uploads\/([^?#]+)/)
    if (!match) return value
    let name
    try {
      name = decodeURIComponent(match[1])
    } catch {
      throw new Error(`Invalid encoded upload path: ${value}`)
    }
    const url = uploadedUrls.get(name)
    if (!url) throw new Error(`The portfolio references a local upload that is missing: ${name}`)
    return url
  }
  if (Array.isArray(value)) return value.map(migrateUploadUrls)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, migrateUploadUrls(item)]))
  }
  return value
}

const migratedData = migrateUploadUrls(data)
await database`
  INSERT INTO standout_state (id, payload)
  VALUES (1, ${JSON.stringify(migratedData)}::jsonb)
  ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload
`

console.log(`Migrated local portfolio and ${uploadedUrls.size} uploaded image(s) to Vercel storage.`)
