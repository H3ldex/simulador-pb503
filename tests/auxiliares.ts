import { PINO_GND, PINO_VCC, type NumeroPino } from "../src/pinos";
import type { ValorLogico } from "../src/valorLogico";
import type { EstadoPinos } from "../src/chips/comum";

// Cria os pinos de um chip já alimentado, mais as ligações extra indicadas
export function pinosAlimentados(...ligacoes: [NumeroPino, ValorLogico][]): EstadoPinos {
    return new Map<NumeroPino, ValorLogico>([
        [PINO_VCC, 1],
        [PINO_GND, 0],
        ...ligacoes,
    ]);
}