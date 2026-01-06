// Fuzzy Search Implementation for Jekyll Blog
(function() {
    'use strict';

    // DOM elements
    const searchIcon = document.getElementById('searchIcon');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchResults = document.getElementById('searchResults');

    let isSearchOpen = false;

    // Fuzzy search algorithm
    function fuzzySearch(query, text) {
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        
        // Exact match gets highest score
        if (textLower.includes(queryLower)) {
            return {
                score: 100,
                matches: highlightMatches(text, query)
            };
        }

        // Fuzzy matching
        let queryIndex = 0;
        let score = 0;
        let matches = [];
        
        for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
            if (textLower[i] === queryLower[queryIndex]) {
                matches.push(i);
                score += queryLower.length - queryIndex;
                queryIndex++;
            }
        }
        
        if (queryIndex === queryLower.length) {
            return {
                score: score,
                matches: matches
            };
        }
        
        return null;
    }

    function highlightMatches(text, query) {
        if (!query) return text;
        
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        
        // For exact matches, highlight the entire match
        const exactIndex = textLower.indexOf(queryLower);
        if (exactIndex !== -1) {
            return text.substring(0, exactIndex) + 
                   '<span class="search-highlight">' + 
                   text.substring(exactIndex, exactIndex + query.length) + 
                   '</span>' + 
                   text.substring(exactIndex + query.length);
        }
        
        return text;
    }

    function searchPosts(query) {
        if (!query.trim()) {
            return [];
        }

        const results = [];
        
        searchData.forEach(post => {
            const titleMatch = fuzzySearch(query, post.title);
            const contentMatch = fuzzySearch(query, post.content);
            
            if (titleMatch || contentMatch) {
                let totalScore = 0;
                let highlightedTitle = post.title;
                let highlightedExcerpt = post.excerpt;
                
                if (titleMatch) {
                    totalScore += titleMatch.score * 3; // Title matches are more important
                    highlightedTitle = highlightMatches(post.title, query);
                }
                
                if (contentMatch) {
                    totalScore += contentMatch.score;
                    highlightedExcerpt = highlightMatches(post.excerpt, query);
                }
                
                results.push({
                    ...post,
                    score: totalScore,
                    highlightedTitle: highlightedTitle,
                    highlightedExcerpt: highlightedExcerpt
                });
            }
        });
        
        // Sort by score (highest first)
        return results.sort((a, b) => b.score - a.score);
    }

    function displayResults(results, query) {
        if (!query.trim()) {
            searchResults.innerHTML = '<div class="search-hint">Start typing to search posts...</div>';
            return;
        }

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <div class="no-results-title">No results found</div>
                    <div>Try different keywords or check your spelling</div>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(post => `
            <a href="${post.url}" class="search-result">
                <div class="search-result-title">${post.highlightedTitle}</div>
                <div class="search-result-date">${post.date}</div>
                <div class="search-result-excerpt">${post.highlightedExcerpt}</div>
            </a>
        `).join('');

        searchResults.innerHTML = resultsHTML;
    }

    function openSearch() {
        if (isSearchOpen) return;
        
        isSearchOpen = true;
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus input after animation
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    function closeSearch() {
        if (!isSearchOpen) return;
        
        isSearchOpen = false;
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
        displayResults([], '');
    }

    function handleSearch() {
        const query = searchInput.value;
        const results = searchPosts(query);
        displayResults(results, query);
    }

    // Event listeners
    searchIcon.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);

    // Close on overlay click (but not on container click)
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSearchOpen) {
            closeSearch();
        }
    });

    // Search input handling with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearch, 200);
    });

    // Handle Enter key in search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstResult = searchResults.querySelector('.search-result');
            if (firstResult) {
                window.location.href = firstResult.href;
            }
        }
    });

    // Initialize
    displayResults([], '');
})();