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
const definirDateRelance = vi.fn(async () => ({}))
const actions = { changerEtape, definirDateRelance }

describe("liste des prospects", () => {
  it("affiche le nom, la société, le contact et l'étape", () => {
    render(<ProspectList prospects={[camille]} {...actions} />)
    expect(screen.getByText("Camille Durand")).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("camille@exemple.fr")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("Nouveau")
  })

  it("affiche l'étape RDV d'un prospect passé à RDV", () => {
    render(
      <ProspectList
        prospects={[{ ...camille, etape: "RDV" }]}
        {...actions}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("RDV")
  })

  it("affiche la date de relance du prospect dans un champ modifiable", () => {
    render(
      <ProspectList
        prospects={[{ ...camille, dateRelance: "2026-12-01" }]}
        {...actions}
      />,
    )
    expect(screen.getByLabelText("Date de relance")).toHaveValue("2026-12-01")
  })

  it("affiche un état vide explicite", () => {
    render(<ProspectList prospects={[]} {...actions} />)
    expect(screen.getByText(/aucun prospect/i)).toBeInTheDocument()
  })
})
