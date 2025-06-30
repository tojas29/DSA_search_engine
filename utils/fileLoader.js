const fs = require('fs');
const path = require('path');

module.exports = {
    loadDocuments: (directory) => {
        const files = fs.readdirSync(directory);
        return files.map(file => {
            const content = fs.readFileSync(path.join(directory, file), 'utf-8');
            return {
                id: path.parse(file).name,
                content: content,
                tokens: content.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
            };
        });
    }
};