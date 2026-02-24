// NETWORK GPT Service Worker
// Provides offline support, caching, and PWA functionality

const CACHE_VERSION = 'v1'
const STATIC_CACHE = `network-gpt-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `network-gpt-dynamic-${CACHE_VERSION}`
const API_CACHE = `network-gpt-api-${CACHE_VERSION}`

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon.png',
  '/manifest.json',
  '/icon.svg',
  '/placeholder-logo.svg'
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.log('[SW] Some assets failed to cache (optional)', error)
      })
    }).then(() => {
      self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE &&
            cacheName.startsWith('network-gpt-')
          ) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED' }))
      })
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network-first with fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(API_CACHE)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response(
              JSON.stringify({
                error: 'Offline - API unavailable',
                cached: false
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }
            )
          })
        })
    )
  }
  
  // Image and media files - cache-first
  else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response
          }

          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              cache.put(request, responseToCache)
            }
            return networkResponse
          }).catch(() => {
            return new Response('Image not available offline', {
              status: 404,
              statusText: 'Not Found'
            })
          })
        })
      })
    )
  }
  
  // CSS, JS, and other assets - cache-first with network fallback
  else if (/\.(css|js|woff|woff2|eot|ttf|otf)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              cache.put(request, responseToCache)
            }
            return networkResponse
          }).catch(() => {
            console.log('[SW] Asset fetch failed:', request.url)
            return new Response('Asset not available', { status: 404 })
          })
        })
      })
    )
  }
  
  // HTML pages and other requests - network-first
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response('Page not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
        })
    )
  }
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(DYNAMIC_CACHE).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      caches.open(API_CACHE).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests.map((request) => {
              if (request.url.includes('/api/chat')) {
                return fetch(request).then((response) => {
                  if (response.ok) {
                    return cache.delete(request)
                  }
                }).catch(() => {
                  console.log('[SW] Background sync failed for:', request.url)
                })
              }
            })
          )
        })
      })
    )
  }
})

console.log('[SW] Service Worker loaded')
