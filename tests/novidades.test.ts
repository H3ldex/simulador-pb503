import { describe, it, expect } from "vitest";

import { NOVIDADES, formatarData } from "../ui/novidades";

describe("novidades", () => {
    it("formata as datas em português de Portugal", () => {
        expect(formatarData("2026-10-14")).toBe("14 de outubro de 2026");
        expect(formatarData("2026-01-01")).toBe("1 de janeiro de 2026");
    });

    it("a lista está da mais recente para a mais antiga", () => {
        const datas = NOVIDADES.map((novidade) => novidade.data);
        expect(datas).toEqual([...datas].sort().reverse());
    });
});