import { lerEntrada, saidasIndefinidas, verificarAlimentacao, type EstadoPinos } from "./comum";
import { PINO_GND, PINO_VCC, type NumeroPino } from "../pinos";
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

        // Para que serve cada pino, em palavras
        descreverPino(pino: NumeroPino): string {
            if (pino === PINO_VCC) {
                return "VCC, alimentação +5 V";
            }
            if (pino === PINO_GND) {
                return "GND, massa";
            }
            for (const [indice, porta] of this.portas.entries()) {
                const numero = indice + 1;
                if (porta.entradaA === pino) {
                    return `entrada A da porta ${numero}`;
                }
                if (porta.entradaB === pino) {
                    return `entrada B da porta ${numero}`;
                }
                if (porta.saida === pino) {
                    return `saída da porta ${numero}`;
                }
            }
            return "sem ligação interna";
        }
}