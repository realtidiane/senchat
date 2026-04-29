# SenChat

Application de messagerie instantanée temps réel avec une identité visuelle sénégalaise — inspirée de WhatsApp, construite avec les couleurs nationales du Sénégal (vert, or, rouge).

![SenChat](https://img.shields.io/badge/SenChat-MVP-00853F?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socketdotio)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)

---

## Fonctionnalités

- **Authentification** — Inscription, connexion, déconnexion avec JWT (access token 15min + refresh token httpOnly 7j)
- **Conversations directes** — Chat 1:1 avec déduplication automatique
- **Groupes** — Création de groupes jusqu'à 256 membres, rôles (OWNER / ADMIN / MEMBER)
- **Temps réel** — Messages, indicateurs de frappe, statut en ligne via Socket.IO
- **Partage de fichiers** — Images, PDF, documents (jusqu'à 25 Mo)
- **Statut des messages** — Lu / non lu avec compteur de non-lus
- **Profil** — Modification du nom, bio, avatar
- **Thème** — Mode sombre (défaut) / mode clair
- **Responsive** — Mobile-first, sidebar repliable
- **Accès réseau local** — Accessible depuis tous les appareils du réseau local

---

## Stack technique

### Monorepo (npm workspaces)

```
senchat/
├── shared/          # Types TypeScript partagés + contrats Socket.IO
├── backend/         # API REST + WebSocket
└── frontend/        # Interface React
```

### Backend (`backend/`)
| Technologie | Rôle |
|---|---|
| NestJS 10 | Framework API |
| Prisma 6 | ORM |
| MySQL 8 | Base de données |
| Socket.IO 4 | Temps réel |
| JWT + bcrypt | Auth sécurisée |
| class-validator | Validation DTOs |
| @nestjs/throttler | Rate limiting |

### Frontend (`frontend/`)
| Technologie | Rôle |
|---|---|
| React 18 | UI |
| Vite 6 | Bundler |
| Tailwind CSS 3 | Styles |
| Zustand 5 | État client |
| TanStack Query 5 | État serveur + cache |
| socket.io-client | Temps réel |
| React Router v6 | Routing |
| lucide-react | Icônes |

---

## Prérequis

- **Node.js** 18+
- **MySQL 8** en local (root sans mot de passe sur port 3306 par défaut)
- **npm** 9+

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/realtidiane/senchat.git
cd senchat
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

Le fichier `backend/.env` est déjà configuré pour MySQL local (root, sans mot de passe) :

```env
DATABASE_URL="mysql://root:@localhost:3306/senchat"
JWT_SECRET="dev-jwt-secret-change-in-production-32chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-prod-32chars"
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

Si ton MySQL utilise un mot de passe root, modifie `DATABASE_URL` :
```
DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/senchat"
```

### 4. Initialiser la base de données

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

Le seed crée 3 comptes de test :

| Nom | Email | Mot de passe |
|---|---|---|
| Alice Diallo | alice@senchat.sn | password123 |
| Bob Ndiaye | bob@senchat.sn | password123 |
| Charlie Sow | charlie@senchat.sn | password123 |

---

## Lancement

Ouvre **deux terminaux** :

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

Ouvre `http://localhost:5173` dans ton navigateur.

### Accès réseau local (LAN)

Le frontend détecte automatiquement l'IP de la machine hôte. Depuis un autre appareil sur le même réseau, utilise l'URL **Network** affichée par Vite :

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

> Assure-toi que le pare-feu Windows autorise les ports **3000** et **5173**.

---

## Architecture

### Base de données

```
User ──< ConversationMember >── Conversation
                                      │
                                   Message
User ──< RefreshToken
```

**5 modèles Prisma** : `User`, `Conversation`, `ConversationMember`, `Message`, `RefreshToken`

### API REST (`/api`)

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| POST | `/auth/refresh` | Rafraîchir le token |
| POST | `/auth/logout` | Déconnexion |
| GET | `/users/me` | Profil courant |
| PATCH | `/users/me` | Modifier profil |
| GET | `/users/search?q=` | Recherche utilisateurs |
| GET | `/conversations` | Liste des conversations |
| POST | `/conversations` | Créer une conversation |
| GET | `/conversations/:id` | Détail conversation |
| GET | `/conversations/:id/messages` | Historique messages (pagination curseur) |
| POST | `/files/upload` | Upload fichier |

### Événements Socket.IO

| Événement | Direction | Description |
|---|---|---|
| `message:send` | Client → Serveur | Envoyer un message |
| `message:new` | Serveur → Client | Nouveau message reçu |
| `message:read` | Client → Serveur | Marquer comme lu |
| `message:status` | Serveur → Client | Mise à jour statut |
| `typing:start` | Client → Serveur | Début de frappe |
| `typing:stop` | Client → Serveur | Fin de frappe |
| `typing:update` | Serveur → Client | Indicateur de frappe |
| `presence:change` | Serveur → Client | Changement statut en ligne |

---

## Tests

### Tests unitaires (backend)

```bash
cd backend
npm run test
```

### Tests e2e (nécessite MySQL actif)

```bash
cd backend
npx jest --config test/jest-e2e.json --verbose --forceExit
```

---

## Structure des fichiers

```
senchat/
├── shared/
│   └── src/
│       ├── types/          # User, Conversation, Message interfaces
│       └── events/         # Socket event names + payload types
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/           # Authentification JWT
│   │   ├── users/          # Profil utilisateur
│   │   ├── conversations/  # CRUD conversations
│   │   ├── messages/       # Messages + pagination
│   │   ├── files/          # Upload fichiers
│   │   ├── gateway/        # Socket.IO gateway
│   │   ├── prisma/         # PrismaService
│   │   └── common/         # Guards, decorators, filters
│   └── test/               # Tests e2e
└── frontend/
    └── src/
        ├── components/     # Composants réutilisables
        ├── features/
        │   ├── auth/       # LoginPage, RegisterPage
        │   ├── chat/       # ChatLayout
        │   └── settings/   # SettingsPage
        ├── hooks/          # useAuth, useSocket, useMessages
        ├── lib/            # api.ts, socket.ts, utils.ts
        └── stores/         # auth, conversation, ui (Zustand)
```

---

## Design system

Couleurs inspirées du drapeau sénégalais :

| Token | Valeur | Usage |
|---|---|---|
| `sn-green` | `#00853F` | Couleur principale, accents |
| `sn-gold` | `#FDEF42` | Accent secondaire (dark mode) |
| `sn-red` | `#E31B23` | Danger, erreurs |

Mode sombre activé par défaut, basculable depuis les paramètres.

---

## Roadmap (v2)

- [ ] Chiffrement de bout en bout (Signal Protocol)
- [ ] Appels audio / vidéo (WebRTC)
- [ ] Réactions aux messages
- [ ] Messages vocaux
- [ ] Interface en Wolof
- [ ] Stories / statuts

---

## Licence

MIT
