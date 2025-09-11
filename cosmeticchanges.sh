#!/bin/bash

# Cosmetic Changes Script for Rails Single-SPA MFE Application
# This script removes specific text elements and replaces TaskList MFE header

set -e  # Exit on any error

echo "🎨 Starting cosmetic changes for Rails Single-SPA MFE application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to backup a file
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${BLUE}📋 Backed up: $file${NC}"
    fi
}

# Function to check if file exists
check_file() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    return 0
}

echo -e "${YELLOW}📍 Starting changes...${NC}"

# 1. Remove header MFE identification text from header-mfe/src/Header.js
echo -e "${BLUE}🧭 Updating Header MFE...${NC}"
HEADER_FILE="header-mfe/src/Header.js"
if check_file "$HEADER_FILE"; then
    backup_file "$HEADER_FILE"
    
    # Remove the MFE identification header div completely
    sed -i '/\/\/ MFE identification header/,/this\.getDataSourceBadge()/c\
        // MFE identification header removed' "$HEADER_FILE"
    
    # Alternative approach - remove the entire div block that contains the MFE header
    sed -i '/React\.createElement('\''div'\'', {$/,/}),$/{ 
        /key: '\''mfe-header'\''/,/]),$/{ 
            /background: '\''#fff3e0'\''/,/]),$/{
                d
            }
        }
    }' "$HEADER_FILE"
    
    # Remove the specific text content lines
    sed -i '/🧭 Header\/Navigation Microfrontend (Port 8082)/d' "$HEADER_FILE"
    sed -i '/this\.getDataSourceBadge()/d' "$HEADER_FILE"
    
    echo -e "${GREEN}✅ Header MFE identification text removed${NC}"
else
    echo -e "${YELLOW}⚠️  Header MFE file not found, skipping...${NC}"
fi

# 2. Remove welcome text from tasks index view
echo -e "${BLUE}👋 Updating Tasks Index View...${NC}"
TASKS_INDEX_FILE="app/views/tasks/index.html.erb"
if check_file "$TASKS_INDEX_FILE"; then
    backup_file "$TASKS_INDEX_FILE"
    
    # Remove the welcome section entirely
    sed -i '/<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">/,/<\/div>/d' "$TASKS_INDEX_FILE"
    
    # Alternative: Remove lines containing the welcome text
    sed -i '/Welcome, <%= Current\.user\.email_address %>/d' "$TASKS_INDEX_FILE"
    sed -i '/Organization: <%= Current\.user\.organization/d' "$TASKS_INDEX_FILE"
    
    echo -e "${GREEN}✅ Welcome text removed from tasks index${NC}"
else
    echo -e "${YELLOW}⚠️  Tasks index file not found, skipping...${NC}"
fi

# 3. Update TaskList MFE header text
echo -e "${BLUE}📋 Updating TaskList MFE...${NC}"
TASKLIST_FILE="tasklist-mfe/src/TaskList.js"
if check_file "$TASKLIST_FILE"; then
    backup_file "$TASKLIST_FILE"
    
    # Replace the TaskList MFE header content
    sed -i 's/📋 TaskList Microfrontend (Port 8081)/Tasklist/g' "$TASKLIST_FILE"
    sed -i 's/Independent MFE • React Component • Click tasks to view details🔗 Rails Data//g' "$TASKLIST_FILE"
    sed -i 's/Independent MFE • React Component • Click tasks to view details//g' "$TASKLIST_FILE"
    
    # Remove the subtitle div entirely if it becomes empty
    sed -i '/subtitle.*style.*fontSize.*12px/,/]/{ 
        /Independent MFE.*Click tasks to view details/d
        /this\.getDataSourceBadge()/d
    }' "$TASKLIST_FILE"
    
    # Simplify the header to just say "Tasklist"
    sed -i '/React\.createElement('\''div'\'', { key: '\''title'\'' }, /c\
          React.createElement('\''div'\'', { key: '\''title'\'' }, '\''Tasklist'\''),' "$TASKLIST_FILE"
    
    echo -e "${GREEN}✅ TaskList MFE header updated to 'Tasklist'${NC}"
else
    echo -e "${YELLOW}⚠️  TaskList MFE file not found, skipping...${NC}"
fi

# 4. Also check and update the alternative TaskList location if it exists
TASKLIST_COMPONENT_FILE="app/javascript/components/TaskList.js"
if check_file "$TASKLIST_COMPONENT_FILE"; then
    echo -e "${BLUE}📋 Updating TaskList Component...${NC}"
    backup_file "$TASKLIST_COMPONENT_FILE"
    
    # Apply similar changes to the component file
    sed -i 's/📋 TaskList Microfrontend (Port 8081)/Tasklist/g' "$TASKLIST_COMPONENT_FILE"
    sed -i 's/Independent MFE • React Component • Click tasks to view details//g' "$TASKLIST_COMPONENT_FILE"
    
    echo -e "${GREEN}✅ TaskList Component updated${NC}"
fi

# 5. Check for any other files that might contain these text elements
echo -e "${BLUE}🔍 Checking for other occurrences...${NC}"

# Check microfrontends directory
if [ -d "app/javascript/microfrontends" ]; then
    echo -e "${BLUE}📁 Checking microfrontends directory...${NC}"
    
    HEADER_MFE_JS="app/javascript/microfrontends/header-mfe.js"
    if check_file "$HEADER_MFE_JS"; then
        backup_file "$HEADER_MFE_JS"
        sed -i '/🧭 Header\/Navigation Microfrontend (Port 8082)/d' "$HEADER_MFE_JS"
        echo -e "${GREEN}✅ Updated microfrontends/header-mfe.js${NC}"
    fi
    
    TASKLIST_MFE_JS="app/javascript/microfrontends/tasklist-mfe.js"
    if check_file "$TASKLIST_MFE_JS"; then
        backup_file "$TASKLIST_MFE_JS"
        sed -i 's/📋 TaskList Microfrontend (Port 8081)/Tasklist/g' "$TASKLIST_MFE_JS"
        sed -i 's/Independent MFE • React Component • Click tasks to view details//g' "$TASKLIST_MFE_JS"
        echo -e "${GREEN}✅ Updated microfrontends/tasklist-mfe.js${NC}"
    fi
fi

# 6. Clean up any remaining references in standalone HTML files
echo -e "${BLUE}🧹 Cleaning up standalone files...${NC}"

# Check header MFE standalone HTML
HEADER_HTML="header-mfe/public/index.html"
if check_file "$HEADER_HTML"; then
    backup_file "$HEADER_HTML"
    sed -i 's/Header Microfrontend - Standalone Mode/Header/g' "$HEADER_HTML"
    sed -i '/Running independently on port 8082/d' "$HEADER_HTML"
    echo -e "${GREEN}✅ Updated header MFE standalone HTML${NC}"
fi

# Check tasklist MFE standalone HTML
TASKLIST_HTML="tasklist-mfe/public/index.html"
if check_file "$TASKLIST_HTML"; then
    backup_file "$TASKLIST_HTML"
    sed -i 's/TaskList Microfrontend - Standalone Mode/Tasklist/g' "$TASKLIST_HTML"
    sed -i '/Running independently on port 8081/d' "$TASKLIST_HTML"
    echo -e "${GREEN}✅ Updated tasklist MFE standalone HTML${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All cosmetic changes completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary of changes:${NC}"
echo -e "  • ✅ Removed header MFE identification text"
echo -e "  • ✅ Removed welcome text from tasks index"
echo -e "  • ✅ Updated TaskList MFE header to just 'Tasklist'"
echo -e "  • ✅ Cleaned up standalone HTML files"
echo ""
echo -e "${YELLOW}📁 Backup files created with timestamp suffix${NC}"
echo -e "${BLUE}💡 Tip: Test your application to ensure everything works as expected${NC}"
echo ""
echo -e "${GREEN}✨ Cosmetic changes complete! Your app should now have a cleaner interface.${NC}"