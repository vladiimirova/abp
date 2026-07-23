const API_URL = 'https://dummyjson.com/products/category/vehicle';

const createReview = (reviewerName, rating, comment) => ({
  reviewerName,
  rating,
  comment,
  date: '2026-06-18T10:00:00.000Z',
});

const EXTRA_VEHICLES = [
  {
    id: 'local-audi-e-tron',
    title: 'e-tron GT',
    brand: 'Audi',
    category: 'vehicle',
    description: 'A fully electric grand tourer combining instant performance with refined long-distance comfort.',
    price: 106500,
    rating: 4.8,
    stock: 3,
    availabilityStatus: 'Low Stock',
    warrantyInformation: '4 year warranty',
    shippingInformation: 'Ready in 5-7 business days',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('Oliver Hayes', 5, 'Quiet, incredibly quick, and beautifully finished.')],
  },
  {
    id: 'local-porsche-911',
    title: '911 Carrera',
    brand: 'Porsche',
    category: 'vehicle',
    description: 'An iconic rear-engine sports car engineered for precise handling and effortless everyday driving.',
    price: 124900,
    rating: 4.9,
    stock: 1,
    availabilityStatus: 'Reserved',
    warrantyInformation: '3 year warranty',
    shippingInformation: 'Collection by appointment',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('Noah Parker', 5, 'Still the benchmark for a daily sports car.')],
  },
  {
    id: 'local-volvo-xc90',
    title: 'XC90 Recharge',
    brand: 'Volvo',
    category: 'vehicle',
    description: 'A spacious plug-in hybrid SUV with Scandinavian design, advanced safety, and seven comfortable seats.',
    price: 72900,
    rating: 4.7,
    stock: 8,
    availabilityStatus: 'In Stock',
    warrantyInformation: '5 year warranty',
    shippingInformation: 'Ships in 1 week',
    thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('Emma Reed', 5, 'Calm, practical, and perfect for long family journeys.')],
  },
  {
    id: 'local-mercedes-s-class',
    title: 'S 580',
    brand: 'Mercedes-Benz',
    category: 'vehicle',
    description: 'A flagship luxury sedan with an exceptionally quiet cabin and intelligent driver assistance.',
    price: 128150,
    rating: 4.6,
    stock: 0,
    availabilityStatus: 'Sold',
    warrantyInformation: '4 year warranty',
    shippingInformation: 'Currently unavailable',
    thumbnail: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('James Wilson', 5, 'The cabin comfort is on another level.')],
  },
  {
    id: 'local-range-rover',
    title: 'Range Rover Sport',
    brand: 'Land Rover',
    category: 'vehicle',
    description: 'A confident performance SUV balancing all-terrain ability with a polished, modern interior.',
    price: 89900,
    rating: 4.4,
    stock: 5,
    availabilityStatus: 'In Stock',
    warrantyInformation: '4 year warranty',
    shippingInformation: 'Ships in 2 weeks',
    thumbnail: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('Sophia Clark', 4, 'Beautiful interior and a very composed ride.')],
  },
  {
    id: 'local-chevrolet-camaro',
    title: 'Camaro LT1',
    brand: 'Chevrolet',
    category: 'vehicle',
    description: 'A characterful V8 coupe with muscular design, direct steering, and unmistakable road presence.',
    price: 38500,
    rating: 4.3,
    stock: 2,
    availabilityStatus: 'Low Stock',
    warrantyInformation: '3 year warranty',
    shippingInformation: 'Ready in 3-5 business days',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=90'],
    reviews: [createReview('Lucas Bennett', 4, 'A lot of performance and personality for the price.')],
  },
];

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('The showroom is temporarily unavailable. Please try again.');
  return response.json();
}

export async function getVehicles(signal) {
  const data = await request(`${API_URL}?limit=100`, signal);
  return [...data.products, ...EXTRA_VEHICLES];
}

export async function getVehicle(id) {
  const localVehicle = EXTRA_VEHICLES.find((vehicle) => vehicle.id === id);
  if (localVehicle) return localVehicle;
  return request(`https://dummyjson.com/products/${id}`);
}
