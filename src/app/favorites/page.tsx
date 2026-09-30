export default function FavoritesPage() {
  return (
    <main className="card p-6">
      <h2 className="mb-2 text-xl font-semibold">Favoritos</h2>
      <p className="text-sm text-[#9aabcb]">
        Requiere sesión Supabase Auth. API:{" "}
        <code>GET/POST /api/favorites</code>,{" "}
        <code>DELETE /api/favorites/:id</code>. Configura el proyecto Metaverse
        (ver BLOCKERS.md) y entra por magic link.
      </p>
    </main>
  );
}
