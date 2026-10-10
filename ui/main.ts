import { Circuito, type ChipLogico } from "../src/circuito";
import { montarLab1 } from "../src/exemplos/lab1";
import {
    criar74LS00, criar74LS02, criar74LS04, criar74LS08, criar74LS32, criar74LS86,
} from "../src/chips/catalogo74LS";
import { descreverLocal, descreverValor } from "../src/descricao";
import { furoDoPino } from "../src/montagem";
import {
    desenharDestaqueDoNo,
    desenharPlaca,
    desenharSombraDoChip,
    type AcoesDaPlaca,
    type SombraDoChip,
} from "./desenho";
import { ICONES, type NomeIcone } from "./icons";
import type { Ponto } from "./layout";
import { adaptarVista, ampliar, deslocar, nivelDeZoom, vistaAjustada, type Vista } from "./vista";

// =============================================================
// Tipos
// =============================================================

type Modo =
    | { tipo: "usar" }
    | { tipo: "prova" }
    | { tipo: "fio"; inicio: string | undefined }
    | { tipo: "chip"; nome: string; criar: () => ChipLogico }
    | { tipo: "apagar" };

type TipoIndicacao = "info" | "sucesso" | "erro" | "aviso";

interface Indicacao {
    tipo: TipoIndicacao;
    texto: string;
}

interface ConteudoDaDica {
    titulo: string;
    linhas: string[];
}

type AlvoDaDica = { tipo: "fio"; indice: number } | { tipo: "chip"; indice: number };

// =============================================================
// Catálogo, exemplos e constantes
// =============================================================

const CATALOGO: { nome: string; porta: string; detalhe: string; icone: NomeIcone; criar: () => ChipLogico }[] = [
    { nome: "74LS00", porta: "NAND", detalhe: "4 portas de 2 entradas", icone: "nand", criar: criar74LS00 },
    { nome: "74LS02", porta: "NOR",  detalhe: "4 portas de 2 entradas", icone: "nor",  criar: criar74LS02 },
    { nome: "74LS04", porta: "NOT",  detalhe: "6 inversores",           icone: "not",  criar: criar74LS04 },
    { nome: "74LS08", porta: "AND",  detalhe: "4 portas de 2 entradas", icone: "and",  criar: criar74LS08 },
    { nome: "74LS32", porta: "OR",   detalhe: "4 portas de 2 entradas", icone: "or",   criar: criar74LS32 },
    { nome: "74LS86", porta: "XOR",  detalhe: "4 portas de 2 entradas", icone: "xor",  criar: criar74LS86 },
];

const EXEMPLOS: { nome: string; detalhe: string; carregar: () => Circuito }[] = [
    { nome: "Lab 1", detalhe: "F = A2 · A0 · A1 com um 74LS08", carregar: montarLab1 },
];

const ICONE_DA_INDICACAO: Record<TipoIndicacao, NomeIcone> = {
    info: "info",
    sucesso: "certo",
    erro: "erro",
    aviso: "aviso",
};

const LINHAS_PRINCIPAIS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);

// =============================================================
// Elementos da página
// =============================================================

function obterElemento(seletor: string): HTMLElement {
    const elemento = document.querySelector<HTMLElement>(seletor);
    if (elemento === null) {
        throw new Error(`Não encontrei o elemento "${seletor}" no index.html.`);
    }
    return elemento;
}

const lateral = obterElemento("#lateral");
const zonaIndicacao = obterElemento("#indicacao");
const zonaPlaca = obterElemento("#placa");
const zonaZoom = obterElemento("#zoom");
const dica = obterElemento("#dica");

// =============================================================
// Estado da aplicação
// =============================================================

let circuito = new Circuito();
let modo: Modo = { tipo: "usar" };
let indicacao: Indicacao = {
    tipo: "info",
    texto: "Placa vazia. Escolhe um circuito integrado ou um exemplo na barra lateral para começar.",
};

// O que está debaixo do rato
let furoSobRato: string | undefined;
let alvoDaDica: AlvoDaDica | undefined;
let posicaoDoRato: Ponto = { x: 0, y: 0 };   // em píxeis, relativa à zona da placa

// Zoom e deslocamento
let ajustada: Vista = vistaAjustada(proporcaoDaZona());
let vista: Vista = ajustada;
let espacoPremido = false;
let arrasto: { x: number; y: number } | undefined;
let houveArrasto = false;

// =============================================================
// Auxiliares
// =============================================================

function mensagemDeErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : String(erro);
}

function mudarModo(novoModo: Modo, texto: string): void {
    modo = novoModo;
    indicacao = { tipo: "info", texto };
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

// =============================================================
// Ações na placa
// =============================================================

function aoClicarFuro(furo: string): void {
    try {
        if (modo.tipo === "fio") {
            const inicio = modo.inicio;
            if (inicio === undefined) {
                modo = { tipo: "fio", inicio: furo };
                indicacao = { tipo: "info", texto: `Fio a partir de ${furo}. Clica no furo de destino (Esc cancela).` };
            } else if (inicio === furo) {
                modo = { tipo: "fio", inicio: undefined };
                indicacao = { tipo: "info", texto: "Fio cancelado." };
            } else {
                circuito.ligarFio(inicio, furo);
                modo = { tipo: "fio", inicio: undefined };
                indicacao = { tipo: "sucesso", texto: `Fio ligado entre ${inicio} e ${furo}. Clica noutro furo para o próximo fio.` };
            }
        } else if (modo.tipo === "chip") {
            const { placa, coluna } = posicaoParaChip(furo);
            circuito.montarChip(modo.criar(), placa, coluna);
            indicacao = { tipo: "sucesso", texto: `${modo.nome} montado na breadboard ${placa}, com o pino 1 na coluna ${coluna}.` };
        } else if (modo.tipo === "prova") {
            indicacao = { tipo: "info", texto: `Ponta de prova em ${descreverLocal(furo)}: ${descreverValor(circuito.valorNoFuro(furo))}.` };
        }
    } catch (erro) {
        indicacao = { tipo: "erro", texto: mensagemDeErro(erro) };
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
            alvoDaDica = undefined;
            indicacao = { tipo: "sucesso", texto: "Fio apagado." };
            atualizar();
        }
    },
    aoClicarChip: (indice) => {
        if (modo.tipo === "apagar") {
            circuito.removerChip(indice);
            alvoDaDica = undefined;
            indicacao = { tipo: "sucesso", texto: "Chip apagado." };
            atualizar();
        }
    },
    aoEntrarNoFuro: (furo) => {
        furoSobRato = furo;
        atualizarDestaque();
        atualizarDica();
    },
    aoSairDoFuro: () => {
        furoSobRato = undefined;
        atualizarDestaque();
        atualizarDica();
    },
    aoEntrarNoFio: (indice) => {
        alvoDaDica = { tipo: "fio", indice };
        atualizarDica();
    },
    aoSairDoFio: () => {
        alvoDaDica = undefined;
        atualizarDica();
    },
    aoEntrarNoChip: (indice) => {
        alvoDaDica = { tipo: "chip", indice };
        atualizarDica();
    },
    aoSairDoChip: () => {
        alvoDaDica = undefined;
        atualizarDica();
    },
};

// =============================================================
// Barra lateral
// =============================================================

function criarBotao(opcoes: {
    icone: NomeIcone;
    titulo: string;
    detalhe?: string;
    ativo?: boolean;
    aoClicar: () => void;
}): HTMLButtonElement {
    const botao = document.createElement("button");
    botao.className = opcoes.ativo === true ? "botao ativo" : "botao";
    botao.innerHTML = ICONES[opcoes.icone];

    const textos = document.createElement("span");
    textos.className = "botao-textos";

    const titulo = document.createElement("span");
    titulo.className = "botao-titulo";
    titulo.textContent = opcoes.titulo;
    textos.append(titulo);

    if (opcoes.detalhe !== undefined) {
        const detalhe = document.createElement("span");
        detalhe.className = "botao-detalhe";
        detalhe.textContent = opcoes.detalhe;
        textos.append(detalhe);
    }

    botao.append(textos);
    botao.addEventListener("click", opcoes.aoClicar);
    return botao;
}

function criarSeccao(titulo: string, botoes: HTMLElement[]): HTMLElement {
    const seccao = document.createElement("section");
    seccao.className = "seccao";
    const cabecalho = document.createElement("h2");
    cabecalho.textContent = titulo;
    seccao.append(cabecalho, ...botoes);
    return seccao;
}

function desenharLateral(): void {
    const cabecalho = document.createElement("header");
    cabecalho.className = "cabecalho";
    cabecalho.innerHTML = `<a class="voltar" href="index.html">← Início</a><h1>Simulador PB-503</h1><p>Versão beta</p>`;

    lateral.replaceChildren(
        cabecalho,
        criarSeccao("Ferramentas", [
            criarBotao({
                icone: "usar", titulo: "Usar", detalhe: "Interruptores e POWER",
                ativo: modo.tipo === "usar",
                aoClicar: () => mudarModo({ tipo: "usar" }, "Clica nos interruptores e no POWER para testar o circuito."),
            }),
            criarBotao({
                icone: "prova", titulo: "Ponta de prova", detalhe: "Mede o valor de um ponto",
                ativo: modo.tipo === "prova",
                aoClicar: () => mudarModo({ tipo: "prova" }, "Passa o rato pelos furos para ver o nó, o valor e o que está ligado."),
            }),
            criarBotao({
                icone: "fio", titulo: "Ligar fio", detalhe: "Clica em dois furos",
                ativo: modo.tipo === "fio",
                aoClicar: () => mudarModo({ tipo: "fio", inicio: undefined }, "Clica no primeiro furo do fio."),
            }),
            criarBotao({
                icone: "apagar", titulo: "Apagar", detalhe: "Clica num fio ou num chip",
                ativo: modo.tipo === "apagar",
                aoClicar: () => mudarModo({ tipo: "apagar" }, "Clica num fio ou num chip para o apagar."),
            }),
            criarBotao({
                icone: "limpar", titulo: "Limpar placa", detalhe: "Remove tudo",
                aoClicar: () => {
                    circuito = new Circuito();
                    mudarModo({ tipo: "usar" }, "Placa limpa.");
                },
            }),
        ]),
        criarSeccao(
            "Circuitos integrados",
            CATALOGO.map((item) =>
                criarBotao({
                    icone: item.icone,
                    titulo: `${item.nome} · ${item.porta}`,
                    detalhe: item.detalhe,
                    ativo: modo.tipo === "chip" && modo.nome === item.nome,
                    aoClicar: () =>
                        mudarModo(
                            { tipo: "chip", nome: item.nome, criar: item.criar },
                            `Clica na coluna onde queres o pino 1 do ${item.nome} (linhas A a J de uma breadboard).`,
                        ),
                }),
            ),
        ),
        criarSeccao(
            "Exemplos",
            EXEMPLOS.map((exemplo) =>
                criarBotao({
                    icone: "exemplo",
                    titulo: exemplo.nome,
                    detalhe: exemplo.detalhe,
                    aoClicar: () => {
                        circuito = exemplo.carregar();
                        mudarModo({ tipo: "usar" }, `${exemplo.nome} carregado. Experimenta os interruptores.`);
                    },
                }),
            ),
        ),
    );
}

// =============================================================
// Indicações
// =============================================================

function criarIndicacao(tipo: TipoIndicacao, texto: string): HTMLElement {
    const caixa = document.createElement("div");
    caixa.className = `indicacao indicacao-${tipo}`;
    caixa.innerHTML = ICONES[ICONE_DA_INDICACAO[tipo]];
    const paragrafo = document.createElement("span");
    paragrafo.textContent = texto;
    caixa.append(paragrafo);
    return caixa;
}

function desenharIndicacoes(avisos: string[]): void {
    zonaIndicacao.replaceChildren(
        criarIndicacao(indicacao.tipo, indicacao.texto),
        ...avisos.map((aviso) => criarIndicacao("aviso", aviso)),
    );
}

// =============================================================
// Camada de destaque (nó sob o rato e sombra do chip)
// =============================================================

function atualizarDestaque(): void {
    const svg = zonaPlaca.querySelector("svg");
    if (svg === null) {
        return;
    }

    if (modo.tipo === "chip") {
        desenharSombraDoChip(svg, sombraDoChip(modo.nome));
        return;
    }

    const destacar = modo.tipo === "prova" || modo.tipo === "fio";
    desenharDestaqueDoNo(svg, circuito, destacar ? furoSobRato : undefined, false);
}

// Onde ficaria o chip escolhido, se o rato estiver num furo das linhas A a J
function sombraDoChip(nome: string): SombraDoChip | undefined {
    if (furoSobRato === undefined) {
        return undefined;
    }
    try {
        const { placa, coluna } = posicaoParaChip(furoSobRato);
        return { nome, placa, coluna, avaliacao: circuito.avaliarMontagem(placa, coluna) };
    } catch {
        return undefined;   // o rato está num barramento ou num terminal: sem sombra
    }
}

// =============================================================
// Dica que segue o rato
// =============================================================

function conteudoDoFuro(furo: string): ConteudoDaDica {
    const ligacoes = circuito.ligacoesDoFuro(furo);
    const linhas = [`Valor: ${descreverValor(circuito.valorNoFuro(furo))}`];
    if (ligacoes.length === 0) {
        linhas.push("Nada ligado a este ponto.");
    } else {
        linhas.push("Ligado a:", ...ligacoes.map((ligacao) => `• ${ligacao}`));
    }
    return { titulo: descreverLocal(furo), linhas };
}

function conteudoDoFio(indice: number): ConteudoDaDica | undefined {
    const fio = circuito.listarFios()[indice];
    if (fio === undefined) {
        return undefined;
    }
    const linhas = [
        `De: ${descreverLocal(fio.de)}`,
        `Para: ${descreverLocal(fio.para)}`,
        `Valor: ${descreverValor(circuito.valorNoFuro(fio.de))}`,
    ];
    if (modo.tipo === "apagar") {
        linhas.push("Clica para apagar este fio.");
    }
    return { titulo: "Fio", linhas };
}

function conteudoDoChip(indice: number): ConteudoDaDica | undefined {
    const chip = circuito.listarChips()[indice];
    if (chip === undefined) {
        return undefined;
    }
    const item = CATALOGO.find((entrada) => entrada.nome === chip.nome);
    const vcc = circuito.valorNoFuro(furoDoPino(chip.placa, chip.colunaPino1, 14));
    const gnd = circuito.valorNoFuro(furoDoPino(chip.placa, chip.colunaPino1, 7));

    const linhas: string[] = [];
    if (item !== undefined) {
        linhas.push(item.detalhe);
    }
    linhas.push(`Pino 1 na breadboard ${chip.placa}, coluna ${chip.colunaPino1}`);

    if (!circuito.fonte.estaLigada()) {
        linhas.push("Base desligada: liga o POWER.");
    } else if (vcc === 1 && gnd === 0) {
        linhas.push("Alimentação: ligada ✓");
    } else {
        linhas.push("Sem alimentação: liga o pino 14 a +5 V e o pino 7 a 0 V.");
    }

    if (modo.tipo === "apagar") {
        linhas.push("Clica para apagar este chip.");
    }

    return { titulo: item !== undefined ? `${chip.nome} · ${item.porta}` : chip.nome, linhas };
}

// Decide o que a dica deve mostrar agora (ou nada)
function conteudoAtual(): ConteudoDaDica | undefined {
    if (alvoDaDica?.tipo === "fio") {
        return conteudoDoFio(alvoDaDica.indice);
    }
    if (alvoDaDica?.tipo === "chip") {
        return conteudoDoChip(alvoDaDica.indice);
    }
    if (modo.tipo === "prova" && furoSobRato !== undefined) {
        return conteudoDoFuro(furoSobRato);
    }
    return undefined;
}

function atualizarDica(): void {
    const conteudo = conteudoAtual();
    if (conteudo === undefined) {
        dica.hidden = true;
        return;
    }

    const titulo = document.createElement("strong");
    titulo.textContent = conteudo.titulo;
    dica.replaceChildren(
        titulo,
        ...conteudo.linhas.map((texto) => {
            const linha = document.createElement("div");
            linha.textContent = texto;
            return linha;
        }),
    );
    dica.hidden = false;
    posicionarDica();
}

// Põe a dica junto ao rato, sem a deixar sair da zona da placa
function posicionarDica(): void {
    if (dica.hidden) {
        return;
    }
    const caixa = zonaPlaca.getBoundingClientRect();
    const margem = 14;

    let x = posicaoDoRato.x + margem;
    let y = posicaoDoRato.y + margem;
    if (x + dica.offsetWidth > caixa.width) {
        x = posicaoDoRato.x - dica.offsetWidth - margem;
    }
    if (y + dica.offsetHeight > caixa.height) {
        y = posicaoDoRato.y - dica.offsetHeight - margem;
    }

    dica.style.left = `${Math.max(0, x)}px`;
    dica.style.top = `${Math.max(0, y)}px`;
}

// =============================================================
// Zoom e deslocamento
// =============================================================

function proporcaoDaZona(): number {
    const caixa = zonaPlaca.getBoundingClientRect();
    return caixa.height > 0 ? caixa.width / caixa.height : 1;
}

// Converte uma posição do rato no ecrã para coordenadas do desenho
function pontoNoDesenho(clienteX: number, clienteY: number): Ponto {
    const caixa = zonaPlaca.getBoundingClientRect();
    return {
        x: vista.x + ((clienteX - caixa.left) / caixa.width) * vista.largura,
        y: vista.y + ((clienteY - caixa.top) / caixa.height) * vista.altura,
    };
}

// Muda só o viewBox do SVG atual, sem o redesenhar
function aplicarVista(): void {
    const svg = zonaPlaca.querySelector("svg");
    svg?.setAttribute("viewBox", `${vista.x} ${vista.y} ${vista.largura} ${vista.altura}`);
    desenharControlosZoom();
}

function ampliarNoCentro(fator: number): void {
    const centro = { x: vista.x + vista.largura / 2, y: vista.y + vista.altura / 2 };
    vista = ampliar(vista, ajustada, centro, fator);
    aplicarVista();
}

function criarBotaoZoom(texto: string, titulo: string, aoClicar: () => void): HTMLButtonElement {
    const botao = document.createElement("button");
    botao.textContent = texto;
    botao.title = titulo;
    botao.addEventListener("click", aoClicar);
    return botao;
}

function desenharControlosZoom(): void {
    const percentagem = document.createElement("span");
    percentagem.textContent = `${Math.round(nivelDeZoom(vista, ajustada) * 100)}%`;

    zonaZoom.replaceChildren(
        criarBotaoZoom("−", "Afastar", () => ampliarNoCentro(1 / 1.5)),
        percentagem,
        criarBotaoZoom("+", "Aproximar", () => ampliarNoCentro(1.5)),
        criarBotaoZoom("Ajustar", "Ver a placa inteira", () => {
            vista = ajustada;
            aplicarVista();
        }),
    );
}

// =============================================================
// Ciclo principal: simula e redesenha tudo
// =============================================================

function atualizar(): void {
    const resultado = circuito.simular();

    const avisos: string[] = [];
    if (!resultado.estabilizou) {
        avisos.push("O circuito não estabiliza: há uma saída ligada de volta a uma entrada que fica a oscilar.");
    }
    for (const curto of resultado.curtos) {
        avisos.push(`Curto-circuito entre ${curto.condutores.join(" e ")}.`);
    }

    const furoSelecionado = modo.tipo === "fio" ? modo.inicio : undefined;

    desenharLateral();
    desenharIndicacoes(avisos);
    zonaPlaca.replaceChildren(desenharPlaca(circuito, acoes, vista, furoSelecionado));
    aplicarVista();
    atualizarDestaque();
    atualizarDica();
}

// =============================================================
// Eventos do teclado, do rato e da janela
// =============================================================

document.addEventListener("keydown", (evento) => {
    if (evento.code === "Space") {
        espacoPremido = true;
        evento.preventDefault();   // impede a página de deslocar
    }
    if (evento.key === "Escape" && modo.tipo === "fio" && modo.inicio !== undefined) {
        mudarModo({ tipo: "fio", inicio: undefined }, "Fio cancelado.");
    }
});

document.addEventListener("keyup", (evento) => {
    if (evento.code === "Space") {
        espacoPremido = false;
    }
});

// Roda do rato / touchpad: Ctrl (ou pinça) aproxima, sem Ctrl desloca — como no Figma
zonaPlaca.addEventListener(
    "wheel",
    (evento) => {
        evento.preventDefault();
        if (evento.ctrlKey) {
            const delta = Math.max(-50, Math.min(50, evento.deltaY));
            vista = ampliar(vista, ajustada, pontoNoDesenho(evento.clientX, evento.clientY), Math.exp(-delta * 0.01));
        } else {
            const escala = vista.largura / zonaPlaca.getBoundingClientRect().width;
            vista = deslocar(vista, ajustada, evento.deltaX * escala, evento.deltaY * escala);
        }
        aplicarVista();
    },
    { passive: false },
);

// Arrastar com o botão do meio, ou com o botão esquerdo e o Espaço premido
zonaPlaca.addEventListener("pointerdown", (evento) => {
    if (evento.button === 1 || (evento.button === 0 && espacoPremido)) {
        evento.preventDefault();
        arrasto = { x: evento.clientX, y: evento.clientY };
        houveArrasto = false;
        zonaPlaca.setPointerCapture(evento.pointerId);
        zonaPlaca.classList.add("a-arrastar");
    }
});

zonaPlaca.addEventListener("pointermove", (evento) => {
    // A dica acompanha sempre o rato
    const caixa = zonaPlaca.getBoundingClientRect();
    posicaoDoRato = { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
    posicionarDica();

    if (arrasto === undefined) {
        return;
    }
    const escala = vista.largura / caixa.width;
    vista = deslocar(vista, ajustada, (arrasto.x - evento.clientX) * escala, (arrasto.y - evento.clientY) * escala);
    arrasto = { x: evento.clientX, y: evento.clientY };
    houveArrasto = true;
    aplicarVista();
});

zonaPlaca.addEventListener("pointerup", () => {
    arrasto = undefined;
    zonaPlaca.classList.remove("a-arrastar");
});

// Depois de um arrasto, o clique que o browser gera ao largar o botão não deve chegar aos furos
zonaPlaca.addEventListener(
    "click",
    (evento) => {
        if (houveArrasto) {
            evento.stopPropagation();
            houveArrasto = false;
        }
    },
    true,
);

// Quando a zona da placa muda de tamanho (janela, avisos a aparecer…), mantém o zoom
new ResizeObserver(() => {
    const novaAjustada = vistaAjustada(proporcaoDaZona());
    vista = adaptarVista(vista, ajustada, novaAjustada);
    ajustada = novaAjustada;
    aplicarVista();
}).observe(zonaPlaca);

atualizar();