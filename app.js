const express = require("express");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const convertDbobjectToResponse = (dbobject) => {
  return {
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};

const initialiseDbandserver = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initialiseDbandserver();

//API 1
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie ORDER BY movie_id;`;
  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) => convertDbobjectToResponse(eachMovie))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)
        VALUES 
            ( ${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await database.run(postMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(movie);
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
        UPDATE 
            movie
        SET 
            director_id=${directorId},
            movie_name='${movieName}',
            lead_actor='${leadActor}'
        WHERE 
            movie_id=${movieId}`;
  await database.run(addMovieQuery);
  response.send("movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const deleteMovieQuery = `
        DELETE FROM  
            movie
        WHERE 
            movie_id=${movieId}`;
  await database.run(deleteMovieQuery);
  response.send("movie Deleted Successfully");
});

//APi 6

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorArray = await database.all(getDirectorQuery);
  response.send(directorArray);
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId, movies } = request.params;
  const getMovieQuery = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
    director_id=${directorId} AND movie_name=${movies};`;
  const movie = await database.get(getMovieQuery);
  response.send(movie);
});
module.exports = app;
