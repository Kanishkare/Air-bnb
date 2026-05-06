# Deployment Fix for Listings Not Showing

## Completed Tasks
- [x] Updated `app.js` to require MONGO_URL environment variable and disable mongoose buffering for serverless environments
- [x] Updated `init/index.js` to use MONGO_URL environment variable instead of hardcoded local URL

## Remaining Tasks
- [ ] Set MONGO_URL environment variable in Vercel deployment settings
- [ ] Run the init script in deployment to populate sample data (if needed)
- [ ] Test the deployment to ensure listings are showing properly
