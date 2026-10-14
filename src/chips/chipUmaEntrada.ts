import { lerEntrada, saidasIndefinidas, verificarAlimentacao, type EstadoPinos } from "./comum";
import { DIP14, PINO_GND, PINO_VCC, type NumeroPino, type Encapsulamento } from "../pinos";
import type { ValorLogico } from "../valorLogico";

export interface PortaUmaEntrada {
    entrada: NumeroPino;
    saida: NumeroPino;
}

export type FuncaoUmaEntrada = (a: ValorLogico) => ValorLogico;

export class ChipUmaEntrada {
    readonly nome: string;
    readonly encapsulamento: Encapsulamento = DIP14;
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
                if (porta.entrada === pino) {
                    return `entrada da porta ${numero}`;
                }
                if (porta.saida === pino) {
                    return `saída da porta ${numero}`;
                }
            }
            return "sem ligação interna";
        }
}