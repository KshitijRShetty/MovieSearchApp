import { useCallback } from 'react';

const MovieCard = ({
  movie,
  onMovieClick,
  addToWatchlist,
  removeFromWatchlist,
  isWatchlistItem,
  watchlist
}) => {
  const isInWatchlist = watchlist.some((item) => item.imdbID === movie.imdbID);

  const handleWatchlistClick = useCallback((e) => {
    e.stopPropagation();
    if (isInWatchlist) {
      removeFromWatchlist(movie.imdbID);
    } else {
      addToWatchlist(movie);
    }
  }, [isInWatchlist, movie, addToWatchlist, removeFromWatchlist]);

  return (
    <div className="movie" onClick={() => onMovieClick(movie)}>
      <div>
        <p>{movie.Year}</p>
      </div>

      <div>
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={movie.Title}
        />
      </div>

      <div>
        <span>{movie.Type}</span>
        <h3>{movie.Title}</h3>
        
        <button
          className={`watchlist-btn ${isInWatchlist ? 'remove' : 'add'}`}
          onClick={handleWatchlistClick}
        >
          {isWatchlistItem ? 'Remove' : isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;