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
    throw new Error('The server returned an invalid response.')
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
  upload: files => {
    const body = new FormData()
    files.forEach(file => body.append('images', file))
    return request('/api/admin/upload', { method: 'POST', body })
  },
}
