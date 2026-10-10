import { montarLab1 } from "../src/exemplos/lab1";
import { desenharPlaca } from "./desenho";

// Vai buscar um elemento à página, ou falha com uma mensagem clara
function obterElemento(seletor: string): HTMLElement {
    const elemento = document.querySelector<HTMLElement>(seletor);
    if (elemento === null) {
        throw new Error(`Não encontrei o elemento "${seletor}" no index.html.`);
    }
    return elemento;
}

const app = obterElemento("#app");
const circuito = montarLab1();

// Simula e volta a desenhar a placa com o estado atual
function atualizar(): void {
    circuito.simular();
    app.replaceChildren(
        desenharPlaca(circuito, {
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
        })
    );
}

atualizar();