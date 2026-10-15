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

export type CustomStudio2DProps = {
  garment?: Garment;
  onDesignChange?: (d: Design) => void;
  getDesign?: (getter: () => Design) => void;
};

const CustomStudio2D = forwardRef<CustomStudio2DRef, CustomStudio2DProps>(
  ({ garment, onDesignChange, getDesign: getDesignProp }, ref) => {
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
    const [guide, setGuide] = useState(false);
    const [lowRes, setLowRes] = useState(false);
    const [hex, setHex] = useState('');
    const [bb, setBb] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);
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
      (D.COLORS.find((k: string[]) => k[0] === x) || [x, 'Custom'])[1];

    const setColor = (x: string) =>
      setC((p) =>
        part === 'all'
          ? { body: x, sleeves: x, collar: x }
          : { ...p, [part]: x }
      );

    useEffect(() => {
      setHex(curColor || '');
    }, [curColor]);

    const currentDesign = useCallback((): Design => ({
      garment: g,
      colors: c,
      items,
      notes,
      reference: referenceImg,
      referenceImage: referenceImg,
    }), [g, c, items, notes, referenceImg]);

    // Keep parent & window synced with latest design
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

    // Measure bounding box of selected item for preview outline
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

    // sleeve artwork is previewed on the sleeve in front/back views
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

    const printGuide = () => {
      const q = reg.split(' ').map((s) => s.split(',').map(Number));
      const xs = q.map((a) => a[0]);
      const ys = q.map((a) => a[1]);
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
          stroke="#fff"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
          style={{ mixBlendMode: 'difference' }}
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

    useImperativeHandle(
      ref,
      () => ({
        getDesign: currentDesign,
        exportPng,
      }),
      [currentDesign, exportPng]
    );

    const rows: { v: View; i: Item }[] = [];
    const own: View[] =
      view === 'front' || view === 'back'
        ? [view, 'lsleeve', 'rsleeve']
        : [view];
    own.forEach((v) =>
      (items[key(v)] || []).forEach((i) => rows.push({ v, i }))
    );

    return (
      <div className="cs">
        <aside>
          {!garment && (
            <>
              <h3>Style</h3>
              <div className="row">
                {(['tee', 'polo'] as Garment[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={g === k ? 'on' : ''}
                    onClick={() => {
                      setG(k);
                      setSel(null);
                    }}
                  >
                    {k === 'tee' ? 'T-shirt' : 'Polo'}
                  </button>
                ))}
              </div>
            </>
          )}

          <h3>View</h3>
          <div className="row">
            {VIEWS.map(([k, n]) => (
              <button
                key={k}
                type="button"
                className={view === k ? 'on' : ''}
                onClick={() => {
                  setView(k);
                  setSel(null);
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <h3>Colour</h3>
          <div className="row">
            {PARTS.map(([k, n]) => (
              <button
                key={k}
                type="button"
                className={part === k ? 'on' : ''}
                onClick={() => setPart(k)}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="chip">
            <span
              className="dot"
              style={{
                background:
                  curColor ||
                  `linear-gradient(90deg,${c.body} 33%,${c.sleeves} 33% 66%,${c.collar} 66%)`,
              }}
            />
            <div>
              <b>
                {part === 'all'
                  ? 'All parts'
                  : PARTS.find((p) => p[0] === part)![1]}
              </b>
              <small>
                {curColor
                  ? `${colorName(curColor)} · ${curColor}`
                  : 'Mixed colours · pick one to unify'}
              </small>
            </div>
          </div>

          <div className="grid">
            {D.COLORS.map(([x, n]: string[]) => (
              <button
                key={x}
                type="button"
                title={n}
                className={`tile ${curColor === x ? 'on' : ''}`}
                style={{ background: x }}
                onClick={() => setColor(x)}
              />
            ))}
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <label className="hint">Custom</label>
            <input
              type="color"
              value={curColor || c.body}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              type="text"
              maxLength={7}
              placeholder="#1e3a8a"
              style={{ width: 96 }}
              value={hex}
              onChange={(e) => {
                let v = e.target.value.trim();
                setHex(v);
                if (v && v[0] !== '#') v = '#' + v;
                if (/^#[0-9a-f]{6}$/i.test(v)) setColor(v.toLowerCase());
              }}
            />
          </div>

          <h3>Add to this view</h3>
          <div className="row">
            <label className="pri btn">
              Upload logo
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
            <button type="button" onClick={addText}>
              Add text
            </button>
          </div>

          <label
            className="hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={guide}
              onChange={(e) => setGuide(e.target.checked)}
            />{' '}
            Show print area
          </label>
          {lowRes && (
            <p className="hint warn">
              Low-resolution logo: may print blurry. Use a larger image (400px+
              wide).
            </p>
          )}

          <div>
            {rows.length === 0 && (
              <p className="hint" style={{ marginTop: 8 }}>
                No logo or text on this view yet.
              </p>
            )}
            {rows.map(({ v, i }) => (
              <div
                key={`${v}${i.id}`}
                className={`layer ${i.id === sel ? 'on' : ''}`}
                onClick={() => {
                  setView(v);
                  setSel(i.id);
                }}
              >
                <span className="th">
                  {i.type === 'img' ? <img src={i.src} alt="" /> : 'T'}
                </span>
                <em>
                  {i.type === 'img' ? 'Logo' : i.text || 'Text'}
                  {v !== view && (
                    <small>
                      {' '}
                      ({v === 'lsleeve' ? 'left' : 'right'} sleeve)
                    </small>
                  )}
                </em>
                <button
                  type="button"
                  title="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i.id, v);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {selItem && (
            <div className="sel">
              {selItem.type === 'text' && (
                <>
                  <input
                    type="text"
                    value={selItem.text}
                    placeholder="Your text"
                    onChange={(e) => patch({ text: e.target.value })}
                  />
                  <div className="row">
                    <select
                      value={selItem.font}
                      onChange={(e) => patch({ font: e.target.value })}
                      style={{ flex: 1 }}
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
                    />
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selItem.bold}
                        onChange={(e) => patch({ bold: e.target.checked })}
                      />{' '}
                      Bold
                    </label>
                  </div>
                </>
              )}
              <label className="hint">Size</label>
              <input
                type="range"
                min={selItem.type === 'text' ? 6 : 10}
                max={selItem.type === 'text' ? 80 : 220}
                value={selItem.type === 'text' ? selItem.size : selItem.w}
                onChange={(e) => {
                  const v = +e.target.value;
                  selItem.type === 'text'
                    ? patch({ size: v })
                    : patch({ w: v, h: v * selItem.ar! });
                }}
              />
              <button
                type="button"
                onClick={() => removeItem(selItem.id, view)}
              >
                Delete selected
              </button>
            </div>
          )}

          <p className="hint" style={{ marginTop: 10 }}>
            Drag items on the shirt to position them. Each view has its own
            artwork.
          </p>

          <h3>Reference / notes</h3>
          <textarea
            placeholder="Describe what you want printed, where, any details…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="row" style={{ marginTop: 6 }}>
            <label className="btn">
              Attach reference image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => setReferenceImg(r.result as string);
                  r.readAsDataURL(f);
                }}
              />
            </label>
          </div>
          {referenceImg && (
            <img className="thumb" src={referenceImg} alt="reference" />
          )}
          <p className="hint">
            Reference is sent with the order. It is not printed on the preview.
          </p>
        </aside>

        <main>
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={vb.join(' ')}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
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
            <rect
              x={-1000}
              y={-1000}
              width={3000}
              height={3000}
              fill="#f3f4f6"
            />
            <g mask="url(#sm)">
              <rect width={A.w} height={A.h} fill={c.body} />
              {A.sl.map((s: string, k: number) => (
                <polygon key={k} points={s} fill={c.sleeves} />
              ))}
              <polygon points={A.collar} fill={c.collar} />
            </g>
            <g mask="url(#sm)">
              <g clipPath="url(#cp)">{cur.map((i) => el(i, true))}</g>
            </g>
            {mirrored()}
            <image
              href={A.shade}
              width={A.w}
              height={A.h}
              style={{ mixBlendMode: 'multiply' }}
              pointerEvents="none"
            />
            {guide && printGuide()}
            {bb && (
              <rect
                data-ui
                x={bb.x - 2}
                y={bb.y - 2}
                width={bb.width + 4}
                height={bb.height + 4}
                rx={2}
                fill="none"
                stroke="#a78bfa"
                strokeWidth={0.7}
                pointerEvents="none"
              />
            )}
          </svg>
          <button type="button" className="pri" onClick={exportPng}>
            Download PNG
          </button>
          <p className="hint">
            Preview is indicative; final print may vary slightly.
          </p>
        </main>
      </div>
    );
  }
);

CustomStudio2D.displayName = 'CustomStudio2D';

export default CustomStudio2D;
