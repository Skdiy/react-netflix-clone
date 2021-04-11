import axios from '../../backend/axios';
import React, {useState, useEffect} from 'react';
import YouTube from "react-youtube";
import movieTrailer from "movie-trailer";
import './Row.css';

const base_url = "https://image.tmdb.org/t/p/original/";
const API_KEY = "dab74b47f4aaa7d1fd4a16ca76c13c20";

export default function Row({title, fetchUrl, isLargeRow = false }) {
    const [movies, setMovies] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState("");
   

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    },[fetchUrl]);

    async function getYoutubeId(movie) {
      try {
        const response = await axios.get(
          `tv/${movie?.id}/videos?api_key=${API_KEY}`
        );
        if (!response) {
          return null;
        }
  
        var i;
        var obj = response.data.results;
        for (i = 0; i < obj.length; i++) {
          if (obj[i].type === "Trailer" && obj[i].iso_639_1 === "en") {
            return `https://www.youtube.com/watch?v=${obj[i].key}`;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    /* Video play options with react-youtube*/
    const opts = {
      height: "390",
      width: "100%",
      playerVars: {
        autoplay: 1,
      },
    };

    /* Grab youtube video using react-youtube * movie-trailer*/
    const handleClick = (movie) => {
      if (trailerUrl) {
        setTrailerUrl("");
      } else {
        if (!movie.hasOwnProperty("video")) {
          // this means we ask TMDB for youtube video key
          getYoutubeId(movie).then((url) => {
            if (!url) {
              return null;
            }
            const urlParams = new URLSearchParams(new URL(url).search);
            setTrailerUrl(urlParams.get("v"));
          });
        } else {
          movieTrailer(movie?.name || movie?.original_title || "", {
            apiKey: "dab74b47f4aaa7d1fd4a16ca76c13c20",
          }) // add an OR and call TMDB here with movie?.id/videos?api_key###
            .then((url) => {
              const urlParams = new URLSearchParams(new URL(url).search);
              setTrailerUrl(urlParams.get("v"));
            })
            .catch((error) => console.log(error));
        }
      }
    };

    return (
        <div className="row">
            <h2>{title}</h2>
            <div className="row__posters">
                {movies.map(movie => (
                    ((isLargeRow && movie.poster_path) ||
                    (!isLargeRow && movie.backdrop_path)) && (
                        <img
                        className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                        key={movie.id}
                        onClick={() => handleClick(movie)}
                        src={`${base_url}${
                            isLargeRow ? movie.poster_path : movie.backdrop_path
                        }`}
                        alt={movie.name}/>
                    )
                ))}
            </div>
            {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
        </div>
    );
}
