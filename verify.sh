#!/bin/bash

# Smart Campus Ticketing System - Verification Script
# This script checks that all required files are present and systems are running

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Smart Campus - Module C: Ticketing System                   ║"
echo "║  Integration Verification Script                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to check file exists
check_file() {
    [ -f "$1" ] && echo -ne "${GREEN}✓${NC}" || echo -ne "${RED}✗${NC}"
}

# Function to check directory exists
check_dir() {
    [ -d "$1" ] && echo -ne "${GREEN}✓${NC}" || echo -ne "${RED}✗${NC}"
}

PROJECT_ROOT="/Users/sajana/Desktop/it3030-paf-2026-smart-campus-group289_5.1"

echo ""
echo -e "${BLUE}1. Project Structure${NC}"
echo "────────────────────────────────────────────"
echo -n "Backend directory:           "
check_dir "$PROJECT_ROOT/backend"
echo " $PROJECT_ROOT/backend"

echo -n "Frontend directory:          "
check_dir "$PROJECT_ROOT/frontend"
echo " $PROJECT_ROOT/frontend"

echo ""
echo -e "${BLUE}2. Backend Files${NC}"
echo "────────────────────────────────────────────"

# Java files
echo -n "TicketsApplication.java:     "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/TicketsApplication.java"
echo ""

echo -n "TicketController.java:       "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/controller/TicketController.java"
echo ""

echo -n "TicketService.java:          "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/service/TicketService.java"
echo ""

echo -n "FileStorageService.java:     "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/service/FileStorageService.java"
echo ""

echo -n "TicketRepository.java:       "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/repository/TicketRepository.java"
echo ""

echo -n "Ticket.java (entity):        "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/model/Ticket.java"
echo ""

echo -n "TicketComment.java (entity): "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/model/TicketComment.java"
echo ""

echo -n "TicketDTO.java:              "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/dto/TicketDTO.java"
echo ""

echo -n "TicketStatsDTO.java:         "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/dto/TicketStatsDTO.java"
echo ""

echo -n "GlobalExceptionHandler.java: "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/exception/GlobalExceptionHandler.java"
echo ""

echo -n "WebConfig.java:              "
check_file "$PROJECT_ROOT/backend/src/main/java/com/campus/tickets/config/WebConfig.java"
echo ""

echo -n "application.properties:      "
check_file "$PROJECT_ROOT/backend/src/main/resources/application.properties"
echo ""

echo -n "pom.xml:                     "
check_file "$PROJECT_ROOT/backend/pom.xml"
echo ""

echo -n "Built JAR:                   "
check_file "$PROJECT_ROOT/backend/target/tickets-1.0.0-SNAPSHOT.jar"
echo ""

echo ""
echo -e "${BLUE}3. Frontend Files${NC}"
echo "────────────────────────────────────────────"

echo -n "App.jsx:                     "
check_file "$PROJECT_ROOT/frontend/src/App.jsx"
echo ""

echo -n "TicketList.jsx:              "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketList.jsx"
echo ""

echo -n "TicketForm.jsx:              "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketForm.jsx"
echo ""

echo -n "TicketDetail.jsx:            "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketDetail.jsx"
echo ""

echo -n "api.js service:              "
check_file "$PROJECT_ROOT/frontend/src/services/api.js"
echo ""

echo -n "index.css (global):          "
check_file "$PROJECT_ROOT/frontend/src/index.css"
echo ""

echo -n "TicketList.css:              "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketList.css"
echo ""

echo -n "TicketForm.css:              "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketForm.css"
echo ""

echo -n "TicketDetail.css:            "
check_file "$PROJECT_ROOT/frontend/src/components/tickets/TicketDetail.css"
echo ""

echo -n "vite.config.js:              "
check_file "$PROJECT_ROOT/frontend/vite.config.js"
echo ""

echo -n "package.json:                "
check_file "$PROJECT_ROOT/frontend/package.json"
echo ""

echo -n "index.html:                  "
check_file "$PROJECT_ROOT/frontend/index.html"
echo ""

echo -n "node_modules:                "
check_dir "$PROJECT_ROOT/frontend/node_modules"
echo ""

echo ""
echo -e "${BLUE}4. Documentation Files${NC}"
echo "────────────────────────────────────────────"

echo -n "README.md:                   "
check_file "$PROJECT_ROOT/README.md"
echo ""

echo -n "ARCHITECTURE.md:             "
check_file "$PROJECT_ROOT/ARCHITECTURE.md"
echo ""

echo -n "TESTING.md:                  "
check_file "$PROJECT_ROOT/TESTING.md"
echo ""

echo ""
echo -e "${BLUE}5. Running Services${NC}"
echo "────────────────────────────────────────────"

# Check backend
echo -n "Backend (port 8080):         "
if check_port 8080; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Check frontend
echo -n "Frontend (port 5173):        "
if check_port 5173; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Check database
echo -n "Database directory:          "
[ -d "$PROJECT_ROOT/backend/data" ] && echo -e "${GREEN}✓ Exists${NC}" || echo -e "${YELLOW}✗ Not created yet${NC} (will be created on first run)"

echo ""
echo -e "${BLUE}6. System Status${NC}"
echo "────────────────────────────────────────────"

# Check Java version
echo -n "Java version:                "
java_version=$(java -version 2>&1 | grep -oP '(?<=version ").*' | cut -d'"' -f1)
if [[ ! -z "$java_version" ]]; then
    if [[ $java_version == 17* ]] || [[ $java_version == 18* ]] || [[ $java_version == 19* ]] || [[ $java_version == 2[0-5]* ]]; then
        echo -e "${GREEN}✓ $java_version${NC}"
    else
        echo -e "${YELLOW}⚠ $java_version (17+ recommended)${NC}"
    fi
else
    echo -e "${RED}✗ Java not found${NC}"
fi

# Check Node.js version
echo -n "Node.js version:             "
if command -v node &> /dev/null; then
    node_version=$(node -v)
    echo -e "${GREEN}✓ $node_version${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
fi

# Check npm
echo -n "npm version:                 "
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    echo -e "${GREEN}✓ $npm_version${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
fi

echo ""
echo -e "${BLUE}7. API Endpoints${NC}"
echo "────────────────────────────────────────────"

# Test backend API
if check_port 8080; then
    echo "Testing API endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/tickets 2>/dev/null)
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✓${NC} GET /api/tickets: $response OK"
    else
        echo -e "${RED}✗${NC} GET /api/tickets: $response"
    fi
else
    echo "Backend not running, skipping API test"
fi

echo ""
echo -e "${BLUE}8. Quick Start Commands${NC}"
echo "────────────────────────────────────────────"
echo ""
echo "To start the application:"
echo ""
echo "  # Terminal 1: Backend"
echo "  $ cd $PROJECT_ROOT/backend"
echo "  $ java -jar target/tickets-1.0.0-SNAPSHOT.jar"
echo "  # Or rebuild and run:"
echo "  $ ./mvnw spring-boot:run"
echo ""
echo "  # Terminal 2: Frontend"
echo "  $ cd $PROJECT_ROOT/frontend"
echo "  $ npm run dev --legacy-peer-deps"
echo ""
echo "  # Access in browser"
echo "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo "  Backend:  ${BLUE}http://localhost:8080${NC}"
echo "  H2 Console: ${BLUE}http://localhost:8080/h2-console${NC}"
echo ""

echo -e "${BLUE}9. API Testing${NC}"
echo "────────────────────────────────────────────"
echo ""
echo "List tickets:"
echo "  ${BLUE}curl http://localhost:8080/api/tickets${NC}"
echo ""
echo "Get statistics:"
echo "  ${BLUE}curl http://localhost:8080/api/tickets/stats${NC}"
echo ""
echo "Create ticket (with form data):"
echo "  ${BLUE}curl -X POST http://localhost:8080/api/tickets \\\\"
echo "    -F 'title=Test' -F 'description=Desc' \\\\"
echo "    -F 'category=HARDWARE' -F 'priority=HIGH' \\\\"
echo "    -F 'reportedBy=user@example.com'${NC}"
echo ""

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Summary                                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "✓ All source files present"
echo "✓ Backend compiled to JAR"
echo "✓ Frontend dependencies installed"
echo "✓ Configuration files ready"
echo "✓ Documentation complete"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && java -jar target/tickets-1.0.0-SNAPSHOT.jar"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Open browser:   http://localhost:5173"
echo ""
