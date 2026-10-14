import { lerEntrada, saidasIndefinidas, verificarAlimentacao, type EstadoPinos } from "./comum";
import { DIP16, type Encapsulamento, type NumeroPino } from "../pinos";
import type { ValorLogico } from "../valorLogico";

// Pinos de um dos dois multiplexadores do chip (datasheet do 74LS153)
interface PinosDoMux {
    letra: string;                                                       // "a" ou "b"
    enable: NumeroPino;                                                  // Ē, ativo a baixo
    dados: readonly [NumeroPino, NumeroPino, NumeroPino, NumeroPino];   // I0, I1, I2, I3
    saida: NumeroPino;                                                   // Z
}

// Seleção comum aos dois multiplexadores
const PINO_S0: NumeroPino = 14;
const PINO_S1: NumeroPino = 2;

const MULTIPLEXADORES: readonly PinosDoMux[] = [
    { letra: "a", enable: 1,  dados: [6, 5, 4, 3],     saida: 7 },
    { letra: "b", enable: 15, dados: [10, 11, 12, 13], saida: 9 },
];

// Dual 4-input multiplexer: Z = I[S1 S0], com Ē = 0; Z = 0 com Ē = 1
export class ChipMux153 {
    readonly nome = "74LS153";
    readonly encapsulamento: Encapsulamento = DIP16;

    calcularSaidas(pinos: EstadoPinos): EstadoPinos {
        if (!verificarAlimentacao(pinos, this.encapsulamento)) {
            return saidasIndefinidas(MULTIPLEXADORES.map((mux) => mux.saida));
        }

        const s1 = lerEntrada(pinos, PINO_S1);
        const s0 = lerEntrada(pinos, PINO_S0);

        const saidas: EstadoPinos = new Map();
        for (const mux of MULTIPLEXADORES) {
            saidas.set(mux.saida, saidaDoMux(pinos, mux, s1, s0));
        }
        return saidas;
    }

    // Para que serve cada pino, em palavras
    descreverPino(pino: NumeroPino): string {
        if (pino === this.encapsulamento.vcc) {
            return "VCC, alimentação +5 V";
        }
        if (pino === this.encapsulamento.gnd) {
            return "GND, massa";
        }
        if (pino === PINO_S0) {
            return "S0, seleção (comum aos dois multiplexadores)";
        }
        if (pino === PINO_S1) {
            return "S1, seleção (comum aos dois multiplexadores)";
        }
        for (const mux of MULTIPLEXADORES) {
            if (pino === mux.enable) {
                return `Ē${mux.letra}, enable do multiplexador ${mux.letra} (ativo a 0)`;
            }
            if (pino === mux.saida) {
                return `Z${mux.letra}, saída do multiplexador ${mux.letra}`;
            }
            for (const [indice, pinoDeDados] of mux.dados.entries()) {
                if (pino === pinoDeDados) {
                    return `I${indice}${mux.letra}, entrada de dados ${indice} do multiplexador ${mux.letra}`;
                }
            }
        }
        return "sem ligação interna";
    }
}

// Saída de um multiplexador, lendo as entradas como um chip TTL
function saidaDoMux(pinos: EstadoPinos, mux: PinosDoMux, s1: 0 | 1, s0: 0 | 1): ValorLogico {
    // Ē é ativo a baixo: com Ē = 1 (ou solto), a saída é forçada a 0
    if (lerEntrada(pinos, mux.enable) === 1) {
        return 0;
    }
    const [i0, i1, i2, i3] = mux.dados;
    const escolhido = s1 === 0 ? (s0 === 0 ? i0 : i1) : (s0 === 0 ? i2 : i3);
    return lerEntrada(pinos, escolhido);
}