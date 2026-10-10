import { describe, it, expect } from "vitest";

import { ALTURA, LARGURA } from "../ui/layout";
import { adaptarVista, ampliar, deslocar, nivelDeZoom, vistaAjustada } from "../ui/vista";

describe("vista", () => {
    it("num ecrã largo, mostra a placa inteira centrada na horizontal", () => {
        const vista = vistaAjustada(2);
        expect(vista.altura).toBe(ALTURA);
        expect(vista.largura).toBe(2 * ALTURA);
        expect(vista.x + vista.largura / 2).toBeCloseTo(LARGURA / 2);
    });

    it("num ecrã alto, mostra a placa inteira centrada na vertical", () => {
        const vista = vistaAjustada(0.5);
        expect(vista.largura).toBe(LARGURA);
        expect(vista.y + vista.altura / 2).toBeCloseTo(ALTURA / 2);
    });

    it("ao aproximar, o ponto debaixo do cursor fica no mesmo sítio", () => {
        const ajustada = vistaAjustada(1);
        const ponto = { x: 470, y: 435 };
        const antes = ajustada;
        const depois = ampliar(antes, ajustada, ponto, 2);

        expect((ponto.x - depois.x) / depois.largura).toBeCloseTo((ponto.x - antes.x) / antes.largura);
        expect((ponto.y - depois.y) / depois.altura).toBeCloseTo((ponto.y - antes.y) / antes.altura);
        expect(nivelDeZoom(depois, ajustada)).toBeCloseTo(2);
    });

    it("não aproxima mais do que 6× nem afasta mais do que a placa inteira", () => {
        const ajustada = vistaAjustada(1.5);
        const centro = { x: LARGURA / 2, y: ALTURA / 2 };
        expect(nivelDeZoom(ampliar(ajustada, ajustada, centro, 1000), ajustada)).toBeCloseTo(6);
        expect(nivelDeZoom(ampliar(ajustada, ajustada, centro, 0.001), ajustada)).toBeCloseTo(1);
    });

    it("mantém a forma da vista ao aproximar", () => {
        const ajustada = vistaAjustada(1.5);
        const depois = ampliar(ajustada, ajustada, { x: 300, y: 300 }, 3);
        expect(depois.largura / depois.altura).toBeCloseTo(1.5);
    });

    it("não deixa deslocar a vista para fora da placa", () => {
        const ajustada = vistaAjustada(1.5);
        const aproximada = ampliar(ajustada, ajustada, { x: LARGURA / 2, y: ALTURA / 2 }, 2);
        const deslocada = deslocar(aproximada, ajustada, 100000, 100000);
        expect(deslocada.x).toBeCloseTo(ajustada.x + ajustada.largura - aproximada.largura);
        expect(deslocada.y).toBeCloseTo(ajustada.y + ajustada.altura - aproximada.altura);
    });

    it("ao redimensionar a zona, mantém o zoom, o centro e adota a nova forma", () => {
        const antiga = vistaAjustada(1.5);
        const vista = ampliar(antiga, antiga, { x: 470, y: 435 }, 2);
        const nova = vistaAjustada(1.2);

        const adaptada = adaptarVista(vista, antiga, nova);

        expect(nivelDeZoom(adaptada, nova)).toBeCloseTo(2);
        expect(adaptada.x + adaptada.largura / 2).toBeCloseTo(vista.x + vista.largura / 2);
        expect(adaptada.y + adaptada.altura / 2).toBeCloseTo(vista.y + vista.altura / 2);
        expect(adaptada.largura / adaptada.altura).toBeCloseTo(1.2);
    });
});