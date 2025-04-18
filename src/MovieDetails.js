import { useEffect } from 'react';
import './App.css';

const MovieDetails = ({ movie, onClose, addToWatchlist, removeFromWatchlist, isInWatchlist }) => {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="movie-details">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        
        <div className="details-content">
          <div className="details-poster">
            <img 
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
              alt={movie.Title} 
            />
          </div>
          
          <div className="details-info">
            <h2>{movie.Title} ({movie.Year})</h2>
            <div className="details-meta">
              <span>{movie.Rated}</span>
              <span>{movie.Runtime}</span>
              <span>{movie.Genre}</span>
              {movie.imdbRating !== 'N/A' && (
                <span className="imdb-rating">
                  ⭐ {movie.imdbRating}/10
                </span>
              )}
            </div>
            
            <div className="details-plot">
              <h3>Plot</h3>
              <p>{movie.Plot}</p>
            </div>
            
            <div className="details-extra">
              <div>
                <h3>Director</h3>
                <p>{movie.Director}</p>
              </div>
              <div>
                <h3>Cast</h3>
                <p>{movie.Actors}</p>
              </div>
              <div>
                <h3>Awards</h3>
                <p>{movie.Awards !== 'N/A' ? movie.Awards : 'None'}</p>
              </div>
            </div>
            
            <button
              className={`watchlist-btn ${isInWatchlist ? 'remove' : 'add'}`}
              onClick={() => isInWatchlist ? removeFromWatchlist(movie.imdbID) : addToWatchlist(movie)}
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;