class TFIDF {
    constructor(documents) {
        this.documents = documents; // Array of { content, tokens }
        this.terms = [];
        this.df = {}; // Document frequency storage
        this.tfidfVectors = [];
        this.preprocess();
    }

    preprocess() {
        // Calculate document frequency
        const df = {};
        this.documents.forEach(doc => {
            new Set(doc.tokens).forEach(term => {
                df[term] = (df[term] || 0) + 1;
            });
        });

        // Store important values
        this.df = df;
        this.terms = Object.keys(df).sort();
        const N = this.documents.length;

        // Calculate TF-IDF vectors
        this.tfidfVectors = this.documents.map(doc => {
            const tf = {};
            doc.tokens.forEach(term => {
                tf[term] = (tf[term] || 0) + 1;
            });

            const vector = this.terms.map(term => {
                const tfValue = (tf[term] || 0) / doc.tokens.length;
                const idfValue = Math.log(N / (df[term] || 1));
                return tfValue * idfValue;
            });

            return {
                vector: vector,
                magnitude: Math.sqrt(vector.reduce((s, v) => s + v*v, 0))
            };
        });
    }

    search(query, topN = 5) {
        const queryTerms = query.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(Boolean);

        // Create query vector using proper DF values
        const queryVector = this.terms.map(term => {
            const tf = queryTerms.filter(t => t === term).length / (queryTerms.length || 1);
            const idf = Math.log(this.documents.length / (this.df[term] || 1));
            return tf * idf;
        });

        // Calculate query magnitude
        const queryMag = Math.sqrt(queryVector.reduce((s, v) => s + v*v, 0));

        // Calculate similarities
        const results = this.documents.map((doc, idx) => {
            const docVec = this.tfidfVectors[idx];
            let dotProduct = 0;
            
            for(let i = 0; i < queryVector.length; i++) {
                dotProduct += queryVector[i] * docVec.vector[i];
            }
            
            const magnitudeProduct = docVec.magnitude * queryMag;
            const similarity = magnitudeProduct > 0 ? dotProduct / magnitudeProduct : 0;

            return {
                similarity: similarity,
                content: doc.content
            };
        });

        return results
            .filter(r => r.similarity > 0)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topN);
    }
}

module.exports = TFIDF;
