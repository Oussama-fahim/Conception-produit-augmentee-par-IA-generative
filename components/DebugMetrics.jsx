// components/DebugMetrics.jsx - Composant de débogage des métriques

export default function DebugMetrics({ metrics, aspect, score }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) return null;

  const hasNaN = Object.values(metrics || {}).some(value => 
    typeof value === 'number' && isNaN(value)
  );

  const hasInvalid = Object.entries(metrics || {}).some(([key, value]) => 
    value === undefined || value === null
  );

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-md text-xs font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm">🔍 Debug DfX</span>
        <span className={`px-2 py-1 rounded ${
          hasNaN || hasInvalid ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {hasNaN || hasInvalid ? 'ISSUES' : 'OK'}
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <strong>Aspect:</strong> {aspect || 'N/A'}
        </div>
        
        <div>
          <strong>Score:</strong> {
            typeof score === 'number' && !isNaN(score) 
              ? `${(score * 100).toFixed(1)}%` 
              : <span className="text-red-400">NaN ❌</span>
          }
        </div>

        <div className="border-t border-gray-700 pt-2">
          <strong>Métriques ({Object.keys(metrics || {}).length}):</strong>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1">
          {Object.entries(metrics || {}).map(([key, value]) => {
            const isInvalid = value === undefined || value === null || 
                            (typeof value === 'number' && isNaN(value));
            
            return (
              <div key={key} className={`flex justify-between ${isInvalid ? 'text-red-400' : ''}`}>
                <span className="truncate mr-2">{key}:</span>
                <span className="font-bold">
                  {isInvalid ? '❌ INVALID' : formatValue(value)}
                </span>
              </div>
            );
          })}
        </div>

        {hasNaN && (
          <div className="bg-red-900 p-2 rounded mt-2">
            <strong>⚠️ NaN détectés!</strong>
            <div className="text-xs mt-1">
              Vérifiez l'analyse d'image et les fonctions de scoring.
            </div>
          </div>
        )}

        {hasInvalid && (
          <div className="bg-yellow-900 p-2 rounded mt-2">
            <strong>⚠️ Valeurs invalides!</strong>
            <div className="text-xs mt-1">
              Certaines métriques sont undefined ou null.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else if (typeof value === 'string') {
    return value;
  }
  return String(value);
}