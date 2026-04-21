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
import { KwakuInsight } from '../components/KwakuInsight';
import { useParams } from 'react-router-dom';

const HealthMetric = ({ label, value, score, icon: Icon }: any) => (
  <div className="prism-card p-5 flex items-center gap-4">
    <div className={cn(
      "p-3 rounded-xl",
      score > 90 ? "bg-emerald-50 text-emerald-600" : score > 70 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-bold text-foreground">{value}</h4>
        <span className={cn(
          "text-xs font-bold",
          score > 90 ? "text-emerald-600" : score > 70 ? "text-amber-600" : "text-rose-600"
        )}>{score}%</span>
      </div>
    </div>
  </div>
);

const ColumnItem = ({ name, type, health, description }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group border-b border-border last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
        {type.substring(0, 3)}
      </div>
      <div>
        <h5 className="font-bold text-foreground text-sm group-hover:text-accent transition-colors">{name}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health}%` }}></div>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{health}%</span>
      </div>
      <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Database className="w-3 h-3" />
            Datasets
            <ChevronRight className="w-3 h-3" />
            <span className="text-accent">Sales_Data_v2</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Sales_Data_v2</h2>
          <div className="flex items-center gap-3">
            <Badge variant="success">Physical</Badge>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-muted border border-background shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Sarah Chen</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Updated 2h ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-background border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-background border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
          <button className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-accent/20">
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
        <div className="border-b border-border bg-muted/30 px-6 flex items-center justify-between">
          <div className="flex">
            {['columns', 'metrics', 'quality', 'sample'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search columns..." 
                className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <button className="p-1.5 text-muted-foreground hover:text-foreground">
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
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">No metrics defined</h4>
                <p className="text-muted-foreground text-sm">Create calculated metrics to use in your charts.</p>
              </div>
              <button className="btn-primary px-8">
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
