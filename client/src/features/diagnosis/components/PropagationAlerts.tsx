import { useState, useEffect } from 'react';
import { usePlants } from '@/hooks';
import { Plot } from '@/models/Plot';
import { Icons } from '@/components/ui/Icons';
import type { IPropagationAlert, RiskLevel } from '@/types';

interface PropagationAlertsProps {
  readonly plots: Plot[];
}

export function PropagationAlerts({ plots }: PropagationAlertsProps) {
  const { analyzePropagation } = usePlants();
  const [alerts, setAlerts] = useState<IPropagationAlert[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      const allAlerts: IPropagationAlert[] = [];

      for (const plot of plots) {
        try {
          const plotAlerts = await analyzePropagation(plot.id);
          allAlerts.push(...plotAlerts);
        } catch (error) {
          console.error(`Error analyzing plot ${plot.id}:`, error);
        }
      }

      // Sort by risk level
      const riskOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      allAlerts.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
      setAlerts(allAlerts);
      setLoading(false);
    };

    if (plots.length > 0) {
      loadAlerts();
    } else {
      setLoading(false);
    }
  }, [plots, analyzePropagation]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
          <span className="text-sm text-gray-500">Analizando propagación...</span>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'Crítico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      case 'low':
        return 'Bajo';
      default:
        return level;
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const criticalCount = alerts.filter((a) => a.riskLevel === 'critical').length;
  const highCount = alerts.filter((a) => a.riskLevel === 'high').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icons.AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">
            Alertas de Propagación
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {criticalCount} críticos
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
              {highCount} altos
            </span>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-100">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4">
            <div
              onClick={() =>
                setExpanded(expanded === alert.id ? null : alert.id)
              }
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getRiskIcon(alert.riskLevel)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {alert.diseaseName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {plots.find((p) => p.id === alert.plotId)?.name ||
                        'Parcela desconocida'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(
                      alert.riskLevel
                    )}`}
                  >
                    Riesgo {getRiskLabel(alert.riskLevel)}
                  </span>
                  <Icons.ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expanded === alert.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-red-600">
                  <strong>{alert.plantsAtRisk}</strong> plantas en riesgo
                </span>
                <span className="text-gray-500">
                  {alert.affectedZones.length} zonas afectadas
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {expanded === alert.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                {/* Affected Zones */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Zonas afectadas:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {alert.affectedZones.map((zone) => (
                      <span
                        key={`zone-${zone.row}-${zone.column}`}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        Fila {zone.row + 1}, Col {zone.column + 1}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {alert.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Recomendaciones:
                    </h5>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec) => (
                        <li
                          key={`rec-${rec.slice(0, 20)}`}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <span className="text-emerald-500 font-bold">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Heat Map Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Mapa de propagación
                  </h5>
                  <div className="grid grid-cols-6 gap-1 max-w-xs">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const row = Math.floor(i / 6);
                      const col = i % 6;
                      const isAffected = alert.affectedZones.some(
                        (z) => z.row === row && z.column === col
                      );
                      const isNear = alert.affectedZones.some(
                        (z) =>
                          Math.abs(z.row - row) <= 1 &&
                          Math.abs(z.column - col) <= 1 &&
                          !isAffected
                      );
                      const getCellColor = () => {
                        if (isAffected) return 'bg-red-400';
                        if (isNear) return 'bg-orange-300';
                        return 'bg-green-200';
                      };
                      return (
                        <div
                          key={`cell-${row}-${col}`}
                          className={`aspect-square rounded-sm ${getCellColor()}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-red-400" aria-hidden="true" />
                      <span>Afectado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-orange-300" aria-hidden="true" />
                      <span>En riesgo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-green-200" aria-hidden="true" />
                      <span>Sano</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                    Ver parcela
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    Marcar como revisado
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
