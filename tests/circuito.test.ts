import { describe, it, expect } from "vitest";

import { Circuito } from "../src/circuito";
import { furoDoInterruptor, furoDoLed } from "../src/baseMontagem";
import { furoDoPino } from "../src/montagem";
import { criar74LS04, criar74LS08 } from "../src/chips/catalogo74LS";
import type { NumeroPino} from "../src/pinos";
import type { EstadoLed } from "../src/pb503/indicadores";
import { montarLab1 } from "../src/exemplos/lab1";
import { DIP14 } from "../src/pinos";

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

    describe("Circuito — informação para a interface", () => {
        it("guarda os fios pela ordem em que foram ligados", () => {
            const fios = montarLab1().listarFios();
            expect(fios.length).toBe(7);
            expect(fios[0]).toEqual({ de: "P1:E:10", para: "ALIM:+5V:1" });
        });
    
        it("lista os chips montados com a sua posição", () => {
            expect(montarLab1().listarChips()).toEqual([
                { nome: "74LS08", placa: 1, colunaPino1: 10, encapsulamento: DIP14 },
            ]);
        });
    });

    describe("Circuito — remover fios e chips", () => {
        it("remover um fio desfaz só essa ligação", () => {
            const circuito = new Circuito();
            circuito.ligarFio("P1:A:1", "P1:A:5");
            circuito.ligarFio("P1:A:5", "P1:A:9");
    
            circuito.removerFio(0);
    
            expect(circuito.base.estaoLigados("P1:A:1", "P1:A:5")).toBe(false);
            expect(circuito.base.estaoLigados("P1:A:5", "P1:A:9")).toBe(true);
            expect(circuito.listarFios()).toEqual([{ de: "P1:A:5", para: "P1:A:9" }]);
        });
    
        it("no Lab 1, remover o fio do LED deixa-o apagado", () => {
            const circuito = montarLab1();
            circuito.interruptores.colocar(1, true);
            circuito.interruptores.colocar(2, true);
            circuito.interruptores.colocar(3, true);
    
            circuito.removerFio(6);   // o 7.º fio do Lab 1: pino 8 → LED 1
            circuito.simular();
    
            expect(circuito.estadoDoLed(1)).toBe("apagado");
        });
    
        it("remover um chip liberta os seus furos", () => {
            const circuito = new Circuito();
            circuito.montarChip(criar74LS08(), 1, 10);
    
            circuito.removerChip(0);
    
            expect(circuito.listarChips()).toEqual([]);
            expect(() => circuito.montarChip(criar74LS04(), 1, 12)).not.toThrow();
        });
    
        it("rejeita índices que não existem", () => {
            const circuito = new Circuito();
            expect(() => circuito.removerFio(0)).toThrow();
            expect(() => circuito.removerChip(3)).toThrow();
        });
    });

    describe("Circuito — avaliar a montagem de um chip", () => {
        it("numa posição livre, a montagem é válida e os 14 furos estão livres", () => {
            const avaliacao = new Circuito().avaliarMontagem(1, 10);
            expect(avaliacao.valida).toBe(true);
            expect(avaliacao.furos.length).toBe(14);
            expect(avaliacao.furos.every((f) => f.livre)).toBe(true);
        });
    
        it("por cima de outro chip, é inválida e marca os furos ocupados", () => {
            const circuito = new Circuito();
            circuito.montarChip(criar74LS08(), 1, 10);
    
            const avaliacao = circuito.avaliarMontagem(1, 12);
    
            expect(avaliacao.valida).toBe(false);
            expect(avaliacao.motivo).toContain("ocupados");
            expect(avaliacao.furos.filter((f) => !f.livre).length).toBe(10);   // colunas 12 a 16, em cima e em baixo
        });
    
        it("a sair da breadboard, é inválida e só devolve os furos que existem", () => {
            const avaliacao = new Circuito().avaliarMontagem(1, 60);
            expect(avaliacao.valida).toBe(false);
            expect(avaliacao.motivo).toContain("não cabe");
            expect(avaliacao.furos.length).toBe(10);   // colunas 60 a 64, em cima e em baixo
        });
    
        it("avaliar não monta nada", () => {
            const circuito = new Circuito();
            circuito.avaliarMontagem(1, 10);
            expect(circuito.listarChips()).toEqual([]);
        });
    });

    describe("Circuito — ligações de um ponto", () => {
        it("no Lab 1, o pino 14 está ligado à fila +5V", () => {
            expect(montarLab1().ligacoesDoFuro(furoDoPino(1, 10, 14))).toEqual([
                "fila +5V da barra de alimentação",
                "pino 14 do 74LS08 (VCC, alimentação +5 V)",
            ]);
        });
    
        it("no Lab 1, o pino 1 está ligado ao interruptor S1", () => {
            expect(montarLab1().ligacoesDoFuro(furoDoPino(1, 10, 1))).toEqual([
                "interruptor S1",
                "pino 1 do 74LS08 (entrada A da porta 1)",
            ]);
        });
    
        it("no Lab 1, a saída da porta 1 está ligada a uma entrada da porta 3", () => {
            expect(montarLab1().ligacoesDoFuro(furoDoPino(1, 10, 3))).toEqual([
                "pino 3 do 74LS08 (saída da porta 1)",
                "pino 10 do 74LS08 (entrada B da porta 3)",
            ]);
        });
    
        it("uma coluna vazia não tem nada ligado", () => {
            expect(new Circuito().ligacoesDoFuro("P2:A:30")).toEqual([]);
        });
    });
});