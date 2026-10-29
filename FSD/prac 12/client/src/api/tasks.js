const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = Array.isArray(payload.details)
      ? payload.details.map((item) => item.message).join('; ')
      : ''

    throw new Error(details || payload.error || `Request failed with status ${response.status}`)
  }

  return payload
}

export function getTasks({ status = 'all', search = '' } = {}) {
  const params = new URLSearchParams()

  if (status === 'active') params.set('completed', 'false')
  if (status === 'completed') params.set('completed', 'true')
  if (search.trim()) params.set('search', search.trim())

  const query = params.toString()
  return request(`/tasks${query ? `?${query}` : ''}`)
}

export function getTask(id) {
  return request(`/tasks/${id}`)
}

export function createTask(task) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export function updateTask(id, changes) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' })
}
