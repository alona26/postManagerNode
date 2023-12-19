const express = require('express');
const bodyParser = require('body-parser');

const { getStoredPosts, storePosts } = require('./data/posts');
let lastUsedId = 0; // Initialize lastUsedId globally
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Attach CORS headers
  // Required when using a detached backend (that runs on a different domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/posts', async (req, res) => {
  const storedPosts = await getStoredPosts();

  res.json({ posts: storedPosts });
});

app.get('/posts/:id', async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});
app.post('/posts/:id', async (req, res) => {
  try {
    const existingPosts = await getStoredPosts();
    const postIdToUpdate = req.params.id;
    const postData = req.body;
    // Find the index of the post with the specified ID
    const postIndexToUpdate = await existingPosts.findIndex(post => post.id === postIdToUpdate);
    
    

    if (postIndexToUpdate !== -1) {
      // If the post with the specified ID is found
      existingPosts[postIndexToUpdate].body =  postData.body;
      existingPosts[postIndexToUpdate].author =  postData.author;
      // Update the stored posts with the modified array
      await storePosts(existingPosts);

      res.status(201).json({ message: 'Post updated.' });
    } else {
      res.status(404).json({ message: 'Post not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating post.' });
  }
});

app.post('/posts', async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postData = req.body;
  existingPosts.forEach(post => {
    if (post.id > lastUsedId) {
      lastUsedId = post.id;
    }
    console.log(lastUsedId)
  });
  lastUsedId++;

  // Increment the lastUsedId for the new post
  const newPost = {
    ...postData,
    id: lastUsedId.toString(),
  };

  const updatedPosts = [newPost, ...existingPosts];
  await storePosts(updatedPosts);
  res.status(201).json({ message: 'Stored new post.', post: newPost });
}
);

app.listen(8080);
