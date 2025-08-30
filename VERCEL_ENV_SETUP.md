# Vercel Environment Variables Setup Guide

## Required Environment Variables for PropertyMasters UK Frontend

After deploying to Vercel, you need to configure the following environment variables in your Vercel dashboard:

### 1. API Configuration
```
VITE_API_URL=https://your-supabase-project.supabase.co/rest/v1
VITE_API_TIMEOUT=10000
```

### 2. Authentication
```
VITE_JWT_STORAGE_KEY=propertymastersuk_token
```

### 3. Map Services (Required for property mapping)
```
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

### 4. File Upload Configuration
```
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,video/mp4
```

### 5. Feature Flags
```
VITE_ENABLE_VR_FEATURES=true
VITE_ENABLE_VIDEO_TOURS=true
VITE_ENABLE_CHAT=true
```

### 6. Analytics (Optional)
```
VITE_GOOGLE_ANALYTICS_ID=your-ga-tracking-id
VITE_HOTJAR_ID=your-hotjar-id
```

### 7. Social Media Integration (Optional)
```
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_TWITTER_API_KEY=your-twitter-api-key
```

### 8. Payment Processing
```
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your PropertyMasters UK project
3. Navigate to Settings → Environment Variables
4. Add each variable with its corresponding value
5. Make sure to set the environment to "Production"
6. Redeploy your application after adding all variables

## Important Notes

- Replace all placeholder values with your actual API keys and configuration
- The `VITE_API_URL` should point to your Supabase project URL
- Ensure all API keys are valid and have proper permissions
- Test the deployment after setting all environment variables

## Security Considerations

- Never commit actual API keys to your repository
- Use Vercel's environment variables feature for all sensitive data
- Regularly rotate API keys for security
- Monitor usage of third-party services to detect any unauthorized access