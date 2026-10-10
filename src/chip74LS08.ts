import { lerEntradaTTL } from "./ttl";
import { portaAND } from "./portas";
import { PINO_GND, PINO_VCC, type NumeroPino } from "./pinos";
import type { ValorLogico } from "./valorLogico";

// Descreve os pinos de uma porta de duas entradas dentro do chip
interface PortaDuasEntradas {
    entradaA: NumeroPino;
    entradaB: NumeroPino;
    saida: NumeroPino;
}

export class Chip74LS08 {
    readonly nome = "74LS08";

    // Pinagem do datasheet: 4 portas AND
    private readonly portas: readonly PortaDuasEntradas[] = [
        { entradaA: 1,  entradaB: 2,  saida: 3 },    // porta 1
        { entradaA: 4,  entradaB: 5,  saida: 6 },    // porta 2
        { entradaA: 9,  entradaB: 10, saida: 8 },    // porta 3 (saída antes das entradas!)
        { entradaA: 12, entradaB: 13, saida: 11 },   // porta 4
    ];

    estaAlimentado(pinos: Map<NumeroPino, ValorLogico>): boolean {
        const vcc = this.lerPino(pinos, PINO_VCC);
        const gnd = this.lerPino(pinos, PINO_GND);
        return vcc === 1 && gnd === 0;
    }

    calcularSaidas(pinos: Map<NumeroPino, ValorLogico>): Map<NumeroPino, ValorLogico> {
        const saidas = new Map<NumeroPino, ValorLogico>();

        // Sem alimentação, todas as saídas ficam indefinidas
        if (!this.estaAlimentado(pinos)) {
            for (const porta of this.portas) {
                saidas.set(porta.saida, "Z");
            }
            return saidas;
        }

        // Com alimentação, cada porta calcula a AND das entradas lidas como TTL
        for (const porta of this.portas) {
            const a = lerEntradaTTL(this.lerPino(pinos, porta.entradaA));
            const b = lerEntradaTTL(this.lerPino(pinos, porta.entradaB));
            saidas.set(porta.saida, portaAND(a, b));
        }
        return saidas;
    }

    private lerPino(pinos: Map<NumeroPino, ValorLogico>, numero: NumeroPino): ValorLogico {
        return pinos.get(numero) ?? "Z";
    }
}