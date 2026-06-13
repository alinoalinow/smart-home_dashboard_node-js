require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const HASS_URL = process.env.HOME_ASSISTANT_URL || '';
const HASS_TOKEN = process.env.HOME_ASSISTANT_TOKEN || '';
const CALENDAR_ENTITY = process.env.CALENDAR_ENTITY || '';
const CAMERA_ENTITY = process.env.CAMERA_ENTITY || '';
const MEDIA_ENTITY = process.env.MEDIA_ENTITY || '';
const HEATING_ENTITY = process.env.HEATING_ENTITY || '';

app.use(cors());
app.use(bodyParser.json());

const distPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(distPath));

function hassHeaders() {
  if (!HASS_TOKEN) return {};
  return {
    Authorization: `Bearer ${HASS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function fetchHass(pathSuffix) {
  if (!HASS_URL || !HASS_TOKEN) {
    throw new Error('Home Assistant not configured');
  }
  const url = `${HASS_URL.replace(/\/$/, '')}${pathSuffix}`;
  const response = await axios.get(url, { headers: hassHeaders() });
  return response.data;
}

function mapAttributes(states) {
  const findState = (domain, preferred) => {
    if (preferred) {
      const pref = states.find((item) => item.entity_id === preferred);
      if (pref) return pref;
    }
    return states.find((item) => item.entity_id.startsWith(`${domain}.`));
  };

  const weather = findState('weather');
  const sun = findState('sun', 'sun.sun');
  const climate = HEATING_ENTITY ? states.find((item) => item.entity_id === HEATING_ENTITY) : findState('climate');
  const media = MEDIA_ENTITY ? states.find((item) => item.entity_id === MEDIA_ENTITY) : findState('media_player');
  const camera = CAMERA_ENTITY ? states.find((item) => item.entity_id === CAMERA_ENTITY) : findState('camera');

  const lights = states.filter((item) => item.entity_id.startsWith('light.')).slice(0, 8);
  const switches = states.filter((item) => item.entity_id.startsWith('switch.')).slice(0, 8);
  const binarySensors = states.filter((item) => item.entity_id.startsWith('binary_sensor.') || item.entity_id.startsWith('sensor.')); 

  const observability = binarySensors
    .filter((item) => ['on', 'off', 'open', 'closed'].includes(item.state.toLowerCase()) || item.attributes.unit_of_measurement)
    .slice(0, 10)
    .map((item) => ({
      id: item.entity_id,
      name: item.attributes.friendly_name || item.entity_id,
      state: item.state,
      unit: item.attributes.unit_of_measurement || '',
    }));

  return {
    weather: weather ? {
      summary: weather.attributes.weather || weather.state,
      temperature: weather.attributes.temperature || '--',
      humidity: weather.attributes.humidity || '--',
      wind: weather.attributes.wind_speed || '--',
      condition: weather.state,
    } : null,
    sun: sun ? {
      state: sun.state,
      next_rising: sun.attributes.next_rising,
      next_setting: sun.attributes.next_setting,
      elevation: sun.attributes.elevation,
    } : null,
    climate: climate ? {
      id: climate.entity_id,
      name: climate.attributes.friendly_name || 'Heating',
      temperature: climate.attributes.temperature || '--',
      target: climate.attributes.temperature || climate.attributes.target_temp_low || '--',
      mode: climate.state,
    } : null,
    media: media ? {
      id: media.entity_id,
      name: media.attributes.friendly_name || 'Media Player',
      state: media.state,
      volume: media.attributes.volume_level ? Math.round(media.attributes.volume_level * 100) : '--',
      title: media.attributes.media_title || 'Not playing',
      artist: media.attributes.media_artist || '',
      source: media.attributes.source || '',
    } : null,
    lights: lights.map((item) => ({
      id: item.entity_id,
      name: item.attributes.friendly_name || item.entity_id,
      state: item.state,
      brightness: item.attributes.brightness ? Math.round((item.attributes.brightness / 255) * 100) : null,
      color_temp: item.attributes.color_temp || null,
    })),
    switches: switches.map((item) => ({
      id: item.entity_id,
      name: item.attributes.friendly_name || item.entity_id,
      state: item.state,
    })),
    camera: camera ? {
      id: camera.entity_id,
      name: camera.attributes.friendly_name || 'Front Door Camera',
      snapshot: `${HASS_URL.replace(/\/$/, '')}/api/camera_proxy/${camera.entity_id.replace('camera.', '')}`,
      state: camera.state,
    } : null,
    observability,
  };
}

function mockDashboard() {
  return {
    weather: {
      summary: 'Partly Cloudy',
      temperature: 21,
      humidity: 52,
      wind: 4,
      condition: 'partlycloudy',
    },
    sun: {
      state: 'above_horizon',
      next_rising: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      next_setting: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
      elevation: 23.4,
    },
    climate: {
      id: 'climate.home_heating',
      name: 'Home Heating',
      temperature: 20.5,
      target: 22,
      mode: 'heat',
    },
    media: {
      id: 'media_player.living_room',
      name: 'Living Room',
      state: 'playing',
      volume: 67,
      title: 'Jan Blomqvist - The Space In Between',
      artist: 'Ben Böhmer Remix',
      source: 'Apple TV',
    },
    lights: [
      { id: 'light.back_living_room', name: 'Back Living Room', state: 'on', brightness: 56, color_temp: 350 },
      { id: 'light.kitchen', name: 'Kitchen', state: 'on', brightness: 66, color_temp: 400 },
      { id: 'light.front_door', name: 'Front Door Light', state: 'off', brightness: 0, color_temp: 270 },
    ],
    switches: [
      { id: 'switch.coffee_machine', name: 'Coffee Machine', state: 'off' },
      { id: 'switch.air_purifier', name: 'Air Purifier', state: 'on' },
      { id: 'switch.tv_speakers', name: 'TV Speakers', state: 'off' },
    ],
    camera: {
      id: 'camera.front_door',
      name: 'Front Door Camera',
      snapshot: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      state: 'idle',
    },
    observability: [
      { id: 'sensor.window_living_room', name: 'Living Room Window', state: 'closed', unit: '' },
      { id: 'sensor.front_door', name: 'Front Door', state: 'locked', unit: '' },
      { id: 'sensor.energy_consumption', name: 'Energy Use', state: '405', unit: 'W' },
      { id: 'sensor.solar_generation', name: 'Solar Generation', state: '0', unit: 'W' },
      { id: 'sensor.air_quality', name: 'Air Quality', state: 'Good', unit: '' },
      { id: 'sensor.room_temperature', name: 'Main Room Temp', state: '21.4', unit: '°C' },
    ],
  };
}

app.get('/api/dashboard', async (req, res) => {
  try {
    if (!HASS_URL || !HASS_TOKEN) {
      return res.json({ success: true, data: mockDashboard(), configured: false });
    }

    const states = await fetchHass('/api/states');
    const dashboard = mapAttributes(states);
    return res.json({ success: true, data: dashboard, configured: true });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.json({ success: true, data: mockDashboard(), configured: false, error: error.message });
  }
});

app.post('/api/service', async (req, res) => {
  try {
    if (!HASS_URL || !HASS_TOKEN) {
      return res.status(400).json({ success: false, error: 'Home Assistant not configured' });
    }

    const { domain, service, entity_id, data = {} } = req.body;
    if (!domain || !service) {
      return res.status(400).json({ success: false, error: 'domain and service are required' });
    }

    const url = `${HASS_URL.replace(/\/$/, '')}/api/services/${domain}/${service}`;
    const body = entity_id ? { entity_id, ...data } : data;
    const response = await axios.post(url, body, { headers: hassHeaders() });
    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Service error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/camera', async (req, res) => {
  try {
    if (CAMERA_ENTITY && HASS_URL && HASS_TOKEN) {
      const url = `${HASS_URL.replace(/\/$/, '')}/api/camera_proxy/${CAMERA_ENTITY.replace('camera.', '')}`;
      const response = await axios.get(url, { headers: hassHeaders(), responseType: 'arraybuffer' });
      res.set('Content-Type', 'image/jpeg');
      return res.send(response.data);
    }
    return res.status(404).json({ success: false, error: 'Camera not configured' });
  } catch (error) {
    console.error('Camera error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Smart Home Dashboard server listening on http://localhost:${port}`);
  if (!HASS_URL || !HASS_TOKEN) {
    console.log('Home Assistant is not configured. Using demo mock data.');
  }
});
