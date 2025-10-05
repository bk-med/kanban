#!/bin/bash

# Script d'arrêt pour l'application Kanban
echo "🛑 Arrêt de l'application Kanban"
echo "================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Arrêter les processus Django
echo "🔧 Arrêt du backend Django..."
DJANGO_PIDS=$(lsof -ti:8000)
if [ ! -z "$DJANGO_PIDS" ]; then
    echo $DJANGO_PIDS | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Backend Django arrêté${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun processus Django trouvé sur le port 8000${NC}"
fi

# Arrêter les processus React
echo "🎨 Arrêt du frontend React..."
REACT_PIDS=$(lsof -ti:3000)
if [ ! -z "$REACT_PIDS" ]; then
    echo $REACT_PIDS | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Frontend React arrêté${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun processus React trouvé sur le port 3000${NC}"
fi

# Arrêter tous les processus npm/node liés au projet
echo "🧹 Nettoyage des processus Node.js..."
NODE_PIDS=$(ps aux | grep -E "(npm|node)" | grep -E "(kanban|frontend)" | awk '{print $2}')
if [ ! -z "$NODE_PIDS" ]; then
    echo $NODE_PIDS | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Processus Node.js arrêtés${NC}"
fi

# Nettoyer les fichiers de logs
echo "📝 Nettoyage des fichiers de logs..."
rm -f django.log react.log 2>/dev/null

echo ""
echo -e "${GREEN}✅ Application Kanban arrêtée avec succès${NC}"
echo "🎯 Tous les processus ont été terminés"



