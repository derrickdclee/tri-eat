import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomplete( $('#address'), $('#lat'), $('#lng'));

typeAhead($('.search'));

makeMap($('#map'));

// $$ is querySelectorAll
// bling.js allows us to listen to events on multiple nodes
$$('form.heart').on('submit', ajaxHeart);
