import { describe, it, expect } from "vitest";

import { furoDoPino, furosDoChip } from "../src/montagem";
import { BaseMontagem } from "../src/BaseMontagem";
import type { NumeroPino } from "../src/pinos";

describe("furoDoPino", () => {
    // Chip na breadboard 1 com o pino 1 na coluna 10
    const casos: [NumeroPino, string][] = [
        [1,  "P1:F:10"],   // canto inferior esquerdo
        [3,  "P1:F:12"],
        [7,  "P1:F:16"],   // GND, canto inferior direito
        [8,  "P1:E:16"],   // canto superior direito
        [11, "P1:E:13"],
        [14, "P1:E:10"],   // VCC, canto superior esquerdo
    ];

    it.each(casos)("pino %s fica no furo %s", (pino, furo) => {
        expect(furoDoPino(1, 10, pino)).toBe(furo);
    });

    it("funciona nas outras breadboards", () => {
        expect(furoDoPino(3, 1, 1)).toBe("P3:F:1");
        expect(furoDoPino(3, 1, 14)).toBe("P3:E:1");
    });

    it("aceita a última coluna em que o chip cabe (58)", () => {
        expect(furoDoPino(1, 58, 7)).toBe("P1:F:64");
        expect(furoDoPino(1, 58, 8)).toBe("P1:E:64");
    });

    const posicoesInvalidas: [number, number][] = [
        // placa, coluna do pino 1
        [4, 10],    // só há 3 breadboards
        [1, 59],    // o pino 7 ficaria na coluna 65
        [1, 0],     // as colunas começam em 1
        [1, 10.5],  // a coluna tem de ser inteira
    ];

    it.each(posicoesInvalidas)("rejeita a breadboard %s com o pino 1 na coluna %s", (placa, coluna) => {
        expect(() => furoDoPino(placa, coluna, 1)).toThrow();
    });
});

describe("furosDoChip", () => {
    it("devolve os 14 pinos em furos diferentes", () => {
        const furos = furosDoChip(1, 10);
        expect(furos.size).toBe(14);
        expect(new Set(furos.values()).size).toBe(14);
    });

    it("todos os furos existem na base de montagem", () => {
        const base = new BaseMontagem();
        for (const furo of furosDoChip(2, 30).values()) {
            expect(base.existeFuro(furo)).toBe(true);
        }
    });

    it("cada pino fica num nó elétrico diferente (o canal separa os dois lados)", () => {
        const base = new BaseMontagem();
        const nos = new Set<string>();
        for (const furo of furosDoChip(1, 10).values()) {
            nos.add(base.noDoFuro(furo));
        }
        expect(nos.size).toBe(14);
    });
});