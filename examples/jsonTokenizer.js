const {
    Tokenizer,

    Token,
    makeToken,

    single,
    sequence,
    consume,

    char,
    untilRegexFails,
    str,

    prettyPrint
} = require('../dist/index');

const Type = {
    curlyLeft: 'CURLY_LEFT',
    curlyRight: 'CURLY_RIGHT',
    squareLeft: 'SQUARE_LEFT',
    squareRight: 'SQUARE_RIGHT',
    comma: 'COMMA',
    colon: 'COLON',
    string: 'STRING',
    number: 'NUMBER',
    boolean: 'BOOLEAN',
    nullVal: 'NULL',
};

const text = `{
    "name": "Fred Francis",
    "age": 17,
    "hasLicense": false,
    "licenseNumber": null,
    "friends": [
        "Sally Salamander",
        "Jeffrey Jenkins",
        "Maddie Madison"
    ]
}`;

const numberConsumer = state => {
    // Follows JSON number specification
    if (state.peek() !== '-' && !/\d/.test(state.peek())) return;

    const start = state.getCurrent();
    if (state.peek() === '-') state.advance();
    
    if (/[1-9]/.test(state.peek())) {
        state.advance(); // consume first digit
        while (/\d/.test(state.peek())) state.advance();
    } else if (state.peek() === '0') state.advance();

    if (state.peek() === '.') {
        state.advance(); // consume '.'
        if (!/\d/.test(state.peek())) {
            throw new Error('Failed to tokenize number, expected digit after \'.\'');
        }
        state.advance();
        while (/\d/.test(state.peek())) state.advance();
    }

    if (['e', 'E'].includes(state.peek())) {
        state.advance(); // consume 'e' or 'E'
        if (['+', '-'].includes(state.peek())) state.advance();

        if (!/\d/.test(state.peek())) {
            throw new Error('Failed to tokenize number, expected digit after \'/[eE][+-]?/\'');
        }
        while (/\d/.test(state.peek())) state.advance();
    }

    return;
}

const jsonTokenizer = Tokenizer()
    .onChar({
        '{': single(makeToken(Type.curlyLeft)),
        '}': single(makeToken(Type.curlyRight)),
        '[': single(makeToken(Type.squareLeft)),
        ']': single(makeToken(Type.squareRight)),
        ',': single(makeToken(Type.comma)),
        ':': single(makeToken(Type.colon)),
        '"': sequence(
            char('"'),
            untilRegexFails(/^(\\"|[^"\n])*$/),
            char('"'),
        )(makeToken(Type.string)),
        'f': consume(str('false'))(makeToken(Type.boolean)),
        't': consume(str('true'))(makeToken(Type.boolean)),
        'n': consume(str('null'))(makeToken(Type.nullVal)),
    })
    .default(consume(numberConsumer)(makeToken(Type.number)))
;

console.log('-------------- JSON text ---------------');
console.log(text);
console.log('------------ Tokens parsed -------------');
const parseStart = Date.now();
console.log(prettyPrint(jsonTokenizer(text)));
const parseEnd = Date.now();
console.log(`Time taken: ${parseEnd - parseStart}ms`)