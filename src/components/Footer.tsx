'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const footerLinks = {
  entreprise: [
    { href: '/a-propos', label: 'À Propos' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/galerie', label: 'Galerie' },
    { href: '/faq', label: 'FAQ' },
  ],
  services: [
    { href: '/contact', label: 'Demande de Devis' },
    { href: '/catalogue', label: 'Machines Industrielles' },
    { href: '/catalogue', label: 'Équipements Lourds' },
    { href: '/contact', label: 'Service Après-Vente' },
  ],
};

function SocialIcon({ s }: { s: { name: string; href: string; icon: React.ReactNode } }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      title={s.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '38px', height: '38px', borderRadius: '50%',
        background: hovered ? '#f5a623' : 'rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? '#0d1b2a' : 'rgba(255,255,255,0.7)',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        flexShrink: 0,
      }}
    >
      {s.icon}
    </a>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li style={{ marginBottom: '0.6rem' }}>
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color: hovered ? '#f5a623' : 'rgba(255,255,255,0.55)',
          textDecoration: 'none', fontSize: '0.875rem',
          transition: 'color 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
      >
        <span style={{ color: '#f5a623', fontSize: '0.6rem' }}>▶</span>
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState({
    aboutText: "Filiale de Blick Refractory Technology (Chine). Spécialiste en machines industrielles et équipements lourds au Cameroun.",
    facebookUrl: "https://www.facebook.com/sistenar",
    whatsappNumber: "237699952090",
    tiktokUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#",
    emailAdmin: "[EMAIL_ADMIN]",
    telAdmin: "+237 6 99 95 20 90",
    locationAdmin: "Stade Militi, Nditam, Douala, Cameroun"
  });

  useEffect(() => {
    import('@/lib/auth').then(({ db }) => {
      db.getSettings().then((saved) => {
        setSettings(saved);
      });
    });
  }, []);

  const socialLinks = [
    {
      name: 'Facebook',
      href: settings.facebookUrl || 'https://www.facebook.com/sistenar',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: settings.instagramUrl || '#',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: settings.tiktokUrl || '#',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.55V6.85a4.85 4.85 0 01-1.06-.16z"/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/${(settings.whatsappNumber || '').replace(/\+/g, '')}`,
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: settings.youtubeUrl || '#',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: '#0a1628', borderTop: '1px solid rgba(245,166,35,0.15)' }}>
      {/* Main footer */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '4rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'white',
                boxShadow: '0 4px 15px rgba(245,166,35,0.3)',
              }}>
                <Image src="/logo.jpg" alt="Blick Machinery Logo" width={48} height={48} style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'white' }}>BLICK MACHINERY</div>
                <div style={{ fontSize: '0.6rem', color: '#f5a623', fontWeight: 500 }}>CAMEROON SARL</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {settings.aboutText}
            </p>

            {/* Réseaux sociaux */}
            <div>
              <p style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>SUIVEZ-NOUS</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {socialLinks.map((s) => <SocialIcon key={s.name} s={s} />)}
              </div>
            </div>
          </div>

          {/* Liens entreprise */}
          <div>
            <h4 style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>ENTREPRISE</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {footerLinks.entreprise.map((link) => (
                <FooterLink key={link.href + link.label} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* Liens services */}
          <div>
            <h4 style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>SERVICES</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {footerLinks.services.map((link, i) => (
                <FooterLink key={i} href={link.href} label={link.label} />
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>CONTACT</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <a href={`tel:${settings.telAdmin}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
                <span style={{ color: '#f5a623', fontSize: '1rem' }}>📞</span>
                {settings.telAdmin}
              </a>
              <a href={`mailto:${settings.emailAdmin}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                <span style={{ color: '#f5a623', fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>✉️</span>
                {settings.emailAdmin}
              </a>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                <span style={{ color: '#f5a623', fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>📍</span>
                {settings.locationAdmin}
              </div>
              <a href={`https://wa.me/${(settings.whatsappNumber || '').replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
                <button style={{
                  background: '#25d366', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  💬 WhatsApp Direct
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Barre basse */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 1.5rem' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Blick Machinery Cameroon SARL. Tous droits réservés.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            Filiale de <span style={{ color: '#f5a623' }}>Blick Refractory Technology</span> — Chine
          </p>
        </div>
      </div>
    </footer>
  );
}
