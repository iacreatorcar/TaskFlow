#!/bin/bash

# TaskFlow - Sistema di Ticketing
# Script di avvio rapido

set -e

echo "🚀 TaskFlow - Sistema di Ticketing"
echo "==================================="
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Controlla se .env esiste
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  File .env non trovato${NC}"
    echo "Creo .env da .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env creato. Modificalo con i tuoi valori Supabase!${NC}"
    echo ""
fi

# Menu
echo "Scegli un'opzione:"
echo ""
echo -e "${BLUE}1)${NC} Avvio sviluppo locale (npm run dev)"
echo -e "${BLUE}2)${NC} Avvio con Docker (frontend only)"
echo -e "${BLUE}3)${NC} Avvio con Docker + Database locale"
echo -e "${BLUE}4)${NC} Build produzione"
echo -e "${BLUE}5)${NC} Deploy su Vercel"
echo -e "${BLUE}6)${NC} Setup Supabase locale"
echo -e "${BLUE}7)${NC} Ferma tutto"
echo ""
read -p "Scelta (1-7): " choice

case $choice in
    1)
        echo -e "${BLUE}💻 Avvio in modalità sviluppo...${NC}"
        
        # Controlla node_modules
        if [ ! -d "node_modules" ]; then
            echo "📦 Installazione dipendenze..."
            npm install
        fi
        
        echo -e "${GREEN}✅ Server avviato su http://localhost:5173${NC}"
        npm run dev
        ;;
        
    2)
        echo -e "${BLUE}🐳 Avvio con Docker...${NC}"
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker non trovato. Installa Docker: https://docs.docker.com/get-docker/${NC}"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            echo -e "${RED}❌ Docker Compose non trovato. Installa Docker Compose.${NC}"
            exit 1
        fi
        
        docker-compose up -d taskflow-web
        
        echo ""
        echo -e "${GREEN}✅ TaskFlow avviato!${NC}"
        echo -e "🌐 Frontend: ${BLUE}http://localhost:5173${NC}"
        echo ""
        echo "Comandi utili:"
        echo "  docker-compose logs -f taskflow-web  # Visualizza log"
        echo "  docker-compose down                  # Ferma"
        ;;
        
    3)
        echo -e "${BLUE}🐳 Avvio con Docker + Database...${NC}"
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker non trovato.${NC}"
            exit 1
        fi
        
        docker-compose --profile local-db up -d
        
        echo ""
        echo -e "${GREEN}✅ TaskFlow avviato con database!${NC}"
        echo -e "🌐 Frontend: ${BLUE}http://localhost:5173${NC}"
        echo -e "🐘 Database: ${BLUE}postgresql://postgres:postgres@localhost:5432/taskflow${NC}"
        echo ""
        echo "Attendi 10 secondi per l'inizializzazione del database..."
        sleep 10
        echo -e "${GREEN}✅ Pronto!${NC}"
        ;;
        
    4)
        echo -e "${BLUE}🔨 Build produzione...${NC}"
        
        npm install
        npm run build
        
        echo ""
        echo -e "${GREEN}✅ Build completata in /dist${NC}"
        echo ""
        echo "Per testare localmente:"
        echo "  npm run preview"
        echo ""
        echo "Per deploy su server:"
        echo "  rsync -avz dist/ user@server:/var/www/taskflow"
        ;;
        
    5)
        echo -e "${BLUE}🚀 Deploy su Vercel...${NC}"
        
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installazione Vercel CLI..."
            npm install -g vercel
        fi
        
        echo ""
        echo "Assicurati di aver:"
        echo "  1. Configurato le variabili d'ambiente in .env"
        echo "  2. Committato tutte le modifiche su Git"
        echo "  3. Collegato il repository a Vercel"
        echo ""
        read -p "Continuare? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            vercel --prod
        fi
        ;;
        
    6)
        echo -e "${BLUE}⚙️  Setup Supabase locale...${NC}"
        
        if ! command -v supabase &> /dev/null; then
            echo "📦 Installazione Supabase CLI..."
            npm install -g supabase
        fi
        
        echo ""
        echo "Avvio Supabase locale..."
        supabase start
        
        echo ""
        echo -e "${GREEN}✅ Supabase avviato!${NC}"
        echo ""
        echo "URL:           http://localhost:54323"
        echo "API URL:       http://localhost:54321"
        echo "DB URL:        postgresql://postgres:postgres@localhost:54322/postgres"
        echo ""
        echo "Aggiorna .env con:"
        echo "  VITE_SUPABASE_URL=http://localhost:54321"
        echo "  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssNHzT74"
        ;;
        
    7)
        echo -e "${BLUE}🛑 Fermo tutti i servizi...${NC}"
        
        # Ferma Docker
        docker-compose down 2>/dev/null || true
        
        # Ferma Supabase locale
        supabase stop 2>/dev/null || true
        
        # Ferma processi npm
        pkill -f "npm run dev" 2>/dev/null || true
        
        echo -e "${GREEN}✅ Tutti i servizi fermati${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Scelta non valida${NC}"
        exit 1
        ;;
esac
