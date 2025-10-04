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
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMilestoneBadge = (milestone: string) => {
    const colors = {
      'Foundation': 'bg-blue-100 text-blue-800',
      'Structural Framework': 'bg-purple-100 text-purple-800',
      'MEP Systems': 'bg-green-100 text-green-800',
      'General Progress': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={colors[milestone as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {milestone}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Updates</h1>
        <p className="text-gray-600 dark:text-gray-300">Stay informed about your investment progress</p>
      </motion.div>

      {/* Project Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sunset Towers</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Miami, FL
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    Miami Developers LLC
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Expected Completion: December 2024
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full w-1/3"></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">On track for completion</p>
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Updates</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">Latest progress reports and milestones</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-l-4 border-purple-200 pl-6 pb-6 relative"
                >
                  <div className="absolute -left-2 top-0 h-4 w-4 bg-purple-500 rounded-full"></div>
                  
                  <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{update.title}</h3>
                          {getMilestoneBadge(update.milestone)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{update.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(update.createdAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{update.progress}%</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-4">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(update.progress)}`}
                            style={{ width: `${update.progress}%` }}
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
                    
                    {/* Mock Images */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Milestone Progress</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track completion of major project milestones</p>
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
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{milestone.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(milestone.progress)}`}
                        style={{ width: `${milestone.progress}%` }}
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Need More Information?</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">Contact our project team for detailed updates</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Project Manager</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sarah Johnson</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">sarah.johnson@miamidevelopers.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">RealAssist Support Team</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">support@realassist.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">+1 (555) 987-6543</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
