const fs = require('fs');
const path = require('path');

const playbook = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/playbook.json'), 'utf8'));

const getSuggestions = (bottlenecks) => {
  const suggestions = {};
  bottlenecks.forEach(b => {
    if (playbook[b.name]) {
      suggestions[b.name] = playbook[b.name];
    }
  });
  return suggestions;
};

module.exports = { getSuggestions };
