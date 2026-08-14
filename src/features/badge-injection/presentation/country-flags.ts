const SVG_NS = 'http://www.w3.org/2000/svg';
const FLAG_VIEWBOX = '0 0 24 18';

type FlagShape = readonly [tag: 'rect' | 'circle' | 'path' | 'polygon', attrs: Readonly<Record<string, string>>];

const FLAG_SHAPES: Record<string, readonly FlagShape[]> = {
  FR: [
    ['rect', { width: '8', height: '18', fill: '#0055A4' }],
    ['rect', { x: '8', width: '8', height: '18', fill: '#fff' }],
    ['rect', { x: '16', width: '8', height: '18', fill: '#EF4135' }],
  ],
  IT: [
    ['rect', { width: '8', height: '18', fill: '#009246' }],
    ['rect', { x: '8', width: '8', height: '18', fill: '#fff' }],
    ['rect', { x: '16', width: '8', height: '18', fill: '#CE2B37' }],
  ],
  IE: [
    ['rect', { width: '8', height: '18', fill: '#169B62' }],
    ['rect', { x: '8', width: '8', height: '18', fill: '#fff' }],
    ['rect', { x: '16', width: '8', height: '18', fill: '#FF883E' }],
  ],
  BE: [
    ['rect', { width: '8', height: '18', fill: '#000' }],
    ['rect', { x: '8', width: '8', height: '18', fill: '#FAE042' }],
    ['rect', { x: '16', width: '8', height: '18', fill: '#ED2939' }],
  ],
  DE: [
    ['rect', { width: '24', height: '6', fill: '#000' }],
    ['rect', { y: '6', width: '24', height: '6', fill: '#DD0000' }],
    ['rect', { y: '12', width: '24', height: '6', fill: '#FFCE00' }],
  ],
  NL: [
    ['rect', { width: '24', height: '6', fill: '#AE1C28' }],
    ['rect', { y: '6', width: '24', height: '6', fill: '#fff' }],
    ['rect', { y: '12', width: '24', height: '6', fill: '#21468B' }],
  ],
  ES: [
    ['rect', { width: '24', height: '4.5', fill: '#AA151B' }],
    ['rect', { y: '4.5', width: '24', height: '9', fill: '#F1BF00' }],
    ['rect', { y: '13.5', width: '24', height: '4.5', fill: '#AA151B' }],
  ],
  PT: [
    ['rect', { width: '10', height: '18', fill: '#006600' }],
    ['rect', { x: '10', width: '14', height: '18', fill: '#FF0000' }],
    ['circle', { cx: '10', cy: '9', r: '2.5', fill: '#FFD700' }],
  ],
  AT: [
    ['rect', { width: '24', height: '18', fill: '#fff' }],
    ['rect', { width: '24', height: '6', fill: '#ED2939' }],
    ['rect', { y: '12', width: '24', height: '6', fill: '#ED2939' }],
  ],
  PL: [
    ['rect', { width: '24', height: '9', fill: '#fff' }],
    ['rect', { y: '9', width: '24', height: '9', fill: '#DC143C' }],
  ],
  DK: [
    ['rect', { width: '24', height: '18', fill: '#C8102E' }],
    ['rect', { x: '7', width: '3', height: '18', fill: '#fff' }],
    ['rect', { y: '7.5', width: '24', height: '3', fill: '#fff' }],
  ],
  SE: [
    ['rect', { width: '24', height: '18', fill: '#006AA7' }],
    ['rect', { x: '7', width: '3', height: '18', fill: '#FECC00' }],
    ['rect', { y: '7.5', width: '24', height: '3', fill: '#FECC00' }],
  ],
  FI: [
    ['rect', { width: '24', height: '18', fill: '#fff' }],
    ['rect', { x: '7', width: '3', height: '18', fill: '#003580' }],
    ['rect', { y: '7.5', width: '24', height: '3', fill: '#003580' }],
  ],
  GR: [
    ['rect', { width: '24', height: '18', fill: '#fff' }],
    ['rect', { y: '2', width: '24', height: '2', fill: '#0D5EAF' }],
    ['rect', { y: '6', width: '24', height: '2', fill: '#0D5EAF' }],
    ['rect', { y: '10', width: '24', height: '2', fill: '#0D5EAF' }],
    ['rect', { y: '14', width: '24', height: '2', fill: '#0D5EAF' }],
    ['rect', { width: '10', height: '10', fill: '#0D5EAF' }],
    ['rect', { x: '3', y: '1', width: '4', height: '8', fill: '#fff' }],
    ['rect', { x: '1', y: '3', width: '8', height: '4', fill: '#fff' }],
  ],
  CZ: [
    ['rect', { width: '24', height: '9', fill: '#fff' }],
    ['rect', { y: '9', width: '24', height: '9', fill: '#D7141A' }],
    ['path', { d: 'M0 0 L12 9 L0 18 Z', fill: '#11457E' }],
  ],
  HU: [
    ['rect', { width: '24', height: '6', fill: '#CE2939' }],
    ['rect', { y: '6', width: '24', height: '6', fill: '#fff' }],
    ['rect', { y: '12', width: '24', height: '6', fill: '#477050' }],
  ],
  RO: [
    ['rect', { width: '8', height: '18', fill: '#002B7F' }],
    ['rect', { x: '8', width: '8', height: '18', fill: '#FCD116' }],
    ['rect', { x: '16', width: '8', height: '18', fill: '#CE1126' }],
  ],
  BG: [
    ['rect', { width: '24', height: '6', fill: '#fff' }],
    ['rect', { y: '6', width: '24', height: '6', fill: '#00966E' }],
    ['rect', { y: '12', width: '24', height: '6', fill: '#D62612' }],
  ],
  US: [
    ['rect', { width: '24', height: '18', fill: '#B22234' }],
    ['rect', { y: '2', width: '24', height: '1.4', fill: '#fff' }],
    ['rect', { y: '5', width: '24', height: '1.4', fill: '#fff' }],
    ['rect', { y: '8', width: '24', height: '1.4', fill: '#fff' }],
    ['rect', { y: '11', width: '24', height: '1.4', fill: '#fff' }],
    ['rect', { y: '14', width: '24', height: '1.4', fill: '#fff' }],
    ['rect', { width: '10', height: '9.7', fill: '#3C3B6E' }],
  ],
  GB: [
    ['rect', { width: '24', height: '18', fill: '#012169' }],
    ['path', { d: 'M0 0 L24 18 M24 0 L0 18', stroke: '#fff', 'stroke-width': '3' }],
    ['path', { d: 'M0 0 L24 18 M24 0 L0 18', stroke: '#C8102E', 'stroke-width': '1.5' }],
    ['path', { d: 'M12 0 V18 M0 9 H24', stroke: '#fff', 'stroke-width': '4' }],
    ['path', { d: 'M12 0 V18 M0 9 H24', stroke: '#C8102E', 'stroke-width': '2' }],
  ],
  CH: [
    ['rect', { width: '24', height: '18', fill: '#DA291C' }],
    ['rect', { x: '10', y: '4', width: '4', height: '10', fill: '#fff' }],
    ['rect', { x: '7', y: '7', width: '10', height: '4', fill: '#fff' }],
  ],
  NO: [
    ['rect', { width: '24', height: '18', fill: '#BA0C2F' }],
    ['rect', { x: '6', width: '3', height: '18', fill: '#fff' }],
    ['rect', { y: '7.5', width: '24', height: '3', fill: '#fff' }],
    ['rect', { x: '7', width: '1', height: '18', fill: '#00205B' }],
    ['rect', { y: '8.5', width: '24', height: '1', fill: '#00205B' }],
  ],
  CN: [
    ['rect', { width: '24', height: '18', fill: '#DE2910' }],
    ['circle', { cx: '5', cy: '5', r: '2', fill: '#FFDE00' }],
  ],
  JP: [
    ['rect', { width: '24', height: '18', fill: '#fff' }],
    ['circle', { cx: '12', cy: '9', r: '5.4', fill: '#BC002D' }],
  ],
  CA: [
    ['rect', { width: '6', height: '18', fill: '#FF0000' }],
    ['rect', { x: '6', width: '12', height: '18', fill: '#fff' }],
    ['rect', { x: '18', width: '6', height: '18', fill: '#FF0000' }],
    ['polygon', { points: '12,5 13,8 15.5,7.5 13.5,10 14.5,12 12,11 9.5,12 10.5,10 8.5,7.5 11,8', fill: '#FF0000' }],
  ],
};

function createSvgRoot(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', FLAG_VIEWBOX);
  return svg;
}

function buildFlag(shapes: readonly FlagShape[]): SVGSVGElement {
  const svg = createSvgRoot();
  for (const [tag, attrs] of shapes) {
    const shape = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) {
      shape.setAttribute(name, value);
    }
    svg.appendChild(shape);
  }
  return svg;
}

function buildChip(label: string, fill: string, fontSize: string): SVGSVGElement {
  const svg = createSvgRoot();
  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('width', '24');
  background.setAttribute('height', '18');
  background.setAttribute('fill', fill);
  background.setAttribute('rx', '2');
  svg.appendChild(background);
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', '12');
  text.setAttribute('y', '13');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', '#fff');
  text.setAttribute('font-size', fontSize);
  text.setAttribute('font-family', 'sans-serif');
  text.setAttribute('font-weight', '700');
  text.textContent = label;
  svg.appendChild(text);
  return svg;
}

export function flagElementFor(country: string | undefined): SVGSVGElement {
  if (!country) return buildChip('?', '#9ca3af', '11');
  const shapes = FLAG_SHAPES[country];
  if (shapes) return buildFlag(shapes);
  return buildChip(country.slice(0, 2).toUpperCase(), '#6b7280', '10');
}
