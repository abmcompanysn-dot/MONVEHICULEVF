const CACHE_NAME = 'mon-vehicule-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/voitures-occasion.html',
    '/detail-vehicule.html',
    '/config.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://i.postimg.cc/FhccT3BF/logo-mon-vehicule.jpg'
];

// Étape 1: Installation du Service Worker et mise en cache de l'App Shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                // addAll est atomique: si un fichier échoue, tout échoue.
                return cache.addAll(urlsToCache);
            })
    );
});

// Étape 2: Interception des requêtes et stratégie "Cache d'abord, puis réseau"
self.addEventListener('fetch', event => {
    // Nous ne mettons pas en cache les requêtes vers Google Apps Script
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la réponse est dans le cache, on la retourne
                if (response) {
                    return response;
                }

                // Sinon, on va la chercher sur le réseau
                return fetch(event.request).then(
                    // On peut mettre en cache la nouvelle ressource si on le souhaite
                    // Mais pour l'instant, on se contente de la retourner
                );
            })
    );
});