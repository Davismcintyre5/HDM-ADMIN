import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../../services/farmvexa/health';
import { getWeatherTest, runWeatherTest } from '../../services/farmvexa/weather';
import { updateSettings } from '../../services/farmvexa/settings';
import Card from '../../components/farmvexa/ui/Card';
import Badge from '../../components/farmvexa/ui/Badge';
import Button from '../../components/farmvexa/ui/Button';
import Toggle from '../../components/farmvexa/ui/Toggle';
import Spinner from '../../components/farmvexa/ui/Spinner';
import { HiRefresh, HiServer, HiDatabase, HiStatusOnline, HiMail, HiDeviceMobile, HiCloud, HiChip, HiGlobe, HiShieldCheck, HiSun, HiPlay } from 'react-icons/hi';

const REFRESH_INTERVAL = 30000;

const StatusBadge = ({ status }) => {
  const map = { running: 'success', connected: 'success', up: 'success', enabled: 'success', online: 'success', success: 'success', unknown: 'warning', offline: 'warning', disabled: 'default', failed: 'danger' };
  return <Badge variant={map[status] || 'default'}>{status || 'unknown'}</Badge>;
};

const StatusDot = ({ status }) => {
  const colors = { running: 'bg-green-500', connected: 'bg-green-500', up: 'bg-green-500', enabled: 'bg-green-500', online: 'bg-green-500', success: 'bg-green-500', unknown: 'bg-yellow-500', offline: 'bg-red-500', disabled: 'bg-gray-400', failed: 'bg-red-500' };
  return <span className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-400'} inline-block`} />;
};

export default function Health() {
  const [health, setHealth] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = useCallback(async () => {
    try { const res = await getHealth(); setHealth(res?.data || res); setLastUpdated(new Date()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

 const fetchWeather = async () => {
  try {
    const res = await getWeatherTest();
    console.log('Weather raw:', res);
    console.log('Weather data:', res?.data);
    setWeather(res?.data || res);
  } catch (e) { console.error('Weather fetch error:', e); }
};

  useEffect(() => { fetchHealth(); fetchWeather(); const i = setInterval(fetchHealth, REFRESH_INTERVAL); return () => clearInterval(i); }, [fetchHealth]);

const handleWeatherTest = async () => {
  setWeatherLoading(true);
  try {
    const res = await runWeatherTest();
    setWeather(res?.data || res);
  } catch (err) { alert(err.message); }
  setWeatherLoading(false);
};

  const handleWeatherToggle = async (v) => {
    try {
      await updateSettings({ system: { weatherTest: { enabled: v } } });
      fetchWeather();
    } catch (err) { alert(err.message); }
  };

  if (loading && !health) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { server, database, redis, email, sms, storage, pythonAi, cors, stats, timestamp } = health || {};
  const servicesUp = [server, database, redis, email, storage].filter(s => s?.status === 'running' || s?.status === 'connected' || s?.status === 'up' || s?.status === 'enabled').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Health</h1>
            <Badge variant={servicesUp >= 5 ? 'success' : 'warning'}>{servicesUp}/5 Core Services Up</Badge>
          </div>
          {lastUpdated && <p className="text-xs text-[var(--text-muted)] mt-1">Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh: 30s</p>}
        </div>
        <Button variant="secondary" onClick={fetchHealth}><HiRefresh className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Server */}
        <ServiceCard icon={HiServer} name="Server" status={server?.status}>
          <Detail label="Node" value={server?.node} />
          <Detail label="Platform" value={server?.platform} />
          <Detail label="URL" value={server?.url} mono />
          <Detail label="Uptime" value={server?.uptime} />
          <Detail label="CPU" value={server?.cpu} />
          <Detail label="Memory" value={server?.memory} />
        </ServiceCard>

        {/* Python AI */}
        <Card className={`border-l-4 ${pythonAi?.status === 'connected' || pythonAi?.status === 'online' ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiChip className="w-5 h-5 text-[var(--text-secondary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Python AI</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={pythonAi?.status} />
              <StatusBadge status={pythonAi?.status} />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <Detail label="MERN Connected" value={pythonAi?.mernConnected ? 'Yes' : 'No'} />
            <Detail label="URL" value={pythonAi?.url} mono />
            <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Server</p>
              <Detail label="Node" value={pythonAi?.server?.node} />
              <Detail label="Platform" value={pythonAi?.server?.platform} />
              <Detail label="Uptime" value={pythonAi?.server?.uptime} />
              <Detail label="CPU" value={pythonAi?.server?.cpu} />
              <Detail label="Memory" value={pythonAi?.server?.memory} />
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">AI</p>
              <Detail label="Mode" value={pythonAi?.ai?.mode} />
              <Detail label="Model" value={pythonAi?.ai?.model} mono />
              <Detail label="Confidence" value={pythonAi?.ai?.confidence_threshold} />
              <Detail label="Model Exists" value={pythonAi?.ai?.model_exists ? 'Yes' : 'No'} />
            </div>
          </div>
        </Card>

        {/* Database */}
        <ServiceCard icon={HiDatabase} name="Database" status={database?.status}>
          <Detail label="Host" value={database?.host} mono />
          <Detail label="Database" value={database?.database} />
          <Detail label="Collections" value={database?.collections} />
        </ServiceCard>

        {/* Redis */}
        <ServiceCard icon={HiStatusOnline} name="Redis" status={redis?.status}>
          <Detail label="Host" value={redis?.host} mono />
        </ServiceCard>

        {/* Email */}
        <ServiceCard icon={HiMail} name="Email" status={email?.status}>
          <Detail label="Provider" value={email?.provider} />
          <Detail label="From" value={email?.from} />
          <Detail label="Sender" value={email?.sender} />
        </ServiceCard>

        {/* SMS */}
        <ServiceCard icon={HiDeviceMobile} name="SMS" status={sms?.status}>
          <Detail label="Provider" value={sms?.provider} />
          <Detail label="Sender" value={sms?.sender} />
        </ServiceCard>

        {/* Storage */}
        <ServiceCard icon={HiCloud} name="Storage" status={storage?.status}>
          <Detail label="Type" value={storage?.type} />
          <Detail label="Cloud" value={storage?.cloud} />
        </ServiceCard>

        {/* CORS */}
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiGlobe className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-[var(--text-primary)]">CORS</h3>
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] break-all">
            <span className="text-[var(--text-secondary)]">Origins: </span>
            <span className="text-[var(--text-primary)]">{cors?.origins}</span>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-3">
            <HiShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">Quick Stats</h3>
          </div>
          <div className="space-y-1 text-sm">
            <Detail label="Farmers" value={stats?.farmers} />
            <Detail label="Farms" value={stats?.farms} />
            <Detail label="Devices" value={`${stats?.devices?.online}/${stats?.devices?.total} online`} />
            <Detail label="Today Usage" value={stats?.todayUsage} />
          </div>
        </Card>

{/* Weather API Test */}
<Card className="border-l-4 border-l-amber-500 lg:col-span-2">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <HiSun className="w-5 h-5 text-amber-500" />
      <h3 className="font-semibold text-[var(--text-primary)]">Weather API Test</h3>
      {weather?.enabled !== undefined && (
        <span className="text-xs text-[var(--text-muted)]">
          ({weather?.enabled ? 'Enabled' : 'Disabled'})
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <Toggle checked={weather?.enabled || false} onChange={handleWeatherToggle} />
      <Button size="sm" onClick={handleWeatherTest} loading={weatherLoading}>
        <HiPlay className="w-4 h-4 mr-1" /> Run Test
      </Button>
    </div>
  </div>

  {weather?.results ? (
    <div className="space-y-4">
      {Array.isArray(weather.results) && weather.results[0]?.location ? (
        weather.results.map((loc, i) => (
          <div key={i}>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
              📍 {loc.location}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loc.results?.map((api, j) => (
                <div key={j} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-[var(--text-primary)]">
                      {api.api === 'openweather' ? 'OpenWeatherMap' : 'WeatherAPI'}
                    </h5>
                    <StatusBadge status={api.status} />
                  </div>
                  {api.status === 'success' ? (
                    <div className="space-y-1 text-xs">
                      <Detail label="Temperature" value={`${api.data?.temperature}°C`} />
                      <Detail label="Humidity" value={`${api.data?.humidity}%`} />
                      <Detail label="Condition" value={api.data?.condition} />
                      <Detail label="Wind" value={api.data?.windSpeed ? `${api.data.windSpeed} m/s` : null} />
                      <Detail label="Response" value={`${api.responseTime}ms`} />
                    </div>
                  ) : (
                    <p className="text-xs text-red-500">{api.error || 'Test failed'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            📍 {weather.location || 'Unknown'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weather.results.map((api, j) => (
              <div key={j} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-medium text-[var(--text-primary)]">
                    {api.api === 'openweather' ? 'OpenWeatherMap' : 'WeatherAPI'}
                  </h5>
                  <StatusBadge status={api.status} />
                </div>
                {api.status === 'success' ? (
                  <div className="space-y-1 text-xs">
                    <Detail label="Temperature" value={`${api.data?.temperature}°C`} />
                    <Detail label="Humidity" value={`${api.data?.humidity}%`} />
                    <Detail label="Condition" value={api.data?.condition} />
                    <Detail label="Wind" value={api.data?.windSpeed ? `${api.data.windSpeed} m/s` : null} />
                    <Detail label="Response" value={`${api.responseTime}ms`} />
                  </div>
                ) : (
                  <p className="text-xs text-red-500">{api.error || 'Test failed'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <p className="text-sm text-[var(--text-muted)] text-center py-4">
      No weather test data. Click Run Test to check both APIs.
    </p>
  )}
</Card>
      </div>

      {timestamp && <p className="text-xs text-[var(--text-muted)] text-center mt-6">Data timestamp: {new Date(timestamp).toLocaleString()}</p>}
    </div>
  );
}

function ServiceCard({ icon: Icon, name, status, children }) {
  const ok = status === 'running' || status === 'connected' || status === 'up' || status === 'enabled' || status === 'online';
  return (
    <Card className={`border-l-4 ${ok ? 'border-l-green-500' : status === 'disabled' || status === 'unknown' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="space-y-1 text-sm">{children}</div>
    </Card>
  );
}

function Detail({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)] text-xs">{label}</span>
      <span className={`text-[var(--text-primary)] text-xs ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}