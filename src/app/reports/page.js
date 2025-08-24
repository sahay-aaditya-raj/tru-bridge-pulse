'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Reports() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    severity: '',
    page: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      setError('');

      const queryParams = new URLSearchParams();
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', '10');
      
      if (filters.severity) queryParams.append('severity', filters.severity);

      const response = await fetch(`/api/reports?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      console.log('Fetched reports data:', data); // Debug log
      setReports(data.summaries || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoadingReports(false);
    }
  }, [filters.page, filters.severity]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReports();
    }
  }, [isAuthenticated, user, fetchReports]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString, reportId) => {
    // First try to use the provided dateString
    if (dateString) {
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }
    
    // Fallback: Extract timestamp from MongoDB ObjectId
    if (reportId) {
      try {
        const timestamp = parseInt(reportId.substring(0, 8), 16) * 1000;
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('Error extracting date from ObjectId:', error);
      }
    }
    
    return 'Unknown Date';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 pt-4">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Medical Reports</h2>
          <p className="text-gray-600">Your medical consultation summaries and reports</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter your reports by severity and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({ severity: '', page: 1 })}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Reports List */}
        {loadingReports ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No reports found</p>
                <p>Try adjusting your filters or check back later.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Medical Consultation - {report.patientInfo?.name || 'Unknown Patient'}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(report.createdAt, report._id)} • Age: {report.patientInfo?.age || 'N/A'} • Gender: {report.patientInfo?.gender || 'N/A'}
                      </CardDescription>
                    </div>
                    <Badge className={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Symptoms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(report.symptoms.length < 1 || (report.symptoms[0].toLowerCase().trim() === "unspecified" || report.symptoms[0].toLowerCase().trim() === "other") ? ["No Symptoms Detected"] : report.symptoms).map((symptom, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Possible Causes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(report.possibleCauses.length > 0 ? report.possibleCauses : ["No Causes Specified"]).map((cause, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-50">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Duration:</h4>
                        <p className="text-gray-600">{report.duration ? report.duration : 'Not Enough Conversation'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Emotional State:</h4>
                        <p className="text-gray-600">{(report.emotionalState.toLowerCase().trim() === "unknown") || (report.emotionalState.toLowerCase().trim() === "other")? 'Couldn\'t determine (Lack of Conversation)': report.emotionalState}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Doctor&apos;s Notes:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{report?.doctorNotes || 'No notes available'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <Button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={!pagination.hasPrev}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
              {pagination.totalCount && ` (${pagination.totalCount} total)`}
            </span>
            <Button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={!pagination.hasNext}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
