# tokenary
Build tokenizers for javascript

### Basic Usage (CSV tokenizer)
```js
const { Tokenizer, char, makeToken, single, everythingUntil, prettyPrint } = require('tokenary');

const TokenType = {
    comma: 'COMMA',
    value: 'VALUE',
    newline: 'NEWLINE',
};

const tokenizeCSV = Tokenizer()
    .onChar({
        ',': single(makeToken(TokenType.comma)),
        '\n': single(makeToken(TokenType.newline)),
    })
    .default(
        everythingUntil(',', '\n')(makeToken(TokenType.value))
    ),
;

const testCSV = 
`1,Up
2,Left
3,Right`;

const tokens = tokenizeCSV(testCSV);
console.log(prettyPrint(tokens));
/* prints:
[
    <Token type='VALUE' lexeme='1' offset=0>,
    <Token type='COMMA' lexeme=',' offset=1>,
    <Token type='VALUE' lexeme='Up' offset=2>,
    <Token type='NEWLINE' lexeme='\n' offset=4>,
    <Token type='VALUE' lexeme='2' offset=5>,
    <Token type='COMMA' lexeme=',' offset=6>,
    <Token type='VALUE' lexeme='Left' offset=7>,
    <Token type='NEWLINE' lexeme='\n' offset=11>,
    <Token type='VALUE' lexeme='3' offset=12>,
    <Token type='COMMA' lexeme=',' offset=13>,
    <Token type='VALUE' lexeme='Right' offset=14>
]
*/
```