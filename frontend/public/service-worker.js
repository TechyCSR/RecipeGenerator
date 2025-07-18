const CACHE_NAME = 'recipegenius-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New recipe available!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('RecipeGenius', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending recipe saves
    await syncPendingRecipes();
    
    // Sync any pending grocery list updates
    await syncPendingGroceryUpdates();
    
    // Sync any pending pantry updates
    await syncPendingPantryUpdates();
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync pending recipes
async function syncPendingRecipes() {
  const pendingRecipes = await getStoredData('pendingRecipes') || [];
  
  for (const recipe of pendingRecipes) {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe)
      });
      
      if (response.ok) {
        // Remove from pending list
        await removeFromPendingList('pendingRecipes', recipe.id);
      }
    } catch (error) {
      console.error('Failed to sync recipe:', error);
    }
  }
}

// Sync pending grocery list updates
async function syncPendingGroceryUpdates() {
  const pendingUpdates = await getStoredData('pendingGroceryUpdates') || [];
  
  for (const update of pendingUpdates) {
    try {
      const response = await fetch(`/api/grocery-lists/${update.listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update.data)
      });
      
      if (response.ok) {
        await removeFromPendingList('pendingGroceryUpdates', update.id);
      }
    } catch (error) {
      console.error('Failed to sync grocery update:', error);
    }
  }
}

// Sync pending pantry updates
async function syncPendingPantryUpdates() {
  const pendingUpdates = await getStoredData('pendingPantryUpdates') || [];
  
  for (const update of pendingUpdates) {
    try {
      const response = await fetch(`/api/pantry/${update.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update.data)
      });
      
      if (response.ok) {
        await removeFromPendingList('pendingPantryUpdates', update.id);
      }
    } catch (error) {
      console.error('Failed to sync pantry update:', error);
    }
  }
}

// IndexedDB helper functions
function getStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeGeniusDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

function removeFromPendingList(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecipeGeniusDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Cache strategies for different types of content
const cacheStrategies = {
  // Cache first for static assets
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  },
  
  // Network first for API calls
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },
  
  // Stale while revalidate for semi-dynamic content
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const networkResponsePromise = fetch(request);
    
    // Update cache in background
    networkResponsePromise.then(async (networkResponse) => {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    });
    
    return cachedResponse || networkResponsePromise;
  }
};

// Enhanced fetch handler with different strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }
  
  // Static assets - cache first
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }
  
  // HTML pages - stale while revalidate
  if (request.destination === 'document') {
    event.respondWith(cacheStrategies.staleWhileRevalidate(request));
    return;
  }
  
  // Default strategy
  event.respondWith(cacheStrategies.networkFirst(request));
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker loaded', CACHE_NAME);
