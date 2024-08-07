#!/bin/bash

echo "Setting up Node.js project for advanced-localhoster..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo '{ "name": "advanced-localhoster", "version": "1.0.0", "main": "advanced-localhoster.js" }' > package.json
fi

# Install dependencies
npm install express helmet morgan express-rate-limit compression cors dotenv

# Check if advanced-localhoster.js exists
if [ ! -f advanced-localhoster.js ]; then
    echo "ERROR: advanced-localhoster.js not found."
    echo "Please create this file with your Node.js server code."
else
    echo "advanced-localhoster.js found."
fi

# Create public directory if it doesn't exist
mkdir -p public

echo
echo "Setup complete. Here's how to use the server:"
echo "1. Ensure your Node.js code is in advanced-localhoster.js"
echo "2. Place your HTML and other static files in the 'public' directory."
echo "3. To start the server, run: node advanced-localhoster.js"
echo "4. Open a web browser and go to http://localhost:3000 to view your site."
echo
read -p "Would you like to start the server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    node advanced-localhoster.js
else
    echo "Server not started. You can run it later with: node advanced-localhoster.js"
fi