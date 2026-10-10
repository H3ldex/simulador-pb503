import type { ValorLogico } from "./valorLogico";

const FILAS: Record<string, string> = {
    "+5V": "fila +5 V",
    "+V": "fila +V (variável, não usar)",
    "-V": "fila −V (variável, não usar)",
    "0V": "fila 0 V (massa)",
};

const BARRAMENTOS: Record<string, string> = {
    S1: "1.º barramento de cima",
    S2: "2.º barramento de cima",
    I1: "1.º barramento de baixo",
    I2: "2.º barramento de baixo",
};

// Onde fica um furo, em palavras ("P1:C:7" → "Breadboard 1, coluna 7, linha C")
export function descreverLocal(furo: string): string {
    const [peca, linha, numero] = furo.split(":");
    if (peca === undefined || linha === undefined || numero === undefined) {
        return furo;
    }
    if (peca === "ALIM") {
        return `Barra de alimentação, ${FILAS[linha] ?? `fila ${linha}`}`;
    }
    if (peca === "INT") {
        return `Terminal do interruptor S${linha}`;
    }
    if (peca === "LED") {
        return `Terminal do LED ${linha}`;
    }
    if (peca.startsWith("P")) {
        const placa = peca.slice(1);
        const barramento = BARRAMENTOS[linha];
        if (barramento !== undefined) {
            return `Breadboard ${placa}, ${barramento}`;
        }
        return `Breadboard ${placa}, coluna ${numero}, linha ${linha}`;
    }
    return furo;
}

// Um valor lógico, em palavras
export function descreverValor(valor: ValorLogico): string {
    if (valor === 1) {
        return "1 (HIGH, +5 V)";
    }
    if (valor === 0) {
        return "0 (LOW, 0 V)";
    }
    return "sem valor (solto)";
}