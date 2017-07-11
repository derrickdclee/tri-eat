import axios from 'axios';
import {$} from './bling';

const defaultLocation = {
  lat: 36.0014,
  lng: -78.9382
};
const mapOptions = {
  center: {lat: defaultLocation.lat, lng: defaultLocation.lng},
  zoom: 10
};

function loadPlaces(map, lat = defaultLocation.lat, lng = defaultLocation.lng) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if (!places.length) {
        return alert('no places found!');
      }

      // create bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = {lat: placeLat, lng: placeLng};
        bounds.extend(position);
        const marker = new google.maps.Marker({map, position});
        marker.place = place;
        return marker;
      });

      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo|| 'store.png'}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));
      // zoom the map to fit all the markers perfectly
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
    .catch(err => {

    });
}

function makeMap(mapDiv) {
  if(!mapDiv) return;
  // make the map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('input[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });
}

export default makeMap;
