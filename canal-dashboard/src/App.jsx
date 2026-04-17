import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { 
  Server, CheckCircle, Download, Info, MapPin, LayoutDashboard, Cpu, Database, 
  Activity, AlertTriangle, Sun, Moon, Languages, Menu, X, RefreshCw, Droplet, 
  Gauge, Thermometer, Wifi, WifiOff, Clock, HardDrive, Zap, BarChart3, Shield,
  Home, TrendingUp, FileText, Settings, Bell, Search, Filter, Maximize2, Minimize2,
  Circle, ArrowUp, ArrowDown, CloudRain, Wind
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Canal path coordinates
const canalPath = [
  [8.1400, 80.2200], [8.1420, 80.2150], [8.1410, 80.2100], [8.1450, 80.2050],
  [8.1480, 80.1980], [8.1500, 80.1900], [8.1480, 80.1850], [8.1520, 80.1780],
  [8.1550, 80.1700], [8.1600, 80.1600],
];

// IoT devices data
const nodes = [
  { id: 1, lat: 8.1400, lng: 80.2200, status: 'Healthy', waterLevel: 1.4, pH: 7.0, flow: 18, temp: 28.5, turbidity: 12 },
  { id: 2, lat: 8.1415, lng: 80.2125, status: 'Healthy', waterLevel: 1.3, pH: 7.1, flow: 17, temp: 28.2, turbidity: 14 },
  { id: 3, lat: 8.1430, lng: 80.2075, status: 'Warning', waterLevel: 0.9, pH: 6.5, flow: 12, temp: 29.1, turbidity: 28 },
  { id: 4, lat: 8.1465, lng: 80.2015, status: 'Healthy', waterLevel: 1.2, pH: 7.0, flow: 15, temp: 28.7, turbidity: 15 },
  { id: 5, lat: 8.1490, lng: 80.1940, status: 'Critical', waterLevel: 0.4, pH: 5.8, flow: 5, temp: 30.2, turbidity: 45 },
  { id: 6, lat: 8.1490, lng: 80.1875, status: 'Healthy', waterLevel: 1.1, pH: 7.2, flow: 14, temp: 28.9, turbidity: 13 },
  { id: 7, lat: 8.1500, lng: 80.1815, status: 'Warning', waterLevel: 0.8, pH: 7.6, flow: 10, temp: 29.5, turbidity: 32 },
  { id: 8, lat: 8.1535, lng: 80.1740, status: 'Healthy', waterLevel: 1.2, pH: 6.9, flow: 15, temp: 28.4, turbidity: 16 },
  { id: 9, lat: 8.1575, lng: 80.1650, status: 'Critical', waterLevel: 0.3, pH: 8.2, flow: 3, temp: 31.0, turbidity: 52 },
  { id: 10, lat: 8.1600, lng: 80.1600, status: 'Healthy', waterLevel: 1.3, pH: 7.1, flow: 16, temp: 28.6, turbidity: 11 },
];

const fiveYearData = [
  { year: '2021', Yala_CHI: 82, Maha_CHI: 88 },
  { year: '2022', Yala_CHI: 78, Maha_CHI: 85 },
  { year: '2023', Yala_CHI: 75, Maha_CHI: 80 },
  { year: '2024', Yala_CHI: 65, Maha_CHI: 72 },
  { year: '2025', Yala_CHI: 60, Maha_CHI: 68 },
];

// Monthly flow data for chart
const monthlyFlowData = [
  { month: 'Jan', flow: 22, rainfall: 85 }, { month: 'Feb', flow: 20, rainfall: 70 },
  { month: 'Mar', flow: 18, rainfall: 65 }, { month: 'Apr', flow: 15, rainfall: 90 },
  { month: 'May', flow: 14, rainfall: 110 }, { month: 'Jun', flow: 12, rainfall: 45 },
  { month: 'Jul', flow: 11, rainfall: 40 }, { month: 'Aug', flow: 10, rainfall: 55 },
  { month: 'Sep', flow: 13, rainfall: 75 }, { month: 'Oct', flow: 16, rainfall: 120 },
  { month: 'Nov', flow: 19, rainfall: 140 }, { month: 'Dec', flow: 21, rainfall: 100 },
];

// Translations
const translations = {
  si: {
    title: "වාරි ඇළ නිරීක්ෂණය",
    subtitle: "IoT & AI බලයෙන්",
    dashboard: "මුල් පිටුව",
    analytics: "විශ්ලේෂණ",
    reports: "වාර්තා",
    settings: "සැකසුම්",
    mapView: "සිතියම් දර්ශනය",
    deviceStatus: "උපාංග තත්ත්වය",
    waterQuality: "ජල ගුණාත්මකභාවය",
    flowRate: "ගලන වේගය",
    waterLevel: "ජල මට්ටම",
    phLevel: "pH අගය",
    temperature: "උෂ්ණත්වය",
    turbidity: "කැළඹීම",
    healthy: "හොඳයි",
    warning: "අවධානම",
    critical: "බරපතල",
    lastUpdated: "අවසන් යාවත්කාලීනය",
    exportPDF: "PDF ලෙස ගන්න",
    refresh: "නැවුම් කරන්න",
    searchPlaceholder: "උපාංගයක් සොයන්න...",
    systemHealth: "පද්ධති සෞඛ්‍යය",
    mlInsights: "ML තීක්ෂ්ණ බුද්ධිය",
    seasonalTrend: "කන්න අනුව ප්‍රවණතා",
    flowVsRainfall: "ගලන වේගය vs වර්ෂාපතනය"
  },
  en: {
    title: "Canal Watch",
    subtitle: "Powered by IoT & AI",
    dashboard: "Dashboard",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
    mapView: "Map View",
    deviceStatus: "Device Status",
    waterQuality: "Water Quality",
    flowRate: "Flow Rate",
    waterLevel: "Water Level",
    phLevel: "pH Level",
    temperature: "Temperature",
    turbidity: "Turbidity",
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    lastUpdated: "Last updated",
    exportPDF: "Export PDF",
    refresh: "Refresh",
    searchPlaceholder: "Search device...",
    systemHealth: "System Health",
    mlInsights: "ML Insights",
    seasonalTrend: "Seasonal Trend",
    flowVsRainfall: "Flow vs Rainfall"
  }
};

// Helper functions
const getStatusColor = (status) => {
  switch(status) {
    case 'Healthy': return 'emerald';
    case 'Warning': return 'amber';
    case 'Critical': return 'rose';
    default: return 'gray';
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'Healthy': return <CheckCircle size={16} />;
    case 'Warning': return <AlertTriangle size={16} />;
    case 'Critical': return <AlertTriangle size={16} />;
    default: return <Circle size={16} />;
  }
};

// Custom marker
const createCustomIcon = (status) => {
  const color = status === 'Healthy' ? '#10b981' : status === 'Warning' ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>`,
    className: 'custom-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedNode, setSelectedNode] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [isLoadingML, setIsLoadingML] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const t = translations[language];

  useEffect(() => {
    fetchMLData();
    const interval = setInterval(fetchMLData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMLData = async () => {
    setIsLoadingML(true);
    try {
      const response = await fetch('https://api.allorigins.win/raw?url=http://13.51.70.185:5000/api/ml-health');
      if (response.ok) {
        const data = await response.json();
        setMlData(data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      console.error("Backend Error:", error);
      setMlData(null);
    }
    setIsLoadingML(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Canal Watch Report', 15, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 35);
    doc.setTextColor(0, 0, 0);
    doc.text('IoT Device Status Summary', 15, 55);
    const nodeData = nodes.map(n => [n.id, n.status, `${n.waterLevel}m`, n.pH, `${n.flow} L/s`, `${n.temp}°C`]);
    autoTable(doc, { head: [['ID', 'Status', 'Water Level', 'pH', 'Flow', 'Temp']], body: nodeData, startY: 60, theme: 'striped' });
    doc.save('canal_watch_report.pdf');
  };

  const filteredNodes = nodes.filter(node => 
    node.id.toString().includes(searchQuery) || 
    node.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarNavItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: t.dashboard },
    { id: 'analytics', icon: <TrendingUp size={20} />, label: t.analytics },
    { id: 'reports', icon: <FileText size={20} />, label: t.reports },
    { id: 'settings', icon: <Settings size={20} />, label: t.settings },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} h-full bg-white dark:bg-gray-800 shadow-2xl flex flex-col`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            </div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:block">
            {isSidebarCollapsed ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-6">
          {sidebarNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 ${activePage === item.id ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-r-4 border-emerald-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {item.icon}
              {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!isSidebarCollapsed && <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setLanguage(language === 'si' ? 'en' : 'si')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'}`}>
            <Languages size={18} />
            {!isSidebarCollapsed && <span className="text-sm">{language === 'si' ? 'English' : 'සිංහල'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-emerald-500 text-white rounded-full shadow-lg">
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} /> {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMLData} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <RefreshCw size={18} className={isLoadingML ? 'animate-spin' : ''} />
            </button>
            <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition">
              <Download size={16} /> {t.exportPDF}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Page */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                      <p className="text-3xl font-bold mt-1">{nodes.length}</p>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><Wifi className="text-emerald-500" size={24} /></div>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="text-emerald-500">● {nodes.filter(n => n.status === 'Healthy').length} Healthy</span>
                    <span className="text-amber-500">● {nodes.filter(n => n.status === 'Warning').length} Warning</span>
                    <span className="text-rose-500">● {nodes.filter(n => n.status === 'Critical').length} Critical</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg Water Level</p>
                      <p className="text-3xl font-bold mt-1">{(nodes.reduce((a,b) => a + b.waterLevel, 0) / nodes.length).toFixed(1)}<span className="text-base font-normal">m</span></p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Droplet className="text-blue-500" size={24} /></div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">Target: 1.2m - 1.5m</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Flow Rate</p>
                      <p className="text-3xl font-bold mt-1">{nodes.reduce((a,b) => a + b.flow, 0)}<span className="text-base font-normal"> L/s</span></p>
                    </div>
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl"><Wind className="text-teal-500" size={24} /></div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">System Health</p>
                      <p className="text-3xl font-bold mt-1">{mlData ? `${mlData.confidence}%` : '—'}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Activity className="text-purple-500" size={24} /></div>
                  </div>
                </div>
              </div>

              {/* Map and Device List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2"><MapPin size={18} className="text-emerald-500" /> {t.mapView}</h2>
                  </div>
                  <div className="h-96 w-full">
                    <MapContainer center={[8.1480, 80.1900]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Polyline positions={canalPath} color="#f59e0b" weight={5} opacity={0.8} />
                      {nodes.map(node => (
                        <Marker key={node.id} position={[node.lat, node.lng]} icon={createCustomIcon(node.status)} eventHandlers={{ click: () => setSelectedNode(node) }}>
                          <Popup><div className="text-center"><b>Node {node.id}</b><br/>{node.status}</div></Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold flex items-center gap-2"><Server size={18} className="text-emerald-500" /> {t.deviceStatus}</h2>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {filteredNodes.map(node => (
                      <div key={node.id} onClick={() => setSelectedNode(node)} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${selectedNode?.id === node.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full bg-${getStatusColor(node.status)}-500`}></div>
                            <span className="font-medium">Node #{node.id}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${getStatusColor(node.status)}-100 text-${getStatusColor(node.status)}-600 dark:bg-${getStatusColor(node.status)}-900/30 dark:text-${getStatusColor(node.status)}-400`}>{node.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div><Droplet size={12} className="inline mr-1" />{node.waterLevel}m</div>
                          <div><Gauge size={12} className="inline mr-1" />{node.flow} L/s</div>
                          <div><Thermometer size={12} className="inline mr-1" />{node.temp}°C</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Node Details */}
              {selectedNode && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2"><Info size={18} className="text-emerald-500" /> Node #{selectedNode.id} Details</h2>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-semibold text-${getStatusColor(selectedNode.status)}-500`}>{selectedNode.status}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">Water Level</p>
                      <p className="font-semibold">{selectedNode.waterLevel}m</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">pH</p>
                      <p className="font-semibold">{selectedNode.pH}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">Flow</p>
                      <p className="font-semibold">{selectedNode.flow} L/s</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">Temp</p>
                      <p className="font-semibold">{selectedNode.temp}°C</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500">Turbidity</p>
                      <p className="font-semibold">{selectedNode.turbidity} NTU</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Page */}
          {activePage === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h2 className="font-semibold mb-4">{t.seasonalTrend}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fiveYearData}>
                      <defs><linearGradient id="yala" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="maha" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="year" stroke="#888" /><YAxis stroke="#888" /><CartesianGrid strokeDasharray="3 3" /><Tooltip /><Legend />
                      <Area type="monotone" dataKey="Yala_CHI" stroke="#10b981" fill="url(#yala)" name="Yala" />
                      <Area type="monotone" dataKey="Maha_CHI" stroke="#3b82f6" fill="url(#maha)" name="Maha" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h2 className="font-semibold mb-4">{t.flowVsRainfall}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyFlowData}>
                      <XAxis dataKey="month" stroke="#888" /><YAxis yAxisId="left" stroke="#888" /><YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                      <Tooltip /><Legend />
                      <Bar yAxisId="left" dataKey="flow" fill="#10b981" name="Flow (L/s)" radius={[4,4,0,0]} />
                      <Bar yAxisId="right" dataKey="rainfall" fill="#f59e0b" name="Rainfall (mm)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {mlData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-purple-500" /> {t.mlInsights}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"><p className="text-sm text-gray-500">Model</p><p className="font-bold">Random Forest</p><p className="text-xs text-gray-400">Accuracy: {mlData.confidence}%</p></div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><p className="text-sm text-gray-500">Prediction</p><p className="font-bold">{mlData.system_status}</p><p className="text-xs text-gray-400">Next 7 days forecast</p></div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><p className="text-sm text-gray-500">Recommendation</p><p className="font-bold">{mlData.system_status === 'Healthy' ? 'Normal Ops' : mlData.system_status === 'Warning' ? 'Inspect nodes 3,7' : 'Emergency check node 5,9'}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Page */}
          {activePage === 'reports' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Historical Reports</h2>
              <div className="space-y-3">
                {['January 2025', 'December 2024', 'November 2024', 'October 2024'].map((report, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center gap-3"><FileText size={20} className="text-emerald-500" /><span>{report} - Canal Health Summary</span></div>
                    <button className="text-emerald-500 text-sm">Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Page */}
          {activePage === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-6">Preferences</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between"><span>Dark Mode</span><button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full transition ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></div></button></div>
                <div className="flex items-center justify-between"><span>Language</span><button onClick={() => setLanguage(language === 'si' ? 'en' : 'si')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{language === 'si' ? 'සිංහල' : 'English'}</button></div>
                <div className="flex items-center justify-between"><span>Auto-refresh (30s)</span><span className="text-gray-500">Enabled</span></div>
                <div className="pt-4"><button className="px-4 py-2 bg-rose-500 text-white rounded-lg">Reset All Settings</button></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}