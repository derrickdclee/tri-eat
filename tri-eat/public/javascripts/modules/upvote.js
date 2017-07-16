import axios from 'axios';
import {$} from './bling';

function ajaxUpvote(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      const isUpvoted = this.upvote.classList.toggle('upvote__button--upvoted');
      this.previousSibling.textContent = res.data.upvoteUsers.length;

      if (isUpvoted) {
        // add the animation, which will take place over 2.5 s
        this.upvote.classList.add('upvote__button--float');
        // and remove the css class responsible for the animation
        // after 2.5 s
        setTimeout(() => this.upvote.classList.remove('upvote__button--float'), 2500);
      }

    })
    .catch(err => {
      console.log(err);
    });

}

export default ajaxUpvote;
