import { describe, it, expect } from "vitest";

import { FonteAlimentacao } from "../src/pb503/fonte";
import { IndicadoresLogicos, type EstadoLed } from "../src/pb503/indicadores";
import type { ValorLogico } from "../src/valorLogico";

describe("IndicadoresLogicos", () => {
    const casos: [ValorLogico, EstadoLed][] = [
        [1,   "vermelho"],
        [0,   "verde"],
        ["Z", "apagado"],   // fio solto
    ];

    it.each(casos)("com a base ligada, o valor %s acende %s", (valor, esperado) => {
        const fonte = new FonteAlimentacao();
        fonte.ligar();
        expect(new IndicadoresLogicos(fonte).estadoDoLed(valor)).toBe(esperado);
    });

    it("com a base desligada, os LEDs estão sempre apagados", () => {
        const indicadores = new IndicadoresLogicos(new FonteAlimentacao());
        expect(indicadores.estadoDoLed(1)).toBe("apagado");
    });
});