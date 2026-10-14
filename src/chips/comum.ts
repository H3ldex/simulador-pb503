import { lerEntradaTTL } from "../ttl";
import { DIP14, type Encapsulamento, type NumeroPino } from "../pinos";
import type { ValorLogico } from "../valorLogico";

// O que está ligado a cada pino de um chip (pino ausente = solto)
export type EstadoPinos = Map<NumeroPino, ValorLogico>;

// Valor presente num pino; um pino ausente está solto (Z)
function lerPino(pinos: EstadoPinos, numero: NumeroPino): ValorLogico {
    return pinos.get(numero) ?? "Z";
}

// Um chip está alimentado com VCC a 1 e GND a 0 (os pinos dependem do encapsulamento)
export function verificarAlimentacao(pinos: EstadoPinos, encapsulamento: Encapsulamento = DIP14): boolean {
    return lerPino(pinos, encapsulamento.vcc) === 1 && lerPino(pinos, encapsulamento.gnd) === 0;
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