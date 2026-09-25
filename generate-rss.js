const fs = require('fs');
const path = require('path');

// ⚠️ CHANGE THIS to your actual Netlify domain URL
const SITE_URL = 'https://rumpai.netlify.app'; 

const postsPath = path.join(__dirname, 'content', 'posts.json');
const outputPath = path.join(__dirname, 'feed.xml');

if (!fs.existsSync(postsPath)) {
  console.error('Error: content/posts.json not found!');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const itemsXml = posts.map(post => {
  const titleEn = typeof post.title === 'object' ? post.title.en : post.title;
  const excerptEn = typeof post.excerpt === 'object' ? post.excerpt.en : post.excerpt;
  const catEn = typeof post.category === 'object' ? post.category.en : post.category;
  const imgUrl = post.imageUrl || post.image || '';

  return `
    <item>
      <title>${escapeXml(titleEn)}</title>
      <link>${SITE_URL}/#article-${post.id}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <description>${escapeXml(excerptEn)}</description>
      <category>${escapeXml(catEn)}</category>
      ${imgUrl ? `<enclosure url="${escapeXml(imgUrl)}" type="image/jpeg" />` : ''}
    </item>`;
}).join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Rumpai Field Notes</title>
    <link>${SITE_URL}</link>
    <description>Bilingual Field Notes, Ecology, and Wildlife Conservation</description>
    <language>en</language>
    ${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(outputPath, rssXml.trim());
console.log('Successfully generated feed.xml');
