import template from './index.njk'
import './src/sass/style.scss';

document.body.innerHTML = template({
  username: 'Mike'
})