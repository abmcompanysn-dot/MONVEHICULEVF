const CACHE_NAME = 'mon-vehicule-cache-v2'; // Version du cache incrémentée
const urlsToCache = [
    '/',
    '/index.html',
    '/voitures-occasion.html',
    '/detail-vehicule.html',
    '/offline.html', // Ajout de la page hors ligne
    '/config.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://i.postimg.cc/FhccT3BF/logo-mon-vehicule.jpg'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('SW: Installation...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Mise en cache de l\'App Shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Force le nouveau SW à devenir actif
    );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', event => {
    console.log('SW: Activation...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Suppression de l\'ancien cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Prend le contrôle des clients ouverts
    );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
    const { request } = event;

    // Stratégie "Stale-While-Revalidate" pour les requêtes API (Google Apps Script)
    if (request.url.includes('script.google.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        // Met à jour le cache avec la nouvelle réponse
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    // Retourne la réponse du cache immédiatement, puis met à jour en arrière-plan
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Stratégie "Cache first" pour les autres requêtes (App Shell, images, etc.)
    // avec fallback vers la page offline pour la navigation
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            // Si la réponse est dans le cache, on la retourne
            if (cachedResponse) {
                return cachedResponse;
            }

            // Sinon, on va la chercher sur le réseau
            return fetch(request).catch(() => {
                // Si la requête échoue (hors ligne) et que c'est une page HTML
                if (request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});
