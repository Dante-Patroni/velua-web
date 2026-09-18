import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

/**
 * Pantalla temporal para verificar el andamiaje visual de Velua.
 */
export function InicioTemporal() {
  return (
    <main className="p-6">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Velua</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>Cosmética natural artesanal</p>

          <div className="flex gap-3">
            <Button className="bg-violeta text-white hover:bg-violeta/90">
              Violeta Velua
            </Button>

            <Button className="bg-lila text-white hover:bg-lila/90">
              Lila Velua
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}