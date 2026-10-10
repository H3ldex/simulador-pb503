import { describe, it, expect } from "vitest";

import { BaseMontagem } from "../src/BaseMontagem";
import { ALTURA, LARGURA, PASSO, posicaoDoFuro, retanguloDoChip } from "../ui/layout";

describe("layout", () => {
    it("todos os furos da base têm posição, e nenhuma se repete", () => {
        const base = new BaseMontagem();
        const pontos = new Set<string>();
        for (const furo of base.listarFuros()) {
            const p = posicaoDoFuro(furo);
            pontos.add(`${p.x},${p.y}`);
        }
        expect(pontos.size).toBe(base.contarFuros());
    });

    it("todos os furos cabem dentro do desenho", () => {
        const base = new BaseMontagem();
        for (const furo of base.listarFuros()) {
            const p = posicaoDoFuro(furo);
            expect(p.x).toBeGreaterThan(0);
            expect(p.x).toBeLessThan(LARGURA);
            expect(p.y).toBeGreaterThan(0);
            expect(p.y).toBeLessThan(ALTURA);
        }
    });

    it("furos vizinhos da mesma linha ficam a um passo de distância", () => {
        const a = posicaoDoFuro("P1:A:1");
        const b = posicaoDoFuro("P1:A:2");
        expect(b.x - a.x).toBe(PASSO);
        expect(b.y).toBe(a.y);
    });

    it("o canal central separa as linhas E e F", () => {
        const e = posicaoDoFuro("P1:E:5");
        const f = posicaoDoFuro("P1:F:5");
        expect(f.y - e.y).toBeGreaterThan(PASSO);
    });

    it("as breadboards ficam umas por baixo das outras", () => {
        expect(posicaoDoFuro("P2:S1:1").y).toBeGreaterThan(posicaoDoFuro("P1:I2:1").y);
        expect(posicaoDoFuro("P3:S1:1").y).toBeGreaterThan(posicaoDoFuro("P2:I2:1").y);
    });

    it("rejeita nomes de furos inválidos", () => {
        expect(() => posicaoDoFuro("XPTO")).toThrow();
        expect(() => posicaoDoFuro("P1:Z:3")).toThrow();
        expect(() => posicaoDoFuro("ALIM:+12V:1")).toThrow();
    });

    it("o corpo de um chip fica entre as linhas E e F e cobre os 7 pinos de cada lado", () => {
        const corpo = retanguloDoChip(1, 10);
        const pino1 = posicaoDoFuro("P1:F:10");
        const pino7 = posicaoDoFuro("P1:F:16");
        const pino14 = posicaoDoFuro("P1:E:10");

        expect(corpo.x).toBeLessThan(pino1.x);
        expect(corpo.x + corpo.largura).toBeGreaterThan(pino7.x);
        expect(corpo.y).toBeGreaterThan(pino14.y);
        expect(corpo.y + corpo.altura).toBeLessThan(pino1.y);
    });
});