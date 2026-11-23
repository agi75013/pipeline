import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProspectDeleteDialog } from "@/presentation/prospect-delete-dialog"

const demander = () =>
  userEvent.click(screen.getByRole("button", { name: "Supprimer Camille Durand" }))

describe("suppression avec confirmation", () => {
  it("demande une confirmation sans supprimer tout de suite", async () => {
    const action = vi.fn(async () => ({}))
    render(<ProspectDeleteDialog id="42" nom="Camille Durand" action={action} />)
    await demander()
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveTextContent("Supprimer Camille Durand ?")
    expect(action).not.toHaveBeenCalled()
  })

  it("supprime après confirmation, puis ferme la fenêtre", async () => {
    const action = vi.fn(async () => ({}))
    render(<ProspectDeleteDialog id="42" nom="Camille Durand" action={action} />)
    await demander()
    const dialog = within(await screen.findByRole("dialog"))
    await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }))
    expect(action).toHaveBeenCalledWith("42")
    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
  })

  it("n'appelle pas l'action quand on annule", async () => {
    const action = vi.fn(async () => ({}))
    render(<ProspectDeleteDialog id="42" nom="Camille Durand" action={action} />)
    await demander()
    const dialog = within(await screen.findByRole("dialog"))
    await userEvent.click(dialog.getByRole("button", { name: "Annuler" }))
    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
    expect(action).not.toHaveBeenCalled()
  })

  it("affiche l'erreur et reste ouverte si la suppression échoue", async () => {
    const action = vi.fn(async () => ({ erreur: "Impossible de supprimer, réessayez." }))
    render(<ProspectDeleteDialog id="42" nom="Camille Durand" action={action} />)
    await demander()
    const dialog = within(await screen.findByRole("dialog"))
    await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }))
    expect(await dialog.findByRole("alert")).toHaveTextContent(
      "Impossible de supprimer, réessayez.",
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
