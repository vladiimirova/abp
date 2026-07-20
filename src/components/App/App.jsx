import { Link, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import CatalogPage from '../../pages/CatalogPage';
import VehiclePage from '../../pages/VehiclePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/vehicles/:vehicleId" element={<VehiclePage />} />
        <Route path="*" element={<section className="not-found"><p className="eyebrow">404</p><h1>That road ends here.</h1><Link className="button" to="/">Back to inventory</Link></section>} />
      </Routes>
    </Layout>
  );
}
