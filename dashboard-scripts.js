// Dashboard Scripts - All JavaScript functionality
// Get current page from server-side injection
const currentPage = window.location.pathname === '/' ? 'home' : window.location.pathname.substring(1);

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
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

// Load metrics
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
        document.getElementById('total-feedback').textContent = 'Error';
    }
}

// Load trending keywords for home page
async function loadTrendingKeywords() {
    try {
        const response = await fetch('/api/analysis');
        const analysis = await response.json();
        
        const keywordsDiv = document.getElementById('trending-keywords');
        keywordsDiv.innerHTML = analysis.trendingKeywords.slice(0, 5).map(keyword => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="font-medium text-gray-700">${keyword.keyword}</span>
                <span class="text-sm text-gray-500">${keyword.count} mentions</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading trending keywords:', error);
    }
}

// Load AI insights
async function loadAIInsights() {
    try {
        const response = await fetch('/api/analysis');
        const analysis = await response.json();
        
        const insightsDiv = document.getElementById('ai-insights');
        insightsDiv.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-2">📊 Weekly Summary</h4>
                <p class="text-blue-800 text-sm">This week saw ${analysis.trendingKeywords[0]?.count || 0} mentions of "${analysis.trendingKeywords[0]?.keyword || 'performance'}" as the top concern.</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-900 mb-2">⚠️ Key Issues</h4>
                <p class="text-yellow-800 text-sm">Performance issues and UI improvements are the most frequently mentioned topics across all platforms.</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-900 mb-2">💡 Recommendations</h4>
                <p class="text-green-800 text-sm">Focus on performance optimization and UI enhancements based on user feedback trends.</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading AI insights:', error);
    }
}

// Load feedbacks with filters
async function loadFeedbacks() {
    try {
        const source = document.getElementById('source-filter')?.value || '';
        const time = document.getElementById('time-filter')?.value || 'all';
        const sentiment = document.getElementById('sentiment-filter')?.value || '';
        const order = document.getElementById('order-filter')?.value || 'newest';
        
        let url = '/api/feedback';
        const params = new URLSearchParams();
        if (source) params.append('source', source);
        if (time !== 'all') params.append('time', time);
        if (sentiment) params.append('sentiment', sentiment);
        if (order) params.append('order', order);
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        const feedback = await response.json();
        
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = feedback.map(item => `
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${item.platform || 'Unknown'}</span>
                        <span class="bg-${item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'gray'}-100 text-${item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'gray'}-800 text-xs px-2 py-1 rounded">${item.sentiment || 'unknown'}</span>
                    </div>
                    <span class="text-sm text-gray-500">${new Date(item.created_at || item.timestamp).toLocaleDateString()}</span>
                </div>
                <p class="text-gray-700 mb-2">${item.content || 'No content'}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-400">ID: ${item.id}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('feedback-list').innerHTML = '<div class="text-center py-8 text-red-500">Error loading feedback data.</div>';
    }
}

// Apply filters
function applyFilters() {
    loadFeedbacks();
}

// Reset filters
function resetFilters() {
    document.getElementById('source-filter').value = '';
    document.getElementById('time-filter').value = 'all';
    document.getElementById('sentiment-filter').value = '';
    document.getElementById('order-filter').value = 'newest';
    loadFeedbacks();
}

// Load analysis with charts
async function loadAnalysis() {
    try {
        const response = await fetch('/api/analysis');
        const analysis = await response.json();
        
        // Update keywords
        const keywordList = document.getElementById('keyword-list');
        keywordList.innerHTML = analysis.trendingKeywords.map(keyword => `
            <div class="flex items-center justify-between">
                <span class="font-medium">${keyword.keyword}</span>
                <div class="flex items-center space-x-2">
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${(keyword.count / 25) * 100}%"></div>
                    </div>
                    <span class="text-sm text-gray-500">${keyword.count} mentions</span>
                </div>
            </div>
        `).join('');

        // Update spike detection
        const spikeDiv = document.getElementById('spike-detection');
        spikeDiv.innerHTML = `
            <div class="bg-orange-50 p-4 rounded-lg">
                <h4 class="font-semibold text-orange-900 mb-2">📈 Spike Detected</h4>
                <p class="text-orange-800">Increased feedback activity on ${analysis.sourceDistribution[0]?.source || 'Discord'} platform</p>
                <p class="text-orange-600 text-sm mt-2">Most frequent topic: "${analysis.trendingKeywords[0]?.keyword || 'performance'}"</p>
            </div>
        `;

        // Update frequent feedback
        const frequentDiv = document.getElementById('frequent-feedback');
        frequentDiv.innerHTML = analysis.trendingKeywords.slice(0, 3).map((keyword, index) => `
            <div class="p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900">#${index + 1} ${keyword.keyword}</span>
                    <span class="text-sm text-gray-500">${keyword.count} mentions</span>
                </div>
                <div class="text-sm text-gray-600">Common across multiple platforms</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('keyword-list').innerHTML = '<div class="text-center py-8 text-red-500">Error loading analysis data.</div>';
    }
}

// Load charts (improved version)
function loadCharts() {
    loadPlatformPieChart();
    loadSentimentLineChart();
}

// Platform distribution pie chart
async function loadPlatformPieChart() {
    try {
        const response = await fetch('/api/analysis');
        const analysis = await response.json();
        
        const canvas = document.getElementById('platform-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = analysis.sourceDistribution || [];
        
        // Set canvas size
        canvas.width = 300;
        canvas.height = 300;
        
        // Colors for pie slices
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        
        // Calculate angles
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let currentAngle = -Math.PI / 2; // Start from top
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        // Draw pie slices
        data.forEach((item, index) => {
            const sliceAngle = (item.count / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
            
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.source, labelX, labelY);
            ctx.fillText(item.percentage + '%', labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
        
        // Update legend
        const legendDiv = document.getElementById('platform-legend');
        legendDiv.innerHTML = data.map((item, index) => `
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded" style="background-color: ${colors[index % colors.length]}"></div>
                <span class="text-sm text-gray-700">${item.source}: ${item.count} (${item.percentage}%)</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading platform chart:', error);
    }
}

// Sentiment trend line chart
async function loadSentimentLineChart() {
    try {
        const canvas = document.getElementById('sentiment-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 400;
        canvas.height = 300;
        
        // Sample data for sentiment trends (last 7 days)
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
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw axes
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#F3F4F6';
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            ctx.fillStyle = '#6B7280';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            const value = Math.round(maxValue - (maxValue / 5) * i);
            ctx.fillText(value.toString(), padding - 10, y + 4);
        }
        
        // Draw data lines
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
                
                // Draw data point
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            ctx.stroke();
        };
        
        // Draw lines for each sentiment
        drawLine(positiveData, '#10B981');
        drawLine(negativeData, '#EF4444');
        drawLine(neutralData, '#6B7280');
        
        // Draw X-axis labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        dates.forEach((date, index) => {
            const x = padding + (chartWidth / (dates.length - 1)) * index;
            ctx.fillText(date, x, canvas.height - padding + 20);
        });
        
        // Draw legend
        const legendY = 10;
        const legendItems = [
            { color: '#10B981', label: 'Positive' },
            { color: '#EF4444', label: 'Negative' },
            { color: '#6B7280', label: 'Neutral' }
        ];
        
        legendItems.forEach((item, index) => {
            const legendX = canvas.width - 150 + index * 50;
            
            // Color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY, 12, 12);
            
            // Label
            ctx.fillStyle = '#374151';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 16, legendY + 10);
        });
        
    } catch (error) {
        console.error('Error loading sentiment chart:', error);
    }
}

// Chatbox functions
function setupChatbox() {
    console.log('Chatbox ready');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    sendPrompt(message);
    input.value = '';
}

function sendPrompt(message) {
    const messagesDiv = document.getElementById('chat-messages');
    const historyDiv = document.getElementById('chat-history');
    
    // Add user message
    messagesDiv.innerHTML += `
        <div class="flex justify-end">
            <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                ${message}
            </div>
        </div>
    `;
    
    // Add to history
    const timestamp = new Date().toLocaleTimeString();
    historyDiv.innerHTML = `
        <div class="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" onclick="sendPrompt('${message}')">
            <div class="font-medium">${message.substring(0, 30)}${message.length > 30 ? '...' : ''}</div>
            <div class="text-xs text-gray-500">${timestamp}</div>
        </div>
    ` + historyDiv.innerHTML;
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        messagesDiv.innerHTML += `
            <div class="flex justify-start">
                <div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs">
                    <div class="mb-1">🤖</div>
                    ${response}
                </div>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 1000);
    
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function generateAIResponse(message) {
    const responses = {
        'issues': 'Based on the feedback data, the main issues users are reporting are performance problems, UI/UX concerns, and feature requests.',
        'positive': 'Positive feedback from the last week shows users appreciate the clean UI design and helpful customer support.',
        'negative': 'Discord has the highest percentage of negative feedback, mainly related to performance issues.',
        'trending': 'The trending topics in user feedback include performance optimization, UI improvements, and feature enhancements.',
        'sentiment': 'Sentiment trends show a gradual improvement in positive feedback over the past month.',
        'improvements': 'Users most frequently suggest performance optimizations and additional customization options.'
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (message.toLowerCase().includes(key)) {
            return response;
        }
    }
    
    return 'I can help you analyze your feedback data. Try asking about specific metrics, trends, or patterns in the user feedback.';
}

function clearChatHistory() {
    document.getElementById('chat-history').innerHTML = '<div class="text-sm text-gray-500">No previous conversations</div>';
    document.getElementById('chat-messages').innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <div class="mb-2">🤖</div>
            <div>Chat history cleared. How can I help you today?</div>
        </div>
    `;
}
