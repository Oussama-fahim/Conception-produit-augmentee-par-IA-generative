// components/DfxMetricsPanel.jsx
import { DFX_RULES } from '@/lib/dfx/rules';

export default function DfxMetricsPanel({ metrics, aspect, score }) {
  const rules = DFX_RULES[aspect];
  
  if (!rules) return null;

  const generateProgressBar = (ruleScore) => {
    const percentage = Math.round(ruleScore * 100);
    let colorClass;
    if (ruleScore >= 0.8) colorClass = 'bg-green-500';
    else if (ruleScore >= 0.6) colorClass = 'bg-yellow-500';
    else if (ruleScore >= 0.4) colorClass = 'bg-orange-500';
    else colorClass = 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const formatMetricValue = (value, rule) => {
    if (typeof value === 'boolean') {
      return value ? '✓ Oui' : '✗ Non';
    } else if (typeof value === 'number') {
      const unit = rule.unit || '';
      return `${value.toFixed(2)} ${unit}`.trim();
    } else {
      const translations = {
        'facile': '✓ Facile',
        'moyen': '~ Moyen',
        'difficile': '✗ Difficile'
      };
      return translations[value] || value;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Métriques {rules.name}
      </h3>
      
      <div className="space-y-4">
        {Object.entries(metrics).map(([key, value]) => {
          const rule = rules.rules[key];
          if (!rule) return null;

          const ruleScore = rule.scoring(value);
          
          return (
            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{rule.name}</span>
                <span className={`text-sm font-semibold ${
                  ruleScore >= 0.7 ? 'text-green-600' : 
                  ruleScore >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(ruleScore * 100).toFixed(0)}%
                </span>
              </div>
              
              {generateProgressBar(ruleScore)}
              
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Valeur: {formatMetricValue(value, rule)}
                </span>
                <span className="text-xs text-gray-500">
                  Poids: {(rule.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">Score Global</span>
          <span className={`text-2xl font-bold ${
            score >= 0.8 ? 'text-green-600' : 
            score >= 0.6 ? 'text-yellow-600' : 
            score >= 0.4 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {(score * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-2">
          {generateProgressBar(score)}
        </div>
      </div>
    </div>
  );
}