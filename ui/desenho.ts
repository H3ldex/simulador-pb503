import type { AvaliacaoDeMontagem, Circuito, Fio } from "../src/circuito";
import { FILAS_ALIMENTACAO, NUMERO_DE_BREADBOARDS, NUMERO_DE_LEDS, furoDoLed } from "../src/BaseMontagem";
import { furoDoPino } from "../src/montagem";
import { TODOS_OS_PINOS } from "../src/pinos";
import type { NumeroInterruptor } from "../src/pb503/interruptores";
import {
    ALTURA,
    LARGURA,
    posicaoDoFuro,
    posicaoDoInterruptor,
    posicaoDoLed,
    retanguloDaBarra,
    retanguloDaBreadboard,
    retanguloDoChip,
    retanguloDoPower,
    type Ponto,
} from "./layout";
import type { Vista } from "./vista";

const SVG_NS = "http://www.w3.org/2000/svg";
const INTERRUPTORES: NumeroInterruptor[] = [1, 2, 3, 4, 5, 6, 7, 8];

// O que a placa faz quando se clica nela (quem decide é o main.ts)
export interface AcoesDaPlaca {
    aoClicarPower(): void;
    aoClicarInterruptor(numero: NumeroInterruptor): void;
    aoClicarFuro(furo: string): void;
    aoClicarFio(indice: number): void;
    aoClicarChip(indice: number): void;
    aoEntrarNoFuro(furo: string): void;
    aoSairDoFuro(): void;
}

// O que é preciso para desenhar a sombra de um chip
export interface SombraDoChip {
    nome: string;
    placa: number;
    coluna: number;
    avaliacao: AvaliacaoDeMontagem;
}

// --- Auxiliares ---

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

// Esvazia a camada de destaque e devolve-a (ou null, se não existir)
function obterCamadaLimpa(svg: SVGElement): Element | null {
    const camada = svg.querySelector(".camada-destaque");
    camada?.replaceChildren();
    return camada;
}

// Pequena etiqueta de texto junto a um ponto
function criarEtiqueta(p: Ponto, texto: string, classe = "etiqueta-no"): SVGElement {
    const etiqueta = criar("g", { class: classe });
    etiqueta.append(criar("rect", { x: p.x + 6, y: p.y - 18, width: texto.length * 3.9 + 8, height: 12, rx: 3 }));
    etiqueta.append(criar("text", { x: p.x + 10, y: p.y - 9.5 }, texto));
    return etiqueta;
}

// --- Placa ---

export function desenharPlaca(circuito: Circuito, acoes: AcoesDaPlaca, vista: Vista, furoSelecionado?: string): SVGElement {
    const svg = criar("svg", { viewBox: `${vista.x} ${vista.y} ${vista.largura} ${vista.altura}`, class: "placa" });
    svg.append(criar("rect", { x: 0, y: 0, width: LARGURA, height: ALTURA, rx: 12, class: "fundo" }));

    desenharPower(svg, circuito, acoes);
    desenharAreas(svg);
    desenharFuros(svg, circuito, acoes, furoSelecionado);
    desenharChips(svg, circuito, acoes);
    desenharFios(svg, circuito, acoes);
    desenharLeds(svg, circuito);
    desenharInterruptores(svg, circuito, acoes);

    // Camada de destaque: fica por cima de tudo e é redesenhada à parte
    svg.append(criar("g", { class: "camada-destaque" }));

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

function desenharFuros(svg: SVGElement, circuito: Circuito, acoes: AcoesDaPlaca, furoSelecionado?: string): void {
    for (const furo of circuito.base.listarFuros()) {
        const p = posicaoDoFuro(furo);
        const classe = furo === furoSelecionado ? "furo selecionado" : "furo";
        const quadrado = criar("rect", { x: p.x - 3, y: p.y - 3, width: 6, height: 6, class: classe });
        quadrado.addEventListener("click", () => acoes.aoClicarFuro(furo));
        quadrado.addEventListener("mouseenter", () => acoes.aoEntrarNoFuro(furo));
        quadrado.addEventListener("mouseleave", () => acoes.aoSairDoFuro());
        svg.append(quadrado);
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

function desenharChips(svg: SVGElement, circuito: Circuito, acoes: AcoesDaPlaca): void {
    circuito.listarChips().forEach((chip, indice) => {
        const r = retanguloDoChip(chip.placa, chip.colunaPino1);
        const grupo = criar("g", { class: "chip" });
        grupo.addEventListener("click", () => acoes.aoClicarChip(indice));
        grupo.append(criar("title", {}, `${chip.nome}: pino 1 na breadboard ${chip.placa}, coluna ${chip.colunaPino1}`));

        // Pernas: do furo de cada pino até ao corpo
        for (const pino of TODOS_OS_PINOS) {
            const p = posicaoDoFuro(furoDoPino(chip.placa, chip.colunaPino1, pino));
            const yDoCorpo = pino <= 7 ? r.y + r.altura : r.y;
            grupo.append(criar("line", { x1: p.x, y1: p.y, x2: p.x, y2: yDoCorpo, class: "chip-perna" }));
        }

        // Corpo, marca do lado esquerdo e nome
        grupo.append(criar("rect", { x: r.x, y: r.y, width: r.largura, height: r.altura, rx: 1.5, class: "chip-corpo" }));
        grupo.append(criar("circle", { cx: r.x, cy: r.y + r.altura / 2, r: 3, class: "chip-marca" }));
        grupo.append(criar("text", { x: r.x + r.largura / 2, y: r.y + r.altura / 2 + 2, class: "chip-nome" }, chip.nome));

        svg.append(grupo);
    });
}

// Cores dos fios de sinal; os de alimentação têm cores fixas, como no laboratório
const CORES_DOS_FIOS = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#fdd835", "#6d4c41"];

function corDoFio(fio: Fio, indice: number): string {
    const pontas = [fio.de, fio.para];
    if (pontas.some((furo) => furo.startsWith("ALIM:+5V"))) {
        return "#d32f2f";   // vermelho: +5 V
    }
    if (pontas.some((furo) => furo.startsWith("ALIM:0V"))) {
        return "#212121";   // preto: massa
    }
    return CORES_DOS_FIOS[indice % CORES_DOS_FIOS.length] ?? "#1e88e5";
}

function desenharFios(svg: SVGElement, circuito: Circuito, acoes: AcoesDaPlaca): void {
    circuito.listarFios().forEach((fio, indice) => {
        const a = posicaoDoFuro(fio.de);
        const b = posicaoDoFuro(fio.para);

        // Curva suave: o ponto de controlo fica acima do meio do fio
        const distancia = Math.hypot(b.x - a.x, b.y - a.y);
        const controlo = {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2 - Math.min(distancia * 0.25, 60),
        };
        const cor = corDoFio(fio, indice);

        const grupo = criar("g", { class: "fio" });
        grupo.addEventListener("click", () => acoes.aoClicarFio(indice));
        grupo.append(criar("title", {}, `${fio.de} ↔ ${fio.para}`));
        grupo.append(criar("path", {
            d: `M ${a.x} ${a.y} Q ${controlo.x} ${controlo.y} ${b.x} ${b.y}`,
            stroke: cor,
            class: "fio-linha",
        }));
        for (const ponta of [a, b]) {
            grupo.append(criar("circle", { cx: ponta.x, cy: ponta.y, r: 2.2, fill: cor }));
        }
        svg.append(grupo);
    });
}

// --- Camada de destaque ---

// Destaca todos os furos do mesmo nó que o furo indicado (ou limpa o destaque)
export function desenharDestaqueDoNo(
    svg: SVGElement,
    circuito: Circuito,
    furo: string | undefined,
    mostrarEtiqueta: boolean,
): void {
    const camada = obterCamadaLimpa(svg);
    if (camada === null || furo === undefined) {
        return;
    }

    const furos = circuito.base.furosDoMesmoNo(furo);
    const valor = circuito.valorNoFuro(furo);
    const classeDoValor = valor === "Z" ? "valor-z" : `valor-${valor}`;

    for (const outro of furos) {
        const p = posicaoDoFuro(outro);
        camada.append(criar("rect", {
            x: p.x - 4, y: p.y - 4, width: 8, height: 8, rx: 1.5,
            class: `destaque-no ${classeDoValor}`,
        }));
    }

    if (!mostrarEtiqueta) {
        return;
    }
    const quantidade = furos.length === 1 ? "furo isolado" : `${furos.length} furos ligados`;
    camada.append(criarEtiqueta(posicaoDoFuro(furo), `${quantidade} · ${valor === "Z" ? "solto" : `valor ${valor}`}`));
}

// Desenha a sombra do chip escolhido e os furos onde os pinos encaixariam (ou limpa)
export function desenharSombraDoChip(svg: SVGElement, sombra: SombraDoChip | undefined): void {
    const camada = obterCamadaLimpa(svg);
    if (camada === null || sombra === undefined) {
        return;
    }
    const { avaliacao } = sombra;

    // Corpo fantasma: só quando os 14 pinos caem dentro da breadboard
    if (avaliacao.furos.length === 14) {
        const r = retanguloDoChip(sombra.placa, sombra.coluna);
        camada.append(criar("rect", {
            x: r.x, y: r.y, width: r.largura, height: r.altura, rx: 1.5,
            class: avaliacao.valida ? "sombra-corpo valida" : "sombra-corpo invalida",
        }));
        camada.append(criar("text", { x: r.x + r.largura / 2, y: r.y + r.altura / 2 + 2, class: "sombra-nome" }, sombra.nome));
    }

    // Furos dos pinos: verdes se livres, vermelhos se ocupados
    for (const { furo, livre } of avaliacao.furos) {
        const p = posicaoDoFuro(furo);
        camada.append(criar("rect", {
            x: p.x - 4, y: p.y - 4, width: 8, height: 8, rx: 1.5,
            class: livre ? "sombra-furo livre" : "sombra-furo ocupado",
        }));
    }

    // Motivo, junto ao primeiro pino que cabe
    const primeiro = avaliacao.furos[0];
    if (!avaliacao.valida && primeiro !== undefined) {
        camada.append(criarEtiqueta(posicaoDoFuro(primeiro.furo), avaliacao.motivo, "etiqueta-no etiqueta-erro"));
    }
}