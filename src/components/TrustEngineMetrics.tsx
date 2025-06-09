
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Shield,
  Zap,
  Activity
} from 'lucide-react';

interface TrustMetrics {
  total_tasks: number;
  completion_rate: number;
  failure_rate: number;
  avg_latency_ms: number;
  within_sla_count: number;
  delayed_tasks_count: number;
  performance_drift: number;
  anomaly_score: number;
  recent_success_rate: number;
  sla_compliance: number;
  trust_score_7d_delta: number;
}

interface TrustEngineMetricsProps {
  metrics: TrustMetrics;
  adjustments: {
    delayed_penalty: number;
    sla_bonus: number;
    trigger_applied: string[];
  };
  agentName: string;
  trustScore: number;
}

const TrustEngineMetrics: React.FC<TrustEngineMetricsProps> = ({
  metrics,
  adjustments,
  agentName,
  trustScore
}) => {
  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getLatencyStatus = (ms: number) => {
    const slaThreshold = 5 * 60 * 1000; // 5 minutes
    if (ms <= slaThreshold * 0.5) return { color: 'text-green-400', level: 'Excellent' };
    if (ms <= slaThreshold) return { color: 'text-blue-400', level: 'Within SLA' };
    if (ms <= slaThreshold * 1.5) return { color: 'text-yellow-400', level: 'At Risk' };
    return { color: 'text-red-400', level: 'Poor' };
  };

  const getDriftStatus = (drift: number) => {
    if (drift < 10) return { color: 'text-green-400', level: 'Stable' };
    if (drift < 20) return { color: 'text-yellow-400', level: 'Minor Drift' };
    return { color: 'text-red-400', level: 'Significant Drift' };
  };

  const getAnomalyStatus = (score: number) => {
    if (score < 20) return { color: 'text-green-400', level: 'Normal' };
    if (score < 50) return { color: 'text-yellow-400', level: 'Suspicious' };
    return { color: 'text-red-400', level: 'Anomalous' };
  };

  const latencyStatus = getLatencyStatus(metrics.avg_latency_ms);
  const driftStatus = getDriftStatus(metrics.performance_drift);
  const anomalyStatus = getAnomalyStatus(metrics.anomaly_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{agentName} Trust Analysis</h2>
          <p className="text-slate-400">Advanced trust engine metrics and triggers</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{trustScore.toFixed(1)}%</div>
          <div className="text-slate-400">Trust Score</div>
        </div>
      </div>

      {/* Trust Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Latency Factor */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatLatency(metrics.avg_latency_ms)}
            </div>
            <div className={`text-sm ${latencyStatus.color}`}>
              {latencyStatus.level}
            </div>
            <Progress 
              value={Math.max(0, 100 - (metrics.avg_latency_ms / (5 * 60 * 1000)) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.completion_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">
              {metrics.total_tasks} total tasks
            </div>
            <Progress value={metrics.completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Performance Drift */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Performance Drift</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.performance_drift.toFixed(1)}%
            </div>
            <div className={`text-sm ${driftStatus.color}`}>
              {driftStatus.level}
            </div>
            <Progress 
              value={Math.max(0, 100 - metrics.performance_drift * 2)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Anomaly Score</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.anomaly_score.toFixed(1)}%
            </div>
            <div className={`text-sm ${anomalyStatus.color}`}>
              {anomalyStatus.level}
            </div>
            <Progress
              value={Math.max(0, 100 - metrics.anomaly_score)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* 7d Trust Delta */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">7d Delta</CardTitle>
            {metrics.trust_score_7d_delta >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.trust_score_7d_delta >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.trust_score_7d_delta > 0 ? '+' : ''}{metrics.trust_score_7d_delta.toFixed(1)}
            </div>
            <div className="text-sm text-slate-400">last 7 days</div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">SLA Performance</CardTitle>
            <CardDescription className="text-slate-400">
              Task completion within 5-minute SLA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Within SLA</span>
              </div>
              <span className="text-white font-semibold">{metrics.within_sla_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-400" />
                <span className="text-slate-300">Delayed</span>
              </div>
              <span className="text-white font-semibold">{metrics.delayed_tasks_count}</span>
            </div>
            <Progress value={metrics.sla_compliance} className="mt-4" />
            <div className="text-sm text-slate-400">
              {metrics.sla_compliance.toFixed(1)}% SLA compliance
            </div>
          </CardContent>
        </Card>

        {/* Trust Triggers */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Triggers</CardTitle>
            <CardDescription className="text-slate-400">
              Trust adjustment triggers applied
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adjustments.trigger_applied.length === 0 ? (
              <div className="text-slate-400 text-center py-4">
                No triggers currently active
              </div>
            ) : (
              adjustments.trigger_applied.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {trigger === 'delayed_tasks_penalty' ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-slate-300">
                      {trigger === 'delayed_tasks_penalty' ? 'Delayed Tasks Penalty' : 'SLA Compliance Bonus'}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={trigger === 'delayed_tasks_penalty' ? 'border-red-400 text-red-400' : 'border-green-400 text-green-400'}
                  >
                    {trigger === 'delayed_tasks_penalty' ? adjustments.delayed_penalty : adjustments.sla_bonus}
                  </Badge>
                </div>
              ))
            )}
            
            {(adjustments.delayed_penalty !== 0 || adjustments.sla_bonus !== 0) && (
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Adjustment</span>
                  <span className={`font-semibold ${
                    (adjustments.delayed_penalty + adjustments.sla_bonus) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {adjustments.delayed_penalty + adjustments.sla_bonus > 0 ? '+' : ''}
                    {adjustments.delayed_penalty + adjustments.sla_bonus}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Future Roadmap Note */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span>Future Roadmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            <strong>Self-learning trust adjustment model:</strong> The next iteration will implement 
            adaptive, ML-enhanced trust scoring that learns from historical patterns and automatically 
            adjusts thresholds based on agent behavior and system-wide performance metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustEngineMetrics;
