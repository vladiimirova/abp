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

function mergeVehicles(...collections) {
  const vehiclesById = new Map();
  collections.flat().forEach((vehicle) => {
    if (vehicle?.id) vehiclesById.set(String(vehicle.id), vehicle);
  });
  return [...vehiclesById.values()];
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
  const cachedRiaVehicles = getCachedRiaVehicles();
  const riaVehicles = mergeVehicles(riaSnapshot, cachedRiaVehicles, freshRiaVehicles);
  cacheRiaVehicles(riaVehicles);
  return [...dummyVehicles, ...riaVehicles];
}

export async function getVehicle(id) {
  if (String(id).startsWith('ria-')) {
    const savedVehicle = mergeVehicles(riaSnapshot, getCachedRiaVehicles())
      .find((vehicle) => String(vehicle.id) === String(id));
    if (savedVehicle) return savedVehicle;
    return request(`/api/vehicles?id=${encodeURIComponent(id)}`);
  }
  return request(`https://dummyjson.com/products/${id}`);
}
