const RIA_API = 'https://developers.ria.com/auto/new';
const CATALOG_LIMIT = 12;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`AUTO.RIA responded with ${response.status}`);
  return response.json();
}

function normalizeVehicle(vehicle) {
  const photos = Array.isArray(vehicle.photos) ? vehicle.photos : [];
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

    const search = await getJson(
      `${RIA_API}/search?api_key=${encodeURIComponent(apiKey)}&categoryId=1&page=1&limit=${CATALOG_LIMIT}`,
    );
    const ids = (search.autos || []).slice(0, CATALOG_LIMIT);
    const vehicles = await Promise.allSettled(
      ids.map((id) => getJson(`${RIA_API}/auto/${id}?api_key=${encodeURIComponent(apiKey)}`)),
    );
    const normalized = vehicles
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => normalizeVehicle(value));

    response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return response.status(200).json({ products: normalized });
  } catch (error) {
    return response.status(502).json({
      error: 'Could not load AUTO.RIA vehicles.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
