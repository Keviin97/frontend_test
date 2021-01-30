import React, {FormEvent, useState, Fragment} from 'react';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import SvgIcon from '@material-ui/core/SvgIcon';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Weather, WeatherError } from "./interfaces/Weather";
import axios, {AxiosResponse, AxiosError} from 'axios';

// SCSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/index.scss';

type FormElement =  FormEvent<HTMLFormElement>;

function App() {
  const response_initial_value = {"coord": {"lon": 0,"lat": 0},"weather": [],"base": "","main": {"temp": 0,"feels_like": 0,"temp_min": 0,"temp_max": 0,"pressure": 0,"humidity": 0,"sea_level": 0,"grnd_level": 0},"visibility": 0,"wind": {"speed": 0,"deg": 0,"gust": 0},"clouds": {"all": 0},"dt": 0,"sys": {"type": 0,"id": 0,"country": "","sunrise": 0,"sunset": 0},"timezone": 0,"id": 0,"name": "","cod": 0};
  const [cityName, setCityName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<Weather>(response_initial_value)
  const [error, setError] = useState<WeatherError>({cod: "", message: ""})
  const [favorites, setFavorites] = useState<Weather[]>([])

  const getWheaterDate = (e: FormElement) => {
    e.preventDefault();
    setLoading(true);
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=a5cc52eb601e5eae0fdcec2fd28a2a6c&lang=es&units=metric`)
    .then((response: AxiosResponse) => {
      setError({cod: "", message: ""});
      setResponse(response.data);
    }).catch((error: AxiosError) => {
      if (error.response) {
        setError(error.response.data);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  const addFavorite = (favorite: Weather) => {
    const newFavorite = [...favorites, favorite];
    if (favorites.length < 3) {
      setFavorites(newFavorite);
      setCityName("");
      setError({cod: "", message: ""});
      setResponse(response_initial_value);
    }
  }

  const deleteFavorite = (index: number) => {
    const newFavorite = [...favorites];
    newFavorite.splice(index, 1)
    setFavorites(newFavorite);
  }

  return (
    <div className={`d-flex justify-content-center app-body ${response.id !== 0 && response.main.temp > 23 ? 'sunny-day' : response.id !== 0 && response.main.temp < 15 ? 'cold-day' : 'template-day'}`}>
      <div className="d-flex flex-column">
        <div className="card-weather d-flex flex-md-row flex-column mt-5">
          <div className="flex-1 card-input">
            <form onSubmit={getWheaterDate}>
              <div className="d-flex flex-1 align-items-start flex-column">
                <input type="text" placeholder="Choose a location" value={cityName} onChange={(e) => setCityName(e.target.value)} className="input-weather mb-3" autoFocus/>
                <Button
                  variant="contained"
                  type="submit"
                  endIcon={<Icon>search</Icon>}
                  className="btn-block btn-green"
                >
                  Find
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {addFavorite(response)}}
                  endIcon={<Icon>star</Icon>}
                  className="btn-block btn-green d-flex align-self-end"
                  disabled={(response.id === 0 && error.cod !== "404" && error.cod !== "400" && 0 === error.cod.length && !loading && favorites.length < 3) ? true : false}
                >
                  Add to favorite
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {setCityName(""); setError({cod: "", message: ""}); setResponse(response_initial_value); setFavorites([]);}}
                  endIcon={<Icon>delete</Icon>}
                  className="btn-block btn-green d-flex align-self-end"
                >
                  Clear
                </Button>
              </div>
            </form>
          </div>
          <div className={`flex-2 info-card ${response.id !== 0 && response.main.temp > 23 ? 'bg-warm-back-color' : response.id !== 0 && response.main.temp < 15 ? 'bg-cold-back-color' : ''}`}>
              {/* Mostrar la data que nos response la peticion a la API */}
              {response && response.id !== 0 && error.cod !== "404" && error.cod !== "400" && !loading && (
                <div className="d-flex flex-column px-3">
                  <span className="city-name">{response.name}, {response.sys.country}</span>
                  <div className="d-flex w-100 bg-green mb-3" style={{height: '1px'}}/>
                  {response.id !== 0 && response.main.temp > 23 && (
                    <Icon style={{ fontSize: 70 }} className="sunny sun">wb_sunny</Icon>
                  )}
                  {response.id !== 0 && response.main.temp >= 15 && response.main.temp <= 23&& (
                    // <Icon style={{ fontSize: 70 }} className="sunny sun">cloud</Icon>
                    <SvgIcon style={{ fontSize: 70 }} className="">
                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cloud-sun" className="svg-inline--fa fa-cloud-sun fa-w-20 warm-font-color" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M575.2 325.7c.2-1.9.8-3.7.8-5.6 0-35.3-28.7-64-64-64-12.6 0-24.2 3.8-34.1 10-17.6-38.8-56.5-66-101.9-66-61.8 0-112 50.1-112 112 0 3 .7 5.8.9 8.7-49.6 3.7-88.9 44.7-88.9 95.3 0 53 43 96 96 96h272c53 0 96-43 96-96 0-42.1-27.2-77.4-64.8-90.4zm-430.4-22.6c-43.7-43.7-43.7-114.7 0-158.3 43.7-43.7 114.7-43.7 158.4 0 9.7 9.7 16.9 20.9 22.3 32.7 9.8-3.7 20.1-6 30.7-7.5L386 81.1c4-11.9-7.3-23.1-19.2-19.2L279 91.2 237.5 8.4C232-2.8 216-2.8 210.4 8.4L169 91.2 81.1 61.9C69.3 58 58 69.3 61.9 81.1l29.3 87.8-82.8 41.5c-11.2 5.6-11.2 21.5 0 27.1l82.8 41.4-29.3 87.8c-4 11.9 7.3 23.1 19.2 19.2l76.1-25.3c6.1-12.4 14-23.7 23.6-33.5-13.1-5.4-25.4-13.4-36-24zm-4.8-79.2c0 40.8 29.3 74.8 67.9 82.3 8-4.7 16.3-8.8 25.2-11.7 5.4-44.3 31-82.5 67.4-105C287.3 160.4 258 140 224 140c-46.3 0-84 37.6-84 83.9z"></path></svg>
                    </SvgIcon>
                  )}
                  {response.id !== 0 && response.main.temp < 15 && (
                    <SvgIcon style={{ fontSize: 70 }} className="">
                      <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="snowflake" className="svg-inline--fa fa-snowflake fa-w-14 cold-font-color" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M440.1 355.2l-39.2-23 34.1-9.3c8.4-2.3 13.4-11.1 11.1-19.6l-4.1-15.5c-2.2-8.5-10.9-13.6-19.3-11.3L343 298.2 271.2 256l71.9-42.2 79.7 21.7c8.4 2.3 17-2.8 19.3-11.3l4.1-15.5c2.2-8.5-2.7-17.3-11.1-19.6l-34.1-9.3 39.2-23c7.5-4.4 10.1-14.2 5.8-21.9l-7.9-13.9c-4.3-7.7-14-10.3-21.5-5.9l-39.2 23 9.1-34.7c2.2-8.5-2.7-17.3-11.1-19.6l-15.2-4.1c-8.4-2.3-17 2.8-19.3 11.3l-21.3 81-71.9 42.2v-84.5L306 70.4c6.1-6.2 6.1-16.4 0-22.6l-11.1-11.3c-6.1-6.2-16.1-6.2-22.2 0l-24.9 25.4V16c0-8.8-7-16-15.7-16h-15.7c-8.7 0-15.7 7.2-15.7 16v46.1l-24.9-25.4c-6.1-6.2-16.1-6.2-22.2 0L142.1 48c-6.1 6.2-6.1 16.4 0 22.6l58.3 59.3v84.5l-71.9-42.2-21.3-81c-2.2-8.5-10.9-13.6-19.3-11.3L72.7 84c-8.4 2.3-13.4 11.1-11.1 19.6l9.1 34.7-39.2-23c-7.5-4.4-17.1-1.8-21.5 5.9l-7.9 13.9c-4.3 7.7-1.8 17.4 5.8 21.9l39.2 23-34.1 9.1c-8.4 2.3-13.4 11.1-11.1 19.6L6 224.2c2.2 8.5 10.9 13.6 19.3 11.3l79.7-21.7 71.9 42.2-71.9 42.2-79.7-21.7c-8.4-2.3-17 2.8-19.3 11.3l-4.1 15.5c-2.2 8.5 2.7 17.3 11.1 19.6l34.1 9.3-39.2 23c-7.5 4.4-10.1 14.2-5.8 21.9L10 391c4.3 7.7 14 10.3 21.5 5.9l39.2-23-9.1 34.7c-2.2 8.5 2.7 17.3 11.1 19.6l15.2 4.1c8.4 2.3 17-2.8 19.3-11.3l21.3-81 71.9-42.2v84.5l-58.3 59.3c-6.1 6.2-6.1 16.4 0 22.6l11.1 11.3c6.1 6.2 16.1 6.2 22.2 0l24.9-25.4V496c0 8.8 7 16 15.7 16h15.7c8.7 0 15.7-7.2 15.7-16v-46.1l24.9 25.4c6.1 6.2 16.1 6.2 22.2 0l11.1-11.3c6.1-6.2 6.1-16.4 0-22.6l-58.3-59.3v-84.5l71.9 42.2 21.3 81c2.2 8.5 10.9 13.6 19.3 11.3L375 428c8.4-2.3 13.4-11.1 11.1-19.6l-9.1-34.7 39.2 23c7.5 4.4 17.1 1.8 21.5-5.9l7.9-13.9c4.6-7.5 2.1-17.3-5.5-21.7z"></path></svg>
                    </SvgIcon>
                  )}
                  <span className="current-weather">{Math.round(response.main.temp)}°C</span>
                  <span className="range-weather mb-4">{Math.round(response.main.temp_min)}°C / {Math.round(response.main.temp_max)}°C</span>
                  <span className="other-text">Precipitation: {response.main.pressure}%</span>
                  <span className="other-text">Humidity: {response.main.humidity}%</span>
                  <span className="other-text">Wind: {response.wind.speed}mph</span>
                </div>
              )}
              <div className="d-flex justify-content-center align-items-center h-100">
                {/* Mostrar este mensaje cuando no se ha hecho ninguna petición */}
                {response && response.id === 0 && error.cod !== "404" && error.cod !== "400" && !loading && (
                  <span className="error-message">No data</span>
                )}
                {/* Mensaje de error cuando no se encuentra una coincidencia con el texto ingresado */}
                {error.cod === "404" && !loading && (
                  <span className="error-message">{error.message}</span>
                )}
                {/* Mensaje de error cuando no se ingresa ningun texto en el input */}
                {error.cod === "400" && !loading && (
                  <span className="error-message">{error.message}</span>
                )}
                {/* Loader */}
                {!!loading && (
                  <CircularProgress size={100} className="green"/>
                )}
              </div>
          </div>
        </div>
        {favorites && favorites.length > 0 && favorites.map((favorite, index) => {
          return (
            <div className={`info-card mt-3 ${favorite.id !== 0 && favorite.main.temp > 23 ? 'bg-warm-back-color' : favorite.id !== 0 && favorite.main.temp < 15 ? 'bg-cold-back-color' : 'bg-back-color'}`} key={index}>
              <div className="d-flex flex-column px-3 flex-1">
                <span className="city-name">{favorite.name}, {favorite.sys.country}</span>
                <div className="d-flex w-100 bg-green mb-2" style={{height: '1px'}}/>
                {favorite.id !== 0 && favorite.main.temp > 23 && (
                  <Icon style={{ fontSize: 70 }} className="sunny sun">wb_sunny</Icon>
                )}
                {favorite.id !== 0 && favorite.main.temp >= 15 && favorite.main.temp <= 23&& (
                  <SvgIcon style={{ fontSize: 70 }} className="template-weather">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cloud-sun" className="svg-inline--fa fa-cloud-sun fa-w-20 warm-font-color" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M575.2 325.7c.2-1.9.8-3.7.8-5.6 0-35.3-28.7-64-64-64-12.6 0-24.2 3.8-34.1 10-17.6-38.8-56.5-66-101.9-66-61.8 0-112 50.1-112 112 0 3 .7 5.8.9 8.7-49.6 3.7-88.9 44.7-88.9 95.3 0 53 43 96 96 96h272c53 0 96-43 96-96 0-42.1-27.2-77.4-64.8-90.4zm-430.4-22.6c-43.7-43.7-43.7-114.7 0-158.3 43.7-43.7 114.7-43.7 158.4 0 9.7 9.7 16.9 20.9 22.3 32.7 9.8-3.7 20.1-6 30.7-7.5L386 81.1c4-11.9-7.3-23.1-19.2-19.2L279 91.2 237.5 8.4C232-2.8 216-2.8 210.4 8.4L169 91.2 81.1 61.9C69.3 58 58 69.3 61.9 81.1l29.3 87.8-82.8 41.5c-11.2 5.6-11.2 21.5 0 27.1l82.8 41.4-29.3 87.8c-4 11.9 7.3 23.1 19.2 19.2l76.1-25.3c6.1-12.4 14-23.7 23.6-33.5-13.1-5.4-25.4-13.4-36-24zm-4.8-79.2c0 40.8 29.3 74.8 67.9 82.3 8-4.7 16.3-8.8 25.2-11.7 5.4-44.3 31-82.5 67.4-105C287.3 160.4 258 140 224 140c-46.3 0-84 37.6-84 83.9z"></path></svg>
                  </SvgIcon>
                )}
                {favorite.id !== 0 && favorite.main.temp < 15 && (
                  <SvgIcon style={{ fontSize: 70 }} className="cold">
                    <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="snowflake" className="svg-inline--fa fa-snowflake fa-w-14 cold-font-color" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M440.1 355.2l-39.2-23 34.1-9.3c8.4-2.3 13.4-11.1 11.1-19.6l-4.1-15.5c-2.2-8.5-10.9-13.6-19.3-11.3L343 298.2 271.2 256l71.9-42.2 79.7 21.7c8.4 2.3 17-2.8 19.3-11.3l4.1-15.5c2.2-8.5-2.7-17.3-11.1-19.6l-34.1-9.3 39.2-23c7.5-4.4 10.1-14.2 5.8-21.9l-7.9-13.9c-4.3-7.7-14-10.3-21.5-5.9l-39.2 23 9.1-34.7c2.2-8.5-2.7-17.3-11.1-19.6l-15.2-4.1c-8.4-2.3-17 2.8-19.3 11.3l-21.3 81-71.9 42.2v-84.5L306 70.4c6.1-6.2 6.1-16.4 0-22.6l-11.1-11.3c-6.1-6.2-16.1-6.2-22.2 0l-24.9 25.4V16c0-8.8-7-16-15.7-16h-15.7c-8.7 0-15.7 7.2-15.7 16v46.1l-24.9-25.4c-6.1-6.2-16.1-6.2-22.2 0L142.1 48c-6.1 6.2-6.1 16.4 0 22.6l58.3 59.3v84.5l-71.9-42.2-21.3-81c-2.2-8.5-10.9-13.6-19.3-11.3L72.7 84c-8.4 2.3-13.4 11.1-11.1 19.6l9.1 34.7-39.2-23c-7.5-4.4-17.1-1.8-21.5 5.9l-7.9 13.9c-4.3 7.7-1.8 17.4 5.8 21.9l39.2 23-34.1 9.1c-8.4 2.3-13.4 11.1-11.1 19.6L6 224.2c2.2 8.5 10.9 13.6 19.3 11.3l79.7-21.7 71.9 42.2-71.9 42.2-79.7-21.7c-8.4-2.3-17 2.8-19.3 11.3l-4.1 15.5c-2.2 8.5 2.7 17.3 11.1 19.6l34.1 9.3-39.2 23c-7.5 4.4-10.1 14.2-5.8 21.9L10 391c4.3 7.7 14 10.3 21.5 5.9l39.2-23-9.1 34.7c-2.2 8.5 2.7 17.3 11.1 19.6l15.2 4.1c8.4 2.3 17-2.8 19.3-11.3l21.3-81 71.9-42.2v84.5l-58.3 59.3c-6.1 6.2-6.1 16.4 0 22.6l11.1 11.3c6.1 6.2 16.1 6.2 22.2 0l24.9-25.4V496c0 8.8 7 16 15.7 16h15.7c8.7 0 15.7-7.2 15.7-16v-46.1l24.9 25.4c6.1 6.2 16.1 6.2 22.2 0l11.1-11.3c6.1-6.2 6.1-16.4 0-22.6l-58.3-59.3v-84.5l71.9 42.2 21.3 81c2.2 8.5 10.9 13.6 19.3 11.3L375 428c8.4-2.3 13.4-11.1 11.1-19.6l-9.1-34.7 39.2 23c7.5 4.4 17.1 1.8 21.5-5.9l7.9-13.9c4.6-7.5 2.1-17.3-5.5-21.7z"></path></svg>
                  </SvgIcon>
                )}
                <span className="current-weather">{Math.round(favorite.main.temp)}°C</span>
                <span className="range-weather mb-4">{Math.round(favorite.main.temp_min)}°C / {Math.round(favorite.main.temp_max)}°C</span>
                <span className="other-text">Precipitation: {favorite.main.pressure}%</span>
                <span className="other-text">Humidity: {favorite.main.humidity}%</span>
                <span className="other-text">Wind: {favorite.wind.speed}mph</span>
                <Button
                  variant="contained"
                  onClick={() => {deleteFavorite(index)}}
                  endIcon={<Icon>clear</Icon>}
                  className={`btn-block mt-3 ${favorite.id !== 0 && favorite.main.temp > 23 ? 'btn-warm' : favorite.id !== 0 && favorite.main.temp < 15 ? 'btn-cold' : 'btn-green'}`}
                >
                  Delete favorite
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
