// lib/stability/fallback.js - Génération d'images de fallback sans canvas

/**
 * Crée une image SVG simple comme fallback
 */
export function createFallbackImage(width = 1024, height = 1024, options = {}) {
  const {
    title = 'Stability AI Fallback',
    subtitle = 'Image non disponible',
    error = '',
    gradientStart = '#3b82f6',
    gradientEnd = '#8b5cf6'
  } = options;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientStart};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${gradientEnd};stop-opacity:0.3" />
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grad)"/>
  
  <g transform="translate(${width/2}, ${height/2})">
    <!-- Icône -->
    <circle cx="0" cy="-50" r="40" fill="#ffffff" opacity="0.8"/>
    <text x="0" y="-50" text-anchor="middle" dy="5" font-family="Arial" font-size="24" fill="#4b5563">🎨</text>
    
    <!-- Titre -->
    <text x="0" y="30" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#1f2937">${title}</text>
    
    <!-- Sous-titre -->
    <text x="0" y="70" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">${subtitle}</text>
    
    <!-- Message d'erreur -->
    ${error ? `<text x="0" y="110" text-anchor="middle" font-family="Arial" font-size="14" fill="#9ca3af">${error.substring(0, 80)}</text>` : ''}
    
    <!-- Informations -->
    <text x="0" y="${height/2 - 50}" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
      ${width} × ${height} • ${new Date().toLocaleDateString()}
    </text>
  </g>
</svg>`;

  return Buffer.from(svg);
}

/**
 * Crée une image de progression pour le design itératif
 */
export function createIterationImage(iterationNumber, totalIterations, feedback = '') {
  const width = 1024;
  const height = 1024;
  
  const progress = (iterationNumber / totalIterations) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <g transform="translate(${width/2}, ${height/2})">
    <!-- Cercle de progression -->
    <circle cx="0" cy="0" r="${radius + 10}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="0" cy="0" r="${radius}" fill="none" stroke="#3b82f6" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            transform="rotate(-90)"/>
    
    <!-- Numéro d'itération -->
    <text x="0" y="0" text-anchor="middle" dy="6" font-family="Arial" font-size="32" font-weight="bold" fill="#1e40af">
      ${iterationNumber}
    </text>
    
    <!-- Texte -->
    <text x="0" y="${radius + 40}" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#1f2937">
      Itération ${iterationNumber}/${totalIterations}
    </text>
    
    <text x="0" y="${radius + 70}" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
      Design itératif en cours
    </text>
    
    <!-- Feedback -->
    ${feedback ? `
    <foreignObject x="-200" y="${radius + 100}" width="400" height="100">
      <div xmlns="http://www.w3.org/1999/xhtml" style="
        font-family: Arial;
        font-size: 14px;
        color: #4b5563;
        text-align: center;
        padding: 10px;
        background: #f3f4f6;
        border-radius: 8px;
        border: 1px solid #d1d5db;
      ">
        <strong>Amélioration:</strong><br/>
        ${feedback.substring(0, 80)}${feedback.length > 80 ? '...' : ''}
      </div>
    </foreignObject>
    ` : ''}
    
    <!-- Barre de progression textuelle -->
    <text x="0" y="${radius + (feedback ? 180 : 120)}" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
      Progression: ${Math.round(progress)}%
    </text>
  </g>
</svg>`;

  return Buffer.from(svg);
}