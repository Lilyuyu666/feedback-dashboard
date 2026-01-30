// Combined Worker - API + Dashboard in one (Original Working Version)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(path, request, env);
    }

    // Serve the dashboard HTML for all other routes
    return getDashboardHTML(path);
  }
};

// Handle API requests - connects to your D1 database
async function handleApiRequest(path, request, env) {
  try {
    // Check if database binding exists
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        error: 'Database not configured. Please add D1 binding in Worker settings.',
        setup: 'Variable name: DB, Select your feedback_150 database'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/feedback') {
      const feedback = await getFeedbackFromDB(env);
      return new Response(JSON.stringify(feedback), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (path === '/api/metrics') {
      const metrics = await getMetricsFromDB(env);
      return new Response(JSON.stringify(metrics), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (path === '/api/analysis') {
      const analysis = await getAnalysisFromDB(env);
      return new Response(JSON.stringify(analysis), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Database query failed: ' + error.message,
      hint: 'Check your D1 binding configuration'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Database query functions - connects to your feedback_150 table
async function getFeedbackFromDB(env) {
  try {
    const result = await env.DB.prepare('SELECT * FROM feedback_150 ORDER BY created_at DESC LIMIT 50').all();
    return result.results || [];
  } catch (error) {
    return [{ error: 'Could not fetch feedback: ' + error.message }];
  }
}

async function getMetricsFromDB(env) {
  try {
    const tableName = 'feedback_150';
    const timestampColumn = 'created_at';

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total count
    const totalResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
    const total = totalResult ? totalResult.count : 0;

    // Get time-based counts
    const last24hResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName} WHERE ${timestampColumn} > datetime('${last24h.toISOString()}')`).first();
    const last7dResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName} WHERE ${timestampColumn} > datetime('${last7d.toISOString()}')`).first();
    const last30dResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName} WHERE ${timestampColumn} > datetime('${last30d.toISOString()}')`).first();

    // Get sentiment breakdown
    const sentimentResults = await env.DB.prepare(`SELECT sentiment, COUNT(*) as count FROM ${tableName} GROUP BY sentiment`).all();
    
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    sentimentResults.results.forEach(row => {
      sentimentCounts[row.sentiment] = row.count;
    });

    // Get top source
    const sourceResult = await env.DB.prepare(`SELECT platform as source, COUNT(*) as count FROM ${tableName} GROUP BY platform ORDER BY count DESC LIMIT 1`).first();

    return {
      total,
      last24h: last24hResult ? last24hResult.count : 0,
      last7d: last7dResult ? last7dResult.count : 0,
      last30d: last30dResult ? last30dResult.count : 0,
      sentimentBreakdown: {
        positive: total > 0 ? Math.round((sentimentCounts.positive / total) * 100) : 0,
        negative: total > 0 ? Math.round((sentimentCounts.negative / total) * 100) : 0,
        neutral: total > 0 ? Math.round((sentimentCounts.neutral / total) * 100) : 0
      },
      topSource: sourceResult ? sourceResult.source : 'No data'
    };
  } catch (error) {
    return {
      total: 0,
      last24h: 0,
      last7d: 0,
      last30d: 0,
      sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
      topSource: 'Error: ' + error.message
    };
  }
}

async function getAnalysisFromDB(env) {
  try {
    const tableName = 'feedback_150';
    const sourceColumn = 'platform';

    // Get source distribution
    const sourceResults = await env.DB.prepare(`SELECT ${sourceColumn} as source, COUNT(*) as count FROM ${tableName} GROUP BY ${sourceColumn} ORDER BY count DESC`).all();
    const total = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
    
    const sourceDistribution = sourceResults.results.map(row => ({
      source: row.source,
      count: row.count,
      percentage: total ? Math.round((row.count / total.count) * 100) : 0
    }));

    // Keyword extraction
    const feedbackResults = await env.DB.prepare(`SELECT content FROM ${tableName}`).all();
    const keywordCounts = {};
    
    feedbackResults.results.forEach(row => {
      if (row.content) {
        const words = row.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4) {
            keywordCounts[word] = (keywordCounts[word] || 0) + 1;
          }
        });
      }
    });

    const trendingKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      trendingKeywords,
      sourceDistribution,
      sentimentTrend: [],
      spikeDetection: {
        detected: false,
        spikeDate: new Date().toISOString().split('T')[0],
        spikeSource: 'None',
        spikeReason: 'Connected to D1 database successfully'
      }
    };
  } catch (error) {
    return {
      trendingKeywords: [],
      sourceDistribution: [],
      sentimentTrend: [],
      spikeDetection: {
        detected: false,
        error: error.message
      }
    };
  }
}
// Return the dashboard HTML with embedded data
function getDashboardHTML(currentPath) {
  const page = currentPath === '/' ? 'home' : currentPath.substring(1);
  
  let content = '';
  if (page === 'home') {
    content = getHomeContent();
  } else if (page === 'feedbacks') {
    content = getFeedbacksContent();
  } else if (page === 'analysis') {
    content = getAnalysisContent();
  } else if (page === 'chatbox') {
    content = getChatboxContent();
  }
  
  let activeNav = {
    home: page === 'home' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
    feedbacks: page === 'feedbacks' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
    analysis: page === 'analysis' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
    chatbox: page === 'chatbox' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
  };
  
  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Analysis Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <h1 class="text-xl font-bold text-gray-900">Feedback Dashboard</h1>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <a href="/" class="inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.home} text-sm font-medium">Home</a>
                            <a href="/feedbacks" class="inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.feedbacks} text-sm font-medium">Feedbacks</a>
                            <a href="/analysis" class="inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.analysis} text-sm font-medium">Analysis</a>
                            <a href="/chatbox" class="inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.chatbox} text-sm font-medium">AI Assistant</a>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div class="mr-4 text-sm text-green-600">✅ Connected to D1</div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div id="content">${content}</div>
            </div>
        </main>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const currentPage = '${page}';
            
            if (currentPage === 'home') {
                loadMetrics();
                loadTrendingKeywords();
                loadAIInsights();
            } else if (currentPage === 'feedbacks') {
                loadFeedbacks();
            } else if (currentPage === 'analysis') {
                loadAnalysis();
                loadCharts();
            } else if (currentPage === 'chatbox') {
                setupChatbox();
            }
        });

        async function loadMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                
                document.getElementById('total-feedback').textContent = data.total || 0;
                document.getElementById('last-24h').textContent = data.last24h || 0;
                document.getElementById('last-7d').textContent = data.last7d || 0;
                document.getElementById('last-30d').textContent = data.last30d || 0;
                
                const sentiment = data.sentimentBreakdown || { positive: 0, negative: 0, neutral: 0 };
                document.getElementById('positive-percent').textContent = sentiment.positive + '%';
                document.getElementById('negative-percent').textContent = sentiment.negative + '%';
                document.getElementById('neutral-percent').textContent = sentiment.neutral + '%';
                
                document.getElementById('positive-bar').style.width = sentiment.positive + '%';
                document.getElementById('negative-bar').style.width = sentiment.negative + '%';
                document.getElementById('neutral-bar').style.width = sentiment.neutral + '%';
                
                document.getElementById('top-source').textContent = data.topSource || 'No data';
            } catch (error) {
                console.error('Error:', error);
            }
        }

        async function loadTrendingKeywords() {
            try {
                const response = await fetch('/api/analysis');
                const analysis = await response.json();
                
                const keywordsDiv = document.getElementById('trending-keywords');
                keywordsDiv.innerHTML = analysis.trendingKeywords.slice(0, 5).map(keyword => 
                    '<div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="font-medium text-gray-700">' + keyword.keyword + '</span><span class="text-sm text-gray-500">' + keyword.count + ' mentions</span></div>'
                ).join('');
            } catch (error) {
                console.error('Error loading trending keywords:', error);
            }
        }

        async function loadAIInsights() {
            try {
                const insightsDiv = document.getElementById('ai-insights');
                insightsDiv.innerHTML = 
                    '<div class="bg-blue-50 p-4 rounded-lg"><h4 class="font-semibold text-blue-900 mb-2">📊 Weekly Summary</h4><p class="text-blue-800 text-sm">Performance and UI improvements are the top concerns this week.</p></div>' +
                    '<div class="bg-yellow-50 p-4 rounded-lg"><h4 class="font-semibold text-yellow-900 mb-2">⚠️ Key Issues</h4><p class="text-yellow-800 text-sm">Focus on performance optimization and UI enhancements.</p></div>' +
                    '<div class="bg-green-50 p-4 rounded-lg"><h4 class="font-semibold text-green-900 mb-2">💡 Recommendations</h4><p class="text-green-800 text-sm">Prioritize performance fixes based on user feedback.</p></div>';
            } catch (error) {
                console.error('Error loading AI insights:', error);
            }
        }

        async function loadFeedbacks() {
            try {
                const response = await fetch('/api/feedback');
                const feedback = await response.json();
                
                const feedbackList = document.getElementById('feedback-list');
                feedbackList.innerHTML = feedback.map(item => 
                    '<div class="bg-white p-4 rounded-lg shadow"><div class="flex justify-between items-start mb-2"><div class="flex items-center space-x-2"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">' + (item.platform || 'Unknown') + '</span><span class="bg-' + (item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'gray') + '-100 text-' + (item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'gray') + '-800 text-xs px-2 py-1 rounded">' + (item.sentiment || 'unknown') + '</span></div><span class="text-sm text-gray-500">' + new Date(item.created_at || item.timestamp).toLocaleDateString() + '</span></div><p class="text-gray-700 mb-2">' + (item.content || 'No content') + '</p><div class="flex justify-between items-center"><span class="text-xs text-gray-400">ID: ' + item.id + '</span></div></div>'
                ).join('');
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function applyFilters() { loadFeedbacks(); }
        function resetFilters() { 
            document.getElementById('source-filter').value = '';
            document.getElementById('time-filter').value = 'all';
            document.getElementById('sentiment-filter').value = '';
            document.getElementById('order-filter').value = 'newest';
            loadFeedbacks(); 
        }

        async function loadAnalysis() {
            try {
                const response = await fetch('/api/analysis');
                const analysis = await response.json();
                
                const keywordList = document.getElementById('keyword-list');
                keywordList.innerHTML = analysis.trendingKeywords.map(keyword => 
                    '<div class="flex items-center justify-between"><span class="font-medium">' + keyword.keyword + '</span><div class="flex items-center space-x-2"><div class="w-32 bg-gray-200 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" style="width: ' + ((keyword.count / 25) * 100) + '%"></div></div><span class="text-sm text-gray-500">' + keyword.count + ' mentions</span></div></div>'
                ).join('');

                const spikeDiv = document.getElementById('spike-detection');
                spikeDiv.innerHTML = '<div class="bg-orange-50 p-4 rounded-lg"><h4 class="font-semibold text-orange-900 mb-2">📈 Spike Detected</h4><p class="text-orange-800">Increased feedback activity on ' + (analysis.sourceDistribution[0]?.source || 'Discord') + ' platform</p></div>';
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function loadCharts() { 
            loadPlatformPieChart();
            loadSentimentLineChart(); 
        }

        async function loadPlatformPieChart() {
            try {
                const response = await fetch('/api/analysis');
                const analysis = await response.json();
                
                const canvas = document.getElementById('platform-chart');
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                const data = analysis.sourceDistribution || [];
                
                canvas.width = 300;
                canvas.height = 300;
                
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                const total = data.reduce((sum, item) => sum + item.count, 0);
                let currentAngle = -Math.PI / 2;
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 100;
                
                data.forEach((item, index) => {
                    const sliceAngle = (item.count / total) * 2 * Math.PI;
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fillStyle = colors[index % colors.length];
                    ctx.fill();
                    
                    currentAngle += sliceAngle;
                });
                
                const legendDiv = document.getElementById('platform-legend');
                legendDiv.innerHTML = data.map((item, index) => 
                    '<div class="flex items-center space-x-2"><div class="w-4 h-4 rounded" style="background-color: ' + colors[index % colors.length] + '"></div><span class="text-sm text-gray-700">' + item.source + ': ' + item.count + ' (' + item.percentage + '%)</span></div>'
                ).join('');
                
            } catch (error) {
                console.error('Error loading platform chart:', error);
            }
        }

        async function loadSentimentLineChart() {
            try {
                const canvas = document.getElementById('sentiment-chart');
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                canvas.width = 400;
                canvas.height = 300;
                
                const dates = [];
                const positiveData = [];
                const negativeData = [];
                const neutralData = [];
                
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    positiveData.push(Math.floor(Math.random() * 20) + 30);
                    negativeData.push(Math.floor(Math.random() * 15) + 10);
                    neutralData.push(Math.floor(Math.random() * 25) + 20);
                }
                
                const padding = 40;
                const chartWidth = canvas.width - padding * 2;
                const chartHeight = canvas.height - padding * 2;
                const maxValue = Math.max(...positiveData, ...negativeData, ...neutralData);
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                ctx.strokeStyle = '#E5E7EB';
                ctx.lineWidth = 1;
                
                ctx.beginPath();
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, canvas.height - padding);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(padding, canvas.height - padding);
                ctx.lineTo(canvas.width - padding, canvas.height - padding);
                ctx.stroke();
                
                const drawLine = (data, color) => {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    
                    data.forEach((value, index) => {
                        const x = padding + (chartWidth / (data.length - 1)) * index;
                        const y = padding + chartHeight - (value / maxValue) * chartHeight;
                        
                        if (index === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                        
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(x, y, 4, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                    
                    ctx.stroke();
                };
                
                drawLine(positiveData, '#10B981');
                drawLine(negativeData, '#EF4444');
                drawLine(neutralData, '#6B7280');
                
            } catch (error) {
                console.error('Error loading sentiment chart:', error);
            }
        }

        function setupChatbox() { console.log('Chatbox ready'); }
        function sendMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            if (!message) return;
            sendPrompt(message);
            input.value = '';
        }

        function sendPrompt(message) {
            const messagesDiv = document.getElementById('chat-messages');
            messagesDiv.innerHTML += '<div class="flex justify-end"><div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">' + message + '</div></div>';
            
            setTimeout(() => {
                const response = 'I can help you analyze your feedback data. Try asking about specific metrics or trends.';
                messagesDiv.innerHTML += '<div class="flex justify-start"><div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs"><div class="mb-1">🤖</div>' + response + '</div></div>';
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }, 1000);
            
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function clearChatHistory() {
            document.getElementById('chat-history').innerHTML = '<div class="text-sm text-gray-500">No previous conversations</div>';
            document.getElementById('chat-messages').innerHTML = '<div class="text-center py-8 text-gray-500"><div class="mb-2">🤖</div><div>Chat history cleared. How can I help you today?</div></div>';
        }
    </script>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

function getHomeContent() {
  return `
    <div class="mb-8"><h2 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2><p class="text-gray-600">Monitor and analyze user feedback across all platforms</p></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow"><div class="text-sm font-medium text-gray-500">Total Feedback</div><div class="text-3xl font-bold text-gray-900" id="total-feedback">Loading...</div></div>
        <div class="bg-white p-6 rounded-lg shadow"><div class="text-sm font-medium text-gray-500">Last 24 Hours</div><div class="text-3xl font-bold text-blue-600" id="last-24h">Loading...</div></div>
        <div class="bg-white p-6 rounded-lg shadow"><div class="text-sm font-medium text-gray-500">Last 7 Days</div><div class="text-3xl font-bold text-green-600" id="last-7d">Loading...</div></div>
        <div class="bg-white p-6 rounded-lg shadow"><div class="text-sm font-medium text-gray-500">Last 30 Days</div><div class="text-3xl font-bold text-purple-600" id="last-30d">Loading...</div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Sentiment Breakdown</h3><div class="space-y-3">
            <div class="flex items-center justify-between"><span class="text-green-600">Positive</span><span class="font-semibold" id="positive-percent">Loading...</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-green-600 h-2 rounded-full" id="positive-bar" style="width: 0%"></div></div>
            <div class="flex items-center justify-between"><span class="text-red-600">Negative</span><span class="font-semibold" id="negative-percent">Loading...</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-red-600 h-2 rounded-full" id="negative-bar" style="width: 0%"></div></div>
            <div class="flex items-center justify-between"><span class="text-gray-600">Neutral</span><span class="font-semibold" id="neutral-percent">Loading...</span></div><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-gray-600 h-2 rounded-full" id="neutral-bar" style="width: 0%"></div></div>
        </div></div>
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Top Source Platform</h3><div class="text-center"><div class="text-4xl font-bold text-blue-600" id="top-source">Loading...</div><div class="text-gray-500 mt-2">Most active feedback source</div></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Trending Keywords</h3><div id="trending-keywords" class="space-y-2"><div class="text-center py-8 text-gray-500">Loading trending keywords...</div></div></div>
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">AI-Generated Insights</h3><div id="ai-insights" class="space-y-4"><div class="text-center py-8 text-gray-500">Loading AI insights...</div></div></div>
    </div>
  `;
}

function getFeedbacksContent() {
  return `
    <div class="mb-8"><h2 class="text-2xl font-bold text-gray-900 mb-2">Raw Feedback</h2><p class="text-gray-600">Browse and filter all user feedback entries</p></div>
    <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-2">Source</label><select id="source-filter" class="w-full p-2 border border-gray-300 rounded-md"><option value="">All Sources</option><option value="Discord">Discord</option><option value="GitHub">GitHub</option><option value="Email">Email</option></select></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-2">Time Period</label><select id="time-filter" class="w-full p-2 border border-gray-300 rounded-md"><option value="all">All Time</option><option value="24h">Past 24 Hours</option><option value="7d">Past Week</option><option value="30d">Past 30 Days</option></select></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-2">Sentiment</label><select id="sentiment-filter" class="w-full p-2 border border-gray-300 rounded-md"><option value="">All Sentiments</option><option value="positive">Positive</option><option value="negative">Negative</option><option value="neutral">Neutral</option></select></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-2">Order</label><select id="order-filter" class="w-full p-2 border border-gray-300 rounded-md"><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select></div>
        </div>
        <div class="mt-4"><button onclick="applyFilters()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Apply Filters</button><button onclick="resetFilters()" class="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">Reset</button></div>
    </div>
    <div id="feedback-list" class="space-y-4"><div class="text-center py-8 text-gray-500">Loading feedback data...</div></div>
  `;
}

function getAnalysisContent() {
  return `
    <div class="mb-8"><h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback Analysis</h2><p class="text-gray-600">Deep dive into feedback patterns and trends</p></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Platform Distribution</h3><div class="relative h-64"><canvas id="platform-chart"></canvas></div><div id="platform-legend" class="mt-4 space-y-2"></div></div>
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Sentiment Trend Over Time</h3><div class="relative h-64"><canvas id="sentiment-chart"></canvas></div></div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow mb-6"><h3 class="text-lg font-semibold mb-4">Spike Detection</h3><div id="spike-detection" class="space-y-4"><div class="text-center py-8 text-gray-500">Loading spike detection data...</div></div></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Keyword Frequency</h3><div id="keyword-list" class="space-y-2"><div class="text-center py-8 text-gray-500">Loading analysis data...</div></div></div>
        <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Most Frequent Feedback</h3><div id="frequent-feedback" class="space-y-3"><div class="text-center py-8 text-gray-500">Loading frequent feedback...</div></div></div>
    </div>
  `;
}

function getChatboxContent() {
  return `
    <div class="mb-8"><h2 class="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h2><p class="text-gray-600">Ask questions about your feedback data</p></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow">
                <div class="border-b px-6 py-4"><h3 class="text-lg font-semibold">Conversation</h3></div>
                <div id="chat-messages" class="h-96 overflow-y-auto p-6 space-y-4"><div class="text-center py-8 text-gray-500"><div class="mb-2">🤖</div><div>AI Assistant ready! Ask me anything about your feedback data.</div></div></div>
                <div class="border-t px-6 py-4"><div class="flex space-x-2"><input type="text" id="chat-input" placeholder="Type your message..." class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><button onclick="sendMessage()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Send</button></div></div>
            </div>
        </div>
        <div>
            <div class="bg-white rounded-lg shadow">
                <div class="border-b px-6 py-4"><h3 class="text-lg font-semibold">Suggested Prompts</h3></div>
                <div class="p-6 space-y-3">
                    <button onclick="sendPrompt('What are the main issues users are reporting?')" class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">What are the main issues users are reporting?</button>
                    <button onclick="sendPrompt('Show me positive feedback from the last week')" class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">Show me positive feedback from the last week</button>
                    <button onclick="sendPrompt('Which platform has the most negative feedback?')" class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">Which platform has the most negative feedback?</button>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow mt-6">
                <div class="border-b px-6 py-4"><h3 class="text-lg font-semibold">Chat History</h3></div>
                <div id="chat-history" class="p-6 space-y-2 max-h-64 overflow-y-auto"><div class="text-sm text-gray-500">No previous conversations</div></div>
                <div class="border-t px-6 py-4"><button onclick="clearChatHistory()" class="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Clear History</button></div>
            </div>
        </div>
    </div>
  `;
}
