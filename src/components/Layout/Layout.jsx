import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Northline showroom home">
          <span className="brand-mark">N</span>
          <span>Northline</span>
        </Link>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
      <footer id="contacts">
        <div className="footer-brand">
          <strong>Northline</strong>
          <span>Cars worth the drive.</span>
        </div>
        <div className="footer-right">
          <address>
            <a href="tel:+380441234567">+380 44 123 45 67</a>
            <a href="mailto:sales@northline.com">sales@northline.com</a>
            <span>Kyiv, 12 Peremohy Avenue</span>
            <a href="https://auto.ria.com/" target="_blank" rel="noreferrer">Vehicle data by AUTO.RIA</a>
          </address>
          <span className="copyright">© {new Date().getFullYear()} Northline Showroom</span>
        </div>
      </footer>
    </div>
  );
}
