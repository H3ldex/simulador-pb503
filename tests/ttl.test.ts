import { lerEntradaTTL } from "../src/ttl";
import { ValorLogico } from "../src/valorLogico";
import { describe, it, expect } from "vitest";

describe('lerEntradaTTL', () => {
    const casos: [ValorLogico, 0 | 1][] = [
        // valor, esperado
        ["Z", 1],
        [0, 0],
        [1, 1],
    ];
    it.each(casos)('lerEntradaTTL(%s) = %s', (valor, esperado) => {
        expect(lerEntradaTTL(valor)).toBe(esperado);
    });
});

