// Dashboard HTML Generator - All HTML content and templates
import { getHomeContent, getFeedbacksContent, getAnalysisContent, getChatboxContent } from './page-templates.js';

export function getDashboardHTML(currentPath) {
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
                            <a href="/" class="nav-link inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.home} text-sm font-medium">
                                Home
                            </a>
                            <a href="/feedbacks" class="nav-link inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.feedbacks} text-sm font-medium">
                                Feedbacks
                            </a>
                            <a href="/analysis" class="nav-link inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.analysis} text-sm font-medium">
                                Analysis
                            </a>
                            <a href="/chatbox" class="nav-link inline-flex items-center px-1 pt-1 border-b-2 ${activeNav.chatbox} text-sm font-medium">
                                AI Assistant
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div class="mr-4 text-sm text-green-600">
                            ✅ Connected to D1
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div id="content">
                    ${content}
                </div>
            </div>
        </main>
    </div>

    <script src="dashboard-scripts.js"></script>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
