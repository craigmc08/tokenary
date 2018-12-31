const {
    Tokenizer,
    TokenError,

    CreateToken,
    makeToken,
    makeNothing,

    everything,
    everythingUntil,
    single,
    sequence,
    consume,

    char,
    regex,
    untilRegexFails,
    whitespace,
    str,

    prettyPrint,

    predicate,
} = require('../src');

const { matches, not } = predicate;

describe('Controllers', () => {
    test('default everything should catch everything', () => {
        const gobble = Tokenizer().default(everything(makeToken('EVERYTHING')));

        const text = 'the quick brown fox';

        expect(gobble(text)).toEqual([CreateToken(text)('EVERYTHING')(text, 0)]);
    });

    test('onChar should run reducers if the first char matches', () => {
        const morseCode = Tokenizer()
            .onChar({
                '.': single(makeToken('DOT')),
                '_': single(makeToken('DASH')),
            })
        ;

        const text = '._..';

        const dot = i => CreateToken(text)('DOT')('.', i);
        const dash = i => CreateToken(text)('DASH')('_', i);

        const expected = [
            dot(0), dash(1), dot(2), dot(3),
        ];

        expect(morseCode(text)).toEqual(expected);
    });

    test('if should run the given reducer if the predicate is true', () => {
        const isVowel = matches(/[aeiou]/);
        const isConsonant = not(isVowel);

        const wordCategorizer = Tokenizer()
            .if(isVowel, everythingUntil(' ')(makeToken('vowelWord')))
            .if(isConsonant, everythingUntil(' ')(makeToken('consonantWord')))
        ;

        const text = 'horse apple fly ill';

        const vWord = CreateToken(text)('vowelWord');
        const cWord = CreateToken(text)('consonantWord');

        expected = [ cWord('horse', 0), vWord('apple', 6), cWord('fly', 12), vWord('ill', 16) ];

        expect(wordCategorizer(text)).toEqual(expected);
    });

    test('keywords should find the listed keywords', () => {
        const keywordExtractor = Tokenizer()
            .keywords({
                'and': makeToken('and'),
                'or': makeToken('or'),
                'not': makeToken('not'),
            })
            .default(everythingUntil(' ')(makeToken('text')))
        ;

        const text = 'horses and not butterflies or beesnot';

        const makeAnd = o => CreateToken(text)('and')('and', o);
        const makeOr = o => CreateToken(text)('or')('or', o);
        const makeNot = o => CreateToken(text)('not')('not', o);
        const makeText = CreateToken(text)('text');

        const expected = [
            makeText('horses', 0), makeAnd(7), makeNot(11),
            makeText('butterflies', 15), makeOr(27), makeText('beesnot', 30),
        ];

        expect(keywordExtractor(text)).toEqual(expected);
    });

    test('catch should catch errors thrown anywhere in tokenizer', () => {
        const faultyConsumer = state => {
            const start = state.getCurrent();
            state.advance();
            if (state.peek() !== ':') {
                state.advance();
                const lexeme = state.text.substring(start, state.getCurrent());
                throw new TokenError(`Expected ':', got '${state.peek()}'`, lexeme, start, state.text);
            }
            state.advance();
        }

        const tokenizer = Tokenizer()
            .onChar({
                ':': consume(faultyConsumer)(makeToken('cc')),
            })
            .catch(makeToken('error'))
        ;

        const text = ':::,,,::';
        const expected = [
            CreateToken(text)('cc')('::', 0),
            Object.assign(CreateToken(text)('error')(':,', 2), { message: `Expected ':', got ','` }),
            CreateToken(text)('cc')('::', 6),
        ];

        expect(tokenizer(text)).toEqual(expected);
    });
});

describe('Reducers', () => {
    test('everythingUntil should add characters until it reaches an invalid character', () => {
        const csv = Tokenizer()
            .onChar({
                ',': single(makeToken('COMMA')),
                '\n': single(makeToken('NEWLINE')),
            })
            .default(everythingUntil(',', '\n')(makeToken('VALUE')))
        ;

        const text = '1,Up\n2,Left\n3,Right';

        const comma = i => CreateToken(text)('COMMA')(',', i);
        const newline = i => CreateToken(text)('NEWLINE')('\n', i);
        const value = CreateToken(text)('VALUE');

        const expected = [
            value('1', 0), comma(1), value('Up', 2), newline(4),
            value('2', 5), comma(6), value('Left', 7), newline(11),
            value('3', 12), comma(13), value('Right', 14),
        ];

        expect(csv(text)).toEqual(expected);
    });

    test('sequence should consume sequences of consumers', () => {
        const stringTokenizer = Tokenizer()
            .onChar({
                '"': sequence(
                    char('"'),
                    untilRegexFails(/^(\\"|[^\n"])*$/),
                    char('"'),
                )(makeToken('STRING')),
            })
        ;

        const text = '"this is a string" these won\'t show up. "another string"';

        const expected = [
            CreateToken(text)('STRING')('"this is a string"', 0),
            CreateToken(text)('STRING')('"another string"', 40),
        ];

        expect(stringTokenizer(text)).toEqual(expected);
    });

    test('consume should consume characters from one consumer and create a token', () => {
        const consumeTest = Tokenizer()
            .default(consume(whitespace())(makeToken('WHITESPACE')))
        ;

        const text = '    \nepic\t   ';

        const expected = [
            CreateToken(text)('WHITESPACE')('    \n', 0),
            CreateToken(text)('WHITESPACE')('\t   ', 9),
        ];

        expect(consumeTest(text)).toEqual(expected);
    });
});

describe('Miscellaneous functions', () => {
    test('prettyPrint should format the tokens nicely for viewing', () => {
        const csv = Tokenizer()
            .onChar({
                ',': single(makeToken('COMMA')),
                '\n': single(makeToken('NEWLINE')),
            })
            .default(everythingUntil(',', '\n')(makeToken('VALUE')))
        ;

        const text = '1,Up\n2,Left\n3,Right';

        const comma = i => CreateToken(text)('COMMA')(',', i);
        const newline = i => CreateToken(text)('NEWLINE')('\n', i);
        const value = CreateToken(text)('VALUE');

        expected = `[\n  <Token type='VALUE' lexeme='1' offset=0>,\n  <Token type='COMMA' lexeme=',' offset=1>,\n  <Token type='VALUE' lexeme='Up' offset=2>,\n  <Token type='NEWLINE' lexeme='\n' offset=4>,\n  <Token type='VALUE' lexeme='2' offset=5>,\n  <Token type='COMMA' lexeme=',' offset=6>,\n  <Token type='VALUE' lexeme='Left' offset=7>,\n  <Token type='NEWLINE' lexeme='\n' offset=11>,\n  <Token type='VALUE' lexeme='3' offset=12>,\n  <Token type='COMMA' lexeme=',' offset=13>,\n  <Token type='VALUE' lexeme='Right' offset=14>\n]`;

        expect(prettyPrint(csv(text))).toBe(expected);
    });
});