'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'ACCUEIL' },
  { href: '/catalogue', label: 'CATALOGUE' },
  { href: '/galerie', label: 'GALERIE' },
  { href: '/a-propos', label: 'À PROPOS' },
  { href: '/contact', label: 'CONTACT' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(13, 27, 42, 0.97)'
          : 'rgba(13, 27, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(245,166,35,0.2)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'white',
            boxShadow: '0 4px 15px rgba(245,166,35,0.4)',
          }}>
            <Image src="/logo.jpg" alt="Blick Machinery Logo" width={52} height={52} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div className="brand-title" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'white', lineHeight: 1.1 }}>BLICK MACHINERY</div>
            <div style={{ fontSize: '0.65rem', color: '#f5a623', fontWeight: 500, letterSpacing: '0.08em' }}>CAMEROON SARL</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#f5a623';
                (e.target as HTMLElement).style.background = 'rgba(245,166,35,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Button & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
              {['admin', 'editor', 'negotiator'].includes(user.role) && (
                <Link href="/admin" style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.6rem 1.1rem', border: '1px solid #f5a623', color: '#f5a623', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                    {pathname.startsWith('/admin') ? 'Admin' : 'Gestion'}
                  </button>
                </Link>
              )}
              <button 
                onClick={logout} 
                className="btn-secondary" 
                style={{ fontSize: '0.78rem', padding: '0.6rem 1.1rem', border: '1px solid rgba(255,255,255,0.25)', color: 'white', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link href="/auth/login" style={{ textDecoration: 'none' }} className="desktop-nav">
              <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.6rem 1.1rem', border: '1px solid rgba(255,255,255,0.25)', color: 'white', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Connexion
              </button>
            </Link>
          )}

          <Link href="/contact" style={{ textDecoration: 'none' }} className="cta-button-header">
            <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem 1.4rem' }}>
              Demander un Devis
            </button>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'white', padding: '0.25rem', display: 'none',
            }}
            className="hamburger"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(13,27,42,0.98)', borderTop: '1px solid rgba(245,166,35,0.1)',
          padding: '1rem 1.5rem',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                letterSpacing: '0.06em',
              }}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              {['admin', 'editor', 'negotiator'].includes(user.role) && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', color: '#f5a623', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {pathname.startsWith('/admin') ? 'ADMINISTRATION' : 'GESTION'}
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none',
                  fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'
                }}
              >
                SE DÉCONNECTER
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                fontSize: '0.9rem', fontWeight: 600, padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              CONNEXION / INSCRIPTION
            </Link>
          )}

          <Link href="/contact" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', display: 'block', marginTop: '1rem' }}>
            <button className="btn-primary" style={{ width: '100%' }}>Demander un Devis</button>
          </Link>
        </div>
      )}

      <style>{`
        .brand-title {
          font-size: 1.1rem;
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
          .cta-button-header { display: none !important; }
        }
        @media (max-width: 480px) {
          .brand-title {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </nav>
  );
}
