'use client';
import { useState } from 'react';

const faqs = [
  {
    category: 'Commandes & Devis',
    items: [
      {
        q: 'Comment obtenir un devis pour une machine ?',
        a: 'Remplissez notre formulaire de contact en précisant le type de machine, la capacité souhaitée et votre localisation. Nous vous répondons sous 24h avec une offre personnalisée.',
      },
      {
        q: 'Les prix incluent-ils la livraison ?',
        a: 'Non, les prix sont généralement hors livraison. Les frais de transport depuis la Chine jusqu\'à Douala sont calculés séparément selon le poids et le volume de la machine.',
      },
      {
        q: 'Peut-on négocier les prix ?',
        a: 'Oui, pour les commandes importantes ou les clients réguliers, des remises peuvent être accordées. Contactez-nous directement pour discuter de tarifs préférentiels.',
      },
    ],
  },
  {
    category: 'Livraison & Logistique',
    items: [
      {
        q: 'Quel est le délai de livraison depuis la Chine ?',
        a: 'En général, le délai de fabrication est de 15 à 30 jours, plus 25 à 45 jours de transport maritime. Comptez environ 2 à 3 mois entre la commande et la réception.',
      },
      {
        q: 'Livrez-vous dans toute l\'Afrique ?',
        a: 'Nous livrons au Cameroun, en RCA, au Gabon, au Congo, au Tchad et en Guinée Équatoriale. Pour d\'autres pays, contactez-nous.',
      },
      {
        q: 'Que comprend le dédouanement ?',
        a: 'Nous pouvons vous accompagner dans les formalités douanières à Douala. Des frais supplémentaires de dédouanement s\'appliquent selon la valeur et le type de machine.',
      },
    ],
  },
  {
    category: 'Technique & Garantie',
    items: [
      {
        q: 'Quelle garantie est offerte sur les machines ?',
        a: 'Toutes nos machines bénéficient d\'une garantie fabricant de 12 mois. Les pièces défectueuses sont remplacées gratuitement pendant cette période.',
      },
      {
        q: 'Proposez-vous l\'installation et la mise en service ?',
        a: 'Oui, nous disposons d\'une équipe technique qui assure l\'installation, la mise en service et la formation de vos opérateurs sur site au Cameroun.',
      },
      {
        q: 'Les pièces de rechange sont-elles disponibles ?',
        a: 'Nous maintenons un stock de pièces courantes à Douala. Pour les pièces spéciales, nous les commandons directement au fabricant avec un délai de 3 à 6 semaines.',
      },
    ],
  },
  {
    category: 'Paiement',
    items: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons le virement bancaire, Mobile Money (MTN, Orange), et les chèques certifiés. Un acompte de 30 à 50% est généralement requis à la commande.',
      },
      {
        q: 'Proposez-vous des facilités de paiement ?',
        a: 'Pour les clients professionnels avec un historique établi, des facilités de paiement peuvent être négociées. Contactez notre service commercial pour en discuter.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (key: string) => {
    setOpenItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

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
            Questions <span className="text-gold-gradient">Fréquentes</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Retrouvez les réponses aux questions les plus posées par nos clients
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section style={{ padding: '4rem 1.5rem', background: '#0d1b2a' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {faqs.map((section, si) => (
            <div key={si} style={{ marginBottom: '3rem' }}>
              <h2 style={{
                color: '#f5a623', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em',
                marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{ height: '2px', width: '24px', background: '#f5a623', borderRadius: '1px' }} />
                {section.category.toUpperCase()}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`;
                  const isOpen = openItems.includes(key);
                  return (
                    <div key={ii} className="glass-card" style={{
                      border: isOpen ? '1px solid rgba(245,166,35,0.3)' : '1px solid rgba(245,166,35,0.1)',
                      overflow: 'hidden', transition: 'border-color 0.3s ease',
                    }}>
                      <button
                        onClick={() => toggle(key)}
                        style={{
                          width: '100%', padding: '1.25rem 1.5rem', background: 'none', border: 'none',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          gap: '1rem', textAlign: 'left',
                        }}
                      >
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>{item.q}</span>
                        <span style={{
                          color: '#f5a623', fontSize: '1.2rem', flexShrink: 0,
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.3s ease',
                        }}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{
                          padding: '0 1.5rem 1.25rem', color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.9rem', lineHeight: 1.8,
                          borderTop: '1px solid rgba(245,166,35,0.1)',
                          paddingTop: '1.25rem',
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div style={{
            padding: '3rem', borderRadius: '16px', textAlign: 'center', marginTop: '2rem',
            background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))',
            border: '1px solid rgba(245,166,35,0.2)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.75rem' }}>
              Vous n&apos;avez pas trouvé votre réponse ?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Notre équipe est disponible pour répondre à toutes vos questions. Contactez-nous directement.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:+237699952090" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">📞 +237 6 99 95 20 90</button>
              </a>
              <a href="https://wa.me/237699952090" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#25d366', border: 'none', borderRadius: '8px',
                  padding: '0.75rem 1.5rem', color: 'white', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.9rem',
                }}>
                  💬 WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
