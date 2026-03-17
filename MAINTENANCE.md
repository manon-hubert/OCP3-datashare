# MAINTENANCE.md — Procédure de maintenance Datashare

Ce document décrit les procédures de maintenance du projet Datashare : mise à
jour des dépendances, fréquence recommandée et risques à surveiller.

---

## 1. Dependabot (automatique)

Dependabot est activé sur le dépôt GitHub. Il ouvre automatiquement des pull
requests pour les mises à jour de dépendances npm et les correctifs de sécurité.

**Ce que Dependabot gère :**

- Mises à jour patch et minor des dépendances npm (tous les workspaces)
- Alertes de sécurité

**Ce qui reste manuel :**

- Relire et merger les PRs Dependabot en vérifiant que les tests passent
- Mises à jour majeures (nécessitent une revue approfondie)
- Mise à jour de l'image Docker PostgreSQL

---

## 2. Mise à jour des dépendances npm (manuelle)

### Procédure

```bash
# 1. Vérifier les mises à jour disponibles
npm outdated --workspaces

# 2. Appliquer les mises à jour patch/mineures
npm update --workspaces

# 3. Pour les mises à jour majeures, les appliquer une par une
npm install <paquet>@latest --workspace=<backend|frontend>

# 4. Vérifier les vulnérabilités connues
npm audit --workspaces

# 5. Lancer les tests
npm test                                          # unit tests (backend + frontend)
npm run test:integration --workspace=backend      # tests d'intégration backend (nécessite la DB)
npm run test:e2e                                  # tests Playwright (nécessite le serveur en local)
```

### Fréquence

| Type de mise à jour        | Fréquence                           |
| -------------------------- | ----------------------------------- |
| Audit de sécurité          | Hebdomadaire                        |
| Mises à jour patch/mineure | Mensuelle                           |
| Mises à jour majeure       | Trimestrielle (avec revue manuelle) |

---

## 3. Mise à jour de l'image Docker PostgreSQL

L'image utilisée est `postgres:16-alpine` (voir `docker-compose.yml`).

### Procédure (mise à jour mineure)

```bash
docker pull postgres:16-alpine
npm run db:stop
npm run db:start
```

### Procédure (mise à jour majeure, ex. 16 → 17)

```bash
# 1. Sauvegarder les données
docker exec datashare-db pg_dumpall -U dbuser > backup.sql

# 2. Mettre à jour le tag dans docker-compose.yml

# 3. Recréer le volume
npm run db:reset

# 4. Restaurer les données
docker exec -i datashare-db psql -U dbuser < backup.sql
```

### Fréquence

| Type                       | Fréquence                          |
| -------------------------- | ---------------------------------- |
| Image Alpine (mineure)     | Mensuelle                          |
| Version majeure PostgreSQL | Annuelle ou sur besoin de sécurité |

---

## 4. Risques à surveiller

### Dépendances

| Dépendance       | Risque                                    | Action                                                                  |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| `bcrypt`         | Failles dans le hachage des mots de passe | Surveiller `npm audit`                                                  |
| `file-type`      | Contournement de la détection MIME        | Maintenir à jour                                                        |
| `@nestjs/jwt`    | Failles d'authentification JWT            | Maintenir à jour                                                        |
| NestJS (majeure) | Breaking changes dans les modules         | Suivre le [guide de migration](https://docs.nestjs.com/migration-guide) |
| React (majeure)  | Breaking changes de l'API                 | Vérifier les tests Playwright                                           |
| Vite (majeure)   | Configuration de build modifiée           | Vérifier `npm run build`                                                |

### Infrastructure

- **Espace disque** : les fichiers expirés sont nettoyés automatiquement par le
  `FilesCleanupService`. Si l'espace disque devient insuffisant, le service de
  stockage est abstrait derrière `storage.service.ts`, ce qui limiterait
  l'impact d'une migration vers un stockage externe.
- **JWT** : la durée des sessions est configurée via `JWT_EXPIRES_IN`. Toute
  modification du secret `JWT_SECRET` invalide immédiatement toutes les sessions
  actives.
- **Migrations TypeORM** : exécuter `migration:run` après chaque déploiement
  modifiant le schéma. TypeORM a été choisi notamment pour simplifier cette
  gestion.

---

## 5. Checklist de maintenance mensuelle

- [ ] `npm audit --workspaces` — aucune vulnérabilité critique
- [ ] `npm outdated --workspaces` — revue des mises à jour disponibles
- [ ] `npm update --workspaces` — application des mises à jour patch/minor
- [ ] `npm test` — tests unitaires
- [ ] `npm run test:integration --workspace=backend` — tests d'intégration
- [ ] `npm run test:e2e` — tests Playwright
- [ ] `npm run build` — le build complet réussit
- [ ] `docker pull postgres:16-alpine` — image Docker à jour
