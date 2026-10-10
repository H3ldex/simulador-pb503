import {
    COLUNAS_POR_BREADBOARD,
    FILAS_ALIMENTACAO,
    FUROS_POR_FILA_DE_BARRAMENTO,
    NUMERO_DE_BREADBOARDS,
} from "../src/BaseMontagem";

// Posições no desenho, em unidades do viewBox do SVG.
// Este ficheiro não usa o DOM: só faz contas, e por isso pode ser testado.

export interface Ponto {
    x: number;
    y: number;
}

export interface Retangulo {
    x: number;
    y: number;
    largura: number;
    altura: number;
}

export const PASSO = 10;    // distância entre furos vizinhos (2,54 mm na placa real)
export const LARGURA = 940;
export const ALTURA = 870;

const X_AREA = 120;                                  // início da zona das breadboards
const Y_BARRA = 40;                                  // 1.ª fila da barra de alimentação
const Y_BREADBOARDS = 130;                           // topo da 1.ª breadboard
const ALTURA_BREADBOARD = 20 * PASSO;
const ESPACO_TERMINAIS = 2 * PASSO;                  // entre terminais de LEDs e interruptores
const X_LEDS = X_AREA + (COLUNAS_POR_BREADBOARD + 5) * PASSO;
const Y_LEDS = Y_BREADBOARDS + 2 * PASSO;
const X_INTERRUPTORES = X_AREA + 2 * PASSO;
const Y_INTERRUPTORES = Y_BREADBOARDS + NUMERO_DE_BREADBOARDS * ALTURA_BREADBOARD + 3 * PASSO;

// Posição vertical de cada linha dentro de uma breadboard, em passos
const LINHAS_DA_BREADBOARD: Record<string, number> = {
    S1: 0, S2: 1,                                  // barramento de cima
    A: 3, B: 4, C: 5, D: 6, E: 7,                  // metade de cima
    F: 10, G: 11, H: 12, I: 13, J: 14,             // metade de baixo (canal entre E e F)
    I1: 16, I2: 17,                                // barramento de baixo
};

const FILAS_DE_BARRAMENTO = new Set(["S1", "S2", "I1", "I2"]);

// --- Funções auxiliares ---

// Furos de barramento: grupos de 5, com um espaço entre grupos e outro maior a meio
function xDoBarramento(numero: number): number {
    const indice = numero - 1;
    const grupo = Math.floor(indice / 5);
    const espacoDoMeio = numero > FUROS_POR_FILA_DE_BARRAMENTO / 2 ? 2 : 0;
    return X_AREA + PASSO * (indice + grupo + espacoDoMeio + 1);
}

function yDaBreadboard(placa: number): number {
    return Y_BREADBOARDS + (placa - 1) * ALTURA_BREADBOARD;
}

// --- Posição de qualquer furo, a partir do nome ("P1:C:7", "ALIM:+5V:3", "INT:2:1"…) ---

export function posicaoDoFuro(furo: string): Ponto {
    const partes = furo.split(":");
    const [peca, linha, textoNumero] = partes;
    const numero = Number(textoNumero);
    if (partes.length !== 3 || peca === undefined || linha === undefined || !Number.isInteger(numero)) {
        throw new Error(`Nome de furo inválido: "${furo}".`);
    }

    if (peca === "ALIM") {
        const indice = FILAS_ALIMENTACAO.indexOf(linha);
        if (indice === -1) {
            throw new Error(`Fila de alimentação inválida: "${furo}".`);
        }
        // Duas tiras de 2 filas, com um espaço entre elas
        return { x: xDoBarramento(numero), y: Y_BARRA + indice * PASSO + (indice >= 2 ? PASSO : 0) };
    }

    if (peca === "INT") {
        const interruptor = Number(linha);
        return { x: X_INTERRUPTORES + (interruptor - 1) * ESPACO_TERMINAIS, y: Y_INTERRUPTORES + (numero - 1) * PASSO };
    }

    if (peca === "LED") {
        const led = Number(linha);
        return { x: X_LEDS + (numero - 1) * PASSO, y: Y_LEDS + (led - 1) * ESPACO_TERMINAIS };
    }

    if (peca.startsWith("P")) {
        const placa = Number(peca.slice(1));
        const indiceDaLinha = LINHAS_DA_BREADBOARD[linha];
        if (!Number.isInteger(placa) || indiceDaLinha === undefined) {
            throw new Error(`Furo de breadboard inválido: "${furo}".`);
        }
        const x = FILAS_DE_BARRAMENTO.has(linha) ? xDoBarramento(numero) : X_AREA + numero * PASSO;
        return { x, y: yDaBreadboard(placa) + indiceDaLinha * PASSO };
    }

    throw new Error(`Peça desconhecida: "${furo}".`);
}

// --- Retângulos e posições dos componentes ---

export function retanguloDaBarra(): Retangulo {
    return { x: X_AREA, y: Y_BARRA - PASSO, largura: 63 * PASSO, altura: 6 * PASSO };
}

export function retanguloDaBreadboard(placa: number): Retangulo {
    return {
        x: X_AREA,
        y: yDaBreadboard(placa) - PASSO,
        largura: (COLUNAS_POR_BREADBOARD + 1) * PASSO,
        altura: 19 * PASSO,
    };
}

export function retanguloDoPower(): Retangulo {
    return { x: 20, y: 30, largura: 70, altura: 40 };
}

// Centro dos dois LEDs de um par (vermelho = HIGH, verde = LOW)
export function posicaoDoLed(numero: number): { vermelho: Ponto; verde: Ponto } {
    const y = Y_LEDS + (numero - 1) * ESPACO_TERMINAIS;
    return {
        vermelho: { x: X_LEDS + 5 * PASSO, y },
        verde: { x: X_LEDS + 7 * PASSO, y },
    };
}

// Centro da alavanca de um interruptor, por baixo do seu terminal
export function posicaoDoInterruptor(numero: number): Ponto {
    return {
        x: X_INTERRUPTORES + (numero - 1) * ESPACO_TERMINAIS,
        y: Y_INTERRUPTORES + 4 * PASSO,
    };
}