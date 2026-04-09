import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Table as TableIcon, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Users, 
  ChevronRight,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';

const HealthMetric = ({ label, value, score, icon: Icon }: any) => (
  <div className="prism-card p-5 flex items-center gap-4">
    <div className={cn(
      "p-3 rounded-xl",
      score > 90 ? "bg-emerald-50 text-emerald-600" : score > 70 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-bold text-slate-900">{value}</h4>
        <span className={cn(
          "text-xs font-bold",
          score > 90 ? "text-emerald-600" : score > 70 ? "text-amber-600" : "text-rose-600"
        )}>{score}%</span>
      </div>
    </div>
  </div>
);

const ColumnItem = ({ name, type, health, description }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
        {type.substring(0, 3)}
      </div>
      <div>
        <h5 className="font-bold text-slate-900 text-sm group-hover:text-prism-600 transition-colors">{name}</h5>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health}%` }}></div>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{health}%</span>
      </div>
      <button className="p-2 text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="w-4 h-4" />
      </button>
    </div>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export const Datasets = () => {
  const [activeTab, setActiveTab] = React.useState('columns');

  const columns = [
    { name: "order_id", type: "Integer", health: 100, description: "Unique identifier for each order" },
    { name: "customer_id", type: "Integer", health: 98, description: "Reference to the customer table" },
    { name: "order_date", type: "Timestamp", health: 100, description: "Date and time when order was placed" },
    { name: "revenue", type: "Float", health: 95, description: "Total revenue generated from the order" },
    { name: "status", type: "String", health: 88, description: "Current status of the order (Pending, Shipped, etc.)" },
    { name: "region", type: "String", health: 100, description: "Geographic region of the order" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Database className="w-3 h-3" />
            Datasets
            <ChevronRight className="w-3 h-3" />
            <span className="text-prism-600">Sales_Data_v2</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sales_Data_v2</h2>
          <div className="flex items-center gap-3">
            <Badge variant="success">Physical</Badge>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 border border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Sarah Chen</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Updated 2h ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-prism-600 text-white rounded-xl font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95">
            <ArrowUpRight className="w-4 h-4" />
            Explore Data
          </button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthMetric label="Data Freshness" value="Up to date" score={100} icon={Clock} />
        <HealthMetric label="Schema Health" value="Healthy" score={94} icon={ShieldCheck} />
        <HealthMetric label="Quality Score" value="High" score={98} icon={CheckCircle2} />
      </div>

      {/* Main Content Tabs */}
      <div className="prism-card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 flex items-center justify-between">
          <div className="flex">
            {['columns', 'metrics', 'quality', 'sample'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-prism-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-prism-600" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search columns..." 
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-prism-500/20 transition-all"
              />
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-900">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-2">
          {activeTab === 'columns' && (
            <div className="divide-y divide-slate-100">
              {columns.map((col, i) => (
                <ColumnItem key={i} {...col} />
              ))}
            </div>
          )}
          {activeTab === 'metrics' && (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">No metrics defined</h4>
                <p className="text-slate-500 text-sm">Create calculated metrics to use in your charts.</p>
              </div>
              <button className="px-6 py-2 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all">
                Add Metric
              </button>
            </div>
          )}
          {activeTab === 'quality' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h5 className="font-bold text-emerald-900 text-sm">No Null Values in order_id</h5>
                    <p className="text-xs text-emerald-700">Passed 2h ago • 1.2M rows checked</p>
                  </div>
                </div>
                <Badge variant="success">Passed</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h5 className="font-bold text-amber-900 text-sm">Revenue Range Check</h5>
                    <p className="text-xs text-amber-700">Warning: 12 values outside expected range (0 - 1M)</p>
                  </div>
                </div>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
