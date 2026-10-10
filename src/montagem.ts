import { COLUNAS_POR_BREADBOARD, NUMERO_DE_BREADBOARDS } from "./BaseMontagem";
import { TODOS_OS_PINOS, type NumeroPino } from "./pinos";

const PINOS_POR_LADO = 7;
const TOTAL_DE_PINOS = 14;

// Furo onde ficaria um pino, sem verificar se o chip cabe na breadboard.
//   pinos 1 a 7  → linha F, da esquerda para a direita
//   pinos 8 a 14 → linha E, da direita para a esquerda
export function calcularFuroDoPino(placa: number, colunaPino1: number, pino: NumeroPino): string {
    if (pino <= PINOS_POR_LADO) {
        return `P${placa}:F:${colunaPino1 + pino - 1}`;
    }
    return `P${placa}:E:${colunaPino1 + TOTAL_DE_PINOS - pino}`;
}

// Furo de um pino de um chip montado a atravessar o canal central, com a marca à esquerda
export function furoDoPino(placa: number, colunaPino1: number, pino: NumeroPino): string {
    validarPosicao(placa, colunaPino1);
    return calcularFuroDoPino(placa, colunaPino1, pino);
}

// Furos de todos os pinos de um chip montado
export function furosDoChip(placa: number, colunaPino1: number): Map<NumeroPino, string> {
    const furos = new Map<NumeroPino, string>();
    for (const pino of TODOS_OS_PINOS) {
        furos.set(pino, furoDoPino(placa, colunaPino1, pino));
    }
    return furos;
}

function validarPosicao(placa: number, colunaPino1: number): void {
    if (!Number.isInteger(placa) || placa < 1 || placa > NUMERO_DE_BREADBOARDS) {
        throw new Error(`A breadboard ${placa} não existe.`);
    }
    const ultimaColuna = COLUNAS_POR_BREADBOARD - (PINOS_POR_LADO - 1);
    if (!Number.isInteger(colunaPino1) || colunaPino1 < 1 || colunaPino1 > ultimaColuna) {
        throw new Error(
            `Um chip não cabe com o pino 1 na coluna ${colunaPino1} (tem de estar entre 1 e ${ultimaColuna}).`
        );
    }
}