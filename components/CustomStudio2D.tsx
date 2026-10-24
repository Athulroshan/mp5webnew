'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Upload,
  Type,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Check,
  Bold,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { STUDIO } from './studioData';
import './CustomStudio2D.css';

const D: any = STUDIO;

export type Garment = 'tee' | 'polo';
export type View = 'front' | 'back' | 'lsleeve' | 'rsleeve';
export type Part = 'all' | 'body' | 'sleeves' | 'collar';

export type Item = {
  id: number;
  type: 'img' | 'text';
  x: number;
  y: number;
  src?: string;
  w?: number;
  h?: number;
  ar?: number;
  text?: string;
  size?: number;
  font?: string;
  color?: string;
  bold?: boolean;
};

export type Design = {
  garment: Garment;
  colors: Record<string, string>;
  items: Record<string, Item[]>;
  notes: string;
  reference: string | null;
  referenceImage?: string | null;
};

export interface CustomStudio2DRef {
  getDesign: () => Design;
  exportPng: () => Promise<void>;
  downloadAll4Sides: () => Promise<void>;
}

const VIEWS: [View, string][] = [
  ['front', 'Front'],
  ['back', 'Back'],
  ['lsleeve', 'Left sleeve'],
  ['rsleeve', 'Right sleeve'],
];

const PHOTO: Record<View, string> = {
  front: 'front',
  back: 'back',
  lsleeve: 'left',
  rsleeve: 'right',
};

const PARTS: [Part, string][] = [
  ['all', 'All'],
  ['body', 'Body'],
  ['sleeves', 'Sleeves'],
  ['collar', 'Collar'],
];

const FONTS = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Brush Script MT'];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const toData = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export type CustomStudio2DProps = {
  garment?: Garment;
  onDesignChange?: (d: Design) => void;
  getDesign?: (getter: () => Design) => void;
  selectedSize?: 'S' | 'M' | 'L' | 'XL';
  onSelectSize?: (size: 'S' | 'M' | 'L' | 'XL') => void;
  onAddToCart?: () => void;
  addedToast?: boolean;
  garmentPrice?: number;
};

const CustomStudio2D = forwardRef<CustomStudio2DRef, CustomStudio2DProps>(
  (
    {
      garment,
      onDesignChange,
      getDesign: getDesignProp,
      selectedSize = 'M',
      onSelectSize,
      onAddToCart,
      addedToast = false,
      garmentPrice = 799,
    },
    ref
  ) => {
    const [g, setG] = useState<Garment>(garment ?? 'tee');
    const [view, setView] = useState<View>('front');
    const [part, setPart] = useState<Part>('all');
    const [c, setC] = useState({
      body: '#ffffff',
      sleeves: '#ffffff',
      collar: '#ffffff',
    });
    const [items, setItems] = useState<Record<string, Item[]>>({});
    const [sel, setSel] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [referenceImg, setReferenceImg] = useState<string | null>(null);
    const [lowRes, setLowRes] = useState(false);
    const [hex, setHex] = useState('');
    const [bb, setBb] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    // Roll-up color dropdown state
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const colorDropdownRef = useRef<HTMLDivElement>(null);
    const colorTriggerRef = useRef<HTMLButtonElement>(null);
    const drag = useRef<{ dx: number; dy: number } | null>(null);
    const uid = useRef(0);

    useEffect(() => {
      if (garment) setG(garment);
    }, [garment]);

    const key = (v: View = view) => `${g}:${v}`;
    const cur = items[key()] || [];
    const selItem = cur.find((i) => i.id === sel) || null;
    const A = D.POS[g][PHOTO[view]];
    const vb: number[] = D.PVB[view];
    const reg: string = A.torso || A.sl[0];

    const curColor =
      part === 'all'
        ? c.body === c.sleeves && c.sleeves === c.collar
          ? c.body
          : null
        : (c as any)[part];

    const colorName = (x: string) =>
      (D.COLORS.find((k: string[]) => k[0].toLowerCase() === x.toLowerCase()) || [x, 'Custom'])[1];

    const setColor = (x: string) =>
      setC((p) =>
        part === 'all'
          ? { body: x, sleeves: x, collar: x }
          : { ...p, [part]: x }
      );

    useEffect(() => {
      setHex(curColor || '');
    }, [curColor]);

    // Handle outside click & Escape for colour dropdown
    useEffect(() => {
      if (!isColorDropdownOpen) return;

      const handleMouseDown = (e: MouseEvent) => {
        if (
          colorDropdownRef.current &&
          !colorDropdownRef.current.contains(e.target as Node) &&
          colorTriggerRef.current &&
          !colorTriggerRef.current.contains(e.target as Node)
        ) {
          setIsColorDropdownOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsColorDropdownOpen(false);
          colorTriggerRef.current?.focus();
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isColorDropdownOpen]);

    const currentDesign = useCallback((): Design => ({
      garment: g,
      colors: c,
      items,
      notes,
      reference: referenceImg,
      referenceImage: referenceImg,
    }), [g, c, items, notes, referenceImg]);

    // Keep parent synced with latest design
    useEffect(() => {
      const d = currentDesign();
      onDesignChange?.(d);
      (window as any).getDesign = currentDesign;
      if (getDesignProp) {
        getDesignProp(currentDesign);
      }
      return () => {
        if ((window as any).getDesign === currentDesign) {
          delete (window as any).getDesign;
        }
      };
    }, [currentDesign, onDesignChange, getDesignProp]);

    // Measure bounding box of selected item
    useLayoutEffect(() => {
      const el =
        sel != null
          ? (svgRef.current?.querySelector(`[data-id="${sel}"]`) as SVGGraphicsElement | null)
          : null;
      if (!el) {
        setBb(null);
        return;
      }
      try {
        const box = el.getBBox();
        setBb({ x: box.x, y: box.y, width: box.width, height: box.height });
      } catch {
        setBb(null);
      }
    }, [items, sel, view, g]);

    const setList = (v: View, fn: (l: Item[]) => Item[]) =>
      setItems((p) => ({ ...p, [key(v)]: fn(p[key(v)] || []) }));

    const patch = (p: Partial<Item>) =>
      setList(view, (l) => l.map((i) => (i.id === sel ? { ...i, ...p } : i)));

    const removeItem = (id: number, explicitView?: View) => {
      const targetView =
        explicitView ||
        (['front', 'back', 'lsleeve', 'rsleeve'] as View[]).find((v) =>
          (items[key(v)] || []).some((i) => i.id === id)
        ) ||
        view;

      setList(targetView, (l) => l.filter((i) => i.id !== id));
      if (sel === id) setSel(null);
    };

    // Keyboard Delete handling
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          (e.key === 'Delete' || e.key === 'Backspace') &&
          sel != null &&
          !/INPUT|TEXTAREA|SELECT/.test(
            (document.activeElement as HTMLElement)?.tagName
          )
        ) {
          e.preventDefault();
          removeItem(sel);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sel, items, g, view]);

    const onFile = (f: File) => {
      const r = new FileReader();
      r.onload = () => {
        const src = r.result as string;
        const im = new Image();
        im.onload = () => {
          setLowRes(im.naturalWidth < 400);
          const d = D.PDEFS[g][view];
          const ar = im.naturalHeight / im.naturalWidth;
          const id = ++uid.current;
          setList(view, (l) => [
            ...l,
            { id, type: 'img', src, x: d[0], y: d[1], w: d[2], h: d[2] * ar, ar },
          ]);
          setSel(id);
        };
        im.src = src;
      };
      r.readAsDataURL(f);
    };

    const addText = () => {
      const d = D.PDEFS[g][view];
      const id = ++uid.current;
      setList(view, (l) => [
        ...l,
        {
          id,
          type: 'text',
          text: 'Your text',
          x: d[0],
          y: d[1],
          size: d[3],
          font: 'Arial',
          color: '#111111',
          bold: true,
        },
      ]);
      setSel(id);
    };

    const pt = (e: React.PointerEvent) => {
      const r = svgRef.current!.getBoundingClientRect();
      return {
        x: vb[0] + ((e.clientX - r.left) * vb[2]) / r.width,
        y: vb[1] + ((e.clientY - r.top) * vb[3]) / r.height,
      };
    };

    const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
      const target = e.target as Element;
      const el = target.closest('[data-id]');
      if (!el) {
        setSel(null);
        return;
      }
      const id = +el.getAttribute('data-id')!;
      const it = cur.find((i) => i.id === id);
      if (!it) {
        setSel(null);
        return;
      }
      const p = pt(e);
      setSel(id);
      drag.current = { dx: it.x - p.x, dy: it.y - p.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onMove = (e: React.PointerEvent) => {
      if (!drag.current || sel == null) return;
      const p = pt(e);
      const d = drag.current;
      setList(view, (l) =>
        l.map((i) =>
          i.id === sel
            ? {
                ...i,
                x: clamp(p.x + d.dx, vb[0], vb[0] + vb[2]),
                y: clamp(p.y + d.dy, vb[1], vb[1] + vb[3]),
              }
            : i
        )
      );
    };

    const el = (i: Item, live: boolean) => {
      const common: any = live
        ? { 'data-id': i.id, style: { cursor: 'move' } }
        : { pointerEvents: 'none' };
      return i.type === 'img' ? (
        <image
          key={i.id}
          {...common}
          href={i.src}
          x={i.x - i.w! / 2}
          y={i.y - i.h! / 2}
          width={i.w}
          height={i.h}
        />
      ) : (
        <text
          key={i.id}
          {...common}
          x={i.x}
          y={i.y}
          fontSize={i.size}
          fontFamily={i.font}
          fontWeight={i.bold ? 700 : 400}
          fill={i.color}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {i.text || ' '}
        </text>
      );
    };

    // Sleeve artwork preview mirrored on torso views
    const mirrored = () => {
      if (view !== 'front' && view !== 'back') return null;
      const back = view === 'back';
      return (['lsleeve', 'rsleeve'] as View[]).map((side) => {
        const its = items[key(side)] || [];
        if (!its.length) return null;
        const idx = (side === 'lsleeve') !== back ? 1 : 0;
        const [sx0, sy0, sx1, sy1] = D.SRCS[g][side];
        const d = D.DSTS[g][idx];
        const hw = sx1 - sx0;
        const dw = d[2] - d[0];
        const s = (d[3] - d[1]) / (sy1 - sy0);
        return (
          <g key={side} mask="url(#sm)">
            <clipPath id={`cm-${side}`}>
              <polygon points={A.sl[idx]} />
            </clipPath>
            <g clipPath={`url(#cm-${side})`}>
              {its.map((i) => {
                const x = idx
                  ? d[0] + ((i.x - sx0) / hw) * dw
                  : d[2] - ((sx1 - i.x) / hw) * dw;
                const y = d[1] + (i.y - sy0) * s;
                return (
                  <g
                    key={i.id}
                    transform={`translate(${x},${y}) rotate(${
                      idx ? -16 : 16
                    }) scale(${s * 0.62},${s}) translate(${-i.x},${-i.y})`}
                  >
                    {el(i, false)}
                  </g>
                );
              })}
            </g>
          </g>
        );
      });
    };

    // Dashed print area guide
    const printGuide = () => {
      const q = reg.split(' ').map((s: string) => s.split(',').map(Number));
      const xs = q.map((a: number[]) => a[0]);
      const ys = q.map((a: number[]) => a[1]);
      const x0 = Math.min(...xs);
      const y0 = Math.min(...ys);
      const w = Math.max(...xs) - x0;
      const h = Math.max(...ys) - y0;
      const t = !!A.torso;
      return (
        <rect
          data-ui
          x={x0 + w * 0.2}
          y={y0 + h * (t ? 0.14 : 0.15)}
          width={w * 0.6}
          height={h * (t ? 0.55 : 0.65)}
          rx={8}
          fill="none"
          stroke="#C8452A"
          strokeWidth={1.2}
          strokeDasharray="4 4"
          opacity={0.45}
          pointerEvents="none"
        />
      );
    };

    const exportPng = async () => {
      if (!svgRef.current) return;
      const cl = svgRef.current.cloneNode(true) as SVGSVGElement;
      cl.querySelectorAll('[data-ui]').forEach((n) => n.remove());
      for (const im of Array.from(cl.querySelectorAll('image'))) {
        const h = im.getAttribute('href');
        if (h && !h.startsWith('data:')) {
          im.setAttribute('href', await toData(h));
        }
      }
      cl.setAttribute('width', String(vb[2] * 10));
      cl.setAttribute('height', String(vb[3] * 10));
      const xml = new XMLSerializer().serializeToString(cl);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = 1200;
        cv.height = Math.round((1200 * vb[3]) / vb[2]);
        const ctx = cv.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob((b) => {
          if (!b) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = `${g}-${view}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    };

    // ── High-Resolution 2400×2400 "Download all 4 sides" ────────────────────
    const downloadAll4Sides = async () => {
      setIsDownloading(true);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Background fill: warm cream #FBF3E8
        ctx.fillStyle = '#FBF3E8';
        ctx.fillRect(0, 0, 2400, 2400);

        // 2. Header
        ctx.fillStyle = '#1F1F1F';
        ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        const titleText =
          g === 'polo'
            ? 'Polo T-Shirt · 4-Side Custom Specification'
            : 'Round Neck T-Shirt · 4-Side Custom Specification';
        ctx.fillText(titleText, 1200, 110);

        ctx.fillStyle = '#7A746E';
        ctx.font = '30px system-ui, -apple-system, sans-serif';
        ctx.fillText('MPSS Sourcing Solutions — Tirupur Garment Hub', 1200, 160);

        // Render each view as SVG data image
        const renderViewToImage = async (targetView: View): Promise<HTMLImageElement> => {
          const vA = D.POS[g][PHOTO[targetView]];
          const vVb: number[] = D.PVB[targetView];
          const vReg: string = vA.torso || vA.sl[0];
          const vItems = items[`${g}:${targetView}`] || [];

          const maskData = await toData(vA.mask);
          const shadeData = await toData(vA.shade);

          const serializedItems = await Promise.all(
            vItems.map(async (it) => {
              if (it.type === 'img' && it.src) {
                const dataSrc = await toData(it.src);
                return `<image href="${dataSrc}" x="${it.x - (it.w || 0) / 2}" y="${
                  it.y - (it.h || 0) / 2
                }" width="${it.w}" height="${it.h}" />`;
              } else if (it.type === 'text') {
                const fw = it.bold ? '700' : '400';
                return `<text x="${it.x}" y="${it.y}" font-size="${it.size}" font-family="${
                  it.font || 'Arial'
                }" font-weight="${fw}" fill="${it.color}" text-anchor="middle" dominant-baseline="central">${
                  it.text || ''
                }</text>`;
              }
              return '';
            })
          );

          let mirroredSvg = '';
          if (targetView === 'front' || targetView === 'back') {
            const back = targetView === 'back';
            for (const side of ['lsleeve', 'rsleeve'] as View[]) {
              const its = items[`${g}:${side}`] || [];
              if (!its.length) continue;
              const idx = (side === 'lsleeve') !== back ? 1 : 0;
              const [sx0, sy0, sx1, sy1] = D.SRCS[g][side];
              const d = D.DSTS[g][idx];
              const hw = sx1 - sx0;
              const dw = d[2] - d[0];
              const s = (d[3] - d[1]) / (sy1 - sy0);

              const sideItemsSvg = await Promise.all(
                its.map(async (i) => {
                  const x = idx
                    ? d[0] + ((i.x - sx0) / hw) * dw
                    : d[2] - ((sx1 - i.x) / hw) * dw;
                  const y = d[1] + (i.y - sy0) * s;
                  let inner = '';
                  if (i.type === 'img' && i.src) {
                    const dataSrc = await toData(i.src);
                    inner = `<image href="${dataSrc}" x="${i.x - (i.w || 0) / 2}" y="${
                      i.y - (i.h || 0) / 2
                    }" width="${i.w}" height="${i.h}" />`;
                  } else if (i.type === 'text') {
                    const fw = i.bold ? '700' : '400';
                    inner = `<text x="${i.x}" y="${i.y}" font-size="${i.size}" font-family="${
                      i.font || 'Arial'
                    }" font-weight="${fw}" fill="${i.color}" text-anchor="middle" dominant-baseline="central">${
                      i.text || ''
                    }</text>`;
                  }
                  return `<g transform="translate(${x},${y}) rotate(${
                    idx ? -16 : 16
                  }) scale(${s * 0.62},${s}) translate(${-i.x},${-i.y})">${inner}</g>`;
                })
              );

              mirroredSvg += `
                <g mask="url(#m-mask-${targetView})">
                  <clipPath id="cm-${targetView}-${side}">
                    <polygon points="${vA.sl[idx]}" />
                  </clipPath>
                  <g clipPath="url(#cm-${targetView}-${side})">
                    ${sideItemsSvg.join('\n')}
                  </g>
                </g>
              `;
            }
          }

          const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="${vVb.join(' ')}" width="${
            vVb[2] * 4
          }" height="${vVb[3] * 4}">
              <defs>
                <mask id="m-mask-${targetView}" maskUnits="userSpaceOnUse" x="0" y="0" width="${
            vA.w
          }" height="${vA.h}">
                  <image href="${maskData}" width="${vA.w}" height="${vA.h}" />
                </mask>
                <clipPath id="cp-${targetView}">
                  <polygon points="${vReg}" />
                </clipPath>
              </defs>
              <g mask="url(#m-mask-${targetView})">
                <rect width="${vA.w}" height="${vA.h}" fill="${c.body}" />
                ${vA.sl
                  .map((pts: string) => `<polygon points="${pts}" fill="${c.sleeves}" />`)
                  .join('\n')}
                <polygon points="${vA.collar}" fill="${c.collar}" />
              </g>
              <g mask="url(#m-mask-${targetView})">
                <g clipPath="url(#cp-${targetView})">
                  ${serializedItems.join('\n')}
                </g>
              </g>
              ${mirroredSvg}
              <image href="${shadeData}" mask="url(#m-mask-${targetView})" width="${vA.w}" height="${
            vA.h
          }" style="mix-blend-mode: multiply;" />
            </svg>
          `;

          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
          });
        };

        // 2×2 Grid tiles
        const tiles: { view: View; label: string; x: number; y: number; w: number; h: number }[] = [
          { view: 'front', label: 'Front', x: 80, y: 220, w: 1080, h: 1000 },
          { view: 'back', label: 'Back', x: 1240, y: 220, w: 1080, h: 1000 },
          { view: 'lsleeve', label: 'Left sleeve', x: 80, y: 1260, w: 1080, h: 1000 },
          { view: 'rsleeve', label: 'Right sleeve', x: 1240, y: 1260, w: 1080, h: 1000 },
        ];

        for (const tile of tiles) {
          // 1. Tile card
          ctx.fillStyle = '#FFFDF9';
          roundRect(ctx, tile.x, tile.y, tile.w, tile.h, 32);
          ctx.fill();
          ctx.strokeStyle = '#E6D6BD';
          ctx.lineWidth = 3;
          ctx.stroke();

          // 2. Tile label pill
          ctx.fillStyle = '#F3E6D3';
          roundRect(ctx, tile.x + 36, tile.y + 36, 210, 52, 26);
          ctx.fill();
          ctx.fillStyle = '#C8452A';
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(tile.label, tile.x + 141, tile.y + 72);

          // 3. Render Garment image inside tile
          const img = await renderViewToImage(tile.view);
          const padding = 130;
          const drawW = tile.w - padding * 2;
          const drawH = tile.h - padding * 2;
          const aspect = img.width / img.height;
          let targetW = drawW;
          let targetH = drawW / aspect;
          if (targetH > drawH) {
            targetH = drawH;
            targetW = drawH * aspect;
          }
          const drawX = tile.x + (tile.w - targetW) / 2;
          const drawY = tile.y + 80 + (tile.h - 80 - targetH) / 2;

          // Soft floor shadow
          ctx.fillStyle = 'rgba(0,0,0,0.06)';
          ctx.beginPath();
          ctx.ellipse(
            tile.x + tile.w / 2,
            drawY + targetH - 12,
            targetW * 0.35,
            18,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.drawImage(img, drawX, drawY, targetW, targetH);
        }

        // Footer line
        ctx.fillStyle = '#4A4540';
        ctx.font = '26px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Preview is indicative; final print may vary slightly.',
          1200,
          2340
        );

        // Trigger download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'custom-tshirt-all-sides.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setIsDownloading(false);
        }, 'image/png');
      } catch (err) {
        console.error('Error generating 4-sided export:', err);
        setIsDownloading(false);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        getDesign: currentDesign,
        exportPng,
        downloadAll4Sides,
      }),
      [currentDesign, exportPng, downloadAll4Sides]
    );

    // Items list for active view
    const rows: { v: View; i: Item }[] = [];
    const own: View[] =
      view === 'front' || view === 'back'
        ? [view, 'lsleeve', 'rsleeve']
        : [view];
    own.forEach((v) =>
      (items[key(v)] || []).forEach((i) => rows.push({ v, i }))
    );

    return (
      <div className="flex-1 w-full flex flex-col bg-[#FBF3E8] text-[#1F1F1F]">
        {/* Main studio layout: Left cards & Right preview */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left Control Panel (380px wide) ───────────────────────────── */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-5 order-3 lg:order-1 cs-scrollbar">
            {/* Step 1: Choose a style */}
            <div className="bg-[#FFFDF9] border border-[#E6D6BD] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F3E6D3] text-[#C8452A] font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#1F1F1F]">Choose a style</h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setG('tee');
                    setSel(null);
                  }}
                  className={`h-12 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center text-center leading-tight cursor-pointer ${
                    g === 'tee'
                      ? 'bg-[#C8452A] text-white shadow-xs'
                      : 'bg-[#FBF3E8] border border-[#D9C7AC] text-[#1F1F1F] hover:border-[#C8452A]'
                  }`}
                >
                  Round neck T-shirt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setG('polo');
                    setSel(null);
                  }}
                  className={`h-12 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center text-center leading-tight cursor-pointer ${
                    g === 'polo'
                      ? 'bg-[#C8452A] text-white shadow-xs'
                      : 'bg-[#FBF3E8] border border-[#D9C7AC] text-[#1F1F1F] hover:border-[#C8452A]'
                  }`}
                >
                  Polo T-shirt
                </button>
              </div>
            </div>

            {/* Step 2: Pick a colour */}
            <div className="bg-[#FFFDF9] border border-[#E6D6BD] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F3E6D3] text-[#C8452A] font-extrabold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#1F1F1F]">Pick a colour</h2>
              </div>

              {/* Segmented control: All / Body / Sleeves / Collar */}
              <div className="bg-[#F3E6D3] p-1 rounded-full border border-[#E8DAC8] flex gap-1">
                {PARTS.map(([k, n]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setPart(k);
                      setIsColorDropdownOpen(false); // Automatically roll up
                    }}
                    className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      part === k
                        ? 'bg-[#C8452A] text-white shadow-xs'
                        : 'text-[#4A4540] hover:text-[#1F1F1F]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Collapsed/Expanded Colour Dropdown Row */}
              <div className="relative">
                <button
                  ref={colorTriggerRef}
                  type="button"
                  aria-expanded={isColorDropdownOpen}
                  aria-controls="color-dropdown-panel"
                  onClick={() => setIsColorDropdownOpen((prev) => !prev)}
                  className="w-full p-2.5 rounded-2xl border border-[#E6D6BD] bg-[#FBF3E8] hover:border-[#C8452A] flex items-center justify-between transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#C8452A]/30"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-7 h-7 rounded-full border border-[#D9C7AC] shadow-2xs shrink-0"
                      style={{
                        background:
                          curColor ||
                          `linear-gradient(90deg, ${c.body} 33%, ${c.sleeves} 33% 66%, ${c.collar} 66%)`,
                      }}
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#1F1F1F] truncate">
                        {part === 'all'
                          ? 'All parts'
                          : PARTS.find((p) => p[0] === part)![1]}
                      </p>
                      <p className="text-[11px] text-[#7A746E] truncate">
                        {curColor
                          ? `${colorName(curColor)} · ${curColor}`
                          : 'Mixed colours · click to unify'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[#7A746E] group-hover:text-[#1F1F1F] transition-colors pr-1">
                    {isColorDropdownOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Roll-up Swatches & Custom Hex Panel */}
                <div
                  ref={colorDropdownRef}
                  id="color-dropdown-panel"
                  className={`grid transition-all duration-200 ease-in-out ${
                    isColorDropdownOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-2.5'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden bg-[#FFFDF9] border border-[#E6D6BD] rounded-2xl p-3 shadow-md space-y-3">
                    <div className="grid grid-cols-5 gap-2.5">
                      {D.COLORS.map(([hexCode, name]: string[]) => {
                        const isSelected = curColor?.toLowerCase() === hexCode.toLowerCase();
                        return (
                          <button
                            key={hexCode}
                            type="button"
                            title={name}
                            aria-label={name}
                            tabIndex={isColorDropdownOpen ? 0 : -1}
                            onClick={() => {
                              setColor(hexCode);
                              setIsColorDropdownOpen(false); // Roll up immediately on pick
                            }}
                            className={`w-10 h-10 rounded-full border-2 border-white/80 shadow-xs relative flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-[#C8452A]'
                                : 'hover:ring-1 hover:ring-[#E6D6BD]'
                            }`}
                            style={{ background: hexCode }}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Hex Row */}
                    <div className="pt-2 border-t border-[#E8DAC8] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-[#4A4540]">Custom:</label>
                        <input
                          type="color"
                          value={curColor || c.body}
                          tabIndex={isColorDropdownOpen ? 0 : -1}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-[#D9C7AC] p-0.5 cursor-pointer bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        maxLength={7}
                        placeholder="#1e3a8a"
                        tabIndex={isColorDropdownOpen ? 0 : -1}
                        value={hex}
                        onChange={(e) => {
                          let v = e.target.value.trim();
                          setHex(v);
                          if (v && v[0] !== '#') v = '#' + v;
                          if (/^#[0-9a-f]{6}$/i.test(v)) setColor(v.toLowerCase());
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsColorDropdownOpen(false);
                          }
                        }}
                        className="w-24 text-xs font-mono uppercase bg-white border border-[#E6D6BD] rounded-xl px-2 py-1 focus:border-[#C8452A] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Add your logo or text */}
            <div className="bg-[#FFFDF9] border border-[#E6D6BD] rounded-[24px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F3E6D3] text-[#C8452A] font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#1F1F1F]">Add your logo or text</h2>
              </div>

              {/* Action Pills */}
              <div className="grid grid-cols-2 gap-2.5">
                <label className="h-12 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>Upload logo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={addText}
                  className="h-12 rounded-full bg-[#FBF3E8] border border-[#D9C7AC] hover:border-[#C8452A] text-[#1F1F1F] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Type className="w-4 h-4 text-[#C8452A]" />
                  <span>Add text</span>
                </button>
              </div>

              {/* Hint line */}
              <p className="text-xs text-[#7A746E] leading-relaxed">
                Choose a side on the right, then drag your design into the dotted box.
              </p>

              {/* Selected Item Editor */}
              {selItem && (
                <div className="bg-[#FBF3E8] border border-[#E6D6BD] rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F1F1F]">
                      Edit {selItem.type === 'text' ? 'Text' : 'Logo'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(selItem.id, view)}
                      className="text-xs text-[#C8452A] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {selItem.type === 'text' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={selItem.text}
                        placeholder="Your text"
                        onChange={(e) => patch({ text: e.target.value })}
                        className="w-full text-xs font-medium bg-white border border-[#E6D6BD] rounded-xl px-2.5 py-1.5 focus:border-[#C8452A] focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={selItem.font}
                          onChange={(e) => patch({ font: e.target.value })}
                          className="flex-1 text-xs bg-white border border-[#E6D6BD] rounded-xl px-2 py-1.5 focus:border-[#C8452A] focus:outline-none"
                        >
                          {FONTS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <input
                          type="color"
                          value={selItem.color}
                          onChange={(e) => patch({ color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-[#D9C7AC] p-0.5 cursor-pointer bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ bold: !selItem.bold })}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                            selItem.bold
                              ? 'bg-[#C8452A] text-white border-[#C8452A]'
                              : 'bg-white border-[#D9C7AC] text-[#1F1F1F]'
                          }`}
                          title="Bold toggle"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Size slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A4540]">
                      <span>Size</span>
                      <span>{selItem.type === 'text' ? selItem.size : selItem.w}px</span>
                    </div>
                    <input
                      type="range"
                      min={selItem.type === 'text' ? 8 : 15}
                      max={selItem.type === 'text' ? 70 : 200}
                      value={selItem.type === 'text' ? selItem.size : selItem.w}
                      onChange={(e) => {
                        const v = +e.target.value;
                        selItem.type === 'text'
                          ? patch({ size: v })
                          : patch({ w: v, h: v * selItem.ar! });
                      }}
                      className="cs-range"
                    />
                  </div>

                  {lowRes && selItem.type === 'img' && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FDF6E9] border border-[#C68B2C]/30 text-[11px] text-[#C68B2C]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Low-resolution image. May print slightly blurry.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Items on this view */}
              {rows.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-[#7A746E] uppercase tracking-wider">
                    Layers on this view
                  </p>
                  {rows.map(({ v, i }) => (
                    <div
                      key={`${v}${i.id}`}
                      onClick={() => {
                        setView(v);
                        setSel(i.id);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        i.id === sel
                          ? 'border-[#C8452A] bg-[#C8452A]/5 font-bold text-[#1F1F1F]'
                          : 'border-[#E8DAC8] bg-white hover:border-[#C8452A]/40 text-[#4A4540]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-[#F3E6D3] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i.type === 'img' ? '🖼' : 'T'}
                        </span>
                        <span className="truncate">
                          {i.type === 'img' ? 'Uploaded logo' : i.text || 'Text'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(i.id, v);
                        }}
                        className="text-[#7A746E] hover:text-[#C8452A] p-1 cursor-pointer"
                        title="Delete layer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Centre & Right Preview Section ─────────────────────────────── */}
          <div className="flex-1 w-full flex flex-col items-center order-1 lg:order-2">
            {/* Garment Preview Card */}
            <div className="w-full bg-[#FFFDF9] border border-[#E6D6BD] rounded-[24px] p-4 sm:p-8 shadow-sm relative flex flex-col items-center justify-center min-h-[460px] sm:min-h-[520px] overflow-hidden">
              {/* Top Left View Chip */}
              <div className="absolute top-4 left-4 z-10 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E6D6BD] text-xs font-bold text-[#1F1F1F] shadow-2xs">
                {VIEWS.find(([k]) => k === view)?.[1] || 'Front'}
              </div>

              {/* Large Soft Darker-Cream Blob Behind Preview */}
              <div className="absolute w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] rounded-full bg-[#F3E6D3]/75 blur-3xl -z-0 pointer-events-none" />

              {/* Garment SVG Preview */}
              <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={vb.join(' ')}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                shapeRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                className="w-full max-w-[420px] sm:max-w-[480px] max-h-[60vh] h-auto z-10 touch-none select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                <defs>
                  <mask
                    id="sm"
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={A.w}
                    height={A.h}
                  >
                    <image href={A.mask} width={A.w} height={A.h} />
                  </mask>
                  <clipPath id="cp">
                    <polygon points={reg} />
                  </clipPath>
                </defs>

                {/* Colored Garment Parts */}
                <g mask="url(#sm)">
                  <rect width={A.w} height={A.h} fill={c.body} />
                  {A.sl.map((s: string, k: number) => (
                    <polygon key={k} points={s} fill={c.sleeves} />
                  ))}
                  <polygon points={A.collar} fill={c.collar} />
                </g>

                {/* Placed Items */}
                <g mask="url(#sm)">
                  <g clipPath="url(#cp)">{cur.map((i) => el(i, true))}</g>
                </g>

                {/* Mirrored sleeves if front/back */}
                {mirrored()}

                {/* Shading Texture Overlay */}
                <image
                  href={A.shade}
                  mask="url(#sm)"
                  width={A.w}
                  height={A.h}
                  style={{ mixBlendMode: 'multiply' }}
                  pointerEvents="none"
                />

                {/* Bounding Box on Selected Item */}
                {bb && (
                  <rect
                    data-ui
                    x={bb.x - 2}
                    y={bb.y - 2}
                    width={bb.width + 4}
                    height={bb.height + 4}
                    rx={2}
                    fill="none"
                    stroke="#C8452A"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    pointerEvents="none"
                  />
                )}
              </svg>

              {/* Floor Shadow Under Garment */}
              <div className="w-48 sm:w-64 h-5 bg-[#1F1F1F]/8 rounded-full blur-md mx-auto -mt-2 pointer-events-none" />
            </div>

            {/* ── Below Preview: Four View Thumbnails ─────────────────────── */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6">
              {VIEWS.map(([vKey, label]) => {
                const thumbA = D.POS[g][PHOTO[vKey]];
                const thumbVb: number[] = D.PVB[vKey];
                const thumbItems = items[`${g}:${vKey}`] || [];
                const isActive = view === vKey;

                return (
                  <button
                    key={vKey}
                    type="button"
                    onClick={() => {
                      setView(vKey);
                      setSel(null);
                    }}
                    aria-label={`Switch to ${label} view`}
                    className={`relative flex flex-col items-center justify-between p-2 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? 'border-2 border-[#C8452A] ring-2 ring-[#C8452A]/20 bg-white shadow-xs scale-105'
                        : 'border border-[#E6D6BD] bg-[#FFFDF9] hover:border-[#C8452A]/60 opacity-80 hover:opacity-100'
                    } w-20 h-20 sm:w-24 sm:h-24`}
                  >
                    <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                      <svg
                        viewBox={thumbVb.join(' ')}
                        className="w-full h-full object-contain pointer-events-none"
                      >
                        <defs>
                          <mask
                            id={`thumb-mask-${vKey}`}
                            maskUnits="userSpaceOnUse"
                            x={0}
                            y={0}
                            width={thumbA.w}
                            height={thumbA.h}
                          >
                            <image href={thumbA.mask} width={thumbA.w} height={thumbA.h} />
                          </mask>
                        </defs>
                        <g mask={`url(#thumb-mask-${vKey})`}>
                          <rect width={thumbA.w} height={thumbA.h} fill={c.body} />
                          {thumbA.sl.map((s: string, k: number) => (
                            <polygon key={k} points={s} fill={c.sleeves} />
                          ))}
                          <polygon points={thumbA.collar} fill={c.collar} />
                        </g>
                        {thumbItems.map((i) =>
                          i.type === 'img' ? (
                            <image
                              key={i.id}
                              href={i.src}
                              x={i.x - (i.w || 0) / 2}
                              y={i.y - (i.h || 0) / 2}
                              width={i.w}
                              height={i.h}
                            />
                          ) : (
                            <text
                              key={i.id}
                              x={i.x}
                              y={i.y}
                              fontSize={i.size}
                              fontFamily={i.font}
                              fontWeight={i.bold ? 700 : 400}
                              fill={i.color}
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {i.text || ''}
                            </text>
                          )
                        )}
                        <image
                          href={thumbA.shade}
                          mask={`url(#thumb-mask-${vKey})`}
                          width={thumbA.w}
                          height={thumbA.h}
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold tracking-tight mt-1 ${
                        isActive ? 'text-[#C8452A]' : 'text-[#4A4540]'
                      }`}
                    >
                      {label.replace(' sleeve', '')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Below Thumbnails: Download all 4 sides button ───────────── */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={downloadAll4Sides}
                disabled={isDownloading}
                className="h-11 px-8 rounded-full bg-[#FBF3E8] border border-[#D9C7AC] hover:border-[#C8452A] hover:bg-[#F3E6D3] text-[#1F1F1F] font-bold text-xs shadow-2xs transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 text-[#C8452A]" />
                <span>
                  {isDownloading ? 'Generating 4-Side PNG...' : 'Download all 4 sides'}
                </span>
              </button>
              <p className="text-xs text-[#7A746E] text-center mt-2 font-normal">
                One image with front, back and both sleeves, including your colours and logo.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sticky Bottom Bar ───────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E6D6BD] py-3.5 px-4 sm:px-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-[#1F1F1F]">
                ₹{garmentPrice}
              </span>
              <span className="text-xs text-[#7A746E] font-medium">per piece</span>
            </div>

            {/* Size selector pills: S / M / L / XL */}
            <div className="flex items-center gap-1.5 bg-[#FBF3E8] p-1 rounded-full border border-[#E6D6BD]">
              {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onSelectSize?.(sz)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-[#C8452A] text-white shadow-xs'
                      : 'text-[#4A4540] hover:text-[#1F1F1F]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Add to Cart Terracotta Pill */}
            <button
              type="button"
              onClick={onAddToCart}
              className="h-12 px-6 sm:px-8 rounded-full bg-[#C8452A] hover:bg-[#B03820] text-white font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{addedToast ? 'Added to Cart!' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CustomStudio2D.displayName = 'CustomStudio2D';

export default CustomStudio2D;
