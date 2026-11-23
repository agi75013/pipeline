import { Suspense } from "react"
import { connection } from "next/server"
import { Pipeline } from "@/presentation/pipeline"
import { obtenirServiceProspects } from "@/service/default-prospect-service"
import {
  ajoutRapideProspect,
  ajouterProspect,
  changerEtapeProspect,
  definirDateRelanceProspect,
  modifierProspect,
  supprimerProspect,
} from "@/app/actions"

async function Mur() {
  await connection()
  const service = obtenirServiceProspects()
  const prospects = await service.listerProspects()
  return (
    <Pipeline
      prospects={prospects}
      aujourdhui={service.aujourdhui()}
      actions={{
        changerEtape: changerEtapeProspect,
        definirDateRelance: definirDateRelanceProspect,
        ajouter: ajouterProspect,
        modifier: modifierProspect,
        supprimer: supprimerProspect,
        ajoutRapide: ajoutRapideProspect,
      }}
    />
  )
}

export default function Home() {
  return (
    <main className="flex h-full min-h-0 flex-1 flex-col">
      <Suspense fallback={<p className="p-6 text-muted-foreground">Chargement du tableau…</p>}>
        <Mur />
      </Suspense>
    </main>
  )
}
