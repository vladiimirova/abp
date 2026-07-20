export const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
}).format(price);

export function getSavedReviews(vehicleId) {
  try {
    return JSON.parse(localStorage.getItem(`northline-reviews-${vehicleId}`)) || [];
  } catch {
    return [];
  }
}

export function saveReviews(vehicleId, reviews) {
  localStorage.setItem(`northline-reviews-${vehicleId}`, JSON.stringify(reviews));
}
