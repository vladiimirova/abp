import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getVehicle } from '../../api';
import ReviewForm from '../../components/ReviewForm';
import useFetch from '../../hooks/useFetch';
import { formatPrice, getSavedReviews, saveReviews } from '../../utils';

export default function VehiclePage() {
  const { vehicleId } = useParams();
  const { data: vehicle, loading, error } = useFetch(() => getVehicle(vehicleId), [vehicleId]);
  const [localReviews, setLocalReviews] = useState(() => getSavedReviews(vehicleId));

  function addReview(review) {
    const next = [review, ...localReviews];
    setLocalReviews(next);
    saveReviews(vehicleId, next);
  }

  if (loading) return <div className="status page-status" role="status"><span className="spinner" />Opening the garage…</div>;
  if (error || vehicle?.category !== 'vehicle') return <div className="status page-status error"><p className="eyebrow">Vehicle unavailable</p><h1>We couldn’t find that car.</h1><p>{error}</p><Link className="button" to="/">Back to inventory</Link></div>;

  const reviews = [...localReviews, ...(vehicle.reviews || [])];
  return (
    <article className="vehicle-page">
      <Link className="back-link" to="/">← Back to inventory</Link>
      <section className="vehicle-intro">
        <div className="vehicle-gallery"><div className="main-image"><img src={vehicle.images[0] || vehicle.thumbnail} alt={vehicle.title} /></div>{vehicle.images.length > 1 && <div className="image-strip">{vehicle.images.slice(1, 4).map((image, index) => <img key={image} src={image} alt={`${vehicle.title} view ${index + 2}`} />)}</div>}</div>
        <div className="vehicle-summary">
          <p className="eyebrow">{vehicle.brand} · {vehicle.availabilityStatus}</p><h1>{vehicle.title}</h1><p className="price">{formatPrice(vehicle.price)}</p><p className="lead">{vehicle.description}</p>
          <dl>
            <div><dt>Rating</dt><dd>{vehicle.rating ? `★ ${vehicle.rating} / 5` : 'Not rated yet'}</dd></div>
            <div><dt>Availability</dt><dd>{vehicle.availabilityStatus}</dd></div>
            <div><dt>Warranty</dt><dd>{vehicle.warrantyInformation}</dd></div>
            <div><dt>Delivery</dt><dd>{vehicle.shippingInformation}</dd></div>
          </dl>
          {vehicle.externalUrl
            ? <a className="button wide" href={vehicle.externalUrl} target="_blank" rel="noreferrer">View listing on AUTO.RIA</a>
            : <a className="button wide" href={`mailto:sales@northline.example?subject=${encodeURIComponent(`Enquiry about ${vehicle.title}`)}`}>Enquire about this car</a>}
        </div>
      </section>
      <section className="reviews-section" aria-labelledby="reviews-heading">
        <div className="section-heading"><div><p className="eyebrow">Owner perspectives</p><h2 id="reviews-heading">Reviews</h2></div><span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span></div>
        <div className="review-layout"><div className="review-list">{reviews.map((review, index) => <article className="review" key={review.id || `${review.reviewerName}-${index}`}><div><strong>{review.reviewerName}</strong><span aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span></div><p>{review.comment}</p><time dateTime={review.date}>{new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time></article>)}</div><aside><p className="eyebrow">Join the conversation</p><h2>Share your drive</h2><p>Your review is saved on this device.</p><ReviewForm onAdd={addReview} /></aside></div>
      </section>
    </article>
  );
}
