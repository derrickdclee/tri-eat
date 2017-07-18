import {$} from './bling';

function deleteStuff(e) {
  const result = confirm('Are you sure you want to delete this?');
  if (result) {
    this.previousSibling.submit();
  }
}

export default deleteStuff;
