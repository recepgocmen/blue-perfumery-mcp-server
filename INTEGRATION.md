# MCP Server Database Integration - Technical Documentation

## Changes Made

### 1. Dependencies Added

Updated `package.json` to include:
- `mongoose@^8.0.0` - MongoDB ODM for database operations
- `dotenv@^16.3.1` - Environment variable management

### 2. New Files Created

#### `src/config/database.ts`
Database configuration and connection management:
- Establishes MongoDB connection
- Handles connection events
- Implements graceful shutdown
- Error handling for connection issues

#### `src/models/Product.ts`
MongoDB schema and model definition:
- Matches backend product schema
- Includes all perfume fields
- Defines indexes for performance
- Exports TypeScript interfaces

#### `env.example`
Example environment configuration:
- MongoDB URI template
- Environment settings
- Documentation for values

#### `SETUP_GUIDE.md`
Comprehensive setup documentation:
- Step-by-step installation guide
- Troubleshooting section
- Architecture diagrams
- Testing procedures

#### `INTEGRATION.md` (this file)
Technical integration documentation

### 3. Modified Files

#### `src/index.ts`
Major changes to use database instead of static data:

**Before:**
```typescript
import { perfumes, getPerfumesByGender, searchPerfumesByName, getPerfumeById } from "./data.js";
```

**After:**
```typescript
import { connectDatabase } from "./config/database.js";
import { Product, type Perfume } from "./models/Product.js";
```

**Tool handlers updated:**
- `list_all_perfumes`: Now queries `Product.find({ status: "active" })`
- `get_perfume_by_id`: Uses `Product.findOne({ id, status: "active" })`
- `search_perfumes`: Implements MongoDB regex search across name/brand/description
- `get_perfumes_by_category`: Complex filtering based on category/gender
- `get_purchase_link`: Database lookup for shopier links

**Server initialization:**
- Added database connection before starting MCP server
- Error handling for database connection failures

#### `README.md`
Updated with:
- Database setup instructions
- Environment configuration details
- Architecture diagrams
- Database integration section
- Updated development instructions

### 4. Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Data Flow                          │
└─────────────────────────────────────────────────────────┘

1. Claude Desktop sends MCP request
         ↓
2. MCP Server receives tool call
         ↓
3. Server queries MongoDB
         ↓
4. MongoDB returns data
         ↓
5. Server formats response
         ↓
6. Claude Desktop receives data
```

## API Reference

### Database Queries

#### List All Perfumes
```javascript
const perfumes = await Product.find({ status: "active" }).lean();
```
- Returns all active products
- Uses `.lean()` for performance (returns plain JS objects)

#### Get Perfume By ID
```javascript
const perfume = await Product.findOne({ id, status: "active" }).lean();
```
- Finds by custom `id` field (not MongoDB `_id`)
- Only returns active products

#### Search Perfumes
```javascript
const results = await Product.find({
  status: "active",
  $or: [
    { name: { $regex: query, $options: "i" } },
    { brand: { $regex: query, $options: "i" } },
    { description: { $regex: query, $options: "i" } },
  ],
}).lean();
```
- Case-insensitive regex search
- Searches across multiple fields
- Returns active products only

#### Get By Category
```javascript
// For men
const results = await Product.find({
  status: "active",
  $or: [
    { gender: "male" },
    { gender: "unisex" },
  ],
}).lean();

// For niche
const results = await Product.find({
  status: "active",
  $or: [
    { category: { $regex: "exclusive", $options: "i" } },
    { category: { $regex: "artisanal", $options: "i" } },
    { category: { $regex: "premium", $options: "i" } },
    { category: "niches" },
  ],
}).lean();
```

## Environment Configuration

### Required Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `MONGODB_URI` | string | Yes | MongoDB connection string |
| `NODE_ENV` | string | No | Environment (development/production) |

### Example Configurations

**Local Development:**
```bash
MONGODB_URI=mongodb://localhost:27017/blueperfumery
NODE_ENV=development
```

**Production (MongoDB Atlas):**
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blueperfumery?retryWrites=true&w=majority
NODE_ENV=production
```

## Schema Mapping

### MCP Server (Perfume Interface)
```typescript
interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  ml?: number;
  originalPrice?: number;
  gender: "male" | "female" | "unisex";
  notes: string[];
  description: string;
  ageRange: { min: number; max: number; };
  characteristics: string[];
  shopierLink?: string;
  category?: string;
  status?: string;
  stock?: number;
  sku?: string;
}
```

### Backend API (IProduct)
```typescript
interface IProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  ml: number;
  gender: "male" | "female" | "unisex";
  category: string;
  status: "active" | "inactive" | "discontinued";
  stock: number;
  sku: string;
  image?: string;
  notes: string[];
  characteristics: string[];
  ageRange: { min: number; max: number; };
  shopierLink?: string;
}
```

**Differences:**
- Backend has required `ml`, `category`, `status`, `stock`, `sku`
- Backend has optional `image` field
- MCP server makes most fields optional for flexibility

## Performance Considerations

### Indexes
The Product schema includes these indexes:
```javascript
productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
```

Benefits:
- Fast text search across name/brand/description
- Efficient category and gender filtering
- Quick price range queries
- Optimized status filtering

### Query Optimization
- Always filter by `status: "active"` to reduce result set
- Use `.lean()` to return plain objects (faster than Mongoose documents)
- Limit fields returned when only specific data needed

## Error Handling

### Connection Errors
```typescript
try {
  await connectDatabase();
} catch (error) {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
}
```

### Query Errors
- Wrapped in try-catch blocks
- Returns appropriate MCP error codes
- Logs errors to stderr for debugging

### Graceful Shutdown
```typescript
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.error("MCP Server: MongoDB connection closed");
  process.exit(0);
});
```

## Testing

### Unit Tests (To Be Added)
- Database connection tests
- Query result validation
- Error handling tests
- Mock data tests

### Integration Tests (To Be Added)
- Full MCP tool execution
- Database interaction
- Response format validation

### Manual Testing
See SETUP_GUIDE.md for manual testing procedures

## Migration Path

### From Static Data to Database

**Phase 1: Preparation**
1. ✅ Add database dependencies
2. ✅ Create database models
3. ✅ Update query logic

**Phase 2: Implementation**
1. ✅ Replace static imports with database queries
2. ✅ Add environment configuration
3. ✅ Update documentation

**Phase 3: Deployment**
1. ⏳ Test with real database
2. ⏳ Deploy to production
3. ⏳ Monitor performance

**Phase 4: Cleanup**
1. ⏳ Remove data.ts file (keep as backup initially)
2. ⏳ Add automated tests
3. ⏳ Optimize queries based on usage

## Backward Compatibility

### Breaking Changes
- ❌ No longer works without MongoDB connection
- ❌ Requires environment configuration
- ❌ Cannot run standalone without database

### Migration Strategy
1. Keep old version as fallback
2. Test extensively before production
3. Document rollback procedure
4. Monitor for issues

## Security

### Database Security
- ✅ Use environment variables for credentials
- ✅ Never commit .env files
- ✅ Use MongoDB authentication
- ✅ Restrict network access (Atlas IP whitelist)
- ✅ Use read-only credentials if possible

### Connection Security
- Use TLS for production connections
- Validate environment variables
- Sanitize query inputs (Mongoose helps prevent injection)

## Monitoring

### What to Monitor
1. Database connection status
2. Query response times
3. Error rates
4. MCP tool usage patterns

### Logging
- Connection events logged to stderr
- Query errors logged with context
- Graceful shutdown messages

## Future Enhancements

### Planned Features
1. **Caching**: Redis cache for frequent queries
2. **Pagination**: Support for large result sets
3. **Aggregations**: Complex queries (price ranges, trending, etc.)
4. **Real-time Updates**: WebSocket for inventory changes
5. **Analytics**: Track MCP tool usage
6. **Recommendations**: AI-powered perfume recommendations

### Performance Improvements
1. Query result caching
2. Connection pooling optimization
3. Index optimization based on usage
4. Lazy loading for large datasets

## Troubleshooting

### Common Issues

**Issue: Connection timeout**
- Check MongoDB is running
- Verify network connectivity
- Check firewall settings
- Validate connection string

**Issue: Slow queries**
- Check indexes are created
- Monitor query patterns
- Use MongoDB profiler
- Consider caching

**Issue: Memory leaks**
- Ensure `.lean()` is used
- Close cursors properly
- Monitor memory usage
- Update Mongoose version

## Support

For technical issues:
1. Check this documentation
2. Review SETUP_GUIDE.md
3. Check GitHub issues
4. Open new issue with logs

## Changelog

### v1.0.0 (Current)
- ✅ Added MongoDB integration
- ✅ Replaced static data with database queries
- ✅ Added environment configuration
- ✅ Updated documentation
- ✅ Created setup guides

### Upcoming
- Add automated tests
- Implement caching
- Add more MCP tools
- Performance optimization

---

**Last Updated**: 2025-11-12
**Maintainer**: Blue Perfumery Development Team

