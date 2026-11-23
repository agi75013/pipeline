import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProspectList } from "@/presentation/prospect-list"
import type { Prospect } from "@/service/prospect-service"

const camille: Prospect = {
  id: "1",
  nom: "Camille Durand",
  societe: "Acme",
  email: "camille@exemple.fr",
  telephone: null,
  etape: "Nouveau",
  dateRelance: null,
  notes: null,
  creeLe: "2026-11-22T10:00:00.000Z",
}

describe("liste des prospects", () => {
  it("affiche le nom, la société, le contact et l'étape", () => {
    render(<ProspectList prospects={[camille]} />)
    expect(screen.getByText("Camille Durand")).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("camille@exemple.fr")).toBeInTheDocument()
    expect(screen.getByText("Nouveau")).toBeInTheDocument()
  })

  it("affiche un état vide explicite", () => {
    render(<ProspectList prospects={[]} />)
    expect(screen.getByText(/aucun prospect/i)).toBeInTheDocument()
  })
})
