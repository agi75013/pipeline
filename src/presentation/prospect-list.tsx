import { EtapeSelect, type ActionEtape } from "@/presentation/etape-select"
import {
  DateRelanceInput,
  type ActionDateRelance,
} from "@/presentation/date-relance-input"
import {
  ProspectEditDialog,
  type ActionModification,
} from "@/presentation/prospect-edit-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Prospect } from "@/service/prospect-service"

export function ProspectList({
  prospects,
  changerEtape,
  definirDateRelance,
  modifier,
}: {
  prospects: Prospect[]
  changerEtape: ActionEtape
  definirDateRelance: ActionDateRelance
  modifier: ActionModification
}) {
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
          <TableHead>Relance</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
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
              <EtapeSelect id={p.id} etape={p.etape} action={changerEtape} />
            </TableCell>
            <TableCell>
              <DateRelanceInput
                id={p.id}
                dateRelance={p.dateRelance}
                action={definirDateRelance}
              />
            </TableCell>
            <TableCell>
              <ProspectEditDialog prospect={p} action={modifier} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
