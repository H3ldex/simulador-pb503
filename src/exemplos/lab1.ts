import { Circuito } from "../circuito";
import { furoDoInterruptor, furoDoLed } from "../BaseMontagem";
import { furoDoPino } from "../montagem";
import { criar74LS08 } from "../chips/catalogo74LS";
import type { NumeroPino } from "../pinos";

// Montagem do Lab 1 (figuras 8 e 9): F = A2 · A0 · A1
//   S1 → pino 1 (A2), S3 → pino 2 (A0), pino 3 → pino 10, S2 → pino 9 (A1), pino 8 → LED 1 (F)
export function montarLab1({ alimentarChip = true, ligarS3 = true } = {}): Circuito {
    const circuito = new Circuito();
    circuito.montarChip(criar74LS08(), 1, 10);
    const pino = (n: NumeroPino): string => furoDoPino(1, 10, n);

    if (alimentarChip) {
        circuito.ligarFio(pino(14), "ALIM:+5V:1");
        circuito.ligarFio(pino(7), "ALIM:0V:1");
    }
    circuito.ligarFio(furoDoInterruptor(1), pino(1));
    if (ligarS3) {
        circuito.ligarFio(furoDoInterruptor(3), pino(2));
    }
    circuito.ligarFio(pino(3), pino(10));
    circuito.ligarFio(furoDoInterruptor(2), pino(9));
    circuito.ligarFio(pino(8), furoDoLed(1));

    circuito.fonte.ligar();
    return circuito;
}