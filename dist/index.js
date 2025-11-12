#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { connectDatabase } from "./config/database.js";
import { Product } from "./models/Product.js";
const server = new Server({
    name: "blue-perfumery-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_all_perfumes",
                description: "List all perfumes in the Blue Perfumery collection",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "get_perfume_by_id",
                description: "Get a specific perfume by its ID",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "The perfume ID",
                        },
                    },
                    required: ["id"],
                },
            },
            {
                name: "search_perfumes",
                description: "Search perfumes by name or brand",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query for perfume name or brand",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_perfumes_by_category",
                description: "Get perfumes by category (men, women, niche)",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            description: "Category: 'men', 'women', or 'niche'",
                            enum: ["men", "women", "niche"],
                        },
                    },
                    required: ["category"],
                },
            },
            {
                name: "get_purchase_link",
                description: "Get the Shopier purchase link for a specific perfume",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "The perfume ID",
                        },
                    },
                    required: ["id"],
                },
            },
        ],
    };
});
// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "list_all_perfumes": {
                const perfumes = await Product.find({ status: "active" }).lean();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                count: perfumes.length,
                                perfumes: perfumes,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_perfume_by_id": {
                const { id } = args;
                if (!id) {
                    throw new McpError(ErrorCode.InvalidParams, "ID parameter is required");
                }
                const perfume = await Product.findOne({ id, status: "active" }).lean();
                if (!perfume) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: false,
                                    error: `Perfume with ID '${id}' not found`,
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                perfume: perfume,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "search_perfumes": {
                const { query } = args;
                if (!query) {
                    throw new McpError(ErrorCode.InvalidParams, "Query parameter is required");
                }
                const results = await Product.find({
                    status: "active",
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                        { brand: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } },
                    ],
                }).lean();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                query: query,
                                count: results.length,
                                perfumes: results,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_perfumes_by_category": {
                const { category } = args;
                if (!category) {
                    throw new McpError(ErrorCode.InvalidParams, "Category parameter is required");
                }
                if (!["men", "women", "niche"].includes(category)) {
                    throw new McpError(ErrorCode.InvalidParams, "Category must be 'men', 'women', or 'niche'");
                }
                let filter = { status: "active" };
                if (category === "niche" || category === "niches") {
                    // Niche perfumes - filter by category containing exclusive/artisanal/premium
                    filter.$or = [
                        { category: { $regex: "exclusive", $options: "i" } },
                        { category: { $regex: "artisanal", $options: "i" } },
                        { category: { $regex: "premium", $options: "i" } },
                        { category: "niches" },
                    ];
                }
                else if (category === "men" || category === "male") {
                    // Men's perfumes - male or unisex
                    filter.$or = [
                        { gender: "male" },
                        { gender: "unisex" },
                    ];
                }
                else if (category === "women" || category === "female") {
                    // Women's perfumes - female or unisex
                    filter.$or = [
                        { gender: "female" },
                        { gender: "unisex" },
                    ];
                }
                const results = await Product.find(filter).lean();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                category: category,
                                count: results.length,
                                perfumes: results,
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_purchase_link": {
                const { id } = args;
                if (!id) {
                    throw new McpError(ErrorCode.InvalidParams, "ID parameter is required");
                }
                const perfume = await Product.findOne({ id, status: "active" }).lean();
                if (!perfume) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: false,
                                    error: `Perfume with ID '${id}' not found`,
                                }, null, 2),
                            },
                        ],
                    };
                }
                if (!perfume.shopierLink) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    success: false,
                                    error: `No purchase link available for '${perfume.name}'`,
                                }, null, 2),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                perfume: {
                                    id: perfume.id,
                                    name: perfume.name,
                                    brand: perfume.brand,
                                    price: perfume.price,
                                },
                                purchaseLink: perfume.shopierLink,
                                message: `You can purchase ${perfume.name} from Blue Perfumery via Shopier`,
                            }, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error}`);
    }
});
// Start the server
async function main() {
    try {
        // Connect to database first
        await connectDatabase();
        // Then start the MCP server
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Blue Perfumery MCP server running on stdio");
    }
    catch (error) {
        console.error("Failed to start MCP server:", error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
