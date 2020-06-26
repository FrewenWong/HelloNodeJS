const cheerio = require('cheerio');
var $ = cheerio.load('<h2 class="title">Hello world</h2>');

$('h2.title').text('Hello there!');
$('h2').addClass('welcome');

console.debug($.html());


console.debug("==========cheerio  API=======");

$ = cheerio.load('<ul id="fruits"> <li class="apple">Apple</li> <li class="orange">Orange</li> <li class="pear">Pear</li> </ul>');


console.debug($('.apple', '#fruits').text())


console.debug($('ul .pear').attr('class'));
//=> pear


console.debug($('li[class=orange]').html());
//=> Orange

// 属性
// 获取和修改属性的方法。
// 获取和设置属性的方法。在匹配集合中只能获取的第一个元素的属性值。
// 如果你把属性值设置为空，就会删除该属性。你也可以像jQuery函数一样通过传递键值 和 函数来设置。
console.debug($('ul').attr('id'));
//=> fruits

console.debug($('.apple').attr('id', 'favorite').html());
//=> <li class="apple" id="favorite">Apple</li>
