// Page Templates - HTML content for each page

export function getHomeContent() {
  return `
    <div id="home-content">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p class="text-gray-600">Monitor and analyze user feedback across all platforms</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-sm font-medium text-gray-500">Total Feedback</div>
                <div class="text-3xl font-bold text-gray-900" id="total-feedback">Loading...</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-sm font-medium text-gray-500">Last 24 Hours</div>
                <div class="text-3xl font-bold text-blue-600" id="last-24h">Loading...</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-sm font-medium text-gray-500">Last 7 Days</div>
                <div class="text-3xl font-bold text-green-600" id="last-7d">Loading...</div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="text-sm font-medium text-gray-500">Last 30 Days</div>
                <div class="text-3xl font-bold text-purple-600" id="last-30d">Loading...</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Sentiment Breakdown</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-green-600">Positive</span>
                        <span class="font-semibold" id="positive-percent">Loading...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" id="positive-bar" style="width: 0%"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-red-600">Negative</span>
                        <span class="font-semibold" id="negative-percent">Loading...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-red-600 h-2 rounded-full" id="negative-bar" style="width: 0%"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">Neutral</span>
                        <span class="font-semibold" id="neutral-percent">Loading...</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-gray-600 h-2 rounded-full" id="neutral-bar" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Top Source Platform</h3>
                <div class="text-center">
                    <div class="text-4xl font-bold text-blue-600" id="top-source">Loading...</div>
                    <div class="text-gray-500 mt-2">Most active feedback source</div>
                </div>
            </div>
        </div>

        <!-- New Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Trending Keywords</h3>
                <div id="trending-keywords" class="space-y-2">
                    <div class="text-center py-8 text-gray-500">Loading trending keywords...</div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">AI-Generated Insights</h3>
                <div id="ai-insights" class="space-y-4">
                    <div class="text-center py-8 text-gray-500">Loading AI insights...</div>
                </div>
            </div>
        </div>
    </div>
  `;
}

export function getFeedbacksContent() {
  return `
    <div id="feedbacks-content">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Raw Feedback</h2>
            <p class="text-gray-600">Browse and filter all user feedback entries</p>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <select id="source-filter" class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">All Sources</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Discord">Discord</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Email">Email</option>
                        <option value="X/Twitter">X/Twitter</option>
                        <option value="Community Forum">Community Forum</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                    <select id="time-filter" class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="all">All Time</option>
                        <option value="24h">Past 24 Hours</option>
                        <option value="7d">Past Week</option>
                        <option value="30d">Past 30 Days</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
                    <select id="sentiment-filter" class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select id="order-filter" class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
            <div class="mt-4">
                <button onclick="applyFilters()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Apply Filters
                </button>
                <button onclick="resetFilters()" class="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                    Reset
                </button>
            </div>
        </div>

        <div id="feedback-list" class="space-y-4">
            <div class="text-center py-8 text-gray-500">Loading feedback data...</div>
        </div>
    </div>
  `;
}

export function getAnalysisContent() {
  return `
    <div id="analysis-content">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Feedback Analysis</h2>
            <p class="text-gray-600">Deep dive into feedback patterns and trends</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Platform Distribution</h3>
                <div class="relative h-64">
                    <canvas id="platform-chart"></canvas>
                </div>
                <div id="platform-legend" class="mt-4 space-y-2"></div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Sentiment Trend Over Time</h3>
                <div class="relative h-64">
                    <canvas id="sentiment-chart"></canvas>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Spike Detection</h3>
            <div id="spike-detection" class="space-y-4">
                <div class="text-center py-8 text-gray-500">Loading spike detection data...</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Keyword Frequency</h3>
                <div id="keyword-list" class="space-y-2">
                    <div class="text-center py-8 text-gray-500">Loading analysis data...</div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-4">Most Frequent Feedback</h3>
                <div id="frequent-feedback" class="space-y-3">
                    <div class="text-center py-8 text-gray-500">Loading frequent feedback...</div>
                </div>
            </div>
        </div>
    </div>
  `;
}

export function getChatboxContent() {
  return `
    <div id="chatbox-content">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h2>
            <p class="text-gray-600">Ask questions about your feedback data</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Chat Area -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow">
                    <div class="border-b px-6 py-4">
                        <h3 class="text-lg font-semibold">Conversation</h3>
                    </div>
                    <div id="chat-messages" class="h-96 overflow-y-auto p-6 space-y-4">
                        <div class="text-center py-8 text-gray-500">
                            <div class="mb-2">🤖</div>
                            <div>AI Assistant ready! Ask me anything about your feedback data.</div>
                        </div>
                    </div>
                    <div class="border-t px-6 py-4">
                        <div class="flex space-x-2">
                            <input type="text" id="chat-input" placeholder="Type your message..." 
                                class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <button onclick="sendMessage()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Suggested Prompts -->
            <div>
                <div class="bg-white rounded-lg shadow">
                    <div class="border-b px-6 py-4">
                        <h3 class="text-lg font-semibold">Suggested Prompts</h3>
                    </div>
                    <div class="p-6 space-y-3">
                        <button onclick="sendPrompt('What are the main issues users are reporting?')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            What are the main issues users are reporting?
                        </button>
                        <button onclick="sendPrompt('Show me positive feedback from the last week')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            Show me positive feedback from the last week
                        </button>
                        <button onclick="sendPrompt('Which platform has the most negative feedback?')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            Which platform has the most negative feedback?
                        </button>
                        <button onclick="sendPrompt('What are the trending topics in user feedback?')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            What are the trending topics in user feedback?
                        </button>
                        <button onclick="sendPrompt('Summarize feedback sentiment trends')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            Summarize feedback sentiment trends
                        </button>
                        <button onclick="sendPrompt('What improvements do users suggest most?')" 
                            class="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                            What improvements do users suggest most?
                        </button>
                    </div>
                </div>

                <!-- Chat History -->
                <div class="bg-white rounded-lg shadow mt-6">
                    <div class="border-b px-6 py-4">
                        <h3 class="text-lg font-semibold">Chat History</h3>
                    </div>
                    <div id="chat-history" class="p-6 space-y-2 max-h-64 overflow-y-auto">
                        <div class="text-sm text-gray-500">No previous conversations</div>
                    </div>
                    <div class="border-t px-6 py-4">
                        <button onclick="clearChatHistory()" class="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                            Clear History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}
