import type { ValorLogico } from "../valorLogico";
import type { FonteAlimentacao } from "./fonte";

export type NumeroInterruptor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export class InterruptoresLogicos {
    private readonly fonte: FonteAlimentacao;
    private readonly emCima = new Set<NumeroInterruptor>();

    constructor(fonte: FonteAlimentacao) {
        this.fonte = fonte;
    }

    alternar(numero: NumeroInterruptor): void {
        if (this.emCima.has(numero)) {
            this.emCima.delete(numero);
        } else {
            this.emCima.add(numero);
        }
    }

    colocar(numero: NumeroInterruptor, emCima: boolean): void {
        if (emCima) {
            this.emCima.add(numero);
        } else {
            this.emCima.delete(numero);
        }
    }

    estaEmCima(numero: NumeroInterruptor): boolean {
        return this.emCima.has(numero);
    }

    // Em baixo: 0. Em cima: 1 (ou solto, se a base estiver desligada).
    valorDoInterruptor(numero: NumeroInterruptor): ValorLogico {
        if (!this.emCima.has(numero)) {
            return 0;
        }
        return this.fonte.estaLigada() ? 1 : "Z";
    }
}