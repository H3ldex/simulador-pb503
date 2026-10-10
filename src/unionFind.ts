// Union-find: organiza elementos em grupos disjuntos.
// Cada grupo tem um chefe (representante); dois elementos estão ligados
// se e só se tiverem o mesmo chefe.
export class UnionFind {
    // Para cada elemento, o seu "pai". Um elemento sem entrada no Map é um chefe.
    private readonly pai = new Map<string, string>();

    // Find: segue os pais até chegar ao chefe do grupo
    encontrar(x: string): string {
        let atual = x;
        let proximo = this.pai.get(atual);
        while (proximo !== undefined) {
            atual = proximo;
            proximo = this.pai.get(atual);
        }
        return atual;
    }

    // Union: junta o grupo de a com o grupo de b
    unir(a: string, b: string): void {
        const chefeA = this.encontrar(a);
        const chefeB = this.encontrar(b);
        if (chefeA === chefeB) {
            return; // já estão no mesmo grupo
        }
        this.pai.set(chefeA, chefeB);
    }

    estaoLigados(a: string, b: string): boolean {
        return this.encontrar(a) === this.encontrar(b);
    }
}