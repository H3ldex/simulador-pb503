import { describe, it, expect } from "vitest";

import {
    criar74LS00, criar74LS02, criar74LS04, criar74LS08, criar74LS32, criar74LS86,
} from "../src/chips/catalogo74LS";
import type { NumeroPino } from "../src/pinos";
import { pinosAlimentados } from "./auxiliares";

type Ligacao = [NumeroPino, NumeroPino, NumeroPino];   // [entrada A, entrada B, saída]

const LIGACOES_PADRAO: Ligacao[] = [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]];
const LIGACOES_74LS02: Ligacao[] = [[2, 3, 1], [5, 6, 4], [8, 9, 10], [11, 12, 13]];

// As 4 combinações de entradas das tabelas de verdade das aulas
const COMBINACOES: [0 | 1, 0 | 1][] = [[0, 0], [0, 1], [1, 0], [1, 1]];

// "tabela": saída esperada para cada linha de COMBINACOES (00, 01, 10, 11)
const CHIPS_DUAS_ENTRADAS = [
    { nome: "74LS00 (NAND)", criar: criar74LS00, ligacoes: LIGACOES_PADRAO, tabela: [1, 1, 1, 0] },
    { nome: "74LS02 (NOR)",  criar: criar74LS02, ligacoes: LIGACOES_74LS02, tabela: [1, 0, 0, 0] },
    { nome: "74LS08 (AND)",  criar: criar74LS08, ligacoes: LIGACOES_PADRAO, tabela: [0, 0, 0, 1] },
    { nome: "74LS32 (OR)",   criar: criar74LS32, ligacoes: LIGACOES_PADRAO, tabela: [0, 1, 1, 1] },
    { nome: "74LS86 (XOR)",  criar: criar74LS86, ligacoes: LIGACOES_PADRAO, tabela: [0, 1, 1, 0] },
];

describe.each(CHIPS_DUAS_ENTRADAS)("$nome", ({ criar, ligacoes, tabela }) => {
    it("sem alimentação, as 4 saídas ficam a Z", () => {
        const saidas = criar().calcularSaidas(new Map());
        expect(saidas.size).toBe(4);
        for (const valor of saidas.values()) {
            expect(valor).toBe("Z");
        }
    });

    it.each(ligacoes)("entradas %s e %s → saída %s seguem a tabela de verdade", (entradaA, entradaB, saida) => {
        const chip = criar();
        COMBINACOES.forEach(([a, b], linha) => {
            const saidas = chip.calcularSaidas(pinosAlimentados([entradaA, a], [entradaB, b]));
            expect(saidas.get(saida)).toBe(tabela[linha]);
        });
    });
});

describe("74LS04 (NOT)", () => {
    const LIGACOES_74LS04: [NumeroPino, NumeroPino][] = [[1, 2], [3, 4], [5, 6], [9, 8], [11, 10], [13, 12]];

    it("sem alimentação, as 6 saídas ficam a Z", () => {
        const saidas = criar74LS04().calcularSaidas(new Map());
        expect(saidas.size).toBe(6);
        for (const valor of saidas.values()) {
            expect(valor).toBe("Z");
        }
    });

    it.each(LIGACOES_74LS04)("entrada %s → saída %s inverte o valor", (entrada, saida) => {
        const chip = criar74LS04();
        expect(chip.calcularSaidas(pinosAlimentados([entrada, 0])).get(saida)).toBe(1);
        expect(chip.calcularSaidas(pinosAlimentados([entrada, 1])).get(saida)).toBe(0);
    });

    describe("descreverPino", () => {
        it("74LS08: alimentação, entradas e saídas", () => {
            const chip = criar74LS08();
            expect(chip.descreverPino(14)).toBe("VCC, alimentação +5 V");
            expect(chip.descreverPino(7)).toBe("GND, massa");
            expect(chip.descreverPino(1)).toBe("entrada A da porta 1");
            expect(chip.descreverPino(3)).toBe("saída da porta 1");
            expect(chip.descreverPino(8)).toBe("saída da porta 3");
        });
    
        it("74LS02: a saída vem antes das entradas", () => {
            const chip = criar74LS02();
            expect(chip.descreverPino(1)).toBe("saída da porta 1");
            expect(chip.descreverPino(2)).toBe("entrada A da porta 1");
        });
    
        it("74LS04: entradas e saídas dos inversores", () => {
            const chip = criar74LS04();
            expect(chip.descreverPino(1)).toBe("entrada da porta 1");
            expect(chip.descreverPino(12)).toBe("saída da porta 6");
        });
    });
});