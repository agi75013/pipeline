import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Pipeline, type ActionsPipeline } from "@/presentation/pipeline"
import type { Prospect } from "@/service/prospect-service"

const AUJ = "2026-11-23"

const p = (champs: Partial<Prospect> & { id: string; nom: string }): Prospect => ({
  societe: null,
  email: `${champs.id}@exemple.fr`,
  telephone: null,
  etape: "Nouveau",
  dateRelance: null,
  notes: null,
  creeLe: "2026-11-01T10:00:00.000Z",
  ...champs,
})

const exemples = (): Prospect[] => [
  p({ id: "camille", nom: "Camille Durand", societe: "Acme", dateRelance: AUJ, notes: "Premier appel" }),
  p({ id: "alex", nom: "Alex Martin", etape: "Contacté", email: null, telephone: "06 12 34 56 78", dateRelance: "2026-11-22" }),
  p({ id: "ines", nom: "Inès Benali", societe: "Boulangerie du Coin", etape: "Réponse reçue", dateRelance: "2026-11-13" }),
  p({ id: "thomas", nom: "Thomas Leroy", etape: "RDV", dateRelance: "2026-11-24" }),
  p({ id: "paul", nom: "Paul Girard" }),
]

let actions: { [K in keyof ActionsPipeline]: ReturnType<typeof vi.fn> & ActionsPipeline[K] }

beforeEach(() => {
  actions = {
    changerEtape: vi.fn(async () => ({})),
    definirDateRelance: vi.fn(async () => ({})),
    ajouter: vi.fn(async () => ({ succes: true })),
    modifier: vi.fn(async () => ({ succes: true })),
    supprimer: vi.fn(async () => ({})),
    ajoutRapide: vi.fn(async () => ({ id: "nouveau-id" })),
  } as never
})

const afficher = (prospects = exemples()) =>
  render(<Pipeline prospects={prospects} aujourdhui={AUJ} actions={actions} />)

const colonne = (etape: string) => screen.getByRole("region", { name: etape })
const carte = (nom: string) => screen.getByRole("button", { name: new RegExp(`^${nom}`) })

describe("tableau des 6 étapes", () => {
  it("range chaque prospect dans la colonne de son étape, avec un compteur", () => {
    afficher()
    for (const etape of ["Nouveau", "Contacté", "Réponse reçue", "RDV", "Gagné", "Perdu"]) {
      expect(colonne(etape)).toBeInTheDocument()
    }
    expect(within(colonne("Nouveau")).getByText("Camille Durand")).toBeInTheDocument()
    expect(within(colonne("Nouveau")).getByText("Paul Girard")).toBeInTheDocument()
    expect(within(colonne("RDV")).getByText("Thomas Leroy")).toBeInTheDocument()
    expect(within(colonne("Nouveau")).getByLabelText("2 prospects")).toBeInTheDocument()
  })

  it("affiche la société, le contact et une étiquette sur les relances dues", () => {
    afficher()
    const ines = within(colonne("Réponse reçue"))
    expect(ines.getByText("Boulangerie du Coin")).toBeInTheDocument()
    expect(ines.getByText("ines@exemple.fr")).toBeInTheDocument()
    expect(ines.getByText("Retard 10 j")).toBeInTheDocument()
    expect(within(colonne("RDV")).getByText("Relance demain")).toBeInTheDocument()
  })

  it("au clavier, Maj + flèche fait avancer d'étape et appelle l'action", async () => {
    afficher()
    carte("Paul Girard").focus()
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(actions.changerEtape).toHaveBeenCalledWith("paul", "Contacté")
    expect(within(colonne("Contacté")).getByText("Paul Girard")).toBeInTheDocument()
  })

  it("annule le déplacement et affiche l'erreur si l'action échoue", async () => {
    actions.changerEtape.mockResolvedValue({ erreur: "Impossible de changer l'étape, réessayez." })
    afficher()
    carte("Paul Girard").focus()
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(await screen.findByText("Impossible de changer l'étape, réessayez.")).toBeInTheDocument()
    expect(within(colonne("Nouveau")).getByText("Paul Girard")).toBeInTheDocument()
  })
})

describe("relances du jour", () => {
  const bandeau = () => screen.getByRole("region", { name: /À relancer/ })

  it("liste les relances dues, la plus ancienne d'abord, avec leur retard", () => {
    afficher()
    const noms = within(bandeau()).getAllByRole("listitem").map((li) => li.textContent)
    expect(noms[0]).toContain("Inès Benali")
    expect(noms[0]).toContain("En retard de 10 j")
    expect(noms[1]).toContain("Alex Martin")
    expect(noms[1]).toContain("Hier")
    expect(noms[2]).toContain("Camille Durand")
    expect(noms[2]).toContain("Aujourd'hui")
    expect(noms).toHaveLength(3)
  })

  it("affiche un état vide clair quand aucune relance n'est due", () => {
    afficher([p({ id: "x", nom: "Sans relance" })])
    expect(within(bandeau()).getByText("Aucune relance due aujourd'hui.")).toBeInTheDocument()
  })

  it("« relance faite » efface la date et retire le prospect du bandeau", async () => {
    afficher()
    await userEvent.click(screen.getByRole("button", { name: "Relance faite pour Alex Martin" }))
    expect(actions.definirDateRelance).toHaveBeenCalledWith("alex", "")
    expect(within(bandeau()).queryByText("Alex Martin")).not.toBeInTheDocument()
  })

  it("ouvre la fiche du prospect depuis le bandeau", async () => {
    afficher()
    await userEvent.click(within(bandeau()).getByRole("button", { name: /^Ouvrir Inès Benali/ }))
    expect(await screen.findByRole("dialog", { name: "Inès Benali" })).toBeInTheDocument()
  })
})

describe("recherche et filtres", () => {
  it("la recherche ne garde que les fiches correspondantes", async () => {
    afficher()
    await userEvent.type(screen.getByRole("searchbox", { name: "Rechercher un prospect" }), "boulang")
    expect(screen.getByText("Inès Benali", { selector: "b" })).toBeInTheDocument()
    expect(screen.queryByText("Paul Girard")).not.toBeInTheDocument()
  })

  it("le filtre « En retard » ne garde que les relances passées", async () => {
    afficher()
    await userEvent.click(screen.getByRole("button", { name: "En retard" }))
    const cartes = screen.getAllByRole("button", { name: /relance/i }).filter((b) => b.dataset.carte !== undefined)
    expect(cartes.map((c) => c.dataset.carte)).toEqual(["alex", "ines"])
  })
})

describe("fiche prospect", () => {
  it("s'ouvre au clic sur une carte, pré-remplie, notes comprises", async () => {
    afficher()
    await userEvent.click(carte("Camille Durand"))
    const fiche = within(await screen.findByRole("dialog", { name: "Camille Durand" }))
    expect(fiche.getByLabelText("Nom")).toHaveValue("Camille Durand")
    expect(fiche.getByLabelText("Société")).toHaveValue("Acme")
    expect(fiche.getByLabelText("Date de relance")).toHaveValue(AUJ)
    expect(fiche.getByLabelText("Notes")).toHaveValue("Premier appel")
    expect(fiche.getByRole("radio", { name: "Nouveau" })).toBeChecked()
  })

  it("enregistre une modification via l'action, avec l'id du prospect", async () => {
    afficher()
    await userEvent.click(carte("Camille Durand"))
    const fiche = within(await screen.findByRole("dialog"))
    await userEvent.clear(fiche.getByLabelText("Société"))
    await userEvent.type(fiche.getByLabelText("Société"), "Nouvelle Société")
    await userEvent.click(fiche.getByRole("button", { name: "Enregistrer" }))
    expect(actions.modifier).toHaveBeenCalledTimes(1)
    const [id, , formData] = actions.modifier.mock.calls[0]
    expect(id).toBe("camille")
    expect(formData.get("societe")).toBe("Nouvelle Société")
  })

  it("affiche les erreurs renvoyées et reste ouverte", async () => {
    actions.modifier.mockResolvedValue({
      erreurs: { contact: "Renseignez un email ou un téléphone" },
    })
    afficher()
    await userEvent.click(carte("Camille Durand"))
    const fiche = within(await screen.findByRole("dialog"))
    await userEvent.click(fiche.getByRole("button", { name: "Enregistrer" }))
    expect(await fiche.findByText("Renseignez un email ou un téléphone")).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("changer d'étape dans la fiche déplace aussitôt le prospect", async () => {
    afficher()
    await userEvent.click(carte("Paul Girard"))
    const fiche = within(await screen.findByRole("dialog"))
    await userEvent.click(fiche.getByRole("radio", { name: "RDV" }))
    expect(actions.changerEtape).toHaveBeenCalledWith("paul", "RDV")
  })

  it("les raccourcis de date remplissent la date de relance", async () => {
    afficher()
    await userEvent.click(carte("Paul Girard"))
    const fiche = within(await screen.findByRole("dialog"))
    await userEvent.click(fiche.getByRole("button", { name: "Demain" }))
    expect(fiche.getByLabelText("Date de relance")).toHaveValue("2026-11-24")
    await userEvent.click(fiche.getByRole("button", { name: "Aucune" }))
    expect(fiche.getByLabelText("Date de relance")).toHaveValue("")
  })

  it("« Nouveau prospect » ouvre une fiche vide et transmet la saisie à l'action d'ajout", async () => {
    afficher()
    await userEvent.click(screen.getByRole("button", { name: "Nouveau prospect" }))
    const fiche = within(await screen.findByRole("dialog", { name: "Nouveau prospect" }))
    await userEvent.type(fiche.getByLabelText("Nom"), "Zoé Test")
    await userEvent.type(fiche.getByLabelText("Email"), "zoe@test.fr")
    await userEvent.click(fiche.getByRole("radio", { name: "Contacté" }))
    await userEvent.click(fiche.getByRole("button", { name: "Ajouter" }))
    const formData = actions.ajouter.mock.calls[0][1]
    expect(formData.get("nom")).toBe("Zoé Test")
    expect(formData.get("etape")).toBe("Contacté")
    expect(actions.changerEtape).not.toHaveBeenCalled()
  })
})

describe("suppression avec confirmation", () => {
  const demander = async () => {
    afficher()
    await userEvent.click(carte("Paul Girard"))
    const fiche = within(await screen.findByRole("dialog"))
    await userEvent.click(fiche.getByRole("button", { name: "Supprimer" }))
    return screen.findByRole("alertdialog", { name: "Supprimer Paul Girard ?" })
  }

  it("demande une confirmation sans supprimer tout de suite", async () => {
    expect(await demander()).toBeInTheDocument()
    expect(actions.supprimer).not.toHaveBeenCalled()
  })

  it("n'efface rien si l'on annule", async () => {
    const confirmation = within(await demander())
    await userEvent.click(confirmation.getByRole("button", { name: "Annuler" }))
    expect(actions.supprimer).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    // La fiche reste ouverte (le tableau est masqué aux lecteurs d'écran derrière elle).
    expect(screen.getByRole("dialog", { name: "Paul Girard" })).toBeInTheDocument()
    expect(document.querySelector('[data-carte="paul"]')).toBeInTheDocument()
  })

  it("supprime après confirmation : le prospect disparaît du tableau", async () => {
    const confirmation = within(await demander())
    await userEvent.click(confirmation.getByRole("button", { name: "Supprimer" }))
    expect(actions.supprimer).toHaveBeenCalledWith("paul")
    await vi.waitFor(() => expect(screen.queryByText("Paul Girard")).not.toBeInTheDocument())
  })
})

describe("ajout rapide dans une colonne", () => {
  it("ajoute un prospect dans l'étape de la colonne", async () => {
    afficher()
    await userEvent.click(within(colonne("RDV")).getByRole("button", { name: "Ajouter dans RDV" }))
    const zone = within(colonne("RDV"))
    await userEvent.type(zone.getByLabelText("Nom du prospect"), "Zoé")
    await userEvent.type(zone.getByLabelText("Email ou téléphone"), "zoe@test.fr")
    await userEvent.click(zone.getByRole("button", { name: "Ajouter" }))
    expect(actions.ajoutRapide).toHaveBeenCalledWith("RDV", "Zoé", "zoe@test.fr")
    expect(await zone.findByText("Zoé")).toBeInTheDocument()
  })

  it("affiche les erreurs de saisie renvoyées", async () => {
    actions.ajoutRapide.mockResolvedValue({
      erreurs: { nom: "Le nom est obligatoire", contact: "Renseignez un email ou un téléphone" },
    })
    afficher()
    await userEvent.click(within(colonne("RDV")).getByRole("button", { name: "Ajouter dans RDV" }))
    await userEvent.click(within(colonne("RDV")).getByRole("button", { name: "Ajouter" }))
    expect(await within(colonne("RDV")).findByText(/Le nom est obligatoire/)).toBeInTheDocument()
  })
})

describe("synchronisation avec le serveur", () => {
  it("reprend la liste du serveur quand elle change", () => {
    const { rerender } = afficher()
    act(() => {
      rerender(
        <Pipeline
          prospects={[p({ id: "neuf", nom: "Arrivé du serveur", etape: "Gagné" })]}
          aujourdhui={AUJ}
          actions={actions}
        />,
      )
    })
    expect(within(colonne("Gagné")).getByText("Arrivé du serveur")).toBeInTheDocument()
    expect(screen.queryByText("Paul Girard")).not.toBeInTheDocument()
  })
})
