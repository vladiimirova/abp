import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const envPath = resolve(projectRoot, '.env.local');
const outputPath = resolve(projectRoot, 'src/data/riaVehicles.json');
const apiRoot = 'https://developers.ria.com/auto/new';
const limit = 12;

function readApiKey(source) {
  const line = source
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith('AUTO_RIA_API_KEY='));
  return line?.slice(line.indexOf('=') + 1).trim();
}

async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `AUTO.RIA responded with ${response.status}`);
  }
  return data;
}

function photoUrl(photo) {
  return /\.(?:avif|jpe?g|png|webp)(?:\?.*)?$/i.test(photo)
    ? photo
    : `${photo}-620x415x70.webp`;
}

function normalizeVehicle(vehicle) {
  const photos = Array.isArray(vehicle.photos) ? vehicle.photos.map(photoUrl) : [];
  const title = [vehicle.marka, vehicle.model, vehicle.year].filter(Boolean).join(' ');

  return {
    id: `ria-${vehicle.autoId}`,
    title,
    brand: vehicle.marka || 'AUTO.RIA',
    category: 'vehicle',
    description: vehicle.note || `${title}. New vehicle from an official AUTO.RIA listing.`,
    price: Number(vehicle.priceUsd || 0),
    rating: null,
    stock: vehicle.inStock ? 1 : 0,
    availabilityStatus: vehicle.inStock ? 'In Stock' : 'Available to order',
    warrantyInformation: 'Dealer warranty',
    shippingInformation: vehicle.salon?.city
      ? `Available in ${vehicle.salon.city}`
      : 'Contact the dealer',
    thumbnail: photos[0] || '',
    images: photos,
    reviews: [],
    source: 'AUTO.RIA',
    externalUrl: vehicle.linkAuto,
    specifications: vehicle.mainParams || {},
  };
}

const apiKey = readApiKey(await readFile(envPath, 'utf8'));
if (!apiKey) {
  throw new Error('Add AUTO_RIA_API_KEY to .env.local before running this command.');
}

const search = await getJson(
  `${apiRoot}/search?api_key=${encodeURIComponent(apiKey)}&categoryId=1&page=1&limit=${limit}`,
);
const ids = (search.ids || search.autos || []).slice(0, limit);
let savedVehicles = [];

try {
  savedVehicles = JSON.parse(await readFile(outputPath, 'utf8'));
} catch {
  savedVehicles = [];
}

const savedById = new Map(
  savedVehicles.map((vehicle) => [String(vehicle.id).replace(/^ria-/, ''), vehicle]),
);
const vehicles = [];

for (const id of ids) {
  const savedVehicle = savedById.get(String(id));
  if (savedVehicle) {
    vehicles.push(savedVehicle);
  } else {
    const vehicle = await getJson(
      `${apiRoot}/auto/${id}?api_key=${encodeURIComponent(apiKey)}`,
    );
    vehicles.push(normalizeVehicle(vehicle));
  }
}

await writeFile(outputPath, `${JSON.stringify(vehicles, null, 2)}\n`, 'utf8');
console.log(`Saved ${vehicles.length} AUTO.RIA vehicles to src/data/riaVehicles.json`);
