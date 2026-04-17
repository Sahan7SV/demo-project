import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Server, CheckCircle, Download, Info, MapPin, LayoutDashboard, Cpu, Database, 
  Activity, AlertTriangle, Sun, Moon, Languages, Menu, X, RefreshCw, Droplet, 
  Gauge, Thermometer, Wifi, WifiOff, Clock, HardDrive, Zap, BarChart3, Shield,
  Home, TrendingUp, FileText, Settings, Bell, Search, Filter, Maximize2, Minimize2,
  Circle, ArrowUp, ArrowDown, CloudRain, Wind, Printer, FileSpreadsheet, Sparkles,
  Leaf, Waves, Droplets, Eye, Microscope, FlaskConical, Radio, Heart, Users, Globe,
  Lock, User, Monitor, Smartphone, Cloud, AlertCircle, Check, ChevronRight, Sliders,
  Map, Layers, Palette, BellRing, Mail, Trash2, Save, CloudOff, Database as DbIcon
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

// Additional water quality trend data
const waterQualityTrend = [
  { month: 'Jan', pH: 7.1, turbidity: 14, temp: 27.5 },
  { month: 'Feb', pH: 7.0, turbidity: 15, temp: 28.0 },
  { month: 'Mar', pH: 6.9, turbidity: 18, temp: 28.5 },
  { month: 'Apr', pH: 6.8, turbidity: 22, temp: 29.0 },
  { month: 'May', pH: 6.7, turbidity: 25, temp: 29.5 },
  { month: 'Jun', pH: 6.8, turbidity: 20, temp: 28.5 },
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
    flowVsRainfall: "ගලන වේගය vs වර්ෂාපතනය",
    detailedReport: "සවිස්තර වාර්තාව",
    exportDetailed: "සවිස්තර PDF අපනයනය කරන්න",
    quickReport: "වේග වාර්තාව",
    waterQualityTrend: "ජල ගුණාත්මක ප්‍රවණතාව",
    deviceDistribution: "උපාංග බෙදාහැරීම",
    notifications: "දැනුම්දීම්",
    privacy: "පෞද්ගලිකත්වය",
    display: "දර්ශනය",
    about: "පිළිබඳ"
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
    flowVsRainfall: "Flow vs Rainfall",
    detailedReport: "Detailed Report",
    exportDetailed: "Export Detailed PDF",
    quickReport: "Quick Report",
    waterQualityTrend: "Water Quality Trend",
    deviceDistribution: "Device Distribution",
    notifications: "Notifications",
    privacy: "Privacy",
    display: "Display",
    about: "About"
  }
};

// Helper functions for status styling
const getStatusBgClass = (status) => {
  switch(status) {
    case 'Healthy': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    case 'Warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    case 'Critical': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  }
};

const getStatusDotClass = (status) => {
  switch(status) {
    case 'Healthy': return 'bg-emerald-500';
    case 'Warning': return 'bg-amber-500';
    case 'Critical': return 'bg-rose-500';
    default: return 'bg-gray-500';
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'Healthy': return <CheckCircle size={14} />;
    case 'Warning': return <AlertTriangle size={14} />;
    case 'Critical': return <AlertTriangle size={14} />;
    default: return <Circle size={14} />;
  }
};

// Custom marker with online image overlay
const createCustomIcon = (status) => {
  const color = status === 'Healthy' ? '#10b981' : status === 'Warning' ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); backdrop-filter: blur(2px);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>`,
    className: 'custom-marker-glow',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
  
  // NEW SETTINGS STATES
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [mapTileLayer, setMapTileLayer] = useState('standard'); // 'standard', 'satellite', 'dark'
  const [chartTheme, setChartTheme] = useState('default');
  const [dataRetention, setDataRetention] = useState(90); // days
  const [emailReports, setEmailReports] = useState(false);
  const [criticalAlertsOnly, setCriticalAlertsOnly] = useState(false);
  const [mapMarkerStyle, setMapMarkerStyle] = useState('gradient'); // 'gradient', 'solid'
  const [showCanalLabels, setShowCanalLabels] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  const t = translations[language];

  // Available map tile layers
  const tileLayers = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  useEffect(() => {
    fetchMLData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMLData, refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

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

  const generateDetailedReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Canal Watch - Complete System Report', 15, 25);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 38);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Executive Summary', 15, 60);
    doc.setFontSize(10);
    const healthyCount = nodes.filter(n => n.status === 'Healthy').length;
    const warningCount = nodes.filter(n => n.status === 'Warning').length;
    const criticalCount = nodes.filter(n => n.status === 'Critical').length;
    const avgWaterLevel = (nodes.reduce((a,b) => a + b.waterLevel, 0) / nodes.length).toFixed(1);
    const avgFlow = (nodes.reduce((a,b) => a + b.flow, 0) / nodes.length).toFixed(1);
    const systemHealth = mlData ? `${mlData.confidence}%` : 'N/A';
    
    doc.text(`• Total Devices: ${nodes.length} (Healthy: ${healthyCount} | Warning: ${warningCount} | Critical: ${criticalCount})`, 20, 75);
    doc.text(`• Average Water Level: ${avgWaterLevel} m (Target: 1.2 - 1.5 m)`, 20, 85);
    doc.text(`• Total Flow Rate: ${nodes.reduce((a,b) => a + b.flow, 0)} L/s | Average: ${avgFlow} L/s`, 20, 95);
    doc.text(`• System Health Confidence: ${systemHealth}`, 20, 105);
    if (mlData) {
      doc.text(`• ML Prediction: ${mlData.system_status}`, 20, 115);
    }
    
    doc.setFontSize(14);
    doc.text('Detailed Device Metrics', 15, 135);
    const tableData = nodes.map(node => [
      node.id,
      node.status,
      `${node.waterLevel}m`,
      node.pH,
      `${node.flow} L/s`,
      `${node.temp}°C`,
      `${node.turbidity} NTU`
    ]);
    autoTable(doc, {
      head: [['ID', 'Status', 'Water Level', 'pH', 'Flow', 'Temp', 'Turbidity']],
      body: tableData,
      startY: 145,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Water Quality Overview', 15, finalY);
    doc.setFontSize(10);
    const avgPH = (nodes.reduce((a,b) => a + b.pH, 0) / nodes.length).toFixed(1);
    const avgTemp = (nodes.reduce((a,b) => a + b.temp, 0) / nodes.length).toFixed(1);
    const avgTurbidity = (nodes.reduce((a,b) => a + b.turbidity, 0) / nodes.length).toFixed(0);
    doc.text(`• Average pH: ${avgPH} (Ideal: 6.5 - 8.5)`, 20, finalY + 12);
    doc.text(`• Average Temperature: ${avgTemp}°C`, 20, finalY + 22);
    doc.text(`• Average Turbidity: ${avgTurbidity} NTU (Normal < 20)`, 20, finalY + 32);
    
    const lastTwoYears = fiveYearData.slice(-2);
    doc.text('Recent Seasonal Trends (CHI Index)', 15, finalY + 50);
    doc.text(`• ${lastTwoYears[0].year} Yala: ${lastTwoYears[0].Yala_CHI} | Maha: ${lastTwoYears[0].Maha_CHI}`, 20, finalY + 62);
    doc.text(`• ${lastTwoYears[1].year} Yala: ${lastTwoYears[1].Yala_CHI} | Maha: ${lastTwoYears[1].Maha_CHI}`, 20, finalY + 72);
    
    doc.save('canal_watch_detailed_report.pdf');
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

  // Pie chart data for device distribution
  const deviceDistributionData = [
    { name: 'Healthy', value: nodes.filter(n => n.status === 'Healthy').length, color: '#10b981' },
    { name: 'Warning', value: nodes.filter(n => n.status === 'Warning').length, color: '#f59e0b' },
    { name: 'Critical', value: nodes.filter(n => n.status === 'Critical').length, color: '#ef4444' },
  ];

  // Reset all settings to default
  const resetAllSettings = () => {
    setIsDarkMode(false);
    setLanguage('en');
    setAutoRefresh(true);
    setRefreshInterval(30);
    setNotificationEnabled(true);
    setEmailReports(false);
    setCriticalAlertsOnly(false);
    setMapTileLayer('standard');
    setChartTheme('default');
    setDataRetention(90);
    setMapMarkerStyle('gradient');
    setShowCanalLabels(true);
    setEnableAnimations(true);
    // Also reset any other settings to their defaults
  };

  // Reusable Water Quality Summary Component
  const WaterQualitySummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="group bg-gradient-to-br from-blue-50/90 to-blue-100/90 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-2"><Droplets className="text-blue-600" size={20} /><h3 className="font-semibold">Average pH</h3></div>
        <p className="text-2xl font-bold mt-1">{(nodes.reduce((a,b) => a + b.pH, 0) / nodes.length).toFixed(1)}</p>
        <p className="text-xs text-gray-500 mt-1">Ideal: 6.5 - 8.5</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${((nodes.reduce((a,b) => a + b.pH, 0) / nodes.length) / 14) * 100}%` }}></div></div>
      </div>
      <div className="group bg-gradient-to-br from-orange-50/90 to-orange-100/90 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-2"><Thermometer className="text-orange-600" size={20} /><h3 className="font-semibold">Average Temperature</h3></div>
        <p className="text-2xl font-bold mt-1">{(nodes.reduce((a,b) => a + b.temp, 0) / nodes.length).toFixed(1)}°C</p>
        <p className="text-xs text-gray-500 mt-1">Normal: 25 - 30°C</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${((nodes.reduce((a,b) => a + b.temp, 0) / nodes.length) / 35) * 100}%` }}></div></div>
      </div>
      <div className="group bg-gradient-to-br from-amber-50/90 to-amber-100/90 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-2"><Eye className="text-amber-600" size={20} /><h3 className="font-semibold">Average Turbidity</h3></div>
        <p className="text-2xl font-bold mt-1">{(nodes.reduce((a,b) => a + b.turbidity, 0) / nodes.length).toFixed(0)} NTU</p>
        <p className="text-xs text-gray-500 mt-1">Ideal: {'<'} 20 NTU</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (nodes.reduce((a,b) => a + b.turbidity, 0) / nodes.length) / 60 * 100)}%` }}></div></div>
      </div>
    </div>
  );

  // Reusable Device Table Component
  const DeviceTable = ({ compact = false }) => {
    const displayNodes = compact ? nodes.slice(0, 5) : nodes;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100/70 dark:bg-gray-700/70">
            <tr>
              <th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Water Level (m)</th><th className="px-4 py-3 text-left">pH</th>
              <th className="px-4 py-3 text-left">Flow (L/s)</th><th className="px-4 py-3 text-left">Temp (°C)</th><th className="px-4 py-3 text-left">Turbidity (NTU)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
            {displayNodes.map(node => (
              <tr key={node.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 font-medium">#{node.id}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBgClass(node.status)}`}>{getStatusIcon(node.status)} {node.status}</span></td>
                <td className="px-4 py-3">{node.waterLevel}</td><td className="px-4 py-3">{node.pH}</td><td className="px-4 py-3">{node.flow}</td><td className="px-4 py-3">{node.temp}</td><td className="px-4 py-3">{node.turbidity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {compact && nodes.length > 5 && (
          <div className="text-center text-sm text-gray-500 py-2">+ {nodes.length - 5} more devices. Go to Reports for full list.</div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-emerald-50 via-white to-sky-50'}`}>
      {/* Animated background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/water-droplet.png")' }}></div>
      </div>
      
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl flex flex-col border-r border-gray-200/50 dark:border-gray-700/50`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg animate-pulse">
                <Waves className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t.title}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.subtitle}</p>
              </div>
            </div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:block transition-all">
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
              className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 group relative ${activePage === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-700/70'}`}
            >
              {activePage === item.id && <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"></div>}
              <span className={activePage === item.id ? 'text-emerald-500' : ''}>{item.icon}</span>
              {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-100/70 dark:hover:bg-gray-700/70 ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'}`}>
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            {!isSidebarCollapsed && <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setLanguage(language === 'si' ? 'en' : 'si')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-100/70 dark:hover:bg-gray-700/70 ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'}`}>
            <Languages size={18} />
            {!isSidebarCollapsed && <span className="text-sm">{language === 'si' ? 'English' : 'සිංහල'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
              <Clock size={14} /> {t.lastUpdated}: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMLData} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <RefreshCw size={18} className={isLoadingML ? 'animate-spin text-emerald-500' : ''} />
            </button>
            <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg">
              <Download size={16} /> {t.exportPDF}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Dashboard Page */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden h-48 shadow-xl">
                <img src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=1200&h=300&fit=crop" alt="Canal landscape" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 to-teal-900/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Globe size={28} /> Canal Watch Dashboard</h2>
                    <p className="text-sm opacity-90">Real-time monitoring & AI-powered insights</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                      <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{nodes.length}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl shadow-inner"><Radio className="text-emerald-600 dark:text-emerald-400" size={24} /></div>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {nodes.filter(n => n.status === 'Healthy').length} Healthy</span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {nodes.filter(n => n.status === 'Warning').length} Warning</span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {nodes.filter(n => n.status === 'Critical').length} Critical</span>
                  </div>
                </div>
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg Water Level</p>
                      <p className="text-3xl font-bold mt-1">{(nodes.reduce((a,b) => a + b.waterLevel, 0) / nodes.length).toFixed(1)}<span className="text-base font-normal text-gray-500">m</span></p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/30 dark:to-blue-800/30 rounded-xl shadow-inner"><Droplet className="text-sky-600 dark:text-sky-400" size={24} /></div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1"><ArrowUp size={12} className="text-emerald-500" /> Target: 1.2m - 1.5m</div>
                </div>
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Flow Rate</p>
                      <p className="text-3xl font-bold mt-1">{nodes.reduce((a,b) => a + b.flow, 0)}<span className="text-base font-normal text-gray-500"> L/s</span></p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-200 dark:from-teal-900/30 dark:to-cyan-800/30 rounded-xl shadow-inner"><Wind className="text-teal-600 dark:text-teal-400" size={24} /></div>
                  </div>
                </div>
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">System Health</p>
                      <p className="text-3xl font-bold mt-1">{mlData ? `${mlData.confidence}%` : '—'}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 rounded-xl shadow-inner"><Activity className="text-purple-600 dark:text-purple-400" size={24} /></div>
                  </div>
                </div>
              </div>

              {/* Map and Device List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2"><MapPin size={18} className="text-emerald-500" /> {t.mapView}</h2>
                    <div className="flex items-center gap-1 text-xs text-gray-400"><Waves size={14} /> Canal Path (Amber)</div>
                  </div>
                  <div className="h-96 w-full">
                    <MapContainer center={[8.1480, 80.1900]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url={tileLayers[mapTileLayer]} />
                      <Polyline positions={canalPath} color="#f59e0b" weight={5} opacity={0.8} />
                      {nodes.map(node => (
                        <Marker key={node.id} position={[node.lat, node.lng]} icon={createCustomIcon(node.status)} eventHandlers={{ click: () => setSelectedNode(node) }}>
                          <Popup><div className="text-center font-medium"><b>Node {node.id}</b><br/>{node.status}</div></Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50">
                    <h2 className="font-semibold flex items-center gap-2"><Server size={18} className="text-emerald-500" /> {t.deviceStatus}</h2>
                  </div>
                  <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50 max-h-96 overflow-y-auto custom-scroll">
                    {filteredNodes.map(node => (
                      <div key={node.id} onClick={() => setSelectedNode(node)} className={`p-4 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${selectedNode?.id === node.id ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-l-4 border-emerald-500' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(node.status)} animate-pulse`}></div>
                            <span className="font-medium">Node #{node.id}</span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBgClass(node.status)} flex items-center gap-1`}>{getStatusIcon(node.status)} {node.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1"><Droplet size={12} className="text-sky-500" />{node.waterLevel}m</div>
                          <div className="flex items-center gap-1"><Gauge size={12} className="text-teal-500" />{node.flow} L/s</div>
                          <div className="flex items-center gap-1"><Thermometer size={12} className="text-orange-500" />{node.temp}°C</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Node Details */}
              {selectedNode && (
                <div className="bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-5 transition-all duration-300 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2 text-lg"><Sparkles size={18} className="text-emerald-500" /> Node #{selectedNode.id} Telemetry</h2>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`font-semibold mt-1 flex items-center justify-center gap-1 ${selectedNode.status === 'Healthy' ? 'text-emerald-500' : selectedNode.status === 'Warning' ? 'text-amber-500' : 'text-rose-500'}`}>{getStatusIcon(selectedNode.status)} {selectedNode.status}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Water Level</p>
                      <p className="font-semibold text-lg">{selectedNode.waterLevel}m</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">pH</p>
                      <p className="font-semibold text-lg">{selectedNode.pH}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Flow</p>
                      <p className="font-semibold text-lg">{selectedNode.flow} L/s</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Temp</p>
                      <p className="font-semibold text-lg">{selectedNode.temp}°C</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Turbidity</p>
                      <p className="font-semibold text-lg">{selectedNode.turbidity} NTU</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Report Section */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-xl flex items-center gap-2"><FileText size={20} className="text-emerald-500" /> {t.quickReport}</h2>
                  <button onClick={() => setActivePage('reports')} className="text-emerald-500 text-sm hover:underline flex items-center gap-1">View Full Report <ChevronRight size={14} /></button>
                </div>
                <div className="space-y-5">
                  <WaterQualitySummary />
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Top Devices Summary</h3>
                    <DeviceTable compact={true} />
                  </div>
                  {mlData && (
                    <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/70 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                      <p className="text-sm"><span className="font-semibold">ML Insight:</span> {mlData.system_status} confidence {mlData.confidence}%</p>
                      <p className="text-xs text-gray-500 mt-1">Recommendation: {mlData.system_status === 'Healthy' ? 'All systems nominal' : mlData.system_status === 'Warning' ? 'Monitor nodes 3,7' : 'Immediate action nodes 5,9'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Page */}
          {activePage === 'analytics' && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden h-48 mb-2 shadow-xl">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop" alt="Data analytics" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-purple-900/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><BarChart3 size={28} /> Advanced Water Analytics</h2>
                    <p className="text-sm opacity-90">Predictive insights & trend analysis</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 text-center shadow-md">
                  <p className="text-xs text-gray-500">Avg CHI (5Y)</p>
                  <p className="text-xl font-bold">{(fiveYearData.reduce((a,b) => a + b.Yala_CHI + b.Maha_CHI, 0) / (fiveYearData.length * 2)).toFixed(0)}</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 text-center shadow-md">
                  <p className="text-xs text-gray-500">Peak Flow (Dec)</p>
                  <p className="text-xl font-bold">21 L/s</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 text-center shadow-md">
                  <p className="text-xs text-gray-500">Avg Rainfall</p>
                  <p className="text-xl font-bold">{Math.round(monthlyFlowData.reduce((a,b) => a + b.rainfall, 0) / 12)} mm</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 text-center shadow-md">
                  <p className="text-xs text-gray-500">Health Trend</p>
                  <p className="text-xl font-bold text-amber-500">Declining</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-5 hover:shadow-xl transition-all">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} className="text-emerald-500" /> {t.seasonalTrend}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={fiveYearData}>
                      <defs><linearGradient id="yala" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="maha" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="year" stroke="#888" /><YAxis stroke="#888" /><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} /><Legend />
                      <Area type="monotone" dataKey="Yala_CHI" stroke="#10b981" fill="url(#yala)" name="Yala CHI" />
                      <Area type="monotone" dataKey="Maha_CHI" stroke="#3b82f6" fill="url(#maha)" name="Maha CHI" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-5 hover:shadow-xl transition-all">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><CloudRain size={18} className="text-sky-500" /> {t.flowVsRainfall}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyFlowData}>
                      <XAxis dataKey="month" stroke="#888" /><YAxis yAxisId="left" stroke="#888" /><YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} /><Legend />
                      <Bar yAxisId="left" dataKey="flow" fill="#10b981" name="Flow (L/s)" radius={[4,4,0,0]} />
                      <Bar yAxisId="right" dataKey="rainfall" fill="#f59e0b" name="Rainfall (mm)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-5 hover:shadow-xl transition-all">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><Droplets size={18} className="text-blue-500" /> {t.waterQualityTrend}</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={waterQualityTrend}>
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis yAxisId="left" stroke="#888" />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="pH" stroke="#3b82f6" name="pH" strokeWidth={2} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#f59e0b" name="Turbidity (NTU)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-5 hover:shadow-xl transition-all">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><PieChart size={18} className="text-purple-500" /> {t.deviceDistribution}</h2>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={deviceDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {deviceDistributionData.map(item => (
                        <div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-sm">{item.name}: {item.value}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {mlData && (
                <div className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 dark:from-purple-900/30 dark:to-indigo-900/30 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-800/50 p-5 transition-all duration-300 hover:shadow-xl">
                  <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-purple-500" /> {t.mlInsights}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-sm transition-all hover:scale-105"><p className="text-sm text-gray-500">ML Model</p><p className="font-bold text-lg">Random Forest</p><p className="text-xs text-gray-400">Accuracy: {mlData.confidence}%</p></div>
                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-sm transition-all hover:scale-105"><p className="text-sm text-gray-500">7‑Day Forecast</p><p className={`font-bold text-lg ${mlData.system_status === 'Healthy' ? 'text-emerald-500' : mlData.system_status === 'Warning' ? 'text-amber-500' : 'text-rose-500'}`}>{mlData.system_status}</p><p className="text-xs text-gray-400">Confidence interval ±5%</p></div>
                    <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-sm transition-all hover:scale-105"><p className="text-sm text-gray-500">Recommendation</p><p className="font-bold">{mlData.system_status === 'Healthy' ? 'Routine monitoring' : mlData.system_status === 'Warning' ? 'Inspect nodes 3,7' : 'Emergency: nodes 5,9'}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Page */}
          {activePage === 'reports' && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden h-48 mb-2 shadow-xl">
                <img src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200&h=300&fit=crop" alt="Canal report header" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 flex flex-col items-center justify-center text-white">
                  <h2 className="text-3xl font-bold flex items-center gap-2"><FileText size={32} /> {t.detailedReport}</h2>
                  <p className="text-sm opacity-90">Complete system overview including device metrics, water quality, and ML forecasts</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Executive Summary
                  </h2>
                </div>
                <button
                  onClick={generateDetailedReport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md transition-all duration-200 font-medium"
                >
                  <FileSpreadsheet size={18} /> {t.exportDetailed}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-500">Total Devices</p><p className="text-3xl font-bold">{nodes.length}</p></div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><Server className="text-emerald-500" size={24} /></div>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs"><span className="flex items-center gap-1 text-emerald-500">● {nodes.filter(n => n.status === 'Healthy').length} Healthy</span><span className="flex items-center gap-1 text-amber-500">● {nodes.filter(n => n.status === 'Warning').length} Warning</span><span className="flex items-center gap-1 text-rose-500">● {nodes.filter(n => n.status === 'Critical').length} Critical</span></div>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-500">Avg Water Level</p><p className="text-3xl font-bold">{(nodes.reduce((a,b) => a + b.waterLevel, 0) / nodes.length).toFixed(1)}<span className="text-base">m</span></p></div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Droplet className="text-blue-500" size={24} /></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Target: 1.2 - 1.5m</div>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-500">Total Flow</p><p className="text-3xl font-bold">{nodes.reduce((a,b) => a + b.flow, 0)}<span className="text-base"> L/s</span></p></div>
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl"><Wind className="text-teal-500" size={24} /></div>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-500">System Health</p><p className="text-3xl font-bold">{mlData ? `${mlData.confidence}%` : '—'}</p></div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Activity className="text-purple-500" size={24} /></div>
                  </div>
                </div>
              </div>

              <WaterQualitySummary />

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-100/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                  <h3 className="font-semibold flex items-center gap-2"><Database size={18} className="text-emerald-500" /> All Devices Metrics</h3>
                </div>
                <DeviceTable compact={false} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mlData && (
                  <div className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-5 border border-purple-100/50 dark:border-purple-800/50 backdrop-blur-sm shadow-md">
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles size={18} className="text-purple-500" /> Machine Learning Insights</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Model:</span> Random Forest Classifier</p>
                      <p><span className="font-medium">Confidence:</span> {mlData.confidence}%</p>
                      <p><span className="font-medium">7‑Day Forecast:</span> <span className={`font-bold ${mlData.system_status === 'Healthy' ? 'text-emerald-500' : mlData.system_status === 'Warning' ? 'text-amber-500' : 'text-rose-500'}`}>{mlData.system_status}</span></p>
                      <p><span className="font-medium">Recommendation:</span> {mlData.system_status === 'Healthy' ? 'Routine monitoring only' : mlData.system_status === 'Warning' ? 'Inspect nodes 3 & 7' : 'Immediate action required at nodes 5 & 9'}</p>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-5 border border-emerald-100/50 dark:border-emerald-800/50 backdrop-blur-sm shadow-md">
                  <h3 className="font-semibold flex items-center gap-2 mb-3"><TrendingUp size={18} className="text-emerald-500" /> Seasonal Trend Summary (CHI Index)</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {fiveYearData.slice(-2).map(yearData => (
                      <div key={yearData.year} className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg shadow-sm">
                        <p className="font-medium">{yearData.year}</p>
                        <p>Yala: {yearData.Yala_CHI}</p>
                        <p>Maha: {yearData.Maha_CHI}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">*CHI indicates overall canal health index (higher is better)</p>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE - FULLY ENHANCED */}
          {activePage === 'settings' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-32 shadow-xl">
                <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=200&fit=crop" alt="Settings" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-800/70 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={28} /> System Preferences</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Display Settings */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-100/50 dark:border-gray-700/50">
                    <h3 className="font-semibold flex items-center gap-2"><Monitor size={18} className="text-emerald-500" /> Display & Appearance</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Sun size={16} /> <span className="font-medium">Dark Mode</span></div>
                      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full transition-all ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Languages size={16} /> <span className="font-medium">Language</span></div>
                      <button onClick={() => setLanguage(language === 'si' ? 'en' : 'si')} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">
                        {language === 'si' ? 'සිංහල' : 'English'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Palette size={16} /> <span className="font-medium">Chart Theme</span></div>
                      <select value={chartTheme} onChange={(e) => setChartTheme(e.target.value)} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">
                        <option value="default">Default</option>
                        <option value="ocean">Ocean</option>
                        <option value="forest">Forest</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Layers size={16} /> <span className="font-medium">Map Tile Layer</span></div>
                      <select value={mapTileLayer} onChange={(e) => setMapTileLayer(e.target.value)} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">
                        <option value="standard">Standard</option>
                        <option value="satellite">Satellite</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Activity size={16} /> <span className="font-medium">Enable Animations</span></div>
                      <button onClick={() => setEnableAnimations(!enableAnimations)} className={`w-12 h-6 rounded-full transition-all ${enableAnimations ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${enableAnimations ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications & Alerts */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-100/50 dark:border-gray-700/50">
                    <h3 className="font-semibold flex items-center gap-2"><Bell size={18} className="text-blue-500" /> Notifications & Alerts</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Bell size={16} /> <span className="font-medium">Push Notifications</span></div>
                      <button onClick={() => setNotificationEnabled(!notificationEnabled)} className={`w-12 h-6 rounded-full transition-all ${notificationEnabled ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${notificationEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><AlertTriangle size={16} /> <span className="font-medium">Critical Alerts Only</span></div>
                      <button onClick={() => setCriticalAlertsOnly(!criticalAlertsOnly)} className={`w-12 h-6 rounded-full transition-all ${criticalAlertsOnly ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${criticalAlertsOnly ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Mail size={16} /> <span className="font-medium">Email Reports</span></div>
                      <button onClick={() => setEmailReports(!emailReports)} className={`w-12 h-6 rounded-full transition-all ${emailReports ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${emailReports ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><BellRing size={16} /> <span className="font-medium">Alert Sound</span></div>
                      <select className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">
                        <option>Default</option>
                        <option>Urgent</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Data & System */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-100/50 dark:border-gray-700/50">
                    <h3 className="font-semibold flex items-center gap-2"><DbIcon size={18} className="text-purple-500" /> Data & System</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><RefreshCw size={16} /> <span className="font-medium">Auto-refresh</span></div>
                      <button onClick={() => setAutoRefresh(!autoRefresh)} className={`w-12 h-6 rounded-full transition-all ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-300'} shadow-inner`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </button>
                    </div>
                    {autoRefresh && (
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                        <div className="flex items-center gap-3"><Clock size={16} /> <span className="font-medium">Refresh Interval (sec)</span></div>
                        <input type="number" min="10" max="300" value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="w-20 px-2 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm" />
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><HardDrive size={16} /> <span className="font-medium">Data Retention (days)</span></div>
                      <input type="number" min="30" max="365" value={dataRetention} onChange={(e) => setDataRetention(Number(e.target.value))} className="w-20 px-2 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Cloud size={16} /> <span className="font-medium">Backup Frequency</span></div>
                      <select className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy & About */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-100/50 dark:border-gray-700/50">
                    <h3 className="font-semibold flex items-center gap-2"><Shield size={18} className="text-indigo-500" /> Privacy & About</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Lock size={16} /> <span className="font-medium">Data Privacy Policy</span></div>
                      <button className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">View</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3"><Users size={16} /> <span className="font-medium">Manage Team Access</span></div>
                      <button className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm shadow-sm">Manage</button>
                    </div>
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl text-center">
                      <p className="text-xs text-gray-500">Canal Watch v2.0 | IoT & AI Platform</p>
                      <p className="text-xs text-gray-400 mt-1">© 2025 All rights reserved</p>
                      <p className="text-xs text-gray-400 mt-1">Data sources: IoT sensors + ML predictions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200/50 dark:border-rose-800/50 p-5">
                <h3 className="font-semibold text-rose-600 flex items-center gap-2 mb-3"><AlertTriangle size={18} /> Danger Zone</h3>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div><p className="font-medium">Reset All Settings</p><p className="text-xs text-gray-500">This will reset all preferences to default values.</p></div>
                  <button onClick={resetAllSettings} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md transition-all">Reset All</button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-rose-200/50">
                  <div><p className="font-medium">Clear All Data</p><p className="text-xs text-gray-500">Permanently delete all historical data and logs.</p></div>
                  <button className="px-4 py-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg shadow-md transition-all">Clear Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Custom scrollbar and animations */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .dark .custom-scroll::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scroll::-webkit-scrollbar-thumb {
          background: #059669;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}