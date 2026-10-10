import { describe, it, expect } from "vitest";

import { FonteAlimentacao } from "../src/pb503/fonte";

describe("FonteAlimentacao", () => {
    it("começa desligada: só a massa tem valor", () => {
        const fonte = new FonteAlimentacao();
        expect(fonte.estaLigada()).toBe(false);
        expect(fonte.valorDaFila("+5V")).toBe("Z");
        expect(fonte.valorDaFila("0V")).toBe(0);
    });

    it("ligada, a fila de +5 V vale 1 e a de 0 V vale 0", () => {
        const fonte = new FonteAlimentacao();
        fonte.ligar();
        expect(fonte.valorDaFila("+5V")).toBe(1);
        expect(fonte.valorDaFila("0V")).toBe(0);
    });

    it("as filas +V e −V não fornecem valor lógico (são só visuais)", () => {
        const fonte = new FonteAlimentacao();
        fonte.ligar();
        expect(fonte.valorDaFila("+V")).toBe("Z");
        expect(fonte.valorDaFila("-V")).toBe("Z");
    });

    it("desligar volta a deixar a fila de +5 V sem valor", () => {
        const fonte = new FonteAlimentacao();
        fonte.ligar();
        fonte.desligar();
        expect(fonte.valorDaFila("+5V")).toBe("Z");
    });
});