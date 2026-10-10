import { describe, it, expect } from "vitest";

import { Circuito } from "../src/circuito";
import { furoDoInterruptor, furoDoLed } from "../src/BaseMontagem";
import { furoDoPino } from "../src/montagem";
import { criar74LS04, criar74LS08 } from "../src/chips/catalogo74LS";
import type { NumeroPino } from "../src/pinos";
import type { EstadoLed } from "../src/pb503/indicadores";
import { montarLab1 } from "../src/exemplos/lab1";

describe("Circuito — Lab 1 (F = A2 · A0 · A1)", () => {
    // S1, S2, S3 em cima?  →  LED 1
    const tabela: [boolean, boolean, boolean, EstadoLed][] = [
        [false, false, false, "verde"],
        [false, false, true,  "verde"],
        [false, true,  false, "verde"],
        [false, true,  true,  "verde"],
        [true,  false, false, "verde"],
        [true,  false, true,  "verde"],
        [true,  true,  false, "verde"],
        [true,  true,  true,  "vermelho"],
    ];

    it.each(tabela)("S1=%s, S2=%s, S3=%s → LED 1 %s", (s1, s2, s3, esperado) => {
        const circuito = montarLab1();
        circuito.interruptores.colocar(1, s1);
        circuito.interruptores.colocar(2, s2);
        circuito.interruptores.colocar(3, s3);

        const resultado = circuito.simular();

        expect(resultado.estabilizou).toBe(true);
        expect(resultado.curtos).toEqual([]);
        expect(circuito.estadoDoLed(1)).toBe(esperado);
    });
});

describe("Circuito — erros de montagem do enunciado", () => {
    it("com a base desligada, o LED fica apagado", () => {
        const circuito = montarLab1();
        circuito.fonte.desligar();
        circuito.simular();
        expect(circuito.estadoDoLed(1)).toBe("apagado");
    });

    it("um chip sem alimentação deixa a saída solta e o LED apagado", () => {
        const circuito = montarLab1({ alimentarChip: false });
        circuito.interruptores.colocar(1, true);
        circuito.simular();
        expect(circuito.estadoDoLed(1)).toBe("apagado");
    });

    it("uma entrada esquecida é lida como 1 (a armadilha TTL)", () => {
        const circuito = montarLab1({ ligarS3: false });
        circuito.interruptores.colocar(1, true);
        circuito.interruptores.colocar(2, true);
        circuito.simular();
        // O S3 nem está ligado, mas o LED acende como se estivesse a 1
        expect(circuito.estadoDoLed(1)).toBe("vermelho");
    });

    it("duas saídas em desacordo no mesmo LED são um curto-circuito", () => {
        const circuito = new Circuito();
        circuito.montarChip(criar74LS04(), 1, 20);
        const pino = (n: NumeroPino): string => furoDoPino(1, 20, n);
        circuito.ligarFio(pino(14), "ALIM:+5V:1");
        circuito.ligarFio(pino(7), "ALIM:0V:1");
        circuito.ligarFio(furoDoInterruptor(1), pino(1));   // S1 em baixo → pino 2 = 1
        circuito.ligarFio(furoDoInterruptor(2), pino(3));   // S2 em cima  → pino 4 = 0
        circuito.interruptores.colocar(2, true);
        circuito.ligarFio(pino(2), furoDoLed(1));
        circuito.ligarFio(pino(4), furoDoLed(1));           // erro: duas saídas no LED 1
        circuito.fonte.ligar();

        const resultado = circuito.simular();

        expect(resultado.curtos.length).toBe(1);
        expect(resultado.curtos[0]?.condutores).toEqual(["74LS04 (pino 2)", "74LS04 (pino 4)"]);
        expect(circuito.estadoDoLed(1)).toBe("apagado");
    });

    it("uma NOT com a saída ligada à própria entrada nunca estabiliza", () => {
        const circuito = new Circuito();
        circuito.montarChip(criar74LS04(), 1, 20);
        const pino = (n: NumeroPino): string => furoDoPino(1, 20, n);
        circuito.ligarFio(pino(14), "ALIM:+5V:1");
        circuito.ligarFio(pino(7), "ALIM:0V:1");
        circuito.ligarFio(pino(2), pino(1));   // saída → entrada
        circuito.fonte.ligar();

        const resultado = circuito.simular();

        expect(resultado.estabilizou).toBe(false);
    });

    it("não deixa montar dois chips nos mesmos furos", () => {
        const circuito = new Circuito();
        circuito.montarChip(criar74LS08(), 1, 10);
        expect(() => circuito.montarChip(criar74LS04(), 1, 12)).toThrow("já está ocupado");
    });
});