import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Saisie = { nom: string; societe: string; notes: string }

function FormulaireProspect({ onSubmit }: { onSubmit: (s: Saisie) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Ajouter</Button>} />
      <DialogContent>
        <DialogTitle>Nouveau prospect</DialogTitle>
        <DialogDescription>Saisie d&apos;un prospect</DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const d = new FormData(e.currentTarget)
            onSubmit({
              nom: String(d.get("nom")),
              societe: String(d.get("societe")),
              notes: String(d.get("notes")),
            })
            setOpen(false)
          }}
        >
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" required />
          <Label htmlFor="societe">Société</Label>
          <Input id="societe" name="societe" />
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" />
          <Button type="submit">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

describe("intégration des composants shadcn", () => {
  it("ouvre le dialog, saisit un prospect et transmet les valeurs", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormulaireProspect onSubmit={onSubmit} />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Ajouter" }))

    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Nom"), "Alice Martin")
    await user.type(within(dialog).getByLabelText("Société"), "Acme")
    await user.type(within(dialog).getByLabelText("Notes"), "A rappeler")
    await user.click(within(dialog).getByRole("button", { name: "Enregistrer" }))

    expect(onSubmit).toHaveBeenCalledWith({
      nom: "Alice Martin",
      societe: "Acme",
      notes: "A rappeler",
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("n'envoie pas le formulaire si le nom (requis) est vide", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormulaireProspect onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Ajouter" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Enregistrer" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("affiche une liste avec badge d'étape et action de suppression", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Étape</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Martin</TableCell>
            <TableCell>
              <Badge>Contacté</Badge>
            </TableCell>
            <TableCell>
              <Button variant="destructive" onClick={onDelete}>
                Supprimer
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    const ligne = screen.getByRole("row", { name: /Alice Martin/ })
    expect(within(ligne).getByText("Contacté")).toBeInTheDocument()
    await user.click(within(ligne).getByRole("button", { name: "Supprimer" }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
