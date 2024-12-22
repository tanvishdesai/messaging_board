import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Path to the JSON file storing posts
const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Read the posts from the JSON file
      const data = fs.readFileSync(postsFilePath, 'utf8');
      
      // Parse JSON data, fallback to empty array if parsing fails
      let posts: string[] = [];
      try {
        posts = JSON.parse(data || '[]');
      } catch (parseError) {
        console.error('Failed to parse posts.json:', parseError);
        posts = []; // Return empty array if parsing fails
      }
      
      // Log data for debugging purposes
      console.log('Posts fetched:', posts);

      // Return the posts array
      res.status(200).json(posts);

    } catch (error) {
      console.error('Error reading posts:', error);
      res.status(500).json({ error: 'Error reading posts' });
    }
  } else if (req.method === 'POST') {
    const { content } = req.body as { content: string };
    
    // Validate input
    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
      // Read current posts from file
      const data = fs.readFileSync(postsFilePath, 'utf8');
      let posts: string[] = [];
      
      try {
        posts = JSON.parse(data || '[]');
      } catch (parseError) {
        console.error('Failed to parse posts.json:', parseError);
        posts = []; // Initialize to empty array on error
      }

      // Add the new post to the array
      posts.push(content);

      // Write the updated posts back to the JSON file
      fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));

      // Return a success message
      res.status(201).json({ message: 'Post added' });
    } catch (error) {
      console.error('Error saving post:', error);
      res.status(500).json({ error: 'Error saving post' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
}
