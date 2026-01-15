# Blue Perfumery MCP Server

Model Context Protocol (MCP) server that enables AI assistants like Claude to access Blue Perfumery's perfume database and product information.

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that allows AI assistants to securely access external data sources and tools. This server provides Claude and other MCP-compatible assistants direct access to Blue Perfumery's product catalog.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| TypeScript | 5.3+ | Type Safety |
| MCP SDK | 0.5+ | Protocol Implementation |
| MongoDB | - | Database |
| Mongoose | 8.0+ | ODM |

## Available Tools

| Tool | Description |
|------|-------------|
| `list_all_perfumes` | Get all perfumes in the collection |
| `get_perfume_by_id` | Get a specific perfume by ID |
| `search_perfumes` | Search perfumes by name or brand |
| `get_perfumes_by_category` | Filter by category (men, women, niche) |
| `get_purchase_link` | Get Shopier purchase link for a perfume |

## Installation

```bash
# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=your-mongodb-uri" > .env

# Build
npm run build

# Run
npm start
```

## Claude Desktop Integration

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "blue-perfumery": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "your-mongodb-connection-string"
      }
    }
  }
}
```

## Project Structure

```
src/
├── index.ts          # MCP server entry point
├── config/
│   └── database.ts   # MongoDB connection
└── models/
    └── Product.ts    # Perfume model
```

## Example Usage

Once configured, you can ask Claude:

- "What perfumes does Blue Perfumery have?"
- "Search for woody perfumes"
- "Show me men's fragrances"
- "Get the purchase link for [perfume name]"

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with tsx |
| `npm run build` | Compile TypeScript |
| `npm start` | Start server |

## License

MIT
