import { useState, useEffect } from "react";

const key = "f8d30ffd";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );

          const data = await res.json();
          if (!res.ok) throw new Error("Something went wrong!");
          if (data.Response === "False") throw new Error("No movie found!");
          setMovies(data.Search);
          setIsLoading(false);
        } catch (err) {
          // console.log(err);
        }
      }
      if (query.length < 3) {
        setError("");
        setIsLoading(false);
        setMovies([]);
        return;
      }
      //   handleClose();
      fetchMovies();
      return function () {
        controller.abort("");
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
