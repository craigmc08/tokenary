const {
    is, isOneOf, matches,
    not, or, nor, and, nand, xor
} = require('../src/predicate');

describe('Predicates', () => {
    test('is should return true for values that are the same', () => {
        expect(is('a')('a')).toBe(true);
        expect(is('a')('b')).toBe(false);

        expect(is({a: 1})({a: 1})).toBe(false); // Does not compare object structure
        const testObj = {a: 1};
        expect(is(testObj)(testObj)).toBe(true); // Does compare object reference
    });

    test('isOneOf should return true when the actual matches any truth', () => {
        const isFruit = isOneOf('apple', 'orange', 'tomato');
        const isFactorOf6 = isOneOf(1, 2, 3, 6);

        expect(isFruit('apple')).toBe(true);
        expect(isFruit('celery')).toBe(false);

        expect(isFactorOf6(3)).toBe(true);
        expect(isFactorOf6(4)).toBe(false);
    });

    test('matches should return true when the actual matches the regex', () => {
        const isNumber = matches(/^-?([1-9][0-9]*|0)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/);

        expect(isNumber('-15.3')).toBe(true);
        expect(isNumber('01')).toBe(false);
        expect(isNumber('315.96E-20')).toBe(true);
    });

    test('not should negate value of predicate', () => {
        expect(not(is('apple'))('orange')).toBe(true);
        expect(not(is('apple'))('apple')).toBe(false);
    });

    test('or should return true when any of values are true', () => {
        // starts with consonant or ends with vowel
        const matchesCriteria = or(matches(/^[^aeiou]/), matches(/[aeiou]$/));

        expect(matchesCriteria('wore')).toBe(true);
        expect(matchesCriteria('apple')).toBe(true);
        expect(matchesCriteria('toast')).toBe(true);
        expect(matchesCriteria('our')).toBe(false);
    });

    test('nor should return false when any values are true', () => {
        // starts with consonant or ends with vowel
        const matchesCriteria = nor(matches(/^[^aeiou]/), matches(/[aeiou]$/));

        expect(matchesCriteria('wore')).toBe(false);
        expect(matchesCriteria('apple')).toBe(false);
        expect(matchesCriteria('toast')).toBe(false);
        expect(matchesCriteria('our')).toBe(true);
    });

    test('and should return true when both values are true', () => {
        // starts with consonant and ends with vowel
        const matchesCriteria = and(matches(/^[^aeiou]/), matches(/[aeiou]$/));

        expect(matchesCriteria('wore')).toBe(true);
        expect(matchesCriteria('apple')).toBe(false);
        expect(matchesCriteria('toast')).toBe(false);
        expect(matchesCriteria('our')).toBe(false);
    });

    test('nand should return false when both values are true', () => {
        // starts with consonant and ends with vowel
        const matchesCriteria = nand(matches(/^[^aeiou]/), matches(/[aeiou]$/));

        expect(matchesCriteria('wore')).toBe(false);
        expect(matchesCriteria('apple')).toBe(true);
        expect(matchesCriteria('toast')).toBe(true);
        expect(matchesCriteria('our')).toBe(true);
    });

    test('xor should only return true when one value is true', () => {
        // starts with consonant and ends with vowel
        const matchesCriteria = xor(matches(/^[^aeiou]/), matches(/[aeiou]$/));

        expect(matchesCriteria('wore')).toBe(false);
        expect(matchesCriteria('apple')).toBe(true);
        expect(matchesCriteria('toast')).toBe(true);
        expect(matchesCriteria('our')).toBe(false);
    });
});