# Smart Home Dashboard

A responsive web dashboard built with Node.js, HTML, CSS and JavaScript. Designed for desktop, tablet and mobile use. It supports real Home Assistant integration and also works with mock data if no Home Assistant connection is configured.

## Features

- Clock, weather and sunrise/sunset at a glance
- Calendar preview for upcoming events
- ToDo / Shopping List with local storage
- Home controls: lighting, switches, heating and media
- Media playback status and volume control
- Home observability: open doors/windows, energy consumption, solar generation, room temperature, air quality
- Context-aware notifications and status reminders
- Camera preview support
- Responsive layout for desktop, tablet and mobile screens

## Requirements

- Node.js 18+ installed
- Home Assistant instance for real automation integration
- Home Assistant long-lived access token

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Create a `.env` file or set environment variables before starting the server.

Example `.env` values:

```text
HOME_ASSISTANT_URL=https://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your_long_lived_access_token
CALENDAR_ENTITY=calendar.family
CAMERA_ENTITY=camera.front_door
MEDIA_ENTITY=media_player.living_room
HEATING_ENTITY=climate.home_heating
```

3. Start the dashboard

```bash
npm start
```

4. Open your browser

Navigate to `http://localhost:3000`

## Notes

- If Home Assistant is not configured, the dashboard falls back to demo data.
- Controls are available through the Node.js backend proxy to avoid exposing tokens in the browser.
- Add your own entities by editing `server.js` or setting the environment variables.

## Project structure

- `server.js` - Express backend, Home Assistant API proxy and mock fallback
- `public/index.html` - dashboard UI
- `public/styles.css` - responsive styling
- `public/app.js` - front-end logic and data polling

## Device and display specs

- Display: 10.95" IPS LCD, 2560×1600, 60Hz, 500 nits (typical)
- Processor: Google Tensor G2
- RAM: 8GB
- Storage: 128GB UFS 3.1 (256GB also available)
- Price: ~$$$ (tablet only), more with dock

## Customization

- Add your own Home Assistant entity IDs in environment variables
- Extend `public/app.js` to create new panels or additional cards
- Modify `public/styles.css` for colors, spacing and layout

## Troubleshooting

- If the server cannot connect to Home Assistant, ensure the URL and token are correct.
- For HTTPS Home Assistant installs, use a trusted certificate or configure your browser to trust the host.

---

Build your smart home dashboard and connect it to real automations with a fast responsive web UI.