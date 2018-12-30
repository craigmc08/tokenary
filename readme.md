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

See [examples](examples)

## API
The whole idea of tokenary is based off the idea of "reducers", which is probably not an accurate name but it's what they are called. These functions take in the state of the tokenizer and spit out some tokens. The `Tokenizer` object manages and triggers these reducers. More complex behavior is achieved by composing reducers together. See the [reducers](#Reducers) section for what is available.


### Tokenizer
Created with a simple call to `Tokenizer()`, no `new` keyword.

The following properties of `Tokenizer` are *reducer managers*: they are the control flow for activating the reducers you choose to give them.

#### onChar
Property of a `Tokenizer` object. Call and pass in an object that is a map of character -> reducer. When a character in the text matches a character in the map, that reducer is run.

Example:
```js
Tokenizer().onChar({
    ':': single(makeToken('COLON'))
})
```
Will make a `COLON` token anytime a ':' is found (when called).

#### if
Property of a `Tokenizer` object. Call and pass in a `Predicate` and a `Reducer`. The reducer will be run when the predicate returns `true` for the current tokenizer character.

Example:
```js
Tokenizer().if(is('a'), single(makeToken('LETTER_A')))
```

#### keywords
Property of a `Tokenizer` object. Takes an object containing a map of keyword to `TokenCreator`. When a keyword is found, the specified `TokenCreator` is run.

Example:
```js
Tokenizer().keywords({ 'and': makeToken('and'), 'or': makeToken('or') });
```
*Keep in mind: the values of the map should be a `TokenCreator`, not a `Reducer` like in [onChar](#onChar)

#### default
Property of a `Tokenizer` object. Call and pass in a `Reducer`. The `default` property runs when all previous reducers fail.


### Token Creators
#### makeToken
Available at top level of `tokenary` module.

Call with a token type (a `Symbol` or a `string` preferably) and reducers can make tokens from this.

Exact documenation: `tokenType => text => (lexeme, offset) => Token`


### Reducers
All reducers are accessed via `require('tokenary').reducerName` or destructoring or whatever. Available at top level of module.

#### everything
Call with a `TokenCreator` and it will create that token for all remaining characters in the text.

#### everythingUntil
Curried function. First call will use the arguments as characters to stop gobbling the text when found. Then, call with a `TokenCreator` (like normal).

#### single
Grabs a single character. Call with a `TokenCreator`.

#### sequence
Runs all consumers passed to it in order. Runs the specified `TokenCreator` with the characters consumed.

Example:
```js
sequence(char('"'), untilRegexFails(/^[^"]$*/), char('"'))(makeToken('string'))
// Simple reducer for parsing strings like "hello world", does not support escaped quotes
```

#### consume
Runs the single consumer passed to it, then runs the specified `TokenCreator` with the characters consumed. Very similar to [sequence](#sequence)


### Consumers
Consumers are used to "eat" characters from the text. Pass these to specific reducers.
#### char
Consumes a single specified character.

#### regex
Consumes a single character that matches the specified regular expression.

#### untilRegexFails
Continues to consume characters until the whole consumed string fails to match.

#### whitespace
Consumes all whitespace characters (` `, `\n`, `\f`, `\r`, `\t`, `\v`) until it finds non-whitespace.

#### str
Consumes the specified string. Throws an error if it fails to match the string.


### Predicates
Predicates are available in `require('tokenary').predicate`

#### is
`is(truth)(actual)`

Returns true if `actual === truth`

#### isOneOf
`isOneOf(...truths)(actual)`

Returns true if `actual` matches anything in `truths`

#### matches
`matches(regex)(actual)`

Returns true if `actual` matches the regular expression.

#### not
`not(predicate)`

Negates the return value of the predicate argument.

#### or
`or(...predicates)`

Returns true if any of the predicates are true.

#### nor
`nor(...predicates)`

Shorthand for `not(or)`

#### and
`and(...predicates)`

Returns true if all of the predicates are true.

#### nand
`nand(...predicates)`

Shorthand for `not(and)`

#### xor
`xor(predicate1, predicate1)`

Returns true if only either, but not both, of the predicates is true.


### Miscellaneous
#### CreateToken
Available at top level of module `tokenary`. Slightly re-ordered version of `makeToken`.

*Note: Do **NOT** use as a `TokenCreator` in a Tokenizer. It will not behave correctly, but it will not error either.*

Exact documentation: `text => tokenTyppe => (lexeme, offset) => Token`

#### stringifyToken
Converts a Token to a nice-ish looking string
```
Token => "<Token type='TYPE' lexeme='lexeme' offset=number>"
```

#### prettyPrint
Prints an array of tokens nicely. Try it for yourself. You might be surprised (in a good or bad way).