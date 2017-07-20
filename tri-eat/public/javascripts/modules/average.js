import axios from 'axios';
import {$} from './bling';

function ajaxGetAverageRating(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      const rating = res.data[0].avgRating;
      const div = this.parentNode.nextSibling;
      const formattedRating = Math.round(rating * 10) / 10;
      div.innerHTML += `The average rating of this user's reviews is ${formattedRating} / 5`;
      this.avg.disabled = true;
    })
    .catch(err => {
      console.log(err);
    });
}

export default ajaxGetAverageRating;
