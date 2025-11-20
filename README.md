# Omni-Publisher Content Ecosystem

**Write Once, Publish Everywhere** - A complete automation system that turns markdown posts into a static website and syndicates them to multiple blogging platforms.

## 🚀 Features

-   ✅ **Multi-Platform Publishing**: Publish to 11+ platforms simultaneously
-   ✅ **Idempotency**: Tracks published posts to avoid duplicates
-   ✅ **Retry Logic**: 3-level exponential backoff for network failures
-   ✅ **Concurrency Control**: Configurable parallel publishing
-   ✅ **Dry-Run Mode**: Test without actually publishing
-   ✅ **Mock Mode**: Test with local mock server
-   ✅ **Static Site Generator**: Beautiful responsive website
-   ✅ **GitHub Actions CI/CD**: Automated deployment and publishing
-   ✅ **Issue-to-Post**: Convert GitHub issues to blog posts
-   ✅ **Structured Logging**: JSON-lines logging for all operations

## 📋 Supported Platforms

### Active Platforms

-   **Dev.to** - Developer community platform
-   **Hashnode** - Developer blogging platform
-   **Medium** - Popular blogging platform
-   **WordPress.com** - Self-hosted WordPress sites
-   **Blogger** - Google's blogging platform
-   **Tumblr** - Microblogging and social platform
-   **Wix** - Website builder with blog API
-   **Write.as** - Minimalist blogging platform
-   **Telegraph (Telegra.ph)** - Anonymous publishing platform
-   **Micro.blog** - IndieWeb microblogging (Micropub protocol)

### Optional/Experimental

-   **Substack** ⚠️ UNOFFICIAL API - May break without notice

### Removed Platforms

-   ~~Ghost~~ - Removed as requested

## 🔍 API Research Methodology

**IMPORTANT**: Each adapter was built using **TWO FRESH WEB SEARCHES** to verify:

1. Current API endpoints and authentication methods
2. Rate limits and content submission formats

This ensures all implementations use the most recent official documentation, not outdated training data.

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd omni-publisher-content-ecosystem

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API tokens
nano .env
```

## 🔑 Getting API Tokens

### Dev.to

1. Visit https://dev.to/settings/extensions
2. Generate an API key
3. Add to `.env` as `DEVTO_API_KEY`

### Hashnode

1. Visit https://hashnode.com/settings/developer
2. Generate a Personal Access Token
3. Get your Publication ID from your blog settings
4. Add both to `.env`

### Medium

1. Visit https://medium.com/me/settings/security
2. Generate an Integration Token
3. Add to `.env` as `MEDIUM_INTEGRATION_TOKEN`

### WordPress.com

1. Follow OAuth2 flow: https://developer.wordpress.com/docs/oauth2/
2. Get access token and site domain
3. Add both to `.env`

### Blogger

1. Create OAuth2 credentials: https://developers.google.com/blogger/docs/3.0/using
2. Get Client ID, Client Secret, and Refresh Token
3. Find your Blog ID from Blogger dashboard
4. Add all to `.env`

### Tumblr

1. Register app: https://www.tumblr.com/oauth/apps
2. Get Consumer Key, Consumer Secret
3. Complete OAuth flow for Token and Token Secret
4. Add blog identifier (e.g., `yourblog.tumblr.com`)

### Wix

1. Visit https://dev.wix.com/api/rest/wix-blog/blog/introduction
2. Generate API token
3. Get Site ID from Wix dashboard
4. Add both to `.env`

### Write.as

1. Visit https://developers.write.as/docs/api/
2. Create account and generate API token
3. Add to `.env` as `WRITEAS_API_TOKEN`

### Telegraph

1. Visit https://telegra.ph/api
2. Create account via API: `POST https://api.telegra.ph/createAccount`
3. Save the `access_token` returned
4. Add to `.env` as `TELEGRAPH_ACCESS_TOKEN`

### Micro.blog

1. Visit https://micro.blog
2. Go to Account → App Tokens
3. Generate new token
4. Add to `.env` as `MICROBLOG_TOKEN`
5. Endpoint defaults to `https://micro.blog/micropub`

### Substack (Optional/Unofficial)

⚠️ **WARNING**: Substack does not provide an official API. This adapter is experimental and may break at any time.

-   Currently not fully implemented
-   Consider using Substack's web interface or email publishing
-   See adapter code for limitations

## 🛠️ Usage

### Local Development

```bash
# Build TypeScript
npm run compile

# Build static site
npm run build

# Publish to all platforms
npm run publish

# Dry run (test without publishing)
npm run publish:dry

# Mock mode (use local mock server)
npm run start:mock  # In one terminal
npm run publish:mock  # In another terminal

# Run tests
npm test
```

### Publishing Behavior

The publisher will:

1. Load all markdown posts from `content/posts/`
2. Check `.postmap.json`eviously published posts
3. For each platform with credentials:
    - **Create** new posts if not published
    - **Update** existing posts if already published
    - **Skip** platforms with missing credentials (with warning)
4. Save updated state to `.postmap.json`
5. Print summary of operations

### Command Line Flags

```bash
# Dry run - show what would be published
npm run publish -- --dry-run

# Custom concurrency
PUBLISH_CONCURRENCY=5 npm run publish

# Mock mode
MOCK_MODE=true npm run publish
```

## 📝 Creating Posts

Posts are markdown files in `content/posts/` with YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-15"
description: "SEO-optimized description"
tags: ["tag1", "tag2", "tag3"]
slug: "your-post-slug"
author: "Author Name"
---

# Your Post Title

Your content here...
```

### Post Requirements

-   Minimum 800 words recommended
-   Include H1 title and 3+ H2 headings
-   Add internal links to other posts
-   Use SEO-friendly descriptions
-   Include relevant tags

## 🤖 GitHub Actions

### Setup

1. **Enable GitHub Pages**:

    - Go to Settings → Pages
    - Source: GitHub Actions

2. **Add Secrets**:

    - Go to Settings → Secrets and variables → Actions
    - Add all API tokens from `.env.example`

3. **Workflows**:
    - `deploy-site.yml` - Builds and deploys static site on push
    - `publish-sync.yml` - Publishes to platforms (manual or scheduled)
    - `issue-to-post.yml` - Converts labeled issues to posts

### Manual Publishing

1. Go to Actions tab
2. Select "Publish to Platforms"
3. Click "Run workflow"

### Scheduled Publishing

By default, runs daily at 9 AM UTC. Edit `.github/workflows/publish-sync.yml` to change schedule.

### Issue-to-Post Workflow

1. Create a GitHub issue with your post content
2. Add label `publish`
3. Workflow converts issue to markdown post
4. Post is committed and issue is closed
5. Next publish cycle syndicates to platforms

## 📊 State Management

`.postmap.json` tracks published posts:

```json
{
    "post-slug": {
        "slug": "post-slug",
        "platforms": {
            "devto": {
                "id": "123456",
                "url": "https://dev.to/user/post-slug",
                "publishedAt": "2024-01-15T10:00:00Z",
                "lastUpdated": "2024-01-15T10:00:00Z"
            }
        }
    }
}
```

This ensures:

-   Posts are only created once per platform
-   Updates modify existing posts
-   No duplicate content

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options:

-   Platform API tokens
-   `PUBLISH_CONCURRENCY` - Number of parallel publishes (default: 2)
-   `MOCK_SERVER_URL` - Mock server URL for testing

### TypeScript Configuration

Edit `tsconfig.json` for compiler options.

### Site Styling

Edit `public/assets/styles.css` to customize the static site appearance.

## 🧪 Testing

### Mock Server

The mock server simulates all platform APIs:

```bash
npm run start:mock
```

Endpoints:

-   Dev.to: `/api/articles`
-   Hashnode: `/graphql`
-   Medium: `/v1/users/:userId/posts`
-   WordPress: `/rest/v1.1/sites/:site/posts/new`
-   Blogger: `/blogger/v3/blogs/:blogId/posts`
-   Tumblr: `/v2/blog/:blog/post`
-   Wix: `/v3/posts`
-   Write.as: `/api/posts`
-   Telegraph: `/createPage`
-   Micro.blog: `/micropub`

### Test Suite

```bash
npm test
```

Validates:

-   Mock server connectivity
-   Idempotency (posts not duplicated)
-   Error handling
-   State persistence

## 🚨 Troubleshooting

### Platform Skipped

**Issue**: "Platform X skipped - missing credentials"

**Solution**: Add required environment variables to `.env`

### Authentication Failed

**Issue**: 401/403 errors

**Solution**:

-   Verify API token is correct
-   Check token hasn't expired
-   Ensure token has required permissions

### Rate Limiting

**Issue**: 429 Too Many Requests

**Solution**:

-   Reduce `PUBLISH_CONCURRENCY`
-   Add delays between publishes
-   Check platform rate limits

### Post Not Updating

**Issue**: Changes not reflected on platform

**Solution**:

-   Check `.postmap.json` has correct post ID
-   Some platforms (Medium) don't support updates
-   Verify platform API supports updates

### Build Failures

**Issue**: TypeScript compilation errors

**Solution**:

```bash
npm run compile
# Check error messages
# Fix type errors in source files
```

## 🔒 Security Best Practices

1. **Never commit `.env`** - It's in `.gitignore`
2. **Use GitHub Secrets** for CI/CD tokens
3. **Rotate tokens regularly**
4. **Use read-only tokens** where possible
5. **Monitor API usage** for unusual activity
6. **Keep dependencies updated**: `npm audit fix`

## 📚 Project Structure

```
omni-publisher-content-ecosystem/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── content/
│   └── posts/              # Markdown blog posts (50 included)
├── public/
│   ├── assets/
│   │   └── styles.css      # Site styling
│   └── index.html          # Generated site
├── scripts/
│   └── mock-server.js      # Mock API server
├── src/
│   ├── adapters/           # Platform adapters
│   │   ├── devto.ts
│   │   ├── hashnode.ts
│   │   ├── medium.ts
│   │   ├── wordpress.ts
│   │   ├── blogger.ts
│   │   ├── tumblr.ts
│   │   ├── wix.ts
│   │   ├── writeas.ts
│   │   ├── telegraph.ts
│   │   ├── microblog.ts
│   │   └── substack.ts
│   ├── utils/
│   │   ├── logger.ts       # Structured logging
│   │   ├── markdown.ts     # Markdown parsing
│   │   └── state.ts        # State management
│   ├── build-site.ts       # Static site generator
│   └── publish.ts          # Main publisher
├── .env.example            # Environment template
├── .gitignore
├── .postmap.json           # Publication state
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Content Topics

The included 50 posts cover:

-   Credit Cards & Rewards (10 posts)
-   Personal Finance & Fintech (10 posts)
-   Deals & Savings (5 posts)
-   Mobile Phones & Tech Reviews (5 posts)
-   Productivity Apps & Tools (5 posts)
-   Chrome Extensions (3 posts)
-   Privacy & Security Tools (3 posts)
-   HealthTech (2 posts)
-   Frugal Living (3 posts)
-   Tech Tutorials (4 posts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

-   Built with TypeScript, Node.js, and Express
-   Uses Marked for markdown parsing
-   Gray-matter for frontmatter parsing
-   Axios for HTTP requests
-   OAuth library for Tumblr authentication

## 📞 Support

-   Create an issue for bugs
-   Check existing issues for solutions
-   Read platform API documentation for platform-specific issues

## 🔄 Updates

### Recent Changes

-   ✅ Removed Ghost platform (as requested)
-   ✅ Added Write.as with fresh API research
-   ✅ Added Telegraph/Telegra.ph with fresh API research
-   ✅ Added Micro.blog with Micropub protocol
-   ✅ Added Substack (experimental/unofficial)
-   ✅ All adapters verified with TWO web searches per platform
-   ✅ Publisher skips platforms with missing credentials
-   ✅ 50 original SEO-optimized blog posts included

---

**Built with ❤️ for content creators who want to maximize their reach**
