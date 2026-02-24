const api = import.meta.env.VITE_API_URL || ''

function buildUrl(path: string) {
 if (!api) return `/api/${path}`
 // ensure no double slash and avoid duplicating '/api' if VITE_API_URL already contains it
 const base = api.replace(/\/$/, '')
 if (base.endsWith('/api')) {
  return `${base}/${path.replace(/^\/?api\/?/, '')}`
 }
 return `${base}/api/${path.replace(/^\//, '')}`
}

const handleGmailConnect = () => {
 window.location.href = buildUrl('auth/gmail/start')
}

const handleMicrosoftConnect = () => {
 window.location.href = buildUrl('auth/microsoft/start')
}

export { handleGmailConnect, handleMicrosoftConnect }
