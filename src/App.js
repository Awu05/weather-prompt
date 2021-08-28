import React, { Component } from "react";
import EditableSection from "./EditableSection";
import WeatherCard from "./WeatherCard";
import "./styles/App.css";
import { WeatherInfo } from "./models/WeatherInfo";
import Papa from "papaparse";
// import data from "./test-data.json";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weatherData: {},
      filteredData: {},
      startDate: new Date("2020-01-01T18:00:00.000Z"),
      endDate: new Date("2020-01-01T19:00:00.000Z"),
      location: "",
    };
    this.getData = this.getData.bind(this);
    this.getWeatherData = this.getWeatherData.bind(this);
  }

  componentDidMount() {
    this.getCsvData();
  }

  getData(result) {
    let data = [];

    for (let i = 1; i < result.data.length - 1; i++) {
      const obj = {};
      for (let j = 0; j < result.data[0].length; j++) {
        obj[result.data[0][j]] = result.data[i][j];
      }
      if (
        obj.hasOwnProperty("date") &&
        obj.hasOwnProperty("town") &&
        obj.hasOwnProperty("weather")
      ) {
        data.push(obj);
      }
    }

    this.getWeatherData(data);
  }

  async getCsvData() {
    Papa.parse("test-data.csv", {
      download: true,
      complete: this.getData,
    });
  }

  getWeatherData(fileData) {
    let weather = {};
    fileData.forEach((item) => {
      if (!weather.hasOwnProperty(item.town)) {
        if (item.hasOwnProperty("temperature")) {
          weather[item.town] = [
            new WeatherInfo(item.date, item.town, item.weather, item.temp),
          ];
        } else {
          weather[item.town] = [
            new WeatherInfo(item.date, item.town, item.weather),
          ];
        }
      } else {
        if (item.hasOwnProperty("temperature")) {
          weather[item.town].push(
            new WeatherInfo(item.date, item.town, item.weather, item.temp)
          );
        } else {
          weather[item.town].push(
            new WeatherInfo(item.date, item.town, item.weather)
          );
        }
      }
    });

    this.setState({ weatherData: weather, filteredData: weather });
  }

  filterWeatherData(start, end, location) {
    let data = {};

    Object.keys(this.state.weatherData).forEach((town) => {
      if (town.toLowerCase().includes(location.toLowerCase())) {
        const townData = this.state.weatherData[town];
        townData.forEach((item) => {
          if (new Date(item.date) >= start && new Date(item.date) <= end) {
            if (!data.hasOwnProperty(item.town)) {
              data[item.town] = [
                new WeatherInfo(item.date, item.town, item.weather),
              ];
            } else {
              data[item.town].push(
                new WeatherInfo(item.date, item.town, item.weather)
              );
            }
          }
        });
      }
    });

    this.setState({ filteredData: data });
  }

  render() {
    return (
      <div className="App">
        <EditableSection
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          location={this.state.location}
          onStartDateChange={(value) => {
            this.filterWeatherData(
              new Date(new Date(value).toISOString()),
              this.state.endDate,
              this.state.location
            );
            this.setState({
              startDate: new Date(new Date(value).toISOString()),
            });
          }}
          onEndDateChange={(value) => {
            this.filterWeatherData(
              this.state.startDate,
              new Date(new Date(value).toISOString()),
              this.state.location
            );
            this.setState({ endDate: new Date(new Date(value).toISOString()) });
          }}
          onLocationChange={(e) => {
            this.filterWeatherData(
              this.state.startDate,
              this.state.endDate,
              e.target.value
            );
            this.setState({ location: e.target.value });
          }}
        />
        <div className="editable-section">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            {Object.keys(this.state.filteredData).map((town, index) => {
              const townData = this.state.filteredData[town];
              return (
                <div
                  key={town}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    overflow: "auto",
                    padding: 20,
                    alignItems: "baseline",
                  }}
                >
                  <label style={{ width: 70 }}>{town}</label>
                  {townData.map((item, index) => (
                    <WeatherCard
                      key={index}
                      date={item.date}
                      weather={item.weather}
                      location={item.town}
                      temperature={item.temperature}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
