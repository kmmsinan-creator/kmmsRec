// Initialize application when window loads
window.onload = async function() {
    // Load data first
    const success = await loadData();
    
    if (success) {
        // Then populate the dropdown and update status
        populateMoviesDropdown();
        document.getElementById('result').textContent = 
            'Data loaded. Please select a movie.';
        document.getElementById('result').className = 'success';
    }
};

/**
 * Populate the movie dropdown with sorted movie titles
 */
function populateMoviesDropdown() {
    const selectElement = document.getElementById('movie-select');
    
    // Clear the default option
    selectElement.innerHTML = '';
    
    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a movie...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectElement.appendChild(defaultOption);
    
    // Sort movies alphabetically by title
    const sortedMovies = [...movies].sort((a, b) => 
        a.title.localeCompare(b.title)
    );
    
    // Add each movie as an option
    sortedMovies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        selectElement.appendChild(option);
    });
}

/**
 * Main function to calculate and display recommendations
 */
function getRecommendations() {
    // Step 1: Get user input
    const selectedMovieId = parseInt(document.getElementById('movie-select').value);
    
    // Validate selection
    if (isNaN(selectedMovieId)) {
        document.getElementById('result').textContent = 
            'Please select a movie first.';
        document.getElementById('result').className = 'error';
        return;
    }
    
    // Step 2: Find the liked movie
    const likedMovie = movies.find(movie => movie.id === selectedMovieId);
    if (!likedMovie) {
        document.getElementById('result').textContent = 
            'Error: Selected movie not found.';
        document.getElementById('result').className = 'error';
        return;
    }
    
    // Show loading state
    document.getElementById('result').textContent = 
        `Finding recommendations for "${likedMovie.title}"...`;
    document.getElementById('result').className = 'loading';
    
    // Use setTimeout to allow the UI to update before heavy computation
    setTimeout(() => {
        // Step 3: Prepare for similarity calculation
        const likedGenres = new Set(likedMovie.genres);
        const candidateMovies = movies.filter(movie => movie.id !== likedMovie.id);
        
        // Step 4: Calculate Jaccard similarity scores
        const scoredMovies = candidateMovies.map(candidate => {
            const candidateGenres = new Set(candidate.genres);
            
            // Calculate intersection
            const intersection = new Set(
                [...likedGenres].filter(genre => candidateGenres.has(genre))
            );
            
            // Calculate union
            const union = new Set([...likedGenres, ...candidateGenres]);
            
            // Jaccard similarity = |Intersection| / |Union|
            const score = union.size > 0 ? intersection.size / union.size : 0;
            
            return {
                ...candidate,
                score: score
            };
        });
        
        // Step 5: Sort by score (descending)
        scoredMovies.sort((a, b) => b.score - a.score);
        
        // Step 6: Select top recommendations
        const topRecommendations = scoredMovies.slice(0, 2);
        
        // Step 7: Display results
        if (topRecommendations.length > 0) {
            const recommendationTitles = topRecommendations.map(movie => movie.title);
            document.getElementById('result').innerHTML = `
                <strong>Because you liked "${likedMovie.title}", we recommend:</strong><br>
                • ${recommendationTitles.join('<br>• ')}
            `;
            document.getElementById('result').className = 'success';
        } else {
            document.getElementById('result').textContent = 
                'No recommendations found.';
            document.getElementById('result').className = 'error';
        }
    }, 10);
}
