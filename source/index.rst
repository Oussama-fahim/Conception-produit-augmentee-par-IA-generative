=====================================================
Ideate design Studio - Documentation Technique
=====================================================

.. image:: image/prrr.png
   :alt: Ideate Studio Logo
   :align: center
   :width: 600px

.. centered:: **Plateforme Intelligente de Design Industriel avec Analyse DfX**

.. note::
   Projet d'Expertise - École Nationale Supérieure d'Arts et Métiers (ENSAM)

   Réalisé par : Oussama Fahim    

   Encadré par : Mr. Tawfik Masrour et Mrs. Ibtissam El Hassani

----

Table des matières
------------------

- `Introduction <index.html#id1>`_



Introduction
============

**Ideate Studio** est une plateforme web innovante dédiée au design industriel moderne, alliant **intelligence artificielle générative** et **analyse Design for Excellence (DfX)** pour révolutionner le processus de conception de produits.

Dans un contexte où l'industrie 4.0 transforme les méthodes traditionnelles de conception, Ideate Studio se positionne comme un outil stratégique permettant aux designers et ingénieurs de créer, analyser et optimiser leurs concepts de manière intelligente et collaborative.

Vision du Projet
----------------

Notre vision est de démocratiser l'accès aux technologies d'IA générative tout en intégrant les principes d'ingénierie industrielle, créant ainsi un écosystème où créativité et fabricabilité convergent naturellement.

**Principes directeurs :**

* **Accessibilité** : Interface intuitive pour designers de tous niveaux
* **Intelligence** : Intégration profonde de l'IA pour guider les décisions de design
* **Qualité** : Analyse DfX automatique garantissant la fabricabilité
* **Collaboration** : Partage et amélioration collective des designs
* **Performance** : Architecture moderne et optimisée

Contexte Académique
-------------------

Ce projet a été développé dans le cadre d'un **projet d'expertise** à l'**École Nationale Supérieure d'Arts et Métiers (ENSAM)** de Meknès, sous la supervision de :

* **M. Tawfik Masrour** - Encadrant et Chef de Filière
  Expert en Génie Industriel et Intelligence Artificielle
  
* **Mme Ibtissam El Hassani** - Encadrante
  Experte en Design Industriel et Innovation Produit

Le projet s'inscrit dans une démarche de recherche appliquée visant à explorer l'intersection entre l'IA générative et les méthodologies DfX traditionnelles.

Problématique
=============

Le Défi du Design Industriel Moderne
-------------------------------------

Les équipes de conception industrielle font face à plusieurs **défis majeurs** dans leur processus de développement produit :

**1. Génération Conceptuelle Limitée**

* Difficulté à explorer rapidement de multiples variantes de design
* Processus de sketching et de prototypage chronophage
* Manque d'outils accessibles pour la génération d'idées visuelles
* Barrière technique élevée pour utiliser l'IA générative

**2. Évaluation Tardive de la Fabricabilité**

* Découverte des problèmes DfX en phase avancée de conception
* Coûts élevés de modification après validation du design
* Absence d'analyse automatisée de fabricabilité
* Métriques DfX manuelles et subjectives

**3. Cycle Itératif Inefficace**

* Manque de traçabilité dans l'évolution des designs
* Difficulté à comparer objectivement les itérations
* Feedback non structuré et non quantifiable
* Perte de connaissance entre les versions

**4. Fragmentation des Outils**

* Multiplication des plateformes (IA, CAO, analyse)
* Workflow discontinu et transferts de fichiers complexes
* Absence d'intégration entre génération et analyse
* Courbe d'apprentissage importante pour chaque outil

**5. Collaboration Limitée**

* Partage difficile des concepts en phase exploratoire
* Manque de standardisation dans la documentation design
* Absence de plateforme centralisée pour le travail d'équipe
* Difficulté à capitaliser sur les expériences collectives

Impact sur l'Industrie
----------------------

Ces problématiques entraînent :

* **Augmentation des coûts** : Modifications tardives coûteuses
* **Allongement des délais** : Time-to-market prolongé
* **Qualité variable** : Designs non optimisés pour la fabrication
* **Innovation freinée** : Exploration limitée de l'espace de conception

Besoin Identifié
----------------

Il existe donc un **besoin critique** pour une solution qui :

✓ Combine génération IA et analyse DfX en temps réel
✓ Offre un workflow itératif structuré et traçable
✓ Rend accessible la puissance de l'IA générative
✓ Intègre l'analyse de fabricabilité dès la conception
✓ Facilite la collaboration et le partage de connaissances

Solution
========

Architecture Globale
--------------------

**Ideate Studio** répond à ces défis à travers une **plateforme web intégrée** combinant trois piliers technologiques :

.. code-block:: text

   ┌─────────────────────────────────────────────────────────┐
   │                    IDEATE STUDIO                        │
   ├─────────────────────────────────────────────────────────┤
   │                                                         │
   │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
   │  │  Génération  │  │   Analyse    │  │   Gestion   │  │
   │  │      IA      │→ │     DfX      │→ │   Projet    │  │
   │  └──────────────┘  └──────────────┘  └─────────────┘  │
   │         ↓                  ↓                 ↓         │
   │  ┌─────────────────────────────────────────────────┐  │
   │  │         Workflow Itératif Intelligent           │  │
   │  └─────────────────────────────────────────────────┘  │
   │                                                         │
   └─────────────────────────────────────────────────────────┘

Approches Innovantes
--------------------

**1. Génération Intelligente Multi-Modale**

Notre solution intègre **trois modes de génération complémentaires** :

* **Texte → Image** : Utilisation de modèles Stable Diffusion 3/FLUX pour transformer descriptions textuelles en visualisations produit haute qualité
* **Croquis → Image** : Pipeline ControlNet Scribble pour raffiner sketches manuels en designs détaillés
* **Raffinement Guidé** : Amélioration itérative basée sur l'analyse DfX et le feedback utilisateur

**2. Analyse DfX en Temps Réel**

Système d'évaluation automatique multi-aspects :

* **DFM** (Design for Manufacturing) : Évaluation de la fabricabilité
* **DFA** (Design for Assembly) : Analyse de l'assemblabilité
* **DFS** (Design for Service) : Maintenabilité et accessibilité
* **DFSust** (Design for Sustainability) : Impact environnemental

Chaque génération reçoit instantanément un **score DfX** (0-100%) avec recommandations d'amélioration détaillées.

**3. Workflow Itératif Structuré**

Méthodologie en **5 étapes guidées** :

.. code-block:: text

   Brief → Croquis → Génération → Amélioration → Finalisation
     ↓        ↓          ↓            ↓            ↓
   IA Mistral  Upload  SD3/FLUX   Feedback    Rapport DfX

**4. Système de Transformation 3D**

Pipeline innovant **Image 2D → Modèle 3D** :

* Utilisation de Stable Fast 3D pour extraction de profondeur
* Génération de maillages texturés au format GLB
* Export compatible logiciels professionnels (Blender, Unity, etc.)

Valeur Ajoutée
--------------

**Pour les Designers :**

* ⚡ Génération rapide de multiples variantes
* 📊 Feedback DfX immédiat et actionnable
* 🔄 Traçabilité complète du processus itératif
* 💾 Archivage automatique avec métadonnées

**Pour les Équipes :**

* 🤝 Collaboration via projets publics/privés
* 📈 Capitalisation des meilleures pratiques
* 🎯 Standardisation du workflow de conception
* 🌐 Accessibilité web multiplateforme

**Pour l'Entreprise :**

* 💰 Réduction des coûts de modification
* ⏱️ Accélération du time-to-market
* ✅ Amélioration de la qualité produit
* 🔬 Intégration R&D et production

Technologies Clés
-----------------

La solution s'appuie sur une **stack technologique moderne** :

**Frontend**
   * Next.js 14 (React Server Components)
   * Tailwind CSS pour UI responsive
   * Three.js pour visualisation 3D

**Backend & Infrastructure**
   * Supabase (Auth, Database, Storage)
   * PostgreSQL avec Row Level Security
   * API Routes serverless

**Intelligence Artificielle**
   * Stable Diffusion 3 Medium/Large
   * FLUX.1 Dev/Schnell
   * Mistral AI pour génération de prompts
   * Stability AI ControlNet & Fast 3D

**Analyse & Métrique**
   * Système DfX règles + heuristiques
   * Vision par ordinateur pour extraction features
   * Scoring multi-critères pondéré

Différenciation
---------------

Ideate Studio se distingue par :

1. **Intégration unique** IA générative + analyse DfX
2. **Accessibilité** via interface web (pas d'installation)
3. **Pédagogie** explications détaillées des scores DfX
4. **Open workflow** compatible avec outils existants
5. **Focus industriel** au-delà du design artistique

----

================
Modèles IA
================

Architecture intelligente de 15 modèles d'IA spécialisés orchestrant la génération d'images 2D/3D, l'analyse visuelle avancée et la génération de texte contextuel.

.. contents:: Navigation
   :depth: 3
   :local:
   :backlinks: top

.. note::
   Cette documentation décrit l'écosystème complet des modèles IA intégrés à l'application. Chaque modèle est sélectionné pour ses performances optimales dans un cas d'usage spécifique du workflow de design industriel.

═══════════════════════════════════════
Vue d'Ensemble de l'Architecture
═══════════════════════════════════════

L'application exploite une architecture multi-modèles orchestrée pour offrir un workflow de design industriel complet, de la génération de concepts à l'analyse DfX (Design for X) automatisée.

Principes Fondamentaux
----------------------

**Orchestration Intelligente**
   Les 15 modèles collaborent dans un pipeline optimisé où chaque modèle apporte son expertise spécifique au moment approprié du workflow.

**Fallback Multi-Niveaux**
   Système de redondance garantissant la continuité de service même en cas de défaillance d'un endpoint API.

**Optimisation Contextuelle**
   Sélection automatique du modèle optimal basée sur les contraintes du projet (vitesse, qualité, fidélité).

Statistiques Clés
-----------------

.. list-table::
   :widths: 30 70
   :header-rows: 0

   * - **Total de modèles**
     - 15 modèles spécialisés
   * - **Fournisseurs**
     - 3 plateformes (Hugging Face, Stability AI, Mistral AI)
   * - **Modalités**
     - Texte-à-Image (8), Image-à-3D (1), Vision (1), LLM (1), ControlNet (2), Flux (3)
   * - **Résolution max**
     - SDXL (1536×640 pixels)
   * - **Format 3D**
     - GLB/glTF avec textures PBR

═══════════════════════════════════════
Génération d'Images 2D
═══════════════════════════════════════

Cette catégorie regroupe 8 modèles de diffusion optimisés pour différents scénarios de génération d'images industrielles.

Stable Diffusion 3 Medium
--------------------------

.. admonition:: Modèle de Production Principal
   :class: important

   Backbone du système de génération rapide, SD3 Medium équilibre performance et qualité pour les itérations fréquentes.

**Fiche Technique**

:Fournisseur: Hugging Face
:Architecture: Diffusion latente multi-étapes
:Endpoint: ``stabilityai/stable-diffusion-3-medium-diffusers``
:Résolution native: 1024×1024 pixels (ratio 1:1)
:Temps de génération: 8-15 secondes (30 steps)

**Cas d'Usage Optimaux**

* Design rapide et itératif
* Génération de concepts initiaux
* Brainstorming visuel haute fréquence
* Intégration workflow DfX

**Configuration Recommandée**

.. code-block:: python

   {
       "width": 1024,
       "height": 1024,
       "num_inference_steps": 30,
       "guidance_scale": 7.5,
       "negative_prompt": "blurry, low quality, distorted",
       "scheduler": "DPMSolverMultistep"
   }

**Résolutions Supportées**

.. list-table::
   :widths: 30 30 40
   :header-rows: 1

   * - Format
     - Dimensions
     - Ratio
   * - Carré
     - 1024×1024
     - 1:1
   * - Portrait
     - 896×1152
     - 7:9
   * - Paysage
     - 1152×896
     - 9:7

**Points Forts**

✓ Compréhension contextuelle avancée des prompts techniques
✓ Rendu de matériaux industriels réaliste (métal, plastique, composite)
✓ Gestion cohérente des contraintes géométriques
✓ Intégration native avec l'analyse DfX

Stable Diffusion 3.5 Large
---------------------------

.. admonition:: Qualité Premium
   :class: tip

   Version élite pour les rendus haute fidélité et les présentations clients finales.

**Fiche Technique**

:Fournisseur: Hugging Face
:Architecture: Diffusion avancée avec attention étendue
:Endpoint: ``stabilityai/stable-diffusion-3.5-large``
:Résolution native: 1024×1024 (extensible)
:Temps de génération: 20-30 secondes (50 steps)

**Cas d'Usage Optimaux**

* Rendus photo-réalistes pour présentations
* Visualisations marketing haute qualité
* Documentation technique premium
* Validation finale de concepts

**Améliorations vs SD3 Medium**

.. list-table::
   :widths: 30 35 35
   :header-rows: 1

   * - Critère
     - SD3 Medium
     - SD3.5 Large
   * - Fidélité prompt
     - 87%
     - 96%
   * - Détails fins
     - Bon
     - Exceptionnel
   * - Cohérence matériaux
     - Très bon
     - Photo-réaliste
   * - Temps génération
     - 8-15s
     - 20-30s

**Configuration Premium**

.. code-block:: python

   {
       "width": 1024,
       "height": 1024,
       "num_inference_steps": 50,
       "guidance_scale": 8.0,
       "negative_prompt": "low quality, artifacts, noise",
       "clip_skip": 2,
       "use_karras_sigmas": true
   }

Stable Diffusion XL Base
-------------------------

**Fiche Technique**

:Fournisseur: Hugging Face
:Architecture: SDXL fondamental
:Endpoint: ``stabilityai/stable-diffusion-xl-base-1.0``
:Particularité: Support multi-résolutions étendu

**Résolutions SDXL Autorisées**

.. code-block:: text

   1024×1024  [1:1]    - Standard carré
   1152×896   [9:7]    - Paysage modéré
   896×1152   [7:9]    - Portrait modéré
   1216×832   [3:2]    - Paysage étendu
   832×1216   [2:3]    - Portrait étendu
   1344×768   [16:9]   - Cinématique
   768×1344   [9:16]   - Mobile vertical
   1536×640   [21:9]   - Ultra-wide
   640×1536   [9:21]   - Ultra-tall

**Usage dans le Projet**

Base solide pour compositions complexes nécessitant des formats non-standards ou des détails fins à haute résolution.

Stable Diffusion 3.5 Large Turbo
---------------------------------

.. admonition:: Performance Extrême
   :class: success

   Génération quasi temps-réel sans compromis majeur sur la qualité.

**Fiche Technique**

:Fournisseur: Hugging Face
:Architecture: Diffusion accélérée avec distillation
:Endpoint: ``stabilityai/stable-diffusion-3.5-large-turbo``
:Temps de génération: 1-3 secondes (4-8 steps)

**Avantages Clés**

:Vitesse: 10× plus rapide que SD3.5 Large standard
:Qualité: 90% de la qualité de SD3.5 Large
:Interactivité: Feedback quasi instantané
:Workflow: Idéal pour exploration itérative

**Configuration Turbo**

.. code-block:: python

   {
       "width": 1024,
       "height": 1024,
       "num_inference_steps": 6,  # Optimal pour Turbo
       "guidance_scale": 2.0,      # Plus bas pour Turbo
       "scheduler": "Euler"         # Rapide et stable
   }

**Scénarios d'Usage**

* Prototypage rapide d'idées
* Exploration de variations
* Démonstrations interactives
* Tests A/B de concepts

Famille FLUX
------------

La famille FLUX apporte une architecture novatrice basée sur les flux de génération, offrant des caractéristiques uniques par rapport aux modèles de diffusion classiques.

FLUX.1 Schnell
^^^^^^^^^^^^^^

.. admonition:: Génération Ultra-Rapide
   :class: note

   Le plus rapide de la famille FLUX, conçu pour le brainstorming instantané.

**Fiche Technique**

:Fournisseur: Black Forest Labs
:Architecture: Flux optimisé vitesse
:Endpoint: ``black-forest-labs/FLUX.1-schnell``
:Temps: <2 secondes
:Particularité: Cohérence stylistique exceptionnelle

**Points Différenciants**

* Architecture flux vs diffusion traditionnelle
* Style cohérent entre générations multiples
* Idéal pour exploration créative rapide
* Rendu conceptuel instantané

FLUX.1 Dev
^^^^^^^^^^

**Fiche Technique**

:Fournisseur: Black Forest Labs
:Architecture: Flux expérimental
:Endpoint: ``black-forest-labs/FLUX.1-dev``
:Statut: Version développement/recherche

**Usage**

Environnement de test pour nouvelles approches de génération et expérimentation de techniques émergentes.

FLUX.1 Kontext Dev
^^^^^^^^^^^^^^^^^^

**Fiche Technique**

:Fournisseur: Black Forest Labs
:Architecture: Flux avec gestion contextuelle avancée
:Endpoint: ``black-forest-labs/FLUX.1-Kontext-dev``
:Spécialité: Cohérence multi-éléments

**Capacités Spéciales**

* Gestion sophistiquée du contexte dans les scènes complexes
* Maintien de la cohérence entre objets multiples
* Compréhension des relations spatiales avancée

FLUX.1 Krea Dev
^^^^^^^^^^^^^^^

**Fiche Technique**

:Fournisseur: Black Forest Labs
:Architecture: Flux créatif avancé
:Endpoint: ``black-forest-labs/FLUX.1-Krea-dev``
:Focus: Innovation et originalité

**Orientation**

Création artistique poussée et génération de designs innovants sortant des schémas conventionnels.

═══════════════════════════════════════
Contrôle par Croquis (ControlNet)
═══════════════════════════════════════

Les modèles ControlNet permettent un contrôle précis de la génération via des inputs structurels (croquis, contours, structures).

Control Sketch
--------------

.. admonition:: Transformation Intelligente
   :class: important

   Transforme vos croquis manuels en rendus industriels détaillés tout en préservant l'intention du design original.

**Fiche Technique**

:Fournisseur: Stability AI
:Type: ControlNet pour extraction de structure
:Endpoint: ``v2beta/stable-image/control/sketch``
:Format: SDXL + ControlNet conditionnel
:Input: Image croquis (PNG/JPEG)

**Workflow de Transformation**

.. mermaid::

   graph LR
       A[Croquis manuel] --> B[Extraction contours]
       B --> C[ControlNet Sketch]
       C --> D[SDXL conditionné]
       D --> E[Image détaillée]
       style C fill:#4CAF50

**Configuration Optimale**

.. code-block:: python

   {
       "control_strength": 0.7,        # Force du contrôle structurel
       "num_inference_steps": 35,
       "guidance_scale": 7.0,
       "controlnet_conditioning_scale": 0.8
   }

**Paramètres de Contrôle**

.. list-table::
   :widths: 25 25 50
   :header-rows: 1

   * - Paramètre
     - Plage
     - Effet
   * - control_strength
     - 0.5-0.9
     - Fidélité au croquis original
   * - guidance_scale
     - 5-9
     - Respect du prompt textuel
   * - conditioning_scale
     - 0.6-1.0
     - Influence du ControlNet

**Cas d'Usage**

* Mode "Croquis → Image" de l'application
* Transformation de dessins techniques manuels
* Exploration conceptuelle à partir d'esquisses rapides
* Affinage de formes organiques complexes

**Recommandations Input**

:Format: PNG ou JPEG
:Résolution: 1024×1024 minimum
:Contraste: Élevé (lignes noires sur fond blanc)
:Détails: Traits clairs et définis

Control Structure
-----------------

.. admonition:: Raffinement Itératif
   :class: tip

   Maintient la structure géométrique lors des améliorations successives, essentiel pour le design industriel.

**Fiche Technique**

:Fournisseur: Stability AI
:Type: ControlNet pour préservation structurelle
:Endpoint: ``v2beta/stable-image/control/structure``
:Usage: Raffinement basé sur feedback

**Workflow Itératif**

.. mermaid::

   graph TD
       A[Image V1] --> B[Feedback utilisateur]
       B --> C[Control Structure]
       C --> D[Image V2 améliorée]
       D --> E{Satisfait?}
       E -->|Non| B
       E -->|Oui| F[Image finale]
       style C fill:#2196F3

**Cas d'Usage**

* Améliorations itératives sans perdre la géométrie
* Raffinement basé sur retours DfX
* Conservation de l'ADN structurel du design
* Variations contrôlées d'un concept validé

**Avantages vs Génération Libre**

✓ Préserve les proportions critiques
✓ Maintient les axes de symétrie
✓ Conserve les relations spatiales
✓ Évite les déformations non-désirées

═══════════════════════════════════════
Génération et Analyse de Texte
═══════════════════════════════════════

Les modèles de langage orchestrent l'intelligence du système, de la génération de prompts à l'analyse technique avancée.

Mistral 7B - Brief Generator
-----------------------------

.. admonition:: Cerveau Linguistique
   :class: important

   LLM spécialisé générant des briefs design riches et traduisant l'intention utilisateur en prompts optimisés.

**Fiche Technique**

:Fournisseur: Mistral AI
:Architecture: Transformer 7B paramètres
:Endpoint: ``/v1/chat/completions``
:Modèle: ``mistral-small-latest``
:Contexte: 32k tokens

**Fonctions Principales**

1. **Génération Automatique de Prompts**
   
   Transforme un brief court utilisateur en prompt détaillé enrichi de vocabulaire technique.

   .. code-block:: python

      Input:  "chaise ergonomique pour bureau"
      Output: "ergonomic office chair with lumbar support,
               adjustable armrests, breathable mesh backrest,
               5-star base with casters, modern minimalist
               design, neutral color palette, DFM optimized"

2. **Traduction Contextuelle**
   
   Traduction français→anglais préservant les nuances techniques.

3. **Enrichissement DfX**
   
   Injection automatique de contraintes Design for X pertinentes.

4. **Raffinement Itératif**
   
   Amélioration de prompts basée sur l'analyse des générations précédentes.

**Configuration Typique**

.. code-block:: python

   {
       "model": "mistral-small-latest",
       "temperature": 0.7,          # Créativité modérée
       "max_tokens": 300,
       "top_p": 0.9,
       "frequency_penalty": 0.3     # Évite répétitions
   }

**Workflow de Génération**

.. mermaid::

   graph LR
       A[Brief FR] --> B[Mistral 7B]
       B --> C[Traduction EN]
       B --> D[Enrichissement DfX]
       C --> E[Prompt optimisé]
       D --> E
       E --> F[Génération image]
       style B fill:#FF9800

**Cas d'Usage**

* Assistant de rédaction de briefs
* Traduction technique automatique
* Enrichissement sémantique de prompts
* Génération de variantes créatives

Mistral Vision - DfX Analyzer
------------------------------

.. admonition:: Analyse Technique Avancée
   :class: important

   Modèle multimodal analysant automatiquement les images générées selon les principes DfX du design industriel.

**Fiche Technique**

:Fournisseur: Mistral AI
:Architecture: Vision-Language Model (VLM)
:Modalités: Image + Texte
:Capacité: Analyse technique industrielle

**Métriques DfX Analysées**

Design for Assembly (DFA)
^^^^^^^^^^^^^^^^^^^^^^^^^^

:Objectif: Évaluer la simplicité d'assemblage
:Métriques extraites:
   * Nombre de pièces distinctes
   * Types de fixations (vis, clips, soudure)
   * Complexité des interfaces
   * Accessibilité des points d'assemblage

:Score: 0-100 (100 = optimal)

Design for Manufacturing (DFM)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

:Objectif: Évaluer la fabricabilité
:Métriques extraites:
   * Épaisseur de paroi (mm)
   * Angles de dépouille (degrés)
   * Rayons de congé
   * Contre-dépouilles détectées
   * Complexité géométrique

:Score: 0-100 (100 = facile à fabriquer)

Design for Service (DFS)
^^^^^^^^^^^^^^^^^^^^^^^^^

:Objectif: Évaluer la maintenabilité
:Métriques extraites:
   * Modularité (nombre de modules)
   * Accessibilité des composants
   * Facilité de démontage
   * Composants remplaçables

:Score: 0-100 (100 = très maintenable)

Design for Sustainability (DFSust)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

:Objectif: Évaluer l'impact environnemental
:Métriques extraites:
   * Matériaux recyclables identifiés
   * Mono-matériau vs multi-matériaux
   * Efficacité matière
   * Durabilité estimée

:Score: 0-100 (100 = très durable)

**Workflow d'Analyse**

.. mermaid::

   graph TD
       A[Image générée] --> B[Mistral Vision]
       B --> C[Extraction métriques DFA]
       B --> D[Extraction métriques DFM]
       B --> E[Extraction métriques DFS]
       B --> F[Extraction métriques DFSust]
       C --> G[Rapport consolidé]
       D --> G
       E --> G
       F --> G
       G --> H[Recommandations]
       style B fill:#673AB7

**Format de Sortie**

.. code-block:: json

   {
       "dfa_score": 78,
       "dfa_metrics": {
           "part_count": 12,
           "fastener_types": ["screws", "clips"],
           "assembly_complexity": "medium"
       },
       "dfm_score": 85,
       "dfm_metrics": {
           "wall_thickness": "2.5mm",
           "draft_angles": "3°",
           "undercuts": 1
       },
       "recommendations": [
           "Réduire le nombre de pièces pour améliorer DFA",
           "Augmenter les angles de dépouille à 5° pour DFM"
       ]
   }

**Intégration Workflow**

L'analyse DfX intervient automatiquement après chaque génération, fournissant un feedback immédiat pour le raffinement itératif.

═══════════════════════════════════════
Génération 3D
═══════════════════════════════════════

Stable Fast 3D
--------------

.. admonition:: Transformation 2D → 3D
   :class: success

   Génère des modèles 3D texturés optimisés à partir d'images 2D, complétant le workflow du design industriel.

**Fiche Technique**

:Fournisseur: Stability AI
:Type: Reconstruction 3D par IA
:Format de sortie: GLB (glTF Binary)
:Textures: PBR (Physically Based Rendering)
:Géométrie: Mesh optimisé

**Endpoints Multiples (Fallback)**

L'API Stable Fast 3D dispose de plusieurs endpoints testés pour assurer la disponibilité:

.. code-block:: text

   1. https://api.stability.ai/v2beta/stable-image/3d/stable-fast-3d
   2. https://api.stability.ai/v1/generation/3d/stable-fast-3d
   3. https://api.stability.ai/v1/generation/stable-fast-3d
   4. https://api.stability.ai/v2beta/3d/stable-fast-3d

Le système tente automatiquement les endpoints dans l'ordre jusqu'à succès.

**Paramètres Configurables**

.. list-table::
   :widths: 30 20 50
   :header-rows: 1

   * - Paramètre
     - Défaut
     - Description
   * - texture_resolution
     - 1024
     - Résolution des textures en pixels (512/1024/2048)
   * - foreground_ratio
     - 0.85
     - Ratio objet/fond pour l'extraction (0.7-0.95)
   * - remesh_option
     - triangle
     - Méthode de remaillage (triangle/quad/none)
   * - target_polycount
     - Auto
     - Nombre de polygones cible (optimisation)

**Workflow de Génération 3D**

.. mermaid::

   graph TD
       A[Image 2D source] --> B[Prétraitement]
       B --> C[Redimensionnement 1024×1024]
       C --> D[Upload API Stability]
       D --> E{Endpoint 1}
       E -->|Échec| F{Endpoint 2}
       F -->|Échec| G{Endpoint 3}
       G -->|Échec| H{Endpoint 4}
       E -->|Succès| I[Modèle GLB]
       F -->|Succès| I
       G -->|Succès| I
       H -->|Succès| I
       H -->|Échec total| J[Fallback: Cube démo]
       I --> K[Génération thumbnail]
       J --> K
       K --> L[Sauvegarde locale]
       style I fill:#4CAF50
       style J fill:#FF9800

**Pipeline Technique Détaillé**

1. **Préparation Image**
   
   * Redimensionnement à 1024×1024 (optimal pour l'API)
   * Conversion en RGB si nécessaire
   * Optimisation de la compression

2. **Extraction Géométrique**
   
   * Détection de silhouette
   * Estimation de profondeur
   * Reconstruction volumétrique

3. **Génération de Mesh**
   
   * Triangulation adaptative
   * Optimisation topologique
   * Suppression d'artefacts

4. **Projection de Texture**
   
   * Unwrapping UV automatique
   * Projection multi-vues
   * Génération de normales

5. **Export GLB**
   
   * Format glTF 2.0 binaire
   * Textures embarquées
   * Métadonnées complètes

**Caractéristiques du GLB Généré**

:Format: glTF 2.0 Binary (.glb)
:Géométrie: Mesh triangulé optimisé
:Textures: Diffuse (albedo) + Normal map
:Matériaux: PBR standard
:Taille: 5-50 MB (selon complexité)
:Compatibilité: Three.js, Blender, Unity, Unreal

**Fallback Intelligent**

En cas d'échec total de tous les endpoints, le système génère automatiquement un **modèle 3D de démonstration** (cube GLB minimal) pour assurer la continuité du workflow sans blocage utilisateur.

**Analyse DfX pour Modèles 3D**

Les modèles 3D générés peuvent être analysés selon les mêmes principes DfX que les images 2D, avec adaptations:

* **DFA 3D**: Analyse des intersections et encastrements
* **DFM 3D**: Vérification des épaisseurs de paroi en volume
* **DFS 3D**: Évaluation de la démontabilité spatiale
* **DFSust 3D**: Calcul du volume et estimation de masse

═══════════════════════════════════════
Tableau Comparatif Synthétique
═══════════════════════════════════════

.. list-table:: Matrice Complète des Modèles
   :widths: 15 12 10 20 12 10 21
   :header-rows: 1

   * - Modèle
     - Fournisseur
     - Type
     - Endpoint
     - Résolution
     - Vitesse
     - Usage Principal
   * - **SD3 Medium**
     - Hugging Face
     - T2I
     - stabilityai/sd-3-medium-diffusers
     - SDXL
     - ★★★★☆
     - Design rapide & itératif
   * - **SD3.5 Large**
     - Hugging Face
     - T2I
     - stabilityai/sd-3.5-large
     - SDXL
     - ★★☆☆☆
     - Rendus haute fidélité
   * - **SD XL Base**
     - Hugging Face
     - T2I
     - stabilityai/sd-xl-base-1.0
     - SDXL multi
     - ★★★☆☆
     - Détails fins multi-formats
   * - **SD3.5 Turbo**
     - Hugging Face
     - T2I
     - stabilityai/sd-3.5-large-turbo
     - SDXL
     - ★★★★★
     - Itérations ultra-rapides
   * - **FLUX.1 Schnell**
     - Black Forest
     - Flux2I
     - FLUX.1-schnell
     - SDXL
     - ★★★★★
     - Concepts instantanés
   * - **FLUX.1 Dev**
     - Black Forest
     - Flux2I
     - FLUX.1-dev
     - SDXL
     - ★★★☆☆
     - Expérimentation recherche
   * - **FLUX Kontext**
     - Black Forest
     - Flux2I
     - FLUX.1-Kontext-dev
     - SDXL
     - ★★★☆☆
     - Cohérence contextuelle
   * - **FLUX Krea**
     - Black Forest
     - Flux2I
     - FLUX.1-Krea-dev
     - SDXL
     - ★★★☆☆
     - Création artistique
   * - **Control Sketch**
     - Stability AI
     - ControlNet
     - control/sketch
     - SDXL+CN
     - ★★★☆☆
     - Croquis → Image
   * - **Control Structure**
     - Stability AI
     - ControlNet
     - control/structure
     - SDXL+CN
     - ★★★☆☆
     - Raffinement itératif
   * - **Mistral 7B**
     - Mistral AI
     - LLM
     - /v1/chat/completions
     - 7B params
     - ★★★★★
     - Briefs & traduction
   * - **Mistral Vision**
     - Mistral AI
     - VLM
     - API Vision
     - Multimodal
     - ★★★★☆
     - Analyse DfX
   * - **Stable Fast 3D**
     - Stability AI
     - I23D
     - Multiple endpoints
     - GLB 3D
     - ★★★☆☆
     - Génération 3D

**Légende Vitesse:**
   * ★★★★★ : <3 secondes
   * ★★★★☆ : 3-10 secondes
   * ★★★☆☆ : 10-20 secondes
   * ★★☆☆☆ : 20-40 secondes


Contact & Contribution
======================

.. admonition:: Informations Projet
   :class: tip

   **Développeur** : Oussama Fahim
   
   **Institution** : ENSAM Meknès, Université Moulay Ismail
   
   **Encadrants** : 
   
   * M. Tawfik Masrour (Chef de Filière, Expert IA & Génie Industriel)
   * Mme Ibtissam El Hassani (Experte Design Industriel)
   
   **Année** : 2024-2025
   
   **Type** : Projet d'Expertise en Génie Industriel

.. note::
   Cette documentation est en constante évolution. Pour toute question, suggestion ou contribution, 
   n'hésitez pas à consulter la section FAQ ou à contacter l'équipe de développement.

----

.. centered:: © 2025 Ideate Studio - ENSAM Meknès. Tous droits réservés.





