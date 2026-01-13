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
.. Ideate - Documentation Technique documentation master file, created by
   sphinx-quickstart on Mon Jan 13 2025.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. _ideate-docs:

Approches Stratégiques de Conception Industrielle Assistée par IA
==========================================================================

.. list-table::
   :widths: 33 33 33
   :header-rows: 0
   :class: feature-grid

   * - ⚡ **Design Rapide**
     - 🔄 **Design Itératif**
     - 🧊 **Transformation 3D**
   * - Génération express avec analyse DfX temps réel
     - Raffinement progressif par cycles d'amélioration
     - Conversion IA d'images en modèles 3D optimisés

Approche 1: Design Rapide avec Pipeline DfX Intégré
---------------------------------------------------

.. grid:: 2
   :gutter: 3

   .. grid-item-card::
      :class-header: bg-primary
      :link: #workflow-design-rapide
      :link-type: ref

      **🎯 Objectif Principal**
      ^^^^^^^^^^^^^^^^^^^^^^^^^

      Génération ultra-rapide de concepts pré-évalués pour la phase d'exploration initiale

      .. list-table::
         :widths: 30 70
         :header-rows: 0

         * - **Temps moyen**
           - 45-90 secondes
         * - **Complexité**
           - Faible
         * - **Métriques**
           - Score DfX temps réel
         * - **Sorties**
           - PNG + Rapport complet

   .. grid-item-card::
      :class-header: bg-secondary
      :link: #architecture-technique
      :link-type: ref

      **🏗️ Architecture Technique**
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      .. code-block:: javascript
         :linenos:

         // Pipeline de génération DfX intégré
         const pipelineDesignRapide = {
           phase1: "Brief IA avec Mistral 7B",
           phase2: "Génération SDXL/ControlNet",
           phase3: "Analyse DfX automatique",
           phase4: "Recommandations IA",
           phase5: "Export multi-format"
         };

**Points Forts de l'Approche**

.. admonition:: ⚡ Vitesse d'exécution
   :class: tip
   
   Génération complète en moins de 2 minutes avec analyse DfX incluse

.. admonition:: 🎯 Précision DfX
   :class: note
   
   Évaluation sur 4 aspects : Assemblage, Fabrication, Service, Durabilité

.. admonition:: 🔄 Feedback immédiat
   :class: important
   
   Scores et recommandations disponibles instantanément

Approche 2: Design Itératif avec Cycle d'Amélioration
-----------------------------------------------------

.. grid:: 2
   :gutter: 3

   .. grid-item-card::
      :class-header: bg-success
      :link: #workflow-iteratif
      :link-type: ref

      **🎯 Objectif Stratégique**
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^

      Optimisation progressive par boucles d'amélioration pour designs complexes

      .. list-table::
         :widths: 30 70
         :header-rows: 0

         * - **Durée moyenne**
           - 15-45 minutes
         * - **Itérations**
           - 3-8 cycles
         * - **Feedback**
           - Humain + IA
         * - **Export**
           - Historique complet

   .. grid-item-card::
      :class-header: bg-warning
      :link: #workflow-iteratif-detail
      :link-type: ref

      **🔄 Processus Itératif**
      ^^^^^^^^^^^^^^^^^^^^^^^^^

      .. mermaid::
         
         graph TD
           A[Brief Initial] --> B[Génération V1]
           B --> C{Évaluation}
           C -->|Satisfait| D[Finalisation]
           C -->|Amélioration| E[Feedback]
           E --> F[Régénération]
           F --> C

**Caractéristiques Avancées**

.. tabs::

   .. tab:: 🎨 Interface Interactive

      Interface optimisée pour le feedback continu :
      
      .. code-block:: javascript
         :linenos:
         :emphasize-lines: 5-8

         const IterativeInterface = () => {
           const [feedback, setFeedback] = useState("");
           const [iterations, setIterations] = useState([]);
           
           // Système de feedback en temps réel
           const handleFeedback = async (feedbackText) => {
             const refined = await api.refineWithAI(feedbackText);
             return refined;
           };
         };

   .. tab:: 📊 Suivi d'Évolution

      Monitoring détaillé des améliorations :
      
      .. list-table::
         :widths: 25 25 25 25
         :header-rows: 1
         
         * - Itération
           - Score DfX
           - Amélioration
           - Temps
         * - #1
           - 0.65
           - Base
           - 2:15
         * - #2
           - 0.78
           - +13%
           - 1:45
         * - #3
           - 0.89
           - +11%
           - 1:30

   .. tab:: 🧠 Intelligence Collective

      Combinaison feedback humain + analyse IA :

+----------------------+--------------------------+
| **Analyse IA**       | **Expertise Humaine**    |
+======================+==========================+
| Reconnaissance       | Contexte métier          |
| des patterns         |                          |
+----------------------+--------------------------+
| Optimisation         | Ergonomie ressentie      |
| paramétrique         |                          |
+----------------------+--------------------------+
| Prédiction           | Critères esthétiques     |
| des scores           |                          |
+----------------------+--------------------------+


Approche 3: Transformation 3D avec Reconstruction IA
----------------------------------------------------

.. grid:: 2
   :gutter: 3

   .. grid-item-card::
      :class-header: bg-info
      :link: #workflow-3d
      :link-type: ref

      **🎯 Objectif Industriel**
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^

      Conversion automatique d'images 2D en modèles 3D manufacturables

      .. list-table::
         :widths: 30 70
         :header-rows: 0

         * - **Reconstruction**
           - Stable Fast 3D
         * - **Précision**
           - ±2% dimensions
         * - **Formats**
           - GLB, OBJ, STL
         * - **Optimisation**
           - Auto-remeshing

   .. grid-item-card::
      :class-header: bg-danger
      :link: #tech-stack-3d
      :link-type: ref

      **🧠 Stack Technologique**
      ^^^^^^^^^^^^^^^^^^^^^^^^^^

      .. list-table::
         :widths: 40 60
         :header-rows: 1
         
         * - Composant
           - Technologie
         * - Reconstruction 3D
           - Stability AI Fast3D
         * - Segmentation
           - SAM (Segment Anything)
         * - Texturing
           - Neural Textures
         * - Optimisation
           - MeshLab + Blender

**Pipeline de Reconstruction 3D**

.. raw:: html

   <div class="pipeline-3d">
     <div class="pipeline-step">
       <div class="step-number">1</div>
       <h4>Segmentation</h4>
       <p>Isolation de l'objet principal</p>
     </div>
     <div class="pipeline-arrow">→</div>
     <div class="pipeline-step">
       <div class="step-number">2</div>
       <h4>Estimation Profondeur</h4>
       <p>Map de profondeur avec MiDaS</p>
     </div>
     <div class="pipeline-arrow">→</div>
     <div class="pipeline-step">
       <div class="step-number">3</div>
       <h4>Reconstruction</h4>
       <p>Génération du mesh 3D</p>
     </div>
     <div class="pipeline-arrow">→</div>
     <div class="pipeline-step">
       <div class="step-number">4</div>
       <h4>Texturing</h4>
       <p>Projection des textures</p>
     </div>
     <div class="pipeline-arrow">→</div>
     <div class="pipeline-step">
       <div class="step-number">5</div>
       <h4>Optimisation</h4>
       <p>Réduction polygones + UV mapping</p>
     </div>
   </div>

.. figure:: _static/3d_pipeline_diagram.png
   :alt: Diagramme du pipeline 3D complet
   :align: center
   :width: 100%
   :class: shadow-lg rounded-3

   *Figure 1.2 : Architecture du pipeline de transformation 3D automatisé*

Comparaison Stratégique des Approches
======================================

.. list-table:: Matrice de sélection d'approche
   :widths: 20 30 25 25
   :header-rows: 1
   :class: comparison-table
   :name: table-approaches-comparison

   * - **Critère**
     - **Design Rapide ⚡**
     - **Design Itératif 🔄**
     - **Transformation 3D 🧊**
   * - Temps d'exécution
     - 1-3 min
     - 15-45 min
     - 3-10 min
   * - Complexité
     - Faible
     - Moyenne à Élevée
     - Moyenne
   * - Interaction IA
     - Automatique
     - Guidée + Automatique
     - Automatique
   * - Sorties
     - PNG + DfX
     - Suite PNG + Évolution
     - GLB/OBJ/STL
   * - Meilleur usage
     - Exploration
     - Raffinement
     - Prototypage
   * - Expertise requise
     - Débutant
     - Intermédiaire
     - Technique

==========================================================================
Workflows Détaillés - Architectures et Exécution
================================================

.. _workflow-design-rapide:

Workflow 1: Pipeline de Design Rapide avec DfX
----------------------------------------------

.. figure:: _static/workflow_design_rapide_detailed.png
   :alt: Architecture détaillée du workflow Design Rapide
   :align: center
   :width: 100%
   :class: workflow-diagram

   *Figure 2.1 : Architecture technique du pipeline Design Rapide*

Étape 1: Génération de Brief Intelligent
-----------------------------------------

**Système Prompt Engineering Avancé**

.. code-block:: javascript
   :linenos:
   :caption: Générateur de prompt intelligent
   :emphasize-lines: 15-22

   class GenerateurPromptDesign {
     constructor() {
       this.categoriesProduits = {
         "Électronique Grand Public": ["smartphone", "ordinateur portable", "enceinte"],
         "Mobilier": ["chaise", "bureau", "étagère"],
         "Transport": ["trotinette", "vélo", "tableau de bord"],
         "Électroménager": ["machine à café", "mixeur", "grille-pain"],
         "Équipement Industriel": ["outil électrique", "panneau de contrôle"],
         "Éclairage": ["lampe de bureau", "lampe sur pied"],
         "Vêtements Connectés": ["traqueur d'activité", "lunettes connectées"]
       };
       
       this.donneesFocus = {
         "Facteur Forme": {
           "keyword": "facteur forme", 
           "details": ["lignes épurées", "proportions géométriques", "design compact"]
         },
         "Étude Matériaux": {
           "keyword": "innovation matériaux",
           "details": ["matériaux durables", "combinaisons matériaux novatrices"]
         }
       };
     }
     
     genererPrompt(categorie, focus, style, inputUtilisateur) {
       // Logique de combinaison intelligente
       return promptOptimise;
     }
   }

**Intégration Mistral 7B pour le NLP**

.. code-block:: python
   :linenos:
   :caption: API de génération de prompt avec Mistral

   @app.post("/api/generate-prompt")
   async def generate_prompt(request: PromptRequest):
       """
       Génère un prompt optimisé avec Mistral 7B
       """
       prompt_system = f"""
       Vous êtes un designer industriel expert spécialisé en {request.category}.
       Créez un prompt concis pour un {request.item} avec focus sur {request.focus}.
       Style: {request.style}
       Instructions additionnelles: {request.user_input}
       """
       
       response = await mistral_client.chat.completions.create(
           model="mistral-7b-instruct",
           messages=[{"role": "system", "content": prompt_system}],
           max_tokens=150,
           temperature=0.7
       )
       
       return {
           "success": True,
           "prompt": response.choices[0].message.content,
           "tokens_used": response.usage.total_tokens
       }

Étape 2: Génération d'Image Multi-Modèle
-----------------------------------------

**Architecture de Génération Duale**

.. tabs::

   .. tab:: Mode Texte→Image 🤖

      **Modèles Hugging Face Supportés**
      
      .. grid:: 3
         :gutter: 2
         
         .. grid-item::
            :class-card: model-card
            
            **SDXL Base**
            ^^^^^^^^^^^^
            
            *Résolution:* 1024px
            *Usage:* Généraliste
            *Vitesse:* Moyenne
            
         .. grid-item::
            :class-card: model-card
            
            **SD 3.5 Large**
            ^^^^^^^^^^^^^^^^
            
            *Résolution:* 1024px  
            *Usage:* Haute qualité
            *Vitesse:* Lente
            
         .. grid-item::
            :class-card: model-card
            
            **FLUX.1 Schnell**
            ^^^^^^^^^^^^^^^^^^
            
            *Résolution:* 1024px
            *Usage:* Rapide
            *Vitesse:* Très rapide

   .. tab:: Mode Croquis→Image 🎨

      **Pipeline ControlNet Stability AI**
      
      .. mermaid::
         
         graph LR
           A[Croquis Upload] --> B[Prétraitement]
           B --> C[Extraction Contours]
           C --> D[ControlNet SDXL]
           D --> E[Génération Guidée]
           E --> F[Image Finale]

**Code d'Orchestration de Génération**

.. code-block:: javascript
   :linenos:
   :caption: Service de génération d'images
   :emphasize-lines: 20-35

   class ImageGenerationService {
     async generateImage(params) {
       const { prompt, model, specifications, mode, sketch } = params;
       
       // Sélection du provider
       let provider;
       if (mode === "Croquis → Image") {
         provider = this.stabilityAIService;
       } else {
         provider = this.huggingFaceService;
       }
       
       // Configuration des paramètres
       const generationConfig = {
         prompt: prompt,
         negative_prompt: specifications.prompt_negatif,
         steps: specifications.etapes_inference,
         guidance_scale: specifications.echelle_guidage,
         width: specifications.largeur,
         height: specifications.hauteur,
         seed: specifications.seed_aleatoire ? 
               Math.floor(Math.random() * 2147483647) : 
               specifications.seed
       };
       
       // Ajout du croquis si disponible
       if (sketch && mode === "Croquis → Image") {
         generationConfig.sketch = sketch;
         generationConfig.control_strength = specifications.echelle_controlnet;
       }
       
       // Appel API
       const result = await provider.generate(generationConfig);
       
       return {
         image: result.images[0],
         seed: result.seed,
         provider: provider.name,
         metadata: generationConfig
       };
     }
   }

Étape 3: Analyse DfX Automatique
---------------------------------

**Système d'Évaluation Multi-Critères**

.. code-block:: python
   :linenos:
   :caption: Module d'analyse DfX
   :emphasize-lines: 10-25

   class DfxAnalyzer:
       def __init__(self):
           self.aspects = {
               'DFA': self.analyze_assembly,
               'DFM': self.analyze_manufacturing, 
               'DFS': self.analyze_service,
               'DFSust': self.analyze_sustainability
           }
           
       async def analyze_image(self, image_data, prompt, aspect, category):
           """
           Analyse complète DfX d'une image générée
           """
           # 1. Extraction des caractéristiques
           features = await self.extract_features(image_data)
           
           # 2. Analyse spécifique à l'aspect
           aspect_analysis = await self.aspects[aspect](features, prompt)
           
           # 3. Calcul du score composite
           score = self.calculate_score(aspect_analysis)
           
           # 4. Génération du rapport
           report = self.generate_report(features, aspect_analysis, score)
           
           return {
               'score': score,
               'metrics': aspect_analysis,
               'report': report,
               'qualifier': self.get_qualifier(score)
           }
       
       def calculate_score(self, metrics):
           """Calcul du score DfX pondéré"""
           weights = {
               'complexity': 0.3,
               'symmetry': 0.2,
               'part_count': 0.25,
               'material_efficiency': 0.25
           }
           
           total = sum(metrics[key] * weights[key] for key in weights)
           return round(total, 3)

**Métriques DfX Détaillées**

.. grid:: 2
   :gutter: 3

   .. grid-item::
   
      **DFA - Design for Assembly**
      
      .. list-table::
         :widths: 50 50
         :header-rows: 1
         
         * - Métrique
           - Poids
         * - Nombre de pièces
           - 25%
         * - Accessibilité
           - 20%
         * - Orientation
           - 15%
         * - Outillage
           - 20%
         * - Standardisation
           - 20%

   .. grid-item::
   
      **DFM - Design for Manufacturing**
      
      .. list-table::
         :widths: 50 50
         :header-rows: 1
         
         * - Métrique
           - Poids
         * - Complexité géométrique
           - 30%
         * - Tolérance dimensionnelle
           - 25%
         * - Matériaux
           - 20%
         * - Processus
           - 15%
         * - Coût estimé
           - 10%

Étape 4: Système de Recommandation IA
--------------------------------------

**Algorithme de Raffinement Intelligent**

.. code-block:: python
   :linenos:
   :caption: Service de recommandation DfX
   :emphasize-lines: 15-30

   class DfxRefinementService:
       def __init__(self):
           self.llm_client = MistralClient()
           self.rules_engine = DfxRulesEngine()
           
       async def generate_recommendations(self, current_design, dfx_scores):
           """
           Génère des recommandations d'amélioration basées sur les scores DfX
           """
           # Identification des points faibles
           weak_points = self.identify_weak_points(dfx_scores)
           
           # Génération de suggestions
           suggestions = []
           for point in weak_points:
               suggestion = await self.generate_suggestion(
                   point, 
                   current_design.prompt,
                   dfx_scores[point]
               )
               suggestions.append(suggestion)
           
           # Génération de prompt amélioré
           improved_prompt = await self.refine_prompt(
               current_design.prompt,
               suggestions
           )
           
           return {
               'improved_prompt': improved_prompt,
               'suggestions': suggestions,
               'expected_improvement': self.calculate_expected_improvement(dfx_scores, suggestions)
           }
       
       def identify_weak_points(self, scores, threshold=0.6):
           """Identifie les métriques sous le seuil acceptable"""
           return [metric for metric, score in scores.items() if score < threshold]

Étape 5: Export et Gestion de Projet
-------------------------------------

**Système d'Export Multi-Format**

.. code-block:: javascript
   :linenos:
   :caption: Service d'export de projets
   :emphasize-lines: 10-25

   class ProjectExportService {
     async exportProject(projectId, format = 'all') {
       const project = await this.getProject(projectId);
       const iterations = await this.getIterations(projectId);
       
       const exportData = {
         project: {
           metadata: project.metadata,
           settings: project.settings,
           timeline: project.timeline
         },
         iterations: iterations.map(iter => ({
           number: iter.iteration_number,
           prompt: iter.prompt,
           image_url: iter.image_url,
           dfx_score: iter.dfx_score,
           dfx_metrics: iter.dfx_metrics,
           created_at: iter.created_at
         }))
       };
       
       // Génération des différents formats
       switch(format) {
         case 'json':
           return this.exportAsJson(exportData);
         case 'pdf':
           return await this.exportAsPdf(exportData);
         case 'zip':
           return await this.exportAsZip(exportData);
         case 'all':
           return await this.exportAllFormats(exportData);
       }
     }
   }

.. _workflow-iteratif-detail:

Workflow 2: Processus Itératif d'Optimisation
==============================================

.. figure:: _static/workflow_iteratif_detailed.png
   :alt: Diagramme détaillé du workflow itératif
   :align: center
   :width: 100%
   :class: workflow-diagram

   *Figure 2.2 : Architecture du processus itératif en 5 phases*

Phase 1: Initialisation du Projet
----------------------------------

**Structure de Données de Projet Itératif**

.. code-block:: javascript
   :linenos:
   :caption: Modèle de projet itératif
   :emphasize-lines: 5-15

   const iterativeProjectSchema = {
     id: 'uuid',
     user_id: 'uuid',
     title: 'string',
     type: 'iterative',
     status: 'in_progress|completed|archived',
     
     // Paramètres initiaux
     initial_config: {
       category: 'Électronique Grand Public',
       focus: 'Facteur Forme',
       style: 'Minimaliste',
       prompt: 'string',
       sketch_data: 'base64|null'
     },
     
     // Suivi d'évolution
     timeline: [{
       iteration: 1,
       action: 'initial_generation',
       timestamp: 'ISO8601',
       score: 0.65,
       feedback: null
     }],
     
     // Configuration technique
     specifications: {
       aspect: 'DFM',
       model: 'Stable Diffusion 3.5 Large',
       resolution: '1024x1024'
     }
   };

Phase 2: Boucle d'Amélioration
-------------------------------

**Cycle d'Itération Automatisé**

.. mermaid::
   
   sequenceDiagram
     participant U as Utilisateur
     participant F as Frontend
     participant B as Backend
     participant AI as IA Service
     participant DB as Database
     
     U->>F: Soumet feedback d'amélioration
     F->>B: POST /api/iterative/improve
     B->>AI: Génère nouvelle version
     AI-->>B: Image + analyse DfX
     B->>DB: Sauvegarde itération
     DB-->>B: Confirmation
     B-->>F: Résultats + comparaison
     F-->>U: Affichage côte à côte

**Interface de Feedback Contextuel**

.. code-block:: javascript
   :linenos:
   :caption: Composant de feedback itératif
   :emphasize-lines: 25-40

   const IterativeFeedbackPanel = ({ iteration, onFeedbackSubmit }) => {
     const [feedback, setFeedback] = useState('');
     const [category, setCategory] = useState('general');
     
     // Catégories de feedback prédéfinies
     const feedbackCategories = [
       { id: 'shape', label: 'Forme/Proportions', examples: ['Plus arrondi', 'Plus mince', 'Plus large'] },
       { id: 'materials', label: 'Matériaux/Textures', examples: ['Texture métallique', 'Finition mate', 'Surface brillante'] },
       { id: 'functionality', label: 'Fonctionnalités', examples: ['Ajouter des ports', 'Améliorer la prise en main', 'Ajouter des LED'] },
       { id: 'style', label: 'Style/Esthétique', examples: ['Plus futuriste', 'Style vintage', 'Design minimaliste'] }
     ];
     
     // Suggestions automatiques basées sur l'analyse DfX
     const autoSuggestions = iteration.dfx_metrics?.weak_points.map(point => 
       `Améliorer ${point.name}: ${point.suggestion}`
     ) || [];
     
     const handleSubmit = async () => {
       const feedbackData = {
         text: feedback,
         category: category,
         iteration_id: iteration.id,
         timestamp: new Date().toISOString(),
         // Analyse de sentiment
         sentiment: await analyzeSentiment(feedback)
       };
       
       await onFeedbackSubmit(feedbackData);
     };
     
     return (
       <div className="feedback-panel">
         <textarea
           value={feedback}
           onChange={(e) => setFeedback(e.target.value)}
           placeholder="Décrivez les améliorations souhaitées..."
           rows={4}
         />
         
         <div className="suggestions-grid">
           {autoSuggestions.map((suggestion, idx) => (
             <button key={idx} onClick={() => setFeedback(suggestion)}>
               {suggestion}
             </button>
           ))}
         </div>
       </div>
     );
   };

Phase 3: Analyse Comparative
-----------------------------

**Visualisation d'Évolution**

.. code-block:: javascript
   :linenos:
   :caption: Composant de comparaison d'itérations
   :emphasize-lines: 15-30

   const IterationComparisonView = ({ iterations, currentIteration }) => {
     // Données pour le graphique d'évolution
     const evolutionData = {
       labels: iterations.map(i => `Itération ${i.number}`),
       datasets: [
         {
           label: 'Score DfX',
           data: iterations.map(i => i.dfx_score * 100),
           borderColor: 'rgb(59, 130, 246)',
           backgroundColor: 'rgba(59, 130, 246, 0.1)',
           tension: 0.3
         }
       ]
     };
     
     // Calcul des améliorations
     const improvements = iterations.map((iter, idx) => {
       if (idx === 0) return { percent: 0, details: 'Base' };
       const prevScore = iterations[idx - 1].dfx_score;
       const improvement = ((iter.dfx_score - prevScore) / prevScore) * 100;
       
       return {
         percent: Math.round(improvement * 10) / 10,
         details: iter.feedback || 'Amélioration automatique'
       };
     });
     
     return (
       <div className="comparison-container">
         <div className="score-evolution">
           <Line data={evolutionData} />
         </div>
         
         <div className="improvement-list">
           {improvements.map((imp, idx) => (
             <div key={idx} className="improvement-item">
               <span className="iteration">#{idx + 1}</span>
               <span className="percent">+{imp.percent}%</span>
               <span className="details">{imp.details}</span>
             </div>
           ))}
         </div>
       </div>
     );
   };

Phase 4: Décision de Finalisation
----------------------------------

**Critères d'Arrêt Intelligents**

.. code-block:: javascript
   :linenos:
   :caption: Système de décision de finalisation
   :emphasize-lines: 10-25

   class TerminationDecisionSystem {
     constructor() {
       this.thresholds = {
         score_target: 0.85,
         max_iterations: 10,
         min_improvement: 0.02,
         max_time_minutes: 60
       };
     }
     
     shouldTerminate(project) {
       const currentIteration = project.iterations[project.iterations.length - 1];
       const totalTime = this.calculateTotalTime(project);
       
       // Critère 1: Score cible atteint
       if (currentIteration.dfx_score >= this.thresholds.score_target) {
         return { terminate: true, reason: 'score_target_reached' };
       }
       
       // Critère 2: Nombre maximal d'itérations
       if (project.iterations.length >= this.thresholds.max_iterations) {
         return { terminate: true, reason: 'max_iterations_reached' };
       }
       
       // Critère 3: Amélioration minimale non atteinte
       if (project.iterations.length > 3) {
         const recentImprovements = this.calculateRecentImprovements(project);
         if (recentImprovements < this.thresholds.min_improvement) {
           return { terminate: true, reason: 'diminishing_returns' };
         }
       }
       
       // Critère 4: Temps maximal dépassé
       if (totalTime > this.thresholds.max_time_minutes * 60 * 1000) {
         return { terminate: true, reason: 'time_limit_reached' };
       }
       
       return { terminate: false, reason: null };
     }
   }

Phase 5: Génération de Rapport Final
-------------------------------------

**Rapport d'Optimisation Complet**

.. code-block:: javascript
   :linenos:
   :caption: Génération du rapport final itératif
   :emphasize-lines: 20-35

   class IterativeReportGenerator {
     async generateFinalReport(project) {
       const report = {
         // Métadonnées
         project: project.metadata,
         summary: this.generateSummary(project),
         
         // Analyse quantitative
         metrics: {
           total_iterations: project.iterations.length,
           total_time: this.formatDuration(project.timeline),
           final_score: project.iterations[project.iterations.length - 1].dfx_score,
           score_improvement: this.calculateTotalImprovement(project),
           best_iteration: this.findBestIteration(project)
         },
         
         // Analyse qualitative
         evolution_analysis: this.analyzeEvolution(project),
         key_decisions: this.extractKeyDecisions(project),
         recommendations: this.generateRecommendations(project),
         
         // Visualisations
         charts: {
           score_evolution: this.generateScoreChart(project),
           improvement_timeline: this.generateImprovementChart(project),
           comparison_grid: this.generateComparisonGrid(project.iterations)
         },
         
         // Export des assets
         assets: {
           images: project.iterations.map(i => i.image_url),
           prompts: project.iterations.map(i => i.prompt),
           feedback: project.iterations.filter(i => i.feedback).map(i => i.feedback)
         }
       };
       
       return report;
     }
   }

.. _workflow-3d-detailed:

Workflow 3: Pipeline de Transformation 3D
----------------------------------------

.. figure:: _static/workflow_3d_detailed.png
   :alt: Architecture détaillée du pipeline 3D
   :align: center
   :width: 100%
   :class: workflow-diagram

   *Figure 2.3 : Architecture complète du pipeline de transformation 3D*

Étape 1: Prétraitement d'Image Avancé
--------------------------------------

**Pipeline de Prétraitement Automatique**

.. code-block:: python
   :linenos:
   :caption: Service de prétraitement d'images
   :emphasize-lines: 15-30

   class ImagePreprocessor3D:
       def __init__(self):
           self.segmentor = SAM()
           self.depth_estimator = MiDaS()
           self.quality_checker = QualityChecker()
           
       async def preprocess_image(self, image_file, params):
           """
           Prépare l'image pour la reconstruction 3D
           """
           # 1. Chargement et validation
           image = await self.load_image(image_file)
           validation = await self.validate_image_quality(image)
           
           if not validation.valid:
               raise ValueError(f"Image non valide: {validation.reason}")
           
           # 2. Redimensionnement optimal
           target_size = self.calculate_optimal_size(params.texture_resolution)
           resized = await self.resize_image(image, target_size)
           
           # 3. Segmentation automatique
           mask = await self.segmentor.segment(resized)
           
           # 4. Estimation de profondeur
           depth_map = await self.depth_estimator.estimate(resized)
           
           # 5. Amélioration du contraste
           enhanced = await self.enhance_contrast(resized, mask)
           
           # 6. Génération du masque alpha
           alpha_mask = await self.generate_alpha_mask(resized, mask)
           
           return {
               'image': enhanced,
               'mask': mask,
               'depth_map': depth_map,
               'alpha_mask': alpha_mask,
               'metadata': {
                   'original_size': image.shape[:2],
                   'processed_size': target_size,
                   'segmentation_confidence': mask.confidence,
                   'depth_range': depth_map.range
               }
           }
       
       def calculate_optimal_size(self, texture_resolution):
           """Calcule la taille optimale pour la reconstruction"""
           base_size = texture_resolution
           # Arrondi à la puissance de 2 la plus proche
           return 2 ** int(np.log2(base_size))

Étape 2: Reconstruction 3D avec Stable Fast 3D
-----------------------------------------------

**Configuration de Reconstruction**

.. code-block:: python
   :linenos:
   :caption: Service de reconstruction 3D
   :emphasize-lines: 20-40

   class Fast3DReconstructionService:
       def __init__(self, api_key):
           self.client = StabilityClient(api_key=api_key)
           self.config_presets = {
               'high_quality': {
                   'texture_resolution': 2048,
                   'foreground_ratio': 0.9,
                   'remesh': 'quad',
                   'optimize_for': 'rendering'
               },
               'fast': {
                   'texture_resolution': 1024,
                   'foreground_ratio': 0.85,
                   'remesh': 'triangle',
                   'optimize_for': 'speed'
               },
               'print_ready': {
                   'texture_resolution': 1024,
                   'foreground_ratio': 0.8,
                   'remesh': 'none',
                   'optimize_for': '3d_printing'
               }
           }
           
       async def reconstruct_3d(self, processed_image, params):
           """
           Reconstruction 3D avec Stable Fast 3D
           """
           # Sélection du preset
           preset = self.select_preset(params)
           
           # Préparation des données
           reconstruction_data = {
               'image': processed_image['image'],
               'mask': processed_image['mask'],
               'depth_map': processed_image['depth_map'],
               'config': {
                   **preset,
                   'output_format': 'glb',
                   'generate_uvs': True,
                   'generate_normals': True,
                   'center_model': True,
                   'scale_to_meters': True
               }
           }
           
           # Appel API Stability AI
           try:
               response = await self.client.fast3d.generate(
                   **reconstruction_data,
                   timeout=300  # 5 minutes timeout
               )
               
               return {
                   'success': True,
                   'model_url': response.model_url,
                   'thumbnail_url': response.thumbnail_url,
                   'metadata': {
                       'vertices': response.vertex_count,
                       'faces': response.face_count,
                       'textures': response.texture_count,
                       'file_size': response.file_size,
                       'processing_time': response.processing_time
                   },
                   'warnings': response.warnings
               }
               
           except Exception as e:
               logger.error(f"Reconstruction failed: {str(e)}")
               return {
                   'success': False,
                   'error': str(e),
                   'fallback_attempted': False
               }

Étape 3: Post-traitement et Optimisation
-----------------------------------------

**Pipeline d'Optimisation Automatique**

.. code-block:: python
   :linenos:
   :caption: Service d'optimisation de maillage
   :emphasize-lines: 25-45

   class MeshOptimizationService:
       def __init__(self):
           self.optimizers = {
               'decimation': self.optimize_decimation,
               'remeshing': self.optimize_remeshing,
               'repair': self.repair_mesh,
               'uv_unwrap': self.unwrap_uv
           }
           
       async def optimize_model(self, model_path, optimization_profile):
           """
           Optimise le modèle 3D selon le profil spécifié
           """
           # Chargement du modèle
           mesh = await self.load_mesh(model_path)
           
           # Application des optimisations
           optimized_mesh = mesh.copy()
           
           # 1. Réparation topologique
           if optimization_profile.get('repair', True):
               optimized_mesh = await self.optimizers['repair'](optimized_mesh)
           
           # 2. Réduction de polygones
           if optimization_profile.get('decimate', True):
               target_faces = optimization_profile.get('target_faces', 50000)
               optimized_mesh = await self.optimizers['decimation'](
                   optimized_mesh, 
                   target_faces
               )
           
           # 3. Remaillage
           remesh_option = optimization_profile.get('remesh', 'triangle')
           if remesh_option != 'none':
               optimized_mesh = await self.optimizers['remeshing'](
                   optimized_mesh,
                   remesh_option
               )
           
           # 4. UV Unwrapping
           if optimization_profile.get('unwrap_uv', True):
               optimized_mesh = await self.optimizers['uv_unwrap'](optimized_mesh)
           
           # 5. Génération des normales
           if optimization_profile.get('generate_normals', True):
               optimized_mesh = self.generate_normals(optimized_mesh)
           
           # Analyse des améliorations
           improvements = self.analyze_improvements(mesh, optimized_mesh)
           
           return {
               'optimized_mesh': optimized_mesh,
               'improvements': improvements,
               'download_url': await self.save_mesh(optimized_mesh)
           }
       
       def analyze_improvements(self, original, optimized):
           """Calcule les améliorations apportées"""
           return {
               'face_reduction': 1 - (optimized.face_count / original.face_count),
               'vertex_reduction': 1 - (optimized.vertex_count / original.vertex_count),
               'manifold_fixed': original.non_manifold_edges - optimized.non_manifold_edges,
               'uv_islands': optimized.uv_island_count
           }

Étape 4: Validation et Contrôle Qualité
----------------------------------------

**Système de Validation Automatique**

.. code-block:: python
   :linenos:
   :caption: Service de validation 3D
   :emphasize-lines: 20-35

   class ModelValidationService:
       def __init__(self):
           self.validators = {
               'watertight': self.validate_watertight,
               'normals': self.validate_normals,
               'uv': self.validate_uv,
               'dimensions': self.validate_dimensions,
               'printability': self.validate_printability
           }
           
       async def validate_model(self, model_path, validation_profile):
           """
           Validation complète du modèle 3D généré
           """
           mesh = await self.load_mesh(model_path)
           results = {}
           
           # Exécution des validations
           for validator_name, should_run in validation_profile.items():
               if should_run:
                   validator = self.validators[validator_name]
                   results[validator_name] = await validator(mesh)
           
           # Calcul du score global
           overall_score = self.calculate_overall_score(results)
           
           # Génération du rapport
           report = {
               'validation_results': results,
               'overall_score': overall_score,
               'status': 'PASS' if overall_score >= 0.8 else 'FAIL',
               'issues': self.extract_issues(results),
               'recommendations': self.generate_recommendations(results)
           }
           
           return report
       
       def validate_printability(self, mesh):
           """Valide l'aptitude à l'impression 3D"""
           checks = {
               'wall_thickness': self.check_wall_thickness(mesh),
               'overhangs': self.check_overhangs(mesh),
               'bridges': self.check_bridges(mesh),
               'supports_needed': self.estimate_supports(mesh)
           }
           
           return {
               'passed': all(checks.values()),
               'details': checks,
               'suggestions': self.generate_print_suggestions(checks)
           }

Étape 5: Export Multi-Format et Intégration
--------------------------------------------

**Système d'Export Universel**

.. code-block:: python
   :linenos:
   :caption: Service d'export 3D
   :emphasize-lines: 25-50

   class ModelExportService:
       SUPPORTED_FORMATS = {
           'glb': {'type': 'binary', 'features': ['textures', 'animations']},
           'obj': {'type': 'text', 'features': ['materials', 'uvs']},
           'stl': {'type': 'binary', 'features': ['geometry_only']},
           'fbx': {'type': 'binary', 'features': ['full_scene', 'animations']},
           'ply': {'type': 'text', 'features': ['point_clouds']}
       }
       
       async def export_model(self, model_path, export_formats, options=None):
           """
           Exporte le modèle dans les formats demandés
           """
           mesh = await self.load_mesh(model_path)
           exports = {}
           
           for format_name in export_formats:
               if format_name not in self.SUPPORTED_FORMATS:
                   continue
                   
               format_info = self.SUPPORTED_FORMATS[format_name]
               
               # Conversion vers le format cible
               if format_name == 'glb':
                   exported = await self.export_glb(mesh, options)
               elif format_name == 'obj':
                   exported = await self.export_obj(mesh, options)
               elif format_name == 'stl':
                   exported = await self.export_stl(mesh, options)
               elif format_name == 'fbx':
                   exported = await self.export_fbx(mesh, options)
               elif format_name == 'ply':
                   exported = await self.export_ply(mesh, options)
               
               exports[format_name] = {
                   'url': exported.url,
                   'size': exported.size,
                   'checksum': exported.checksum,
                   'metadata': {
                       'format': format_name,
                       'vertices': mesh.vertex_count,
                       'faces': mesh.face_count,
                       'textures': len(mesh.textures) if hasattr(mesh, 'textures') else 0
                   }
               }
           
           # Génération du package complet
           if 'all' in export_formats or len(export_formats) > 1:
               package_url = await self.create_export_package(exports)
               exports['package'] = {
                   'url': package_url,
                   'formats_included': list(exports.keys()),
                   'total_size': sum(e['size'] for e in exports.values())
               }
           
           return exports

**Intégration avec les Écosystèmes 3D**

.. list-table:: Compatibilité des Formats d'Export
   :widths: 20 20 20 20 20
   :header-rows: 1
   :class: export-compatibility-table

   * - **Format**
     - **Blender**
     - **Unity**
     - **Unreal**
     - **Imprimante 3D**
   * - GLB
     - ✅ Native
     - ✅ Native
     - ✅ Native
     - ⚠️ Via plugin
   * - OBJ
     - ✅ Native
     - ✅ Native
     - ✅ Native
     - ✅ Direct
   * - STL
     - ✅ Native
     - ⚠️ Plugin
     - ⚠️ Plugin
     - ✅ Native
   * - FBX
     - ✅ Native
     - ✅ Native
     - ✅ Native
     - ❌ Non
   * - PLY
     - ✅ Native
     - ⚠️ Plugin
     - ⚠️ Plugin
     - ⚠️ Conversion



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








