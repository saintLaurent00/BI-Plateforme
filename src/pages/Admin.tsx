import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Settings, 
  Database, 
  Terminal, 
  Lock, 
  Key, 
  Clock, 
  MoreVertical, 
  Search, 
  Plus, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  Filter,
  Users2,
  ShieldAlert,
  Download
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

const AdminSidebarItem = ({ label, icon: Icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
    active ? "bg-prism-50 text-prism-600 font-bold" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  )}>
    <Icon className={cn("w-4 h-4", active ? "text-prism-600" : "text-slate-400 group-hover:text-slate-900")} />
    <span className="text-sm">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
  </button>
);

const UserRow = ({ name, email, role, status, lastActive, onEdit, onDelete }: any) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
        </div>
        <div>
          <h5 className="font-bold text-slate-900 text-sm">{name}</h5>
          <div className="flex items-center gap-1 text-slate-400">
            <Mail className="w-3 h-3" />
            <span className="text-xs">{email}</span>
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <Badge variant={role === 'Admin' ? 'info' : 'neutral'}>{role}</Badge>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", status === 'Active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")}></div>
        <span className="text-xs font-bold text-slate-700">{status}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs text-slate-500 font-medium">{lastActive}</span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit({ name, email, role, status })}
          className="p-2 text-slate-400 hover:text-prism-600 rounded-lg hover:bg-prism-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete({ name, email })}
          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export const Admin = () => {
  const [activeSection, setActiveSection] = React.useState<'users' | 'groups' | 'roles' | 'rls' | 'sessions' | 'audit' | 'sources' | 'security' | 'settings'>('users');
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = React.useState(false);
  const [newDatabase, setNewDatabase] = React.useState({ name: '', engine: 'PostgreSQL', host: '', port: '', database: '', username: '', password: '' });
  const [newUser, setNewUser] = React.useState({ name: '', email: '', role: 'Viewer' });
  const [newRole, setNewRole] = React.useState({ name: '', description: '', permissions: [] });
  const [newGroup, setNewGroup] = React.useState({ name: '', description: '', members: 0 });

  const handleConnectDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Connecting database:', newDatabase);
    setIsDatabaseModalOpen(false);
    setNewDatabase({ name: '', engine: 'PostgreSQL', host: '', port: '', database: '', username: '', password: '' });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inviting user:', newUser);
    setIsInviteModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Viewer' });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const users = [
    { name: "Sarah Chen", email: "sarah.chen@prism.io", role: "Admin", status: "Active", lastActive: "2m ago" },
    { name: "Mike Ross", email: "mike.ross@prism.io", role: "Editor", status: "Active", lastActive: "15m ago" },
    { name: "Alex Kim", email: "alex.kim@prism.io", role: "Viewer", status: "Inactive", lastActive: "2d ago" },
    { name: "Emma Wilson", email: "emma.wilson@prism.io", role: "Editor", status: "Active", lastActive: "1h ago" },
    { name: "John Doe", email: "john.doe@prism.io", role: "Viewer", status: "Active", lastActive: "5m ago" },
    { name: "Laurent O.", email: "laurent.o@prism.io", role: "Admin", status: "Active", lastActive: "Now" },
  ];

  const roles = [
    { name: "Admin", description: "Full system access and management", permissions: ["All"], users: 12 },
    { name: "Editor", description: "Can create and edit dashboards/charts", permissions: ["Read", "Write", "Delete"], users: 45 },
    { name: "Viewer", description: "Read-only access to dashboards", permissions: ["Read"], users: 1227 },
  ];

  const groups = [
    { name: "Marketing", description: "Marketing team dashboards and data", members: 24, created: "2023-10-12" },
    { name: "Engineering", description: "Core engineering metrics and logs", members: 56, created: "2023-09-05" },
    { name: "Executive", description: "High-level KPI dashboards", members: 8, created: "2023-11-20" },
  ];

  return (
    <div className="flex h-full">
      {/* Admin Sub-Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 space-y-8 hidden xl:block overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Governance</p>
          <AdminSidebarItem label="Users" icon={Users} active={activeSection === 'users'} onClick={() => setActiveSection('users')} />
          <AdminSidebarItem label="Groups" icon={Users2} active={activeSection === 'groups'} onClick={() => setActiveSection('groups')} />
          <AdminSidebarItem label="Roles & Permissions" icon={ShieldCheck} active={activeSection === 'roles'} onClick={() => setActiveSection('roles')} />
          <AdminSidebarItem label="Row Level Security" icon={Lock} active={activeSection === 'rls'} onClick={() => setActiveSection('rls')} />
          <AdminSidebarItem label="Active Sessions" icon={Activity} active={activeSection === 'sessions'} onClick={() => setActiveSection('sessions')} />
          <AdminSidebarItem label="Audit Logs" icon={Terminal} active={activeSection === 'audit'} onClick={() => setActiveSection('audit')} />
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System</p>
          <AdminSidebarItem label="Data Sources" icon={Database} active={activeSection === 'sources'} onClick={() => setActiveSection('sources')} />
          <AdminSidebarItem label="Security" icon={Lock} active={activeSection === 'security'} onClick={() => setActiveSection('security')} />
          <AdminSidebarItem label="General Settings" icon={Settings} active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {activeSection === 'users' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
                <p className="text-slate-500 text-sm">Manage users, roles, and their access permissions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-prism-500/10 focus:border-prism-500 transition-all shadow-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Invite User
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="prism-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
                  <h4 className="text-2xl font-bold text-slate-900">1,284</h4>
                </div>
              </div>
              <div className="prism-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
                  <h4 className="text-2xl font-bold text-slate-900">42</h4>
                </div>
              </div>
              <div className="prism-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Invites</p>
                  <h4 className="text-2xl font-bold text-slate-900">18</h4>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="prism-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Active</th>
                    <th className="px-6 py-4 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user, i) => (
                    <UserRow 
                      key={i} 
                      {...user} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Showing 6 of 1,284 users</p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">Next</button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === 'roles' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h2>
                <p className="text-slate-500 text-sm">Define access levels and system permissions</p>
              </div>
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role, i) => (
                <div key={i} className="prism-card p-6 space-y-4 group hover:border-prism-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-prism-50 rounded-xl flex items-center justify-center text-prism-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{role.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p, j) => (
                      <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{p}</span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{role.users} Users assigned</span>
                    <button className="text-xs font-bold text-prism-600 hover:text-prism-700">Edit Permissions</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === 'groups' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Strategic Groups</h2>
                <p className="text-slate-500 text-sm">Organize users into high-performance teams and departments</p>
              </div>
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            </div>

            <div className="prism-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic Focus</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Force Size</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Established</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((group, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                            <Users2 className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm tracking-tight">{group.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-slate-500 font-medium">{group.description}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="neutral" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{group.members} Members</Badge>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-slate-400 font-medium">{group.created}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeSection === 'rls' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Row Level Security</h2>
                <p className="text-slate-500 text-sm">Define granular data access policies based on user attributes</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95">
                <Plus className="w-4 h-4" />
                New Policy
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { table: 'SALES_DATA', policy: 'Region Filter', clause: 'region = {{ user.region }}', status: 'Active', description: 'Restricts sales data to the user\'s assigned geographical region.' },
                { table: 'HR_RECORDS', policy: 'Department Isolation', clause: 'dept_id = {{ user.dept_id }}', status: 'Active', description: 'Ensures HR records are only visible to members of the same department.' },
                { table: 'FINANCIALS', policy: 'Managerial Override', clause: 'clearance_level >= 5', status: 'Draft', description: 'Restricts sensitive financial data to users with high clearance levels.' },
              ].map((rls, i) => (
                <div key={i} className="prism-card p-8 flex items-center justify-between group hover:border-prism-200 transition-all duration-500">
                  <div className="flex items-center gap-8">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-prism-600 group-hover:text-white transition-all duration-500">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-slate-900 tracking-tight">{rls.policy}</h4>
                        <Badge variant={rls.status === 'Active' ? 'success' : 'neutral'} className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">{rls.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 mb-4">{rls.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{rls.table}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-slate-300" />
                          <code className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-prism-600 font-mono font-bold">{rls.clause}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'sessions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Active Sessions</h2>
                <p className="text-slate-500 text-sm">Monitor and manage real-time user activity</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all active:scale-95">
                Terminate All
              </button>
            </div>

            <div className="prism-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Device / IP</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Started</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Laurent O.', email: 'laurent.o@prism.io', device: 'Chrome on macOS', ip: '192.168.1.1', location: 'Paris, FR', started: '2m ago' },
                    { name: 'Sarah Chen', email: 'sarah.chen@prism.io', device: 'Safari on iPhone', ip: '172.16.0.45', location: 'San Francisco, US', started: '15m ago' },
                    { name: 'Mike Ross', email: 'mike.ross@prism.io', device: 'Firefox on Windows', ip: '10.0.0.12', location: 'New York, US', started: '1h ago' },
                  ].map((session, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.name}`} alt={session.name} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm tracking-tight">{session.name}</p>
                            <p className="text-xs text-slate-400">{session.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">{session.device}</p>
                          <p className="text-[10px] font-mono text-slate-400">{session.ip}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-slate-500 font-medium">{session.location}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-slate-400 font-medium">{session.started}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeSection === 'audit' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Audit Logs</h2>
                <p className="text-slate-500 text-sm">Immutable record of all strategic platform operations</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="prism-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search audit logs..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-prism-500 transition-all" />
                </div>
                <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none">
                  <option>All Actions</option>
                  <option>Security</option>
                  <option>Data Access</option>
                  <option>User Management</option>
                </select>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { time: '2026-04-09 15:42:12', user: 'Laurent O.', action: 'LOGIN_SUCCESS', target: 'System', status: 'Success' },
                    { time: '2026-04-09 14:15:05', user: 'Sarah Chen', action: 'RLS_POLICY_UPDATE', target: 'SALES_DATA', status: 'Success' },
                    { time: '2026-04-09 13:02:44', user: 'Mike Ross', action: 'QUERY_EXECUTION', target: 'FINANCIALS', status: 'Success' },
                    { time: '2026-04-09 12:55:10', user: 'Unknown', action: 'LOGIN_FAILURE', target: 'System', status: 'Failed' },
                    { time: '2026-04-09 11:30:22', user: 'Laurent O.', action: 'USER_INVITE', target: 'alex.kim@prism.io', status: 'Success' },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                            {log.user.substring(0, 1)}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-[10px] font-black text-prism-600 bg-prism-50 px-2 py-0.5 rounded uppercase tracking-wider">{log.action}</code>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-slate-500 font-medium">{log.target}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant={log.status === 'Success' ? 'success' : 'error'} className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page 1 of 124</p>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled><ChevronRight className="w-4 h-4 rotate-180" /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-900"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'sources' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Data Sources</h2>
                <p className="text-slate-500 text-sm">Manage database connections and external integrations</p>
              </div>
              <button 
                onClick={() => setIsDatabaseModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-prism-600 text-white rounded-xl text-sm font-bold hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Connect Database
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Production Analytics', engine: 'PostgreSQL', host: 'db.prod.prism.io', status: 'Connected', health: 100 },
                { name: 'Customer Data Lake', engine: 'BigQuery', host: 'google-cloud-project-id', status: 'Connected', health: 98 },
                { name: 'Legacy CRM', engine: 'MySQL', host: '10.0.4.12', status: 'Disconnected', health: 0 },
                { name: 'Local SQLite', engine: 'SQLite (WASM)', host: 'In-browser', status: 'Connected', health: 100 },
              ].map((db, i) => (
                <div key={i} className="prism-card p-8 group hover:border-prism-200 transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-prism-600 group-hover:text-white transition-all duration-500">
                      <Database className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={db.status === 'Connected' ? 'success' : 'error'} className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">{db.status}</Badge>
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 tracking-tight">{db.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{db.host}</p>
                    </div>
                    <div className="flex items-center justify-between py-4 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engine</p>
                        <p className="text-xs font-bold text-slate-700">{db.engine}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Latency</p>
                        <p className="text-xs font-bold text-slate-700">{db.status === 'Connected' ? '24ms' : '--'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Health: {db.health}%</span>
                      </div>
                      <button className="text-[10px] font-black text-prism-600 uppercase tracking-widest hover:text-prism-700 transition-colors">Test Connection</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'security' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Security Protocol</h2>
              <p className="text-slate-500 text-sm">Advanced security controls and compliance monitoring</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="prism-card p-8 space-y-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Security Policies</h4>
                  <div className="space-y-4">
                    {[
                      { title: 'IP Whitelisting', desc: 'Restrict administrative access to corporate VPN ranges.', status: 'Enabled', icon: ShieldAlert },
                      { title: 'Data Masking', desc: 'Automatically mask PII in query results for non-admin users.', status: 'Enabled', icon: Lock },
                      { title: 'API Token Expiry', desc: 'Enforce 30-day rotation for all service account tokens.', status: 'Disabled', icon: Key },
                    ].map((policy, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                            <policy.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{policy.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{policy.desc}</p>
                          </div>
                        </div>
                        <Badge variant={policy.status === 'Enabled' ? 'success' : 'neutral'}>{policy.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="prism-card p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Security Events</h4>
                    <button className="text-[10px] font-black text-prism-600 uppercase tracking-widest">View All Logs</button>
                  </div>
                  <div className="space-y-6">
                    {[
                      { event: 'Failed Login Attempt', user: 'Unknown (192.168.1.45)', time: '2m ago', severity: 'High' },
                      { event: 'RLS Policy Modified', user: 'Sarah Chen', time: '1h ago', severity: 'Medium' },
                      { event: 'New Admin Invited', user: 'Laurent O.', time: '3h ago', severity: 'Low' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.severity === 'High' ? "bg-rose-500" : log.severity === 'Medium' ? "bg-amber-500" : "bg-blue-500"
                          )} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-prism-600 transition-colors">{log.event}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{log.user} • {log.time}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="prism-card p-8 bg-slate-900 text-white space-y-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-prism-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight">Security Score</h4>
                    <p className="text-slate-400 text-xs mt-1">Your platform security posture is excellent.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Posture</span>
                      <span>94%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-prism-500 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Run Security Audit</button>
                </div>

                <div className="prism-card p-8 space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Compliance</h4>
                  <div className="space-y-4">
                    {['SOC2 Type II', 'GDPR', 'HIPAA'].map((comp, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Configuration</h2>
              <p className="text-slate-500 text-sm">Global settings and environment parameters</p>
            </div>

            <div className="prism-card p-10 space-y-12">
              <div className="space-y-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Identity & Branding</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Platform Name</label>
                    <input type="text" defaultValue="Prism Intelligence" className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-prism-500 focus:ring-8 focus:ring-prism-500/5 rounded-2xl text-sm font-bold transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Default Locale</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-prism-500 focus:ring-8 focus:ring-prism-500/5 rounded-2xl text-sm font-bold transition-all outline-none appearance-none">
                      <option>English (US)</option>
                      <option>French (FR)</option>
                      <option>German (DE)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-50 space-y-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Security Protocol</h4>
                <div className="space-y-4">
                  {[
                    { title: 'Multi-Factor Authentication', desc: 'Enforce biometric or token-based 2FA for all administrative identities.', active: true },
                    { title: 'Session Persistence', desc: 'Automatically terminate sessions after 24 hours of inactivity.', active: false },
                    { title: 'Audit Trail Retention', desc: 'Maintain detailed logs of all strategic operations for 365 days.', active: true },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{setting.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{setting.desc}</p>
                      </div>
                      <button className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        setting.active ? "bg-slate-900" : "bg-slate-200"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          setting.active ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                  Commit Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Invite User Modal */}
      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Invite New User"
      >
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
            <input 
              type="text" 
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Harvey Specter" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Work Email</label>
            <input 
              type="email" 
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="harvey@pearson-specter.com" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Access Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['Viewer', 'Editor', 'Admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setNewUser({ ...newUser, role })}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold transition-all border",
                    newUser.role === role 
                      ? "bg-prism-600 text-white border-prism-600 shadow-lg shadow-prism-200" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit User Details"
      >
        {selectedUser && (
          <form onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }} className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 overflow-hidden shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`} alt={selectedUser.name} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{selectedUser.name}</h4>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Access Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['Viewer', 'Editor', 'Admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, role })}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold transition-all border",
                      selectedUser.role === role 
                        ? "bg-prism-600 text-white border-prism-600 shadow-lg shadow-prism-200" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Account Status</label>
              <div className="grid grid-cols-2 gap-3">
                {['Active', 'Inactive'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, status })}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold transition-all border",
                      selectedUser.status === status 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Destructive Action</h4>
                <p className="text-xs text-rose-700 leading-relaxed mt-1">
                  You are about to delete <strong>{selectedUser.name}</strong>. This will revoke all access immediately and cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Keep User
              </button>
              <button 
                onClick={() => { console.log('Deleting user:', selectedUser.email); setIsDeleteModalOpen(false); }}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Role Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        title="Create New Role"
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsRoleModalOpen(false); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Role Name</label>
            <input 
              type="text" 
              placeholder="e.g. Data Analyst" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea 
              placeholder="Describe the responsibilities of this role..." 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none min-h-[100px]"
              required
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Create Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Group Modal */}
      <Modal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        title="Create New Group"
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsGroupModalOpen(false); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Group Name</label>
            <input 
              type="text" 
              placeholder="e.g. Finance Team" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea 
              placeholder="What dashboards will this group access?" 
              className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none min-h-[100px]"
              required
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Create Group
            </button>
          </div>
        </form>
      </Modal>
      {/* Connect Database Modal */}
      <Modal 
        isOpen={isDatabaseModalOpen} 
        onClose={() => setIsDatabaseModalOpen(false)} 
        title="Connect New Database"
      >
        <form onSubmit={handleConnectDatabase} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Display Name</label>
              <input 
                type="text" 
                value={newDatabase.name}
                onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                placeholder="e.g. Production Analytics" 
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 rounded-xl text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Engine</label>
              <select 
                value={newDatabase.engine}
                onChange={(e) => setNewDatabase({ ...newDatabase, engine: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 rounded-xl text-sm outline-none appearance-none"
              >
                <option>PostgreSQL</option>
                <option>MySQL</option>
                <option>BigQuery</option>
                <option>Snowflake</option>
                <option>Redshift</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Host</label>
              <input 
                type="text" 
                value={newDatabase.host}
                onChange={(e) => setNewDatabase({ ...newDatabase, host: e.target.value })}
                placeholder="db.example.com" 
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 rounded-xl text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Port</label>
              <input 
                type="text" 
                value={newDatabase.port}
                onChange={(e) => setNewDatabase({ ...newDatabase, port: e.target.value })}
                placeholder="5432" 
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 rounded-xl text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Database Name</label>
              <input 
                type="text" 
                value={newDatabase.database}
                onChange={(e) => setNewDatabase({ ...newDatabase, database: e.target.value })}
                placeholder="analytics_prod" 
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 rounded-xl text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDatabaseModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-prism-600 text-white rounded-xl font-bold text-sm hover:bg-prism-700 transition-all shadow-lg shadow-prism-200 active:scale-95"
            >
              Connect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
