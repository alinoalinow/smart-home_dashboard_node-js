<template>
  <div class="app-shell">
    <aside class="sidenav">
      <div class="sidenav-brand">
        <div class="brand-icon">N</div>
        <div class="brand-label">Navet</div>
      </div>
      <nav class="nav-list">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="nav-item"
          :class="{ active: currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ tab }}
        </button>
      </nav>
      <div class="sidenav-footer">
        <button class="btn tiny" @click="toggleSidenav">☰</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-info">
          <div>
            <p class="eyebrow">Live dashboard</p>
            <h1>{{ title }}</h1>
            <p class="subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="topbar-actions">
          <div class="search-wrapper">
            <input class="search" v-model="searchQuery" :placeholder="searchPlaceholder" />
          </div>
          <select class="lang-select" v-model="activeLang" @change="setLanguage(activeLang)">
            <option value="en">EN</option>
            <option value="fa">فارسی</option>
          </select>
          <button class="btn small" @click="fetchDashboard">{{ refreshLabel }}</button>
          <span class="status-tag" :style="statusStyle">{{ statusText }}</span>
        </div>
      </header>

      <!-- HOME TAB -->
      <section v-if="currentTab === 'Home'" class="status-strip">
        <div v-for="pill in statusPills" :key="pill.label" class="status-pill" :class="pill.color">
          <span>{{ pill.label }}</span>
          <strong>{{ pill.value }}</strong>
        </div>
      </section>

      <!-- NOTIFICATIONS BANNER -->
      <section v-if="currentTab === 'Home'" class="notifications-banner">
        <div class="notification-item success">
          <span>✓</span>
          <strong>System Online</strong>
          <span class="notification-time">All systems operational</span>
        </div>
        <div class="notification-item warning">
          <span>!</span>
          <strong>Energy Peak</strong>
          <span class="notification-time">Using 405W - High consumption</span>
        </div>
      </section>

      <!-- STATUS PILLS -->
      <section v-if="currentTab === 'Home'" class="status-strip">
        <div v-for="pill in statusPills" :key="pill.label" class="status-pill" :class="pill.color">
          <span>{{ pill.label }}</span>
          <strong>{{ pill.value }}</strong>
        </div>
      </section>

      <section v-if="currentTab === 'Home'" class="dashboard-grid home-grid">
        <!-- CLOCK CARD -->
        <article class="card clock-card glass-card">
          <div class="panel-title">Today</div>
          <div class="hero-time">{{ time }} <span class="clock-meridian">{{ meridian }}</span></div>
          <p class="hero-date">{{ date }}</p>
        </article>

        <!-- LIGHTING CONTROL -->
        <article class="card device-card light-gradient">
          <div class="card-header">
            <span class="icon">💡</span>
            <div>
              <div class="panel-title">Light</div>
              <strong>Kitchen Island</strong>
            </div>
          </div>
          <div class="brightness-control">
            <span class="label">Brightness</span>
            <input type="range" min="0" max="100" v-model.number="lightBrightness" class="slider">
            <span class="value">{{ lightBrightness }}%</span>
          </div>
          <div class="button-group">
            <button class="btn-icon" title="Warm">☀️</button>
            <button class="btn-icon" title="Cool">🌙</button>
            <button class="btn-icon" title="More">⋯</button>
          </div>
        </article>

        <!-- CLIMATE CONTROL -->
        <article class="card device-card hvac-gradient">
          <div class="card-header">
            <span class="icon">🔥</span>
            <div>
              <div class="panel-title">Climate</div>
              <strong>Main Floor</strong>
            </div>
          </div>
          <div class="temp-display">
            <div class="current">{{ heating.temperature }}</div>
            <div class="target">Target: {{ heating.target }}</div>
          </div>
          <div class="button-group">
            <button class="btn-sm" @click="adjustHeating(-1)">−</button>
            <button class="btn-sm" @click="adjustHeating(1)">+</button>
            <button class="btn-sm">⚙️</button>
          </div>
        </article>

        <!-- HUMIDIFIER -->
        <article class="card device-card humidity-gradient">
          <div class="card-header">
            <span class="icon">💧</span>
            <div>
              <div class="panel-title">Humidifier</div>
              <strong>Bedroom</strong>
            </div>
          </div>
          <div class="percent-display">46%</div>
          <div class="sub-text">Humidifying to 46%</div>
          <div class="button-group">
            <button class="btn-sm">−</button>
            <button class="btn-sm">+</button>
            <button class="btn-sm active">ON</button>
          </div>
        </article>

        <!-- FAN CONTROL -->
        <article class="card device-card fan-gradient">
          <div class="card-header">
            <span class="icon">🌀</span>
            <div>
              <div class="panel-title">Fan</div>
              <strong>Bedroom Fan</strong>
            </div>
          </div>
          <div class="control-buttons">
            <button class="speed-btn">Low</button>
            <button class="speed-btn active">Med</button>
            <button class="speed-btn">High</button>
          </div>
        </article>

        <!-- MEDIA PLAYER -->
        <article class="card device-card media-gradient">
          <div class="card-header">
            <span class="icon">🎵</span>
            <div>
              <div class="panel-title">Now Playing</div>
              <strong>{{ media.title }}</strong>
            </div>
          </div>
          <div class="artist-info">{{ media.artist }}</div>
          <div class="player-controls">
            <button class="btn-icon" @click="mediaAction('pause')">⏸</button>
            <button class="btn-icon" @click="mediaAction('play')">▶</button>
            <button class="btn-icon" @click="mediaAction('stop')">⏹</button>
          </div>
          <div class="volume-bar">Volume: {{ media.volume }}</div>
        </article>

        <!-- LIGHTS GROUP -->
        <article class="card group-card">
          <div class="panel-title">💡 Lights</div>
          <div class="device-mini-list">
            <div class="mini-device on">
              <span>Back Living Room</span>
              <button class="btn-tiny" @click="toggleDevice">✓</button>
            </div>
            <div class="mini-device on">
              <span>Kitchen</span>
              <button class="btn-tiny" @click="toggleDevice">✓</button>
            </div>
            <div class="mini-device off">
              <span>Front Door</span>
              <button class="btn-tiny" @click="toggleDevice">○</button>
            </div>
          </div>
        </article>

        <!-- SWITCHES GROUP -->
        <article class="card group-card">
          <div class="panel-title">⚡ Switches</div>
          <div class="device-mini-list">
            <div class="mini-device on">
              <span>Coffee Machine</span>
              <button class="btn-tiny" @click="toggleDevice">✓</button>
            </div>
            <div class="mini-device on">
              <span>Air Purifier</span>
              <button class="btn-tiny" @click="toggleDevice">✓</button>
            </div>
            <div class="mini-device off">
              <span>TV Speakers</span>
              <button class="btn-tiny" @click="toggleDevice">○</button>
            </div>
          </div>
        </article>

        <!-- SECURITY -->
        <article class="card security-card">
          <div class="panel-title">🔐 Security</div>
          <div class="security-items">
            <div class="security-item locked">
              <span>🔒 Front Door</span>
              <button class="btn-lock">Locked</button>
            </div>
            <div class="security-item locked">
              <span>🔒 Back Door</span>
              <button class="btn-lock">Locked</button>
            </div>
          </div>
        </article>

        <!-- WEATHER & SENSORS -->
        <article class="card weather-card">
          <div class="panel-title">🌦️ Weather</div>
          <div class="weather-main">
            <strong>{{ weatherTemp }}</strong>
            <span>{{ weatherSummary }}</span>
          </div>
          <div class="weather-details">
            <div><span>🌅 {{ sunrise }}</span></div>
            <div><span>🌇 {{ sunset }}</span></div>
            <div><span>💨 4 m/s</span></div>
            <div><span>💧 52%</span></div>
          </div>
        </article>

        <!-- ENERGY USAGE -->
        <article class="card energy-card">
          <div class="panel-title">⚡ Energy</div>
          <div class="energy-main">
            <strong>{{ energyUsage }}</strong>
          </div>
          <div class="mini-chart">
            <div class="bar" style="height: 60%"></div>
            <div class="bar" style="height: 75%"></div>
            <div class="bar" style="height: 45%"></div>
            <div class="bar" style="height: 90%"></div>
          </div>
          <div class="energy-info">Air Quality: <strong>{{ airQuality }}</strong></div>
        </article>

        <!-- SENSORS & ALERTS -->
        <article class="card sensors-card">
          <div class="panel-title">📊 Sensors</div>
          <div class="sensor-list">
            <div v-for="item in observability.slice(0, 4)" :key="item.id" class="sensor-item">
              <div class="sensor-name">{{ item.name }}</div>
              <div class="sensor-value">{{ item.state }}<span v-if="item.unit"> {{ item.unit }}</span></div>
            </div>
          </div>
        </article>

        <!-- CALENDAR & EVENTS -->
        <article class="card calendar-card">
          <div class="panel-title">📅 Events</div>
          <div class="event-list">
            <div v-for="event in events" :key="event.title" class="event-row">
              <strong>{{ event.title }}</strong>
              <span class="time">{{ event.time }}</span>
            </div>
          </div>
        </article>
      </section>

      <!-- HOME OVERVIEW -->
      <article v-if="currentTab === 'Home'" class="card specs-card glass-card">
        <div class="panel-title">Home Overview</div>
        <div class="home-overview-grid">
          <div>
            <span>Lights</span>
            <strong>{{ lightsCount }}</strong>
          </div>
          <div>
            <span>Switches</span>
            <strong>{{ switchesCount }}</strong>
          </div>
          <div>
            <span>Energy use</span>
            <strong>{{ energyUsage }}</strong>
          </div>
          <div>
            <span>Air quality</span>
            <strong>{{ airQuality }}</strong>
          </div>
        </div>
        <div class="panel-row">
          <div class="panel-block">
            <div class="panel-title small">Today</div>
            <ul class="event-list">
              <li v-for="item in calendar" :key="item.title" class="event-item">
                <strong>{{ item.title }}</strong>
                <span class="small-text">{{ item.time }}</span>
              </li>
            </ul>
          </div>
          <div class="panel-block">
            <div class="panel-title small">Notifications</div>
            <ul class="notification-list">
              <li v-for="note in notifications" :key="note">{{ note }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- ACTIVITY TAB -->
      <section v-if="currentTab === 'Activity'" class="view-section">
        <article class="card glass-card">
          <div class="panel-title">Recent Activity</div>
          <div class="activity-list">
            <div v-for="(log, idx) in activityLogs" :key="idx" class="activity-item">
              <strong>{{ log.device }}</strong>
              <span class="activity-state">{{ log.action }}</span>
              <span class="activity-time">{{ log.time }}</span>
            </div>
          </div>
        </article>
      </section>

      <!-- ROOMS TAB -->
      <section v-if="currentTab === 'Rooms'" class="view-section">
        <div class="rooms-grid">
          <article v-for="room in rooms" :key="room.id" class="card glass-card room-card">
            <div class="panel-title">{{ room.name }}</div>
            <div class="room-devices">
              <div v-for="device in room.devices" :key="device.id" class="device-item">
                <strong>{{ device.name }}</strong>
                <span :class="['device-state', device.state]">{{ device.state }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- MEDIA TAB -->
      <section v-if="currentTab === 'Media'" class="view-section">
        <article class="card glass-card">
          <div class="panel-title">Media Players</div>
          <div v-if="media" class="media-detail">
            <strong class="card-title">{{ media.name }}</strong>
            <div class="media-info">
              <div><strong>Now Playing:</strong> {{ media.title }}</div>
              <div><strong>Artist:</strong> {{ media.artist }}</div>
              <div><strong>State:</strong> {{ media.state }}</div>
              <div><strong>Volume:</strong> {{ media.volume }}</div>
            </div>
            <div class="card-actions">
              <button class="icon-btn" @click="mediaAction('pause')">⏸ Pause</button>
              <button class="icon-btn" @click="mediaAction('play')">▶ Play</button>
              <button class="icon-btn" @click="mediaAction('stop')">■ Stop</button>
            </div>
          </div>
        </article>
      </section>

      <!-- SETTINGS TAB -->
      <section v-if="currentTab === 'Settings'" class="view-section">
        <article class="card glass-card">
          <div class="panel-title">Settings</div>
          <div class="settings-grid">
            <div class="setting-item">
              <label>Language</label>
              <select class="lang-select" v-model="activeLang" @change="setLanguage(activeLang)">
                <option value="en">English</option>
                <option value="fa">فارسی (Farsi)</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Theme</label>
              <select class="lang-select">
                <option>Dark (Current)</option>
                <option>Light</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Refresh Interval</label>
              <input type="number" class="lang-select" value="30" min="10" max="300" placeholder="seconds">
            </div>
          </div>
          <div style="margin-top: 20px;">
            <strong>System Status</strong>
            <div style="margin-top: 10px; color: #94a3b8;">
              <div>Home Assistant: <span style="color: #bbf7d0;">{{ configured ? 'Connected' : 'Disconnected' }}</span></div>
              <div>Backend: <span style="color: #bbf7d0;">Running</span></div>
              <div>Last Update: <span style="color: #c7d2fe;">{{ new Date().toLocaleString() }}</span></div>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script>
const i18n = {
  en: {
    title: 'Smart Home Dashboard',
    subtitle: 'Smooth smart home control in dark mode',
    refresh: 'Refresh',
    search: 'Search devices...'
  },
  fa: {
    title: 'داشبورد خانه هوشمند',
    subtitle: 'کنترل پاسخگو برای دسکتاپ، تبلت و موبایل',
    refresh: 'به‌روزرسانی',
    search: 'جستجوی دستگاه‌ها...'
  }
};

export default {
  data() {
    return {
      currentTab: 'Home',
      tabs: ['Home', 'Activity', 'Rooms', 'Media', 'Settings'],
      title: 'Smart Home Dashboard',
      subtitle: 'Smooth smart home control in dark mode',
      refreshLabel: 'Refresh',
      searchPlaceholder: 'Search devices...',
      searchQuery: '',
      activeLang: 'en',
      statusText: 'Loading…',
      statusSuccess: true,
      statusPills: [
        { label: 'Energy', value: '1.4 kW', color: 'orange' },
        { label: 'Climate', value: '21.0–25.4°C', color: 'blue' },
        { label: 'Security', value: 'No Alerts', color: 'green' },
        { label: 'Lights', value: '0 On', color: 'purple' },
        { label: 'Speakers & TVs', value: 'None Playing', color: 'gray' }
      ],
      lightBrightness: 72,
      weatherSummary: 'Partly cloudy',
      weatherTemp: '18°C',
      weatherExtra: 'H:22° · L:13°',
      sunrise: '06:12',
      sunset: '20:47',
      lightsCount: 0,
      switchesCount: 0,
      energyUsage: '842W',
      airQuality: 'Good',
      media: {
        id: 'media.player',
        title: 'Morning Mix',
        artist: 'Navet Radio',
        source: 'Radio',
        state: 'Paused',
        volume: 'Vol 32'
      },
      heating: {
        id: 'climate.main',
        temperature: '21°C',
        mode: 'Heating',
        target: '22°C'
      },
      controls: [],
      observability: [],
      events: [
        { title: 'School pickup', time: '15:00 - 15:30' },
        { title: 'Installer call', time: '17:30 - 18:00' },
        { title: 'Waste pickup', time: 'All day' }
      ],
      calendar: [
        { title: 'Dashboard ready', time: 'Now' }
      ],
      notifications: ['Home Assistant configured: No'],
      configured: false,
      dashboardData: null,
      sidenavCollapsed: false,
      time: '07:42',
      meridian: 'AM',
      date: 'Wednesday, April 17',
      activityLogs: [
        { device: 'Kitchen Light', action: 'turned on', time: '2 minutes ago' },
        { device: 'Living Room TV', action: 'turned on', time: '5 minutes ago' },
        { device: 'Front Door', action: 'locked', time: '10 minutes ago' },
        { device: 'Bedroom Fan', action: 'turned off', time: '15 minutes ago' },
        { device: 'Heating System', action: 'set to 22°C', time: '20 minutes ago' }
      ],
      rooms: [
        {
          id: 'living_room',
          name: 'Living Room',
          devices: [
            { id: 'light_lr', name: 'Lights', state: 'on' },
            { id: 'tv_lr', name: 'TV', state: 'on' },
            { id: 'blinds_lr', name: 'Blinds', state: 'open' }
          ]
        },
        {
          id: 'bedroom',
          name: 'Bedroom',
          devices: [
            { id: 'light_br', name: 'Lights', state: 'off' },
            { id: 'fan_br', name: 'Fan', state: 'off' },
            { id: 'humidifier_br', name: 'Humidifier', state: 'on' }
          ]
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          devices: [
            { id: 'light_kit', name: 'Island Lights', state: 'on' },
            { id: 'coffee_kit', name: 'Coffee Machine', state: 'off' }
          ]
        }
      ]
    };
  },
  computed: {
    statusStyle() {
      return {
        background: this.statusSuccess ? 'rgba(34, 197, 94, 0.14)' : 'rgba(239, 68, 68, 0.14)',
        color: this.statusSuccess ? '#bbf7d0' : '#fecaca'
      };
    },
    filteredControls() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.controls;
      return this.controls.filter((device) => {
        return device.name.toLowerCase().includes(query) || device.state.toLowerCase().includes(query);
      });
    }
  },
  methods: {
    setLanguage(lang) {
      const dict = i18n[lang] || i18n.en;
      this.activeLang = lang;
      this.title = dict.title;
      this.subtitle = dict.subtitle;
      this.refreshLabel = dict.refresh;
      this.searchPlaceholder = dict.search;
      localStorage.setItem('smart-dashboard-lang', lang);
      if (lang === 'fa') {
        document.documentElement.classList.add('rtl');
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
      }
    },
    restoreUI() {
      const lang = localStorage.getItem('smart-dashboard-lang') || 'en';
      this.setLanguage(lang);
      const ui = JSON.parse(localStorage.getItem('smart-dashboard-ui') || '{}');
      this.sidenavCollapsed = Boolean(ui.sidenavCollapsed);
    },
    updateClock() {
      const now = new Date();
      const hours = now.getHours();
      this.meridian = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      this.time = `${String(displayHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.date = new Intl.DateTimeFormat('default', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }).format(now);
    },
    setStatus(message, success = true) {
      this.statusText = message;
      this.statusSuccess = success;
    },
    async fetchDashboard() {
      this.setStatus('Refreshing…');
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();
        if (result.success) {
          this.applyDashboard({ ...result.data, configured: result.configured });
          this.setStatus('Live data loaded', true);
        } else {
          this.setStatus('Unable to fetch dashboard', false);
        }
      } catch (error) {
        console.error(error);
        this.setStatus('Fetch failed, using demo mode', false);
      }
    },
    async callService(entityId, service) {
      if (!entityId) return;
      const domain = entityId.split('.')[0];
      const body = { domain, service, entity_id: entityId };
      try {
        const response = await fetch('/api/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const result = await response.json();
        if (result.success) {
          this.setStatus(`Service called: ${domain}.${service}`, true);
          this.fetchDashboard();
        } else {
          this.setStatus(`Service error: ${result.error}`, false);
        }
      } catch (error) {
        console.error(error);
        this.setStatus('Service call failed', false);
      }
    },
    mediaAction(action) {
      if (!this.media?.id) return;
      const service = action === 'play' ? 'media_play' : action === 'pause' ? 'media_pause' : 'media_stop';
      this.callService(this.media.id, service);
    },
    adjustHeating(delta) {
      if (!this.heating?.id) return;
      const current = parseFloat(String(this.heating.target || this.heating.temperature || '20').replace(/[^\d.]/g, '')) || 20;
      const newTarget = current + delta;
      const body = {
        domain: this.heating.id.split('.')[0],
        service: 'set_temperature',
        entity_id: this.heating.id,
        data: { temperature: newTarget }
      };
      fetch('/api/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.success) {
            this.setStatus(`Heating target set to ${newTarget}°C`, true);
            this.fetchDashboard();
          } else {
            this.setStatus(`Heating error: ${result.error}`, false);
          }
        })
        .catch((error) => {
          console.error(error);
          this.setStatus('Heating service failed', false);
        });
    },
    toggleSidenav() {
      this.sidenavCollapsed = !this.sidenavCollapsed;
      const ui = JSON.parse(localStorage.getItem('smart-dashboard-ui') || '{}');
      ui.sidenavCollapsed = this.sidenavCollapsed;
      localStorage.setItem('smart-dashboard-ui', JSON.stringify(ui));
    },
    applyDashboard(data) {
      this.dashboardData = data;
      this.weatherSummary = data.weather?.summary || 'No weather data';
      this.weatherTemp = `${data.weather?.temperature ?? '--'}°C`;
      this.weatherExtra = `Humidity ${data.weather?.humidity ?? '--'}% · Wind ${data.weather?.wind ?? '--'} m/s`;
      this.sunrise = data.sun?.next_rising ? this.formatTime(new Date(data.sun.next_rising)) : '--';
      this.sunset = data.sun?.next_setting ? this.formatTime(new Date(data.sun.next_setting)) : '--';
      this.lightsCount = data.lights?.length ?? 0;
      this.switchesCount = data.switches?.length ?? 0;
      this.controls = [...(data.lights || []), ...(data.switches || [])];
      this.observability = data.observability || [];
      if (data.media) {
        const m = data.media;
        this.media = { ...m, volume: typeof m.volume === 'number' ? `Vol ${m.volume}` : (m.volume || '--') };
      }
      if (data.climate) {
        const c = data.climate;
        this.heating = {
          id: c.id, name: c.name || 'Heating',
          temperature: c.temperature != null && c.temperature !== '--' ? `${c.temperature}°C` : '--',
          target: c.target != null && c.target !== '--' ? `${c.target}°C` : '--',
          mode: c.mode || 'auto',
        };
      }
      const energySensor = (data.observability || []).find((item) =>
        (item.id || '').toLowerCase().includes('energy') || (item.name || '').toLowerCase().includes('energy')
      );
      this.energyUsage = energySensor ? `${energySensor.state}${energySensor.unit ? ` ${energySensor.unit}` : ''}` : this.energyUsage;
      const airSensor = (data.observability || []).find((item) =>
        (item.id || '').toLowerCase().includes('air') || (item.name || '').toLowerCase().includes('air')
      );
      this.airQuality = airSensor ? `${airSensor.state}${airSensor.unit ? ` ${airSensor.unit}` : ''}` : this.airQuality;
      this.statusPills = [
        { label: 'Energy', value: this.energyUsage, color: 'orange' },
        { label: 'Climate', value: `${this.heating.temperature} / ${this.heating.target}`, color: 'blue' },
        { label: 'Security', value: data.security || 'No Alerts', color: 'green' },
        { label: 'Lights', value: `${this.lightsCount} On`, color: 'purple' },
        { label: 'Media', value: this.media.state || 'Offline', color: 'gray' }
      ];
      this.notifications = [`Home Assistant configured: ${data.configured ? 'Yes' : 'No'}`];
      this.calendar = [{ title: 'Dashboard ready', time: 'Now' }];
    },
    formatTime(date) {
      return new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(date);
    },
    toggleDevice() {
      this.setStatus('Device toggled', true);
    }
  },
  mounted() {
    this.restoreUI();
    this.updateClock();
    setInterval(this.updateClock, 1000);
    this.fetchDashboard();
  }
};
</script>
