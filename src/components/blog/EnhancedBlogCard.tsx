import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Clock, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SocialShare } from './SocialShare';

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

interface EnhancedBlogCardProps {
  post: BlogPost;
  index?: number;
  featured?: boolean;
}

export function EnhancedBlogCard({ post, index = 0, featured = false }: EnhancedBlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <Card className="overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-96 md:h-auto overflow-hidden">
              <motion.img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                initial={{ scale: 1.1 }}
                animate={{ scale: imageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

              {/* Featured Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-orange-600 text-white">Featured</Badge>
              </div>

              {/* Social Share */}
              <div className="absolute top-4 right-4">
                <SocialShare
                  title={post.title}
                  url={`/blog/${post.id}`}
                  hashtags={post.tags}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
                {post.readTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime} min read
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h2>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  {post.views && (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {post.likes || 0}
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Link to={`/blog/${post.id}`}>
                  Read Full Article
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0 h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            initial={{ scale: 1.1 }}
            animate={{ scale: imageLoaded ? 1 : 1.1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Social Share */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <SocialShare
              title={post.title}
              url={`/blog/${post.id}`}
              hashtags={post.tags}
            />
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {post.readTime} min
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
            <Link to={`/blog/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 2).map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Stats and CTA */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {post.views && (
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {post.views}
                </div>
              )}
              <div className="flex items-center">
                <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {post.likes || 0}
              </div>
            </div>

            <Button variant="ghost" size="sm" asChild className="text-orange-600 hover:text-orange-700 p-0 h-auto">
              <Link to={`/blog/${post.id}`}>
                Read More →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}