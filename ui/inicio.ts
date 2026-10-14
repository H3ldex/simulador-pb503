import { NOVIDADES, formatarData, type Novidade } from "./novidades";

const VELOCIDADE = 60; // píxeis por segundo

function criarItem(novidade: Novidade): HTMLElement {
    const item = document.createElement("span");
    item.className = "faixa-item";

    const data = document.createElement("time");
    data.dateTime = novidade.data;
    data.textContent = formatarData(novidade.data);

    const titulo = document.createElement("strong");
    titulo.textContent = novidade.titulo;

    const descricao = document.createElement("span");
    descricao.textContent = novidade.descricao;

    item.append(data, titulo, descricao);
    return item;
}

// Um grupo com todas as novidades, da mais recente para a mais antiga
function criarGrupo(): HTMLElement {
    const grupo = document.createElement("div");
    grupo.className = "faixa-grupo";
    grupo.append(...NOVIDADES.map((novidade) => criarItem(novidade)));
    return grupo;
}

function montarFaixa(): void {
    const faixa = document.querySelector<HTMLElement>("#faixa-novidades");
    const janela = document.querySelector<HTMLElement>("#faixa-janela");
    const conteudo = document.querySelector<HTMLElement>("#faixa-conteudo");
    if (faixa === null || janela === null || conteudo === null || NOVIDADES.length === 0) {
        return;
    }
    faixa.hidden = false;

    // Mede um grupo para saber quantas cópias são precisas para encher a largura da faixa
    const primeiro = criarGrupo();
    conteudo.replaceChildren(primeiro);
    const larguraDoGrupo = Math.max(primeiro.offsetWidth, 1);
    const copias = Math.max(1, Math.ceil(janela.clientWidth / larguraDoGrupo));

    // Duas metades iguais: a animação desloca exatamente uma metade e recomeça sem se notar
    const grupos: HTMLElement[] = [];
    for (let i = 0; i < copias * 2; i++) {
        const grupo = criarGrupo();
        if (i > 0) {
            grupo.setAttribute("aria-hidden", "true"); // os leitores de ecrã leem as novidades só uma vez
        }
        grupos.push(grupo);
    }
    conteudo.replaceChildren(...grupos);

    // Duração proporcional ao comprimento, para a velocidade ser sempre a mesma
    conteudo.style.animationDuration = `${(larguraDoGrupo * copias) / VELOCIDADE}s`;
}

montarFaixa();
window.addEventListener("resize", montarFaixa);