import fs from 'node:fs';
import path from 'node:path';

const PATH = path.resolve('public/data/brands.json');
const TODAY = '2026-06-01';

const additions = [
  // Top hits — lait infantile & MDD bébé
  ['Gallia', 'FR', 'Lactalis'],
  ['Bledilait', 'FR', 'Danone'],
  ['Picot', 'FR', 'Lactalis'],
  ['Modilac', 'FR', 'Sodilac'],
  ['HiPP', 'DE', 'HiPP GmbH'],
  ['HiPP Biologique', 'DE', 'HiPP GmbH'],

  // Ménager / hygiène
  ['Albal', 'DE', 'Melitta Group'],
  ['Nana', 'SE', 'Essity'],
  ['Mapa', 'FR', 'Hutchinson SA'],
  ['Phebus', 'FR'],
  ['St Marc', 'GB', 'Reckitt Benckiser'],
  ['Saint Marc', 'GB', 'Reckitt Benckiser'],
  ['Love & Green', 'FR'],
  ['Saugella', 'US', 'Viatris'],

  // MDD discount FR
  ['Simpl', 'FR', 'Carrefour'],
  ['Pouce', 'FR', 'Auchan'],
  ['Tadam', 'FR', 'Auchan'],

  // Bières
  ['Anosteke', 'FR', 'Brasserie du Pays Flamand'],
  ['3 Monts', 'FR', 'Brasserie de Saint-Sylvestre'],
  ['Bud', 'US', 'Anheuser-Busch InBev'],
  ['Budweiser', 'US', 'Anheuser-Busch InBev'],
  ['La Chouffe', 'BE', 'Brasserie d\'Achouffe'],
  ['Chouffe', 'BE', 'Brasserie d\'Achouffe'],
  ['Cuvee des Trolls', 'BE', 'Brasserie Dubuisson'],
  ['Tripel Karmeliet', 'BE', 'Brouwerij Bosteels'],
  ['Steam Brew', 'DE', 'Lidl Stiftung & Co. KG'],

  // Glaces & desserts
  ['L\'Angelys', 'FR'],
  ['Pilpa', 'FR'],

  // Pâtes / produits italiens
  ['Casa Azzurra', 'IT'],
  ['Dolce Vita', 'IT'],
  ['Ambrosi', 'IT'],
  ['Raffaello', 'IT', 'Ferrero'],

  // Snacks / biscuits / café
  ['Delichoc', 'US', 'Mondelez International'],
  ['Eat Natural', 'IT', 'Ferrero'],
  ['Grand Mère', 'NL', 'JDE Peet\'s'],
  ['Fulfil', 'IE'],

  // Fromages
  ['Chaussee aux Moines', 'FR', 'Lactalis'],
  ['Chaussée aux Moines', 'FR', 'Lactalis'],
  ['Saint Albray', 'FR', 'Savencia'],
  ['St Albray', 'FR', 'Savencia'],
  ['Mon Fromager', 'FR'],

  // Charcuterie / volaille
  ['Le Gaulois', 'FR', 'LDC Groupe'],
  ['Madrange', 'FR', 'Sigma Alimentos'],

  // Apéro
  ['Apericube', 'FR', 'Bel Group'],
  ['Apéricube', 'FR', 'Bel Group'],

  // Producteurs locaux
  ['Hugo Le Maraicher', 'FR'],
  ['Faire France', 'FR'],

  // Lidl MDD additions seen
  ['Grillmeister', 'DE', 'Lidl Stiftung & Co. KG'],
  ['Vitasia', 'DE', 'Lidl Stiftung & Co. KG'],

  // Électroménager / jouets
  ['Rowenta', 'FR', 'Groupe SEB'],
  ['DeLonghi', 'IT', 'De\'Longhi S.p.A.'],
  ['VTech', 'HK', 'VTech Holdings'],
  ['Klein', 'DE', 'Theo Klein GmbH'],
  ['Ecoiffier', 'FR', 'Ecoiffier'],
];

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const db = JSON.parse(fs.readFileSync(PATH, 'utf-8'));
const presentKeys = new Set(db.brands.map((b) => norm(b.name)));

const toAdd = [];
const skipped = [];
for (const [name, country, parent] of additions) {
  if (presentKeys.has(norm(name))) {
    skipped.push(name);
    continue;
  }
  const entry = {
    name,
    country,
    source: 'manual',
    confidence: 0.9,
    addedAt: TODAY,
  };
  if (parent) entry.parentCompany = parent;
  toAdd.push(entry);
  presentKeys.add(norm(name));
}

const merged = [...db.brands, ...toAdd].sort((a, b) =>
  a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
);
const json =
  '{\n  "version": ' +
  db.version +
  ',\n  "brands": [\n' +
  merged.map((b) => '    ' + JSON.stringify(b)).join(',\n') +
  '\n  ]\n}\n';
fs.writeFileSync(PATH, json);

console.log('Added:', toAdd.length);
console.log('Skipped (already present):', skipped.length, skipped.length ? '→ ' + skipped.join(', ') : '');
console.log('Total brands:', merged.length);
