// lib/stability/index.js - Point d'entrée principal

export { stabilityClient, checkStabilityConfig } from './client.js';
export { createFallbackImage, createIterationImage } from './fallback.js';

// Exporter par défaut le client principal
export default stabilityClient;