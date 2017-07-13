import axios from 'axios';
import {$} from './bling';

function ajaxGetAverageRating(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      const rating = res.data[0].avgRating;
      const div = this.parentNode;
      div.innerHTML += rating;
    })
    .catch(err => {
      console.log(err);
    });
}

export default ajaxGetAverageRating;
