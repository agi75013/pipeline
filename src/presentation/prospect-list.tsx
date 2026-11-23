import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Prospect } from "@/service/prospect-service"

export function ProspectList({ prospects }: { prospects: Prospect[] }) {
  if (prospects.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aucun prospect pour l&apos;instant. Ajoutez le premier ci-dessus.
      </p>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Société</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Étape</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prospects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.nom}</TableCell>
            <TableCell>{p.societe}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                {p.email && <span>{p.email}</span>}
                {p.telephone && <span>{p.telephone}</span>}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{p.etape}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
