# Supabase Deployment Guide for PropertyMasters UK

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```
3. **Project Setup**: You should have the Supabase password from `Superbase database passwordPro.txt`

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project details:
   - **Name**: PropertyMasters UK
   - **Database Password**: Use the password from `Superbase database passwordPro.txt`
   - **Region**: Choose closest to your users (e.g., West Europe for UK)
5. Click "Create new project"

## Step 2: Configure Local Development

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in the Supabase dashboard URL)

3. **Initialize Supabase in your project** (if not already done):
   ```bash
   supabase init
   ```

## Step 3: Deploy Database Schema

1. **Apply the initial migration**:
   ```bash
   supabase db push
   ```

2. **Verify the schema** in Supabase Dashboard:
   - Go to Table Editor
   - Check that all tables are created correctly
   - Verify RLS policies are in place

## Step 4: Deploy Edge Functions

1. **Deploy all functions**:
   ```bash
   supabase functions deploy
   ```

2. **Deploy specific function** (if needed):
   ```bash
   supabase functions deploy property-search
   ```

3. **Set environment variables** for Edge Functions:
   ```bash
   supabase secrets set SUPABASE_URL=your-project-url
   supabase secrets set SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 5: Configure Authentication

1. **Go to Authentication > Settings** in Supabase Dashboard
2. **Configure Site URL**:
   - Add your production frontend URL (e.g., `https://your-app.vercel.app`)
   - Add redirect URLs for auth callbacks

3. **Configure Email Templates** (optional):
   - Customize signup confirmation emails
   - Customize password reset emails

4. **Enable Social Providers** (if needed):
   - Google, Facebook, GitHub, etc.
   - Configure OAuth credentials

## Step 6: Set Up Storage (if needed)

1. **Create storage buckets**:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
   INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', true);
   ```

2. **Configure storage policies**:
   ```sql
   -- Allow public read access to property images
   CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
   
   -- Allow authenticated users to upload property images
   CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT WITH CHECK (
     bucket_id = 'property-images' AND auth.role() = 'authenticated'
   );
   ```

## Step 7: Environment Variables for Frontend

Update your Vercel environment variables with Supabase credentials:

```env
VITE_API_URL=https://your-project-ref.supabase.co/rest/v1
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 8: Database Seeding (Optional)

Create sample data for testing:

```bash
# Run seed script if you have one
supabase db seed
```

## Step 9: Monitoring and Analytics

1. **Enable Database Webhooks** (if needed):
   - Go to Database > Webhooks
   - Set up webhooks for important events

2. **Configure Logging**:
   - Monitor Edge Function logs
   - Set up alerts for errors

3. **Performance Monitoring**:
   - Monitor database performance
   - Set up query optimization

## Step 10: Security Checklist

- [ ] RLS policies are enabled on all tables
- [ ] API keys are properly configured
- [ ] CORS settings are correct
- [ ] Authentication is working properly
- [ ] Storage policies are secure
- [ ] Environment variables are set correctly

## Useful Commands

```bash
# Check project status
supabase status

# View function logs
supabase functions logs property-search

# Reset database (CAUTION: This will delete all data)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id YOUR_PROJECT_REF > types/supabase.ts

# Backup database
supabase db dump --file backup.sql
```

## Troubleshooting

### Common Issues:

1. **Migration Errors**:
   - Check SQL syntax in migration files
   - Ensure proper permissions
   - Verify foreign key constraints

2. **RLS Policy Issues**:
   - Test policies with different user roles
   - Check auth.uid() references
   - Verify policy conditions

3. **Edge Function Errors**:
   - Check function logs: `supabase functions logs function-name`
   - Verify environment variables
   - Test CORS configuration

4. **Authentication Issues**:
   - Verify site URL configuration
   - Check redirect URLs
   - Test with different providers

## Production Considerations

1. **Database Backups**:
   - Enable automatic backups
   - Set up point-in-time recovery

2. **Performance Optimization**:
   - Add database indexes for frequently queried columns
   - Optimize RLS policies
   - Monitor query performance

3. **Scaling**:
   - Monitor database usage
   - Consider read replicas for high traffic
   - Optimize Edge Function performance

4. **Security**:
   - Regularly rotate API keys
   - Monitor access logs
   - Keep dependencies updated

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)