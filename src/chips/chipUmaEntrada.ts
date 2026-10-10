import { lerEntrada, saidasIndefinidas, verificarAlimentacao, type EstadoPinos } from "./comum";
import type { NumeroPino } from "../pinos";
import type { ValorLogico } from "../valorLogico";

export interface PortaUmaEntrada {
    entrada: NumeroPino;
    saida: NumeroPino;
}

export type FuncaoUmaEntrada = (a: ValorLogico) => ValorLogico;

export class ChipUmaEntrada {
    readonly nome: string;
    private readonly portas: readonly PortaUmaEntrada[];
    private readonly funcao: FuncaoUmaEntrada;

    constructor(nome: string, portas: readonly PortaUmaEntrada[], funcao: FuncaoUmaEntrada) {
        this.nome = nome;
        this.portas = portas;
        this.funcao = funcao;
    }

    estaAlimentado(pinos: EstadoPinos): boolean {
        return verificarAlimentacao(pinos);
    }

    calcularSaidas(pinos: EstadoPinos): EstadoPinos {
        if (!this.estaAlimentado(pinos)) {
            return saidasIndefinidas(this.portas.map((porta) => porta.saida));
        }

        const saidas: EstadoPinos = new Map();
        for (const porta of this.portas) {
            const a = lerEntrada(pinos, porta.entrada);
            saidas.set(porta.saida, this.funcao(a));
        }
        return saidas;
    }
}