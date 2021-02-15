import template from './index.njk'

document.body.innerHTML = template({
  username: 'Mike'
})