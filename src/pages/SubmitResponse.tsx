import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const SubmitResponse: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    rating: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        subject: '',
        category: 'general',
        message: '',
        rating: 0,
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ 
          fontFamily: 'Playfair Display, serif',
          backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>Submit Feedback</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
          We value your feedback and suggestions to improve our services
        </p>
      </motion.div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg" 
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)',
            border: '1px solid rgba(212,175,55,0.5)'
          }}
        >
          <p className="font-medium" style={{ color: '#d4af37' }}>
            ✓ Thank you! Your feedback has been submitted successfully.
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Your Feedback</CardTitle>
              <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                Help us improve by sharing your thoughts
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                    Subject
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your feedback"
                    required
                    style={{ background: '#000000', border: '1px solid rgba(212,175,55,0.25)' }}
                  />
                </div>

                {/* Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{ 
                        background: '#000000', 
                        border: '1px solid rgba(212,175,55,0.25)',
                        color: '#ffffff'
                      }}
                    >
                      <option value="general">General Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell us more about your experience or suggestion..."
                    required
                    className="w-full px-3 py-2 rounded-lg resize-none"
                    style={{ 
                      background: '#000000', 
                      border: '1px solid rgba(212,175,55,0.25)',
                      color: '#ffffff'
                    }}
                  />
                </div>

{/* Rating */}
<div>
  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(212,175,55,0.9)' }}>
    Rate Your Experience
  </label>
  <div className="flex space-x-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleRating(star)}
        className="transition-transform hover:scale-110"
      >
        <StarIcon 
          className="h-8 w-8" 
          style={{ 
            color: star <= formData.rating ? '#d4af37' : 'rgba(156, 163, 175, 0.5)',
            fill: star <= formData.rating ? '#d4af37' : 'none'
          }}
        />
      </button>
    ))}
  </div>
</div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full text-black font-semibold"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Info */}
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{
                    backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)'
                  }}>
                    <ChatBubbleLeftRightIcon className="h-5 w-5" style={{ color: '#000000' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#ffffff' }}>Average Response</p>
                    <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>24-48 hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Categories */}
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Feature Requests</Badge>
                <Badge variant="outline" className="mr-2">Bug Reports</Badge>
                <Badge variant="outline" className="mr-2">General Feedback</Badge>
                <Badge variant="outline" className="mr-2">Support</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="abs-card">
            <CardHeader>
              <CardTitle style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#d4af37'
              }}>Your Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>Dashboard Improvement</p>
                  <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Submitted 2 days ago</p>
                  <Badge style={{ background: 'rgba(255, 204, 0, 0.7)', color: 'black' }} className="mt-2">Under Review</Badge>
                </div>
                <div className="p-3 rounded-lg" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
                }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#ffffff' }}>Payment UI Update</p>
                  <p className="text-xs" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Submitted 5 days ago</p>
                  <Badge variant="success" className="mt-2">Resolved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

