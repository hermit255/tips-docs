const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { remark } = require('remark');
const remarkGfm = require('remark-gfm');
const remarkSlug = require('remark-slug');
const remarkBreaks = require('remark-breaks');
const remarkHtml = require('remark-html');

// プロジェクトディレクトリのパス
const projectsDir = path.join(__dirname, '..', 'projects');

// 出力ディレクトリ
const outputDir = path.join(__dirname, '..', 'public', 'api');

// 出力ディレクトリを作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// プロジェクト一覧を取得
function getProjects() {
  return fs.readdirSync(projectsDir).filter(item => {
    const itemPath = path.join(projectsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
}

// ドキュメントファイルを取得
async function getDocFiles(project) {
  const docsDir = path.join(projectsDir, project, 'docs');
  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const files = [];
  const scanDir = (dir, basePath = '') => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath, path.join(basePath, item));
      } else if (item.endsWith('.md')) {
        const relativePath = path.join(basePath, item);
        const fullPath = path.join(dir, item);
        const content = fs.readFileSync(fullPath, 'utf8');
        const { data, content: markdownContent } = matter(content);
        
        // 改行処理を事前に実行
        const preprocessedContent = preprocessMarkdown(markdownContent);
        
        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkSlug)
          .use(remarkBreaks)
          .use(remarkHtml, { sanitize: false })
          .process(preprocessedContent);
        
        const html = processedContent.toString();
        
        files.push({
          path: relativePath,
          slug: encodeURIComponent(relativePath),
          title: data.title || path.basename(item, '.md'),
          content: html,
          frontmatter: data
        });
      }
    }
  };
  
  scanDir(docsDir);
  return files;
}

// 用語ファイルを取得
async function getTermFiles(project) {
  const termsDir = path.join(projectsDir, project, 'terms');
  if (!fs.existsSync(termsDir)) {
    return [];
  }

  const files = [];
  const items = fs.readdirSync(termsDir);
  
  for (const item of items) {
    if (item.endsWith('.md')) {
      const fullPath = path.join(termsDir, item);
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data, content: markdownContent } = matter(content);
      
      // 改行処理を事前に実行
      const preprocessedContent = preprocessMarkdown(markdownContent);
      
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkSlug)
        .use(remarkBreaks)
        .use(remarkHtml, { sanitize: false })
        .process(preprocessedContent);
      
      const html = processedContent.toString();
      
      files.push({
        slug: path.basename(item, '.md'),
        title: data.title || path.basename(item, '.md'),
        content: html,
        frontmatter: data
      });
    }
  }
  
  return files;
}

// 改行処理
function preprocessMarkdown(content) {
  return content.replace(/\n/g, '\n\n');
}

// 静的データを生成
async function generateStaticData() {
  const projects = getProjects();
  
  for (const project of projects) {
    console.log(`Generating data for project: ${project}`);
    
    // ドキュメントデータを生成
    const docs = await getDocFiles(project);
    const docsOutputPath = path.join(outputDir, `${project}-docs.json`);
    fs.writeFileSync(docsOutputPath, JSON.stringify(docs, null, 2));
    
    // 用語データを生成
    const terms = await getTermFiles(project);
    const termsOutputPath = path.join(outputDir, `${project}-terms.json`);
    fs.writeFileSync(termsOutputPath, JSON.stringify(terms, null, 2));
  }
  
  // プロジェクト一覧を生成
  const projectsOutputPath = path.join(outputDir, 'projects.json');
  fs.writeFileSync(projectsOutputPath, JSON.stringify(projects, null, 2));
  
  console.log('Static data generation completed!');
}

// 実行
generateStaticData().catch(console.error);
