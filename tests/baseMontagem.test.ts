import { describe, it, expect } from "vitest";

import { BaseMontagem } from "../src/baseMontagem";

describe("BaseMontagem — barra de alimentação", () => {
    it("cada fila está ligada de ponta a ponta", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("ALIM:+5V:1", "ALIM:+5V:50")).toBe(true);
        expect(base.estaoLigados("ALIM:0V:1", "ALIM:0V:50")).toBe(true);
    });

    it("as quatro filas estão separadas entre si", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("ALIM:+5V:1", "ALIM:0V:1")).toBe(false);
        expect(base.estaoLigados("ALIM:+5V:1", "ALIM:+V:1")).toBe(false);
        expect(base.estaoLigados("ALIM:+V:1", "ALIM:-V:1")).toBe(false);
    });

    it("as filas de tensão variável existem (para serem desenhadas)", () => {
        const base = new BaseMontagem();
        expect(base.existeFuro("ALIM:+V:10")).toBe(true);
        expect(base.existeFuro("ALIM:-V:10")).toBe(true);
    });
});

describe("BaseMontagem — breadboards", () => {
    it("os 5 furos de cada coluna estão ligados (A–E e F–J)", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:A:3", "P1:E:3")).toBe(true);
        expect(base.estaoLigados("P1:F:3", "P1:J:3")).toBe(true);
    });

    it("o canal central separa as duas metades da mesma coluna", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:E:3", "P1:F:3")).toBe(false);
    });

    it("colunas diferentes estão separadas", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:A:1", "P1:A:2")).toBe(false);
    });

    it("as três breadboards são independentes", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:A:1", "P2:A:1")).toBe(false);
        expect(base.estaoLigados("P2:A:1", "P3:A:1")).toBe(false);
    });

    it("cada fila de barramento tem duas metades independentes", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:S1:1", "P1:S1:25")).toBe(true);
        expect(base.estaoLigados("P1:S1:26", "P1:S1:50")).toBe(true);
        expect(base.estaoLigados("P1:S1:25", "P1:S1:26")).toBe(false);
    });

    it("os barramentos das breadboards não estão ligados à barra de alimentação", () => {
        const base = new BaseMontagem();
        expect(base.estaoLigados("P1:S1:1", "ALIM:+5V:1")).toBe(false);
    });
});

describe("BaseMontagem — fios", () => {
    it("um fio liga a alimentação a uma coluna", () => {
        const base = new BaseMontagem();
        base.ligarFio("ALIM:+5V:10", "P1:A:20");
        expect(base.estaoLigados("ALIM:+5V:1", "P1:E:20")).toBe(true);
    });

    it("um fio liga furos de breadboards diferentes", () => {
        const base = new BaseMontagem();
        base.ligarFio("P1:C:5", "P2:C:40");
        expect(base.noDoFuro("P1:A:5")).toBe(base.noDoFuro("P2:E:40"));
    });
});

describe("BaseMontagem — tamanho e furos inválidos", () => {
    it("tem 2520 furos nas breadboards e 200 na barra de alimentação", () => {
        const base = new BaseMontagem();
        expect(base.contarFuros()).toBe(2520 + 200);
    });

    it("rejeita furos que não existem", () => {
        const base = new BaseMontagem();
        expect(base.existeFuro("P4:A:1")).toBe(false);      // só há 3 breadboards
        expect(base.existeFuro("P1:K:1")).toBe(false);      // não há linha K
        expect(base.existeFuro("P1:A:65")).toBe(false);     // só há 64 colunas
        expect(base.existeFuro("ALIM:+12V:1")).toBe(false); // fila inexistente
    });

    it("lança um erro ao ligar um fio a um furo inexistente", () => {
        const base = new BaseMontagem();
        expect(() => base.ligarFio("P1:A:1", "P1:K:1")).toThrow('O furo "P1:K:1" não existe');
    });
});