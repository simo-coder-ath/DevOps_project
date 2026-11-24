# Gestion d'utilisateurs

Application full stack de gestion d'utilisateurs (CRUD) : frontend Nginx, backend Spring Boot, base PostgreSQL, le tout conteneurisé avec Docker Compose.

![Pipeline](https://img.shields.io/badge/pipeline-GitLab%20CI-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Licence](https://img.shields.io/badge/licence-MIT-green)

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Persistance des données](#persistance-des-données)
- [Tests](#tests)
- [Qualité du code (pre-commit)](#qualité-du-code-pre-commit)
- [Pipeline CI/CD](#pipeline-cicd)
- [Workflow Git](#workflow-git)
- [Versionnement (SemVer)](#versionnement-semver)
- [Lancer la version publiée](#lancer-la-version-publiée)
- [Structure du dépôt](#structure-du-dépôt)

## Architecture

```
Navigateur ──► Frontend (Nginx :8080) ──/api/──► Backend (Spring Boot :8080) ──► PostgreSQL
                                                                                    │
                                                                              volume db_data
```

| Service    | Technologie            | Rôle                                              |
|------------|------------------------|---------------------------------------------------|
| `frontend` | HTML / JS / Nginx      | Sert la page et fait le proxy de `/api/` (préfixe retiré) |
| `backend`  | Java, Spring Boot      | API REST `/users`                                 |
| `db`       | PostgreSQL             | Stockage persistant (volume nommé)                |

Seul le frontend expose un port (8080) ; le backend et la base ne sont accessibles que sur le réseau interne Docker.

## Prérequis

| Outil                | Version conseillée | Usage                          |
|----------------------|--------------------|--------------------------------|
| Docker + Compose v2  | récente            | Lancer la stack                |
| Java JDK + Maven     | 17+ / 3.9+         | Tests et lint backend en local |
| Node.js              | 20+                | Tests frontend, Playwright     |
| Python + pip         | 3.10+              | Installer `pre-commit`         |
| Git                  | 2.30+              | Versionnement                  |

> Pour simplement lancer l'application, seul Docker est nécessaire.

## Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone <URL_DU_DEPOT>
cd <NOM_DU_DEPOT>

# 2. Créer le fichier d'environnement
cp .env.example .env          # Windows (cmd) : copy .env.example .env
# puis éditer .env et choisir un mot de passe

# 3. Lancer la stack
docker compose up --build
```

L'application est disponible sur **http://localhost:8080**.

Arrêt :

```bash
docker compose down           # conserve les données
docker compose down -v        # supprime aussi le volume (données perdues)
```

## Configuration

La configuration passe par des variables d'environnement définies dans `.env` (jamais versionné ; seul `.env.example` l'est).

| Variable            | Description                    |
|---------------------|--------------------------------|
| `POSTGRES_DB`       | Nom de la base                 |
| `POSTGRES_USER`     | Utilisateur PostgreSQL         |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL        |

> Adapter ce tableau aux variables réellement présentes dans votre `.env.example`.

## Persistance des données

Les données sont stockées dans le volume nommé `db_data`. Elles survivent à la suppression des conteneurs et des images.

Test de persistance :

```bash
docker compose up --build
# ajouter un utilisateur sur http://localhost:8080
docker compose down --rmi local
docker compose up --build
# l'utilisateur est toujours présent
```

## Tests

Ordre d'exécution : unitaires → composant → intégration → E2E.

| Niveau      | Outils                  | Ce qui est réel / simulé                                   | Commande |
|-------------|-------------------------|------------------------------------------------------------|----------|
| Unitaires backend  | JUnit, Mockito   | Service réel, repository simulé                            | `mvn test` |
| Unitaires frontend | Vitest / Jest    | Fonctions pures réelles, `fetch` simulé                    | `npm test` |
| Composant   | MockMvc                 | Routes HTTP réelles, service/repository simulé             | `mvn test -Dtest=*ComponentTest` |
| Intégration | Spring + PostgreSQL     | Backend et base réels (`compose.test.yaml`, sans volume)   | `mvn verify -Pintegration` |
| E2E         | Playwright              | Stack Compose complète, parcours navigateur                | `npx playwright test` |

> Les tests ne touchent jamais le volume de développement : l'intégration utilise un projet Compose distinct (`compose.test.yaml`) sans volume persistant.

> Adapter les commandes à votre configuration réelle (profils Maven, noms de classes).

## Qualité du code (pre-commit)

Des hooks locaux exécutent le lint (Checkstyle) puis les tests unitaires avant chaque commit.

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files    # vérification manuelle complète
```

Un commit est bloqué si le lint ou un test unitaire échoue.

## Pipeline CI/CD

Le fichier `.gitlab-ci.yml` définit les stages `lint`, `test`, `build` et `release`.

| Événement déclencheur | Jobs exécutés                                   |
|-----------------------|-------------------------------------------------|
| Push / Merge request  | lint (frontend + backend en parallèle), tests   |
| Tag `v*`              | build, promotion de l'image, release            |
| Planification (schedule) | job dédié (`CI_PIPELINE_SOURCE == "schedule"`) |

Points clés :
- Lint front et back en parallèle ; lint + tests backend obligatoires avant fusion.
- Cache Maven pour accélérer les builds.
- Le `.jar` est produit en artifact, téléchargeable depuis la page du job.
- Les images sont construites **une seule fois** et poussées dans le Container Registry avec `$CI_COMMIT_SHA` ; sur tag, l'image est retaguée sans rebuild (même digest).
- Les secrets (clé SSH, tokens) sont stockés dans des variables CI/CD masquées/protégées ou de type File, jamais dans le dépôt.

## Workflow Git

### Cas 1 : SaaS déployé plusieurs fois par jour → GitHub Flow

```
main     ●────●────●────●────●
          \  / \  /
feature    ●●   ●●
```

- Une seule branche durable : `main`, toujours déployable.
- Chaque changement : branche courte `feature/*` → merge request → fusion dans `main`.
- **Revue** : dans la merge request, avant fusion.
- **Tests** : CI sur la MR (obligatoire avant fusion), puis sur `main`.

**Justification** : peu de branches, pas de cérémonie, fusion = livraison possible. Pas de versions multiples à maintenir.

### Cas 2 : release trimestrielle, 2 versions majeures maintenues → GitFlow

```
main      ●──────────────●──────────────●   (versions publiées, tags)
           \            / \            /
release     \      ●──●    \      ●──●
             \    /         \    /
develop       ●──●────●──●───●──●────●      (intégration)
               \  /
feature         ●●
support/1.x     ●──●──●                      (maintenance de la v1)
```

- Branches durables : `main` (versions publiées), `develop` (intégration).
- Branches temporaires : `feature/*` (depuis `develop`), `release/*` (stabilisation), `hotfix/*` (correctif urgent depuis `main`), `support/1.x` et `support/2.x` (maintenance des majeures).
- **Revue** : en MR vers `develop` (features) et vers `main` (release, hotfix).
- **Tests** : CI sur chaque MR ; tests de recette sur `release/*` ; non-régression sur `support/*`.

**Justification** : releases rares et planifiées, plusieurs majeures en parallèle : il faut isoler la stabilisation et la maintenance.

### Choix pour ce projet : GitHub Flow

Une seule version en production, livraisons fréquentes, équipe réduite : le modèle le plus simple suffit.

## Versionnement (SemVer)

Format `MAJOR.MINOR.PATCH`. Le numéro est calculé automatiquement par GitVersion (jamais écrit à la main).

| Changement                         | Incrément | Justification                          |
|------------------------------------|-----------|----------------------------------------|
| Correction d'un texte              | PATCH     | Aucun changement de comportement       |
| Nouvelle route compatible          | MINOR     | Ajout rétrocompatible                  |
| Suppression d'une route publique   | MAJOR     | Rupture de compatibilité               |
| Ajout d'un rôle                    | MINOR     | Fonctionnalité ajoutée sans rupture    |
| Correction d'un crash              | PATCH     | Correction de bug                      |

Forcer un incrément via un message de commit : `+semver: patch`, `+semver: minor` ou `+semver: major`.

Historique des versions : voir [CHANGELOG.md](CHANGELOG.md).

## Lancer la version publiée

```bash
docker login <REGISTRY_GITLAB>
docker compose pull
docker compose up -d
```

> Adapter pour pointer vers les images du Container Registry (tag `v1.0.0`).

## Structure du dépôt

```
.
├── backend/              # API Spring Boot + Dockerfile
├── frontend/             # HTML/JS/CSS + nginx.conf + Dockerfile
├── compose.yaml          # Stack de développement
├── compose.test.yaml     # Stack de test isolée
├── .gitlab-ci.yml        # Pipeline CI/CD
├── .pre-commit-config.yaml
├── GitVersion.yml
├── CHANGELOG.md
├── .env.example
└── README.md
```