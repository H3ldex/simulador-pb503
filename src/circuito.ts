import { BaseMontagem, furoDoInterruptor, furoDoLed } from "./BaseMontagem";
import { calcularFuroDoPino, furosDoChip } from "./montagem";
import { TODOS_OS_PINOS, type NumeroPino } from "./pinos";
import type { ValorLogico } from "./valorLogico";
import type { EstadoPinos } from "./chips/comum";
import { FonteAlimentacao, type FilaAlimentacao } from "./pb503/fonte";
import { InterruptoresLogicos, type NumeroInterruptor } from "./pb503/interruptores";
import { IndicadoresLogicos, type EstadoLed } from "./pb503/indicadores";

// Qualquer objeto com nome e calcularSaidas serve como chip (tipagem estrutural)
export interface ChipLogico {
    readonly nome: string;
    calcularSaidas(pinos: EstadoPinos): EstadoPinos;
}

// Dois ou mais condutores a forçar valores diferentes no mesmo nó
export interface Curto {
    no: string;
    condutores: string[];
}

export interface ResultadoSimulacao {
    estabilizou: boolean;
    iteracoes: number;
    curtos: Curto[];
}

// Um fio entre dois furos
export interface Fio {
    de: string;
    para: string;
}

// O que a interface precisa de saber sobre um chip montado
export interface InfoChip {
    nome: string;
    placa: number;
    colunaPino1: number;
}

// Um condutor a tentar forçar um valor num nó
interface Contribuicao {
    no: string;
    valor: ValorLogico;
    origem: string;
}

interface ChipMontado {
    chip: ChipLogico;
    placa: number;
    colunaPino1: number;
    furos: Map<NumeroPino, string>;
}

// Resultado de perguntar "posso montar um chip aqui?"
export interface AvaliacaoDeMontagem {
    valida: boolean;
    motivo: string;
    furos: { furo: string; livre: boolean }[];   // só os pinos que caem dentro da breadboard
}

const MAXIMO_DE_ITERACOES = 100;
const FILAS: FilaAlimentacao[] = ["+5V", "+V", "-V", "0V"];
const INTERRUPTORES: NumeroInterruptor[] = [1, 2, 3, 4, 5, 6, 7, 8];

export class Circuito {
    private montagem = new BaseMontagem();

    get base(): BaseMontagem {
        return this.montagem;
    }
    readonly fonte = new FonteAlimentacao();
    readonly interruptores = new InterruptoresLogicos(this.fonte);
    readonly indicadores = new IndicadoresLogicos(this.fonte);

    private readonly chips: ChipMontado[] = [];
    private readonly furosOcupados = new Set<string>();
    private valores = new Map<string, ValorLogico>();
    private readonly fios: Fio[] = [];

    // --- Montagem ---

    montarChip(chip: ChipLogico, placa: number, colunaPino1: number): void {
        const furos = furosDoChip(placa, colunaPino1);
        for (const furo of furos.values()) {
            if (this.furosOcupados.has(furo)) {
                throw new Error(`O furo "${furo}" já está ocupado por outro chip.`);
            }
        }
        for (const furo of furos.values()) {
            this.furosOcupados.add(furo);
        }
        this.chips.push({ chip, placa, colunaPino1, furos });
    }

        // Diz se é possível montar um chip nesta posição, sem o montar
        avaliarMontagem(placa: number, colunaPino1: number): AvaliacaoDeMontagem {
            const furos: { furo: string; livre: boolean }[] = [];
            let todosExistem = true;
            let algumOcupado = false;
    
            for (const pino of TODOS_OS_PINOS) {
                const furo = calcularFuroDoPino(placa, colunaPino1, pino);
                if (!this.base.existeFuro(furo)) {
                    todosExistem = false;
                    continue;
                }
                const livre = !this.furosOcupados.has(furo);
                if (!livre) {
                    algumOcupado = true;
                }
                furos.push({ furo, livre });
            }
    
            if (!todosExistem) {
                return { valida: false, motivo: "O chip não cabe aqui: sai da breadboard.", furos };
            }
            if (algumOcupado) {
                return { valida: false, motivo: "Há furos ocupados por outro chip.", furos };
            }
            return { valida: true, motivo: "", furos };
        }

    ligarFio(furoA: string, furoB: string): void {
        this.base.ligarFio(furoA, furoB);
        this.fios.push({ de: furoA, para: furoB });
    }

    listarFios(): Fio[] {
        return [...this.fios];
    }

    listarChips(): InfoChip[] {
        return this.chips.map((montado) => ({
            nome: montado.chip.nome,
            placa: montado.placa,
            colunaPino1: montado.colunaPino1,
        }));
    }

    removerFio(indice: number): void {
        if (indice < 0 || indice >= this.fios.length) {
            throw new Error(`Não existe o fio número ${indice}.`);
        }
        this.fios.splice(indice, 1);
        this.reconstruirLigacoes();
    }

    removerChip(indice: number): void {
        const montado = this.chips[indice];
        if (montado === undefined) {
            throw new Error(`Não existe o chip número ${indice}.`);
        }
        for (const furo of montado.furos.values()) {
            this.furosOcupados.delete(furo);
        }
        this.chips.splice(indice, 1);
    }

    // O union-find não sabe desfazer ligações: recomeça com uma base nova
    // e volta a ligar os fios que restam
    private reconstruirLigacoes(): void {
        this.montagem = new BaseMontagem();
        for (const fio of this.fios) {
            this.montagem.ligarFio(fio.de, fio.para);
        }
        this.valores = new Map();
    }

    // --- Simulação ---

    simular(): ResultadoSimulacao {
        let valores = new Map<string, ValorLogico>();
        let curtos: Curto[] = [];

        for (let iteracao = 1; iteracao <= MAXIMO_DE_ITERACOES; iteracao++) {
            const resultado = this.resolver(this.recolherContribuicoes(valores));
            curtos = resultado.curtos;

            if (mapasIguais(resultado.valores, valores)) {
                this.valores = resultado.valores;
                return { estabilizou: true, iteracoes: iteracao, curtos };
            }
            valores = resultado.valores;
        }

        this.valores = valores;
        return { estabilizou: false, iteracoes: MAXIMO_DE_ITERACOES, curtos };
    }


    // --- Leitura dos resultados (depois de simular) ---

    valorNoFuro(furo: string): ValorLogico {
        return this.valores.get(this.base.noDoFuro(furo)) ?? "Z";
    }

    estadoDoLed(numero: number): EstadoLed {
        return this.indicadores.estadoDoLed(this.valorNoFuro(furoDoLed(numero)));
    }

    // --- Passos internos ---

    // O que cada condutor quer pôr em cada nó, dados os valores atuais
    private recolherContribuicoes(valores: Map<string, ValorLogico>): Contribuicao[] {
        const contribuicoes: Contribuicao[] = [];

        // Barra de alimentação
        for (const fila of FILAS) {
            contribuicoes.push({
                no: this.base.noDoFuro(`ALIM:${fila}:1`),
                valor: this.fonte.valorDaFila(fila),
                origem: `fila ${fila}`,
            });
        }

        // Interruptores S1 a S8
        for (const numero of INTERRUPTORES) {
            contribuicoes.push({
                no: this.base.noDoFuro(furoDoInterruptor(numero)),
                valor: this.interruptores.valorDoInterruptor(numero),
                origem: `S${numero}`,
            });
        }

        // Saídas dos chips, calculadas a partir dos valores atuais dos nós
        for (const montado of this.chips) {
            const pinos: EstadoPinos = new Map();
            for (const [pino, furo] of montado.furos) {
                pinos.set(pino, valores.get(this.base.noDoFuro(furo)) ?? "Z");
            }

            const saidas = montado.chip.calcularSaidas(pinos);
            for (const [pino, valor] of saidas) {
                const furo = montado.furos.get(pino);
                if (furo !== undefined) {
                    contribuicoes.push({
                        no: this.base.noDoFuro(furo),
                        valor,
                        origem: `${montado.chip.nome} (pino ${pino})`,
                    });
                }
            }
        }

        return contribuicoes;
    }

    // Decide o valor de cada nó e encontra os curtos-circuitos
    private resolver(contribuicoes: Contribuicao[]): { valores: Map<string, ValorLogico>; curtos: Curto[] } {
        // Agrupa as contribuições por nó, ignorando as que não forçam nada (Z)
        const porNo = new Map<string, Contribuicao[]>();
        for (const contribuicao of contribuicoes) {
            if (contribuicao.valor === "Z") {
                continue;
            }
            const lista = porNo.get(contribuicao.no) ?? [];
            lista.push(contribuicao);
            porNo.set(contribuicao.no, lista);
        }

        const valores = new Map<string, ValorLogico>();
        const curtos: Curto[] = [];

        for (const [no, lista] of porNo) {
            const alguemForca0 = lista.some((c) => c.valor === 0);
            const alguemForca1 = lista.some((c) => c.valor === 1);

            if (alguemForca0 && alguemForca1) {
                curtos.push({ no, condutores: lista.map((c) => c.origem) });
                valores.set(no, "Z");
            } else {
                valores.set(no, alguemForca1 ? 1 : 0);
            }
        }

        return { valores, curtos };
    }
}

function mapasIguais(a: Map<string, ValorLogico>, b: Map<string, ValorLogico>): boolean {
    if (a.size !== b.size) {
        return false;
    }
    for (const [chave, valor] of a) {
        if (b.get(chave) !== valor) {
            return false;
        }
    }
    return true;
}