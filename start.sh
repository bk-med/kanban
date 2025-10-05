#!/bin/bash

# Script de démarrage automatique pour l'application Kanban
echo "🚀 Démarrage de l'application Kanban"
echo "===================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Le port $1 est déjà utilisé${NC}"
        return 1
    else
        return 0
    fi
}

# Vérifier les prérequis
echo "📋 Vérification des prérequis..."

# Vérifier Python
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python n'est pas installé${NC}"
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prérequis vérifiés${NC}"

# Vérifier les ports
echo "🔍 Vérification des ports..."
check_port 8000 && echo -e "${GREEN}✅ Port 8000 disponible${NC}" || echo -e "${YELLOW}⚠️  Port 8000 occupé${NC}"
check_port 3000 && echo -e "${GREEN}✅ Port 3000 disponible${NC}" || echo -e "${YELLOW}⚠️  Port 3000 occupé${NC}"

echo ""
echo "🏗️  Démarrage du backend Django..."
cd kanban_api

# Vérifier si les migrations sont à jour
echo "📊 Vérification des migrations..."
python manage.py migrate --check > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔄 Application des migrations..."
    python manage.py migrate
fi

# Démarrer Django en arrière-plan
echo "🚀 Démarrage du serveur Django sur http://localhost:8000"
python manage.py runserver > ../django.log 2>&1 &
DJANGO_PID=$!

# Attendre que Django démarre
sleep 3

# Vérifier si Django fonctionne
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✅ Backend Django démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du démarrage du backend Django${NC}"
    kill $DJANGO_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎨 Démarrage du frontend React..."
cd ../frontend_kanban

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances npm..."
    npm install
fi

# Démarrer React en arrière-plan
echo "🚀 Démarrage du serveur React sur http://localhost:3000"
npm start > ../react.log 2>&1 &
REACT_PID=$!

# Attendre que React démarre
echo "⏳ Attente du démarrage de React..."
sleep 10

# Vérifier si React fonctionne
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend React démarré avec succès${NC}"
else
    echo -e "${YELLOW}⚠️  React peut prendre plus de temps à démarrer...${NC}"
fi

echo ""
echo "🎉 Application Kanban démarrée !"
echo "================================"
echo "🌐 Frontend : http://localhost:3000"
echo "🔧 Backend  : http://localhost:8000"
echo "📊 Admin    : http://localhost:8000/admin"
echo ""
echo "📝 Logs :"
echo "  - Django : tail -f django.log"
echo "  - React  : tail -f react.log"
echo ""
echo "🛑 Pour arrêter l'application :"
echo "  - Ctrl+C dans ce terminal"
echo "  - Ou exécutez : ./stop.sh"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $DJANGO_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "✅ Application arrêtée"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
while true; do
    sleep 1
done



