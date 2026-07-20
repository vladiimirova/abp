import { useMemo, useState } from 'react';
import { getVehicles } from '../../api';
import VehicleCard from '../../components/VehicleCard';
import useFetch from '../../hooks/useFetch';

export default function CatalogPage() {
  const { data: vehicles, loading, error } = useFetch(getVehicles);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [rating, setRating] = useState('0');

  const filtered = useMemo(() => {
    const result = (vehicles || []).filter((vehicle) => {
      const searchable = `${vehicle.title} ${vehicle.brand} ${vehicle.description}`.toLowerCase();
      return searchable.includes(query.trim().toLowerCase()) && vehicle.rating >= Number(rating);
    });
    if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [vehicles, query, sort, rating]);

  return (
    <>
      <section className="hero">
        <div><p className="eyebrow">Curated inventory · 2026</p><h1>Find the car that<br /><em>moves you.</em></h1></div>
        <p>Considered vehicles, transparent details, and honest reviews—all in one place.</p>
      </section>

      <section className="catalog" aria-labelledby="inventory-heading">
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2 id="inventory-heading">Available vehicles</h2></div><span>{filtered.length} {filtered.length === 1 ? 'vehicle' : 'vehicles'}</span></div>
        <form className="filters" onSubmit={(event) => event.preventDefault()} role="search">
          <label className="search-field"><span className="sr-only">Search inventory</span><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} maxLength="60" placeholder="Search by make or model" /></label>
          <label><span className="sr-only">Minimum rating</span><select value={rating} onChange={(e) => setRating(e.target.value)}><option value="0">Any rating</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select></label>
          <label><span className="sr-only">Sort vehicles</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select></label>
        </form>

        {loading && <div className="status" role="status"><span className="spinner" />Preparing the showroom…</div>}
        {error && <div className="status error" role="alert"><h2>We hit a red light.</h2><p>{error}</p><button className="button" onClick={() => window.location.reload()}>Try again</button></div>}
        {!loading && !error && filtered.length > 0 && <div className="vehicle-grid">{filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>}
        {!loading && !error && filtered.length === 0 && <div className="status"><h2>No matching cars</h2><p>Try a broader search or reset your filters.</p><button className="button" onClick={() => { setQuery(''); setRating('0'); }}>Clear filters</button></div>}
      </section>
    </>
  );
}
