import template from './template.njk'

document.body.innerHTML = template({
  username: 'Mike'
})