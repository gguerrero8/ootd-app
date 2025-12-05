const API_BASE = import.meta.env.VITE_API_BASE

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE is not set; API calls will fail.')
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const message = body?.error || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body
}

export function apiGet(path) {
  return request(path, { method: 'GET' })
}

export function apiPost(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) })
}

export function apiPut(path, data) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) })
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}
