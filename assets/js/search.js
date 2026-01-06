// Simple Search Implementation for Jekyll Blog
(function() {
  'use strict';

  // Only run on search page
  if (!window.location.pathname.includes('/search/')) return;

  const searchResults = document.getElementById('searchResults');
  const searchQuery = document.getElementById('searchQuery');

  if (!searchResults || !searchQuery) return;

  function fuzzyMatch(query, text) {
    if (!query || !text) return { score: 0, matches: [] };

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Check for exact match first (highest score)
    const exactIndex = textLower.indexOf(queryLower);
    if (exactIndex !== -1) {
      return {
        score: 1000,
        matches: [exactIndex, exactIndex + queryLower.length],
        isExact: true
      };
    }

    // Check for word boundary matches
    const wordBoundaryRegex = new RegExp('\\b' + queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const wordMatch = textLower.match(wordBoundaryRegex);
    if (wordMatch) {
      return {
        score: 800,
        matches: [wordMatch.index, wordMatch.index + queryLower.length],
        isExact: true
      };
    }

    return { score: 0, matches: [] };
  }

  function highlightMatches(text, query, matches = null) {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  function searchPosts(query) {
    if (!query.trim()) return [];

    const results = [];

    searchData.forEach(post => {
      const titleMatch = fuzzyMatch(query, post.title);
      const contentMatch = fuzzyMatch(query, post.content);

      if (titleMatch.score > 0 || contentMatch.score > 0) {
        let totalScore = 0;
        let highlightedTitle = post.title;
        let highlightedExcerpt = post.excerpt;

        if (titleMatch.score > 0) {
          totalScore += titleMatch.score * 3;
          highlightedTitle = highlightMatches(post.title, query);
        }

        if (contentMatch.score > 0) {
          totalScore += contentMatch.score;
          highlightedExcerpt = highlightMatches(post.excerpt, query);
        }

        results.push({
          ...post,
          score: totalScore,
          highlightedTitle,
          highlightedExcerpt
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  function displayResults(results, query) {
    if (!query) {
      searchQuery.innerHTML = '';
      searchResults.innerHTML = '<div class="search-hint">Enter a search term in the URL (?q=your-search)</div>';
      return;
    }

    searchQuery.innerHTML = `<p>Search results for: <strong>${query}</strong></p>`;

    if (results.length === 0) {
      searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-title">No results found</div>
                    <div>Try different keywords or check spelling</div>
                </div>
            `;
    } else {
      const resultsHTML = results.map(post => `
                <article class="search-result">
                    <h2><a href="${post.url}">${post.highlightedTitle}</a></h2>
                    <div class="search-result-date">${post.date}</div>
                    <div class="search-result-excerpt">${post.highlightedExcerpt}</div>
                </article>
            `).join('');
      searchResults.innerHTML = resultsHTML;
    }
  }

  // Get query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';

  // Perform search and display results
  const results = searchPosts(query);
  displayResults(results, query);
})();
