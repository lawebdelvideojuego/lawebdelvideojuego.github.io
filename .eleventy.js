module.exports = function(eleventyConfig) {
  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("original");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Date formatting filter (Spanish)
  eleventyConfig.addFilter("formatDate", (date) => {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('es-ES', options);
  });

  // Short date for feed items
  eleventyConfig.addFilter("shortDate", (date) => {
    const d = new Date(date);
    const options = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString('es-ES', options);
  });

  // ISO date for datetime attributes
  eleventyConfig.addFilter("isoDate", (date) => {
    return new Date(date).toISOString();
  });

  // Excerpt filter - gets content before <!--more--> or first 200 chars
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex > -1) {
      return content.substring(0, moreIndex).trim();
    }
    // Strip HTML and limit to 200 chars
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  });

  // Truncate text
  eleventyConfig.addFilter("truncate", (text, length = 280) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + '...' : text;
  });

  // Head filter - get first N items from array
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // Sort by date (newest first)
  eleventyConfig.addFilter("sortByDate", (array) => {
    if (!Array.isArray(array)) return [];
    return [...array].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  });

  // Fix image paths (from /assets/images to /images)
  eleventyConfig.addTransform("fixImagePaths", function(content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return content.replace(/\/assets\/images\//g, '/images/');
    }
    return content;
  });

  // Collection: all posts sorted by date
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // Collection: articles only
  eleventyConfig.addCollection("articulos", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md")
      .filter(item => item.data.categories === "articulos")
      .sort((a, b) => b.date - a.date);
  });

  // Collection: reviews only
  eleventyConfig.addCollection("analisis", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md")
      .filter(item => item.data.categories === "analisis")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
