'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const stats = [
  { value: '500+', label: 'Machines vendues' },
  { value: '150+', label: 'Clients satisfaits' },
  { value: '10+', label: "Années d'expérience" },
  { value: 'Afrique', label: 'Livraison continentale' },
];

const features = [
  {
    icon: '⚙️',
    title: 'Machines de Haute Qualité',
    desc: 'Équipements certifiés, fabriqués selon les normes industrielles chinoises et internationales les plus strictes.',
  },
  {
    icon: '🚚',
    title: 'Livraison Rapide',
    desc: 'Réseau logistique optimisé depuis la Chine vers le Cameroun. Délais maîtrisés et traçabilité complète.',
  },
  {
    icon: '🔧',
    title: 'Service Après-Vente',
    desc: "Support technique disponible, installation et maintenance assurées par nos équipes d'experts locaux.",
  },
  {
    icon: '💰',
    title: 'Prix Compétitifs',
    desc: 'Accès direct au fabricant chinois. Élimination des intermédiaires pour les meilleurs prix du marché.',
  },
  {
    icon: '📋',
    title: 'Devis Personnalisés',
    desc: 'Chaque projet est unique. Nous vous proposons des solutions sur mesure adaptées à vos besoins.',
  },
  {
    icon: '🌍',
    title: 'Livraison Pan-Africaine',
    desc: "Basés à Douala, nous livrons nos machines partout en Afrique avec un solide réseau de partenaires dans la majorité des pays d'Afrique de l'Ouest.",
  },
];

const products = [
  { name: 'Granuleuse Industrielle', category: 'Granulation', price: 'Sur devis', emoji: '🏭' },
  { name: 'Excavatrice Hydraulique', category: 'Terrassement', price: 'Sur devis', emoji: '🚜' },
  { name: 'Camion Benne Lourd', category: 'Transport', price: 'Sur devis', emoji: '🚛' },
  { name: 'Concasseur de Pierre', category: 'Carrière', price: 'Sur devis', emoji: '⛏️' },
  { name: 'Grue de Chantier', category: 'Levage', price: 'Sur devis', emoji: '🏗️' },
  { name: 'Compacteur Routier', category: 'BTP', price: 'Sur devis', emoji: '🛤️' },
];

export default function HomePage() {
  const [countStarted, setCountStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState({
    aboutText: "Blick Machinery Cameroon SARL (filiale de Blick Refractory Technology, Chine) livre ses machines partout en Afrique et s'appuie sur des partenaires locaux établis dans la majorité des pays d'Afrique de l'Ouest.",
    telAdmin: "+237 6 99 95 20 90",
    locationAdmin: "Stade Militi, Nditam, Douala, Cameroun"
  });

  useEffect(() => {
    import('@/lib/auth').then(({ db }) => {
      db.getSettings().then((s) => setSettings(s));
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 40%, #1a3a5c 70%, #0d1b2a 100%)',
        position: 'relative', overflow: 'hidden', padding: '2rem 1.5rem',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,166,35,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245,166,35,0.05) 0%, transparent 40%),
            radial-gradient(circle at 60% 80%, rgba(245,166,35,0.04) 0%, transparent 35%)`,
        }} />
        {/* Animated gears */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%', fontSize: '8rem', opacity: 0.04,
          animation: 'spin 20s linear infinite',
        }}>⚙️</div>
        <div style={{
          position: 'absolute', bottom: '15%', left: '3%', fontSize: '5rem', opacity: 0.05,
          animation: 'spin 15s linear infinite reverse',
        }}>⚙️</div>

        <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: '50px', padding: '0.4rem 1.2rem', marginBottom: '2rem',
            animation: 'fadeInUp 0.5s ease forwards',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5a623', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: '#f5a623', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em' }}>
              MACHINES INDUSTRIELLES — DOUALA, CAMEROUN
            </span>
          </div>

          {/* Main title */}
          <h1 className="section-title" style={{
            marginBottom: '1.5rem', fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}>
            <span style={{ color: 'white' }}>L&apos;Excellence</span>{' '}
            <span className="text-gold-gradient">Industrielle</span>
            <br />
            <span style={{ color: 'white' }}>à votre Portée</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem',
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}>
            Blick Machinery Cameroon SARL, filiale de <strong style={{ color: '#f5a623' }}>Blick Refractory Technology (Chine)</strong>.
            Votre partenaire de confiance pour les machines industrielles, granuleuses et équipements lourds.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}>
            <Link href="/catalogue" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.2rem', borderRadius: '10px' }}>
                🔍 Voir le Catalogue
              </button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ fontSize: '1rem', padding: '0.9rem 2.2rem', borderRadius: '10px' }}>
                📋 Demander un Devis
              </button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div style={{
            marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            animation: 'fadeInUp 0.6s ease 0.5s both',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>DÉFILER</span>
            <div style={{
              width: '2px', height: '40px',
              background: 'linear-gradient(180deg, #f5a623, transparent)',
              animation: 'pulse 2s infinite',
            }} />
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={statsRef} style={{
        background: 'linear-gradient(135deg, #f5a623 0%, #d4891a 100%)',
        padding: '3rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                color: '#0d1b2a', lineHeight: 1,
                transform: countStarted ? 'scale(1)' : 'scale(0.8)',
                transition: `transform 0.5s ease ${i * 0.1}s`,
              }}>
                {stat.value}
              </div>
              <div style={{ color: 'rgba(13,27,42,0.7)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.4rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section style={{ padding: '6rem 1.5rem', background: '#0d1b2a' }}>
        <div className="grid-responsive-2" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'center' }}>
          <div>
            <div style={{
              background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)',
              borderRadius: '20px', padding: '3rem', textAlign: 'center',
              fontSize: '6rem',
            }}>
              🏭
              <div style={{ fontSize: '1rem', color: '#f5a623', fontWeight: 700, marginTop: '1rem' }}>
                Blick Refractory Technology
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>
                Partenaire industriel depuis la Chine 🇨🇳
              </div>
            </div>
          </div>
          <div>
            <div className="gold-divider" style={{ marginBottom: '1rem' }} />
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: 'white' }}>Qui sommes-</span>
              <span className="text-gold-gradient">nous ?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              <strong style={{ color: '#f5a623' }}>Blick Machinery Cameroon SARL</strong> est la représentation officielle au Cameroun de la société chinoise <strong style={{ color: 'white' }}>Blick Refractory Technology</strong>, spécialisée dans la fabrication de machines industrielles de haute performance.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Basés à l&apos;adresse suivante : <strong style={{ color: 'white' }}>{settings.locationAdmin}</strong>, nous livrons nos machines partout en Afrique et collaborons avec des partenaires logistiques et techniques dans la majority des pays de l&apos;Afrique de l&apos;Ouest.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/a-propos" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">En savoir plus</button>
              </Link>
              <a href={`tel:${settings.telAdmin}`} style={{ textDecoration: 'none' }}>
                <button className="btn-outline">📞 Nous appeler</button>
              </a>
            </div>
          </div>
        </div>

        <style>{`
          .grid-responsive-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
          }
          @media (max-width: 768px) {
            .grid-responsive-2 {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* ===== PRODUCTS PREVIEW ===== */}
      <section style={{ padding: '6rem 1.5rem', background: '#0f2033' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              Nos <span className="text-gold-gradient">Produits</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto' }}>
              Découvrez notre gamme complète de machines industrielles et équipements lourds
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {products.map((product, i) => (
              <div key={i} className="glass-card card-hover" style={{ padding: '2rem', cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{product.emoji}</div>
                <div className="product-badge" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>{product.category}</div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Machine industrielle de haute qualité, certifiée et garantie.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f5a623', fontWeight: 700 }}>{product.price}</span>
                  <Link href="/contact" style={{ textDecoration: 'none' }}>
                    <button style={{
                      background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                      color: '#f5a623', borderRadius: '6px', padding: '0.4rem 0.9rem',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    }}>
                      Devis →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/catalogue" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                Voir tout le Catalogue →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section style={{ padding: '6rem 1.5rem', background: '#0d1b2a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              Pourquoi nous <span className="text-gold-gradient">choisir ?</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((feat, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  fontSize: '2rem', width: '56px', height: '56px', borderRadius: '12px',
                  background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {feat.icon}
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{feat.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(13,27,42,1) 50%, rgba(245,166,35,0.08) 100%)',
        borderTop: '1px solid rgba(245,166,35,0.15)',
        borderBottom: '1px solid rgba(245,166,35,0.15)',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
            Prêt à <span className="text-gold-gradient">démarrer</span> votre projet ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Contactez-nous dès aujourd&apos;hui pour obtenir un devis personnalisé. Notre équipe vous répond rapidement.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <button className="btn-primary animate-pulse-gold" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                📋 Demander un Devis Gratuit
              </button>
            </Link>
            <a href={`tel:${settings.telAdmin}`} style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                📞 {settings.telAdmin}
              </button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
