import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Northline showroom home">
          <span className="brand-mark">N</span>
          <span>Northline</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Inventory</Link>
          <a href="mailto:hello@northline.example">Contact</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <div><strong>Northline</strong><span>Cars worth the drive.</span></div>
        <span>© {new Date().getFullYear()} Northline Showroom</span>
      </footer>
    </div>
  );
}
