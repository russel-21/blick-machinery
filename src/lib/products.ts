export interface Product {
  id: string;
  name: string;
  type: 'machine' | 'materiel';
  category: string;
  emoji: string;
  desc: string;
  specs: string[];
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 'mac_gran_1',
    name: 'Granuleuse Industrielle 500kg/h',
    type: 'machine',
    category: 'Granulation',
    emoji: '🏭',
    desc: 'Machine de granulation haute capacité, idéale pour la production de granulés plastiques, engrais et aliments.',
    specs: ['Capacité: 500 kg/h', 'Puissance: 22 kW', 'Poids: 850 kg', 'Certification: CE'],
    featured: true
  },
  {
    id: 'mac_terra_1',
    name: 'Excavatrice Hydraulique 20T',
    type: 'machine',
    category: 'Terrassement',
    emoji: '🚜',
    desc: 'Excavatrice lourde pour travaux de terrassement, mines et chantiers de construction.',
    specs: ['Capacité: 20 tonnes', 'Profondeur: 6.5m', 'Puissance: 108 kW', 'Garantie: 1 an'],
    featured: true
  },
  {
    id: 'mac_trans_1',
    name: 'Camion Benne 30 Tonnes',
    type: 'machine',
    category: 'Transport',
    emoji: '🚛',
    desc: 'Camion benne robuste pour transport de matériaux lourds sur chantiers et mines.',
    specs: ['Charge utile: 30T', 'Moteur: 380 CV', 'Volume benne: 18m³', 'Transmission: Automatique'],
    featured: true
  },
  {
    id: 'mac_carr_1',
    name: 'Concasseur de Pierre 150T/h',
    type: 'machine',
    category: 'Carrière',
    emoji: '⛏️',
    desc: 'Concasseur à mâchoires pour carrières et mines, production de granulats.',
    specs: ['Capacité: 150 T/h', 'Taille max entrée: 500mm', 'Puissance: 75 kW', 'Sortie: 10-90mm']
  },
  {
    id: 'mac_leva_1',
    name: 'Grue Mobile 50 Tonnes',
    type: 'machine',
    category: 'Levage',
    emoji: '🏗️',
    desc: 'Grue mobile à flèche télescopique pour chantiers de construction et industrie.',
    specs: ['Capacité: 50T', 'Hauteur max: 42m', 'Rayon: 34m', 'Moteur: 240 kW']
  },
  {
    id: 'mac_btp_1',
    name: 'Compacteur Vibrant 12T',
    type: 'machine',
    category: 'BTP',
    emoji: '🛤️',
    desc: 'Rouleau compresseur vibrant pour compactage de sols, routes et parkings.',
    specs: ['Poids: 12 tonnes', 'Amplitude: 1.8mm', 'Fréquence: 28 Hz', 'Largeur: 2.13m']
  },
  {
    id: 'mac_gran_2',
    name: 'Granuleuse Double Vis',
    type: 'machine',
    category: 'Granulation',
    emoji: '⚙️',
    desc: 'Granuleuse à double vis extrudeuse pour matières thermoplastiques et recyclage.',
    specs: ['Capacité: 300 kg/h', 'Longueur vis: 32D', 'Puissance: 37 kW', 'Température max: 350°C']
  },
  {
    id: 'mac_terra_2',
    name: 'Chargeuse sur Roues 3T',
    type: 'machine',
    category: 'Terrassement',
    emoji: '🚧',
    desc: 'Chargeuse compacte polyvalente pour chantiers urbains et carrières.',
    specs: ['Capacité godet: 3m³', 'Force d\'arrachement: 170 kN', 'Puissance: 162 kW', 'Poids: 17T']
  },
  {
    id: 'mat_ref_1',
    name: 'Briques Réfractaires Silico-Alumineuses',
    type: 'materiel',
    category: 'Réfractaire',
    emoji: '🧱',
    desc: 'Briques réfractaires haute température pour fours industriels, cimenteries et fonderies.',
    specs: ['T° max: 1700°C', 'Densité: 2.4 g/cm³', 'Format: 230x114x64mm', 'Certifiées ISO 9001'],
    featured: true
  },
  {
    id: 'mat_conv_1',
    name: 'Bande Transporteuse Industrielle',
    type: 'materiel',
    category: 'Convoyeur',
    emoji: '⛓️',
    desc: 'Bande de convoyeur en caoutchouc renforcé pour le transport de granulats ou minerais.',
    specs: ['Largeur: 800mm', 'Longueur: sur mesure', 'Résistance: 400 N/mm', 'Ignifuge: Oui']
  },
  {
    id: 'mat_piece_1',
    name: 'Dents de Godet pour Excavatrice',
    type: 'materiel',
    category: 'Pièces détachées',
    emoji: '⚙️',
    desc: 'Pièces d\'usure en acier allié forgé haute résistance pour godets d\'excavatrices.',
    specs: ['Dureté: 48-52 HRC', 'Poids: 4.5 kg', 'Compatibilité: CAT/Komatsu', 'Fixation par clavette']
  }
];
