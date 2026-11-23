import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RelanceList } from "@/presentation/relance-list"
import type { Prospect } from "@/service/prospect-service"

const prospect = (nom: string, dateRelance: string): Prospect => ({
  id: nom,
  nom,
  societe: "Acme",
  email: "x@exemple.fr",
  telephone: null,
  etape: "Contacté",
  dateRelance,
  notes: null,
  creeLe: "2026-11-01T10:00:00.000Z",
})

describe("liste des relances du jour", () => {
  it("affiche chaque prospect à relancer avec sa date", () => {
    render(
      <RelanceList
        prospects={[prospect("Hier", "2026-11-22"), prospect("Ajd", "2026-11-23")]}
      />,
    )
    const liste = screen.getByRole("list", { name: /à relancer/i })
    expect(liste).toHaveTextContent("Hier")
    expect(liste).toHaveTextContent("22/11/2026")
    expect(liste).toHaveTextContent("Ajd")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })

  it("affiche un état vide clair quand aucune relance n'est due", () => {
    render(<RelanceList prospects={[]} />)
    expect(
      screen.getByText("Aucune relance due aujourd'hui."),
    ).toBeInTheDocument()
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })
})
