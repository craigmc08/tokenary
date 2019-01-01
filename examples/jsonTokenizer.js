const {
    tokenary,
    reducer: { single, ifChar, ifThen, keywords, char, untilRegexFails, sequence, consume },
    predicate: { or, is, matches, isOneOf },
    token: { makeToken, makeError, prettyPrint },
} = require('../src');

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

const isNumber = or(is('-'), matches(/[0-9]/));
const consumeNumber = sequence([
    ifThen(is('-'))(char('-')),
    ifThen(matches(/[0-9]/))(untilRegexFails(/^\d*$/)),
    ifThen(is('0'))(char('0')),
    ifThen(is('.'))(sequence([
        char('.'),
        untilRegexFails(/^\d*$/)
    ])),
    ifThen(isOneOf('e', 'E'))(sequence([
        ifChar({ e: char('e'), E: char('E') }),
        ifThen(isOneOf('+', '-'))(ifChar({ '+': char('+'), '-': char('-') })),
        untilRegexFails(/^\d*$/)
    ]))
]);

const tokenizeJSON = tokenary([
    ifChar({
        '{': single(makeToken(Type.curlyLeft)),
        '}': single(makeToken(Type.curlyRight)),
        '[': single(makeToken(Type.squareLeft)),
        ']': single(makeToken(Type.squareRight)),
        ',': single(makeToken(Type.comma)),
        ':': single(makeToken(Type.colon)),
        '"': consume(sequence([
            char('"'),
            untilRegexFails(/^(\\"|[^"\n])*$/),
            char('"'),
        ]))(makeToken(Type.string)),
    }),
    ifThen(isNumber)(consume(consumeNumber)(makeToken(Type.number))),
    keywords({
        'true': makeToken(Type.boolean),
        'false': makeToken(Type.boolean),
        'null': makeToken(Type.nullVal)
    }, {
        noMatch: makeError('Invalid keyword')
    })
]);

console.log('-------------- JSON text ---------------');
console.log(text);
console.log('------------ Tokens parsed -------------');
const parseStart = Date.now();
console.log(prettyPrint(tokenizeJSON(text)));
const parseEnd = Date.now();
console.log(`Time taken: ${parseEnd - parseStart}ms`)