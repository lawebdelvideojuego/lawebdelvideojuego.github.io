/**
 * Unified Feed Helper
 * Provides utilities for merging blog posts and Bluesky posts.
 */

module.exports = {
  /**
   * Merge articles and Bluesky posts, sorted by date
   * @param {Array} posts - Blog posts from collections.posts
   * @param {Array} blueskyPosts - Posts from bluesky.js data file
   * @returns {Array} Merged and sorted feed items
   */
  merge: function(posts, blueskyPosts) {
    const items = [];

    // Add blog posts
    for (const post of posts || []) {
      items.push({
        type: "article",
        title: post.data.title,
        date: post.date,
        url: post.url,
        excerpt: post.templateContent,
        categories: post.data.categories,
        data: post.data,
        post: post
      });
    }

    // Add Bluesky posts
    for (const bsky of blueskyPosts || []) {
      items.push({
        type: "bluesky",
        text: bsky.text,
        date: new Date(bsky.date),
        url: bsky.url,
        likes: bsky.likes,
        reposts: bsky.reposts,
        item: bsky
      });
    }

    // Sort by date descending
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};
