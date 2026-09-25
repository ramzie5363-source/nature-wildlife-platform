const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rumpai.netlify.app'; 

// Look for posts.json in ./content/posts.json or ./posts.json
let postsPath = path.join(__dirname, 'content', 'posts.json');
if (!fs.existsSync(postsPath)) {
  postsPath = path.join(__dirname, 'posts.json');
}

if (!fs.existsSync(postsPath)) {
  console.error('Could not find posts.json! Creating fallback feed.xml...');
  const fallbackXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Rumpai Field Notes</title>
    <link>${SITE_URL}</link>
    <description>Bilingual Field Notes</description>
  </channel>
</rss>`;
  fs.writeFileSync(path.join(__dirname, 'feed.xml'), fallbackXml);
  process.exit(0);
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

fs.writeFileSync(path.join(__dirname, 'feed.xml'), rssXml.trim());
console.log('Successfully generated feed.xml');
