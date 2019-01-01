const {
    keywords, ifThen, ifChar,
    everything, everythingUntil, single, consume,
    sequence, char, untilRegexFails, whitespace
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
        expect(R(create('hello'))).toEqual(create('hello', 5, []));
        expect(R(create('hel"lo'))).toEqual(create('hel"lo', 3, []));
    });

    test('untilRegexFails should return null when 0 characters are advanced', () => {
        expect(R(create('hel"lo', 3))).toBe(null);
    });
});

test('whitespace should work', () => {
    expect(whitespace(create('   h'))).toEqual(create('   h', 3, []));
});

describe('sequence', () => {
    const R = sequence([
        char('a'),
        char(':'),
        char('b')
    ]);
    const text = 'a:b b:a';

    test('sequence should run all reducers in order', () => {
        const expected = create(text, 3, []);
        expect(R(create(text))).toEqual(expected);
    });

    test('sequence should revert to previous state if a reducer returns null', () => {
        const R2 = sequence([
            untilRegexFails(/^[a:]*$/),
            state => null, // Custom reducer function
            char('b')
        ]);
        const expected = create(text, 3, []);
        expect(R2(create(text))).toEqual(expected);
    });
});

test('everything advance past every character', () => {
    const R = everything;
    const text = 'abcdefghi';
    expect(R(create(text))).toEqual(create(text, 9, []));
    expect(R(create(text, 3))).toEqual(create(text, 9, []));
});

describe('everythingUntil', () => {
    const R = everythingUntil([' ', ',']);
    const text = 'good jo,b';

    test('everythingUntil should advance past every character until a blacklisted one is reached', () => {
        expect(R(create(text))).toEqual(create(
            text,
            4,
            []
        ));

        expect(R(create(text, 5))).toEqual(create(
            text,
            7,
            []
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

describe('consume', () => {
    const R = consume(untilRegexFails(/^[^\s]*$/))(makeToken('word'));
    const text = 'word1 word2';

    test('consume should create a token from the change in current from the reducer passed in', () => {
        expect(R(create(text))).toEqual(create(text, 5, [
            makeToken('word')('word1', 0)
        ]));
        expect(R(create(text, 6))).toEqual(create(text, 11, [
            makeToken('word')('word2', 6)
        ]));
    });

    test('consume should return null when the change is 0', () => {
        expect(R(create(text, 5))).toBe(null);
    });

    test('consume should return null when its reducer returns null', () => {
        const R2 = consume(() => null)(makeToken('word'));
        expect(R2(create(text))).toBe(null);
    });
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
    const R = ifThen(is('!'))(consume(everythingUntil([' ']))(makeToken('cmd')));

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
    const text = ',o\n';

    test('ifChar should run the reducer when matching a char', () => {
        expect(R(create(text))).toEqual(create(text, 1, [ makeToken('comma')(',', 0) ]));
        expect(R(create(text, 2))).toEqual(create(text, 3, [ makeToken('line')('\n', 2) ]));
    });

    test('ifChar should return null when it doesn\'t match a character', () => {
        expect(R(create(text, 1))).toBe(null);
    });
});