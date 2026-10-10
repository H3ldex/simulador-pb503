import { describe, it, expect } from 'vitest';
import { ValorLogico } from '../src/valorLogico';
import { portaNOT, portaAND, portaOR } from '../src/portas';

describe('portaNOT', () => {
    it('deve retornar 1 se o valor for 0', () => {
        expect(portaNOT(0)).toBe(1);
    });
    it('deve retornar 0 se o valor for 1', () => {
        expect(portaNOT(1)).toBe(0);
    });
    it('deve retornar "Z" se o valor for "Z"', () => {
        expect(portaNOT("Z")).toBe("Z");
    });
});

describe('portaAND', () => {
    const casos: [ValorLogico, ValorLogico, ValorLogico][] = [
        // a,   b,   esperado
        [0,   0,   0],
        [0,   1,   0],
        [1,   0,   0],
        [1,   1,   1],
        ["Z", "Z", "Z"],
        [0,   "Z", 0],
        ["Z", 0,   0],
        [1,   "Z", "Z"],
        ["Z", 1,   "Z"],
    ];

    it.each(casos)('AND(%s, %s) = %s', (a, b, esperado) => {
        expect(portaAND(a, b)).toBe(esperado);
    });
});

describe('portaOR', () => {
    const casos: [ValorLogico, ValorLogico, ValorLogico][] = [
        // a,   b,   esperado
        [0,   0,   0],
        [0,   1,   1],
        [1,   0,   1],
        [1,   1,   1],
        ["Z", "Z", "Z"],
        [0,   "Z", "Z"],
        ["Z", 0,   "Z"],
        [1,   "Z", 1],
        ["Z", 1,   1],
    ];

    it.each(casos)('OR(%s, %s) = %s', (a, b, esperado) => {
        expect(portaOR(a, b)).toBe(esperado);
    });
});