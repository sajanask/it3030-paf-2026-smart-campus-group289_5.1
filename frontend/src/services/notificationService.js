const API_BASE_URL = 'http://localhost:8080/api/notifications'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Notification request failed')
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function getNotifications(userId) {
  if (!userId) {
    return []
  }

  return request(`/${userId}`)
}

export async function markNotificationAsRead(notificationId) {
  return request(`/read/${notificationId}`, {
    method: 'PUT',
  })
}
