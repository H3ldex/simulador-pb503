import { lerEntrada, saidasIndefinidas, verificarAlimentacao, type EstadoPinos } from "./comum";
import type { NumeroPino } from "../pinos";
import type { ValorLogico } from "../valorLogico";

export interface PortaDuasEntradas {
    entradaA: NumeroPino;
    entradaB: NumeroPino;
    saida: NumeroPino;
}

export type FuncaoDuasEntradas = (a: ValorLogico, b: ValorLogico) => ValorLogico;

export class ChipDuasEntradas {
    readonly nome: string;
    private readonly portas: readonly PortaDuasEntradas[];
    private readonly funcao: FuncaoDuasEntradas;

    constructor(nome: string, portas: readonly PortaDuasEntradas[], funcao: FuncaoDuasEntradas) {
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
            const a = lerEntrada(pinos, porta.entradaA);
            const b = lerEntrada(pinos, porta.entradaB);
            saidas.set(porta.saida, this.funcao(a, b));
        }
        return saidas;
    }
}