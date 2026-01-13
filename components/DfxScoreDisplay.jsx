// components/DfxScoreDisplay.jsx
export default function DfxScoreDisplay({ score, qualifier }) {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 0.8) return '🏆';
    if (score >= 0.6) return '⭐';
    if (score >= 0.4) return '📊';
    return '⚠️';
  };

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${getScoreColor(score)}`}>
      <span className="text-2xl mr-2">{getScoreIcon(score)}</span>
      <div>
        <div className="text-lg">{(score * 100).toFixed(1)}%</div>
        <div className="text-xs opacity-75">{qualifier}</div>
      </div>
    </div>
  );
}