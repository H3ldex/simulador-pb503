import { portaAND, portaNAND, portaNOR, portaNOT, portaOR, portaXOR } from "../portas";
import { ChipDuasEntradas, type PortaDuasEntradas } from "./chipDuasEntradas";
import { ChipUmaEntrada, type PortaUmaEntrada } from "./chipUmaEntrada";

// Pinagem comum aos 74LS00, 74LS08, 74LS32 e 74LS86
const PINAGEM_QUADRUPLA_PADRAO: readonly PortaDuasEntradas[] = [
    { entradaA: 1,  entradaB: 2,  saida: 3 },
    { entradaA: 4,  entradaB: 5,  saida: 6 },
    { entradaA: 9,  entradaB: 10, saida: 8 },
    { entradaA: 12, entradaB: 13, saida: 11 },
];

// 74LS02: em cada porta, a saída vem ANTES das entradas
const PINAGEM_74LS02: readonly PortaDuasEntradas[] = [
    { entradaA: 2,  entradaB: 3,  saida: 1 },
    { entradaA: 5,  entradaB: 6,  saida: 4 },
    { entradaA: 8,  entradaB: 9,  saida: 10 },
    { entradaA: 11, entradaB: 12, saida: 13 },
];

// 74LS04: seis inversores
const PINAGEM_74LS04: readonly PortaUmaEntrada[] = [
    { entrada: 1,  saida: 2 },
    { entrada: 3,  saida: 4 },
    { entrada: 5,  saida: 6 },
    { entrada: 9,  saida: 8 },
    { entrada: 11, saida: 10 },
    { entrada: 13, saida: 12 },
];

export function criar74LS00(): ChipDuasEntradas {
    return new ChipDuasEntradas("74LS00", PINAGEM_QUADRUPLA_PADRAO, portaNAND);
}

export function criar74LS02(): ChipDuasEntradas {
    return new ChipDuasEntradas("74LS02", PINAGEM_74LS02, portaNOR);
}

export function criar74LS04(): ChipUmaEntrada {
    return new ChipUmaEntrada("74LS04", PINAGEM_74LS04, portaNOT);
}

export function criar74LS08(): ChipDuasEntradas {
    return new ChipDuasEntradas("74LS08", PINAGEM_QUADRUPLA_PADRAO, portaAND);
}

export function criar74LS32(): ChipDuasEntradas {
    return new ChipDuasEntradas("74LS32", PINAGEM_QUADRUPLA_PADRAO, portaOR);
}

export function criar74LS86(): ChipDuasEntradas {
    return new ChipDuasEntradas("74LS86", PINAGEM_QUADRUPLA_PADRAO, portaXOR);
}