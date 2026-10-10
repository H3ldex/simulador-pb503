import { ALTURA, LARGURA, type Ponto } from "./layout";

// A parte do desenho que está visível (corresponde ao viewBox do SVG)
export interface Vista {
    x: number;
    y: number;
    largura: number;
    altura: number;
}

const ZOOM_MAXIMO = 6;   // até 6× mais perto do que a vista ajustada

function entre(valor: number, minimo: number, maximo: number): number {
    return Math.min(Math.max(valor, minimo), maximo);
}

// Mostra a placa inteira, centrada, com a mesma forma (proporção) do ecrã
export function vistaAjustada(proporcaoDoEcra: number): Vista {
    const proporcaoDaPlaca = LARGURA / ALTURA;
    if (proporcaoDoEcra > proporcaoDaPlaca) {
        // Ecrã mais largo do que a placa: sobra espaço dos lados
        const largura = ALTURA * proporcaoDoEcra;
        return { x: (LARGURA - largura) / 2, y: 0, largura, altura: ALTURA };
    }
    // Ecrã mais alto do que a placa: sobra espaço em cima e em baixo
    const altura = LARGURA / proporcaoDoEcra;
    return { x: 0, y: (ALTURA - altura) / 2, largura: LARGURA, altura };
}

// Quantas vezes mais perto do que a vista ajustada (1 = placa inteira)
export function nivelDeZoom(vista: Vista, ajustada: Vista): number {
    return ajustada.largura / vista.largura;
}

// Mantém a vista dentro da área da vista ajustada
function limitar(vista: Vista, ajustada: Vista): Vista {
    return {
        ...vista,
        x: entre(vista.x, ajustada.x, ajustada.x + ajustada.largura - vista.largura),
        y: entre(vista.y, ajustada.y, ajustada.y + ajustada.altura - vista.altura),
    };
}

// Aproxima (fator > 1) ou afasta (fator < 1), mantendo o ponto indicado no mesmo sítio do ecrã
export function ampliar(vista: Vista, ajustada: Vista, ponto: Ponto, fator: number): Vista {
    const larguraMinima = ajustada.largura / ZOOM_MAXIMO;
    const largura = entre(vista.largura / fator, larguraMinima, ajustada.largura);
    const proporcao = largura / vista.largura;
    return limitar(
        {
            x: ponto.x - (ponto.x - vista.x) * proporcao,
            y: ponto.y - (ponto.y - vista.y) * proporcao,
            largura,
            altura: vista.altura * proporcao,
        },
        ajustada,
    );
}

// Desloca a vista (em unidades do desenho)
export function deslocar(vista: Vista, ajustada: Vista, dx: number, dy: number): Vista {
    return limitar({ ...vista, x: vista.x + dx, y: vista.y + dy }, ajustada);
}

// Quando a zona da placa muda de tamanho: mantém o zoom e o centro, com a nova forma
export function adaptarVista(vista: Vista, ajustadaAntiga: Vista, ajustadaNova: Vista): Vista {
    const zoom = nivelDeZoom(vista, ajustadaAntiga);
    const centro = { x: vista.x + vista.largura / 2, y: vista.y + vista.altura / 2 };
    const largura = ajustadaNova.largura / zoom;
    const altura = ajustadaNova.altura / zoom;
    // Deslocar 0 só serve para aplicar os limites
    return deslocar({ x: centro.x - largura / 2, y: centro.y - altura / 2, largura, altura }, ajustadaNova, 0, 0);
}