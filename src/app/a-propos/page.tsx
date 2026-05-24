'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const team = [
  { name: 'Direction Générale', role: 'Management', emoji: '👔' },
  { name: 'Service Commercial', role: 'Ventes & Devis', emoji: '🤝' },
  { name: 'Équipe Technique', role: 'Installation & SAV', emoji: '🔧' },
  { name: 'Logistique', role: 'Import & Livraison', emoji: '📦' },
];

const timeline = [
  { year: '2015', event: 'Fondation de Blick Refractory Technology en Chine' },
  { year: '2018', event: 'Expansion de la gamme de produits vers les machines industrielles' },
  { year: '2020', event: 'Ouverture de la représentation au Cameroun' },
  { year: '2022', event: 'Création officielle de Blick Machinery Cameroon SARL à Douala' },
  { year: '2024', event: 'Extension de la couverture vers toute l\'Afrique Centrale' },
  { year: '2026', event: 'Déploiement pan-africain avec des partenaires logistiques dans la majorité des pays de l\'Afrique de l\'Ouest' },
];

export default function AProposPage() {
  const [settings, setSettings] = useState({
    aboutText: "Blick Machinery Cameroon SARL est la représentation officielle au Cameroun de la société chinoise Blick Refractory Technology, spécialisée dans la fabrication de machines industrielles de haute performance.",
    aboutMission: "Rendre les machines industrielles chinoises de haute qualité accessibles aux entreprises camerounaises et africaines à des prix compétitifs.",
    aboutVision: "Devenir le partenaire numéro un pour l'équipement industriel lourd en Afrique de l'Ouest et Centrale.",
    locationAdmin: "Stade Militi, Nditam, Douala, Cameroun"
  });

  useEffect(() => {
    import('@/lib/auth').then(({ db }) => {
      setSettings(db.getSettings());
    });
  }, []);

  return (
    <>
      {/* Header */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2338 100%)',
        borderBottom: '1px solid rgba(245,166,35,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
          <h1 className="section-title" style={{ marginBottom: '1rem' }}>
            À <span className="text-gold-gradient">Propos</span> de Nous
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.7 }}>
            Votre partenaire de confiance pour les machines industrielles au Cameroun depuis 2020
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '6rem 1.5rem', background: '#0d1b2a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)',
            borderRadius: '20px', padding: '3rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🌍</div>
            <div style={{ color: '#f5a623', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Notre Mission</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {settings.aboutMission}
            </p>
          </div>
          <div>
            <div className="gold-divider" style={{ marginBottom: '1rem' }} />
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
              Notre <span className="text-gold-gradient">Histoire</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '2rem' }}>
              {settings.aboutText}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Installés à l&apos;adresse suivante : <strong style={{ color: 'white' }}>{settings.locationAdmin}</strong>, nous desservons l&apos;ensemble du continent africain avec des partenaires logistiques et administratifs dans la majorité des pays de l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
        </div>
        <style>{`
          @media (max-width: 768px) {
            section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Timeline */}
      <section style={{ padding: '5rem 1.5rem', background: '#0f2033' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
            <h2 className="section-title">Notre <span className="text-gold-gradient">Parcours</span></h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '60px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, #f5a623, rgba(245,166,35,0.1))' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '80px', flexShrink: 0, textAlign: 'right',
                  color: '#f5a623', fontWeight: 800, fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif",
                  paddingRight: '1rem',
                }}>
                  {item.year}
                </div>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#f5a623', flexShrink: 0, marginTop: '4px',
                  boxShadow: '0 0 0 4px rgba(245,166,35,0.2)',
                }} />
                <div className="glass-card" style={{ flex: 1, padding: '1rem 1.5rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '5rem 1.5rem', background: '#0d1b2a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
            <h2 className="section-title">Notre <span className="text-gold-gradient">Équipe</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {team.map((member, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{member.emoji}</div>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.4rem' }}>{member.name}</h3>
                <p style={{ color: '#f5a623', fontSize: '0.875rem', fontWeight: 600 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '5rem 1.5rem', background: '#0f2033' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="gold-divider" style={{ margin: '0 auto 1rem' }} />
            <h2 className="section-title">Nos <span className="text-gold-gradient">Valeurs</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { emoji: '🏆', title: 'Excellence', desc: 'Nous ne proposons que des machines certifiées et de haute qualité.' },
              { emoji: '🤝', title: 'Confiance', desc: 'Des relations durables basées sur la transparence et le respect.' },
              { emoji: '💡', title: 'Innovation', desc: 'Toujours à l\'affût des dernières technologies industrielles chinoises.' },
              { emoji: '🌿', title: 'Durabilité', desc: 'Des équipements durables qui protègent votre investissement.' },
            ].map((val, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{val.emoji}</div>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{val.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '4rem 1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(13,27,42,1))',
        borderTop: '1px solid rgba(245,166,35,0.15)',
      }}>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1rem' }}>
          Travaillons <span className="text-gold-gradient">ensemble</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>
          Contactez-nous pour discuter de votre projet industriel
        </p>
        <Link href="/contact" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
            Nous Contacter →
          </button>
        </Link>
      </section>
    </>
  );
}
