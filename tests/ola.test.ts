import { describe, it, expect } from 'vitest';
import { somar } from '../src/ola';

describe('somar', () => {
    it('deve somar dois números positivos', () => {
        expect(somar(1, 2)).toBe(3);
    });
    it('deve somar dois números negativos', () => {
        expect(somar(-1, -2)).toBe(-3);
    });
});