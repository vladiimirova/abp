const API_URL = 'https://dummyjson.com/products/category/vehicle';

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('The showroom is temporarily unavailable. Please try again.');
  }
  return response.json();
}

export async function getVehicles() {
  const data = await request(`${API_URL}?limit=100`);
  return data.products;
}

export async function getVehicle(id) {
  return request(`https://dummyjson.com/products/${id}`);
}
