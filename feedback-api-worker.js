// Cloudflare Worker - API for D1 Database
// Deploy this to Cloudflare Workers (not Pages)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(path, request, env);
    }

    // For non-API routes, return info
    return new Response('Feedback API Worker - Use with Pages dashboard', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Handle API requests - connects to your D1 database
async function handleApiRequest(path, request, env) {
  try {
    // Check if database binding exists
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        error: 'Database not configured. Please add D1 binding in Worker settings.',
        setup: 'Variable name: DB, Select your 150-feedbacks database'
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

// Database query functions - connects to your 150-feedbacks table
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
