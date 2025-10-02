// Fichier de configuration central
// Remplacez 'VOTRE_URL_APPS_SCRIPT_ICI' par l'URL de votre application web Google Apps Script.
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwLBRAgNRv7VrXdGjukIy2-KVaITnWrEWBxoNuLhWzreTcX8o_AOAzqa8rb7c3SZYxY/exec';

/**
 * Système de cache robuste pour récupérer les données des véhicules.
 * Les données sont mises en cache dans le navigateur pendant 1 heure pour accélérer le chargement.
 * @param {string} cacheKey - La clé unique pour ce cache (ex: 'vehiclesCache').
 * @param {string} url - L'URL à appeler si le cache est vide ou expiré.
 * @returns {Promise<any>} - Une promesse qui résout avec les données (du cache ou du réseau).
 */
async function fetchWithCache(cacheKey, url) {
    const CACHE_DURATION = 3600 * 1000; // 1 heure en millisecondes
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

    if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_DURATION)) {
        console.log(`✅ Données chargées depuis le cache pour : ${cacheKey}`);
        return JSON.parse(cachedData);
    }

    console.log(`🔄 Données en cours de chargement depuis le réseau pour : ${cacheKey}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erreur réseau pour ${url}`);
    }
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now());
    return data;
}