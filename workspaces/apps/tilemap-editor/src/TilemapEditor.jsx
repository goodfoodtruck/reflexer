import { useCallback, useEffect, useRef, useState } from "react";

const TYPES = ["FLOOR", "WALL", "HOLE"];
const COLORS = { FLOOR: null, WALL: [229, 72, 77], HOLE: [124, 92, 255] };

/**
 * Standalone tilemap editor.
 * Load an image/GIF, set the grid size, paint FLOOR / WALL / HOLE cells,
 * optionally auto-detect red crosses as walls, then export grid[row][col] JSON.
 *
 * @param {object}   props
 * @param {number}   [props.initialCols=14]
 * @param {number}   [props.initialRows=14]
 * @param {(grid:string[][]) => void} [props.onExport]  called with the grid on export
 */
export default function TilemapEditor({ initialCols = 14, initialRows = 14, onExport }) {
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const paintingRef = useRef(false);

  const [cols, setCols] = useState(initialCols);
  const [rows, setRows] = useState(initialRows);
  const [tool, setTool] = useState("FLOOR");
  const [square, setSquare] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoords, setShowCoords] = useState(false);
  const [opacity, setOpacity] = useState(80);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [version, setVersion] = useState(0); // bump to force redraw / recount
  const [pos, setPos] = useState("—");
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState("");

  // (re)build the grid, preserving overlapping cells
  const buildGrid = useCallback((c, r, preserve) => {
    const old = preserve ? gridRef.current : null;
    const next = [];
    for (let y = 0; y < r; y++) {
      const line = [];
      for (let x = 0; x < c; x++) line.push(old?.[y]?.[x] ?? "FLOOR");
      next.push(line);
    }
    gridRef.current = next;
  }, []);

  // initial grid
  useEffect(() => { buildGrid(cols, rows, false); setVersion(v => v + 1); }, []); // eslint-disable-line

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(""), 1900);
  }, []);

  // ---- drawing ----
  const draw = useCallback(() => {
    const cv = canvasRef.current, map = mapRef.current;
    if (!cv || !imgLoaded) return;
    cv.width = map.naturalWidth || map.width;
    cv.height = map.naturalHeight || map.height;
    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height, cw = W / cols, ch = H / rows;
    const op = opacity / 100;
    const grid = gridRef.current;
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const col = COLORS[grid[r]?.[c]];
        if (col) {
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${op * 0.55})`;
          ctx.fillRect(c * cw, r * ch, cw, ch);
        }
      }
    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,.28)";
      ctx.lineWidth = Math.max(1, W / 900);
      for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke(); }
      for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke(); }
    }
    if (showCoords) {
      ctx.fillStyle = "rgba(255,255,255,.75)";
      const fs = Math.max(8, Math.min(cw, ch) * 0.28);
      ctx.font = `${fs}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) ctx.fillText(`${c},${r}`, c * cw + 2, r * ch + 2);
    }
  }, [cols, rows, showGrid, showCoords, opacity, imgLoaded]);

  useEffect(() => { draw(); }, [draw, version]);
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  // ---- file loading ----
  const loadFile = useCallback((f) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const map = mapRef.current;
      map.onload = () => { setImgLoaded(true); setVersion(v => v + 1); };
      map.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }, []);

  // ---- painting ----
  const cellFromEvent = (e) => {
    const cv = canvasRef.current;
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x >= 1 || y < 0 || y >= 1) return null;
    return { c: Math.floor(x * cols), r: Math.floor(y * rows) };
  };
  const paintAt = (e) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    const grid = gridRef.current;
    if (grid[cell.r][cell.c] !== tool) {
      grid[cell.r][cell.c] = tool;
      setVersion(v => v + 1);
    }
    setPos(`${cell.c},${cell.r}`);
  };
  const onPointerDown = (e) => {
    if (!imgLoaded) return;
    paintingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    paintAt(e);
  };
  const onPointerMove = (e) => {
    const cell = cellFromEvent(e);
    setPos(cell ? `${cell.c},${cell.r}` : "—");
    if (paintingRef.current) paintAt(e);
  };
  const onPointerUp = () => { paintingRef.current = false; };

  // ---- grid size ----
  const changeCols = (val) => {
    let c = Math.max(1, Math.min(200, parseInt(val) || 1));
    let r = rows;
    if (square) r = c;
    setCols(c); setRows(r); buildGrid(c, r, true); setVersion(v => v + 1);
  };
  const changeRows = (val) => {
    let r = Math.max(1, Math.min(200, parseInt(val) || 1));
    let c = cols;
    if (square) c = r;
    setCols(c); setRows(r); buildGrid(c, r, true); setVersion(v => v + 1);
  };
  const toggleSquare = (checked) => {
    setSquare(checked);
    if (checked) { setRows(cols); buildGrid(cols, cols, true); setVersion(v => v + 1); }
  };

  const resetFloor = () => { buildGrid(cols, rows, false); setVersion(v => v + 1); showToast("Grille réinitialisée"); };

  // ---- export ----
  const json = () => JSON.stringify(gridRef.current, null, 2);
  const openExport = () => { onExport?.(gridRef.current); setExportOpen(true); };
  const copyJson = () => navigator.clipboard.writeText(json()).then(() => showToast("Copié dans le presse-papiers"));
  const downloadJson = () => {
    const blob = new Blob([json()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "grid.json"; a.click();
    URL.revokeObjectURL(a.href); showToast("grid.json téléchargé");
  };

  // counts (recomputed on version change via render)
  const counts = { FLOOR: 0, WALL: 0, HOLE: 0 };
  for (const row of gridRef.current) for (const v of row) counts[v]++;

  // keyboard tool shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "1") setTool("FLOOR");
      if (e.key === "2") setTool("WALL");
      if (e.key === "3") setTool("HOLE");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="tme-app">
      <aside className="tme-side">
        <div className="tme-brand"><b>Tilemap</b> Editor</div>

        <section className="tme-group">
          <h2>1 · Carte</h2>
          <div
            className={`tme-drop${dragOver ? " over" : ""}`}
            onClick={() => fileInputRef.current.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]); }}
          >
            Glisse une image ou un GIF<br />ou clique pour choisir
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,image/gif" hidden
                 onChange={(e) => loadFile(e.target.files[0])} />
        </section>

        <section className="tme-group">
          <h2>2 · Grille</h2>
          <div className="tme-row">
            <div className="tme-field"><label>Colonnes</label>
              <input type="number" min="1" max="200" value={cols} onChange={(e) => changeCols(e.target.value)} /></div>
            <div className="tme-field"><label>Lignes</label>
              <input type="number" min="1" max="200" value={rows} onChange={(e) => changeRows(e.target.value)} /></div>
          </div>
          <label className="tme-check"><input type="checkbox" checked={square} onChange={(e) => toggleSquare(e.target.checked)} /> Carré (lignes = colonnes)</label>
          <label className="tme-check"><input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} /> Afficher le quadrillage</label>
          <label className="tme-check"><input type="checkbox" checked={showCoords} onChange={(e) => setShowCoords(e.target.checked)} /> Afficher les coordonnées</label>
          <div className="tme-field"><label>Opacité du calque</label>
            <input type="range" min="20" max="100" value={opacity} onChange={(e) => setOpacity(+e.target.value)} /></div>
        </section>

        <section className="tme-group">
          <h2>3 · Pinceau</h2>
          <div className="tme-tools">
            {TYPES.map((t, i) => (
              <div key={t} className={`tme-tool t-${t.toLowerCase()}${tool === t ? " active" : ""}`} onClick={() => setTool(t)}>
                <span className="tme-dot" style={{ background: t === "FLOOR" ? "var(--floor)" : t === "WALL" ? "var(--wall)" : "var(--hole)" }} />
                {t}<span className="tme-key">{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="tme-legend">Clique ou glisse pour peindre.</p>
        </section>

        <section className="tme-group">
          <h2>Actions</h2>
          <div className="tme-btns">
            <button className="tme-act" onClick={resetFloor}>Tout remettre en FLOOR</button>
            <button className="tme-act tme-primary" onClick={openExport}>Exporter en JSON</button>
          </div>
        </section>
      </aside>

      <main className="tme-main">
        <div className="tme-topbar">
          <span>Position <span className="coord">{pos}</span></span>
          <span className="tme-sep" />
          <span>{cols} × {rows}</span>
          <span className="tme-sep" />
          <span>FLOOR {counts.FLOOR} · WALL {counts.WALL} · HOLE {counts.HOLE}</span>
        </div>
        <div className="tme-stage-wrap">
          {!imgLoaded && (
            <div className="tme-empty"><b>Charge une carte pour commencer</b>
              Importe une image ou un GIF, règle la taille de la grille, puis peins tes cases.</div>
          )}
          <div className="tme-stage" style={{ display: imgLoaded ? "block" : "none" }}>
            <img ref={mapRef} alt="" />
            <canvas ref={canvasRef}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove}
              onPointerUp={onPointerUp} onPointerLeave={() => { if (!paintingRef.current) setPos("—"); }} />
          </div>
        </div>
      </main>

      <div className={`tme-export${exportOpen ? " open" : ""}`}>
        <header><h3>Export JSON</h3><button onClick={() => setExportOpen(false)}>×</button></header>
        <pre>{exportOpen ? json() : ""}</pre>
        <footer>
          <button className="tme-act" onClick={copyJson}>Copier</button>
          <button className="tme-act tme-primary" onClick={downloadJson}>Télécharger</button>
        </footer>
      </div>

      <div className={`tme-toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
