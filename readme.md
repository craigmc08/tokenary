# tokenary
Build tokenizers for javascript

### Basic Usage (CSV tokenizer)
```js
const {
    tokenary,
    reducer: { ifChar, single, makeToken, everythingUntil }
} = require('tokenary');

const TokenType = {
    comma: 'COMMA',
    value: 'VALUE',
    newline: 'NEWLINE',
};

const tokenizeCSV = tokenary([
    ifChar({
        ',': single(makeToken(TokenType.comma)),
        '\n': single(makeToken(TokenType.newline))
    }),
    consume(everythingUntil(',', '\n'))(makeToken(TokenType.value))
]);

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

See [examples](examples) for more.

# API

## Classes

<dl>
<dt><a href="#TokenError">TokenError</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#predicate">predicate</a> : <code>object</code></dt>
<dd><p>Functions that return true or false.</p>
</dd>
<dt><a href="#reducer">reducer</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#token">token</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#tokenary">tokenary(reducers)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a tokenizing function</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TokState">TokState</a> : <code>reducer.Reducer</code></dt>
<dd></dd>
<dt><a href="#TokenCreator">TokenCreator</a> : <code>tokState.TokState</code></dt>
<dd></dd>
<dt><a href="#Reducer">Reducer</a> ⇒ <code><a href="#TokState">TokState</a></code></dt>
<dd></dd>
<dt><a href="#Token">Token</a></dt>
<dd></dd>
<dt><a href="#TokenCreator">TokenCreator</a> ⇒ <code><a href="#Token">Token</a></code> | <code>undefined</code></dt>
<dd></dd>
<dt><a href="#Token">Token</a> : <code>token.Token</code></dt>
<dd></dd>
<dt><a href="#TokState">TokState</a></dt>
<dd></dd>
</dl>

<a name="TokenError"></a>

## TokenError
**Kind**: global class  
<a name="new_TokenError_new"></a>

### new TokenError(message, lexeme, offset)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The error message |
| lexeme | <code>string</code> | The lexeme this error is for |
| offset | <code>number</code> | The index of the first lexeme character in the text |

<a name="predicate"></a>

## predicate : <code>object</code>
Functions that return true or false.

**Kind**: global namespace  

* [predicate](#predicate) : <code>object</code>
    * [.is(truth)](#predicate.is) ⇒ <code>Predicate</code>
    * [.isOneOf(...truths)](#predicate.isOneOf) ⇒ <code>Predicate</code>
    * [.matches(regex)](#predicate.matches) ⇒ <code>Predicate</code>
    * [.not(predicate)](#predicate.not) ⇒ <code>Predicate</code>
    * [.or(...predicates)](#predicate.or) ⇒ <code>Predicate</code>
    * [.nor(...predicates)](#predicate.nor) ⇒ <code>Predicate</code>
    * [.and(...predicates)](#predicate.and) ⇒ <code>Predicate</code>
    * [.nand(...predicates)](#predicate.nand) ⇒ <code>Predicate</code>
    * [.xor(predicate1, predicate2)](#predicate.xor) ⇒ <code>Predicate</code>
    * [.Predicate](#predicate.Predicate) ⇒ <code>boolean</code>

<a name="predicate.is"></a>

### predicate.is(truth) ⇒ <code>Predicate</code>
Checks if actual is strict equal (===) to truth

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| truth | <code>any</code> | 

<a name="predicate.isOneOf"></a>

### predicate.isOneOf(...truths) ⇒ <code>Predicate</code>
Checks if actual is any of the values in truths

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| ...truths | <code>any</code> | 

<a name="predicate.matches"></a>

### predicate.matches(regex) ⇒ <code>Predicate</code>
Checks if actual matches the regular expression

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| regex | <code>RegExp</code> | 

<a name="predicate.not"></a>

### predicate.not(predicate) ⇒ <code>Predicate</code>
Logical not operator on a predicate

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| predicate | <code>Predicate</code> | 

<a name="predicate.or"></a>

### predicate.or(...predicates) ⇒ <code>Predicate</code>
Logical or operator on predicates

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| ...predicates | <code>Predicate</code> | 

<a name="predicate.nor"></a>

### predicate.nor(...predicates) ⇒ <code>Predicate</code>
Logical nor operator on predicates. Short for not(or(...predicates))

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| ...predicates | <code>Predicate</code> | 

<a name="predicate.and"></a>

### predicate.and(...predicates) ⇒ <code>Predicate</code>
Logical and operator on predicates

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| ...predicates | <code>Predicate</code> | 

<a name="predicate.nand"></a>

### predicate.nand(...predicates) ⇒ <code>Predicate</code>
Logical nand operator on predicates. Short for not(and(...predicates))

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| ...predicates | <code>Predicate</code> | 

<a name="predicate.xor"></a>

### predicate.xor(predicate1, predicate2) ⇒ <code>Predicate</code>
Logical xor operator on 2 predicates

**Kind**: static method of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| predicate1 | <code>Predicate</code> | 
| predicate2 | <code>Predicate</code> | 

<a name="predicate.Predicate"></a>

### predicate.Predicate ⇒ <code>boolean</code>
**Kind**: static typedef of [<code>predicate</code>](#predicate)  

| Param | Type |
| --- | --- |
| actual | <code>any</code> | 

<a name="reducer"></a>

## reducer : <code>object</code>
**Kind**: global namespace  

* [reducer](#reducer) : <code>object</code>
    * [.keywords(keywordMap, [settings])](#reducer.keywords) ⇒ [<code>Reducer</code>](#Reducer)
    * [.ifThen(predicate)](#reducer.ifThen) ⇒ <code>function</code>
    * [.ifChar(reducerMap)](#reducer.ifChar) ⇒ [<code>Reducer</code>](#Reducer)
    * [.single(tokenCreator)](#reducer.single) ⇒ [<code>Reducer</code>](#Reducer)
    * [.consume(reducer)](#reducer.consume) ⇒ <code>function</code>
    * [.sequence(reducers)](#reducer.sequence) ⇒ [<code>Reducer</code>](#Reducer)
    * [.everything()](#reducer.everything) ⇒ [<code>Reducer</code>](#Reducer)
    * [.everythingUntil(chars)](#reducer.everythingUntil) ⇒ [<code>Reducer</code>](#Reducer)
    * [.char(char)](#reducer.char) ⇒ [<code>Reducer</code>](#Reducer)
    * [.untilRegexFails(regex)](#reducer.untilRegexFails) ⇒ [<code>Reducer</code>](#Reducer)
    * [.whitespace()](#reducer.whitespace) ⇒ [<code>Reducer</code>](#Reducer)

<a name="reducer.keywords"></a>

### reducer.keywords(keywordMap, [settings]) ⇒ [<code>Reducer</code>](#Reducer)
Extracts keywords from the text

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type | Description |
| --- | --- | --- |
| keywordMap | <code>Object.&lt;string, TokenCreator&gt;</code> | Map of keywords to check for |
| [settings] | <code>object</code> |  |
| [settings.charset] | <code>RegExp</code> | Charset allowed for a keyword |
| [settings.firstChar] | <code>RegExp</code> | Charset allowed for first character of keyword |
| [settings.noMatch] | [<code>TokenCreator</code>](#TokenCreator) | Token creator to use on invalid keywords |

<a name="reducer.ifThen"></a>

### reducer.ifThen(predicate) ⇒ <code>function</code>
If the predicate is true, run the reducer

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>Predicate</code> | Condition to be met |

<a name="reducer.ifChar"></a>

### reducer.ifChar(reducerMap) ⇒ [<code>Reducer</code>](#Reducer)
If a matching character is found, runs the given reducer

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type | Description |
| --- | --- | --- |
| reducerMap | <code>Object.&lt;string, Reducer&gt;</code> | character to reducer map to check |

<a name="reducer.single"></a>

### reducer.single(tokenCreator) ⇒ [<code>Reducer</code>](#Reducer)
Creates a token from the single current character

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type |
| --- | --- |
| tokenCreator | [<code>TokenCreator</code>](#TokenCreator) | 

<a name="reducer.consume"></a>

### reducer.consume(reducer) ⇒ <code>function</code>
Creates a token from the characters passed over in the given reducerExpects the given reducers to not return any tokens

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type |
| --- | --- |
| reducer | [<code>Reducer</code>](#Reducer) | 

<a name="reducer.sequence"></a>

### reducer.sequence(reducers) ⇒ [<code>Reducer</code>](#Reducer)
Pipe output of a sequence of reducers together (left to right)

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type |
| --- | --- |
| reducers | [<code>Array.&lt;Reducer&gt;</code>](#Reducer) | 

<a name="reducer.everything"></a>

### reducer.everything() ⇒ [<code>Reducer</code>](#Reducer)
Creates a token from every character that follows

**Kind**: static method of [<code>reducer</code>](#reducer)  
<a name="reducer.everythingUntil"></a>

### reducer.everythingUntil(chars) ⇒ [<code>Reducer</code>](#Reducer)
Creates a token from every character that follows until one given is reached

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type | Description |
| --- | --- | --- |
| chars | <code>Array.&lt;string&gt;</code> | Characters to possibly match |

<a name="reducer.char"></a>

### reducer.char(char) ⇒ [<code>Reducer</code>](#Reducer)
Advances past a single character, throws an error if it's not what is expected

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type | Description |
| --- | --- | --- |
| char | <code>string</code> | Expected character |

<a name="reducer.untilRegexFails"></a>

### reducer.untilRegexFails(regex) ⇒ [<code>Reducer</code>](#Reducer)
Runs the regex until the regex fails on all characters advanced past

**Kind**: static method of [<code>reducer</code>](#reducer)  

| Param | Type |
| --- | --- |
| regex | <code>RegExp</code> | 

<a name="reducer.whitespace"></a>

### reducer.whitespace() ⇒ [<code>Reducer</code>](#Reducer)
Advances past all contiguous whitespace characters

**Kind**: static method of [<code>reducer</code>](#reducer)  
<a name="token"></a>

## token : <code>object</code>
**Kind**: global namespace  

* [token](#token) : <code>object</code>
    * [.makeToken(type)](#token.makeToken) ⇒ [<code>TokenCreator</code>](#TokenCreator)
    * [.makeNothing()](#token.makeNothing) : [<code>TokenCreator</code>](#TokenCreator)
    * [.makeError(message)](#token.makeError) ⇒ [<code>TokenCreator</code>](#TokenCreator)
    * [.stringifyToken(token)](#token.stringifyToken) ⇒ <code>string</code>
    * [.prettyPrint(tokens)](#token.prettyPrint) ⇒ <code>string</code>

<a name="token.makeToken"></a>

### token.makeToken(type) ⇒ [<code>TokenCreator</code>](#TokenCreator)
Creates a token object

**Kind**: static method of [<code>token</code>](#token)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type name of token |

<a name="token.makeNothing"></a>

### token.makeNothing() : [<code>TokenCreator</code>](#TokenCreator)
Creates nothing

**Kind**: static method of [<code>token</code>](#token)  
<a name="token.makeError"></a>

### token.makeError(message) ⇒ [<code>TokenCreator</code>](#TokenCreator)
Throws an error

**Kind**: static method of [<code>token</code>](#token)  
**Throws**:

- TokenError


| Param | Type |
| --- | --- |
| message | <code>string</code> | 

<a name="token.stringifyToken"></a>

### token.stringifyToken(token) ⇒ <code>string</code>
Formats a token for printing

**Kind**: static method of [<code>token</code>](#token)  

| Param | Type | Description |
| --- | --- | --- |
| token | [<code>Token</code>](#Token) | Token to stringify |

<a name="token.prettyPrint"></a>

### token.prettyPrint(tokens) ⇒ <code>string</code>
Formats an array of tokens for printing

**Kind**: static method of [<code>token</code>](#token)  

| Param | Type | Description |
| --- | --- | --- |
| tokens | [<code>Array.&lt;Token&gt;</code>](#Token) | Tokens to pretty print |

<a name="tokenary"></a>

## tokenary(reducers) ⇒ <code>function</code>
Creates a tokenizing function

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reducers | [<code>Array.&lt;Reducer&gt;</code>](#Reducer) | Main reducers |

<a name="TokState"></a>

## TokState : <code>reducer.Reducer</code>
**Kind**: global typedef  

* [TokState](#TokState) : <code>reducer.Reducer</code>
    * [.create(text, [current], [tokens])](#TokState.create) ⇒ [<code>TokState</code>](#TokState)
    * [.advance(state)](#TokState.advance) ⇒ [<code>TokState</code>](#TokState)

<a name="TokState.create"></a>

### TokState.create(text, [current], [tokens]) ⇒ [<code>TokState</code>](#TokState)
Creates a TokState object

**Kind**: static method of [<code>TokState</code>](#TokState)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  | The text represented by the state |
| [current] | <code>number</code> | <code>0</code> | Current offset in text |
| [tokens] | [<code>Array.&lt;Token&gt;</code>](#Token) |  | Tokens created so far |

<a name="TokState.advance"></a>

### TokState.advance(state) ⇒ [<code>TokState</code>](#TokState)
Increments TokState.current by 1 (creates new object)

**Kind**: static method of [<code>TokState</code>](#TokState)  

| Param | Type |
| --- | --- |
| state | [<code>TokState</code>](#TokState) | 

<a name="TokenCreator"></a>

## TokenCreator : <code>tokState.TokState</code>
**Kind**: global typedef  
<a name="Reducer"></a>

## Reducer ⇒ [<code>TokState</code>](#TokState)
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| state | [<code>TokState</code>](#TokState) | The state to modify |

<a name="Token"></a>

## Token
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Type of token |
| lexeme | <code>string</code> | The text this token represents |
| offset | <code>number</code> | The offset of the first character of the lexeme |

<a name="TokenCreator"></a>

## TokenCreator ⇒ [<code>Token</code>](#Token) \| <code>undefined</code>
**Kind**: global typedef  

| Param | Type |
| --- | --- |
| lexeme | <code>string</code> | 
| offset | <code>number</code> | 

<a name="Token"></a>

## Token : <code>token.Token</code>
**Kind**: global typedef  
<a name="TokState"></a>

## TokState
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text represented by the state |
| current | <code>number</code> | Current offset in text |
| tokens | [<code>Array.&lt;Token&gt;</code>](#Token) | Tokens created so far |


* [TokState](#TokState)
    * [.create(text, [current], [tokens])](#TokState.create) ⇒ [<code>TokState</code>](#TokState)
    * [.advance(state)](#TokState.advance) ⇒ [<code>TokState</code>](#TokState)

<a name="TokState.create"></a>

### TokState.create(text, [current], [tokens]) ⇒ [<code>TokState</code>](#TokState)
Creates a TokState object

**Kind**: static method of [<code>TokState</code>](#TokState)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  | The text represented by the state |
| [current] | <code>number</code> | <code>0</code> | Current offset in text |
| [tokens] | [<code>Array.&lt;Token&gt;</code>](#Token) |  | Tokens created so far |

<a name="TokState.advance"></a>

### TokState.advance(state) ⇒ [<code>TokState</code>](#TokState)
Increments TokState.current by 1 (creates new object)

**Kind**: static method of [<code>TokState</code>](#TokState)  

| Param | Type |
| --- | --- |
| state | [<code>TokState</code>](#TokState) | 

