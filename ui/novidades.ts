// Registo de novidades do simulador, da mais recente para a mais antiga.

export interface Novidade {
    data: string;        // formato AAAA-MM-DD
    titulo: string;
    descricao: string;
}

export const NOVIDADES: readonly Novidade[] = [
    {
        data: "2026-10-14",
        titulo: "Novo chip: 74LS153",
        descricao: "Multiplexador 4:1 duplo, o primeiro chip com encapsulamento DIP-16.",
    },
    {
        data: "2026-10-10",
        titulo: "Versão beta",
        descricao: "Primeira versão pública do simulador, com os chips 74LS00, 02, 04, 08, 32 e 86.",
    },
];

// "2026-10-14" → "14 de outubro de 2026"
export function formatarData(data: string): string {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(data));
}