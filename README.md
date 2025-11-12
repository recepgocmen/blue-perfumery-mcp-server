# Blue Perfumery MCP Server

[![npm version](https://badge.fury.io/js/%40blueperfumery%2Fmcp-server.svg)](https://www.npmjs.com/package/@blueperfumery/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides seamless access to the Blue Perfumery perfume collection data, enabling AI assistants to help users discover and purchase their perfect fragrance.

## Overview

This MCP server exposes comprehensive perfume data from the Blue Perfumery website, allowing Claude and other MCP-compatible AI assistants to:

- 🔍 Search through 50+ premium perfumes
- 💰 Compare prices and get purchase links
- 🎯 Filter by gender, brand, and characteristics
- 📝 Access detailed fragrance notes and descriptions
- 🛒 Direct integration with Shopier for purchases

## Features

The server provides the following powerful tools:

- **`list_all_perfumes`** - Returns all perfumes in the collection with full details
- **`get_perfume_by_id`** - Retrieves a specific perfume by its unique ID
- **`search_perfumes`** - Intelligent search by perfume name or brand
- **`get_perfumes_by_category`** - Filter by category (men's, women's, or niche)
- **`get_purchase_link`** - Get direct Shopier purchase links for any perfume

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Access to Blue Perfumery MongoDB database

### Option 1: NPM Package (Recommended)

```bash
npm install -g @blueperfumery/mcp-server
```

### Option 2: From Source

```bash
git clone https://github.com/blueperfumery/mcp-server.git
cd mcp-server
npm install
npm run build
```

### Database Setup

The MCP server requires a MongoDB connection to fetch real-time perfume data:

1. **Create environment file**

   Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. **Configure MongoDB connection**

   Edit `.env` file with your MongoDB URI:
   ```bash
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/blueperfumery
   
   # For MongoDB Atlas (cloud)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blueperfumery
   ```

3. **Ensure database has data**

   The MCP server connects to the same database as the Blue Perfumery backend. Make sure your backend is running and has data migrated:
   ```bash
   cd ../blueperfumery-backend
   npm run migrate  # This will populate the database with perfume data
   ```

## Usage

### Using with Claude Desktop

Add the following to your Claude Desktop configuration file:

**For NPM installation:**
```json
{
  "mcpServers": {
    "blue-perfumery": {
      "command": "blue-perfumery-mcp",
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017/blueperfumery"
      }
    }
  }
}
```

**For source installation:**
```json
{
  "mcpServers": {
    "blue-perfumery": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-server",
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017/blueperfumery"
      }
    }
  }
}
```

> **Important**: Replace the `MONGODB_URI` value with your actual MongoDB connection string. For production, use MongoDB Atlas or your hosted database URL.

### Configuration File Location

The Claude Desktop configuration file is located at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

After updating the configuration, restart Claude Desktop.

## Data Structure

Each perfume object contains:

- `id`: Unique identifier
- `name`: Perfume name
- `brand`: Brand name
- `price`: Price in TL
- `ml`: Volume in milliliters
- `originalPrice`: Original price (optional)
- `gender`: "male", "female", or "unisex"
- `category`: Product category (luxury, premium, etc.)
- `status`: Product status (active, inactive, discontinued)
- `stock`: Available stock quantity
- `sku`: Stock keeping unit
- `notes`: Array of scent notes
- `description`: Description text
- `ageRange`: Recommended age range (min/max)
- `characteristics`: Array of characteristic descriptors
- `shopierLink`: Purchase link (optional)

## Database Integration

The MCP server now connects directly to the MongoDB database used by the Blue Perfumery backend. This means:

- **Real-time data**: All perfume data is fetched from the live database
- **No static data**: The server no longer uses hardcoded perfume lists
- **Automatic updates**: Any changes to products in the backend are immediately reflected
- **Shared database**: Both the backend API and MCP server use the same MongoDB instance

### Architecture

```
┌─────────────────────┐
│  Claude Desktop     │
│  (MCP Client)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│  MCP Server         │◄──────┤  MongoDB Database   │
│  (This Package)     │       │  (blueperfumery)    │
└─────────────────────┘       └──────────▲──────────┘
                                         │
                              ┌──────────┴──────────┐
                              │  Backend API        │
                              │  (Express + REST)   │
                              └─────────────────────┘
```

## Example Usage

Once connected to an MCP client, you can use the tools like this:

```
// List all perfumes
list_all_perfumes()

// Get specific perfume
get_perfume_by_id({ id: "mfk-br540" })

// Search perfumes
search_perfumes({ query: "oud" })

// Get perfumes by category
get_perfumes_by_category({ category: "niche" })

// Get purchase link
get_purchase_link({ id: "mfk-br540" })
```

## 🎯 Real-World Usage Examples

Once connected to Claude Desktop, you can ask natural language questions like:

- *"Show me all the Tom Ford perfumes you have"*
- *"I want a sweet, oriental perfume for women under 1000 TL"*
- *"Give me the purchase link for Baccarat Rouge 540"*
- *"What are the most expensive perfumes in your collection?"*
- *"Find me a perfume with oud and vanilla notes"*

## 🏗️ Data Structure

Each perfume includes comprehensive information:

- **Basic Info**: ID, name, brand, price, volume
- **Fragrance Details**: Notes, characteristics, description
- **Demographics**: Gender target, age range recommendations
- **Purchase**: Direct Shopier shopping links
- **Pricing**: Current price and original price comparison

## Development

The server is built with:
- TypeScript
- @modelcontextprotocol/sdk
- Node.js
- MongoDB & Mongoose
- dotenv

### Running in Development

```bash
# Install dependencies
npm install

# Create .env file with MongoDB URI
cp env.example .env

# Edit .env with your MongoDB connection string

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Ideas for Contributions

- 🆕 Add new MCP tools (price tracking, recommendations, etc.)
- 🔧 Improve search algorithms with fuzzy matching
- 🌍 Add internationalization support
- 📊 Add analytics and usage metrics
- 🎨 Add image support from database
- 🔗 Add inventory management tools
- 🔍 Add advanced filtering options
- 📈 Add trending perfumes tool

## Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/recepgocmen/blue-perfumery-mcp/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About Blue Perfumery

Blue Perfumery is a premium fragrance retailer offering luxury and niche perfumes. Visit [Blue Perfumery](https://blueperfumery.com) to explore our full collection.

---

Made with ❤️ for the fragrance community
