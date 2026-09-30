export default function HistoryPage() {
  return (
    <main className="card p-6">
      <h2 className="mb-2 text-xl font-semibold">Historial de consultas</h2>
      <p className="text-sm text-[#9aabcb]">
        Requiere sesión. API: <code>GET/POST /api/history</code>. Las búsquedas
        del usuario se guardan en <code>query_history</code> tras cablear
        Supabase.
      </p>
    </main>
  );
}
