import riaSnapshot from './data/riaVehicles.json';

const API_URL = 'https://dummyjson.com/products/category/vehicle';
const RIA_CACHE_KEY = 'northline-ria-vehicles';

function getCachedRiaVehicles() {
  try {
    return JSON.parse(localStorage.getItem(RIA_CACHE_KEY)) || [];
  } catch {
    return [];
  }
}

function cacheRiaVehicles(vehicles) {
  if (vehicles.length) {
    localStorage.setItem(RIA_CACHE_KEY, JSON.stringify(vehicles));
  }
}

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('The showroom is temporarily unavailable. Please try again.');
  }
  return response.json();
}

export async function getVehicles() {
  const [dummyResult, riaResult] = await Promise.allSettled([
    request(`${API_URL}?limit=100`),
    request('/api/vehicles'),
  ]);

  if (dummyResult.status === 'rejected' && riaResult.status === 'rejected') {
    throw new Error('The showroom is temporarily unavailable. Please try again.');
  }

  const dummyVehicles = dummyResult.status === 'fulfilled' ? dummyResult.value.products : [];
  const freshRiaVehicles = riaResult.status === 'fulfilled' ? riaResult.value.products : [];
  if (freshRiaVehicles.length) cacheRiaVehicles(freshRiaVehicles);
  const cachedRiaVehicles = getCachedRiaVehicles();
  const riaVehicles = freshRiaVehicles.length
    ? freshRiaVehicles
    : cachedRiaVehicles.length
      ? cachedRiaVehicles
      : riaSnapshot;
  return [...dummyVehicles, ...riaVehicles];
}

export async function getVehicle(id) {
  if (String(id).startsWith('ria-')) {
    return request(`/api/vehicles?id=${encodeURIComponent(id)}`);
  }
  return request(`https://dummyjson.com/products/${id}`);
}
