# Trading Bot Waitlist System

A complete waitlist system with frontend form and backend management.

## Development Setup

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   node server.js
   ```
   Backend will run on port 3000.

2. **Start the Frontend:**
   - Use VS Code Live Server or any static server on port 8000
   - Or serve the root directory on port 8000

3. **Local Testing:**
   - Desktop: Open `http://localhost:8000`
   - Mobile: Open `http://YOUR_COMPUTER_IP:8000` (same network required)

## Production Setup

### 1. GitHub Repository Setup

1. **Initialize Git and Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Configure Git to Ignore Sensitive Files:**
   - Ensure `.gitignore` includes:
     ```
     # Environment files
     .env.*
     !.env.example
     js/config.js
     ```
   - Keep `js/config.template.js` in the repository

### 2. DigitalOcean Droplet Setup

1. **Initial Server Setup:**
   ```bash
   # SSH into your droplet
   ssh root@your-droplet-ip

   # Update system packages
   apt update && apt upgrade -y

   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs

   # Install PM2 globally
   npm install -g pm2

   # Install nginx
   apt install -y nginx

   # Install certbot for SSL
   apt install -y certbot python3-certbot-nginx
   ```

2. **Clone and Setup Application:**
   ```bash
   # Create application directory
   mkdir -p /var/www
   cd /var/www

   # Clone your repository
   git clone your-github-repo-url waitlist-app
   cd waitlist-app

   # Setup backend
   cd server
   npm install
   cp .env.example .env.production
   ```

3. **Configure Environment:**
   ```bash
   # Edit production environment file
   nano .env.production
   ```
   Update the following values:
   ```env
   NODE_ENV=production
   CORS_ALLOWED_ORIGIN=your-frontend-domain
   API_KEY=generate-secure-key-here
   SERVER_URL=https://your-domain-or-ip
   ```

4. **Setup Frontend Configuration:**
   ```bash
   # Create production config
   cd ../js
   cp config.template.js config.js
   nano config.js
   ```
   Update with your production values:
   ```javascript
   window.CONFIG = {
       SERVER_URL: 'https://your-domain-or-ip'
   };
   ```

### 3. Nginx Configuration

1. **Create Nginx Configuration:**
   ```bash
   nano /etc/nginx/sites-available/waitlist
   ```
   Add the following configuration:
   ```nginx
   # Frontend configuration
   server {
       listen 80;
       server_name your-frontend-domain;
       root /var/www/waitlist-app;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }

   # Backend configuration
   server {
       listen 80;
       server_name api.your-domain;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Enable the Configuration:**
   ```bash
   ln -s /etc/nginx/sites-available/waitlist /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

3. **Setup SSL with Let's Encrypt:**
   ```bash
   certbot --nginx -d your-frontend-domain -d api.your-domain
   ```

### 4. Start Application

1. **Start Backend with PM2:**
   ```bash
   cd /var/www/waitlist-app/server
   pm2 start server.js --name waitlist-api
   pm2 save
   pm2 startup
   ```

2. **Monitor Application:**
   ```bash
   pm2 status
   pm2 logs waitlist-api
   ```

### 5. Security Setup

1. **Setup Firewall:**
   ```bash
   # Allow only necessary ports
   ufw allow ssh
   ufw allow 'Nginx Full'
   ufw enable
   ```

2. **Regular Updates:**
   ```bash
   # Create update script
   nano /root/update.sh
   ```
   Add the following:
   ```bash
   #!/bin/bash
   apt update
   apt upgrade -y
   npm audit fix
   ```
   Make it executable:
   ```bash
   chmod +x /root/update.sh
   ```

### 6. Backup Setup

1. **Configure Automatic Backups:**
   ```bash
   # Create backup directory
   mkdir -p /var/www/waitlist-app/server/backups

   # Set correct permissions
   chown -R www-data:www-data /var/www/waitlist-app/server/backups
   ```

2. **Setup Daily Database Backup:**
   ```bash
   crontab -e
   ```
   Add:
   ```
   0 0 * * * cd /var/www/waitlist-app/server && node manage-waitlist.js prod export
   ```

## Environment Files

1. **Development (.env.development):**
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ALLOWED_ORIGIN=*
   API_KEY=dev_key_123
   ```

2. **Production (.env.production):**
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # Rate Limiting
   RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
   MAX_REQUESTS_PER_WINDOW=5  # Strict limit for production

   # Database Configuration
   DB_NAME=waitlist.db
   BACKUP_RETENTION_DAYS=7

   # Security
   CORS_ALLOWED_ORIGIN=https://your-frontend-domain.com  # ⚠️ Update this with your actual frontend domain!
   API_KEY=generate_a_secure_key_here  # ⚠️ Generate a secure key (at least 32 characters)

   # Backup Configuration
   BACKUP_DIRECTORY=backups
   EXPORT_DIRECTORY=exports
   MAX_EXPORT_BACKUPS=5

   # ⚠️ Important Production Setup Steps:
   # 1. Update CORS_ALLOWED_ORIGIN with your actual frontend domain
   # 2. Generate a secure API key (use a password generator)
   # 3. Ensure all directories have proper write permissions
   # 4. Set up SSL certificate for your domain
   # 5. Configure firewall to allow only port 3000 
   ```

## Database Management

The system uses separate databases for development and production:

- Development: `server/dev_data/waitlist_dev.db`
- Production: `server/prod_data/waitlist.db`

**Management Commands:**
```bash
# View entries (development)
node manage-waitlist.js dev view

# View entries (production)
node manage-waitlist.js prod view

# Export to Excel
node manage-waitlist.js dev export  # Development
node manage-waitlist.js prod export # Production

# Delete entry
node manage-waitlist.js dev delete-email user@example.com
node manage-waitlist.js prod delete-email user@example.com
```

## Security Features

1. **Rate Limiting:**
   - Development: Disabled
   - Production: 5 requests per minute per IP

2. **CORS Protection:**
   - Development: Allows all local IPs
   - Production: Only allows specified domain

3. **API Key Protection:**
   - Development: Not enforced
   - Production: Required for admin endpoints

## Monitoring

1. **Health Check:**
   ```bash
   curl https://your-api-domain.com/health
   ```

2. **Statistics:**
   ```bash
   curl -H "x-api-key: your_api_key" https://your-api-domain.com/api/stats
   ```

## Backup System

- Automatic daily backups in `server/backups/`
- Keeps last 7 days in production
- Export to Excel available via management script

## Troubleshooting

1. **CORS Errors:**
   - Check `CORS_ALLOWED_ORIGIN` in `.env.production`
   - Verify frontend domain matches exactly

2. **Connection Issues:**
   - Verify firewall settings (port 3000)
   - Check SSL certificate validity
   - Verify API URL in frontend code

3. **Database Issues:**
   - Check write permissions in data directories
   - Verify backup directory exists
   - Check available disk space

## Support

For detailed management instructions, see `WAITLIST-MANAGEMENT.md`