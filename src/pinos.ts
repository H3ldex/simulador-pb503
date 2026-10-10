export type NumeroPino = 
| 1 | 2 | 3 | 4 | 5 | 6 | 7  // Lado de baixo do chip
| 8 | 9 | 10 | 11 | 12 | 13 | 14 ; // Lado de cima do chip

export const PINO_VCC: NumeroPino = 14; // Pino de alimentação
export const PINO_GND: NumeroPino = 7; // Pino de massa

// Todos os pinos de um DIP-14, por ordem
export const TODOS_OS_PINOS: readonly NumeroPino[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];