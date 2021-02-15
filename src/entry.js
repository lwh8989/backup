var tpl = require("nunjucks!./views/page.njk");
var html = tpl.render({ message: 'Foo that!' });