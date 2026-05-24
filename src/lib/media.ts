'use client';

export interface Comment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string; // Base64 Data URL or HTTP URL
  category: string;
  desc: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'med_1',
    title: 'Granuleuse Blick-1200 en production',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    category: 'Granulation',
    desc: 'Notre granuleuse industrielle phare en plein régime chez notre partenaire à Douala. Capacité de production élevée de granulés plastiques homogènes.',
    likes: 24,
    comments: [
      { id: 'c_1', userName: 'Amadou Diallo', text: 'Machine très robuste, installation rapide par les techniciens.', createdAt: '2026-05-18T10:00:00Z' }
    ],
    createdAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'med_2',
    title: 'Présentation Excavatrice Lourde Blick HD',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-heavy-excavator-working-on-a-construction-site-41220-large.mp4',
    category: 'Terrassement',
    desc: 'Démonstration vidéo de l\'excavatrice hydraulique Blick sur un chantier de terrassement. Maniabilité et puissance exceptionnelles.',
    likes: 42,
    comments: [
      { id: 'c_2', userName: 'Direction Générale', text: 'Disponible en stock à Douala pour démonstration physique.', createdAt: '2026-05-12T14:00:00Z' }
    ],
    createdAt: '2026-05-11T09:00:00Z'
  },
  {
    id: 'med_3',
    title: 'Livraison de 3 Camions Benne à Yaoundé',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    category: 'Logistique',
    desc: 'Livraison réussie de notre flotte de camions benne lourds Blick pour un grand projet routier en Afrique Centrale.',
    likes: 18,
    comments: [],
    createdAt: '2026-05-12T11:30:00Z'
  },
  {
    id: 'med_4',
    title: 'Concasseur de Pierres Mobile en action',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=800&q=80',
    category: 'Carrière',
    desc: 'Broyeur mobile Blick assurant une production continue de granulats sur site de construction.',
    likes: 15,
    comments: [],
    createdAt: '2026-05-14T15:00:00Z'
  },
  {
    id: 'med_5',
    title: 'Installation d\'un sécheur rotatif',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-welder-working-on-metal-structure-34360-large.mp4',
    category: 'Installation',
    desc: 'Vidéo montrant le processus d\'assemblage et de soudage de structures industrielles lourdes par nos techniciens qualifiés.',
    likes: 31,
    comments: [
      { id: 'c_3', userName: 'Marc Ngoue', text: 'Superbe boulot d\'installation !', createdAt: '2026-05-15T18:00:00Z' }
    ],
    createdAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'med_6',
    title: 'Briques Réfractaires pour Four Métallurgique',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    category: 'Réfractaire',
    desc: 'Nos briques réfractaires issues de Blick Refractory Technology (Chine) capables de supporter des températures supérieures à 1600°C.',
    likes: 9,
    comments: [],
    createdAt: '2026-05-16T16:00:00Z'
  }
];

export const mediaDb = {
  getItems: (): MediaItem[] => {
    if (typeof window === 'undefined') return DEFAULT_MEDIA;
    const itemsJson = localStorage.getItem('blick_media');
    if (!itemsJson) {
      localStorage.setItem('blick_media', JSON.stringify(DEFAULT_MEDIA));
      return DEFAULT_MEDIA;
    }
    return JSON.parse(itemsJson);
  },

  saveItems: (items: MediaItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blick_media', JSON.stringify(items));
    }
  },

  addItem: (item: Omit<MediaItem, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
    const items = mediaDb.getItems();
    const newItem: MediaItem = {
      ...item,
      id: 'med_' + Math.random().toString(36).substr(2, 9),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    mediaDb.saveItems([newItem, ...items]);
    return newItem;
  },

  likeItem: (id: string): number => {
    const items = mediaDb.getItems();
    let newLikes = 0;
    const updated = items.map((item) => {
      if (item.id === id) {
        newLikes = item.likes + 1;
        return { ...item, likes: newLikes };
      }
      return item;
    });
    mediaDb.saveItems(updated);
    return newLikes;
  },

  addComment: (id: string, userName: string, text: string): Comment => {
    const items = mediaDb.getItems();
    const newComment: Comment = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      userName,
      text,
      createdAt: new Date().toISOString()
    };
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, comments: [...item.comments, newComment] };
      }
      return item;
    });
    mediaDb.saveItems(updated);
    return newComment;
  }
};
export const mediaCategories = ['Tout', 'Granulation', 'Terrassement', 'Logistique', 'Carrière', 'Installation', 'SAV', 'Réfractaire'];
