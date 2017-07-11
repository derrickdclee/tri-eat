import axios from 'axios';
import {$} from './bling';

function ajaxHeart(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      // toggle removes if the class is present; adds if absent
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        // add the animation, which will take place over 2.5 s
        this.heart.classList.add('heart__button--float');
        // and remove the css class responsible for the animation
        // after 2.5 s
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
      }
    })
    .catch(err => {
      console.log(err);
    });
}

export default ajaxHeart;
