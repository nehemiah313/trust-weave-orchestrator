import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileLock, Server, ClipboardList } from 'lucide-react';

const HealthcareComplianceDashboard = () => {
  // Demo compliance metrics
  const metrics = {
    auditIntegrity: 97.5,
    encryptionScore: 95.2,
    controlEffectiveness: 92.3,
    agentAvailability: 98.7,
  };

  const incidents = {
    open: 2,
    resolved: 12,
  };

  const poam = [
    { id: 'POA-001', action: 'Encrypt archived PHI at rest', status: 'In Progress' },
    { id: 'POA-002', action: 'Update access control policy', status: 'Open' },
    { id: 'POA-003', action: 'Review audit trail retention', status: 'Completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-400 border-green-400';
      case 'In Progress':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-blue-400 border-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Audit Trail Integrity</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.auditIntegrity}%</div>
            <Progress value={metrics.auditIntegrity} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Encryption Score</CardTitle>
            <FileLock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.encryptionScore}%</div>
            <Progress value={metrics.encryptionScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Control Effectiveness</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.controlEffectiveness}%</div>
            <Progress value={metrics.controlEffectiveness} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Agent Availability</CardTitle>
            <Server className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.agentAvailability}%</div>
            <Progress value={metrics.agentAvailability} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Incidents</CardTitle>
            <CardDescription className="text-slate-400">
              Security and compliance incident counts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Open</span>
              <span className="text-white font-semibold">{incidents.open}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Resolved</span>
              <span className="text-white font-semibold">{incidents.resolved}</span>
            </div>
            <Progress value={incidents.resolved / (incidents.open + incidents.resolved) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Plan of Action &amp; Milestones</CardTitle>
            <CardDescription className="text-slate-400">
              Current POA&amp;M tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {poam.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="text-slate-300 text-sm">
                  <div className="font-medium text-white">{item.action}</div>
                  <div className="text-xs">{item.id}</div>
                </div>
                <Badge variant="outline" className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthcareComplianceDashboard;
