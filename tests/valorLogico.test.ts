import { describe, it, expect } from 'vitest';
import { ehDefinido } from '../src/valorLogico';

describe('ehDefinido', () => {
    it('deve retornar true se o valor for 0', () => {
        expect(ehDefinido(0)).toBe(true);
    });
    it('deve retornar true se o valor for 1', () => {
        expect(ehDefinido(1)).toBe(true);
    });
    it('deve retornar false se o valor for "Z"', () => {
        expect(ehDefinido("Z")).toBe(false);
    });
});
