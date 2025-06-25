# Deployment Guide for Jubayr Learning Center Website

## Deploy to Netlify

### Prerequisites
1. A Netlify account (free at netlify.com)
2. Your Stripe API keys
3. Git repository (optional but recommended)

### Step 1: Prepare Your Environment Variables

You'll need to set up your Stripe environment variables in Netlify:

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended for first deployment)

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" > "Deploy manually"
3. Drag and drop your entire website folder
4. Wait for the deployment to complete
5. Your site will be available at a URL like: `https://random-name.netlify.app`

#### Option B: Deploy via Git (Recommended for ongoing updates)

1. Push your code to GitHub, GitLab, or Bitbucket
2. In Netlify, click "Add new site" > "Import an existing project"
3. Connect your Git provider and select your repository
4. Set build settings:
   - Build command: `npm install`
   - Publish directory: `.`
5. Add your environment variables (see Step 1)
6. Deploy!

### Step 3: Configure Custom Domain (Optional)

1. In your Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

### Step 4: Test Your Deployment

1. Visit your deployed site
2. Test the donation functionality
3. Check that both one-time and monthly donations work
4. Verify that payments appear in your Stripe dashboard

## Local Development

To test locally with the new Netlify functions setup:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Start the local development server:
   ```bash
   netlify dev
   ```

3. Your site will be available at `http://localhost:8888`

## Troubleshooting

### Common Issues

1. **Environment variables not working**: Make sure you've added them in Netlify's environment variables section
2. **CORS errors**: The functions include CORS headers, but if you're still having issues, check the function logs in Netlify
3. **Stripe errors**: Verify your Stripe keys are correct and in the right environment (test vs live)

### Checking Function Logs

1. In your Netlify dashboard, go to Functions
2. Click on a function to see its logs
3. Check for any errors in the function execution

## Security Notes

- Never commit your `.env` file to version control
- Use test keys for development and live keys only for production
- Consider setting up webhook endpoints for payment confirmation

## Support

If you encounter issues:
1. Check the Netlify function logs
2. Verify your Stripe dashboard for payment status
3. Test with Stripe's test card numbers first 