export default function Loading() {
  return <section className="panel" aria-busy="true"><div className="panel-header"><div className="panel-heading"><div className="skeleton" style={{ width: 120, height: 10 }} /><div className="skeleton" style={{ width: 230, height: 20, marginTop: 10 }} /></div></div><div className="panel-body"><div className="loading-grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div></section>;
}
