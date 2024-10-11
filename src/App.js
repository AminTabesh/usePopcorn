import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorage.js";
import { useKey } from "./useKey.js";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "f8d30ffd";

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [query, setQuery] = useState("");
  const { movies, isLoading, error } = useMovie(query);
  const [selectedID, setSelectedID] = useState(null);

  function clickHandler(id) {
    selectedID === id ? handleClose() : setSelectedID(id);
  }

  function handleClose() {
    setSelectedID(null);
  }

  function handleAdd(movie) {
    setWatched((watched) => [...watched, movie]);
    setSelectedID(null);
  }

  function handleRemove(id) {
    const newWatched = watched.filter((mov) => mov.imdbID !== id);
    setWatched(newWatched);
  }

  return (
    <>
      <Navbar>
        <Logo />
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box movies={movies}>
          {isLoading && error && <ErrorMessage message={error} />}
          {isLoading && !error && <Loader />}
          {!isLoading && (
            <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie
                  movie={movie}
                  key={movie.imdbID}
                  onClick={clickHandler}
                />
              ))}
            </ul>
          )}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovie={handleClose}
              onAddMovie={handleAdd}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onRemove={handleRemove} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function MovieDetails({ selectedID, onCloseMovie, onAddMovie, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const dupArray = watched.filter((m) => m.imdbID === selectedID);
  const isDuplicate = dupArray.length !== 0;
  const decisionCounter = useRef(0);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleRate(num) {
    setUserRating(num);
  }
  function addToList() {
    const newMovie = {
      imdbID: selectedID,
      imdbRating: Number(imdbRating),
      poster,
      title,
      year,
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      decisionsCount: decisionCounter.current,
    };
    onAddMovie(newMovie);
  }

  useEffect(
    function () {
      if (userRating) decisionCounter.current++;
    },
    [userRating]
  );

  useKey(8, onCloseMovie);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${selectedID}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (title) document.title = "Movie | " + title;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <div className="rating mt-10 w-11/12">
            {isDuplicate ? (
              <p>Already rated with {dupArray[0].userRating} ⭐.</p>
            ) : (
              <>
                <StarRating
                  maxRating={10}
                  starSize="24px"
                  textSize="20px"
                  color="rgb(253, 216, 53)"
                  onSetRating={handleRate}
                />

                {userRating > 0 && (
                  <button className="btn-add" onClick={addToList}>
                    Add to list
                  </button>
                )}
              </>
            )}
          </div>

          <section>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey(13, function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    console.log('focus');
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movie({ movie, onClick }) {
  return (
    <li
      onClick={() => {
        onClick(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesList({ watched, onRemove }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onRemove={onRemove} />
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{parseFloat(avgImdbRating.toFixed(2))}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{parseFloat(avgUserRating.toFixed(2))}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{parseFloat(avgRuntime.toFixed(2))} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ movie, onRemove }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={() => {
          onRemove(movie.imdbID);
        }}
      >
        &times;
      </button>
    </li>
  );
}
