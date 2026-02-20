export const adminPageStyles = `
  .admin-page { max-width: 100%; }
  .admin-page-title { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #fff; }
  .admin-page-desc { margin: 0 0 24px; font-size: 14px; color: #71717a; }
  .admin-card {
    background: #16161a; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; overflow: hidden;
  }
  .admin-card-overflow { overflow-x: auto; }
  .admin-table { width: 100%; border-collapse: collapse; }
  .admin-table th {
    padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: 0.05em; color: #71717a; text-transform: uppercase;
    background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .admin-table td {
    padding: 16px 20px; font-size: 14px; color: #e4e4e7;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .admin-table tbody tr:last-child td { border-bottom: none; }
  .admin-table-pending { table-layout: auto; }
  .admin-table-pending td:first-child,
  .admin-table-pending th:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
    background: #16161a;
    box-shadow: 2px 0 4px rgba(0,0,0,0.2);
    vertical-align: middle;
  }
  .admin-table-pending tbody tr:hover td:first-child {
    background: rgba(255,255,255,0.04);
  }
  .admin-btn {
    display: inline-flex; align-items: center;
    padding: 10px 18px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s;
  }
  .admin-btn:active { transform: scale(0.98); }
  .admin-btn-primary { background: #22c55e; color: #fff; }
  .admin-btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .admin-btn-danger { background: #ef4444; color: #fff; }
  .admin-btn-danger:hover:not(:disabled) { opacity: 0.9; }
  .admin-badge {
    display: inline-block; padding: 5px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
  }
  .admin-badge-success { background: rgba(34,197,94,0.2); color: #22c55e; }
  .admin-badge-danger { background: rgba(239,68,68,0.2); color: #ef4444; }
  .admin-badge-pending { background: rgba(255,255,255,0.1); color: #a1a1aa; }
  .admin-empty { padding: 48px 24px; text-align: center; color: #71717a; font-size: 14px; }
  .admin-form-group { margin-bottom: 20px; }
  .admin-form-label { display: block; font-size: 12px; font-weight: 600; color: #71717a; margin-bottom: 8px; letter-spacing: 0.02em; }
  .admin-form-input {
    width: 100%; padding: 14px 16px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1); background: #0f0f11;
    color: #e4e4e7; font-size: 14px; outline: none; box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .admin-form-input:focus { border-color: #22c55e; }
  .admin-form-card {
    background: #16161a; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; padding: 28px; max-width: 440px;
  }
`
