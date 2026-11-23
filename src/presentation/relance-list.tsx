import { Badge } from "@/components/ui/badge"
import type { Prospect } from "@/service/prospect-service"
import { formaterDate } from "@/presentation/format-date"

export function RelanceList({ prospects }: { prospects: Prospect[] }) {
  if (prospects.length === 0) {
    return (
      <p className="text-muted-foreground">Aucune relance due aujourd&apos;hui.</p>
    )
  }
  return (
    <ul aria-label="À relancer aujourd'hui" className="flex flex-col divide-y">
      {prospects.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-4 py-2">
          <div className="flex flex-col">
            <span className="font-medium">{p.nom}</span>
            <span className="text-sm text-muted-foreground">
              {[p.societe, p.email ?? p.telephone].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{p.etape}</Badge>
            <span className="text-sm text-muted-foreground">
              {formaterDate(p.dateRelance!)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
