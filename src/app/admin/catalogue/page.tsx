'use client';

import { useState, useEffect } from 'react';
import { productsDb, Product } from '@/lib/products';
import { sanitizeInput } from '@/lib/security';

const CATEGORIES = ['Granulation', 'Terrassement', 'Transport', 'Carrière', 'Levage', 'BTP', 'Réfractaire', 'Convoyeur', 'Pièces détachées'];
const EMOJIS = ['🏭', '🚜', '🚛', '⛏️', '🏗️', '🛤️', '⚙️', '🧱', '⛓️', '🚧', '🔧', '📦'];

export default function AdminCatalogManagement() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'machine' | 'materiel'>('machine');
  const [category, setCategory] = useState('Granulation');
  const [emoji, setEmoji] = useState('🏭');
  const [desc, setDesc] = useState('');
  const [specsInput, setSpecsInput] = useState(''); // comma or newline separated specs
  const [featured, setFeatured] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const items = await productsDb.getItems();
    setProductsList(items);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmedName = name.trim();
    const trimmedDesc = desc.trim();

    if (!trimmedName || !trimmedDesc) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    // Process specs (split by newline or semicolon, filter out empty ones)
    const specs = specsInput
      .split(/[\n;]/)
      .map(s => sanitizeInput(s.trim(), 100))
      .filter(s => s.length > 0);

    try {
      await productsDb.addItem({
        name: sanitizeInput(trimmedName, 100),
        type,
        category,
        emoji,
        desc: sanitizeInput(trimmedDesc, 1000),
        specs,
        featured
      });

      setMessage({ type: 'success', text: 'Produit ajouté avec succès au catalogue !' });
      
      // Reset form
      setName('');
      setDesc('');
      setSpecsInput('');
      setFeatured(false);
      
      loadProducts();
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout du produit.' });
    }
  };

  const handleDelete = async (id: string) => {
    const matched = productsList.find(p => p.id === id);
    if (!matched) return;

    if (confirm(`Voulez-vous vraiment supprimer définitivement le produit "${matched.name}" du catalogue ?`)) {
      try {
        await productsDb.deleteItem(id);
        setMessage({ type: 'success', text: 'Produit supprimé du catalogue avec succès.' });
        loadProducts();
      } catch {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression du produit.' });
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Gestion du <span className="text-gold-gradient">Catalogue</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Consultez, ajoutez ou supprimez des machines et du matériel de votre catalogue industriel connecté en temps réel.
        </p>
      </div>

      {message && (
        <div style={{
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: '1px solid ' + (message.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'),
          color: message.type === 'success' ? '#4ade80' : '#f87171',
          padding: '1rem', borderRadius: '8px', marginBottom: '2rem',
          fontSize: '0.9rem', fontWeight: 600, textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* Grid: Form & List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="catalog-grid">
        
        {/* Add Form */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            📦 Ajouter un <span className="text-gold-gradient">Produit</span>
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                TYPE DE PRODUIT *
              </label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="prod-type" checked={type === 'machine'} onChange={() => setType('machine')} style={{ accentColor: '#f5a623' }} />
                  🏭 Machine Industrielle
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="prod-type" checked={type === 'materiel'} onChange={() => setType('materiel')} style={{ accentColor: '#f5a623' }} />
                  🧱 Matériel / Réfractaires
                </label>
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                NOM DE L&apos;ARTICLE *
              </label>
              <input
                type="text"
                placeholder="ex: Concasseur Blick 300T"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  CATÉGORIE *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  EMOJI AVATAR *
                </label>
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  {EMOJIS.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                DESCRIPTION TECHNIQUE *
              </label>
              <textarea
                placeholder="Entrez une description concise mais détaillée..."
                required
                rows={4}
                maxLength={1000}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                SPÉCIFICATIONS TECHNIQUES (UNE PAR LIGNE)
              </label>
              <textarea
                placeholder="ex: Capacité: 150 T/h&#10;Puissance: 75 kW&#10;Poids: 12 tonnes"
                rows={4}
                value={specsInput}
                onChange={(e) => setSpecsInput(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
              <input
                type="checkbox"
                id="feat-checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ accentColor: '#f5a623', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="feat-checkbox" style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                🌟 Afficher ce produit en vedette (Featured)
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ➕ Publier dans le Catalogue
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            📋 Liste des Articles ({productsList.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '4rem 0' }}>
              Chargement des articles...
            </div>
          ) : productsList.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '0.85rem' }}>Aucun produit dans le catalogue.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {productsList.map((item) => (
                <div key={item.id} style={{
                  padding: '1.25rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden',
                    background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', flexShrink: 0
                  }}>
                    {item.emoji}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'white' }}>
                        {item.name} {item.featured && <span style={{ color: '#f5a623', fontSize: '0.75rem' }}>⭐ Vedette</span>}
                      </h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: '0.25rem 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {item.specs.slice(0, 3).map((spec, sIdx) => (
                        <span key={sIdx} style={{ fontSize: '0.68rem', color: '#f5a623', background: 'rgba(245,166,35,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171', width: '34px', height: '34px', borderRadius: '6px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', flexShrink: 0
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
