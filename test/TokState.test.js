const {
    create, advance, addToken,
    atEnd, peek, segment, segmentFrom    
} = require('../src/TokState');
const { makeToken } = require('../src/Token');

describe('create', () => {
    test('create should create a state with text', () => {
        expect(create('hello world')).toEqual({
            text: 'hello world',
            current: 0,
            tokens: [],
        });
    });

    test('create should create states with non-default current and tokens', () => {
        expect(create('hello world', 5)).toEqual({
            text: 'hello world',
            current: 5,
            tokens: [],
        });

        expect(create('hello world', 5, [makeToken('word')('hello', 0)])).toEqual({
            text: 'hello world',
            current: 5,
            tokens: [ makeToken('word')('hello', 0) ]
        });
    });
});

describe('advance', () => {
    const original = create('hello world');
    test('advance should increment current by 1', () => {
        expect(advance(original)).toEqual({
            text: original.text,
            current: 1,
            tokens: []
        });
    });
});

describe('addToken', () => {
    const original = create('hello world', 5);
    test('addToken should add a token', () => {
        expect(addToken(original, makeToken('word')('hello', 0))).toEqual({
            text: 'hello world',
            current: 5,
            tokens: [ makeToken('word')('hello', 0) ]
        });
    });
});

describe('atEnd', () => {
    test('atEnd should return true when at the end', () => {
        expect(atEnd(create('hello', 5))).toBe(true);
        expect(atEnd(create('hello', 7))).toBe(true);
        expect(atEnd(create('good bye', 8))).toBe(true);
    });

    test('atEnd should return false when not at end', () => {
        expect(atEnd(create('hello', 3))).toBe(false);
        expect(atEnd(create('hello', 4))).toBe(false);
        expect(atEnd(create('good bye', 4))).toBe(false);
    });
});

describe('peek', () => {
    test('peek should return the next character in the state', () => {
        expect(peek(create('hello', 3))).toBe('l');
        expect(peek(create('good bye', 4))).toBe(' ');
    });
});

describe('segment', () => {
    test('segment should act like substring', () => {
        const text = 'hello world';
        const state = create(text);
        expect(segment(state, 0, 6)).toBe(text.substring(0, 6));
        expect(segment(state, 7, 12)).toBe(text.substring(7, 12));
    });
});

describe('segmentFrom', () => {
    test('segmentFrom should go from start to the current in state', () => {
        const text = 'hello world';
        expect(segmentFrom(create(text, 6), 0)).toBe(text.substring(0, 6));
        expect(segmentFrom(create(text, 12), 7)).toBe(text.substring(7, 12));
    });
});