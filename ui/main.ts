import { Circuito, type ChipLogico } from "../src/circuito";
import { montarLab1 } from "../src/exemplos/lab1";
import {
    criar74LS00, criar74LS02, criar74LS04, criar74LS08, criar74LS32, criar74LS86,
} from "../src/chips/catalogo74LS";
import { desenharPlaca, type AcoesDaPlaca } from "./desenho";

// --- Ferramentas ---

type Modo =
    | { tipo: "usar" }
    | { tipo: "fio"; inicio: string | undefined }
    | { tipo: "chip"; nome: string; criar: () => ChipLogico }
    | { tipo: "apagar" };

const CATALOGO: { nome: string; descricao: string; criar: () => ChipLogico }[] = [
    { nome: "74LS00", descricao: "NAND", criar: criar74LS00 },
    { nome: "74LS02", descricao: "NOR",  criar: criar74LS02 },
    { nome: "74LS04", descricao: "NOT",  criar: criar74LS04 },
    { nome: "74LS08", descricao: "AND",  criar: criar74LS08 },
    { nome: "74LS32", descricao: "OR",   criar: criar74LS32 },
    { nome: "74LS86", descricao: "XOR",  criar: criar74LS86 },
];

const LINHAS_PRINCIPAIS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);

// --- Estado da aplicação ---

function obterElemento(seletor: string): HTMLElement {
    const elemento = document.querySelector<HTMLElement>(seletor);
    if (elemento === null) {
        throw new Error(`Não encontrei o elemento "${seletor}" no index.html.`);
    }
    return elemento;
}

const app = obterElemento("#app");
let circuito = new Circuito();
let modo: Modo = { tipo: "usar" };
let mensagem = "Placa vazia. Escolhe uma ferramenta para começar.";

// --- Funções auxiliares ---

function mensagemDeErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : String(erro);
}

function mudarModo(novoModo: Modo, novaMensagem: string): void {
    modo = novoModo;
    mensagem = novaMensagem;
    atualizar();
}

// O furo clicado indica a breadboard e a coluna onde fica o pino 1
function posicaoParaChip(furo: string): { placa: number; coluna: number } {
    const [peca, linha, textoNumero] = furo.split(":");
    if (peca === undefined || !peca.startsWith("P") || linha === undefined || !LINHAS_PRINCIPAIS.has(linha)) {
        throw new Error("Para montar um chip, clica num furo das linhas A a J de uma breadboard.");
    }
    return { placa: Number(peca.slice(1)), coluna: Number(textoNumero) };
}

// --- O que acontece em cada clique ---

function aoClicarFuro(furo: string): void {
    try {
        if (modo.tipo === "fio") {
            const inicio = modo.inicio;
            if (inicio === undefined) {
                modo = { tipo: "fio", inicio: furo };
                mensagem = `Fio a partir de ${furo}: clica no furo de destino (Esc cancela).`;
            } else if (inicio === furo) {
                modo = { tipo: "fio", inicio: undefined };
                mensagem = "Fio cancelado.";
            } else {
                circuito.ligarFio(inicio, furo);
                modo = { tipo: "fio", inicio: undefined };
                mensagem = `Fio ligado: ${inicio} ↔ ${furo}. Clica noutro furo para o próximo fio.`;
            }
        } else if (modo.tipo === "chip") {
            const { placa, coluna } = posicaoParaChip(furo);
            circuito.montarChip(modo.criar(), placa, coluna);
            mensagem = `${modo.nome} montado na breadboard ${placa}, com o pino 1 na coluna ${coluna}.`;
        } else {
            // Ponta de prova
            const valor = circuito.valorNoFuro(furo);
            mensagem = `Ponta de prova em ${furo}: ${valor === "Z" ? "solto (Z)" : valor}.`;
        }
    } catch (erro) {
        mensagem = `⚠ ${mensagemDeErro(erro)}`;
    }
    atualizar();
}

const acoes: AcoesDaPlaca = {
    aoClicarPower: () => {
        if (circuito.fonte.estaLigada()) {
            circuito.fonte.desligar();
        } else {
            circuito.fonte.ligar();
        }
        atualizar();
    },
    aoClicarInterruptor: (numero) => {
        circuito.interruptores.alternar(numero);
        atualizar();
    },
    aoClicarFuro,
    aoClicarFio: (indice) => {
        if (modo.tipo === "apagar") {
            circuito.removerFio(indice);
            mensagem = "Fio apagado.";
            atualizar();
        }
    },
    aoClicarChip: (indice) => {
        if (modo.tipo === "apagar") {
            circuito.removerChip(indice);
            mensagem = "Chip apagado.";
            atualizar();
        }
    },
};

// --- Desenho da página ---

function criarBotao(texto: string, ativo: boolean, aoClicar: () => void): HTMLButtonElement {
    const botao = document.createElement("button");
    botao.textContent = texto;
    if (ativo) {
        botao.classList.add("ativo");
    }
    botao.addEventListener("click", aoClicar);
    return botao;
}

function desenharFerramentas(): HTMLElement {
    const barra = document.createElement("div");
    barra.className = "ferramentas";

    barra.append(
        criarBotao("Usar / ponta de prova", modo.tipo === "usar", () =>
            mudarModo({ tipo: "usar" }, "Clica nos interruptores, no POWER, ou num furo para ver o seu valor.")),
        criarBotao("Ligar fio", modo.tipo === "fio", () =>
            mudarModo({ tipo: "fio", inicio: undefined }, "Clica no primeiro furo do fio.")),
        ...CATALOGO.map((item) =>
            criarBotao(`${item.nome} (${item.descricao})`, modo.tipo === "chip" && modo.nome === item.nome, () =>
                mudarModo(
                    { tipo: "chip", nome: item.nome, criar: item.criar },
                    `Clica na coluna onde queres o pino 1 do ${item.nome} (linhas A a J).`,
                ))),
        criarBotao("Apagar", modo.tipo === "apagar", () =>
            mudarModo({ tipo: "apagar" }, "Clica num fio ou num chip para o apagar.")),
        criarBotao("Limpar placa", false, () => {
            circuito = new Circuito();
            mudarModo({ tipo: "usar" }, "Placa limpa.");
        }),
        criarBotao("Exemplo: Lab 1", false, () => {
            circuito = montarLab1();
            mudarModo({ tipo: "usar" }, "Lab 1 carregado: experimenta os interruptores S1, S2 e S3.");
        }),
    );
    return barra;
}

function criarParagrafo(classe: string, texto: string): HTMLParagraphElement {
    const paragrafo = document.createElement("p");
    paragrafo.className = classe;
    paragrafo.textContent = texto;
    return paragrafo;
}

function atualizar(): void {
    const resultado = circuito.simular();

    const avisos: string[] = [];
    if (!resultado.estabilizou) {
        avisos.push("⚠ O circuito não estabiliza: há uma ligação de uma saída de volta a uma entrada que oscila.");
    }
    for (const curto of resultado.curtos) {
        avisos.push(`⚠ Curto-circuito entre ${curto.condutores.join(" e ")}.`);
    }

    const furoSelecionado = modo.tipo === "fio" ? modo.inicio : undefined;

    app.replaceChildren(
        desenharFerramentas(),
        criarParagrafo("mensagem", mensagem),
        ...avisos.map((aviso) => criarParagrafo("aviso", aviso)),
        desenharPlaca(circuito, acoes, furoSelecionado),
    );
}

// Esc cancela um fio a meio
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modo.tipo === "fio" && modo.inicio !== undefined) {
        mudarModo({ tipo: "fio", inicio: undefined }, "Fio cancelado.");
    }
});

atualizar();