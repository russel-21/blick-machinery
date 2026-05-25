'use client';

import { useState, useEffect } from 'react';
import { mediaDb, MediaItem, mediaCategories } from '@/lib/media';
import { useAuth } from '@/components/AuthProvider';

import { sanitizeInput } from '@/lib/security';

export default function GaleriePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('Tout');
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);
  
  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    // Load from local storage db
    setItems(mediaDb.getItems());
  }, []);

  // Update modal item in real-time when underlying data changes
  const updateModalState = (itemId: string) => {
    const updatedItems = mediaDb.getItems();
    setItems(updatedItems);
    if (activeModalItem && activeModalItem.id === itemId) {
      const match = updatedItems.find((i) => i.id === itemId);
      if (match) setActiveModalItem(match);
    }
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking like on card
    mediaDb.likeItem(id);
    updateModalState(id);
  };

  const handleCommentSubmit = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const trimmedText = commentText.trim();
    if (!trimmedText) return;

    // Use logged in user name if available
    const rawAuthor = user ? user.name : commentName || 'Visiteur Anonyme';
    const cleanAuthor = sanitizeInput(rawAuthor.trim(), 50);
    const cleanText = sanitizeInput(trimmedText, 500);

    mediaDb.addComment(itemId, cleanAuthor, cleanText);
    
    setCommentText('');
    if (!user) setCommentName('');
    
    updateModalState(itemId);
  };

  const handleShare = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate share URL copying
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/galerie?item=${itemId}` : '';
    navigator.clipboard.writeText(shareUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  // Filter items based on selected category
  const filteredItems = selectedCat === 'Tout'
    ? items
    : items.filter((item) => item.category === selectedCat);

  return (
    <>
      {/* Header */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 100%)',
        borderBottom: '1px solid rgba(245,166,35,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            Notre <span className="text-gold-gradient">Galerie</span> Interactive
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Découvrez nos machines de chantier, excavatrices et granuleuses en action réelle. Cliquez sur un média pour l&apos;inspecter, aimer, ou commenter !
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ padding: '2.2rem 1.5rem', background: '#0f2033', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {mediaCategories.map((cat) => {
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: '50px', border: '1px solid',
                  borderColor: isSelected ? '#f5a623' : 'rgba(245,166,35,0.2)',
                  background: isSelected ? '#f5a623' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#0d1b2a' : 'rgba(255,255,255,0.7)',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(245,166,35,0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#f5a623';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'rgba(245,166,35,0.2)';
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Gallery grid */}
      <section style={{ padding: '4rem 1.5rem', background: '#0d1b2a', minHeight: '50vh' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '4rem 0' }}>
              <span style={{ fontSize: '3rem' }}>📭</span>
              <h3 style={{ margin: '1rem 0 0 0' }}>Aucun média disponible dans cette catégorie</h3>
              <p style={{ fontSize: '0.9rem' }}>Ajoutez des photos ou vidéos depuis le panneau d&apos;administration.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}>
              {filteredItems.map((item, i) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveModalItem(item)}
                  className="card-hover glass-card" 
                  style={{
                    borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid rgba(245,166,35,0.1)',
                    display: 'flex', flexDirection: 'column'
                  }}
                >
                  {/* Media Visual Area */}
                  <div style={{
                    minHeight: '220px',
                    height: '220px',
                    position: 'relative',
                    background: '#0a1628',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {item.type === 'image' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }} className="gallery-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(245,166,35,0.85)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#0d1b2a',
                            paddingLeft: '3px', boxShadow: '0 4px 15px rgba(245,166,35,0.4)'
                          }}>
                            ▶
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Category overlay */}
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <span className="product-badge" style={{ fontSize: '0.7rem', fontWeight: 700 }}>{item.category}</span>
                    </div>
                  </div>

                  {/* Info and Actions Preview */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{item.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1.25rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button 
                        onClick={(e) => handleLike(item.id, e)}
                        style={{
                          background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        <span>👍</span> {item.likes} Likes
                      </button>
                      <button 
                        onClick={(e) => handleShare(item.id, e)}
                        style={{
                          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        <span>🔗</span> Partager
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Callout */}
          <div style={{
            marginTop: '5rem', padding: '3.5rem 2rem', borderRadius: '16px', textAlign: 'center',
            background: 'rgba(245,166,35,0.04)', border: '1px dashed rgba(245,166,35,0.3)',
          }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>📸</div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              Partenaire Blick Machinery ?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.75rem', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto 1.75rem' }}>
              Soumettez vos photos ou vidéos de chantiers en Afrique. Notre équipe technique publiera vos réalisations directement sur cette page.
            </p>
            <a href="mailto:[EMAIL_ADMIN]" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '0.8rem 1.8rem' }}>✉️ Nous envoyer vos médias</button>
            </a>
          </div>
        </div>
      </section>

      {/* ================= DETAILED MODAL POPUP ================= */}
      {activeModalItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex',
          padding: '1.5rem', overflowY: 'auto'
        }}>
          {/* Modal Card */}
          <div className="glass-card modal-content-grid" style={{
            width: '100%', maxWidth: '1000px', borderRadius: '20px', overflow: 'hidden',
            border: '1px solid rgba(245,166,35,0.25)', background: '#0d1b2a',
            display: 'grid', gridTemplateColumns: '1.2fr 1fr',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            position: 'relative', margin: 'auto'
          }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveModalItem(null)}
              style={{
                position: 'absolute', top: '15px', right: '20px', zIndex: 10,
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                width: '38px', height: '38px', borderRadius: '50%',
                fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ×
            </button>

            {/* Left side: Media Viewer */}
            <div style={{
              background: '#060f1c', display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative', minHeight: '300px'
            }}>
              {activeModalItem.type === 'image' ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeModalItem.url} alt={activeModalItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '550px' }} />
              ) : (
                <video src={activeModalItem.url} style={{ width: '100%', height: '100%', maxHeight: '550px' }} controls autoPlay muted />
              )}
            </div>

            {/* Right side: Comments & Actions */}
            <div style={{
              padding: '2.5rem', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', maxHeight: '550px', overflowY: 'auto',
              borderLeft: '1px solid rgba(255,255,255,0.06)'
            }} className="modal-right-side">
              
              <div>
                {/* Meta details */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="product-badge" style={{ fontSize: '0.72rem' }}>{activeModalItem.category}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    Type : {activeModalItem.type === 'image' ? 'Image' : 'Vidéo'}
                  </span>
                </div>
                
                {/* Title */}
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif" }}>
                  {activeModalItem.title}
                </h2>
                
                {/* Desc */}
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {activeModalItem.desc}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <button 
                    onClick={(e) => handleLike(activeModalItem.id, e)}
                    style={{
                      background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
                      color: '#f5a623', padding: '0.6rem 1.2rem', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    👍 Aimer ({activeModalItem.likes})
                  </button>
                  
                  <button 
                    onClick={(e) => handleShare(activeModalItem.id, e)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)', padding: '0.6rem 1.2rem', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    🔗 Copier le Lien
                  </button>
                </div>

                {shareSuccess && (
                  <div style={{
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#4ade80', fontSize: '0.78rem', padding: '0.5rem', borderRadius: '6px',
                    textAlign: 'center', marginBottom: '1.25rem', fontWeight: 600
                  }}>
                    📋 Lien copié dans le presse-papier !
                  </div>
                )}

                {/* Comments List */}
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>💬 Commentaires</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {activeModalItem.comments.length}
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  {activeModalItem.comments.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Aucun commentaire pour le moment. Soyez le premier à commenter !
                    </p>
                  ) : (
                    activeModalItem.comments.map((c) => (
                      <div key={c.id} style={{
                        padding: '0.75rem 1rem', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f5a623' }}>{c.userName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
                          {c.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={(e) => handleCommentSubmit(e, activeModalItem.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                {!user && (
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    required
                    maxLength={50}
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    style={{
                      padding: '0.75rem', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', outline: 'none', fontSize: '0.8rem'
                    }}
                  />
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={user ? `Commenter en tant que ${user.name}...` : "Écrire un commentaire..."}
                    required
                    maxLength={500}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', outline: 'none', fontSize: '0.8rem'
                    }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    Publier
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      <style>{`
        .gallery-img:hover {
          transform: scale(1.05);
        }
        @media (max-width: 800px) {
          .modal-content-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-right-side {
            max-height: none !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }
      `}</style>
    </>
  );
}
