#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🛑 Stopping all Microfrontends...${NC}"
echo ""

# Function to stop an MFE
stop_mfe() {
    local mfe_name=$1
    local pid_file="${mfe_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping ${mfe_name} (PID: $pid)...${NC}"
            kill "$pid"
            rm "$pid_file"
            echo -e "${GREEN}✅ ${mfe_name} stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  ${mfe_name} process not running${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  No PID file found for ${mfe_name}${NC}"
    fi
}

# Stop all MFEs
stop_mfe "header-mfe"
stop_mfe "tasklist-mfe"
stop_mfe "login-mfe"

# Also try to kill any remaining webpack dev servers
echo -e "${BLUE}🧹 Cleaning up any remaining webpack processes...${NC}"
pkill -f "webpack.*serve" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All MFEs stopped successfully!${NC}"
