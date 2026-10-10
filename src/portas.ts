import { ValorLogico } from "./valorLogico";

// NOT é 1 se o valor for 0, 0 se o valor for 1 e Z se o valor for Z
export function portaNOT(a: ValorLogico): ValorLogico {
    if (a === 0) {
        return 1;
    } else if (a === 1) {
        return 0;
    } else {
        return "Z";
    }
}
// AND é 1 se ambos os valores forem 1, 0 se pelo menos um dos valores for 0 e Z se forem Z
export function portaAND(a: ValorLogico, b: ValorLogico): ValorLogico {
    if (a === 0 || b === 0) {
        return 0;
    } else if (a === 1 && b === 1) {
        return 1;
    } else {
        return "Z";
    }
}
// OR é 1 se pelo menos um dos valores for 1, 0 se ambos forem 0 e Z se forem Z
export function portaOR(a: ValorLogico, b: ValorLogico): ValorLogico {
    if (a === 0 && b === 0) {
        return 0;
    } else if (a === 1 || b === 1) {
        return 1;
    } else {
        return "Z";
    }
}
// XOR é 1 se os valores forem diferentes, 0 se forem iguais e Z se forem Z
export function portaXOR(a: ValorLogico, b: ValorLogico): ValorLogico {
    if (a === "Z" || b === "Z") {
        return "Z";
    } else if (a !== b) {
        return 1;
    } else {
        return 0;
    } 
}

// NAND é 1 se ambos os valores forem 0, 0 se pelo menos um dos valores for 1 e Z se forem Z
export function portaNAND(a: ValorLogico, b: ValorLogico): ValorLogico {
    return portaNOT(portaAND(a, b));
}

// NOR é 1 se ambos os valores forem 0, 0 se pelo menos um dos valores for 1 e Z se forem Z
export function portaNOR(a: ValorLogico, b: ValorLogico): ValorLogico {
    return portaNOT(portaOR(a, b));
}
