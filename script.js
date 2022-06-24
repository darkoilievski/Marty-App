'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // it needs to be in km
    this.duration = duration; // it needs to be in minutes
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    // minutes per kilometer
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // kilometers per hour
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 97, 523);
// console.log(run1, cycling1);
///////////////////////////////////////////////////////////
// Application Architechture
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    // use bind() whenever u call this. in the constructor
    this._getPosition(); // Get the current location
    form.addEventListener('subimt', this._newWorkout.bind(this)); // Displaying a map marker
    inputType.addEventListener('change', this._toggleElevationField); // Chnage the last value Elevation gain / Cadence from Running to Cycling. Using the add event listener (change)
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    // Displaying a map using Leaflet Library
    this.#map = L.map('map').setView(coords, 13);
    // console.log(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    // Create a function to check the input data (valid)
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    // Create a helper function for positive number
    const allPositive = (...inputs) => inputs.every(input => input > 0);
    e.preventDefault();
    // Get data from the form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check if data input is valid

    // If the workout is running, create running obejct
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If the workout is cycling, create cycling obejct
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // Add new object to workout array
    this.#workouts.push(workout);
    // Render workout on map as marker
    this._renderWorkoutMarker(workout);
    // render workout on list
    this._renderWorkout(workout);
    //Hide form + clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout workout--${workout.name}" data-id="${workout.id}">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
  }
}

const app = new App();

// GEOLOCATION API

/* 

PROJECT PLANING - LECTURE 213

1. Start with User stories
2. Features
3. Flowchart
4. Projects architechture
5. Development Step


*/

/* 

USER STORIES - WHAT DO THEY WANT/NEED?
1. As a user i want to log my running workouts  with location, distance, time, pace
and steps per minute so i can keep log of all my running.
2. As a user i want to log my cycling workouts  with location, distance, time, speed
and elevation gain per minute so i can keep log of all my running.
3. As a user i want to see all my workouts at a glance, so i can easily track my 
progress over time.
4. As a user, I want to also see my workouts on a map, so i can easily check where
i work out the most
*/

/* 

FEATURES

1. Use a map for the user to click and add a new workout
2. Geolocation to display map at current location
3. Form to unput distance, pace, steps/minute.
4. Form to unput distance, pace, elevation gain.
5. Display all workouts in a list.
6. Display all workouts on the map.
7. Store workout data in the browser using local storage API
8. On plage load, read the saved data from local storage and display.
*/
/* 

FLOWCHART - IN THE FOLDER

*/
/* 

PROJECT ARCHITECHTURE

1. Where and how to store the data? (location, distance, time, pace, steps or elevation gain)

*/
