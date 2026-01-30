// API Handler - Database queries and API endpoints
import { getFeedbackFromDB, getMetricsFromDB, getAnalysisFromDB } from './database-queries.js';

export async function handleApiRequest(path, request, env) {
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
