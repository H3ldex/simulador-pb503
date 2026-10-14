// Números dos pinos, até 16 (encapsulamentos DIP-14 e DIP-16)
export type NumeroPino =
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

// Tipo de encapsulamento: quantos pinos tem e onde fica a alimentação
export interface Encapsulamento {
    nome: string;
    totalPinos: 14 | 16;
    vcc: NumeroPino;
    gnd: NumeroPino;
}

export const DIP14: Encapsulamento = { nome: "DIP-14", totalPinos: 14, vcc: 14, gnd: 7 };
export const DIP16: Encapsulamento = { nome: "DIP-16", totalPinos: 16, vcc: 16, gnd: 8 };

// Pinos de alimentação dos chips DIP-14 (mantidos para o código que já os usa)
export const PINO_VCC: NumeroPino = DIP14.vcc;
export const PINO_GND: NumeroPino = DIP14.gnd;

const PINOS_1_A_16: readonly NumeroPino[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

// Lista dos pinos de um chip, de 1 até ao total
export function listaDePinos(totalPinos: 14 | 16): NumeroPino[] {
    return PINOS_1_A_16.slice(0, totalPinos);
}

// Todos os pinos de um DIP-14, por ordem (mantido para o código que já o usa)
export const TODOS_OS_PINOS: readonly NumeroPino[] = listaDePinos(14);