import { upload as uploadToBlob } from '@vercel/blob/client'

const blobExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`)
  }
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`)
  return result
}

export const api = {
  setup: () => request('/api/setup'),
  createAccount: (email, password) => request('/api/setup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  session: () => request('/api/auth/session'),
  adminPortfolio: () => request('/api/admin/portfolio'),
  media: () => request('/api/admin/media'),
  savePortfolio: portfolio => request('/api/admin/portfolio', { method: 'PUT', body: JSON.stringify({ portfolio }) }),
  publish: () => request('/api/admin/publish', { method: 'POST' }),
  unpublish: () => request('/api/admin/unpublish', { method: 'POST' }),
  publicPortfolio: slug => request(`/api/portfolio/${encodeURIComponent(slug)}`),
  upload: async files => {
    const { uploadMode } = await request('/api/admin/upload-mode')
    if (uploadMode === 'blob') {
      const uploaded = await Promise.all(files.map(async file => {
        const extension = blobExtensions[file.type]
        if (!extension) throw new Error('Choose a JPEG, PNG, WebP, GIF or AVIF image.')
        const blob = await uploadToBlob(`uploads/${crypto.randomUUID()}${extension}`, file, {
          access: 'public',
          contentType: file.type,
          handleUploadUrl: '/api/admin/upload-token',
        })
        return { name: file.name, url: blob.url, size: file.size }
      }))
      return { files: uploaded }
    }

    const body = new FormData()
    files.forEach(file => body.append('images', file))
    return request('/api/admin/upload', { method: 'POST', body })
  },
}
