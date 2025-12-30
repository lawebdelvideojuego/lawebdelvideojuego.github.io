/**
 * Bluesky Data Fetcher
 * Fetches posts from a Bluesky account and filters by gaming-related keywords.
 *
 * Configuration:
 * - BLUESKY_HANDLE: The Bluesky handle to fetch posts from
 * - GAMING_KEYWORDS: Keywords to filter gaming-related posts
 * - MAX_POSTS: Maximum number of posts to fetch (across all pages)
 * - INCLUDE_ALL: Set to true to include all posts (ignores keyword filter)
 */

const BLUESKY_HANDLE = "jbilbo.bsky.social";

// Keywords to identify gaming-related posts (case-insensitive)
// Edit this list to customize which posts appear on your blog
const GAMING_KEYWORDS = [
  // Platforms
  "nintendo", "switch", "playstation", "ps5", "ps4", "xbox", "steam", "pc gaming",
  "game pass", "stadia", "dreamcast", "3ds", "vita",
  // General gaming terms (Spanish)
  "videojuego", "videojuegos", "juego", "juegos", "gaming", "gamer",
  "consola", "consolas", "partida", "jugando", "platino",
  // General gaming terms (English)
  "game", "games", "playing", "gameplay", "playthrough",
  // Game-related
  "zelda", "mario", "pokemon", "smash", "metroid", "kirby",
  "final fantasy", "ffvii", "ffxvi", "resident evil", "metal gear", "kojima",
  "souls", "elden ring", "fromsoftware", "dark souls", "bloodborne",
  "god of war", "horizon", "spider-man", "uncharted", "last of us",
  "halo", "forza", "gears", "starfield",
  "indie", "roguelike", "metroidvania", "rpg", "jrpg",
  // Events
  "e3", "direct", "state of play", "game awards", "tga",
  // Actions
  "analisis", "review", "trailer", "dlc", "update", "parche"
];

// Set to true to include ALL posts (useful for testing/reviewing your content)
const INCLUDE_ALL = false;

// Maximum posts to fetch (will paginate if needed)
const MAX_POSTS = 200;

/**
 * Check if a post text contains any gaming-related keywords
 */
function isGamingRelated(text) {
  if (INCLUDE_ALL) return true;
  if (!text) return false;

  const lowerText = text.toLowerCase();
  return GAMING_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Fetch posts from Bluesky API with pagination
 */
async function fetchBlueskyPosts() {
  const posts = [];
  let cursor = null;
  let totalFetched = 0;

  try {
    // First, resolve the handle to a DID
    const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${BLUESKY_HANDLE}`;
    const resolveResponse = await fetch(resolveUrl);

    if (!resolveResponse.ok) {
      console.warn(`Bluesky: Could not resolve handle ${BLUESKY_HANDLE}`);
      return [];
    }

    const { did } = await resolveResponse.json();

    // Fetch posts with pagination
    while (totalFetched < MAX_POSTS) {
      const limit = Math.min(100, MAX_POSTS - totalFetched);
      let feedUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${did}&limit=${limit}&filter=posts_no_replies`;

      if (cursor) {
        feedUrl += `&cursor=${cursor}`;
      }

      const feedResponse = await fetch(feedUrl);

      if (!feedResponse.ok) {
        console.warn(`Bluesky: Error fetching feed: ${feedResponse.status}`);
        break;
      }

      const data = await feedResponse.json();

      if (!data.feed || data.feed.length === 0) {
        break;
      }

      for (const item of data.feed) {
        const post = item.post;
        const record = post.record;

        // Skip reposts
        if (item.reason) continue;

        // Skip replies (additional check)
        if (record.reply) continue;

        const text = record.text || "";

        // Filter by gaming keywords
        if (!isGamingRelated(text)) continue;

        // Extract post URI parts for URL construction
        const uriParts = post.uri.split("/");
        const postId = uriParts[uriParts.length - 1];

        // Extract embed data
        let embed = null;
        if (record.embed) {
          const embedType = record.embed.$type;

          // External link (YouTube, articles, etc.)
          if (embedType === "app.bsky.embed.external" && record.embed.external) {
            const ext = record.embed.external;
            embed = {
              type: "external",
              uri: ext.uri,
              title: ext.title,
              description: ext.description,
              thumb: ext.thumb?.ref?.$link
                ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${ext.thumb.ref.$link}@jpeg`
                : null
            };
          }

          // Images
          if (embedType === "app.bsky.embed.images" && record.embed.images) {
            embed = {
              type: "images",
              images: record.embed.images.map(img => ({
                alt: img.alt || "",
                thumb: img.image?.ref?.$link
                  ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${img.image.ref.$link}@jpeg`
                  : null,
                fullsize: img.image?.ref?.$link
                  ? `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${img.image.ref.$link}@jpeg`
                  : null
              }))
            };
          }

          // Video
          if (embedType === "app.bsky.embed.video" && record.embed.video) {
            embed = {
              type: "video",
              thumb: record.embed.video.ref?.$link
                ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${record.embed.video.ref.$link}@jpeg`
                : null
            };
          }
        }

        posts.push({
          type: "bluesky",
          text: text,
          date: new Date(record.createdAt),
          url: `https://bsky.app/profile/${BLUESKY_HANDLE}/post/${postId}`,
          uri: post.uri,
          likes: post.likeCount || 0,
          reposts: post.repostCount || 0,
          embed: embed
        });
      }

      totalFetched += data.feed.length;
      cursor = data.cursor;

      // No more pages
      if (!cursor) break;
    }

    console.log(`Bluesky: Fetched ${posts.length} gaming-related posts out of ${totalFetched} total`);

  } catch (error) {
    console.warn(`Bluesky: Error fetching posts: ${error.message}`);
    return [];
  }

  // Sort by date descending
  return posts.sort((a, b) => b.date - a.date);
}

module.exports = async function() {
  // During development, you can return an empty array to skip API calls
  // return [];

  return await fetchBlueskyPosts();
};
