import type { ValorLogico } from "../valorLogico";
import type { FonteAlimentacao } from "./fonte";

// Vermelho = 1 (HIGH), verde = 0 (LOW), apagado = fio solto ou base desligada
export type EstadoLed = "vermelho" | "verde" | "apagado";

export class IndicadoresLogicos {
    private readonly fonte: FonteAlimentacao;

    constructor(fonte: FonteAlimentacao) {
        this.fonte = fonte;
    }

    estadoDoLed(valor: ValorLogico): EstadoLed {
        if (!this.fonte.estaLigada()) {
            return "apagado";
        }
        if (valor === 1) {
            return "vermelho";
        }
        if (valor === 0) {
            return "verde";
        }
        return "apagado";
    }
}