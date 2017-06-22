const co      = require('co');
const express = require('express');
const request = require('superagent');

/*
Sample response body (apiRes.body)
We add a timestamp to this object when we save it to the map
Default units are in Kelvin, we elect to use Imperial
(example temps are Kelvin)

{ coord: { lon: -121.51, lat: 38.62 },
  weather: [ { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' } ],
  base: 'stations',
  main:
   { temp: 306.05,
     pressure: 1006,
     humidity: 21,
     temp_min: 305.15,
     temp_max: 308.15 },
  visibility: 16093,
  wind: { speed: 4.6, deg: 360 },
  clouds: { all: 1 },
  dt: 1498150680,
  sys:
   { type: 1,
     id: 422,
     message: 0.0041,
     country: 'US',
     sunrise: 1498135338,
     sunset: 1498188858 },
  id: 0,
  name: 'Sacramento',
  cod: 200 }
*/

const apiKey = '8461e7b13137551abb508082786a6a49';
const apiUrl = 'http://api.openweathermap.org/data/2.5/weather';

const units       = 'imperial';
const countryCode = 'us';

const staleTimeDiff = (() => {
  const minutes          = 30;
  const secondsPerMinute = 60;
  const msPerSeconds     = 1000;

  return minutes * secondsPerMinute * msPerSeconds;
})();

const isStale = ({ timestamp }) => {
  return Date.now() - timestamp > staleTimeDiff;
};

const sendRes = (tempObj, isCached, res) => {
  const temp = tempObj.main.temp;
  const name = tempObj.name;

  return res.json({
    isCached,
    temp,
    name
  });
};

const getTemp = (zipTempCache) => (req, res) => co(function*() {
  const zip = String(req.body.zip) || '';

  if (zip === '') {
    return res.status(400).json({ error: 'A zip code is required' });
  }

  const tempObj = zipTempCache.get(zip);

  if (tempObj) {
    if (isStale(tempObj)) {
      zipTempCache.delete(zip);
    } else {
      const isCached = true;
      return sendRes(tempObj, isCached, res);
    }
  } 

  const apiReq = request
    .get(apiUrl)
    .query({
      zip:   `${zip},${countryCode}`,
      APPID: apiKey,
      units
    });

  const apiRes = yield apiReq;

  const newTempObj     = apiRes.body;
  newTempObj.timestamp = Date.now();

  zipTempCache.set(zip, newTempObj);

  const isCached = false;
  return sendRes(newTempObj, isCached, res);

}).catch((err) => {
  console.error(err.message);
  console.error(err.stack);

  res.status(500).send(err.message || err);
});

module.exports = getTemp;