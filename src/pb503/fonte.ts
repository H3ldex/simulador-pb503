import type { ValorLogico } from "../valorLogico";

// As quatro filas da barra de alimentação (Lab 1, figura 3)
export type FilaAlimentacao = "+5V" | "+V" | "-V" | "0V";

export class FonteAlimentacao {
    private ligada = false;

    // Interruptor geral (POWER)
    ligar(): void {
        this.ligada = true;
    }

    desligar(): void {
        this.ligada = false;
    }

    estaLigada(): boolean {
        return this.ligada;
    }

    // +5 V = 1 (só com a base ligada) e 0 V = 0.
    // As filas +V e −V existem apenas visualmente: não fornecem valor lógico.
    valorDaFila(fila: FilaAlimentacao): ValorLogico {
        if (fila === "0V") {
            return 0;   // a massa é a referência: sempre 0
        }
        if (fila === "+5V") {
            return this.ligada ? 1 : "Z";
        }
        return "Z";
    }
}