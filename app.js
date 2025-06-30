const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Question = require('./models/question');
const TFIDF = require('./utils/tfidf');

const app = express();
const port = 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


let tfidf; // Will be initialized after DB fetch

async function initializeTFIDF() {
  try {
    const questions = await Question.find();
    const documents = questions.map(q => ({
      content: q.content,
      tokens: q.content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    }));
    tfidf = new TFIDF(documents);
    console.log('TF-IDF initialized with documents from MongoDB.');
    app.listen(port, () => {
      console.log(`Search engine running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error loading documents from MongoDB:', err);
    process.exit(1);
  }
}

// Define the highlightTerms function
function highlightTerms(text, query) {
  if (!query) return text;
  // Escape regex special chars in each term
  const terms = query.split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return text;
  const regex = new RegExp('(' + terms.join('|') + ')', 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Routes
app.get('/', (req, res) => res.render('index'));

app.get('/search', (req, res) => {
  const query = req.query.query;
  if (!tfidf) {
    return res.status(503).send('TF-IDF not initialized yet. Try again in a moment.');
  }
  const results = tfidf.search(query);
  res.render('results', { 
    query: query,
    results: results,
    highlightTerms // Pass the function!
  });
});

// Start initialization (and, after that, the server)
initializeTFIDF();
