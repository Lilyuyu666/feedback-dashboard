# Feedback Dashboard

A complete Cloudflare D1 feedback dashboard with real-time data visualization and AI assistant.

## � Quick Start

### Prerequisites
- Node.js 16+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd feedback-dashboard

# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create feedback_150

# Update wrangler.toml with your database_id
# (Copy the database_id from the output above)

# Deploy to Cloudflare Workers
npm run deploy
```

## 📁 Project Structure

```
feedback-dashboard/
├── worker.js              # Main entry point
├── api-handler.js         # API request handling
├── database-queries.js    # D1 database operations
├── dashboard-html.js      # HTML generation
├── page-templates.js      # Page HTML templates
├── dashboard-scripts.js   # Frontend JavaScript
├── wrangler.toml          # Cloudflare configuration
├── package.json           # Node.js dependencies
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## � Configuration

### 1. D1 Database Setup
```bash
# Create database
wrangler d1 create feedback_150

# Create table
wrangler d1 execute feedback_150 --command "
CREATE TABLE IF NOT EXISTS feedback_150 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    platform TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"

# Insert sample data (optional)
wrangler d1 execute feedback_150 --command "
INSERT INTO feedback_150 (content, platform, sentiment) VALUES 
('Great product! Love the new features.', 'Discord', 'positive'),
('Having issues with the login process.', 'GitHub', 'negative'),
('Excellent customer support!', 'Email', 'positive');
"
```

### 2. Update wrangler.toml
Replace the empty `database_id` with your actual database ID from the creation step.

### 3. Deploy
```bash
npm run deploy
```

## 📊 Features

- **Real-time Metrics**: Total feedback, time-based counts, sentiment breakdown
- **Advanced Filtering**: Filter by source, time, sentiment, and order
- **Data Visualization**: Pie charts and line graphs
- **AI Assistant**: Interactive chat with suggested prompts
- **Trending Keywords**: Most mentioned topics in feedback
- **Platform Distribution**: Visual breakdown by source
- **Spike Detection**: Identify unusual activity patterns

## 📱 Pages

1. **Home** (`/`): Overview with metrics and AI insights
2. **Feedbacks** (`/feedbacks`): Raw feedback with advanced filtering
3. **Analysis** (`/analysis`): Charts and data visualization
4. **AI Assistant** (`/chatbox`): Interactive chat interface

## 📝 API Endpoints

- `GET /api/metrics` - Dashboard metrics
- `GET /api/feedback` - Raw feedback data
- `GET /api/analysis` - Analysis data

## �️ Development

```bash
# Start development server
npm run dev

# View logs
npm run tail

# Access D1 console
npm run d1:console
```

## 📈 Database Schema

```sql
CREATE TABLE feedback_150 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    platform TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Technologies Used

- **Cloudflare Workers**: Serverless backend
- **Cloudflare D1**: SQLite database
- **Tailwind CSS**: Modern UI framework
- **Canvas API**: Chart rendering
- **JavaScript ES6**: Modern frontend

## � Deployment

The project is ready for GitHub deployment with:
- ✅ `wrangler.toml` configuration
- ✅ `package.json` with scripts
- ✅ `.gitignore` for clean commits
- ✅ Modular file structure
- ✅ Complete documentation

### GitHub + Cloudflare Pages Integration

1. Push to GitHub
2. Connect repository to Cloudflare Pages
3. Set build command: `npm install`
4. Set output directory: `.` (root)
5. Add D1 binding in Pages settings

## 📞 Support

Built with ❤️ using Cloudflare Workers and D1.
