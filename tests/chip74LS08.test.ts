import { describe, it, expect } from "vitest";

import { Chip74LS08 } from "../src/chip74LS08";
import { PINO_GND, PINO_VCC } from "../src/pinos";
import type { NumeroPino } from "../src/pinos";
import type { ValorLogico } from "../src/valorLogico";

describe("Chip74LS08 — alimentação", () => {
    it("está alimentado com VCC a 1 e GND a 0", () => {
        const chip = new Chip74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([
            [PINO_VCC, 1],
            [PINO_GND, 0],
        ]);
        expect(chip.estaAlimentado(pinos)).toBe(true);
    });

    it("não está alimentado com VCC solto", () => {
        const chip = new Chip74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([
            [PINO_GND, 0],
        ]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com GND solto", () => {
        const chip = new Chip74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([
            [PINO_VCC, 1],
        ]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com VCC e GND a 0", () => {
        const chip = new Chip74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([
            [PINO_VCC, 0],
            [PINO_GND, 0],
        ]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });

    it("não está alimentado com a alimentação trocada (VCC a 0 e GND a 1)", () => {
        const chip = new Chip74LS08();
        const pinos = new Map<NumeroPino, ValorLogico>([
            [PINO_VCC, 0],
            [PINO_GND, 1],
        ]);
        expect(chip.estaAlimentado(pinos)).toBe(false);
    });
});