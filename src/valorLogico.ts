export type ValorLogico= 0 | 1 | "Z";

export function ehDefinido(valor: ValorLogico): boolean {
    return valor === 0 || valor === 1;
}