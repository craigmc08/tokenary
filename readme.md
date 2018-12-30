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

See [examples](examples) for more.

# API

## Objects

<dl>
<dt><a href="#predicate">predicate</a> : <code>object</code></dt>
<dd><p>Functions that return true or false.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#CreateToken">CreateToken(text)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a token object</p>
</dd>
<dt><a href="#makeToken">makeToken(type)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a token object</p>
</dd>
<dt><a href="#makeNothing">makeNothing(text)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a null token (ignored by Tokenizer)</p>
</dd>
<dt><a href="#Tokenary">Tokenary(text)</a> ⇒ <code><a href="#Token">Array.&lt;Token&gt;</a></code></dt>
<dd></dd>
<dt><a href="#Tokenizer">Tokenizer()</a> ⇒ <code><a href="#Tokenary">Tokenary</a></code></dt>
<dd><p>Creates a Tokenizer object</p>
</dd>
<dt><a href="#default">default(reducer)</a></dt>
<dd><p>Adds a reducer that is run whenever it is reached</p>
</dd>
<dt><a href="#if">if(predicate, reducer)</a></dt>
<dd><p>Adds a reducer that is run if <code>predicate</code> is true for the current char</p>
</dd>
<dt><a href="#keywords">keywords(keywordMap)</a> ⇒ <code><a href="#Reducer">Reducer</a></code></dt>
<dd><p>Adds a reducer that extracts keywords from the keyword map, running the token creator for each.</p>
</dd>
<dt><a href="#onChar">onChar(reducerMap)</a> ⇒ <code><a href="#Reducer">Reducer</a></code></dt>
<dd><p>Calls the reducer if the character matches a reducer in the supplied map</p>
</dd>
<dt><a href="#everything">everything(tokenCreator)</a> ⇒ <code><a href="#Reducer">Reducer</a></code></dt>
<dd><p>Creates a token for every character after the reducer is run</p>
</dd>
<dt><a href="#everythingUntil">everythingUntil(...chars)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a token for every character until a character matches one given</p>
</dd>
<dt><a href="#single">single(tokenCreator)</a> ⇒ <code><a href="#Reducer">Reducer</a></code></dt>
<dd><p>Creates a token from the single current character</p>
</dd>
<dt><a href="#sequence">sequence(...consumers)</a> ⇒ <code>function</code></dt>
<dd><p>Runs all the consumers given and creates a token from what they consume</p>
</dd>
<dt><a href="#consume">consume(consumer)</a></dt>
<dd><p>Runs a consumer and creates a token from what it consumes</p>
</dd>
<dt><a href="#char">char(char)</a> ⇒ <code>Consumer</code></dt>
<dd><p>Consumes a single specified character</p>
</dd>
<dt><a href="#regex">regex(regex)</a> ⇒ <code>Consumer</code></dt>
<dd><p>Consumes a single character that matches the supplied regex</p>
</dd>
<dt><a href="#untilRegexFails">untilRegexFails(regex)</a> ⇒ <code>Consumer</code></dt>
<dd><p>Runs the regex on increasing chunks of text until the regex fails</p>
</dd>
<dt><a href="#whitespace">whitespace()</a> ⇒ <code>Consumer</code></dt>
<dd><p>Consumes characters until non-whitespace character is found</p>
</dd>
<dt><a href="#str">str(string)</a> ⇒ <code>Consumer</code></dt>
<dd><p>Consumes and checks for a string</p>
</dd>
<dt><a href="#stringifyToken">stringifyToken(token)</a></dt>
<dd><p>Formats a single token</p>
</dd>
<dt><a href="#prettyPrint">prettyPrint(tokens)</a></dt>
<dd><p>Formats an array of tokens</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Token">Token</a></dt>
<dd></dd>
<dt><a href="#TokState">TokState</a></dt>
<dd></dd>
<dt><a href="#ReducerState">ReducerState</a></dt>
<dd></dd>
<dt><a href="#Reducer">Reducer</a> ⇒ <code><a href="#ReducerState">ReducerState</a></code></dt>
<dd></dd>
<dt><a href="#TokenCreator">TokenCreator</a> ⇒ <code>function</code></dt>
<dd></dd>
</dl>

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

<a name="CreateToken"></a>

## CreateToken(text) ⇒ <code>function</code>
Creates a token object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Full text token belongs to |

<a name="makeToken"></a>

## makeToken(type) ⇒ <code>function</code>
Creates a token object

**Kind**: global function  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="makeNothing"></a>

## makeNothing(text) ⇒ <code>function</code>
Creates a null token (ignored by Tokenizer)

**Kind**: global function  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="Tokenary"></a>

## Tokenary(text) ⇒ [<code>Array.&lt;Token&gt;</code>](#Token)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text to tokenize |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| default | <code>function</code> |  |
| if | <code>function</code> |  |
| keywords | <code>function</code> |  |
| onChar | <code>function</code> | Parses the text into tokens based on the rules given to it |

<a name="Tokenizer"></a>

## Tokenizer() ⇒ [<code>Tokenary</code>](#Tokenary)
Creates a Tokenizer object

**Kind**: global function  
<a name="Tokenizer..reducers"></a>

### Tokenizer~reducers : [<code>Array.&lt;Reducer&gt;</code>](#Reducer)
**Kind**: inner constant of [<code>Tokenizer</code>](#Tokenizer)  
<a name="default"></a>

## default(reducer)
Adds a reducer that is run whenever it is reached

**Kind**: global function  

| Param | Type |
| --- | --- |
| reducer | [<code>Reducer</code>](#Reducer) | 

<a name="if"></a>

## if(predicate, reducer)
Adds a reducer that is run if `predicate` is true for the current char

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| predicate | <code>Predicate</code> |  |
| reducer | [<code>Reducer</code>](#Reducer) | Reducer to run if `predicate` is true |

<a name="keywords"></a>

## keywords(keywordMap) ⇒ [<code>Reducer</code>](#Reducer)
Adds a reducer that extracts keywords from the keyword map, running the token creator for each.

**Kind**: global function  

| Param | Type |
| --- | --- |
| keywordMap | <code>Object.&lt;string, TokenCreator&gt;</code> | 

<a name="onChar"></a>

## onChar(reducerMap) ⇒ [<code>Reducer</code>](#Reducer)
Calls the reducer if the character matches a reducer in the supplied map

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reducerMap | <code>Object.&lt;string, Reducer&gt;</code> | character:reducer map to check |

<a name="everything"></a>

## everything(tokenCreator) ⇒ [<code>Reducer</code>](#Reducer)
Creates a token for every character after the reducer is run

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenCreator | [<code>TokenCreator</code>](#TokenCreator) | 

<a name="everythingUntil"></a>

## everythingUntil(...chars) ⇒ <code>function</code>
Creates a token for every character until a character matches one given

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ...chars | <code>string</code> | Characters to possibly match |

<a name="single"></a>

## single(tokenCreator) ⇒ [<code>Reducer</code>](#Reducer)
Creates a token from the single current character

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenCreator | [<code>TokenCreator</code>](#TokenCreator) | 

<a name="sequence"></a>

## sequence(...consumers) ⇒ <code>function</code>
Runs all the consumers given and creates a token from what they consume

**Kind**: global function  

| Param | Type |
| --- | --- |
| ...consumers | <code>Consumer</code> | 

<a name="consume"></a>

## consume(consumer)
Runs a consumer and creates a token from what it consumes

**Kind**: global function  

| Param | Type |
| --- | --- |
| consumer | <code>Consumer</code> | 

<a name="char"></a>

## char(char) ⇒ <code>Consumer</code>
Consumes a single specified character

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| char | <code>string</code> | Character to match |

<a name="regex"></a>

## regex(regex) ⇒ <code>Consumer</code>
Consumes a single character that matches the supplied regex

**Kind**: global function  

| Param | Type |
| --- | --- |
| regex | <code>RegExp</code> | 

<a name="untilRegexFails"></a>

## untilRegexFails(regex) ⇒ <code>Consumer</code>
Runs the regex on increasing chunks of text until the regex fails

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| regex | <code>RegExp</code> | Regex to test piece with |

<a name="whitespace"></a>

## whitespace() ⇒ <code>Consumer</code>
Consumes characters until non-whitespace character is found

**Kind**: global function  
<a name="str"></a>

## str(string) ⇒ <code>Consumer</code>
Consumes and checks for a string

**Kind**: global function  

| Param | Type |
| --- | --- |
| string | <code>String</code> | 

<a name="stringifyToken"></a>

## stringifyToken(token)
Formats a single token

**Kind**: global function  

| Param | Type |
| --- | --- |
| token | [<code>Token</code>](#Token) | 

<a name="prettyPrint"></a>

## prettyPrint(tokens)
Formats an array of tokens

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokens | [<code>Array.&lt;Token&gt;</code>](#Token) | 

<a name="Token"></a>

## Token
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> \| <code>Symbol</code> | Type of token |
| lexeme | <code>string</code> | The text this token encapsulates |
| offset | <code>number</code> | The index of the first character of this token in the text |
| text | <code>string</code> | The full text this token belongs to |

<a name="TokState"></a>

## TokState
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| advance | <code>function</code> | Advance the tokenizer 1 character forward |
| retreat | <code>function</code> | Moves the tokenizer 1 character back |
| look | <code>function</code> | Returns current character |
| peek | <code>function</code> | Returns next character |
| atEnd | <code>function</code> | Returns if the text is at end |
| getCurrent | <code>function</code> | Gets current index of text |
| text | <code>string</code> | The full text thats being tokenize |

<a name="ReducerState"></a>

## ReducerState
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| finished | <code>boolean</code> | If true, no further reducers are run |
| tokens | [<code>Array.&lt;Token&gt;</code>](#Token) | Tokens to append to output |

<a name="Reducer"></a>

## Reducer ⇒ [<code>ReducerState</code>](#ReducerState)
**Kind**: global typedef  
**Returns**: [<code>ReducerState</code>](#ReducerState) - Information about the reducer after it is finished  

| Param | Type | Description |
| --- | --- | --- |
| char | <code>string</code> | Current character of tokenizer |
| tokState | [<code>TokState</code>](#TokState) | Functions to use for tokenizing |

<a name="TokenCreator"></a>

## TokenCreator ⇒ <code>function</code>
**Kind**: global typedef  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

