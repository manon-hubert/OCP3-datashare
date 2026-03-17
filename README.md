# Datashare

Service de partage de fichiers. Les utilisateurs peuvent déposer des fichiers et
les partager via un lien généré automatiquement.

## Stack technique

- **Backend** : NestJS 11, TypeScript, PostgreSQL (via TypeORM)
- **Frontend** : React 19, Vite 7, TypeScript, Chakra UI
- **Tests E2E** : Playwright
- **Base de données** : PostgreSQL 16 (via Docker)
- **Authentification** : JWT (expiration 15 min)

## Prérequis

- Node.js >= 20
- npm >= 10
- Docker et Docker Compose

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/manon-hubert/OCP3-datashare.git
cd OCP3-datashare

# Installer les dépendances (tous les workspaces)
npm install
```

## Configuration

Chaque workspace dispose d'un fichier `.env.example` à copier :

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Variables racine (`.env`)

| Variable       | Description                        | Valeur par défaut                                    |
| -------------- | ---------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL` | URL de connexion PostgreSQL        | `postgresql://dbuser:dbpwd@localhost:5432/datashare` |
| `DB_HOST`      | Hôte de la base de données         | `localhost`                                          |
| `DB_USER`      | Utilisateur PostgreSQL             | `dbuser`                                             |
| `DB_PASSWORD`  | Mot de passe PostgreSQL            | `dbpwd`                                              |
| `DB_NAME`      | Nom de la base de données          | `datashare`                                          |
| `DB_PORT`      | Port PostgreSQL                    | `5432`                                               |
| `FRONTEND_URL` | URL du frontend (CORS + tests E2E) | `http://localhost:5173`                              |
| `API_URL`      | URL du backend (tests E2E)         | `http://localhost:3000`                              |

### Variables backend (`backend/.env`)

| Variable         | Description                              | Valeur par défaut   |
| ---------------- | ---------------------------------------- | ------------------- |
| `PORT`           | Port d'écoute du serveur NestJS          | `3000`              |
| `JWT_SECRET`     | Clé secrète pour signer les tokens JWT   | À définir           |
| `JWT_EXPIRES_IN` | Durée de validité des tokens JWT         | `15m`               |
| `UPLOAD_PATH`    | Répertoire de stockage des fichiers      | `./uploads`         |
| `MAX_FILE_SIZE`  | Taille maximale des fichiers (en octets) | `1000000000` (1 Go) |

> Pour générer un `JWT_SECRET` sécurisé :
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Variables frontend (`frontend/.env`)

| Variable             | Description                              | Valeur par défaut       |
| -------------------- | ---------------------------------------- | ----------------------- |
| `VITE_API_URL`       | URL du backend                           | `http://localhost:3000` |
| `VITE_MAX_FILE_SIZE` | Taille maximale des fichiers (en octets) | `1000000000` (1 Go)     |

## Lancer l'application

### Démarrer la base de données

```bash
npm run db:start
```

### Lancer en mode développement

```bash
npm run dev
```

Le backend démarre sur [http://localhost:3000](http://localhost:3000) et le
frontend sur [http://localhost:5173](http://localhost:5173).

Pour lancer séparément :

```bash
npm run dev:backend
npm run dev:frontend
```

### Arrêter la base de données

```bash
npm run db:stop      # Arrêter les conteneurs
npm run db:reset     # Réinitialiser la BDD (supprime les données)
```

## Scripts disponibles à la racine

| Commande               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Lance le backend et le frontend en parallèle |
| `npm run dev:backend`  | Lance uniquement le backend                  |
| `npm run dev:frontend` | Lance uniquement le frontend                 |
| `npm run build`        | Build du backend et du frontend              |
| `npm test`             | Tests unitaires (backend + frontend)         |
| `npm run test:e2e`     | Tests E2E Playwright                         |
| `npm run db:start`     | Démarre PostgreSQL via Docker Compose        |
| `npm run db:stop`      | Arrête les conteneurs Docker                 |
| `npm run db:reset`     | Réinitialise la BDD (supprime les volumes)   |
| `npm run db:logs`      | Affiche les logs PostgreSQL                  |

## Tests

Le projet dispose de quatre niveaux de tests : unitaires backend (Jest),
intégration backend (Jest, base de données réelle), unitaires frontend (Vitest)
et E2E (Playwright).

Pour les instructions d'exécution, le plan de tests et les critères
d'acceptation, voir [TESTING.md](./TESTING.md).

## Architecture

```
datashare/
├── backend/          # API NestJS (port 3000)
│   ├── src/
│   │   ├── auth/     # Authentification JWT
│   │   ├── users/    # Gestion des utilisateurs
│   │   ├── files/    # Upload, téléchargement, gestion des fichiers
│   │   ├── storage/  # Abstraction du stockage local
│   │   └── common/   # Filtres, gardes, constantes partagées
│   └── test/         # Tests d'intégration (Jest) — nécessitent une BDD
├── frontend/         # Application React (port 5173)
│   └── src/
│       ├── api/      # Client HTTP centralisé
│       ├── pages/    # Pages de l'application
│       └── components/
└── e2e/              # Tests end-to-end (Playwright)
    ├── tests/        # Scénarios de test
    └── pages/        # Page Object Models
```

## Fonctionnalités

- **Upload de fichiers** : authentifié ou anonyme, jusqu'à 1 Go
- **Lien de partage** : token de téléchargement cryptographiquement aléatoire
- **Expiration configurable** : de 1 à 7 jours (7 jours par défaut)
- **Gestion des fichiers** : liste, suppression, historique (utilisateurs
  authentifiés)
- **Vérification des types MIME** : validée côté serveur via les magic bytes
