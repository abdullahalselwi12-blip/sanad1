import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const SITE_URL = 'https://sanad1-beryl.vercel.app';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('Generating SANAD sitemap...');

  const { data: laws, error: lawsError } = await supabase
    .from('laws')
    .select('id, updated_at')
    .eq('is_published', true);

  if (lawsError) {
    console.error(
      'Failed to load laws:',
      lawsError.message
    );
    process.exit(1);
  }

  console.log(
    `Published laws found: ${(laws || []).length}`
  );

  const urls = [
    {
      loc: `${SITE_URL}/`,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      loc: `${SITE_URL}/laws`,
      changefreq: 'weekly',
      priority: '0.95',
    },
    {
      loc: `${SITE_URL}/assistant`,
      changefreq: 'weekly',
      priority: '0.90',
    },
    {
      loc: `${SITE_URL}/lawyers`,
      changefreq: 'monthly',
      priority: '0.80',
    },
    {
      loc: `${SITE_URL}/documents`,
      changefreq: 'monthly',
      priority: '0.75',
    },
    {
      loc: `${SITE_URL}/consultations`,
      changefreq: 'weekly',
      priority: '0.75',
    },
  ];

  for (const law of laws || []) {
    urls.push({
      loc: `${SITE_URL}/laws/${law.id}`,
      lastmod: law.updated_at
        ? new Date(law.updated_at).toISOString()
        : undefined,
      changefreq: 'monthly',
      priority: '0.85',
    });
  }

  const lawIds = (laws || []).map(
    (law) => law.id
  );

  if (lawIds.length > 0) {
    const { data: articles, error: articlesError } =
      await supabase
        .from('law_articles')
        .select(
          'law_id, article_number, updated_at'
        )
        .in('law_id', lawIds);

    if (articlesError) {
      console.error(
        'Failed to load law articles:',
        articlesError.message
      );
      process.exit(1);
    }

    console.log(
      `Law articles found: ${(articles || []).length}`
    );

    for (const article of articles || []) {
      urls.push({
        loc:
          `${SITE_URL}/laws/${article.law_id}/article/` +
          encodeURIComponent(
            article.article_number
          ),
        lastmod: article.updated_at
          ? new Date(
              article.updated_at
            ).toISOString()
          : undefined,
        changefreq: 'yearly',
        priority: '0.80',
      });
    }
  }

  const xmlUrls = urls
    .map((url) => {
      const lastmod = url.lastmod
        ? `\n    <lastmod>${escapeXml(
            url.lastmod
          )}</lastmod>`
        : '';

      return `  <url>
    <loc>${escapeXml(url.loc)}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`;

  const publicDir = path.resolve('public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, {
      recursive: true,
    });
  }

  const sitemapPath = path.join(
    publicDir,
    'sitemap.xml'
  );

  fs.writeFileSync(
    sitemapPath,
    sitemap,
    {
      encoding: 'utf8',
    }
  );

  console.log(
    `Sitemap generated: ${sitemapPath}`
  );

  console.log(
    `Total sitemap URLs: ${urls.length}`
  );
}

generateSitemap().catch((error) => {
  console.error(
    'Sitemap generation failed:',
    error
  );

  process.exit(1);
});