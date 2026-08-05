/**
 * llms.txt 自動生成(postbuild で実行)
 * 全公開記事を読み、AI検索エンジン向けサイト案内(llms.txt)を dist/ と public/ に出力する。
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://okinawa-drive-blog.example.com'; // TODO: ドメイン確定後に差し替え
const BLOG_DIR = 'src/content/blog';

const clusterLabels = {
  'airport-basics': '那覇空港・借り方の基礎',
  pricing: '料金・比較',
  'model-course': 'モデルコース',
  trouble: '事故・トラブル対応',
  trend: '最新トレンド',
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*["']?(.*?)["']?\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

const posts = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = parseFrontmatter(readFileSync(join(BLOG_DIR, f), 'utf8'));
    return {
      slug: f.replace(/\.md$/, ''),
      title: fm.title ?? f,
      description: fm.description ?? '',
      cluster: fm.cluster ?? 'trend',
      draft: fm.draft === 'true',
    };
  })
  .filter((p) => !p.draft);

const byCluster = {};
for (const p of posts) (byCluster[p.cluster] ??= []).push(p);

let out = `# 沖縄ドライブ観光ラボ

> 沖縄でレンタカー会社を実際に運営する現役事業者が、稼働データ・料金実績・事故対応の現場経験という一次情報に基づいて、沖縄旅行×レンタカーの疑問に答える専門メディア。

- 運営: 沖縄・豊見城エリアのレンタカー事業者(中古車販売・事故対応も運営)
- 言語: 日本語
- 連絡先: サイトのお問い合わせページ参照

`;

for (const [cluster, list] of Object.entries(byCluster)) {
  out += `## ${clusterLabels[cluster] ?? cluster}\n\n`;
  for (const p of list) {
    out += `- [${p.title}](${SITE_URL}/blog/${p.slug}/): ${p.description}\n`;
  }
  out += '\n';
}

writeFileSync('public/llms.txt', out);
if (existsSync('dist')) writeFileSync('dist/llms.txt', out);
console.log(`llms.txt updated (${posts.length} posts)`);
