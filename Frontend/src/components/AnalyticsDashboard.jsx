import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Award, Clock, Target, BookOpen, 
  MessageSquare, FileText, Star, Activity,
  ChevronUp, ChevronDown, Download
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [data] = useState({
    overview: {
      totalUsers: 1234,
      activeUsers: 567,
      completedAssessments: 890,
      generatedResumes: 445,
      interviewsScheduled: 123,
      placementSuccess: 78
    },
    userActivity: [
      { day: 'Mon', users: 120, assessments: 45, resumes: 30 },
      { day: 'Tue', users: 132, assessments: 52, resumes: 38 },
      { day: 'Wed', users: 108, assessments: 38, resumes: 25 },
      { day: 'Thu', users: 145, assessments: 61, resumes: 42 },
      { day: 'Fri', users: 156, assessments: 67, resumes: 48 },
      { day: 'Sat', users: 89, assessments: 29, resumes: 18 },
      { day: 'Sun', users: 98, assessments: 34, resumes: 22 }
    ],
    skillDistribution: [
      { skill: 'Technical Skills', value: 35, color: '#3B82F6' },
      { skill: 'Communication', value: 28, color: '#10B981' },
      { skill: 'Leadership', value: 22, color: '#F59E0B' },
      { skill: 'Problem Solving', value: 15, color: '#EF4444' }
    ],
    careerProgress: [
      { month: 'Jan', interviews: 45, offers: 12, placements: 8 },
      { month: 'Feb', interviews: 52, offers: 18, placements: 14 },
      { month: 'Mar', interviews: 48, offers: 15, placements: 11 },
      { month: 'Apr', interviews: 67, offers: 25, placements: 19 },
      { month: 'May', interviews: 71, offers: 28, placements: 22 },
      { month: 'Jun', interviews: 84, offers: 35, placements: 28 }
    ],
    popularFeatures: [
      { feature: 'Resume Builder', usage: 85, trend: 'up' },
      { feature: 'Skill Assessment', usage: 72, trend: 'up' },
      { feature: 'Interview Prep', usage: 68, trend: 'down' },
      { feature: 'Cover Letter Gen', usage: 54, trend: 'up' },
      { feature: 'Career Matching', usage: 47, trend: 'up' }
    ],
    performanceMetrics: [
      { metric: 'Assessment Completion Rate', value: 78, target: 80, color: '#F59E0B' },
      { metric: 'User Engagement Score', value: 85, target: 75, color: '#10B981' },
      { metric: 'Feature Adoption Rate', value: 62, target: 70, color: '#EF4444' },
      { metric: 'Success Rate', value: 73, target: 75, color: '#3B82F6' }
    ]
  });

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, [dateRange]);

  const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => {
    const isPositive = change > 0;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
      red: 'bg-red-50 text-red-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{Math.abs(change)}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={data.overview.totalUsers}
            icon={Users}
            change={12.5}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={data.overview.activeUsers}
            icon={Activity}
            change={8.2}
            color="green"
          />
          <StatCard
            title="Assessments"
            value={data.overview.completedAssessments}
            icon={BookOpen}
            change={-2.1}
            color="yellow"
          />
          <StatCard
            title="Resumes Built"
            value={data.overview.generatedResumes}
            icon={FileText}
            change={15.3}
            color="purple"
          />
          <StatCard
            title="Interviews"
            value={data.overview.interviewsScheduled}
            icon={MessageSquare}
            change={22.8}
            color="indigo"
          />
          <StatCard
            title="Success Rate"
            value={data.overview.placementSuccess}
            icon={Award}
            change={5.4}
            color="green"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Daily User Activity</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Assessments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Resumes</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="assessments" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resumes" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Skill Assessment Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.skillDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Career Progress and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Career Progress Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Career Progress Tracking</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.careerProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="interviews" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="offers" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="placements" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              {data.performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{metric.metric}</span>
                    <span className="font-medium">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${metric.value}%`,
                        backgroundColor: metric.color
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {metric.target}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Usage and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Features */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Feature Usage</h2>
            <div className="space-y-4">
              {data.popularFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{feature.feature}</div>
                      <div className="text-sm text-gray-500">{feature.usage}% usage rate</div>
                    </div>
                  </div>
                  <div className={`flex items-center ${feature.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {feature.trend === 'up' ? 
                      <TrendingUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">New user registration spike</div>
                  <div className="text-xs text-gray-500">45 new users in the last hour</div>
                  <div className="text-xs text-gray-400">2 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Assessment milestone reached</div>
                  <div className="text-xs text-gray-500">1000 assessments completed this week</div>
                  <div className="text-xs text-gray-400">1 hour ago</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">High engagement detected</div>
                  <div className="text-xs text-gray-500">Resume builder usage up 23%</div>
                  <div className="text-xs text-gray-400">3 hours ago</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Peak usage time</div>
                  <div className="text-xs text-gray-500">Highest concurrent users: 234</div>
                  <div className="text-xs text-gray-400">5 hours ago</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Feature feedback received</div>
                  <div className="text-xs text-gray-500">12 new feedback items for interview prep</div>
                  <div className="text-xs text-gray-400">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
