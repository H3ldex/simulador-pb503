import { ValorLogico } from "./valorLogico";

export function lerEntradaTTL(valor: ValorLogico): 0 | 1 {
    if(valor === "Z"){
        return 1;
    }
    return valor;
    } 