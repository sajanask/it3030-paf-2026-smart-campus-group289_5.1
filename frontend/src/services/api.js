/**
 * Central API helper for Module C – Tickets
 * All calls target http://localhost:8080/api/tickets
 */

const BASE = 'http://localhost:8080/api/tickets'

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const err = await res.json()
      msg = err.message || msg
    } catch (_) {}
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── READ ──────────────────────────────────────────────────────────────────────
export const fetchTickets = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString()
  return fetch(`${BASE}${qs ? '?' + qs : ''}`).then(handleResponse)
}

export const fetchTicket = (id) =>
  fetch(`${BASE}/${id}`).then(handleResponse)

export const fetchStats = () =>
  fetch(`${BASE}/stats`).then(handleResponse)

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createTicket = (formData) =>
  fetch(BASE, { method: 'POST', body: formData }).then(handleResponse)

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateTicket = (id, body) =>
  fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse)

export const assignTicket = (id, technicianId) =>
  fetch(`${BASE}/${id}/assign?technicianId=${encodeURIComponent(technicianId)}`, {
    method: 'PUT',
  }).then(handleResponse)

export const updateStatus = (id, status, notes = '') =>
  fetch(
    `${BASE}/${id}/status?status=${encodeURIComponent(status)}&notes=${encodeURIComponent(notes)}`,
    { method: 'PUT' }
  ).then(handleResponse)

export const rejectTicket = (id, reason) =>
  fetch(`${BASE}/${id}/reject?reason=${encodeURIComponent(reason)}`, {
    method: 'PUT',
  }).then(handleResponse)

export const closeTicket = (id) =>
  fetch(`${BASE}/${id}/close`, { method: 'PUT' }).then(handleResponse)

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteTicket = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse)

// ── COMMENTS ──────────────────────────────────────────────────────────────────
export const addComment = (ticketId, text, author, authorRole = 'USER') =>
  fetch(`${BASE}/${ticketId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, author, authorRole }),
  }).then(handleResponse)

export const editComment = (ticketId, commentId, text, requestingUser) =>
  fetch(`${BASE}/${ticketId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, requestingUser }),
  }).then(handleResponse)

export const deleteComment = (ticketId, commentId, requestingUser) =>
  fetch(
    `${BASE}/${ticketId}/comments/${commentId}?requestingUser=${encodeURIComponent(requestingUser)}`,
    { method: 'DELETE' }
  ).then(handleResponse)
