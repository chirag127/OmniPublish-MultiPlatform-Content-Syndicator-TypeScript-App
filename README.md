# Omni-Publisher Content Ecosystem

A complete, batteries-included multi-platform content publishing system with static site generation, automated workflows, and 50 SEO-optimized blog posts ready to publish.

## 🚀 Features

-   **Multi-Platform Publishing**: Automatically publish to 8 platforms (Dev.to, Hashnode, Medium, WordPress, Ghost, Blogger, Tumblr, Wix)
-   **Idempotency**: Track published posts and update existing content instead of duplicating
-   **Static Site Generator**: Beautiful, responsive blog built from markdown
-   **GitHub Actions**: Automated publishing and deployment workflows
-   **Issue-to-Post**: Community contributions via GitHub Issues
-   **Mock Mode**: Test publishing without hitting real APIs
-   **Robust Error Handling**: Graceful failures, retries with exponential backoff
-   **50 Original Posts**: SEO-optimized content on credit cards, fintech, tech, and more

## 📋 Prerequisites

-   Node.js 18+ (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
-   npm or yarn
-   Git

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd omni-publisher-content-ecosystem
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API credentials (see [Platform Credentials](#platform-credentials) below).

### 3. Test with Mock Mode

Start the mock server and test publishing:

```bash
# Terminal 1: Start mock server
npm run mock-server

# Terminal 2: Test publishing
npm run publish -- --mock --dry-run
```

### 4. Build the Static Site

```bash
npm run build
```

Open `public/index.html` in your browser to view the generated site.

### 5. Publish for Real

Once you've configured your credentials:

```bash
npm run publish
```

## 🔑 Platform Credentials

### Dev.to

1. Go to [Dev.to Settings → Extensions](https://dev.to/settings/extensions)
2. Generate an API key
3. Add to `.env.local`: `DEVTO_API_KEY=your_key_here`

### Hashnode

1. Go to [Hashnode Settings → Developer](https://hashnode.com/settings/developer)
2. Generate a Personal Access Token
3. Add to `.env.local`: `HASHNODE_TOKEN=your_token_here`

### Medium

1. Go to [Medium Settings → Security](https://medium.com/me/settings/security)
2. Generate an Integration Token
3. Add to `.env.local`: `MEDIUM_INTEGRATION_TOKEN=your_token_here`

### WordPress.com

1. Follow [WordPress OAuth2 documentation](https://developer.wordpress.com/docs/oauth2/)
2. Obtain an access token
3. Add to `.env.local`:
    ```
    WP_ACCESS_TOKEN=your_token_here
    WP_SITE=yoursite.wordpress.com
    ```

### Ghost

1. Go to your Ghost Admin → Integrations → Add custom integration
2. Copy the Admin API Key and API URL
3. Add to `.env.local`:
    ```
    GHOST_ADMIN_API_KEY=your_key_here
    GHOST_ADMIN_URL=https://yourblog.ghost.io
    ```

### Blogger

1. Follow [Google Blogger API documentation](https://developers.google.com/blogger/docs/3.0/using)
2. Set up OAuth 2.0 and obtain a token
3. Get your Blog ID from Blogger settings
4. Add to `.env.local`:
    ```
    BLOGGER_OAUTH_TOKEN=your_token_here
    BLOGGER_BLOG_ID=your_blog_id
    ```

### Tumblr

1. Go to [Tumblr OAuth Apps](https://www.tumblr.com/oauth/apps)
2. Register a new application
3. Obtain OAuth 1.0a credentials
4. Add to `.env.local`:
    ```
    TUMBLR_CONSUMER_KEY=your_key
    TUMBLR_CONSUMER_SECRET=your_secret
    TUMBLR_TOKEN=your_token
    TUMBLR_TOKEN_SECRET=your_token_secret
    TUMBLR_BLOG_IDENTIFIER=yourblog.tumblr.com
    ```

### Wix

1. Follow [Wix Headless Blog API documentation](https://dev.wix.com/api/rest/wix-blog/blog/introduction)
2. Generate an API token
3. Get your Site ID
4. Add to `.env.local`:
    ```
    WIX_API_TOKEN=your_token
    WIX_SITE_ID=your_site_id
    ```

## 📝 CLI Usage

### Publishing

```bash
# Publish all posts to all configured platforms
npm run publish

# Dry run (simulate without making API calls or updating state)
npm run publish -- --dry-run

# Mock mode (use mock server instead of real APIs)
npm run publish -- --mock

# Combine flags
npm run publish -- --mock --dry-run

# Set concurrency limit
npm run publish -- --concurrency=5
```

### Building the Site

```bash
# Build static site
npm run build:site

# Or build everything (TypeScript + site)
npm run build
```

## 🤖 GitHub Actions

### Setup GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions, and add:

-   `DEVTO_API_KEY`
-   `HASHNODE_TOKEN`
-   `MEDIUM_INTEGRATION_TOKEN`
-   `WP_ACCESS_TOKEN`
-   `WP_SITE`
-   `GHOST_ADMIN_API_KEY`
-   `GHOST_ADMIN_URL`
-   `BLOGGER_OAUTH_TOKEN`
-   `BLOGGER_BLOG_ID`
-   `TUMBLR_CONSUMER_KEY`
-   `TUMBLR_CONSUMER_SECRET`
-   `TUMBLR_TOKEN`
-   `TUMBLR_TOKEN_SECRET`
-   `TUMBLR_BLOG_IDENTIFIER`
-   `WIX_API_TOKEN`
-   `WIX_SITE_ID`

### Workflows

1. **Deploy Site** (`.github/workflows/deploy-site.yml`)

    - Triggers on push to `main`
    - Builds and deploys static site to GitHub Pages
    - Enable GitHub Pages in repository settings

2. **Publish Sync** (`.github/workflows/publish-sync.yml`)

    - Triggers daily at 9 AM UTC (configurable)
    - Manual trigger via Actions tab
    - Publishes all posts and commits updated `.postmap.json`

3. **Issue to Post** (`.github/workflows/issue-to-post.yml`)
    - Triggers when issue is labeled "publish"
    - Converts issue to markdown post
    - Trusted users (in `config/allowlist.json`) → published immediately
    - Others → saved to `content/posts/drafts/` for moderation

### Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Save

## 📂 Project Structure

```
.
├── .github/workflows/       # GitHub Actions workflows
├── content/posts/           # 50 markdown blog posts
├── src/
│   ├── adapters/            # Platform-specific publishing adapters
│   ├── utils/               # Utilities (logger, markdown parser, state)
│   ├── build-site.ts        # Static site generator
│   └── publish.ts           # Main publisher CLI
├── public/                  # Generated static site
│   ├── assets/styles.css    # Responsive CSS
│   ├── posts/               # Generated post pages
│   └── index.html           # Generated index
├── scripts/mock-server.js   # Mock API server for testing
├── .postmap.json            # Publishing state (idempotency)
├── .env.example             # Environment template
└── package.json
```

## 🧪 Testing

```bash
# Run full test (starts mock server, runs publisher)
npm test

# Manual testing with mock server
npm run mock-server  # Terminal 1
npm run publish -- --mock --dry-run  # Terminal 2
```

## 🔧 Troubleshooting

### 401/403 Errors

-   **Check credentials**: Ensure all tokens are valid and not expired
-   **Check permissions**: Some platforms require specific scopes/permissions
-   **Rate limits**: Wait and retry, or reduce `PUBLISH_CONCURRENCY`

### Missing Platform

If a platform is skipped:

-   Check the logs for WARNING messages
-   Verify all required environment variables are set
-   Test credentials with platform's API documentation

### Posts Not Updating

-   Check `.postmap.json` for existing mappings
-   Some platforms (like Medium) don't support updates via API
-   Delete entry from `.postmap.json` to force recreation

### Build Errors

```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

## 🔒 Security & Moderation

-   **Never commit `.env.local`** or expose API keys
-   **Use GitHub Secrets** for Actions workflows
-   **Allowlist trusted contributors** in `config/allowlist.json`
-   **Review drafts** in `content/posts/drafts/` before publishing
-   **Logs never contain** plain secret values

## 📊 Monitoring

-   Check GitHub Actions logs for publishing results
-   Review `.postmap.json` for published post tracking
-   JSON-lines logs include timestamps, levels, platforms, and metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add posts to `content/posts/` or `content/posts/drafts/`
4. Submit a pull request

Or submit via GitHub Issues with the "publish" label!

## 📄 License

MIT

## 🙏 Acknowledgments

Built with TypeScript, Node.js, and love for content creators everywhere.
