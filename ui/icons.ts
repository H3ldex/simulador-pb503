// Ícones de 24 × 24, desenhados com linhas (cor = cor do texto à volta).

function icone(conteudo: string): string {
    return `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">${conteudo}</svg>`;
}

// Corpos das portas lógicas, reutilizados nas variantes
const CORPO_AND = `<path d="M6 5h5a7 7 0 0 1 0 14H6z"/>`;
const CORPO_OR = `<path d="M5 5c5 0 9 2 13 7c-4 5-8 7-13 7c2-4 2-10 0-14z"/>`;
const ENTRADAS = `<path d="M2 9h4.3M2 15h4.3"/>`;
const SAIDA = `<path d="M18 12h4"/>`;
const SAIDA_NEGADA = `<circle cx="19.5" cy="12" r="1.5"/><path d="M21 12h1.5"/>`;

export const ICONES = {
    // Ferramentas
    usar: icone(`<path d="M6 3l12 9-5 1 3 6-2 1-3-6-4 4z"/>`),
    prova: icone(`<path d="M4 20l4-4"/><path d="M8 16l-1-1 9-9 3 3-9 9z"/><path d="M17 4l3 3"/>`),
    fio: icone(`<path d="M5 18C7 6 17 6 19 18"/><circle cx="5" cy="18" r="1.5"/><circle cx="19" cy="18" r="1.5"/>`),
    apagar: icone(`<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>`),
    limpar: icone(`<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>`),
    exemplo: icone(`<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>`),
    

    // Portas lógicas
    and: icone(ENTRADAS + CORPO_AND + SAIDA),
    nand: icone(ENTRADAS + CORPO_AND + SAIDA_NEGADA),
    or: icone(ENTRADAS + CORPO_OR + SAIDA),
    nor: icone(ENTRADAS + CORPO_OR + SAIDA_NEGADA),
    xor: icone(ENTRADAS + CORPO_OR + `<path d="M3 5c2 4 2 10 0 14"/>` + SAIDA),
    not: icone(`<path d="M2 12h4M6 6l10 6-10 6z"/><circle cx="17.5" cy="12" r="1.5"/><path d="M19 12h3"/>`),

    // Indicações
    info: icone(`<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>`),
    certo: icone(`<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>`),
    erro: icone(`<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>`),
    aviso: icone(`<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>`),
};

export type NomeIcone = keyof typeof ICONES;