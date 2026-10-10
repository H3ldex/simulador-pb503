import { montarLab1 } from "../src/exemplos/lab1";
import type { NumeroInterruptor } from "../src/pb503/interruptores";

const INTERRUPTORES_DO_LAB1: NumeroInterruptor[] = [1, 2, 3];

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

// Simula o circuito e volta a desenhar a página com o resultado
function desenhar(): void {
    circuito.simular();
    app.innerHTML = "";

    // Botão POWER
    const power = document.createElement("button");
    power.textContent = `POWER: ${circuito.fonte.estaLigada() ? "ligado" : "desligado"}`;
    power.addEventListener("click", () => {
        if (circuito.fonte.estaLigada()) {
            circuito.fonte.desligar();
        } else {
            circuito.fonte.ligar();
        }
        desenhar();
    });
    app.append(power);

    // Um botão por interruptor
    for (const numero of INTERRUPTORES_DO_LAB1) {
        const botao = document.createElement("button");
        const emCima = circuito.interruptores.estaEmCima(numero);
        botao.textContent = `S${numero}: ${emCima ? "cima (1)" : "baixo (0)"}`;
        botao.addEventListener("click", () => {
            circuito.interruptores.alternar(numero);
            desenhar();
        });
        app.append(botao);
    }

    // Estado do LED 1
    const led = document.createElement("p");
    led.textContent = `LED 1: ${circuito.estadoDoLed(1)}`;
    app.append(led);
}

desenhar();