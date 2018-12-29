const {
    Tokenizer,
    Token,
    makeToken,
    everything,
    everythingUntil,
    single,

    prettyPrint,
} = require('../dist');

test('default everything should catch everything', () => {
    const gobble = Tokenizer().default(everything(makeToken('EVERYTHING')));

    const text = 'the quick brown fox';

    expect(gobble(text)).toEqual([Token(text)('EVERYTHING')(text, 0)]);
});

test('onChar should run reducers if the first char matches', () => {
    const morseCode = Tokenizer()
        .onChar({
            '.': single(makeToken('DOT')),
            '_': single(makeToken('DASH')),
        })
    ;

    const text = '._..';

    const dot = i => Token(text)('DOT')('.', i);
    const dash = i => Token(text)('DASH')('_', i);

    const expected = [
        dot(0), dash(1), dot(2), dot(3),
    ];

    expect(morseCode(text)).toEqual(expected);
});

test('everythingUntil should add characters until it reaches an invalid character', () => {
    const csv = Tokenizer()
        .onChar({
            ',': single(makeToken('COMMA')),
            '\n': single(makeToken('NEWLINE')),
        })
        .default(everythingUntil(',', '\n')(makeToken('VALUE')))
    ;

    const text = '1,Up\n2,Left\n3,Right';

    const comma = i => Token(text)('COMMA')(',', i);
    const newline = i => Token(text)('NEWLINE')('\n', i);
    const value = Token(text)('VALUE');

    const expected = [
        value('1', 0), comma(1), value('Up', 2), newline(4),
        value('2', 5), comma(6), value('Left', 7), newline(11),
        value('3', 12), comma(13), value('Right', 14),
    ];

    expect(csv(text)).toEqual(expected);
});

test('prettyPrint should format the tokens nicely for viewing', () => {
    const csv = Tokenizer()
        .onChar({
            ',': single(makeToken('COMMA')),
            '\n': single(makeToken('NEWLINE')),
        })
        .default(everythingUntil(',', '\n')(makeToken('VALUE')))
    ;

    const text = '1,Up\n2,Left\n3,Right';

    const comma = i => Token(text)('COMMA')(',', i);
    const newline = i => Token(text)('NEWLINE')('\n', i);
    const value = Token(text)('VALUE');

    expected = `[\n  <Token type='VALUE' lexeme='1' offset=0>,\n  <Token type='COMMA' lexeme=',' offset=1>,\n  <Token type='VALUE' lexeme='Up' offset=2>,\n  <Token type='NEWLINE' lexeme='\n' offset=4>,\n  <Token type='VALUE' lexeme='2' offset=5>,\n  <Token type='COMMA' lexeme=',' offset=6>,\n  <Token type='VALUE' lexeme='Left' offset=7>,\n  <Token type='NEWLINE' lexeme='\n' offset=11>,\n  <Token type='VALUE' lexeme='3' offset=12>,\n  <Token type='COMMA' lexeme=',' offset=13>,\n  <Token type='VALUE' lexeme='Right' offset=14>\n]`;

    expect(prettyPrint(csv(text))).toBe(expected);
});