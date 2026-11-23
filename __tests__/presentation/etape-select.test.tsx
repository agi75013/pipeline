import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ETAPES } from "@/data/prospect"
import { EtapeSelect } from "@/presentation/etape-select"

describe("sélecteur d'étape", () => {
  it("affiche l'étape actuelle du prospect", () => {
    render(
      <EtapeSelect id="1" etape="RDV" action={vi.fn(async () => ({}))} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("RDV")
  })

  it("propose les 6 étapes fixes", async () => {
    render(
      <EtapeSelect id="1" etape="Nouveau" action={vi.fn(async () => ({}))} />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    for (const etape of ETAPES) {
      expect(
        await screen.findByRole("option", { name: etape }),
      ).toBeInTheDocument()
    }
  })

  it("appelle l'action avec l'id et la nouvelle étape", async () => {
    const action = vi.fn(async () => ({}))
    render(<EtapeSelect id="42" etape="Nouveau" action={action} />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(await screen.findByRole("option", { name: "RDV" }))
    expect(action).toHaveBeenCalledWith("42", "RDV")
  })

  it("affiche le message d'erreur renvoyé par l'action", async () => {
    const action = vi.fn(async () => ({ erreur: "Impossible de changer" }))
    render(<EtapeSelect id="1" etape="Nouveau" action={action} />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(await screen.findByRole("option", { name: "Perdu" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de changer",
    )
  })
})
