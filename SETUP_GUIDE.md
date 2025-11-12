# Blue Perfumery MCP Server - Database Integration Setup Guide

This guide walks you through connecting the MCP server to the MongoDB database.

## Overview

The MCP server has been updated to fetch data directly from MongoDB instead of using static data. This provides:

- ✅ Real-time data from the database
- ✅ Automatic synchronization with backend changes
- ✅ No need to update static files
- ✅ Direct access to all product features (stock, status, etc.)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Blue Perfumery Ecosystem                          │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐             │
│  │   Frontend   │    │ Admin Panel  │             │
│  │   (Next.js)  │    │   (React)    │             │
│  └──────┬───────┘    └──────┬───────┘             │
│         │                   │                      │
│         │    REST API       │                      │
│         └──────────┬────────┘                      │
│                    │                               │
│         ┌──────────▼──────────┐                    │
│         │   Backend API       │                    │
│         │   (Express.js)      │                    │
│         └──────────┬──────────┘                    │
│                    │                               │
│         ┌──────────▼──────────┐                    │
│         │   MongoDB Database  │◄─────────┐         │
│         │   (blueperfumery)   │          │         │
│         └─────────────────────┘          │         │
│                                           │         │
│                                  ┌────────┴──────┐  │
│                                  │  MCP Server   │  │
│                                  │  (This)       │  │
│                                  └────────▲──────┘  │
│                                           │         │
│                                  ┌────────┴──────┐  │
│                                  │ Claude Desktop│  │
│                                  │  (AI Client)  │  │
│                                  └───────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

Before setting up the MCP server, ensure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or Atlas)
3. **Backend API** running with data migrated
4. **Claude Desktop** (for testing)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /path/to/mcp-server
npm install
```

This will install:
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `@modelcontextprotocol/sdk` - MCP SDK
- TypeScript and other dev dependencies

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp env.example .env
```

Edit `.env` with your MongoDB connection:

```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/blueperfumery

# For MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blueperfumery

NODE_ENV=development
```

**Important**: Use the **same MongoDB URI** as your backend API to ensure data consistency.

### 3. Verify Backend Database

Make sure your backend has data in the database:

```bash
cd ../blueperfumery-backend

# Check if .env is configured
cat .env

# Run data migration if needed
npm run migrate
```

This will populate MongoDB with perfume data from the static files.

### 4. Build the MCP Server

```bash
cd ../mcp-server
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 5. Configure Claude Desktop

Edit Claude Desktop configuration file:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Add this configuration:**

```json
{
  "mcpServers": {
    "blue-perfumery": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017/blueperfumery"
      }
    }
  }
}
```

**Replace `/absolute/path/to/mcp-server/` with your actual path!**

Example for macOS:
```json
{
  "mcpServers": {
    "blue-perfumery": {
      "command": "node",
      "args": ["/Users/yourname/projects/blue-perfumery/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017/blueperfumery"
      }
    }
  }
}
```

### 6. Restart Claude Desktop

After updating the configuration:
1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. The MCP server should automatically connect

## Testing the Integration

### Test 1: Check Server Logs

In Claude Desktop, the MCP server will log to stderr. You should see:

```
✅ MCP Server: MongoDB connected successfully
📊 Database: blueperfumery
Blue Perfumery MCP server running on stdio
```

### Test 2: List All Perfumes

In Claude, try:
```
List all perfumes from Blue Perfumery
```

Expected: A list of all active perfumes from the database

### Test 3: Search Functionality

```
Search for "oud" perfumes
```

Expected: Results matching "oud" in name, brand, or description

### Test 4: Get Specific Perfume

```
Get details for perfume ID "mfk-br540"
```

Expected: Full details of that specific perfume

### Test 5: Category Filtering

```
Show me all women's perfumes
```

Expected: List of female and unisex perfumes

### Test 6: Purchase Links

```
Get purchase link for "Baccarat Rouge 540"
```

Expected: Shopier purchase link if available

## Troubleshooting

### Issue: "MongoDB connection error"

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # For local MongoDB
   mongosh
   ```

2. Verify connection string in `.env`:
   ```bash
   echo $MONGODB_URI
   ```

3. Check backend can connect:
   ```bash
   cd ../blueperfumery-backend
   npm run dev
   ```

### Issue: "No perfumes found"

**Solutions:**
1. Check database has data:
   ```bash
   mongosh blueperfumery
   db.products.countDocuments()
   ```

2. Run migration:
   ```bash
   cd ../blueperfumery-backend
   npm run migrate
   ```

### Issue: "MCP server not connecting"

**Solutions:**
1. Check Claude Desktop config path is correct
2. Use absolute paths in configuration
3. Check logs in Claude Desktop
4. Rebuild MCP server:
   ```bash
   npm run build
   ```

### Issue: "Module not found" errors

**Solutions:**
1. Reinstall dependencies:
   ```bash
   npm install
   npm run build
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/blueperfumery` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Database Schema

The MCP server expects products in MongoDB with this schema:

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Perfume name
  brand: string;           // Brand name
  price: number;           // Price in TL
  ml?: number;             // Volume
  originalPrice?: number;  // Original price
  gender: "male" | "female" | "unisex";
  category?: string;       // luxury, premium, etc.
  status?: string;         // active, inactive, discontinued
  stock?: number;          // Available quantity
  sku?: string;            // Stock keeping unit
  notes: string[];         // Fragrance notes
  description: string;     // Product description
  ageRange: {
    min: number;
    max: number;
  };
  characteristics: string[];  // Product characteristics
  shopierLink?: string;       // Purchase link
}
```

## Available MCP Tools

The server provides these tools to Claude:

1. **`list_all_perfumes`** - Get all active perfumes
2. **`get_perfume_by_id`** - Get specific perfume by ID
3. **`search_perfumes`** - Search by name/brand/description
4. **`get_perfumes_by_category`** - Filter by men/women/niche
5. **`get_purchase_link`** - Get Shopier purchase link

## Monitoring

To monitor MCP server activity:

1. **Claude Desktop Logs**: Check stderr output in Claude
2. **MongoDB Logs**: Monitor database queries
3. **Backend Logs**: Check API server logs

## Production Deployment

For production:

1. Use MongoDB Atlas (cloud database)
2. Update `MONGODB_URI` with Atlas connection string
3. Set `NODE_ENV=production`
4. Consider rate limiting and caching
5. Monitor database performance

## Security Notes

- ✅ Never commit `.env` files to git
- ✅ Use environment variables for secrets
- ✅ Restrict MongoDB access with authentication
- ✅ Use MongoDB Atlas network access controls
- ✅ Keep dependencies updated

## Next Steps

After successful setup:

1. Test all MCP tools in Claude Desktop
2. Monitor performance and query times
3. Consider adding more MCP tools:
   - Price comparison
   - Stock alerts
   - Recommendations
   - Analytics

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review README.md
3. Check backend README for database setup
4. Open an issue on GitHub

## Summary

You've now:
- ✅ Connected MCP server to MongoDB
- ✅ Configured environment variables
- ✅ Integrated with Claude Desktop
- ✅ Tested the connection

The MCP server is now fetching real-time data from your database! 🎉

