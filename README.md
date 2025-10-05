# 📋 Kanban Board API

Une application de gestion de projet Kanban complète avec API Django REST et interface React TypeScript.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion utilisateur
- Authentification JWT (Access & Refresh tokens)
- Gestion des permissions par rôle (Admin/Utilisateur)

### 👥 Gestion des Utilisateurs
- Création et gestion des comptes utilisateur
- Interface d'administration pour les admins
- Profils utilisateur avec informations détaillées

### 📁 Gestion des Projets
- Création et organisation de projets
- Système de membres de projet
- Tableau de bord avec statistiques

### 📝 Gestion des Tâches
- Création, modification et suppression de tâches
- Système de priorités (Basse, Moyenne, Haute)
- Statuts de tâches (À faire, En cours, Terminé)
- Interface Kanban drag & drop

### 🔧 Interface d'Administration
- Dashboard admin avec statistiques complètes
- Gestion CRUD des utilisateurs, projets et tâches
- Vue d'ensemble de tous les projets
- Gestion des permissions avancées

## 🛠️ Technologies Utilisées

### Backend
- **Django 4.2+** - Framework web Python
- **Django REST Framework** - API REST
- **JWT** - Authentification
- **SQLite** - Base de données (dev)
- **CORS** - Configuration cross-origin

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP
- **React Router** - Navigation

## 🚀 Installation et Démarrage

### 📋 Prérequis
- **Python 3.8+** avec pip
- **Node.js 16+** avec npm
- **Git** pour cloner le projet

### 1. 📥 Cloner le projet
```bash
git clone https://github.com/bk-med/kanban.git
cd kanban
```

### 2. 🔧 Configuration Backend (Django)

```bash
# Installer les dépendances Python
pip install -r requirements.txt

# Aller dans le dossier backend
cd kanban_api

# Appliquer les migrations de la base de données
python manage.py migrate

# Créer un superutilisateur pour l'administration (optionnel)
python manage.py createsuperuser
# Suivre les instructions pour créer un compte admin

# Démarrer le serveur Django
python manage.py runserver
```

✅ **Backend disponible sur** : `http://localhost:8000`
✅ **Interface d'administration Django** : `http://localhost:8000/admin`

### 3. 🎨 Configuration Frontend (React)

**Dans un nouveau terminal** (garder le backend en cours d'exécution) :

```bash
# Aller dans le dossier frontend
cd frontend_kanban

# Installer toutes les dépendances Node.js
npm install

# Vérifier que l'installation s'est bien passée
npm list --depth=0

# Démarrer le serveur de développement React
npm start
```

✅ **Frontend disponible sur** : `http://localhost:3001`

**Note** : Le navigateur s'ouvrira automatiquement sur `http://localhost:3001`

### 4. 🚀 Démarrage Automatique (Recommandé)

Pour démarrer backend et frontend en une seule commande :

```bash
# Rendre le script exécutable (première fois seulement)
chmod +x start.sh

# Démarrer l'application complète
./start.sh
```

Ce script automatique :
- ✅ Vérifie les prérequis (Python, Node.js, ports)
- ✅ Démarre le backend Django sur le port 8000
- ✅ Démarre le frontend React sur le port 3001
- ✅ Affiche les URLs d'accès
- ✅ Gère les logs des deux serveurs

### 5. 🛑 Arrêt de l'Application

```bash
# Utiliser le script d'arrêt
./stop.sh

# Ou arrêter manuellement avec Ctrl+C dans chaque terminal
```

## 🔧 Dépannage et Solutions aux Problèmes Courants

### ❌ Problèmes Backend (Django)

**Erreur : `ModuleNotFoundError`**
```bash
# Vérifier que vous êtes dans le bon environnement Python
pip install -r requirements.txt

# Ou créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Erreur : `Port 8000 already in use`**
```bash
# Trouver le processus utilisant le port 8000
lsof -i :8000

# Tuer le processus (remplacer PID par le numéro affiché)
kill -9 PID
```

**Erreur de migrations :**
```bash
cd kanban_api
python manage.py makemigrations
python manage.py migrate
```

### ❌ Problèmes Frontend (React)

**Erreur : `npm install` échoue**
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

**Erreur : `Port 3001 already in use`**
```bash
# Le script start.sh gère automatiquement cela
# Ou manuellement :
lsof -i :3001
kill -9 PID
```

**Erreur TypeScript :**
```bash
# Vérifier les erreurs TypeScript
npm run build

# Nettoyer et reconstruire
rm -rf build
npm run build
```

### ❌ Problèmes de Connexion

**Frontend ne peut pas se connecter au backend :**
1. Vérifier que le backend est démarré sur `http://localhost:8000`
2. Vérifier les logs dans la console du navigateur
3. Vérifier que CORS est configuré (déjà fait dans le projet)

**Erreur 401/403 :**
1. Vérifier que vous êtes connecté
2. Rafraîchir la page
3. Se reconnecter avec les comptes de test

## 🌐 URLs et Ports

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Frontend React** | http://localhost:3001 | 3001 | Interface utilisateur principale |
| **Backend Django** | http://localhost:8000 | 8000 | API REST |
| **Admin Django** | http://localhost:8000/admin | 8000 | Interface d'administration Django |
| **API Auth** | http://localhost:8000/api/auth/ | 8000 | Endpoints d'authentification |
| **API Projects** | http://localhost:8000/api/projects/ | 8000 | Endpoints des projets |
| **API Tasks** | http://localhost:8000/api/tasks/ | 8000 | Endpoints des tâches |
| **API Admin** | http://localhost:8000/api/admin/ | 8000 | Endpoints d'administration |

## 📱 Utilisation de l'Application

### 🏠 Page d'Accueil
- **URL** : http://localhost:3001
- **Fonctionnalités** : Connexion, Inscription, Navigation

### 📊 Dashboard Utilisateur
- **Accès** : Après connexion avec un compte utilisateur
- **Fonctionnalités** : Vue d'ensemble des projets, création de projets

### 📋 Kanban Board
- **Accès** : Depuis le dashboard → Cliquer sur un projet
- **Fonctionnalités** : Gestion des tâches par drag & drop, modification des statuts

### 🔧 Interface d'Administration
- **URL** : http://localhost:3001/admin
- **Accès** : Connexion avec compte admin (`admin` / `admin123`)
- **Fonctionnalités** : Gestion complète des utilisateurs, projets, tâches

### 6. 🔄 Commandes de Développement Utiles

**Backend (dans `kanban_api/`) :**
```bash
# Créer de nouvelles migrations après modification des modèles
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Accéder au shell Django
python manage.py shell
```

**Frontend (dans `frontend_kanban/`) :**
```bash
# Installer une nouvelle dépendance
npm install nom-du-package

# Construire pour la production
npm run build

# Vérifier les erreurs TypeScript
npm run build

# Nettoyer le cache
npm cache clean --force
```

## 🔑 Comptes de Test

### Administrateur
- **Username:** `admin`
- **Password:** `admin123`

### Utilisateur Standard
- **Username:** `user`
- **Password:** `user123`

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/refresh/` - Rafraîchir le token
- `GET /api/auth/me/` - Informations utilisateur

### Projets
- `GET /api/projects/` - Liste des projets
- `POST /api/projects/` - Créer un projet
- `GET /api/projects/{id}/` - Détails du projet
- `PUT /api/projects/{id}/` - Modifier un projet
- `DELETE /api/projects/{id}/` - Supprimer un projet

### Tâches
- `GET /api/projects/{id}/tasks/` - Tâches d'un projet
- `POST /api/projects/{id}/tasks/` - Créer une tâche
- `PUT /api/tasks/{id}/` - Modifier une tâche
- `DELETE /api/tasks/{id}/` - Supprimer une tâche

### Administration
- `GET /api/admin/users/` - Liste des utilisateurs
- `GET /api/admin/projects/` - Liste des projets
- `GET /api/admin/tasks/` - Liste des tâches
- `POST /api/admin/users/` - Créer un utilisateur
- `PUT /api/admin/users/{id}/` - Modifier un utilisateur
- `DELETE /api/admin/users/{id}/` - Supprimer un utilisateur

## 🏗️ Structure du Projet

```
kanban/
├── kanban_api/                 # Backend Django
│   ├── kanban/                # Application principale
│   │   ├── models.py          # Modèles de données
│   │   ├── views.py           # Vues API
│   │   ├── serializers.py     # Sérialiseurs
│   │   ├── permissions.py     # Permissions personnalisées
│   │   └── urls.py            # Routes API
│   ├── kanban_api/            # Configuration Django
│   └── manage.py              # Script de gestion Django
├── frontend_kanban/           # Frontend React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── pages/             # Pages de l'application
│   │   ├── contexts/          # Contextes React
│   │   ├── services/          # Services API
│   │   └── types/             # Types TypeScript
│   └── public/                # Fichiers publics
├── start.sh                   # Script de démarrage
├── stop.sh                    # Script d'arrêt
└── requirements.txt           # Dépendances Python
```

## 🔒 Permissions

### Utilisateurs Standards
- Accès aux projets dont ils sont membres
- Création et modification de leurs propres tâches
- Lecture seule des autres ressources

### Administrateurs
- Accès complet à tous les projets et tâches
- Gestion des utilisateurs
- Interface d'administration complète
- Permissions CRUD sur toutes les ressources

## 🎯 Utilisation

### Interface Utilisateur
1. **Connexion** : Utilisez les comptes de test fournis
2. **Dashboard** : Vue d'ensemble de vos projets
3. **Kanban Board** : Gestion des tâches par drag & drop
4. **Création de Projet** : Ajoutez de nouveaux projets

### Interface Admin
1. **Connexion Admin** : Connectez-vous avec `admin/admin123`
2. **Dashboard Admin** : Statistiques et vue d'ensemble
3. **Gestion Utilisateurs** : CRUD des comptes utilisateur
4. **Gestion Projets** : Administration de tous les projets
5. **Gestion Tâches** : Vue globale des tâches

## 🛑 Arrêt de l'Application

```bash
# Utiliser le script d'arrêt
./stop.sh

# Ou arrêter manuellement avec Ctrl+C
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**BK-Med**
- GitHub: [@bk-med](https://github.com/bk-med)

## 📞 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur GitHub.

---

⭐ N'hésitez pas à donner une étoile si ce projet vous a aidé !
