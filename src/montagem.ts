import { COLUNAS_POR_BREADBOARD, NUMERO_DE_BREADBOARDS } from "./baseMontagem";
import { listaDePinos, type NumeroPino } from "./pinos";

// Furo onde ficaria um pino, sem verificar se o chip cabe na breadboard.
//   metade de baixo (pino 1 até metade) → linha F, da esquerda para a direita
//   metade de cima (o resto)            → linha E, da direita para a esquerda
export function calcularFuroDoPino(
    placa: number,
    colunaPino1: number,
    pino: NumeroPino,
    totalPinos: 14 | 16 = 14,
): string {
    const pinosPorLado = totalPinos / 2;
    if (pino <= pinosPorLado) {
        return `P${placa}:F:${colunaPino1 + pino - 1}`;
    }
    return `P${placa}:E:${colunaPino1 + totalPinos - pino}`;
}

// Furo de um pino de um chip montado a atravessar o canal central, com a marca à esquerda
export function furoDoPino(placa: number, colunaPino1: number, pino: NumeroPino, totalPinos: 14 | 16 = 14): string {
    validarPosicao(placa, colunaPino1, totalPinos);
    if (pino > totalPinos) {
        throw new Error(`Um chip de ${totalPinos} pinos não tem o pino ${pino}.`);
    }
    return calcularFuroDoPino(placa, colunaPino1, pino, totalPinos);
}

// Furos de todos os pinos de um chip montado
export function furosDoChip(placa: number, colunaPino1: number, totalPinos: 14 | 16 = 14): Map<NumeroPino, string> {
    const furos = new Map<NumeroPino, string>();
    for (const pino of listaDePinos(totalPinos)) {
        furos.set(pino, furoDoPino(placa, colunaPino1, pino, totalPinos));
    }
    return furos;
}

function validarPosicao(placa: number, colunaPino1: number, totalPinos: 14 | 16): void {
    if (!Number.isInteger(placa) || placa < 1 || placa > NUMERO_DE_BREADBOARDS) {
        throw new Error(`A breadboard ${placa} não existe.`);
    }
    const ultimaColuna = COLUNAS_POR_BREADBOARD - (totalPinos / 2 - 1);
    if (!Number.isInteger(colunaPino1) || colunaPino1 < 1 || colunaPino1 > ultimaColuna) {
        throw new Error(
            `Um chip de ${totalPinos} pinos não cabe com o pino 1 na coluna ${colunaPino1} (tem de estar entre 1 e ${ultimaColuna}).`,
        );
    }
}