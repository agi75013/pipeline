import { Suspense } from "react"
import { connection } from "next/server"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProspectForm } from "@/presentation/prospect-form"
import { ProspectList } from "@/presentation/prospect-list"
import { RelanceList } from "@/presentation/relance-list"
import { obtenirServiceProspects } from "@/service/default-prospect-service"
import {
  ajouterProspect,
  changerEtapeProspect,
  definirDateRelanceProspect,
  modifierProspect,
  supprimerProspect,
} from "@/app/actions"

async function Prospects() {
  await connection()
  const prospects = await obtenirServiceProspects().listerProspects()
  return (
    <ProspectList
      prospects={prospects}
      changerEtape={changerEtapeProspect}
      definirDateRelance={definirDateRelanceProspect}
      modifier={modifierProspect}
      supprimer={supprimerProspect}
    />
  )
}

async function Relances() {
  await connection()
  const prospects = await obtenirServiceProspects().listerARelancer()
  return <RelanceList prospects={prospects} />
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Pipeline</h1>
          <p className="max-w-prose text-muted-foreground">
            Vos prospects, leur étape, et qui relancer aujourd&apos;hui.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <ProspectForm action={ajouterProspect} />

      <section aria-labelledby="titre-relances" className="flex flex-col gap-3">
        <h2 id="titre-relances" className="text-xl font-semibold">
          À relancer aujourd&apos;hui
        </h2>
        <Suspense
          fallback={<p className="text-muted-foreground">Chargement...</p>}
        >
          <Relances />
        </Suspense>
      </section>

      <section aria-label="Prospects">
        <Suspense
          fallback={<p className="text-muted-foreground">Chargement...</p>}
        >
          <Prospects />
        </Suspense>
      </section>
    </main>
  )
}
