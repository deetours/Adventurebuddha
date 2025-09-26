import { Button } from '../components/ui/button';
import { useChainPrompting } from '../hooks/useChainPrompting';
import { ReadingProgress } from '../components/blog/ReadingProgress';
import { EnhancedBlogCard } from '../components/blog/EnhancedBlogCard';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  image: string;
  readTime?: number;
  views?: number;
  likes?: number;
}

export default function BlogPage() {
  const { results } = useChainPrompting();
  
  // Chain prompting enhanced content
  const enhancedFeaturedTitle = results.featured_title || "Top 10 Trekking Destinations in India";
  const enhancedFeaturedExcerpt = results.featured_excerpt || "Discover the most breathtaking trekking trails across the Indian subcontinent that offer stunning views and unforgettable experiences.";
  const enhancedFeaturedAuthor = results.featured_author || "Adventure Buddha Team";
  const enhancedFeaturedTags = (results.featured_tags as string[]) || ["trekking", "adventure", "india"];

  // Mock blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: enhancedFeaturedTitle as string,
      excerpt: enhancedFeaturedExcerpt as string,
      content: '',
      author: enhancedFeaturedAuthor as string,
      date: '2024-05-15',
      tags: enhancedFeaturedTags as string[],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 8,
      views: 1250,
      likes: 45,
    },
    {
      id: '2',
      title: 'Essential Gear for Your Next Adventure',
      excerpt: 'Packing the right gear can make or break your adventure. Here\'s our comprehensive guide to essential equipment for every traveler.',
      content: '',
      author: 'Akshay TR',
      date: '2024-05-10',
      tags: ['gear', 'packing', 'tips'],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 6,
      views: 890,
      likes: 32,
    },
    {
      id: '3',
      title: 'Sustainable Travel: How to Minimize Your Impact',
      excerpt: 'Traveling responsibly is more important than ever. Learn how you can reduce your environmental footprint while exploring the world.',
      content: '',
      author: 'Priya Sharma',
      date: '2024-05-05',
      tags: ['sustainability', 'eco-friendly', 'responsible travel'],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 7,
      views: 675,
      likes: 28,
    },
    {
      id: '4',
      title: 'Cultural Etiquette: Respecting Local Traditions',
      excerpt: 'Understanding and respecting local customs is crucial for meaningful cultural exchanges. Here\'s what you need to know.',
      content: '',
      author: 'Adventure Buddha Team',
      date: '2024-04-28',
      tags: ['culture', 'etiquette', 'travel tips'],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 5,
      views: 543,
      likes: 19,
    },
    {
      id: '5',
      title: 'Solo Travel: A Guide for First-Timers',
      excerpt: 'Thinking of traveling alone? Here\'s everything you need to know to make your first solo adventure safe and memorable.',
      content: '',
      author: 'Ananya Patel',
      date: '2024-04-20',
      tags: ['solo travel', 'safety', 'tips'],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 9,
      views: 721,
      likes: 41,
    },
    {
      id: '6',
      title: 'Winter Adventures: Embracing the Cold',
      excerpt: 'Don\'t let the cold stop you from exploring. Discover the best winter destinations and how to prepare for them.',
      content: '',
      author: 'Vikram Singh',
      date: '2024-04-15',
      tags: ['winter', 'cold weather', 'adventure'],
      image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
      readTime: 6,
      views: 398,
      likes: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ReadingProgress />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Adventure Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stories, tips, and inspiration from our adventures around the world
          </p>
        </div>

        {/* Featured Post */}
        <EnhancedBlogCard post={blogPosts[0]} featured={true} />

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post, index) => (
            <EnhancedBlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
}