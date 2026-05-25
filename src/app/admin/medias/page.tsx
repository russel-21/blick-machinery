'use client';

import { useState, useEffect } from 'react';
import { mediaDb, MediaItem, mediaCategories } from '@/lib/media';
import { useAuth } from '@/components/AuthProvider';
import { sanitizeUrl, sanitizeInput } from '@/lib/security';

export default function AdminMediaManagement() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [category, setCategory] = useState('Granulation');
  const [desc, setDesc] = useState('');
  const [sourceType, setSourceType] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getYouTubeThumbnail = (mediaUrl: string): string | null => {
    if (!mediaUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = mediaUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    return null;
  };

  const loadMedia = async () => {
    const list = await mediaDb.getItems();
    setItems(list);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Le fichier est trop volumineux (max 5 Mo).' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 1200; // max width/height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setFileBase64(compressed);
          } else {
            setFileBase64(result);
          }
        };
      } else {
        setFileBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const rawMediaUrl = sourceType === 'url' ? url : fileBase64;
    
    // Trim and validate fields
    const trimmedTitle = title.trim();
    const trimmedDesc = desc.trim();
    const sanitizedMediaUrl = sanitizeUrl(rawMediaUrl);

    if (!trimmedTitle || !trimmedDesc || !sanitizedMediaUrl || sanitizedMediaUrl === '#') {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires avec des valeurs valides.' });
      return;
    }

    if (sourceType === 'url') {
      const isHttpUrl = /^https?:\/\//i.test(sanitizedMediaUrl);
      if (!isHttpUrl) {
        setMessage({ type: 'error', text: 'Le lien URL doit obligatoirement commencer par http:// ou https://.' });
        return;
      }
    }

    try {
      await mediaDb.addItem({
        title: sanitizeInput(trimmedTitle, 100),
        type,
        category,
        desc: sanitizeInput(trimmedDesc, 1500),
        url: sanitizedMediaUrl
      });

      // Reset form
      setTitle('');
      setDesc('');
      setUrl('');
      setFileBase64('');
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setMessage({ type: 'success', text: 'Le média a été ajouté avec succès à la galerie publique !' });
      loadMedia();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout du média.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce média de la galerie publique ?')) {
      const updated = items.filter((item) => item.id !== id);
      await mediaDb.saveItems(updated);
      setItems(updated);
      setMessage({ type: 'success', text: 'Le média a été supprimé.' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Gestion des <span className="text-gold-gradient">Médias</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Importez des photos ou des vidéos (par URL ou par fichier) pour alimenter la galerie publique et permettre aux utilisateurs de liker et commenter.
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="media-grid">
        
        {/* Add Form */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            📥 Ajouter un <span className="text-gold-gradient">Média</span>
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                TYPE DE MÉDIA *
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="media-type" checked={type === 'image'} onChange={() => setType('image')} style={{ accentColor: '#f5a623' }} />
                  🖼️ Image
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="media-type" checked={type === 'video'} onChange={() => setType('video')} style={{ accentColor: '#f5a623' }} />
                  🎥 Vidéo
                </label>
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                TITRE DU MÉDIA *
              </label>
              <input
                type="text"
                placeholder="ex: Installation excavatrice Douala"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
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
                {mediaCategories.filter(c => c !== 'Tout').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                SOURCE D&apos;IMPORTATION *
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="source-type" checked={sourceType === 'url'} onChange={() => setSourceType('url')} style={{ accentColor: '#f5a623' }} />
                  🔗 Lien URL
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="radio" name="source-type" checked={sourceType === 'file'} onChange={() => setSourceType('file')} style={{ accentColor: '#f5a623' }} />
                  📁 Fichier local
                </label>
              </div>

              {sourceType === 'url' ? (
                <input
                  type="url"
                  placeholder="https://ex: video-youtube.com/watch?v=xxx ou image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', fontSize: '0.85rem'
                  }}
                />
              ) : (
                <input
                  type="file"
                  id="file-input"
                  accept={type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  style={{
                    width: '100%', padding: '0.6rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', outline: 'none', fontSize: '0.85rem'
                  }}
                />
              )}
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                TEXTE / DESCRIPTION *
              </label>
              <textarea
                placeholder="Description détaillée de la machine, de l'usage ou du chantier..."
                required
                rows={4}
                maxLength={1500}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', fontSize: '0.85rem', resize: 'vertical'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              🚀 Publier dans la Galerie
            </button>

          </form>
        </div>

        {/* Media List */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
            📊 Liste des <span className="text-gold-gradient">Médias</span> ({items.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {items.map((item) => (
              <div key={item.id} className="admin-media-card" style={{
                padding: '1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {/* Media Preview */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden',
                  background: '#0d1b2a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexShrink: 0
                }}>
                  {item.type === 'image' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      {getYouTubeThumbnail(item.url) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={getYouTubeThumbnail(item.url) || ''} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      )}
                    </>
                  )}
                  <span style={{
                    position: 'absolute', bottom: '2px', right: '2px', fontSize: '0.65rem',
                    background: 'rgba(0,0,0,0.7)', padding: '1px 4px', borderRadius: '3px'
                  }}>
                    {item.type === 'image' ? '🖼️' : '🎥'}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(245,166,35,0.1)', color: '#f5a623' }}>
                      {item.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
                    <span>👍 {item.likes} Likes</span>
                    <span>💬 {item.comments ? item.comments.length : 0} Commentaires</span>
                  </div>
                </div>

                {/* Delete action */}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
                    padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .admin-media-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 1rem;
        }
        @media (max-width: 990px) {
          .media-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 600px) {
          .admin-media-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          .admin-media-card > button {
            width: 100% !important;
          }
          .admin-media-card > div:first-child {
            width: 100% !important;
            height: 150px !important;
          }
        }
      `}</style>
    </div>
  );
}
