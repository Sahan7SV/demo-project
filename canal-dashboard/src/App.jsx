import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Server, CheckCircle, Download, Info, MapPin, LayoutDashboard, Cpu, Database, Activity, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// සිතියමේ අයිකන නිවැරදිව පෙන්වීමට
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// රතු පාට ඇළ මාර්ගය ඇඳීම සඳහා ඛණ්ඩාංක
const canalPath = [
  [8.1400, 80.2200], [8.1420, 80.2150], [8.1410, 80.2100], [8.1450, 80.2050],
  [8.1480, 80.1980], [8.1500, 80.1900], [8.1480, 80.1850], [8.1520, 80.1780],
  [8.1550, 80.1700], [8.1600, 80.1600],
];

// ඇළ මාර්ගය (රතු ඉර) දිගේ පිහිටුවා ඇති IoT උපාංග 10
const nodes = [
  { id: 1, lat: 8.1400, lng: 80.2200, status: 'Healthy', waterLevel: '1.4m', pH: 7.0, flow: '18 L/s' },
  { id: 2, lat: 8.1415, lng: 80.2125, status: 'Healthy', waterLevel: '1.3m', pH: 7.1, flow: '17 L/s' },
  { id: 3, lat: 8.1430, lng: 80.2075, status: 'Warning', waterLevel: '0.9m', pH: 6.5, flow: '12 L/s' },
  { id: 4, lat: 8.1465, lng: 80.2015, status: 'Healthy', waterLevel: '1.2m', pH: 7.0, flow: '15 L/s' },
  { id: 5, lat: 8.1490, lng: 80.1940, status: 'Critical', waterLevel: '0.4m', pH: 5.8, flow: '5 L/s' },
  { id: 6, lat: 8.1490, lng: 80.1875, status: 'Healthy', waterLevel: '1.1m', pH: 7.2, flow: '14 L/s' },
  { id: 7, lat: 8.1500, lng: 80.1815, status: 'Warning', waterLevel: '0.8m', pH: 7.6, flow: '10 L/s' },
  { id: 8, lat: 8.1535, lng: 80.1740, status: 'Healthy', waterLevel: '1.2m', pH: 6.9, flow: '15 L/s' },
  { id: 9, lat: 8.1575, lng: 80.1650, status: 'Critical', waterLevel: '0.3m', pH: 8.2, flow: '3 L/s' },
  { id: 10, lat: 8.1600, lng: 80.1600, status: 'Healthy', waterLevel: '1.3m', pH: 7.1, flow: '16 L/s' },
];

const fiveYearData = [
  { year: '2021', යල_CHI: 82, මහ_CHI: 88 },
  { year: '2022', යල_CHI: 78, මහ_CHI: 85 },
  { year: '2023', යල_CHI: 75, මහ_CHI: 80 },
  { year: '2024', යල_CHI: 65, මහ_CHI: 72 },
  { year: '2025', යල_CHI: 60, මහ_CHI: 68 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Python Backend එකෙන් දත්ත ගබඩා කිරීමට State
  const [mlData, setMlData] = useState(null);
  const [isLoadingML, setIsLoadingML] = useState(true);

  // Component එක Load වෙනකොටම Python Backend එකට කතා කරලා දත්ත ගැනීම
  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = async () => {
    setIsLoadingML(true);
    try {
      // අපේ Python සර්වර් එකෙන් දත්ත ඉල්ලීම
      const response = await fetch('http://13.51.70.185:5000/api/ml-health');
      if (response.ok) {
        const data = await response.json();
        setMlData(data); // දත්ත ලැබුණාම state එකට දාගන්නවා
      }
    } catch (error) {
      console.error("ML Backend එකට සම්බන්ධ වීමේ ගැටලුවක්:", error);
    }
    setIsLoadingML(false);
  };

  const generateProfessionalPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Irrigation Canal Health Monitoring System', 15, 18);
      doc.setFontSize(10);
      doc.text('Official Geospatial & ML Analytics Report', 15, 25);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 15, 40);
      doc.text(`Location: Rajanganaya Main Canal Network`, 15, 46);
      
      // නියම ML දත්ත PDF එකට ඇතුළත් කිරීම
      const mlStatusText = mlData ? `${mlData.system_status.toUpperCase()} (${mlData.confidence}% Confidence)` : 'UNKNOWN';
      doc.text(`System ML Status: ${mlStatusText}`, 15, 52);

      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text('1. Live IoT Node Status (Edge Devices)', 15, 65);
      
      const nodeColumns = ["Node ID", "Status", "Water Level", "pH Value", "Flow Rate"];
      const nodeRows = nodes.map(n => [`Node ${n.id}`, n.status, n.waterLevel, n.pH.toString(), n.flow]);
      
      autoTable(doc, {
        head: [nodeColumns],
        body: nodeRows,
        startY: 70,
        theme: 'striped',
        headStyles: { fillColor: [52, 73, 94] }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text('2. 5-Year Seasonal Health Trend (CHI %)', 15, finalY);

      const trendColumns = ["Year", "Yala Season (CHI %)", "Maha Season (CHI %)"];
      const trendRows = fiveYearData.map(d => [d.year, d.යල_CHI, d.මහ_CHI]);

      autoTable(doc, {
        head: [trendColumns],
        body: trendRows,
        startY: finalY + 5,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] }
      });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('This is an auto-generated report from the IoT Edge Monitoring Platform.', 15, 285);

      doc.save('Canal_Research_Report.pdf');
    } catch (error) {
      console.error("PDF Error: ", error);
      alert("PDF වාර්තාව සෑදීමේදී දෝෂයක් මතු විය.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">කෘෂිකාර්මික නිරීක්ෂණ පද්ධතිය</h1>
          <p className="text-gray-500 font-medium">IoT Edge Data & ML Infrastructure Monitor</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard size={18} /> පුවරුව (Dashboard)
          </button>
          <button onClick={() => setActiveTab('ml')} className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${activeTab === 'ml' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Activity size={18} /> ML විශ්ලේෂණ
          </button>
          <button onClick={generateProfessionalPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition shadow-md font-semibold md:ml-4">
            <Download size={18} /> වාර්තාව (PDF)
          </button>
        </div>
      </header>

      {/* --- පුවරුව (Dashboard) --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 bg-white p-4 rounded-xl shadow-sm flex flex-col border border-gray-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800">
              <MapPin className="text-blue-500" /> සැබෑ භූගෝලීය සිතියම (රාජාංගනය ප්‍රධාන ඇළ)
            </h2>
            <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-300 z-0">
              <MapContainer center={[8.1480, 80.1900]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <Polyline positions={canalPath} color="red" weight={4} />
                {nodes.map((node) => (
                  <Marker key={node.id} position={[node.lat, node.lng]} eventHandlers={{ click: () => setSelectedNode(node) }}>
                    <Popup>
                      <div className="text-center">
                        <strong>Node #{node.id}</strong> <br/> 
                        <span className={`px-2 py-0.5 rounded text-white text-xs mt-1 inline-block ${node.status === 'Healthy' ? 'bg-green-500' : node.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                          {node.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800">
                <Info className="text-blue-500" /> සජීවී දත්ත (Live Data)
              </h2>
              {selectedNode ? (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-600">උපාංගය</span><span className="font-bold text-blue-700">#{selectedNode.id}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-600">තත්ත්වය</span>
                    <span className={`font-bold px-3 py-1 rounded text-white text-xs ${selectedNode.status === 'Healthy' ? 'bg-green-500' : selectedNode.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-600">ජල මට්ටම</span><span className="font-bold">{selectedNode.waterLevel}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-600">pH අගය</span><span className="font-bold">{selectedNode.pH}</span></div>
                  <div className="flex justify-between pb-2"><span className="text-gray-600">ප්‍රවාහය</span><span className="font-bold">{selectedNode.flow}</span></div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12 mt-4 border-2 border-dashed border-gray-200 rounded-lg">සිතියමේ ඇති උපාංගයක් මත click කරන්න</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[300px] flex flex-col">
              <h2 className="text-base font-bold mb-4 text-gray-800">කන්න අනුව සෞඛ්‍ය වෙනස්වීම (වසර 5ක දත්ත)</h2>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fiveYearData}>
                    <defs>
                      <linearGradient id="colorYala" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMaha" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#6b7280" textAnchor="end" />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <Tooltip contentStyle={{borderRadius: '8px'}} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                    <Area type="monotone" dataKey="යල_CHI" stroke="#3b82f6" fillOpacity={1} fill="url(#colorYala)" name="යල (CHI %)" />
                    <Area type="monotone" dataKey="මහ_CHI" stroke="#10b981" fillOpacity={1} fill="url(#colorMaha)" name="මහ (CHI %)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ML විශ්ලේෂණ පිටුව --- */}
      {activeTab === 'ml' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Server className="text-purple-600" size={28} /> Machine Learning Infrastructure Health
            </h2>
            <button onClick={fetchMLData} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition">
              Refresh Data
            </button>
          </div>
          
          {isLoadingML ? (
            <div className="flex justify-center items-center h-64 text-gray-500 font-medium">Python සර්වර් එකෙන් දත්ත ලබා ගනිමින් පවතී...</div>
          ) : mlData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-gray-500 font-semibold mb-2">Model Type</h3>
                  <p className="text-xl font-bold text-gray-800">Random Forest Classifier</p>
                </div>
                <div className={`p-6 rounded-xl border ${mlData.system_status === 'Healthy' ? 'bg-green-50 border-green-200' : mlData.system_status === 'Warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                  <h3 className="text-gray-500 font-semibold mb-2">Current System Status</h3>
                  <p className={`text-xl font-bold flex items-center gap-2 ${mlData.system_status === 'Healthy' ? 'text-green-600' : mlData.system_status === 'Warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {mlData.system_status === 'Healthy' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>} 
                    {mlData.system_status.toUpperCase()}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-gray-500 font-semibold mb-2">Confidence Score</h3>
                  <p className="text-3xl font-black text-purple-600">{mlData.confidence}%</p>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4 text-gray-700">Real-time Parameters (Live from Python Backend)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-bold flex items-center gap-2 mb-4 text-blue-700"><Cpu size={18}/> Server Metrics (AWS EC2)</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm"><span className="text-gray-600">CPU Usage</span><span className="font-bold">{mlData.metrics.cpu}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${mlData.metrics.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${mlData.metrics.cpu}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm"><span className="text-gray-600">Memory Usage</span><span className="font-bold">{mlData.metrics.memory}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${mlData.metrics.memory > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${mlData.metrics.memory}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm"><span className="text-gray-600">Disk I/O</span><span className="font-bold">{mlData.metrics.disk} MB/s</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(mlData.metrics.disk, 100)}%`}}></div></div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="font-bold flex items-center gap-2 mb-4 text-orange-600"><Database size={18}/> Database Metrics (MySQL)</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Query Response Time</span><span className="font-bold">{mlData.metrics.query_time} ms</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Active Connections</span><span className="font-bold">{mlData.metrics.connections}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Slow Queries</span><span className={`font-bold ${mlData.metrics.slow_queries === 0 ? 'text-green-600' : 'text-red-600'}`}>{mlData.metrics.slow_queries}</span></div>
                    <div className="flex justify-between pb-2"><span className="text-gray-600">Error Count</span><span className={`font-bold ${mlData.metrics.errors === 0 ? 'text-green-600' : 'text-red-600'}`}>{mlData.metrics.errors}</span></div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center text-red-500 font-medium py-10">Python Backend එකට සම්බන්ධ වීමට නොහැක. Backend එක run වෙනවාදැයි පරීක්ෂා කරන්න.</div>
          )}
        </div>
      )}

    </div>
  );
}