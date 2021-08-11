"use strict"





// CLASS WORKOUT

class Workout {

    date = new Date()
    id = (Date.now() + '').slice(-10)

    constructor(coords, distance, duration) {
        // this.dated
        // this.id
        this.coords = coords
        this.distance = distance //km
        this.duration = duration//min

    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`


    }
}

class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {

        super(coords, distance, duration)
        this.cadence = cadence
        this.calcPace()
        this._setDescription()
    }

    calcPace() {

        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration, elevationGain) {

        super(coords, distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed()
        this._setDescription()
    }

    calcSpeed() {
        this.speed = (this.distance * 60) / this.duration
        return this.speed
    }
}


const run = new Running([39, -12], 5, 30, 100)

const cycle1 = new Cycling([39, -12], 20, 30, 480)












// CLASS APP(MAIN)

const form = document.querySelector(".form")
const containerWorkouts = document.querySelector(".workouts")   
const inputType = document.querySelector(".form__input--type")
const inputDistance = document.querySelector(".form__input--distance")
const inputDuration = document.querySelector(".form__input--duration")
const inputCadence = document.querySelector(".form__input--cadence")
const inputElevation = document.querySelector(".form__input--elevation")


class App {
    #map
    #mapEvent
    #workouts = []
    #mapZoomLevel=13
    constructor() {

    // Get Users Location
        this._getPosition();

// Get Data from local storage
this._getLocalStorage()

console.log(location    );
// Event Handler    
        form.addEventListener("submit", this._newWorkout.bind(this))

        inputType.addEventListener("change", this._toggleElevationField)


        containerWorkouts.addEventListener('click',this._moveToMarker.bind(this))

    }




    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                (error) => {
                    alert("could not get your location")
                    console.log(error)
                }
            )
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords
        const { longitude } = position.coords
        const coords = [latitude, longitude]

        this.#map = L.map("map").setView(coords, this.#mapZoomLevel)

        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map)

        this.#map.on("click", this._showForm.bind(this))

        this.#workouts.forEach((work)=>{
         
            this.renderWorkoutMarker(work)
            
        })

    }

    _showForm(mapE) {
        this.#mapEvent = mapE

        form.classList.remove("hidden")
        inputDistance.focus()
    }

    _hideForm(){
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ""

        form.style.display='none'
        form.classList.add('hidden')

        setTimeout(() => {
            
            form.style.display='grid'
        }, 1000);



    
    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden")
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden")
    }

    _newWorkout(e) {
        e.preventDefault()


        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const checkPositive = (...inputs) => inputs.every((inp) => inp > 0)
        // GET DATA FROM THE FORM
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value

        const { lat, lng } = this.#mapEvent.latlng
        let workout;


        // CHECK IF DATA IS VALID


        // IF WORKOUT IS RUNNING, CREATE RUNNING OBJECT

        if (type === 'running') {
            const cadence = +inputCadence.value

            if (!validInputs(distance, duration, cadence) || !checkPositive(distance, duration, cadence)) {
                return alert("Input must be a positive number")
            }

            workout = new Running([lat, lng], distance, duration, cadence)
        }

        // IF WORKOUT IS CYCLING, CREATE CYCLING OBJECT

        if (type === 'cycling') {
            const elevation = +inputElevation.value


            if (!validInputs(distance, duration, elevation) || !checkPositive(distance, duration)) {
                return alert("Input must be a positive number")
            }

            workout = new Cycling([lat, lng], distance, duration, elevation)


        }

        // ADD OBJECT TO NEW WORKOUT ARRAY

        this.#workouts.push(workout)



        // RENDER WORKOUT ON MAP AS A MARKER
        this.renderWorkoutMarker(workout) 

        // RENDER WORKOUT ON THE LIST
   this._renderWorkout(workout)
        // HIDE FORMS AND CLEAR INPUT FIELDS





        // Clear Input Fields
     
    this._hideForm()

        // Set Local Sttorage to store workouts

        this._setLocalStorage()

    }


    renderWorkoutMarker(workout) {

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
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup()
    }

    _renderWorkout(workout) {


        let html = ` 
<li class="workout workout--${workout.type}" data-id="${workout.id}">
<h2 class="workout__title">${workout.description}</h2>
<div class="workout__details">
  <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
  <span class="workout__value">${workout.distance}</span>
  <span class="workout__unit">km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>
`

        if (workout.type === 'running') {
            html =html +`
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
    </li>`
        }
        if (workout.type==='cycling') {
            html= html+ `
            <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
            </div> 
            <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
            </div>
          </li>  `
        }


        form.insertAdjacentHTML("afterend",html)


    }

    _moveToMarker(e){
        const workoutEl=e.target.closest('.workout')
    

        if (!workoutEl) return;

        const workout=this.#workouts.find((work)=>work.id===workoutEl.dataset.id)

        this.#map.setView(workout.coords,this.#mapZoomLevel,{
            animate:true,
            pan:{
                duration:1
            }
        })



    }

    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts))
        
    }

    _getLocalStorage(){
const data=JSON.parse(localStorage.getItem('workouts'))

if (!data) return;
this.#workouts=data

this.#workouts.forEach((work)=>{
    this._renderWorkout(work)
    
    
})

    }

    reset(){
        localStorage.clear()
        location.reload( )
        
    }
}




const app = new App()
