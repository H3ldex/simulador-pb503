import { describe, it, expect } from "vitest";

import { criar74LS153 } from "../src/chips/catalogo74LS";
import type { EstadoPinos } from "../src/chips/comum";
import { DIP16, type NumeroPino } from "../src/pinos";
import type { ValorLogico } from "../src/valorLogico";

type Ligacao = [NumeroPino, ValorLogico];

// Um DIP-16 alimentado (VCC = 16, GND = 8), mais as ligações indicadas
function alimentado(...ligacoes: Ligacao[]): EstadoPinos {
    return new Map<NumeroPino, ValorLogico>([[16, 1], [8, 0], ...ligacoes]);
}

// Põe a entrada escolhida com um valor e as outras três com o valor oposto
function dados(pinos: NumeroPino[], escolhido: NumeroPino, valor: 0 | 1): Ligacao[] {
    return pinos.map((pino): Ligacao => [pino, pino === escolhido ? valor : valor === 1 ? 0 : 1]);
}

const DADOS_A: NumeroPino[] = [6, 5, 4, 3];      // I0a, I1a, I2a, I3a
const DADOS_B: NumeroPino[] = [10, 11, 12, 13];  // I0b, I1b, I2b, I3b

// [S1, S0, índice da entrada escolhida]
const SELECOES: [0 | 1, 0 | 1, 0 | 1 | 2 | 3][] = [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 2],
    [1, 1, 3],
];

describe("74LS153 — alimentação", () => {
    it("sem alimentação, as duas saídas ficam a Z", () => {
        expect(criar74LS153().calcularSaidas(new Map())).toEqual(new Map([[7, "Z"], [9, "Z"]]));
    });

    it("alimentado nos pinos de um DIP-14 (14 e 7) não funciona", () => {
        const pinos = new Map<NumeroPino, ValorLogico>([[14, 1], [7, 0]]);
        expect(criar74LS153().calcularSaidas(pinos).get(7)).toBe("Z");
    });
});

describe("74LS153 — multiplexador a (Ēa = 0)", () => {
    it.each(SELECOES)("S1=%s, S0=%s escolhe I%sa", (s1, s0, indice) => {
        const escolhido = DADOS_A[indice] ?? 6;
        const base: Ligacao[] = [[2, s1], [14, s0], [1, 0]];
        const chip = criar74LS153();

        expect(chip.calcularSaidas(alimentado(...base, ...dados(DADOS_A, escolhido, 1))).get(7)).toBe(1);
        expect(chip.calcularSaidas(alimentado(...base, ...dados(DADOS_A, escolhido, 0))).get(7)).toBe(0);
    });
});

describe("74LS153 — multiplexador b (Ēb = 0)", () => {
    it.each(SELECOES)("S1=%s, S0=%s escolhe I%sb", (s1, s0, indice) => {
        const escolhido = DADOS_B[indice] ?? 10;
        const base: Ligacao[] = [[2, s1], [14, s0], [15, 0]];
        const chip = criar74LS153();

        expect(chip.calcularSaidas(alimentado(...base, ...dados(DADOS_B, escolhido, 1))).get(9)).toBe(1);
        expect(chip.calcularSaidas(alimentado(...base, ...dados(DADOS_B, escolhido, 0))).get(9)).toBe(0);
    });
});

describe("74LS153 — enable (Ē, ativo a 0)", () => {
    const todosA1: Ligacao[] = DADOS_A.map((pino): Ligacao => [pino, 1]);

    it("com Ēa = 1, a saída Za fica a 0 mesmo com os dados a 1", () => {
        const pinos = alimentado([1, 1], [2, 0], [14, 0], ...todosA1);
        expect(criar74LS153().calcularSaidas(pinos).get(7)).toBe(0);
    });

    it("com Ēa solto, o chip lê-o como 1 e Za fica a 0 (a armadilha TTL)", () => {
        const pinos = alimentado([2, 0], [14, 0], ...todosA1);
        expect(criar74LS153().calcularSaidas(pinos).get(7)).toBe(0);
    });

    it("os dois multiplexadores partilham a seleção, mas têm enables independentes", () => {
        // S1 = 1, S0 = 0 escolhe I2a (pino 4) e I2b (pino 12); Ēa = 0, Ēb = 1
        const pinos = alimentado([2, 1], [14, 0], [1, 0], [15, 1], [4, 1], [12, 1]);
        const saidas = criar74LS153().calcularSaidas(pinos);
        expect(saidas.get(7)).toBe(1);
        expect(saidas.get(9)).toBe(0);
    });
});

describe("74LS153 — descrição dos pinos", () => {
    it("usa o encapsulamento DIP-16 e descreve cada pino", () => {
        const chip = criar74LS153();
        expect(chip.encapsulamento).toBe(DIP16);
        expect(chip.descreverPino(16)).toBe("VCC, alimentação +5 V");
        expect(chip.descreverPino(8)).toBe("GND, massa");
        expect(chip.descreverPino(14)).toBe("S0, seleção (comum aos dois multiplexadores)");
        expect(chip.descreverPino(1)).toBe("Ēa, enable do multiplexador a (ativo a 0)");
        expect(chip.descreverPino(3)).toBe("I3a, entrada de dados 3 do multiplexador a");
        expect(chip.descreverPino(9)).toBe("Zb, saída do multiplexador b");
    });
});