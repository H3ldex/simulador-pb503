import { UnionFind } from "./unionFind";

// --- Geometria da PB-503 (Lab 1, figuras 2, 3 e 4) ---

export const NUMERO_DE_BREADBOARDS = 3;
export const COLUNAS_POR_BREADBOARD = 64;
export const FUROS_POR_FILA_DE_BARRAMENTO = 50;   // 10 grupos de 5

// Barra de alimentação: 4 filas, cada uma ligada de ponta a ponta
export const FILAS_ALIMENTACAO = ["+5V", "+V", "-V", "0V"];

// Área principal de cada breadboard, separada pelo canal central
const LINHAS_SUPERIORES = ["A", "B", "C", "D", "E"];
const LINHAS_INFERIORES = ["F", "G", "H", "I", "J"];

// Filas de barramento de cada breadboard: 2 em cima (S) e 2 em baixo (I),
// cada uma dividida em duas metades independentes
const FILAS_BARRAMENTO = ["S1", "S2", "I1", "I2"];

// NOVO: blocos de terminais dos interruptores S1–S8 e dos LEDs 1–8
export const NUMERO_DE_INTERRUPTORES = 8;
export const NUMERO_DE_LEDS = 8;
export const FUROS_POR_TERMINAL = 2;

// NOVO: nomes dos furos dos terminais
export function furoDoInterruptor(numero: number, furo = 1): string {
    return `INT:${numero}:${furo}`;
}

export function furoDoLed(numero: number, furo = 1): string {
    return `LED:${numero}:${furo}`;
}

// Números de inicio a fim, inclusive: intervalo(1, 3) → [1, 2, 3]
function intervalo(inicio: number, fim: number): number[] {
    const numeros: number[] = [];
    for (let n = inicio; n <= fim; n++) {
        numeros.push(n);
    }
    return numeros;
}

export class BaseMontagem {
    private readonly furos = new Set<string>();
    private readonly ligacoes = new UnionFind();

    constructor() {
        this.criarBarraAlimentacao();
        for (let placa = 1; placa <= NUMERO_DE_BREADBOARDS; placa++) {
            this.criarBreadboard(placa);
        }
        this.criarTerminais(NUMERO_DE_INTERRUPTORES, furoDoInterruptor);   // NOVO
        this.criarTerminais(NUMERO_DE_LEDS, furoDoLed);                    // NOVO
    }

    existeFuro(furo: string): boolean {
        return this.furos.has(furo);
    }

    contarFuros(): number {
        return this.furos.size;
    }

    listarFuros(): string[] {
        return [...this.furos];
    }

    // Um fio liga dois furos
    ligarFio(furoA: string, furoB: string): void {
        this.validarFuro(furoA);
        this.validarFuro(furoB);
        this.ligacoes.unir(furoA, furoB);
    }

    estaoLigados(furoA: string, furoB: string): boolean {
        this.validarFuro(furoA);
        this.validarFuro(furoB);
        return this.ligacoes.estaoLigados(furoA, furoB);
    }

    // Identificador do nó elétrico a que o furo pertence
    noDoFuro(furo: string): string {
        this.validarFuro(furo);
        return this.ligacoes.encontrar(furo);
    }

    // --- Construção da placa ---

    private criarBarraAlimentacao(): void {
        for (const fila of FILAS_ALIMENTACAO) {
            this.adicionarGrupoLigado(
                intervalo(1, FUROS_POR_FILA_DE_BARRAMENTO).map((n) => `ALIM:${fila}:${n}`)
            );
        }
    }

    private criarBreadboard(placa: number): void {
        const prefixo = `P${placa}`;

        // Cada coluna tem dois grupos de 5 furos ligados: A–E e F–J
        for (let coluna = 1; coluna <= COLUNAS_POR_BREADBOARD; coluna++) {
            this.adicionarGrupoLigado(LINHAS_SUPERIORES.map((linha) => `${prefixo}:${linha}:${coluna}`));
            this.adicionarGrupoLigado(LINHAS_INFERIORES.map((linha) => `${prefixo}:${linha}:${coluna}`));
        }

        // Cada fila de barramento tem duas metades independentes
        const metade = FUROS_POR_FILA_DE_BARRAMENTO / 2;
        for (const fila of FILAS_BARRAMENTO) {
            this.adicionarGrupoLigado(intervalo(1, metade).map((n) => `${prefixo}:${fila}:${n}`));
            this.adicionarGrupoLigado(
                intervalo(metade + 1, FUROS_POR_FILA_DE_BARRAMENTO).map((n) => `${prefixo}:${fila}:${n}`)
            );
        }
    }

    // NOVO: cada número de um bloco de terminais é um grupo de furos ligados
    private criarTerminais(quantidade: number, nomeDoFuro: (numero: number, furo: number) => string): void {
        for (let numero = 1; numero <= quantidade; numero++) {
            this.adicionarGrupoLigado(intervalo(1, FUROS_POR_TERMINAL).map((furo) => nomeDoFuro(numero, furo)));
        }
    }

    // Regista os furos e liga-os em cadeia: 1.º–2.º, 2.º–3.º, …
    private adicionarGrupoLigado(furos: string[]): void {
        let anterior: string | undefined;
        for (const furo of furos) {
            this.furos.add(furo);
            if (anterior !== undefined) {
                this.ligacoes.unir(anterior, furo);
            }
            anterior = furo;
        }
    }

    private validarFuro(furo: string): void {
        if (!this.furos.has(furo)) {
            throw new Error(`O furo "${furo}" não existe na base de montagem.`);
        }
    }
}