<div align="center">

# 🇸🇳 SenChat

### Messagerie instantanée temps réel aux couleurs du Sénégal

*Une application de chat moderne inspirée de WhatsApp, construite avec une identité visuelle sénégalaise — vert, jaune et rouge.*

[![Status](https://img.shields.io/badge/status-MVP-success?style=flat-square)](https://github.com/realtidiane/senchat)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)

[Fonctionnalités](#-fonctionnalités) •
[Stack](#-stack-technique) •
[Démarrage rapide](#-démarrage-rapide) •
[Architecture](#-architecture) •
[API](#-api-rest) •
[Roadmap](#-roadmap)

</div>

---

## 📖 À propos

**SenChat** est une plateforme de messagerie instantanée full-stack qui combine la simplicité de WhatsApp avec une identité visuelle ancrée dans la culture sénégalaise. Conçue pour la communication moderne — conversations privées, groupes jusqu'à 256 membres, partage de fichiers, indicateurs de présence et de frappe en temps réel.

> 💡 Ce projet sert également de référence d'architecture full-stack moderne avec NestJS, Prisma, React, Tailwind et Socket.IO.

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Inscription / connexion avec **JWT** (access 15min + refresh httpOnly 7j)
- Hachage des mots de passe avec **bcrypt** (12 rounds)
- Rate limiting sur les endpoints sensibles
- Validation stricte avec `class-validator`
- Protection CORS configurable

### 💬 Messagerie temps réel
- Conversations **directes** (1:1) avec déduplication automatique
- **Groupes** jusqu'à 256 membres avec rôles (`OWNER`, `ADMIN`, `MEMBER`)
- Indicateurs de **frappe** en temps réel
- Statut **en ligne / hors ligne** avec dernière connexion
- Statut **lu / non lu** avec compteur de non-lus
- Pagination par **curseur** (chargement infini)

### 📎 Partage de fichiers
- Upload d'images (JPEG, PNG, WebP, GIF)
- Documents (PDF, Word, Excel, TXT, ZIP)
- Limite **25 Mo** par fichier
- Validation MIME stricte côté serveur

### 🎨 Interface
- **Dark mode** par défaut + thème clair
- Design **responsive** (mobile-first)
- Sidebar repliable sur mobile
- Couleurs nationales du Sénégal (vert `#00853F`, or, rouge)
- Animations fluides
- Icônes [Lucide](https://lucide.dev)

### 🌍 Bonus
- **Accès LAN** — utilisable depuis n'importe quel appareil du réseau local
- Auto-détection du host pour l'API et les WebSockets
- Recherche d'utilisateurs avec debounce
- Suppression douce (soft delete) des messages

---

## 🛠 Stack technique

<table>
<tr>
<td valign="top" width="50%">

### Backend
| Tech | Rôle |
|------|------|
| **NestJS 10** | Framework API modulaire |
| **Prisma 6** | ORM type-safe |
| **MySQL 8** | Base de données relationnelle |
| **Socket.IO 4** | WebSocket temps réel |
| **Passport JWT** | Authentification |
| **bcrypt** | Hachage mots de passe |
| **Multer** | Upload de fichiers |
| **class-validator** | Validation DTOs |
| **@nestjs/throttler** | Rate limiting |

</td>
<td valign="top" width="50%">

### Frontend
| Tech | Rôle |
|------|------|
| **React 18** | Bibliothèque UI |
| **Vite 6** | Bundler ultra-rapide |
| **TypeScript 5** | Typage statique |
| **Tailwind CSS 3** | Styles utilitaires |
| **Zustand 5** | État client (auth, UI) |
| **TanStack Query 5** | État serveur + cache |
| **socket.io-client** | WebSocket client |
| **React Router 6** | Routing SPA |
| **lucide-react** | Icônes |

</td>
</tr>
</table>

### 🏗 Architecture monorepo

Géré avec **npm workspaces** — types et événements Socket.IO partagés entre front et back via `@senchat/shared`.

```
senchat/
├── shared/      # Types TypeScript + contrats Socket.IO partagés
├── backend/     # API NestJS + WebSocket gateway
└── frontend/    # SPA React
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MySQL 8** en local (port 3306, root sans mot de passe par défaut)

### Installation en 4 étapes

```bash
# 1. Cloner le projet
git clone https://github.com/realtidiane/senchat.git
cd senchat

# 2. Installer les dépendances (workspaces)
npm install

# 3. Initialiser la base de données
cd backend
npx prisma migrate dev --name init
npx prisma db seed

# 4. Lancer (dans 2 terminaux séparés)
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
cd ../frontend && npm run dev
```

➡️ Ouvre [http://localhost:5173](http://localhost:5173)

### 🔑 Comptes de test (créés par le seed)

| 👤 Nom | 📧 Email | 🔒 Mot de passe |
|---|---|---|
| Alice Diallo | `alice@senchat.sn` | `password123` |
| Bob Ndiaye | `bob@senchat.sn` | `password123` |
| Charlie Sow | `charlie@senchat.sn` | `password123` |

### ⚙️ Configuration

Le fichier `backend/.env` est pré-configuré pour MySQL local sans mot de passe :

```env
DATABASE_URL="mysql://root:@localhost:3306/senchat"
JWT_SECRET="dev-jwt-secret-change-in-production-32chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-prod-32chars"
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Si ton MySQL utilise un mot de passe : `mysql://root:TON_MDP@localhost:3306/senchat`

### 🌐 Accès depuis le réseau local

Vite expose automatiquement l'app sur le LAN. Au lancement, tu verras :

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

Utilise l'URL **Network** depuis n'importe quel appareil du même réseau (téléphone, autre PC, etc.).

> 💡 Le frontend détecte automatiquement le hostname pour rediriger les appels API.
>
> ⚠️ Pense à autoriser les ports `3000` et `5173` dans ton pare-feu Windows.

---

## 🗄 Architecture

### Schéma de base de données

```
┌────────┐         ┌────────────────────┐         ┌──────────────┐
│  User  │────────<│ ConversationMember │>────────│ Conversation │
└────────┘         └────────────────────┘         └──────────────┘
    │                                                     │
    │                                                     │
    │              ┌─────────┐                            │
    └─────────────<│ Message │>───────────────────────────┘
    │              └─────────┘
    │
    │              ┌──────────────┐
    └─────────────<│ RefreshToken │
                   └──────────────┘
```

**5 modèles** (`User`, `Conversation`, `ConversationMember`, `Message`, `RefreshToken`) avec index optimisés et `onDelete: Cascade`.

### Flux temps réel

```
┌─────────────┐       JWT in handshake        ┌─────────────────┐
│   Client    │ ─────────────────────────────>│  Socket.IO      │
│  (React)    │                               │   Gateway       │
│             │       message:send            │                 │
│             │ ─────────────────────────────>│                 │
│             │                               │   ┌─────────┐   │
│             │                               │   │ Rooms   │   │
│             │       message:new             │   │ user:X  │   │
│             │ <─────────────────────────────│   │ conv:Y  │   │
│             │                               │   └─────────┘   │
│             │       typing:update           │                 │
│             │ <─────────────────────────────│                 │
│             │                               │                 │
│             │       presence:change         │                 │
│             │ <─────────────────────────────│                 │
└─────────────┘                               └─────────────────┘
```

---

## 🔌 API REST

> Préfixe global : `/api`

### Authentification (`/auth`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/register` | Créer un compte |
| `POST` | `/login` | Se connecter |
| `POST` | `/refresh` | Rafraîchir l'access token |
| `POST` | `/logout` | Déconnexion |

### Utilisateurs (`/users`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/me` | Profil courant |
| `PATCH` | `/me` | Modifier nom / bio |
| `POST` | `/me/avatar` | Upload avatar |
| `GET` | `/search?q=` | Rechercher des utilisateurs |

### Conversations (`/conversations`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Liste des conversations |
| `POST` | `/` | Créer (DIRECT ou GROUP) |
| `GET` | `/:id` | Détail d'une conversation |
| `PATCH` | `/:id` | Modifier un groupe |
| `POST` | `/:id/members` | Ajouter un membre |
| `DELETE` | `/:id/members/:userId` | Retirer un membre |
| `POST` | `/:id/leave` | Quitter un groupe |
| `GET` | `/:id/messages` | Historique paginé (curseur) |
| `GET` | `/:id/messages/search?q=` | Recherche dans les messages |

### Fichiers (`/files`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/upload` | Upload (max 25 Mo) |
| `GET` | `/:filename` | Télécharger |

### Messages (`/messages`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `DELETE` | `/:id` | Suppression douce |

---

## 📡 Événements Socket.IO

| Événement | Direction | Payload |
|-----------|-----------|---------|
| `message:send` | 📤 Client → Serveur | `{ conversationId, type, content?, fileUrl? }` |
| `message:new` | 📥 Serveur → Client | `Message` complet |
| `message:read` | 📤 Client → Serveur | `{ conversationId, messageId }` |
| `message:status` | 📥 Serveur → Client | `{ messageId, readBy }` |
| `typing:start` | 📤 Client → Serveur | `{ conversationId }` |
| `typing:stop` | 📤 Client → Serveur | `{ conversationId }` |
| `typing:update` | 📥 Serveur → Client | `{ userId, conversationId, isTyping }` |
| `presence:change` | 📥 Serveur → Client | `{ userId, isOnline, lastSeen }` |

---

## 📁 Structure du projet

```
senchat/
├── shared/
│   └── src/
│       ├── types/              # User, Conversation, Message
│       └── events/             # Socket events + payloads
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 5 modèles + 3 enums
│   │   └── seed.ts             # Données de test
│   ├── src/
│   │   ├── auth/               # Register, login, refresh, logout
│   │   ├── users/              # Profil, avatar, recherche
│   │   ├── conversations/      # CRUD + gestion membres
│   │   ├── messages/           # Historique, search, soft delete
│   │   ├── files/              # Upload + download
│   │   ├── gateway/            # Socket.IO + JWT auth
│   │   ├── prisma/             # PrismaService
│   │   └── common/
│   │       ├── decorators/     # @Public, @CurrentUser
│   │       ├── filters/        # GlobalExceptionFilter
│   │       └── guards/         # JwtAuthGuard
│   └── test/                   # Tests e2e
│
└── frontend/
    └── src/
        ├── components/         # ChatPanel, MessageBubble, ...
        ├── features/
        │   ├── auth/           # LoginPage, RegisterPage
        │   ├── chat/           # ChatLayout (sidebar + panel)
        │   └── settings/       # SettingsPage
        ├── hooks/              # useAuth, useSocket, useMessages
        ├── lib/                # api.ts, socket.ts, utils.ts
        └── stores/             # Zustand: auth, conversation, ui
```

---

## 🎨 Design system

Identité visuelle inspirée du **drapeau du Sénégal** 🇸🇳

| Token | Hex | Usage |
|-------|-----|-------|
| 🟢 `sn-green` | `#00853F` | Couleur principale, accents, statut en ligne |
| 🟡 `sn-yellow` | `#FDEF42` | Accent secondaire (mode sombre) |
| 🔴 `sn-red` | `#E31B23` | Erreurs, actions destructives |

**Police** : [Inter](https://fonts.google.com/specimen/Inter) — moderne, lisible, optimisée pour les écrans.

**Mode sombre** activé par défaut, basculable depuis les paramètres.

---

## 🧪 Tests

### Tests unitaires
```bash
cd backend
npm run test              # Watch mode
npm run test:cov          # Avec couverture
```

### Tests end-to-end
```bash
cd backend
npx jest --config test/jest-e2e.json --verbose --forceExit
```

> Couvre : `register`, `login`, gestion des doublons, profil avec/sans token.

---

## 🛠 Scripts utiles

À la racine du projet :

```bash
npm run dev:backend       # Lance uniquement le backend
npm run dev:frontend      # Lance uniquement le frontend
npm run build             # Build des deux
npm run lint              # Lint workspace
```

Dans `backend/` :

```bash
npx prisma studio         # GUI pour explorer la base
npx prisma migrate dev    # Créer une nouvelle migration
npx prisma db seed        # Réinitialiser les données de test
```

---

## 🗺 Roadmap

### v1 (MVP) — ✅ Livré
- [x] Authentification JWT (register, login, refresh)
- [x] Conversations directes & groupes
- [x] Messages temps réel + indicateurs de frappe
- [x] Upload de fichiers
- [x] Statuts en ligne / lu
- [x] Mode sombre / clair
- [x] Responsive mobile

### v2 — 🚧 À venir
- [ ] 🎙️ **Messages vocaux** (enregistrement + lecture)
- [ ] 📞 **Appels audio / vidéo** (WebRTC)
- [ ] 🔐 **Chiffrement E2E** (Signal Protocol)
- [ ] 😀 **Réactions** aux messages (emoji)
- [ ] 📰 **Stories / Statuts** (24h)
- [ ] 🌍 **Wolof** + autres langues locales
- [ ] 🔔 **Notifications push** (Web Push API)
- [ ] 🎨 **Customisation** des thèmes utilisateurs
- [ ] 📱 **App mobile native** (React Native)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour participer :

1. Fork le projet
2. Crée une branche (`git checkout -b feat/ma-fonctionnalite`)
3. Commit tes changements (`git commit -m 'feat: ajout de X'`)
4. Push sur ta branche (`git push origin feat/ma-fonctionnalite`)
5. Ouvre une Pull Request

> 📝 Suis la convention [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 Licence

Distribué sous licence **MIT**. Voir [`LICENSE`](LICENSE) pour plus d'informations.

---

## 👤 Auteur

**Tidiane**
- GitHub: [@realtidiane](https://github.com/realtidiane)

---

<div align="center">

### 🇸🇳 Fait avec ❤️ au Sénégal

*Si ce projet t'a plu, n'hésite pas à laisser une ⭐ !*

</div>
