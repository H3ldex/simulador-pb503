import { describe, it, expect } from "vitest";

import { FonteAlimentacao } from "../src/pb503/fonte";
import { InterruptoresLogicos, type NumeroInterruptor } from "../src/pb503/interruptores";

const TODOS: NumeroInterruptor[] = [1, 2, 3, 4, 5, 6, 7, 8];

function interruptoresLigados(): InterruptoresLogicos {
    const fonte = new FonteAlimentacao();
    fonte.ligar();
    return new InterruptoresLogicos(fonte);
}

describe("InterruptoresLogicos", () => {
    it("começam todos em baixo, a 0", () => {
        const interruptores = interruptoresLigados();
        for (const numero of TODOS) {
            expect(interruptores.estaEmCima(numero)).toBe(false);
            expect(interruptores.valorDoInterruptor(numero)).toBe(0);
        }
    });

    it("em cima dão 1", () => {
        const interruptores = interruptoresLigados();
        interruptores.alternar(3);
        expect(interruptores.valorDoInterruptor(3)).toBe(1);
    });

    it("alternar duas vezes volta a pôr o interruptor em baixo", () => {
        const interruptores = interruptoresLigados();
        interruptores.alternar(3);
        interruptores.alternar(3);
        expect(interruptores.estaEmCima(3)).toBe(false);
    });

    it("com a base desligada, em cima ficam soltos e em baixo a 0", () => {
        const interruptores = new InterruptoresLogicos(new FonteAlimentacao());
        interruptores.colocar(1, true);
        expect(interruptores.valorDoInterruptor(1)).toBe("Z");
        expect(interruptores.valorDoInterruptor(2)).toBe(0);
    });

    it("cada interruptor é independente", () => {
        const interruptores = interruptoresLigados();
        interruptores.alternar(2);
        expect(interruptores.estaEmCima(2)).toBe(true);
        expect(interruptores.estaEmCima(1)).toBe(false);
        expect(interruptores.estaEmCima(3)).toBe(false);
    });
});