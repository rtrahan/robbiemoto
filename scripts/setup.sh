#!/bin/bash

# Robbiemoto Auction Platform Setup Script
# This script helps you get started quickly

set -e

echo "🏺 Robbiemoto Auction Platform Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your actual API keys${NC}"
else
    echo -e "${YELLOW}ℹ️  .env.local already exists, skipping...${NC}"
fi

echo ""

# Ask about database setup
echo "🗄️  Database Setup"
echo "----------------"
echo "Do you want to set up the database? (requires DATABASE_URL in .env.local)"
read -p "Setup database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=\"postgresql://" .env.local 2>/dev/null; then
        echo "Setting up database..."
        
        # Push schema
        echo "📤 Pushing database schema..."
        npm run db:push
        echo -e "${GREEN}✅ Database schema created${NC}"
        
        # Seed database
        echo "🌱 Seeding database with sample data..."
        npm run db:seed
        echo -e "${GREEN}✅ Database seeded${NC}"
        
        echo ""
        echo -e "${GREEN}✅ Database setup complete!${NC}"
    else
        echo -e "${YELLOW}⚠️  No valid DATABASE_URL found in .env.local${NC}"
        echo "Please add your database connection string and run:"
        echo "  npm run db:push"
        echo "  npm run db:seed"
    fi
else
    echo "Skipping database setup"
    echo "You can set it up later with: npm run db:push && npm run db:seed"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. Review and update .env.local with your API keys"
echo "   ${YELLOW}See SETUP.md for detailed instructions${NC}"
echo ""
echo "2. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "4. Access admin panel at http://localhost:3000/admin"
echo ""
echo "📚 Documentation:"
echo "   - SETUP.md - Detailed setup guide"
echo "   - README.md - Project overview"
echo "   - PRODUCT_SPEC.md - Feature documentation"
echo ""
echo "💡 Quick Commands:"
echo "   npm run dev          - Start development server"
echo "   npm run db:studio    - Open database visual editor"
echo "   npm run db:seed      - Reseed database with sample data"
echo ""
echo -e "${GREEN}Happy building! 🏺${NC}"

