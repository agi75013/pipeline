import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  ProspectEditDialog,
  type ActionModification,
} from "@/presentation/prospect-edit-dialog"
import type { EtatFormulaire } from "@/presentation/prospect-form"
import type { Prospect } from "@/service/prospect-service"

const camille: Prospect = {
  id: "42",
  nom: "Camille Durand",
  societe: "Acme",
  email: "camille@exemple.fr",
  telephone: null,
  etape: "Contacté",
  dateRelance: "2026-12-01",
  notes: "Rappeler en janvier",
  creeLe: "2026-11-01T10:00:00.000Z",
}

const ouvrir = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: "Modifier Camille Durand" }),
  )
  return screen.findByRole("dialog")
}

describe("fenêtre de modification", () => {
  it("pré-remplit toutes les informations, notes comprises, à l'ouverture", async () => {
    render(<ProspectEditDialog prospect={camille} action={vi.fn()} />)
    const dialog = within(await ouvrir())
    expect(dialog.getByLabelText("Nom")).toHaveValue("Camille Durand")
    expect(dialog.getByLabelText("Société")).toHaveValue("Acme")
    expect(dialog.getByLabelText("Email")).toHaveValue("camille@exemple.fr")
    expect(dialog.getByLabelText("Téléphone")).toHaveValue("")
    expect(dialog.getByLabelText("Date de relance")).toHaveValue("2026-12-01")
    expect(dialog.getByLabelText("Notes")).toHaveValue("Rappeler en janvier")
  })

  it("transmet l'id et la saisie à l'action, puis se ferme en cas de succès", async () => {
    const action = vi.fn<ActionModification>(async () => ({ succes: true }))
    render(<ProspectEditDialog prospect={camille} action={action} />)
    const dialog = within(await ouvrir())
    const societe = dialog.getByLabelText("Société")
    await userEvent.clear(societe)
    await userEvent.type(societe, "Nouvelle Société")
    await userEvent.click(dialog.getByRole("button", { name: "Enregistrer" }))
    expect(action).toHaveBeenCalledTimes(1)
    const [id, , formData] = action.mock.calls[0]
    expect(id).toBe("42")
    expect(formData.get("societe")).toBe("Nouvelle Société")
    expect(formData.get("notes")).toBe("Rappeler en janvier")
    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
  })

  it("reste ouverte et affiche le message quand le contact manque", async () => {
    const action = async (): Promise<EtatFormulaire> => ({
      erreurs: { contact: "Renseignez un email ou un téléphone" },
      valeurs: { nom: "Camille Durand", email: "", telephone: "" },
    })
    render(<ProspectEditDialog prospect={camille} action={action} />)
    const dialog = within(await ouvrir())
    await userEvent.click(dialog.getByRole("button", { name: "Enregistrer" }))
    expect(
      await dialog.findByText("Renseignez un email ou un téléphone"),
    ).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("affiche un message général d'échec", async () => {
    const action = async (): Promise<EtatFormulaire> => ({
      erreurGenerale: "Impossible d'enregistrer, réessayez.",
    })
    render(<ProspectEditDialog prospect={camille} action={action} />)
    const dialog = within(await ouvrir())
    await userEvent.click(dialog.getByRole("button", { name: "Enregistrer" }))
    expect(
      await dialog.findByText("Impossible d'enregistrer, réessayez."),
    ).toBeInTheDocument()
  })
})
