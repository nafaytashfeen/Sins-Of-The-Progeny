const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function processStory() {
  const storyPath = path.join(__dirname, '../public/story.docx');
  const outputPath = path.join(__dirname, '../app/data/story.json');
  
  if (!fs.existsSync(storyPath)) {
    console.error('❌ story.docx not found in public/ folder');
    process.exit(1);
  }
  
  // Convert docx to HTML with custom style mappings
  const result = await mammoth.convertToHtml({ 
    path: storyPath,
    styleMap: [
      "p[style-name='Horizontal Line'] => hr" // Map horizontal line style
    ]
  });
  let html = result.value;
  
  // Cut off everything after "END OF FILE"
  const endMarker = 'END OF FILE';
  const endIndex = html.indexOf(endMarker);
  
  if (endIndex !== -1) {
    html = html.substring(0, endIndex);
    console.log('✅ Content truncated at "END OF FILE"');
  } else {
    console.log('⚠️  "END OF FILE" marker not found - including all content');
  }
  
  // Split into chapters based on headings
  const chapters = parseChapters(html);
  
  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const storyData = {
    title: 'Lightbearer',
    chapters: chapters,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(storyData, null, 2));
  console.log(`✅ Processed ${chapters.length} chapters`);
  
  // Debug: show what chapters were found
  console.log('\nChapters found:');
  chapters.forEach(ch => {
    console.log(`  ${ch.id}. ${ch.title}`);
  });
}

function cleanTitle(title) {
  // Remove Google Docs anchor tags like <a id="_h1xm7c2shh2u"></a>
  return title.replace(/<a[^>]*><\/a>/g, '').trim();
}

function parseChapters(html) {
  // Find all h1 and h2 tags with their positions
  const chapterRegex = /<h[12][^>]*>(.*?)<\/h[12]>/gi;
  const matches = [];
  let match;
  
  while ((match = chapterRegex.exec(html)) !== null) {
    matches.push({
      title: cleanTitle(match[1]),
      index: match.index,
      fullMatch: match[0]
    });
  }
  
  console.log(`Found ${matches.length} chapter headings`);
  
  const chapters = [];
  
  // If no headings found, treat entire content as one chapter
  if (matches.length === 0) {
    chapters.push({
      id: 1,
      title: 'Chapter 1',
      content: html.trim()
    });
    return chapters;
  }
  
  // Process each heading and its content
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    // Extract content between this heading and the next (or end of document)
    const startIndex = currentMatch.index + currentMatch.fullMatch.length;
    const endIndex = nextMatch ? nextMatch.index : html.length;
    const content = html.substring(startIndex, endIndex).trim();
    
    if (content) {
      chapters.push({
        id: chapters.length + 1,
        title: currentMatch.title,
        content: content
      });
    }
  }
  
  return chapters;
}

processStory();