import type { Circuito } from "../src/circuito";
import { FILAS_ALIMENTACAO, NUMERO_DE_BREADBOARDS, NUMERO_DE_LEDS, furoDoLed } from "../src/BaseMontagem";
import type { NumeroInterruptor } from "../src/pb503/interruptores";
import {
    ALTURA,
    LARGURA,
    posicaoDoFuro,
    posicaoDoInterruptor,
    posicaoDoLed,
    retanguloDaBarra,
    retanguloDaBreadboard,
    retanguloDoPower,
} from "./layout";

const SVG_NS = "http://www.w3.org/2000/svg";
const INTERRUPTORES: NumeroInterruptor[] = [1, 2, 3, 4, 5, 6, 7, 8];

// O que a placa faz quando se clica nela (quem decide é o main.ts)
export interface AcoesDaPlaca {
    aoClicarPower(): void;
    aoClicarInterruptor(numero: NumeroInterruptor): void;
}

// Cria um elemento SVG com os atributos indicados e, opcionalmente, um texto
function criar(tag: string, atributos: Record<string, string | number>, texto?: string): SVGElement {
    const elemento = document.createElementNS(SVG_NS, tag);
    for (const [nome, valor] of Object.entries(atributos)) {
        elemento.setAttribute(nome, String(valor));
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

export function desenharPlaca(circuito: Circuito, acoes: AcoesDaPlaca): SVGElement {
    const svg = criar("svg", { viewBox: `0 0 ${LARGURA} ${ALTURA}`, class: "placa" });
    svg.append(criar("rect", { x: 0, y: 0, width: LARGURA, height: ALTURA, rx: 12, class: "fundo" }));

    desenharPower(svg, circuito, acoes);
    desenharAreas(svg);
    desenharFuros(svg, circuito);
    desenharLeds(svg, circuito);
    desenharInterruptores(svg, circuito, acoes);

    return svg;
}

function desenharPower(svg: SVGElement, circuito: Circuito, acoes: AcoesDaPlaca): void {
    const r = retanguloDoPower();
    const grupo = criar("g", { class: circuito.fonte.estaLigada() ? "power ligado" : "power" });
    grupo.append(criar("rect", { x: r.x, y: r.y, width: r.largura, height: r.altura, rx: 4 }));
    grupo.append(criar("text", { x: r.x + r.largura / 2, y: r.y + r.altura / 2 + 4 }, "POWER"));
    grupo.addEventListener("click", () => acoes.aoClicarPower());
    svg.append(grupo);
}

// Fundos claros da barra de alimentação e das breadboards, e rótulos das filas
function desenharAreas(svg: SVGElement): void {
    const barra = retanguloDaBarra();
    svg.append(criar("rect", { x: barra.x, y: barra.y, width: barra.largura, height: barra.altura, rx: 3, class: "area" }));

    for (const fila of FILAS_ALIMENTACAO) {
        const inicio = posicaoDoFuro(`ALIM:${fila}:1`);
        svg.append(criar("text", { x: inicio.x - 16, y: inicio.y + 3, class: "rotulo", "text-anchor": "end" }, fila));
    }

    for (let placa = 1; placa <= NUMERO_DE_BREADBOARDS; placa++) {
        const r = retanguloDaBreadboard(placa);
        svg.append(criar("rect", { x: r.x, y: r.y, width: r.largura, height: r.altura, rx: 3, class: "area" }));
    }
}

function desenharFuros(svg: SVGElement, circuito: Circuito): void {
    for (const furo of circuito.base.listarFuros()) {
        const p = posicaoDoFuro(furo);
        svg.append(criar("rect", { x: p.x - 2, y: p.y - 2, width: 4, height: 4, class: "furo" }));
    }
}

function desenharLeds(svg: SVGElement, circuito: Circuito): void {
    for (let numero = 1; numero <= NUMERO_DE_LEDS; numero++) {
        const { vermelho, verde } = posicaoDoLed(numero);
        const estado = circuito.estadoDoLed(numero);
        const terminal = posicaoDoFuro(furoDoLed(numero, 1));

        svg.append(criar("text", { x: terminal.x - 10, y: terminal.y + 3, class: "rotulo", "text-anchor": "end" }, String(numero)));
        svg.append(criar("circle", { cx: vermelho.x, cy: vermelho.y, r: 4, class: estado === "vermelho" ? "led led-vermelho aceso" : "led led-vermelho" }));
        svg.append(criar("circle", { cx: verde.x, cy: verde.y, r: 4, class: estado === "verde" ? "led led-verde aceso" : "led led-verde" }));
    }
}

function desenharInterruptores(svg: SVGElement, circuito: Circuito, acoes: AcoesDaPlaca): void {
    for (const numero of INTERRUPTORES) {
        const centro = posicaoDoInterruptor(numero);
        const emCima = circuito.interruptores.estaEmCima(numero);

        const grupo = criar("g", { class: "interruptor" });
        grupo.append(criar("rect", { x: centro.x - 6, y: centro.y - 15, width: 12, height: 30, rx: 2, class: "interruptor-corpo" }));
        grupo.append(criar("rect", { x: centro.x - 5, y: emCima ? centro.y - 14 : centro.y + 1, width: 10, height: 13, rx: 2, class: "interruptor-alavanca" }));
        grupo.append(criar("text", { x: centro.x, y: centro.y + 28, class: "rotulo", "text-anchor": "middle" }, `S${numero}`));
        grupo.addEventListener("click", () => acoes.aoClicarInterruptor(numero));
        svg.append(grupo);
    }
}