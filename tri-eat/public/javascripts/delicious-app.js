import '../sass/style.scss';

import io from 'socket.io-client';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';
import ajaxGetAverageRating from './modules/average';

autocomplete( $('#address'), $('#lat'), $('#lng'));

typeAhead($('.search'));

makeMap($('#map'));

// $$ is querySelectorAll
// bling.js allows us to listen to events on multiple nodes
$$('form.heart').on('submit', ajaxHeart);

$$('form.userAverage').on('submit', ajaxGetAverageRating);
