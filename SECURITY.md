# Rapport de sécurité — Datashare

Date : 2026-03-12

---

## 1. Scan des dépendances npm

Outil utilisé : `npm audit` (rapport v2)

**Résumé :**

| Sévérité  | Nombre |
| --------- | ------ |
| Critique  | 0      |
| Haute     | 0      |
| Modérée   | 8      |
| Faible    | 0      |
| **Total** | **8**  |

---

## 2. Analyse des résultats

### CVE — `file-type` < 21.3.1 (GHSA-5v7r-6r5c-r473)

- **Sévérité :** Modérée (CVSS 5.3)
- **Type :** Boucle infinie (CWE-835) dans le parseur ASF sur une entrée malformée
- **Impact :** Déni de service applicatif (DoS) — aucune fuite de données
- **Packages affectés :** `file-type` (dépendance directe du backend) et `@nestjs/common` (dépendance transitive)

### CVE — `ajv` < 8.18.0 (GHSA-2g4f-4pwh-qvx6)

- **Sévérité :** Modérée
- **Type :** ReDoS (CWE-400 / CWE-1333) lors de l'utilisation de l'option `$data`
- **Impact :** Déni de service sur validation de schéma JSON — affecte uniquement les outils de développement (`@nestjs/cli`, `@nestjs/schematics`)
- **Packages affectés :** `@angular-devkit/core` → `@nestjs/cli`, `@nestjs/schematics`

---

## 3. Décisions prises

### `file-type` — corrigé

La version `21.3.1` corrige la vulnérabilité. La dépendance directe dans `backend/package.json` a été mise à jour de `^21.3.0` vers `^21.3.1` afin de forcer la résolution de la version corrigée.

La dépendance transitive via `@nestjs/common` reste en `21.3.0` (non contrôlable sans patcher NestJS). L'exposition reste limitée : les fichiers uploadés passent par une validation MIME côté serveur avant tout traitement par `file-type`, ce qui réduit la surface d'attaque.

### `ajv` via `@nestjs/cli` / `@nestjs/schematics` — accepté en l'état

Ces packages sont des **dépendances de développement uniquement** (`devDependencies`). Ils ne sont pas présents dans l'environnement de production. Le correctif disponible implique un downgrade majeur (`@nestjs/schematics` v7) incompatible avec NestJS 11. La vulnérabilité est acceptée jusqu'à la disponibilité d'un correctif compatible.
