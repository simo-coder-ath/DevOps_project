# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [1.0.0] - 2026-11-19

### Ajouté
- API REST CRUD sur les utilisateurs (Spring Boot, validation, gestion d'erreurs)
- Frontend HTML/JS servi par Nginx avec reverse proxy `/api`
- Persistance PostgreSQL avec volume Docker nommé
- Dockerfiles, `compose.yaml` et configuration par variables d'environnement
- README avec instructions de lancement

## Classement SemVer des changements

| Changement | Niveau | Justification |
|---|---|---|
| Correction d'un texte | PATCH | aucun impact sur le comportement ni sur l'API |
| Nouvelle route compatible | MINOR | fonctionnalité ajoutée sans casser l'existant |
| Suppression d'une route publique | MAJOR | les clients qui l'utilisent cassent |
| Ajout d'un rôle | MINOR | extension compatible (les rôles existants restent valides) |
| Correction d'un crash | PATCH | correction de bug sans changement d'API |