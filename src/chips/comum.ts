import { lerEntradaTTL } from "../ttl";
import { PINO_GND, PINO_VCC, type NumeroPino } from "../pinos";
import type { ValorLogico } from "../valorLogico";

// O que está ligado a cada pino de um chip (pino ausente = solto)
export type EstadoPinos = Map<NumeroPino, ValorLogico>;

// Valor presente num pino; um pino ausente está solto (Z)
function lerPino(pinos: EstadoPinos, numero: NumeroPino): ValorLogico {
    return pinos.get(numero) ?? "Z";
}

// Um chip DIP-14 está alimentado com VCC (14) a 1 e GND (7) a 0
export function verificarAlimentacao(pinos: EstadoPinos): boolean {
    return lerPino(pinos, PINO_VCC) === 1 && lerPino(pinos, PINO_GND) === 0;
}

// Lê uma entrada como um chip TTL: solto = 1
export function lerEntrada(pinos: EstadoPinos, numero: NumeroPino): 0 | 1 {
    return lerEntradaTTL(lerPino(pinos, numero));
}

// Saídas de um chip sem alimentação: todas a Z
export function saidasIndefinidas(pinosDeSaida: readonly NumeroPino[]): EstadoPinos {
    const saidas: EstadoPinos = new Map();
    for (const pino of pinosDeSaida) {
        saidas.set(pino, "Z");
    }
    return saidas;
}