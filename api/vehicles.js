const RIA_API = 'https://developers.ria.com/auto/new';
const CATALOG_LIMIT = 6;
const CACHE_TTL = 15 * 60 * 1000;

let catalogCache = null;
let catalogRequest = null;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`AUTO.RIA responded with ${response.status}`);
  return response.json();
}

function normalizeVehicle(vehicle) {
  const photos = Array.isArray(vehicle.photos)
    ? vehicle.photos.map((photo) =>
        /\.(?:avif|jpe?g|png|webp)(?:\?.*)?$/i.test(photo)
          ? photo
          : `${photo}-620x415x70.webp`,
      )
    : [];
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

async function loadCatalog(apiKey) {
  if (catalogCache && catalogCache.expiresAt > Date.now()) {
    return catalogCache.products;
  }
  if (catalogRequest) return catalogRequest;

  catalogRequest = (async () => {
    const search = await getJson(
      `${RIA_API}/search?api_key=${encodeURIComponent(apiKey)}&categoryId=1&page=1&limit=${CATALOG_LIMIT}`,
    );
    const ids = (search.ids || search.autos || []).slice(0, CATALOG_LIMIT);
    const vehicles = await Promise.allSettled(
      ids.map((id) => getJson(`${RIA_API}/auto/${id}?api_key=${encodeURIComponent(apiKey)}`)),
    );
    const products = vehicles
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => normalizeVehicle(value));

    if (products.length) {
      catalogCache = { products, expiresAt: Date.now() + CACHE_TTL };
    }
    return products;
  })();

  try {
    return await catalogRequest;
  } finally {
    catalogRequest = null;
  }
}

export default async function handler(request, response) {
  const apiKey = process.env.AUTO_RIA_API_KEY;

  if (!apiKey) {
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({
      products: [],
      warning: 'AUTO_RIA_API_KEY is not configured.',
    });
  }

  try {
    const requestedId = Array.isArray(request.query.id) ? request.query.id[0] : request.query.id;

    if (requestedId) {
      const autoId = String(requestedId).replace(/^ria-/, '');
      if (!/^\d+$/.test(autoId)) {
        return response.status(400).json({ error: 'Invalid vehicle id.' });
      }
      const vehicle = await getJson(
        `${RIA_API}/auto/${autoId}?api_key=${encodeURIComponent(apiKey)}`,
      );
      response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
      return response.status(200).json(normalizeVehicle(vehicle));
    }

    const normalized = await loadCatalog(apiKey);

    response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return response.status(200).json({ products: normalized });
  } catch (error) {
    if (catalogCache?.products?.length && !request.query.id) {
      return response.status(200).json({
        products: catalogCache.products,
        warning: 'Serving cached AUTO.RIA vehicles.',
      });
    }
    if (!request.query.id) {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json({
        products: [],
        warning: error instanceof Error ? error.message : 'AUTO.RIA is temporarily unavailable.',
      });
    }
    return response.status(502).json({
      error: 'Could not load AUTO.RIA vehicles.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
