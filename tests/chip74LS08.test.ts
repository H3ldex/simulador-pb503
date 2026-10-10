import { describe, it, expect } from "vitest";

import { criar74LS08 } from "../src/chips/catalogo74LS";  
import { PINO_GND, PINO_VCC, type NumeroPino } from "../src/pinos";
import type { ValorLogico } from "../src/valorLogico";
import { pinosAlimentados } from "./auxiliares";

describe("74LS08 — alimentação", () => {
    it("está alimentado com VCC a 1 e GND a 0", () => {
        const chip = criar74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([[PINO_VCC, 1], [PINO_GND, 0]]);
        expect(chip.estaAlimentado(pinos)).toBe(true);
    });

    it("não está alimentado com VCC solto", () => {
        const chip = criar74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([[PINO_GND, 0]]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com GND solto", () => {
        const chip = criar74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([[PINO_VCC, 1]]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com VCC e GND a 0", () => {
        const chip = criar74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([[PINO_VCC, 0], [PINO_GND, 0]]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com a alimentação trocada (VCC a 0 e GND a 1)", () => {
        const chip = criar74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([[PINO_VCC, 0], [PINO_GND, 1]]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });
});

describe("74LS08 — saídas", () => {
    const chip = criar74LS08();

    it("sem alimentação, todas as saídas ficam a Z", () => {
        const pinos = new Map<NumeroPino, ValorLogico>([[1, 1], [2, 1]]);
        expect(chip.calcularSaidas(pinos)).toEqual(
            new Map<NumeroPino, ValorLogico>([[3, "Z"], [6, "Z"], [8, "Z"], [11, "Z"]])
        );
    });

    it("com todas as entradas soltas, todas as saídas ficam a 1 (comportamento TTL)", () => {
        expect(chip.calcularSaidas(pinosAlimentados())).toEqual(
            new Map<NumeroPino, ValorLogico>([[3, 1], [6, 1], [8, 1], [11, 1]])
        );
    });

    // Tabela da porta 1 (pinos 1 e 2 → 3), com Z = entrada solta
    const casosPorta1: [ValorLogico, ValorLogico, ValorLogico][] = [
        // A,   B,   saída
        [0,   0,   0],
        [0,   1,   0],
        [0,   "Z", 0],
        [1,   0,   0],
        [1,   1,   1],
        [1,   "Z", 1],   // a entrada solta é lida como 1
        ["Z", "Z", 1],
    ];

    it.each(casosPorta1)("porta 1: entradas %s e %s → saída %s", (a, b, esperado) => {
        const pinos = pinosAlimentados([1, a], [2, b]);
        expect(chip.calcularSaidas(pinos).get(3)).toBe(esperado);
    });

    // Cada porta tem de estar ligada aos pinos certos
    const ligacoesPortas: [NumeroPino, NumeroPino, NumeroPino][] = [
        // entrada A, entrada B, saída
        [1,  2,  3],
        [4,  5,  6],
        [9,  10, 8],
        [12, 13, 11],
    ];
    const TODAS_AS_ENTRADAS: NumeroPino[] = [1, 2, 4, 5, 9, 10, 12, 13];

    it.each(ligacoesPortas)("entradas %s e %s ligam à saída %s", (entradaA, entradaB, saida) => {
        // Todas as entradas a 0, exceto as da porta testada
        const pinos = pinosAlimentados();
        for (const pino of TODAS_AS_ENTRADAS) {
            pinos.set(pino, 0);
        }
        pinos.set(entradaA, 1);
        pinos.set(entradaB, 1);

        const saidas = chip.calcularSaidas(pinos);

        for (const [pino, valor] of saidas) {
            expect(valor).toBe(pino === saida ? 1 : 0);
        }
    });
});