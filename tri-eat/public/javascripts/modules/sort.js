import {$} from './bling';

function sortReviews(e) {
  let s, dir;

  const val = this.options[this.selectedIndex].value;
  switch (val) {
    case 'oldest':
      s = 'created';
      dir = 'asc';
      break;
    case 'newest':
      s = 'created';
      dir = 'desc';
      break;
    case 'lowest':
      s = 'rating';
      dir = 'asc';
      break;
    case 'highest':
      s = 'rating';
      dir = 'desc';
      break;
    case 'leastUpvoted':
      s = 'upvote';
      dir = 'asc';
      break;
    case 'mostUpvoted':
      s = 'upvote';
      dir = 'desc';
      break;
  }
  window.location.replace(`?s=${s}&dir=${dir}`);
}

export default sortReviews;
