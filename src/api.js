const API_URL = 'https://dummyjson.com/products/category/vehicle';

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
  const riaVehicles = riaResult.status === 'fulfilled' ? riaResult.value.products : [];
  return [...dummyVehicles, ...riaVehicles];
}

export async function getVehicle(id) {
  if (String(id).startsWith('ria-')) {
    return request(`/api/vehicles?id=${encodeURIComponent(id)}`);
  }
  return request(`https://dummyjson.com/products/${id}`);
}
