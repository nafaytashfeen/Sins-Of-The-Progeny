import storyData from '@/app/data/story.json';
import styles from '@/app/styles/reader.module.css';

export default async function StoryPage({ params }) {
  const resolvedParams = await params;
  const secretPath = 'a8f3k9m2p5q7r1s4'; // Change this!
  
  if (resolvedParams['secret-path'] !== secretPath) {
    return <div>Page not found</div>;
  }
  
  return (
    <div className={styles.container}>
      {/* Sidebar with Table of Contents */}
      <aside className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>{storyData.title}</h1>
        <p className={styles.lastUpdated}>
          Last updated: {new Date(storyData.lastUpdated).toLocaleDateString()}
        </p>
        
        <nav>
          <h2 className={styles.tocTitle}>Chapters</h2>
          <ul className={styles.tocList}>
            {storyData.chapters.map((chapter) => (
              <li key={chapter.id} className={styles.tocItem}>
                <a href={`#chapter-${chapter.id}`} className={styles.tocLink}>
                  {chapter.id > 0 ? `${chapter.id}. ` : ''}{chapter.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main content area */}
      <main className={styles.mainContent}>
        {storyData.chapters.map((chapter) => (
          <section 
            key={chapter.id} 
            id={`chapter-${chapter.id}`}
            className={styles.chapter}
          >
            {chapter.id > 0 && (
              <h2 className={styles.chapterTitle}>
                Chapter {chapter.id}: {chapter.title}
              </h2>
            )}
            {chapter.id === 0 && (
              <h2 className={styles.chapterTitle}>{chapter.title}</h2>
            )}
            <div 
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          </section>
        ))}
      </main>
    </div>
  );
}