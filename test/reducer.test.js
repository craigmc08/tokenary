const {
    keywords, ifThen, ifChar,
    everything, everythingUntil, single, consume, sequence,
    char, untilRegexFails, whitespace
} = require('../src/reducer');
const { makeToken } = require('../src/Token');
const { create, advance } = require('../src/TokState');
const { is } = require('../src/predicate');

describe('char', () => {
    const state = create('hello');
    test('char should advance past specified character', () => {
        expect(char('h')(state)).toEqual(advance(state));
    });
    test('char should throw an error if the character isn\'t right', () => {
        expect(() => char('e')(state)).toThrow();
    });
});

describe('untilRegexFails', () => {
    const R = untilRegexFails(/^[^"]*$/);
    test('untilRegexFails should work correctly', () => {
        expect(R(create('hello'))).toEqual(create('hello', 6, []));
        expect(R(create('hel"lo'))).toEqual(create('hel"lo', 3, []));
    });
});

test('whitespace should work', () => {
    expect(whitespace(create('   h'))).toEqual(create('   h', 3, []));
});

test('everything should make a token from everything', () => {
    const R = everything(makeToken('e'));
    const text = 'abcdefghi';
    expect(R(create(text))).toEqual(create(text, 10, [ makeToken('e')('abcdefghi', 0) ]));
    expect(R(create(text, 3))).toEqual(create(text, 10, [ makeToken('e')('defghi', 3) ]));
});

describe('everythingUntil', () => {
    const R = everythingUntil([' ', ','])(makeToken('e'));
    const text = 'good jo,b';

    test('everythingUntil should work right', () => {
        expect(R(create(text))).toEqual(create(
            text,
            4,
            [ makeToken('e')('good', 0) ]
        ));

        expect(R(create(text, 5))).toEqual(create(
            text,
            7,
            [ makeToken('e')('jo', 5) ]
        ));
    });
    
    test('everythingUntil should return null if the token is 0 characters', () => {
        expect(R(create(text, 4))).toBe(null);
    });
});

test('single should make a token from a single character', () => {
    const R = single(makeToken('char'));
    const text = 'oof';
    
    expect(R(create(text))).toEqual(create(text, 1, [ makeToken('char')('o', 0) ]));
    expect(R(create(text, 2))).toEqual(create(text, 3, [ makeToken('char')('f', 2) ]));
});

describe('keywords', () => {
    const R = keywords({
        'and': makeToken('and'),
        'or': makeToken('or')
    });
    const R2 = keywords({
        'and': makeToken('and'),
        'or': makeToken('or')
    }, {
        noMatch: makeToken('id')
    });

    test('keywords should extract a keyword from state', () => {
        expect(R(create('and or'))).toEqual(create('and or', 3, [ makeToken('and')('and', 0) ]));
        expect(R(create('andnt'))).toBe(null); // It doesn't want to change state
        
        expect(R(create('and or', 4))).toEqual(create('and or', 6, [ makeToken('or')('or', 4 )]));
        expect(R(create('and or', 3))).toBe(null);
    });

    test('keywords noMatch should be run when a keyword isn\'t found', () => {
        expect(R2(create('not and'))).toEqual(create('not and', 3, [ makeToken('id')('not', 0) ]));
        expect(R2(create('not and', 4))).toEqual(create('not and', 7, [ makeToken('and')('and', 4) ]));
    });
});

describe('ifThen', () => {
    const R = ifThen(is('!'))(everythingUntil([' '])(makeToken('cmd')));

    test('ifThen should run reducer is predicate is true', () => {
        const expected = create('!add list', 4, [ makeToken('cmd')('!add', 0) ]);

        expect(R(create('!add list'))).toEqual(expected);
    });

    test('ifThen should return null if predicate is false', () => {
        expect(R(create('add list'))).toBe(null);
    });
});

describe('ifChar', () => {
    const R = ifChar({
        ',': single(makeToken('comma')),
        '\n': single(makeToken('line'))
    });
});