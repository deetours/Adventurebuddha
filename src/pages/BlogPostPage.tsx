import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Tag, ArrowLeft, Share2, Heart } from 'lucide-react';

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();

  // Mock blog post data
  const blogPost = {
    id: id || '1',
    title: 'Top 10 Trekking Destinations in India',
    content: `
      <p>India is a land of diverse landscapes, from the snow-capped peaks of the Himalayas to the tropical backwaters of Kerala. For adventure enthusiasts, trekking in India offers some of the most breathtaking experiences in the world. Here are our top 10 trekking destinations that should be on every adventurer's bucket list.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Valley of Flowers Trek, Uttarakhand</h2>
      <p>The Valley of Flowers National Park is a UNESCO World Heritage Site renowned for its meadows of endemic alpine flowers and the variety of flora. This trek offers a surreal experience with vibrant blooms during the monsoon season from July to August.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Roopkund Trek, Uttarakhand</h2>
      <p>Known as the "Mystery Lake," Roopkund Trek takes you to a high-altitude glacial lake that melts during the monsoon season to reveal hundreds of ancient human skeletons. The trek offers stunning views of the Himalayas and is best done from May to June.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Hampta Pass Trek, Himachal Pradesh</h2>
      <p>This moderate-level trek offers a diverse landscape, from lush green meadows to barren icy terrains. The trek connects the valleys of Kullu and Lahaul-Spiti and provides spectacular views of the Pir Panjal and Dhauladhar ranges.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Chadar Trek, Ladakh</h2>
      <p>Experience the magic of walking on a frozen river! The Chadar Trek on the Zanskar River is one of the most challenging treks in India, best experienced in January-February when the river is completely frozen.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">5. Everest Base Camp Trek, Nepal (via India)</h2>
      <p>While technically in Nepal, this trek is often accessed through India. Standing at the base of the world's highest peak is a dream come true for many trekkers. The journey offers stunning views of the Himalayas and a glimpse into Sherpa culture.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Markha Valley Trek, Ladakh</h2>
      <p>This trek takes you through ancient Buddhist villages, monasteries, and high mountain passes. The best time to undertake this trek is from June to September when the weather is favorable.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Brahmatal Trek, Uttarakhand</h2>
      <p>Known for its beautiful lakes and stunning views of the Himalayas, the Brahmatal Trek is perfect for beginners. The trek offers a chance to see the frozen lake of Brahmatal and is best done during winter months.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">8. Kedarkantha Trek, Uttarakhand</h2>
      <p>This relatively easy trek offers panoramic views of the Himalayas, including Swargarohini, Bandarpunch, and Kedarnath peaks. The trek is popular for its snow-covered trails during winter.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">9. Pin Parvati Trek, Himachal Pradesh</h2>
      <p>Considered one of the most challenging treks in India, the Pin Parvati Trek offers diverse landscapes from lush green valleys to high mountain passes. This trek requires proper preparation and is best attempted by experienced trekkers.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">10. Goecha La Trek, Sikkim</h2>
      <p>This trek offers close-up views of Mount Kanchenjunga, the third highest peak in the world. The trek passes through rhododendron forests and Buddhist monasteries, offering a perfect blend of natural beauty and cultural experience.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Essential Tips for Trekking in India</h2>
      <ul class="list-disc pl-6 space-y-2 mt-4">
        <li>Always trek with a guide or experienced group</li>
        <li>Carry appropriate gear for the season and terrain</li>
        <li>Obtain necessary permits for restricted areas</li>
        <li>Respect local culture and environment</li>
        <li>Stay hydrated and carry sufficient water</li>
        <li>Check weather conditions before starting your trek</li>
      </ul>

      <p className="mt-6">Whether you're a beginner or an experienced trekker, India offers a trek for every level of adventurer. Each trek provides a unique experience, from cultural immersion to natural beauty that will leave you with memories to cherish for a lifetime.</p>
    `,
    author: 'Adventure Buddha Team',
    date: '2024-05-15',
    tags: ['trekking', 'adventure', 'india'],
    image: 'https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Blog Post */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          <img 
            src={blogPost.image} 
            alt={blogPost.title} 
            className="w-full h-96 object-cover"
          />

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(blogPost.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{blogPost.author}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {blogPost.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {blogPost.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Content */}
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <span>1.2K views</span>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src="https://images.pexels.com/photos/1475340/pexels-photo-1475340.jpeg" 
                  alt="Related post" 
                  className="h-40 w-full object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    Related Blog Post Title {item}
                  </h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>May 10, 2024</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}