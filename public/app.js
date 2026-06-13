const { createApp } = Vue;

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

createApp({
  data() {
    return {
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
      date: 'Wednesday, April 17'
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
      const sidenav = document.getElementById('sidenav');
      if (sidenav) {
        sidenav.style.width = this.sidenavCollapsed ? '56px' : '72px';
      }
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
      const sidenav = document.getElementById('sidenav');
      if (sidenav) {
        sidenav.style.width = this.sidenavCollapsed ? '56px' : '72px';
      }
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
    }
  },
  mounted() {
    this.restoreUI();
    this.updateClock();
    setInterval(this.updateClock, 1000);
    this.fetchDashboard();
  }
}).mount('#app');
