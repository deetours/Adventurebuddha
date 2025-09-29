import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Save, X, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import ImageManager from '../../components/trips/ImageManager';
import { api } from '../../lib/api';
import { Trip } from '../../lib/types';

export default function TripManagement() {
  const { slug } = useParams<{ slug: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrip, setEditedTrip] = useState<Partial<Trip>>({});
  const queryClient = useQueryClient();

  const { 
    data: trip, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['trip', slug],
    queryFn: () => api.getTrip(slug!),
    enabled: !!slug
  });

  const updateMutation = useMutation({
    mutationFn: (updatedTrip: Partial<Trip>) => 
      api.updateTrip(trip!.slug, updatedTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', slug] });
      setIsEditing(false);
      setEditedTrip({});
    }
  });

  useEffect(() => {
    if (trip && isEditing) {
      setEditedTrip({
        title: trip.title,
        description: trip.description,
        price: trip.price,
        duration: trip.duration,
        images: trip.images
      });
    }
  }, [trip, isEditing]);

  if (!slug) {
    return <Navigate to="/admin/trips" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Trip Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested trip could not be found.
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(editedTrip);
  };

  const handleImagesUpdate = (images: string[]) => {
    if (isEditing) {
      setEditedTrip(prev => ({ ...prev, images }));
    } else {
      // Update directly if not in editing mode
      updateMutation.mutate({ images });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Trip' : 'Trip Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {trip.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTrip({});
                  }}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/trips/${trip.slug}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Trip
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Trip Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Trip Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={editedTrip.title || ''}
                    onChange={(e) => setEditedTrip(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                    {trip.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price (₹)</Label>
                {isEditing ? (
                  <Input
                    id="price"
                    type="number"
                    value={editedTrip.price || ''}
                    onChange={(e) => setEditedTrip(prev => ({ 
                      ...prev, 
                      price: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                    ₹{trip.price.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                {isEditing ? (
                  <Input
                    id="duration"
                    type="number"
                    value={editedTrip.duration || ''}
                    onChange={(e) => setEditedTrip(prev => ({ 
                      ...prev, 
                      duration: parseInt(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                    {trip.duration} days
                  </p>
                )}
              </div>

              <div>
                <Label>Difficulty</Label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium capitalize">
                  {trip.difficulty}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedTrip.description || ''}
                  onChange={(e) => setEditedTrip(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {trip.description}
                </p>
              )}
            </div>
          </Card>

          {/* Image Management */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Trip Images
            </h2>
            <ImageManager
              tripSlug={trip.slug}
              images={isEditing ? (editedTrip.images || []) : trip.images}
              onImagesUpdate={handleImagesUpdate}
            />
          </Card>

          {/* Tags and Metadata */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tags & Metadata
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trip.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Rating</Label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                  {trip.rating}/5 ({trip.reviewCount} reviews)
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}