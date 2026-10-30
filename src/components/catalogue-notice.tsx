import type { CatalogueError } from "@/lib/data";

export function CatalogueNotice({ error }: { error: CatalogueError }) {
  if (error.kind === "missing-config") return <div className="setup-note" role="alert">
    <span className="eyebrow">SUPABASE CONFIGURATION NEEDED</span>
    <p>Add the missing environment variable{error.missingVariables?.length === 1 ? "" : "s"} to `.env.local`, then restart the development server:</p>
    <ul>{error.missingVariables?.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
  </div>;

  if (error.kind === "permission") return <div className="empty-state" role="alert">
    <h2>Catalogue access was denied.</h2>
    <p>Check the Supabase published-product read policy and the project’s publishable key configuration.</p>
  </div>;

  if (error.kind === "schema") return <div className="empty-state" role="alert">
    <h2>The catalogue schema is unavailable.</h2>
    <p>Confirm the SneakerDrop migration has been applied to the connected Supabase project.</p>
  </div>;

  return <div className="empty-state" role="alert">
    <h2>The catalogue could not load.</h2>
    <p>Please retry shortly. A safe technical diagnostic has been written to the server log.</p>
  </div>;
}
