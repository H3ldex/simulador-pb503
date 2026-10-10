import { ValorLogico } from "./valorLogico";

export function portaNOT(a: ValorLogico): ValorLogico {
    if (a === 0) {
        return 1;
    } else if (a === 1) {
        return 0;
    } else {
        return "Z";
    }
}
export function portaAND(a: ValorLogico, b: ValorLogico): ValorLogico {
    if (a === 0 || b === 0) {
        return 0;
    } else if (a === 1 && b === 1) {
        return 1;
    } else {
        return "Z";
    }
}
export function portaOR(a: ValorLogico, b: ValorLogico): ValorLogico {
    if (a === 0 && b === 0) {
        return 0;
    } else if (a === 1 || b === 1) {
        return 1;
    } else {
        return "Z";
    }
}