import { useEffect, useState, useCallback } from 'react';
import MovieCard from './Moviecard';
import './App.css';
import SearchIcon from './search.svg';
import { createPortal } from 'react-dom';
import MovieDetails from './MovieDetails';

const API_URL = process.env.REACT_APP_MOVIES_API_URL;

const App = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('search');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('');
  const [exactMatch, setExactMatch] = useState(false);

  const getRandomGenre = useCallback(() => {
    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Sci-Fi', 'Fantasy'];
    const randomIndex = Math.floor(Math.random() * genres.length);
    return genres[randomIndex];
  }, []);

  const searchMovies = useCallback(async (title, genreFilter = '', currentPage = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}&s=${encodeURIComponent(title)}&type=movie&genre=${genreFilter}&page=${currentPage}`);
      const data = await response.json();

      if (data.Search) {
        const filteredMovies = exactMatch
          ? data.Search.filter(movie =>
              movie.Title.toLowerCase() === title.toLowerCase()
            )
          : data.Search.filter(movie =>
              movie.Title.toLowerCase().includes(title.toLowerCase())
            );

        if (currentPage === 1) {
          setMovies(filteredMovies);
        } else {
          setMovies(prevMovies => [...prevMovies, ...filteredMovies]);
        }
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [exactMatch]);

  const searchExactMovie = useCallback(async (title) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}&t=${encodeURIComponent(title)}`);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies([data]);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching exact movie:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = useCallback(() => {
    setPage(1);
    if (exactMatch) {
      searchExactMovie(searchTerm);
    } else {
      searchMovies(searchTerm, genre, 1);
    }
  }, [exactMatch, searchTerm, genre, searchMovies, searchExactMovie]);

  const addToWatchlist = useCallback((movie) => {
    if (!watchlist.some((item) => item.imdbID === movie.imdbID)) {
      const updatedList = [...watchlist, movie];
      setWatchlist(updatedList);
      localStorage.setItem('watchlist', JSON.stringify(updatedList));
    }
  }, [watchlist]);

  const removeFromWatchlist = useCallback((id) => {
    const updatedList = watchlist.filter((movie) => movie.imdbID !== id);
    setWatchlist(updatedList);
    localStorage.setItem('watchlist', JSON.stringify(updatedList));
  }, [watchlist]);

  useEffect(() => {
    const randomGenre = getRandomGenre();
    setGenre(randomGenre);
    setSearchTerm(randomGenre);
    searchMovies(randomGenre, randomGenre, 1);
  }, [getRandomGenre, searchMovies]);

  const loadMoreMovies = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchMovies(searchTerm, genre, nextPage);
  }, [page, searchTerm, genre, searchMovies]);

  const handleGenreChange = useCallback((e) => {
    const selectedGenre = e.target.value;
    setGenre(selectedGenre);
    setSearchTerm(selectedGenre);
    setPage(1);
    searchMovies(selectedGenre, selectedGenre, 1);
  }, [searchMovies]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const handleMovieClick = useCallback(async (movie) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}&i=${movie.imdbID}&plot=full`);
      const data = await response.json();
      if (data.Response === "True") {
        setSelectedMovie(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <div className="app">
      <h1>PlayVault</h1>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button
            className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            Watchlist
          </button>
        </div>
        <div
          className="tab-indicator"
          style={{
            transform: activeTab === 'search' ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />
      </div>

      <div className="search-container">
        <div className="search">
          <input
            placeholder="Search for movies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <img
            src={SearchIcon}
            alt="search"
            onClick={handleSearch}
          />
        </div>

        <div className="genre-filter">
          <select
            value={genre}
            onChange={handleGenreChange}
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Thriller">Thriller</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Fantasy">Fantasy</option>
          </select>
        </div>
      </div>

      <div className="search-options">
        <label className="custom-toggle">
          <input
            type="checkbox"
            checked={exactMatch}
            onChange={() => setExactMatch(!exactMatch)}
          />
          <span className="slider"></span>
          <span className="label-text">Exact Match</span>
        </label>
      </div>

      {activeTab === 'search' && (
        <div className="tab-content fade-in">
          {movies?.length > 0 ? (
            <>
              <div className="container">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    onMovieClick={handleMovieClick}
                    addToWatchlist={addToWatchlist}
                    removeFromWatchlist={removeFromWatchlist}
                    isWatchlistItem={false}
                    watchlist={watchlist}
                  />
                ))}
              </div>
              {!exactMatch && (
                <div className="load-more-container">
                  {!loading && movies.length > 0 && (
                    <button className="load-more" onClick={loadMoreMovies}>
                      Load More
                    </button>
                  )}
                  {loading && <p>Loading...</p>}
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <h2>No Movies Found!</h2>
            </div>
          )}
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div className="tab-content fade-in">
          {watchlist.length > 0 ? (
            <div className="container">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  removeFromWatchlist={removeFromWatchlist}
                  isWatchlistItem={true}
                  watchlist={watchlist}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>Your Watchlist is Empty!</h2>
            </div>
          )}
        </div>
      )}
      {showDetails && selectedMovie && createPortal(
  <MovieDetails 
    movie={selectedMovie} 
    onClose={() => setShowDetails(false)}
    addToWatchlist={addToWatchlist}
    removeFromWatchlist={removeFromWatchlist}
    isInWatchlist={watchlist.some(m => m.imdbID === selectedMovie.imdbID)}
  />,
  document.body
)}
    </div>
  );
};

export default App;
