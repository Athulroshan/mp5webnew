const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const categories = {
  'round-neck': [
    { file: 'round-neck-1.jpg', label: 'Front View', sub: 'Round Neck T-Shirt', angle: 'Front' },
    { file: 'round-neck-2.jpg', label: 'Side Angle', sub: 'Round Neck T-Shirt', angle: 'Side' },
    { file: 'round-neck-3.jpg', label: 'Back View', sub: 'Round Neck T-Shirt', angle: 'Back' },
    { file: 'round-neck-4.jpg', label: 'Collar Detail', sub: 'Round Neck T-Shirt', angle: 'Collar' },
  ],
  'polo': [
    { file: 'polo-1.jpg', label: 'Front View', sub: 'Polo T-Shirt', angle: 'Front' },
    { file: 'polo-2.jpg', label: 'Side Angle', sub: 'Polo T-Shirt', angle: 'Side' },
    { file: 'polo-3.jpg', label: 'Back View', sub: 'Polo T-Shirt', angle: 'Back' },
    { file: 'polo-4.jpg', label: 'Collar Detail', sub: 'Polo T-Shirt', angle: 'Collar' },
  ],
  'caps': [
    { file: 'caps-1.jpg', label: 'Front View', sub: 'Structured Twill Cap', angle: 'Front' },
    { file: 'caps-2.jpg', label: 'Side Profile', sub: 'Structured Twill Cap', angle: 'Side' },
    { file: 'caps-3.jpg', label: 'Back Strap', sub: 'Structured Twill Cap', angle: 'Back' },
    { file: 'caps-4.jpg', label: 'Top View', sub: 'Structured Twill Cap', angle: 'Top' },
  ],
  'school-uniforms': [
    { file: 'school-uniforms-1.jpg', label: 'Girl Set', sub: 'School Uniform Collection', angle: 'Girl Set' },
    { file: 'school-uniforms-2.jpg', label: 'Pleated Skirt', sub: 'School Uniform Collection', angle: 'Skirt' },
    { file: 'school-uniforms-3.jpg', label: 'Uniform Shirt', sub: 'School Uniform Collection', angle: 'Shirt' },
    { file: 'school-uniforms-4.jpg', label: 'School Tie', sub: 'School Uniform Collection', angle: 'Tie' },
    { file: 'school-uniforms-5.jpg', label: 'Trousers', sub: 'School Uniform Collection', angle: 'Trousers' },
  ],
  'shirts': [
    { file: 'shirts-1.jpg', label: 'Front View', sub: 'Oxford Formal Shirt', angle: 'Front' },
    { file: 'shirts-2.jpg', label: 'Back View', sub: 'Oxford Formal Shirt', angle: 'Back' },
    { file: 'shirts-3.jpg', label: 'Side Profile', sub: 'Oxford Formal Shirt', angle: 'Side' },
    { file: 'shirts-4.jpg', label: 'Spread Collar', sub: 'Oxford Formal Shirt', angle: 'Collar' },
    { file: 'shirts-5.jpg', label: 'Barrel Cuff', sub: 'Oxford Formal Shirt', angle: 'Cuff' },
  ],
  'uniform-sets': [
    { file: 'uniform-sets-1.jpg', label: 'Corporate Shirt', sub: 'Complete Uniform Set', angle: 'Shirt' },
    { file: 'uniform-sets-2.jpg', label: 'Blazer / Jacket', sub: 'Complete Uniform Set', angle: 'Jacket' },
    { file: 'uniform-sets-3.jpg', label: 'Formal Trousers', sub: 'Complete Uniform Set', angle: 'Trousers' },
    { file: 'uniform-sets-4.jpg', label: 'Stitch and Fabric Details', sub: 'Complete Uniform Set', angle: 'Details' },
  ],
};

async function generate() {
  const baseDir = path.join(process.cwd(), 'public', 'images', 'products');
  for (const [cat, items] of Object.entries(categories)) {
    const dir = path.join(baseDir, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const item of items) {
      const outPath = path.join(dir, item.file);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FBF3E8"/>
              <stop offset="100%" stop-color="#F3E6D3"/>
            </linearGradient>
            <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#1F1F1F" flood-opacity="0.08"/>
            </filter>
          </defs>
          <rect width="800" height="600" fill="url(#bg)"/>
          <circle cx="680" cy="110" r="190" fill="#EFE2CF" opacity="0.6"/>
          <circle cx="110" cy="510" r="150" fill="#E8DAC8" opacity="0.5"/>

          <rect x="70" y="50" width="660" height="500" rx="28" fill="#FFFDF9" stroke="#E6D6BD" stroke-width="2" filter="url(#cardShadow)"/>

          <!-- Brand Logo Icon -->
          <g transform="translate(370, 110) scale(1.6)">
            <path d="M4 6 h8 l8 14 l8 -14 h8 v32 h-6 v-20 l-8 14 h-4 l-8 -14 v20 h-6 z" fill="none" stroke="#C8452A" stroke-width="2.5" stroke-linejoin="round"/>
          </g>

          <!-- Angle Badge -->
          <g transform="translate(260, 230)">
            <rect x="0" y="0" width="280" height="44" rx="22" fill="#F7ECE9" stroke="#C8452A" stroke-opacity="0.3" stroke-width="1.5"/>
            <text x="140" y="27" fill="#C8452A" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">${item.label.toUpperCase()}</text>
          </g>

          <text x="400" y="325" fill="#1F1F1F" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${item.sub}</text>
          <text x="400" y="365" fill="#7A746E" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle">MPSS Garment Manufacturing · Spec: ${item.angle}</text>

          <rect x="180" y="415" width="440" height="50" rx="16" fill="#F3E6D3" fill-opacity="0.6" stroke="#E8DAC8" stroke-width="1"/>
          <text x="400" y="446" fill="#A89F97" font-family="monospace" font-size="12" text-anchor="middle">/public/images/products/${cat}/${item.file}</text>
        </svg>
      `;

      await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outPath);
      console.log('Created ' + outPath);
    }
  }
}

generate().catch(console.error);
