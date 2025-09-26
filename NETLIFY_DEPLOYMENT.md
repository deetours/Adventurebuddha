# Netlify Deployment Guide

## Prerequisites
1. Netlify account
2. Backend API deployed and accessible
3. Environment variables configured

## Deployment Steps

### 1. Connect Repository
- Go to Netlify dashboard
- Click "New site from Git"
- Connect your GitHub repository
- Select the main branch

### 2. Build Settings
The `netlify.toml` file handles build configuration:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

### 3. Environment Variables
Set these in Netlify dashboard (Site settings > Environment variables):

```
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_WS_BASE_URL=wss://your-backend-api.com/ws
VITE_RAZORPAY_KEY=rzp_live_your_key_here
VITE_USE_MOCK_API=false
```

Optional Firebase variables (if using Google Auth):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Deploy
- Netlify will auto-deploy on git push
- Check build logs for any errors
- Test the deployed site

## Troubleshooting

### White Screen Issues
1. Check browser console for JavaScript errors
2. Verify environment variables are set correctly
3. Ensure backend API is accessible
4. Check that `_redirects` file is in `public/` directory

### API Connection Issues
1. Verify `VITE_API_BASE_URL` points to correct backend
2. Check CORS settings on backend
3. Ensure backend is deployed and running

### Authentication Issues
1. Firebase config variables must be set for Google login
2. Backend must support authentication endpoints
3. Check that JWT tokens are properly configured

## Post-Deployment Checklist
- [ ] Site loads without white screen
- [ ] API calls work (check Network tab)
- [ ] Authentication flows work
- [ ] Payment integration functions
- [ ] All routes are accessible
- [ ] Mobile responsiveness works
- [ ] No console errors in production