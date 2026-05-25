import type { Metadata } from 'next';
import Link from 'next/link';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Catalogue | Blick Machinery Cameroon SARL',
  description: 'Découvrez notre catalogue complet de machines industrielles, granuleuses et équipements lourds disponibles au Cameroun.',
};

const categories = ['Tous', 'Granulation', 'Terrassement', 'Transport', 'Carrière', 'Levage', 'BTP', 'Réfractaire', 'Convoyeur', 'Pièces détachées'];

export default function CataloguePage() {
  return (
    <>
      {/* Header */}
      <section style={{
        padding: '5rem 1.5rem 3rem',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 100%)',
        borderBottom: '1px solid rgba(245,166,35,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Notre <span className="text-gold-gradient">Catalogue</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Machines industrielles, équipements lourds et matériaux réfractaires importés directement de Chine
          </p>
        </div>
      </section>

      {/* Categories filter */}
      <section style={{ padding: '2rem 1.5rem', background: '#0f2033', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat, i) => (
            <button key={cat} style={{
              padding: '0.5rem 1.2rem', borderRadius: '50px', border: '1px solid',
              borderColor: i === 0 ? '#f5a623' : 'rgba(245,166,35,0.25)',
              background: i === 0 ? '#f5a623' : 'transparent',
              color: i === 0 ? '#0d1b2a' : 'rgba(255,255,255,0.65)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s ease', letterSpacing: '0.04em',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section style={{ padding: '4rem 1.5rem', background: '#0d1b2a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Featured */}
          <h2 style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>
            ⭐ PRODUITS VEDETTES
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {products.filter(p => p.featured).map((product) => (
              <div key={product.id} className="glass-card card-hover" style={{
                padding: '2rem', border: '1px solid rgba(245,166,35,0.25)',
                background: 'rgba(245,166,35,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3rem' }}>{product.emoji}</span>
                    <span className="product-badge">⭐ Vedette</span>
                  </div>
                  <div className="product-badge" style={{ display: 'inline-block', marginBottom: '0.5rem', background: 'rgba(245,166,35,0.15)', color: '#f5a623' }}>{product.category}</div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.75rem' }}>{product.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{product.desc}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {product.specs.map((spec, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ color: '#f5a623', fontSize: '0.55rem' }}>●</span> {spec}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link href="/contact" style={{ textDecoration: 'none', flex: 1 }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.85rem' }}>
                      Demander un Devis
                    </button>
                  </Link>
                  <a href="https://wa.me/237699952090" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{
                      background: '#25d366', border: 'none', borderRadius: '8px', padding: '0.7rem 1rem',
                      color: 'white', cursor: 'pointer', fontSize: '1.1rem',
                    }}>💬</button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* All products */}
          <h2 style={{ color: '#f5a623', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>
            📦 TOUS LES PRODUITS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {products.map((product) => (
              <div key={product.id} className="glass-card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{product.emoji}</span>
                    <div>
                      <div className="product-badge" style={{ marginBottom: '0.25rem', display: 'inline-block' }}>{product.category}</div>
                      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</h3>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '1rem' }}>{product.desc}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f5a623', fontSize: '0.85rem', fontWeight: 700 }}>Prix sur devis</span>
                  <Link href="/contact" style={{ textDecoration: 'none' }}>
                    <button style={{
                      background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                      color: '#f5a623', borderRadius: '6px', padding: '0.35rem 0.8rem',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    }}>
                      Devis →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '4rem', padding: '3rem', borderRadius: '16px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.05))',
            border: '1px solid rgba(245,166,35,0.2)',
          }}>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Vous ne trouvez pas ce que vous cherchez ?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
              Contactez-nous directement. Nous pouvons importer tout type de machine depuis la Chine.
            </p>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                📋 Nous Contacter
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
