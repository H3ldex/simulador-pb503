import { describe, it, expect } from "vitest";

import { UnionFind } from "../src/unionFind";

describe("UnionFind", () => {
    it("um elemento sozinho é o seu próprio chefe", () => {
        const uf = new UnionFind();
        expect(uf.encontrar("A")).toBe("A");
    });

    it("dois elementos começam separados", () => {
        const uf = new UnionFind();
        expect(uf.estaoLigados("A", "B")).toBe(false);
    });

    it("unir liga os dois elementos", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        expect(uf.estaoLigados("A", "B")).toBe(true);
    });

    it("a ligação funciona nos dois sentidos", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        expect(uf.estaoLigados("B", "A")).toBe(true);
    });

    it("a ligação é transitiva", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        uf.unir("B", "C");
        expect(uf.estaoLigados("A", "C")).toBe(true);
    });

    it("grupos diferentes continuam separados", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        uf.unir("C", "D");
        expect(uf.estaoLigados("A", "C")).toBe(false);
    });

    it("unir dois grupos liga todos os elementos", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        uf.unir("C", "D");
        uf.unir("B", "C");
        expect(uf.estaoLigados("A", "D")).toBe(true);
        expect(uf.encontrar("A")).toBe(uf.encontrar("D"));
    });

    it("unir duas vezes os mesmos elementos não estraga nada", () => {
        const uf = new UnionFind();
        uf.unir("A", "B");
        uf.unir("A", "B");
        expect(uf.estaoLigados("A", "B")).toBe(true);
    });

    it("unir um elemento consigo próprio não cria um ciclo", () => {
        const uf = new UnionFind();
        uf.unir("A", "A");
        expect(uf.encontrar("A")).toBe("A");
    });

    it("exemplo da breadboard: coluna 1, fio C1–C7 e coluna 7", () => {
        const uf = new UnionFind();
        // Ligações internas da coluna 1 (A1 a E1)
        uf.unir("A1", "B1");
        uf.unir("B1", "C1");
        uf.unir("C1", "D1");
        uf.unir("D1", "E1");
        // Ligações internas da coluna 7 (A7 a E7)
        uf.unir("A7", "B7");
        uf.unir("B7", "C7");
        uf.unir("C7", "D7");
        uf.unir("D7", "E7");

        // Antes do fio, as colunas estão separadas
        expect(uf.estaoLigados("A1", "E7")).toBe(false);

        // Fio de C1 a C7
        uf.unir("C1", "C7");

        // Agora são o mesmo nó elétrico
        expect(uf.estaoLigados("A1", "E7")).toBe(true);
        // Mas uma coluna sem fios continua isolada
        expect(uf.estaoLigados("A1", "A2")).toBe(false);
    });
});