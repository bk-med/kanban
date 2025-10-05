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

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/bk-med/kanban.git
cd kanban
```

### 2. Configuration Backend

```bash
# Installer les dépendances Python
pip install -r requirements.txt

# Appliquer les migrations
cd kanban_api
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser

# Démarrer le serveur Django
python manage.py runserver
```

Le backend sera disponible sur `http://localhost:8000`

### 3. Configuration Frontend

```bash
# Installer les dépendances Node.js
cd frontend_kanban
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend sera disponible sur `http://localhost:3001`

### 4. Démarrage Rapide (Script automatique)

```bash
# Rendre le script exécutable
chmod +x start.sh

# Démarrer l'application complète
./start.sh
```

Ce script démarre automatiquement :
- Le serveur Django sur le port 8000
- Le serveur React sur le port 3001
- Vérifie les prérequis et ports disponibles

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
