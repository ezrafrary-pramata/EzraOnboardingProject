#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting all Microfrontends...${NC}"
echo ""

# Function to start an MFE in the background
start_mfe() {
    local mfe_name=$1
    local port=$2
    
    if [ -d "$mfe_name" ]; then
        echo -e "${YELLOW}Starting ${mfe_name} on port ${port}...${NC}"
        cd "$mfe_name"
        npm start &
        local pid=$!
        echo "$pid" > "../${mfe_name}.pid"
        cd ..
        echo -e "${GREEN}✅ ${mfe_name} started (PID: $pid)${NC}"
    else
        echo -e "${YELLOW}⚠️  ${mfe_name} directory not found, skipping...${NC}"
    fi
}

# Start all MFEs
start_mfe "header-mfe" "8082"
start_mfe "tasklist-mfe" "8081"
start_mfe "login-mfe" "8083"

echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "${YELLOW}  • Header MFE: http://localhost:8082${NC}"
echo -e "${YELLOW}  • TaskList MFE: http://localhost:8081${NC}"
echo -e "${YELLOW}  • Login MFE: http://localhost:8083${NC}"
echo ""
echo -e "${BLUE}📝 To stop all MFEs, run: ./stop-all-mfes.sh${NC}"
echo -e "${BLUE}💡 Start your Rails server with: bin/rails server${NC}"
echo ""
echo -e "${GREEN}🎉 All MFEs started successfully!${NC}"

# Wait for user to press Ctrl+C
echo "Press Ctrl+C to stop all MFEs..."
wait
