import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
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

const changerEtape = vi.fn(async () => ({}))

describe("liste des prospects", () => {
  it("affiche le nom, la société, le contact et l'étape", () => {
    render(<ProspectList prospects={[camille]} changerEtape={changerEtape} />)
    expect(screen.getByText("Camille Durand")).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("camille@exemple.fr")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("Nouveau")
  })

  it("affiche l'étape RDV d'un prospect passé à RDV", () => {
    render(
      <ProspectList
        prospects={[{ ...camille, etape: "RDV" }]}
        changerEtape={changerEtape}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("RDV")
  })

  it("affiche un état vide explicite", () => {
    render(<ProspectList prospects={[]} changerEtape={changerEtape} />)
    expect(screen.getByText(/aucun prospect/i)).toBeInTheDocument()
  })
})
