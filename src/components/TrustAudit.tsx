import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'

interface FlaggedAgent {
  agent_id: string
  agent_name: string
  occurrences: number
  current_score: number
}

interface TrustAuditProps {
  threshold?: number
}

const TrustAudit: React.FC<TrustAuditProps> = ({ threshold = 70 }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trust-audit', threshold],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('trust-audit', {
        body: { threshold }
      })
      if (error) throw error
      return data as { flagged_agents: FlaggedAgent[] }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400" />
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-red-400">Failed to load audit results</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Trust Audit Results</CardTitle>
      </CardHeader>
      <CardContent>
        {data.flagged_agents.length === 0 ? (
          <div className="text-slate-400">No agents breached the threshold</div>
        ) : (
          <ul className="space-y-2">
            {data.flagged_agents.map(agent => (
              <li key={agent.agent_id} className="flex items-center justify-between">
                <span className="text-white">{agent.agent_name}</span>
                <Badge variant="outline" className="border-red-400 text-red-400">
                  {agent.current_score}%
                </Badge>
                <span className="text-slate-400 text-sm">{agent.occurrences} alerts</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default TrustAudit
