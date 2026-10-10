import { describe, it, expect } from "vitest";

import { descreverLocal, descreverValor } from "../src/descricao";
import type { ValorLogico } from "../src/valorLogico";

describe("descreverLocal", () => {
    const casos: [string, string][] = [
        ["P1:C:7",    "Breadboard 1, coluna 7, linha C"],
        ["P2:S1:30",  "Breadboard 2, 1.º barramento de cima"],
        ["ALIM:0V:5", "Barra de alimentação, fila 0 V (massa)"],
        ["INT:3:1",   "Terminal do interruptor S3"],
        ["LED:8:2",   "Terminal do LED 8"],
    ];

    it.each(casos)("%s → %s", (furo, esperado) => {
        expect(descreverLocal(furo)).toBe(esperado);
    });
});

describe("descreverValor", () => {
    const casos: [ValorLogico, string][] = [
        [1,   "1 (HIGH, +5 V)"],
        [0,   "0 (LOW, 0 V)"],
        ["Z", "sem valor (solto)"],
    ];

    it.each(casos)("%s → %s", (valor, esperado) => {
        expect(descreverValor(valor)).toBe(esperado);
    });
});