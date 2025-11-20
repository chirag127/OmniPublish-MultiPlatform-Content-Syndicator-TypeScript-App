/**
 * Mock server for testing platform adapters
 * Simulates API responses from all platforms
 */

const express = require('express');
const app = express();
const PORT = process.env.MOCK_SERVER_URL?.split(':').pop() || 3333;

app.use(express.json());

// Helper to generate mock response
function mockSuccess(platform, id) {
    return {
        id: `mock-${platform}-${id}`,
        url: `https://mock-${platform}.com/post/${id}`,
        status: 'published',
        createdAt: new Date().toISOString()
    };
}

// Dev.to endpoints
app.post('/devto/articles', (req, res) => {
    console.log('[MOCK] Dev.to create article');
    res.json({
        id: Math.floor(Math.random() * 100000),
        url: `https://dev.to/mock/article-${Date.now()}`,
        title: req.body.article.title
    });
});

app.put('/devto/articles/:id', (req, res) => {
    console.log(`[MOCK] Dev.to update article ${req.params.id}`);
    res.json({
        id: req.params.id,
        url: `https://dev.to/mock/article-${req.params.id}`,
        title: req.body.article.title
    });
});

// Hashnode endpoints
app.post('/hashnode', (req, res) => {
    console.log('[MOCK] Hashnode GraphQL request');
    const isUpdate = req.body.query.includes('updateStory');
    res.json({
        data: {
            [isUpdate ? 'updateStory' : 'createPublicationStory']: {
                post: {
                    _id: `mock-hashnode-${Date.now()}`,
                    cuid: `cuid-${Date.now()}`,
                    slug: 'mock-post-slug'
                }
            }
        }
    });
});

// Medium endpoints
app.get('/medium/me', (req, res) => {
    console.log('[MOCK] Medium get user');
    res.json({
        data: {
            id: 'mock-user-id',
            username: 'mockuser'
        }
    });
});

app.post('/medium/users/:userId/posts', (req, res) => {
    console.log(`[MOCK] Medium create post for user ${req.params.userId}`);
    res.json({
        data: {
            id: `mock-medium-${Date.now()}`,
            url: `https://medium.com/@mockuser/mock-post-${Date.now()}`,
            title: req.body.title
        }
    });
});

// WordPress endpoints
app.post('/wordpress/sites/:site/posts/new', (req, res) => {
    console.log(`[MOCK] WordPress create post on ${req.params.site}`);
    res.json({
        ID: Math.floor(Math.random() * 100000),
        URL: `https://${req.params.site}/mock-post-${Date.now()}`,
        title: req.body.title
    });
});

app.post('/wordpress/sites/:site/posts/:id', (req, res) => {
    console.log(`[MOCK] WordPress update post ${req.params.id}`);
    res.json({
        ID: req.params.id,
        URL: `https://${req.params.site}/mock-post-${req.params.id}`,
        title: req.body.title
    });
});

// Ghost endpoints
app.post('/ghost/ghost/api/admin/posts/', (req, res) => {
    console.log('[MOCK] Ghost create post');
    res.json({
        posts: [{
            id: `mock-ghost-${Date.now()}`,
            url: `https://mock-ghost.io/mock-post-${Date.now()}`,
            title: req.body.posts[0].title
        }]
    });
});

app.put('/ghost/ghost/api/admin/posts/:id/', (req, res) => {
    console.log(`[MOCK] Ghost update post ${req.params.id}`);
    res.json({
        posts: [{
            id: req.params.id,
            url: `https://mock-ghost.io/mock-post-${req.params.id}`,
            title: req.body.posts[0].title
        }]
    });
});

// Blogger endpoints
app.post('/blogger/blogs/:blogId/posts', (req, res) => {
    console.log(`[MOCK] Blogger create post on blog ${req.params.blogId}`);
    res.json({
        id: `mock-blogger-${Date.now()}`,
        url: `https://mock-blogger.blogspot.com/${Date.now()}/post.html`,
        title: req.body.title
    });
});

app.put('/blogger/blogs/:blogId/posts/:postId', (req, res) => {
    console.log(`[MOCK] Blogger update post ${req.params.postId}`);
    res.json({
        id: req.params.postId,
        url: `https://mock-blogger.blogspot.com/${req.params.postId}/post.html`,
        title: req.body.title
    });
});

// Tumblr endpoints
app.post('/tumblr/blog/:blogId/post', (req, res) => {
    console.log(`[MOCK] Tumblr create post on ${req.params.blogId}`);
    res.json({
        response: {
            id: Math.floor(Math.random() * 1000000000),
            title: req.body.title
        }
    });
});

app.post('/tumblr/blog/:blogId/post/edit', (req, res) => {
    console.log(`[MOCK] Tumblr update post ${req.body.id}`);
    res.json({
        response: {
            id: req.body.id,
            title: req.body.title
        }
    });
});

// Wix endpoints
app.post('/wix/posts', (req, res) => {
    console.log('[MOCK] Wix create post');
    res.json({
        post: {
            id: `mock-wix-${Date.now()}`,
            slug: 'mock-post-slug',
            url: `https://www.wix.com/blog/mock-post-${Date.now()}`,
            title: req.body.post.title
        }
    });
});

app.patch('/wix/posts/:id', (req, res) => {
    console.log(`[MOCK] Wix update post ${req.params.id}`);
    res.json({
        post: {
            id: req.params.id,
            slug: 'mock-post-slug',
            url: `https://www.wix.com/blog/mock-post-${req.params.id}`,
            title: req.body.post.title
        }
    });
});

// Write.as endpoints
app.post('/writeas/posts', (req, res) => {
    console.log('[MOCK] Write.as create post');
    res.json({
        data: {
            id: `mock-writeas-${Date.now()}`,
            slug: `mock-slug-${Date.now()}`,
            title: req.body.title
        }
    });
});

app.post('/writeas/posts/:id', (req, res) => {
    console.log(`[MOCK] Write.as update post ${req.params.id}`);
    res.json({
        data: {
            id: req.params.id,
            slug: `mock-slug-${req.params.id}`,
            title: req.body.title
        }
    });
});

// Telegraph endpoints
app.post('/telegraph/createAccount', (req, res) => {
    console.log('[MOCK] Telegraph create account');
    res.json({
        ok: true,
        result: {
            access_token: `mock-telegraph-token-${Date.now()}`,
            short_name: req.body.short_name
        }
    });
});

app.post('/telegraph/createPage', (req, res) => {
    console.log('[MOCK] Telegraph create page');
    res.json({
        ok: true,
        result: {
            path: `mock-page-${Date.now()}`,
            url: `https://telegra.ph/mock-page-${Date.now()}`,
            title: req.body.title
        }
    });
});

app.post('/telegraph/editPage/:path', (req, res) => {
    console.log(`[MOCK] Telegraph edit page ${req.params.path}`);
    res.json({
        ok: true,
        result: {
            path: req.params.path,
            url: `https://telegra.ph/${req.params.path}`,
            title: req.body.title
        }
    });
});

// Micro.blog (Micropub) endpoints
app.post('/micropub', (req, res) => {
    console.log('[MOCK] Micro.blog Micropub request');
    const postUrl = `https://mock.micro.blog/post-${Date.now()}`;
    res.setHeader('Location', postUrl);
    res.status(201).json({
        url: postUrl
    });
});

// Error simulation endpoint
app.post('/error', (req, res) => {
    res.status(500).json({ error: 'Simulated error' });
});

app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
    console.log('Ready to simulate platform API responses');
});
