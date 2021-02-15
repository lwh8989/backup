import template from './index.njk'
import './src/sass/_style.scss';

document.body.innerHTML = template({
  username: 'Mike'
})