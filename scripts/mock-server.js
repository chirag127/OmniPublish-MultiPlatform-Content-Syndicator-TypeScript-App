/**
 * Mock API Server for Testing
 * Simulates all platform endpoints
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock storage
const posts = {};
let postIdCounter = 1;

// Dev.to mock
app.post('/api/articles', (req, res) => {
    const id = postIdCounter++;
    posts[id] = req.body.article;
    res.json({
        id,
        url: `https://dev.to/mock/${id}`,
        ...req.body.article,
    });
});

app.put('/api/articles/:id', (req, res) => {
    const id = req.params.id;
    posts[id] = req.body.article;
    res.json({
        id,
        url: `https://dev.to/mock/${id}`,
        ...req.body.article,
    });
});

// Hashnode mock (GraphQL)
app.post('/graphql', (req, res) => {
    const id = postIdCounter++;
    const mutation = req.body.query;

    if (mutation.includes('publishPost')) {
        res.json({
            data: {
                publishPost: {
                    post: {
                        id: `hashnode-${id}`,
                        slug: `mock-post-${id}`,
                        url: `https://hashnode.mock/post-${id}`,
                    },
                },
            },
        });
    } else if (mutation.includes('updatePost')) {
        res.json({
            data: {
                updatePost: {
                    post: {
                        id: req.body.variables.input.id,
                        slug: `mock-post-${id}`,
                        url: `https://hashnode.mock/post-${id}`,
                    },
                },
            },
        });
    }
});

// Medium mock
app.get('/v1/me', (req, res) => {
    res.json({
        data: {
            id: 'mock-user-123',
            username: 'mockuser',
        },
    });
});

app.post('/v1/users/:userId/posts', (req, res) => {
    const id = postIdCounter++;
    res.json({
        data: {
            id: `medium-${id}`,
            url: `https://medium.com/@mock/post-${id}`,
            ...req.body,
        },
    });
});

// WordPress mock
app.post('/rest/v1.1/sites/:site/posts/new', (req, res) => {
    const id = postIdCounter++;
    res.json({
        ID: id,
        URL: `https://mock.wordpress.com/post-${id}`,
        ...req.body,
    });
});

app.post('/rest/v1.1/sites/:site/posts/:id', (req, res) => {
    res.json({
        ID: req.params.id,
        URL: `https://mock.wordpress.com/post-${req.params.id}`,
        ...req.body,
    });
});

// Blogger mock
app.post('/oauth2/token', (req, res) => {
    res.json({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
    });
});

app.post('/blogger/v3/blogs/:blogId/posts', (req, res) => {
    const id = postIdCounter++;
    res.json({
        id: `blogger-${id}`,
        url: `https://mock.blogspot.com/post-${id}`,
        ...req.body,
    });
});

app.put('/blogger/v3/blogs/:blogId/posts/:id', (req, res) => {
    res.json({
        id: req.params.id,
        url: `https://mock.blogspot.com/post-${req.params.id}`,
        ...req.body,
    });
});

// Tumblr mock
app.post('/v2/blog/:blog/post', (req, res) => {
    const id = postIdCounter++;
    res.json({
        response: {
            id,
        },
    });
});

app.post('/v2/blog/:blog/post/edit', (req, res) => {
    res.json({
        response: {
            id: req.body.id,
        },
    });
});

// Wix mock
app.post('/v3/posts', (req, res) => {
    const id = postIdCounter++;
    res.json({
        post: {
            id: `wix-${id}`,
            slug: `mock-post-${id}`,
            url: `https://mock.wix.com/blog/post-${id}`,
            ...req.body.post,
        },
    });
});

app.patch('/v3/posts/:id', (req, res) => {
    res.json({
        post: {
            id: req.params.id,
            slug: `mock-post-${req.params.id}`,
            url: `https://mock.wix.com/blog/post-${req.params.id}`,
            ...req.body.post,
        },
    });
});

// Write.as mock
app.post('/api/posts', (req, res) => {
    const id = `writeas-${postIdCounter++}`;
    res.json({
        data: {
            id,
            ...req.body,
        },
    });
});

app.post('/api/posts/:id', (req, res) => {
    res.json({
        data: {
            id: req.params.id,
            ...req.body,
        },
    });
});

// Telegraph mock
app.post('/createPage', (req, res) => {
    const id = `telegraph-${postIdCounter++}`;
    res.json({
        ok: true,
        result: {
            path: id,
            url: `https://telegra.ph/${id}`,
            ...req.body,
        },
    });
});

app.post('/editPage/:path', (req, res) => {
    res.json({
        ok: true,
        result: {
            path: req.params.path,
            url: `https://telegra.ph/${req.params.path}`,
            ...req.body,
        },
    });
});

// Micro.blog mock (Micropub)
app.post('/micropub', (req, res) => {
    const id = postIdCounter++;

    if (req.body.action === 'update') {
        res.status(204).send();
    } else {
        res.status(201)
            .header('Location', `https://micro.blog/mock/post-${id}`)
            .send();
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', posts: Object.keys(posts).length });
});

app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
    console.log('Simulating all platform APIs for testing');
});
