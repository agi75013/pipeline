import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DateRelanceInput } from "@/presentation/date-relance-input"

describe("saisie de la date de relance", () => {
  it("affiche la date de relance actuelle", () => {
    render(
      <DateRelanceInput id="1" dateRelance="2026-12-01" action={vi.fn(async () => ({}))} />,
    )
    expect(screen.getByLabelText("Date de relance")).toHaveValue("2026-12-01")
  })

  it("appelle l'action avec l'id et la date saisie", async () => {
    const action = vi.fn(async () => ({}))
    render(<DateRelanceInput id="42" dateRelance={null} action={action} />)
    fireEvent.change(screen.getByLabelText("Date de relance"), {
      target: { value: "2026-11-23" },
    })
    await vi.waitFor(() => expect(action).toHaveBeenCalledWith("42", "2026-11-23"))
  })

  it("transmet une date vide quand on l'efface", async () => {
    const action = vi.fn(async () => ({}))
    render(<DateRelanceInput id="42" dateRelance="2026-12-01" action={action} />)
    fireEvent.change(screen.getByLabelText("Date de relance"), {
      target: { value: "" },
    })
    await vi.waitFor(() => expect(action).toHaveBeenCalledWith("42", ""))
  })

  it("affiche le message d'erreur renvoyé par l'action", async () => {
    const action = vi.fn(async () => ({ erreur: "Date invalide" }))
    render(<DateRelanceInput id="1" dateRelance={null} action={action} />)
    fireEvent.change(screen.getByLabelText("Date de relance"), {
      target: { value: "2026-11-23" },
    })
    expect(await screen.findByRole("alert")).toHaveTextContent("Date invalide")
  })
})
