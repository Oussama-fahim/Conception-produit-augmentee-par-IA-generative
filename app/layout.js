// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ideate Industrial Design',
  description: 'Plateforme de conception industrielle assistée par IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script pour appliquer le thème au chargement initial */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Récupérer le thème sauvegardé ou utiliser 'system' par défaut
                  const savedTheme = localStorage.getItem('ideate-theme') || 'system';
                  const savedLanguage = localStorage.getItem('ideate-language') || 'fr';
                  const savedTimezone = localStorage.getItem('ideate-timezone') || 'Europe/Paris';
                  
                  // Appliquer le thème
                  if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (savedTheme === 'system') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                  
                  // Stocker les préférences pour un accès rapide
                  window.ideatePreferences = {
                    theme: savedTheme,
                    language: savedLanguage,
                    timezone: savedTimezone
                  };
                  
                  // Appliquer la langue
                  document.documentElement.lang = savedLanguage;
                  
                } catch (error) {
                  console.error('Erreur lors du chargement des préférences:', error);
                }
              })();
            `,
          }}
        />
        
        {/* Meta tags pour le mode sombre */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Préchargement des polices */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white`}>
        {/* Structure de base avec support du mode sombre */}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          {children}
        </div>
        
        {/* Script pour gérer les changements de thème en temps réel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Écouter les changements de préférences système
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                  const savedTheme = localStorage.getItem('ideate-theme') || 'system';
                  if (savedTheme === 'system') {
                    if (event.matches) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                });
                
                // Exposer une fonction pour changer le thème
                window.applyTheme = function(theme) {
                  localStorage.setItem('ideate-theme', theme);
                  window.ideatePreferences.theme = theme;
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // system
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                };
                
                // Exposer une fonction pour changer la langue
                window.applyLanguage = function(language) {
                  localStorage.setItem('ideate-language', language);
                  window.ideatePreferences.language = language;
                  document.documentElement.lang = language;
                };
                
                // Exposer une fonction pour changer le fuseau horaire
                window.applyTimezone = function(timezone) {
                  localStorage.setItem('ideate-timezone', timezone);
                  window.ideatePreferences.timezone = timezone;
                };
                
                // Synchroniser avec le service worker si disponible
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    if (registration.active) {
                      registration.active.postMessage({
                        type: 'PREFERENCES_UPDATED',
                        preferences: window.ideatePreferences
                      });
                    }
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}