export function getStoredUser() {
  const rawUser = localStorage.getItem('user')

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem('token') && getStoredUser())
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
