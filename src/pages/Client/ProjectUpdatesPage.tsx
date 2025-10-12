import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clientAPI } from '@/services/api';
import { ProjectUpdate } from '@/types';
import { formatDate } from '@/lib/utils';

export const ProjectUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = await clientAPI.getProjectUpdates();
        setUpdates(data);
      } catch (error) {
        console.error('Failed to fetch project updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#d4af37';
    if (progress >= 50) return '#d4af37';
    if (progress >= 25) return 'rgba(212,175,55,0.7)';
    return '#ef4444';
  };

  const getMilestoneBadge = (milestone: string) => {
    const variants = {
      'Foundation': 'gold',
      'Structural Framework': 'secondary',
      'MEP Systems': 'gold',
      'General Progress': 'gold',
    };
    
    return (
      <Badge variant={variants[milestone as keyof typeof variants] as any || 'secondary'}>
        {milestone}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        }}>Project Updates</h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Stay informed about your investment progress</p>
      </motion.div>

      {/* Project Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="abs-card-premium">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Sunset Towers</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    <MapPinIcon className="h-4 w-4 mr-2" style={{ color: '#d4af37' }} />
                    Miami, FL
                  </div>
                  <div className="flex items-center text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" style={{ color: '#d4af37' }} />
                    Miami Developers LLC
                  </div>
                  <div className="flex items-center text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
                    <CalendarIcon className="h-4 w-4 mr-2" style={{ color: '#d4af37' }} />
                    Expected Completion: December 2024
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Overall Progress</span>
                  <span className="text-sm font-medium" style={{ color: '#ffffff' }}>35%</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="h-3 rounded-full w-1/3" style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}></div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>On track for completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Updates Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Recent Updates</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Latest progress reports and milestones</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-l-4 pl-6 pb-6 relative"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}
                >
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full" style={{ backgroundColor: '#d4af37' }}></div>
                  
                  <div className="rounded-lg p-6 shadow-sm" style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
                    border: '1px solid rgba(212,175,55,0.2)'
                  }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>{update.title}</h3>
                          {getMilestoneBadge(update.milestone)}
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>{update.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>
                            <CalendarIcon className="h-4 w-4 mr-1" style={{ color: '#d4af37' }} />
                            {formatDate(update.createdAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium" style={{ color: 'rgba(212,175,55,0.9)' }}>Progress:</span>
                            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{update.progress}%</span>
                          </div>
                        </div>
                        
                        <div className="w-full rounded-full h-2 mb-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <div 
                            className="h-2 rounded-full"
                            style={{ width: `${update.progress}%`, backgroundColor: getProgressColor(update.progress) }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Button variant="outline" size="sm">
                            <PhotoIcon className="h-4 w-4 mr-2" />
                            View Photos
                          </Button>
                          <Button variant="outline" size="sm">
                            <ArrowRightIcon className="h-4 w-4 mr-2" />
                            Read More
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Real Property Images */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" 
                          alt="Modern Building Exterior"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop" 
                          alt="High-rise Construction"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop" 
                          alt="Luxury Property"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestone Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Milestone Progress</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Track completion of major project milestones</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Foundation', progress: 100, status: 'completed' },
                { name: 'Structural Framework', progress: 75, status: 'in-progress' },
                { name: 'MEP Systems', progress: 40, status: 'in-progress' },
                { name: 'Interior Work', progress: 0, status: 'pending' },
                { name: 'Final Inspection', progress: 0, status: 'pending' },
              ].map((milestone, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{milestone.name}</span>
                      <span className="text-sm" style={{ color: 'rgba(212,175,55,0.9)' }}>{milestone.progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <div 
                        className="h-2 rounded-full"
                        style={{ width: `${milestone.progress}%`, backgroundColor: getProgressColor(milestone.progress) }}
                      ></div>
                    </div>
                  </div>
                  <Badge variant={milestone.status === 'completed' ? 'success' : milestone.status === 'in-progress' ? 'info' : 'secondary'}>
                    {milestone.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#d4af37'
            }}>Need More Information?</CardTitle>
            <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.7)' }}>Contact our project team for detailed updates</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Project Manager</h4>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Sarah Johnson</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>sarah.johnson@miamidevelopers.com</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>+1 (555) 123-4567</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Customer Support</h4>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>RealAssist Support Team</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>support@realassist.com</p>
                <p className="text-sm" style={{ color: 'rgba(156, 163, 175, 0.9)' }}>+1 (555) 987-6543</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
