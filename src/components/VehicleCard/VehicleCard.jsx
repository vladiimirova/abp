import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils';

export default function VehicleCard({ vehicle }) {
  return (
    <article className="vehicle-card">
      <Link className="card-image" to={`/vehicles/${vehicle.id}`} aria-label={`View ${vehicle.title}`}>
        <img src={vehicle.thumbnail} alt={vehicle.title} loading="lazy" />
        <span>{vehicle.availabilityStatus || 'In stock'}</span>
      </Link>
      <div className="card-copy">
        <div className="card-heading">
          <div><p>{vehicle.brand}</p><h2>{vehicle.title}</h2></div>
          <strong>{formatPrice(vehicle.price)}</strong>
        </div>
        <div className="card-meta">
          <span aria-label={`${vehicle.rating} out of 5 stars`}>★ {vehicle.rating}</span>
          <span>{vehicle.warrantyInformation || 'Warranty included'}</span>
        </div>
        <Link className="text-link" to={`/vehicles/${vehicle.id}`}>View details <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
