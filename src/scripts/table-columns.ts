/**
 * Table Column Management
 *
 * Adds collapsible (toggle visibility) and resizable (drag to resize)
 * columns to a table. Attach to any <table> by calling initTableColumns().
 */

export function initTableColumns(tableId: string) {
  const table = document.getElementById(tableId) as HTMLTableElement | null;
  if (!table) return;

  const thead = table.querySelector('thead tr') as HTMLTableRowElement;
  const ths = Array.from(thead.querySelectorAll('th')) as HTMLTableCellElement[];

  // Column config: index 0 is the expand toggle (always visible, not manageable)
  const managedCols = ths.slice(1); // skip col 0 (expand arrow)
  const colOffset = 1; // managed columns start at index 1

  // ── Set up table for fixed layout ──
  table.style.tableLayout = 'fixed';
  table.style.width = '100%';

  // Give each th an initial width based on its current rendered width
  // Company column (index 1) gets enough space to avoid truncation
  const initialWidths = ths.map((th) => th.offsetWidth);
  ths.forEach((th, i) => {
    const width = i === 1 ? Math.max(initialWidths[i], 180) : initialWidths[i];
    th.style.width = `${width}px`;
    th.style.overflow = 'hidden';
    th.style.textOverflow = 'ellipsis';
    if (i === 1) th.style.whiteSpace = 'nowrap';
  });

  // Apply overflow to all body cells too
  const allRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
  allRows.forEach((row) => {
    Array.from(row.cells).forEach((td) => {
      (td as HTMLElement).style.overflow = 'hidden';
      (td as HTMLElement).style.textOverflow = 'ellipsis';
    });
  });

  // ── Column visibility toggle toolbar ──
  const toolbar = document.createElement('div');
  toolbar.className = 'col-toggle-bar flex flex-wrap gap-2 mb-3';

  const colStates: boolean[] = managedCols.map(() => true);

  // Persist column state to sessionStorage
  const storageKey = `table-cols-${tableId}`;
  const saved = sessionStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as boolean[];
      parsed.forEach((v, i) => { if (i < colStates.length) colStates[i] = v; });
    } catch { /* ignore */ }
  }

  function saveState() {
    sessionStorage.setItem(storageKey, JSON.stringify(colStates));
  }

  function applyVisibility() {
    colStates.forEach((visible, i) => {
      const colIndex = i + colOffset;
      // Toggle th
      ths[colIndex].style.display = visible ? '' : 'none';
      // Toggle all td in this column
      allRows.forEach((row) => {
        const cell = row.cells[colIndex] as HTMLElement | undefined;
        if (cell) cell.style.display = visible ? '' : 'none';
      });
      // Update toggle button
      const btn = toolbar.children[i] as HTMLElement;
      if (btn) {
        btn.classList.toggle('col-toggle-active', visible);
        btn.classList.toggle('col-toggle-hidden', !visible);
      }
    });
  }

  managedCols.forEach((th, i) => {
    const label = th.textContent?.replace(/[▲▼↕]/g, '').trim() || `Col ${i}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = 'col-toggle-btn text-xs font-medium px-2.5 py-1 rounded-md border transition-colors cursor-pointer';
    btn.addEventListener('click', () => {
      colStates[i] = !colStates[i];
      applyVisibility();
      saveState();
    });
    toolbar.appendChild(btn);
  });

  // Insert toolbar before the table wrapper
  const tableWrapper = table.closest('.overflow-x-auto') || table.parentElement;
  tableWrapper?.parentElement?.insertBefore(toolbar, tableWrapper);

  // Apply initial visibility
  applyVisibility();

  // ── Column resize handles ──
  ths.forEach((th, i) => {
    // Skip the last th (no right edge to drag) and col 0 (expand toggle)
    if (i === ths.length - 1 || i === 0) return;

    const handle = document.createElement('div');
    handle.className = 'col-resize-handle';
    handle.style.cssText = `
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 5px;
      cursor: col-resize;
      z-index: 10;
      user-select: none;
    `;

    // Ensure th is positioned for the handle
    th.style.position = 'relative';
    th.appendChild(handle);

    let startX = 0;
    let startW = 0;

    function onMouseMove(e: MouseEvent) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(40, startW + diff);
      th.style.width = `${newWidth}px`;
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startW = th.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}
