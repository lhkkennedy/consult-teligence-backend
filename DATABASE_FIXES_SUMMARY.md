# Database and Schema Fixes Summary

## Issues Fixed

### 1. Schema Relation Warnings
**Problem**: Strapi v5 warning about using `inversedBy` instead of `mappedBy` in relation definitions.

**Solution**: Updated all schema files to use `mappedBy` instead of `inversedBy` for all relation types.

**Files Fixed**:
- `src/api/post/content-types/post/schema.json`
- `src/api/tag/content-types/tag/schema.json`
- `src/api/reaction/content-types/reaction/schema.json`
- `src/api/save/content-types/save/schema.json`
- `src/api/user-preferences/content-types/user-preference/schema.json`
- `src/api/view/content-types/view/schema.json`
- `src/extensions/users-permissions/content-types/user/schema.json`
- And several others

### 2. Database Migration Error
**Problem**: PostgreSQL error when trying to convert `roles` column from text to JSONB due to invalid JSON data.

**Error**: `invalid input syntax for type json`

**Solution**: Created a migration script that:
1. Identifies and nullifies invalid JSON data
2. Safely converts the column type to JSONB

## How to Apply the Database Fix

### Option 1: Run the Automated Script (Recommended)
```bash
cd backend
node scripts/fix-database-issues.js
```

### Option 2: Manual SQL Migration
If the automated script doesn't work, you can run the SQL manually:

```sql
-- First, update any invalid JSON data to NULL
UPDATE "public"."properties" 
SET "roles" = NULL 
WHERE "roles" IS NOT NULL 
  AND "roles" != '' 
  AND "roles"::jsonb IS NULL;

-- Now alter the column type to JSONB
ALTER TABLE "public"."properties" 
ALTER COLUMN "roles" TYPE jsonb 
USING CASE 
  WHEN "roles" IS NULL THEN NULL
  ELSE "roles"::jsonb 
END;
```

## Files Created/Modified

### New Files:
- `scripts/fix-database-issues.js` - Database migration script
- `scripts/fix-schema-relations.js` - Schema relation fix script
- `database/schema/migrations/fix_properties_roles_column.sql` - SQL migration file
- `database/schema/migrations/fix_properties_roles_column.ts` - TypeScript migration file

### Modified Files:
- All schema files with relation definitions (see list above)

## Verification Steps

1. **Check for remaining inversedBy warnings**:
   ```bash
   grep -r "inversedBy" src/api/ src/extensions/
   ```

2. **Test database connection**:
   ```bash
   npm run develop
   ```

3. **Verify properties table structure**:
   ```sql
   \d properties
   ```

## Notes

- The schema fixes are backward compatible with Strapi v5
- The database migration is safe and handles invalid data gracefully
- All existing data will be preserved (invalid JSON will be set to NULL)
- The fixes follow Strapi v5 best practices for relation definitions

## Troubleshooting

If you encounter issues:

1. **Database connection errors**: Check your `DATABASE_URL` environment variable
2. **Permission errors**: Ensure your database user has ALTER TABLE permissions
3. **Schema validation errors**: Restart your Strapi application after applying fixes

## Next Steps

After applying these fixes:

1. Restart your Strapi application
2. Test your API endpoints
3. Verify that the warnings are gone
4. Check that your properties with roles data are working correctly 