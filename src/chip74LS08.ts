import type { ValorLogico } from "./valorLogico";
import { PINO_GND, PINO_VCC } from "./pinos";
import type { NumeroPino } from "./pinos";

export class Chip74LS08 {
    readonly nome = "74LS08";

    estaAlimentado(pinos: Map<NumeroPino, ValorLogico>): boolean {
        const vcc = this.lerPino(pinos, PINO_VCC);
        const gnd = this.lerPino(pinos, PINO_GND);
        return vcc === 1 && gnd === 0;
    }

    private lerPino(pinos: Map<NumeroPino, ValorLogico>, numero: NumeroPino): ValorLogico {
        return pinos.get(numero) ?? "Z";
    }
}