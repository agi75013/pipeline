import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";

const ETAPES = [
  "Nouveau",
  "Contacté",
  "Réponse reçue",
  "RDV",
  "Gagné",
  "Perdu",
] as const;

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

      <section aria-label="Étapes" className="flex flex-wrap gap-2">
        {ETAPES.map((etape, index) => (
          <Badge key={etape} variant={index === 0 ? "default" : "outline"}>
            {etape}
          </Badge>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nouveau prospect</CardTitle>
          <CardDescription>
            Aperçu du formulaire, pas encore relié à une base.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" placeholder="Nom du contact" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="societe">Société</Label>
            <Input id="societe" placeholder="Nom de la société" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@exemple.fr" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Contexte de l'échange" />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
          <Button type="button">Ajouter</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
