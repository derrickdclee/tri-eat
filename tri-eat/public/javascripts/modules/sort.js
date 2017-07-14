import {$} from './bling';

function sortReviews(e) {
  window.location.replace(`?s=${this.options[this.selectedIndex].value}`);
}

export default sortReviews;
