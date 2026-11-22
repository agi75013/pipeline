import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  ProspectForm,
  type ActionFormulaire,
  type EtatFormulaire,
} from "@/presentation/prospect-form"

describe("formulaire d'ajout", () => {
  it("transmet la saisie à l'action", async () => {
    const action = vi.fn<ActionFormulaire>(async () => ({}))
    render(<ProspectForm action={action} />)
    await userEvent.type(screen.getByLabelText("Nom"), "Camille Durand")
    await userEvent.type(screen.getByLabelText("Email"), "c@exemple.fr")
    await userEvent.click(screen.getByRole("button", { name: "Ajouter" }))
    expect(action).toHaveBeenCalledTimes(1)
    const formData = action.mock.calls[0][1]
    expect(formData.get("nom")).toBe("Camille Durand")
    expect(formData.get("email")).toBe("c@exemple.fr")
  })

  it("affiche le message quand le contact manque", async () => {
    const action = async (): Promise<EtatFormulaire> => ({
      erreurs: { contact: "Renseignez un email ou un téléphone" },
    })
    render(<ProspectForm action={action} />)
    await userEvent.type(screen.getByLabelText("Nom"), "Camille")
    await userEvent.click(screen.getByRole("button", { name: "Ajouter" }))
    expect(
      await screen.findByText("Renseignez un email ou un téléphone"),
    ).toBeInTheDocument()
  })

  it("affiche le message quand le nom manque", async () => {
    const action = async (): Promise<EtatFormulaire> => ({
      erreurs: { nom: "Le nom est obligatoire" },
    })
    render(<ProspectForm action={action} />)
    await userEvent.click(screen.getByRole("button", { name: "Ajouter" }))
    expect(await screen.findByText("Le nom est obligatoire")).toBeInTheDocument()
  })
})
