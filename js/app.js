(function() {

/**
 * ------------------------------------------------------------------------
 * Treehouse Full Stack Java Script Techdegree
 *
 * Project 5
 * Build a Movie Search App with the OMDb API
 * ------------------------------------------------------------------------
 */


// Module variable declaration
var api = 'https://www.omdbapi.com'; // OMDb API

/**
 * ------------------------------------------------------------------------
 * XHR Calls
 * ------------------------------------------------------------------------
 */

/**
 * Returns a OMDb search object containing the search results
 * for the requested query string
 */
function searchMovie(api, searchString, searchYear) {
  // This function returns a promise
  return new Promise(function(resolve, reject) {
    // Build query string to include the search string
    // and the optional year if the user provides it
    var queryString = '/?s=' + searchString + '&plot=short&r=json';
    if (searchYear) {
      queryString += '&y=' + searchYear;
    }

    // Build the XHR object and make the call
    var xhr = new XMLHttpRequest();
    xhr.open('GET', api + queryString);
    xhr.onreadystatechange = handleResponse;
    xhr.onerror = function(err) {
      reject(err);
    };
    xhr.send();

    // Handle the XHR response
    function handleResponse() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          if (!response.Search) {
            var error = { noResults : true, search : searchString };
            reject(error);
          } else {
            resolve(response);
          }
        } else {
          reject(this.statusText);
        }
      }
    }
  });
}



/**
 * Returns and OMDb movie object containing detailed information
 * about a particular movie associated with an IMDB ID
 */
function getMovieDetails(api, imdbID) {
  // This function returns a promise
  return new Promise(function(resolve, reject) {
    // Build the XHR object and make the call
    var xhr = new XMLHttpRequest();
    xhr.open('GET', api + '/?plot=full&i=' + imdbID);
    xhr.onreadystatechange = handleResponse;
    xhr.onerror = function(err) {
      reject(err);
    };
    xhr.send();

    // Handle the XHR response
    function handleResponse() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(this.statusText);
        }
      }
    }
  });
}




/**
 * ------------------------------------------------------------------------
 * UI Behaviour
 * ------------------------------------------------------------------------
 */

/**
 * Generates the LI elements for each of the movie returned by the OMDb search
 */
function generateMovieList(results) {
  var html = '';
  // console.log(results);
  // Iterates over all search results and generates an LI element for each
  // Limit to maximum 8 results for neater layout
  for (var i = 0; i < results.Search.length && i < 8; i++) {
    var movie = results.Search[i];
    html += '<li data-imdb="' + movie.imdbID + '">' +
              '<div class="poster-wrap">';

    // Append image placeholder if the movie doesn't have a poster
    if (movie.Poster === 'N/A') {
      html += '<i class="material-icons poster-placeholder">crop_original</i>';
    } else {
      html += '<img class="movie-poster" src="' + movie.Poster + '">';
      // html += '<img class="movie-poster" src="img/sample.jpg">';
    }

    html +=   '</div>' +
              '<span class="movie-title">' + movie.Title + '</span>' +
              '<span class="movie-year">' + movie.Year + '</span>' +
            '</li>';
  }
  return html;
}


/**
 * Updates the page #movies element with a list of LIs
 */
function updateMovieList(list) {
  $('#movies').empty().append(list);
  $('#movies li').click(function(event) {
    event.preventDefault();
    var imdbID = $(this).attr('data-imdb');
    moreDetails(imdbID);
  });
}


/**
 * Generates an error message and updates the #movies page element
 */
function displayError(error) {
  var htmlError = '';

  // Generate appropriate Error message
  // If no results were found matching the search string
  if (error.noResults) {
    htmlError =
    '<li class="no-movies">' +
    '<i class="material-icons icon-help">help_outline</i>' +
    'No movies found that match: ' + error.search +
    '</li>';

  // If an XHR error occured, display a generic error message
  } else {
    htmlError =
    '<li class="no-movies">' +
      '<i class="material-icons icon-help">help_outline</i>' +
      'An error has occurred while retrieving the information.' +
    '</li>';
  }

  // Update the page with the error message
  $('#movies').empty().append(htmlError);
}


///
// User Interactivity
///


/**
 * Performs a movie search when the user clicks the search button
 */
$('#submit').click(function(event) {
  event.preventDefault();

  // Remove any movie details modal window if present
  $('.movie-details').fadeOut(100).remove();
  $('#movies').fadeIn(100);

  var searchText = $('#search').val();
  var searchYear = $('#year').val();
  searchMovie(api, searchText, searchYear)
      .then(generateMovieList)
      .then(updateMovieList)
      .catch(displayError);
});


/**
 * Clicking on a movie element, opens up detailed information
 * about that movie
 */
function moreDetails(imdbID) {
  var htmlLoading = '<div class="movie-details">' +
                      '<div class="movie-load">' +
                        '<h2 class="message">Retrieving information...</h2>' +
                      '</div>' +
                    '</div>';


  // Helper function to generate the movie detail markup
  function generatePageDetail(movie) {

    var moviePoster = movie.Poster === 'N/A'? 'img/no-media.svg' : movie.Poster;
    var html = '<div class="movie-close"><a href="#">Search results</a></div>' +
               '<div class="movie-poster"><img src="' + moviePoster + '" alt=""></div>' +
               '<div class="movie-info">' +
                 '<h2><a href="http://imdb.com/title/' + movie.imdbID + '">' + movie.Title + ' (' + movie.Year + ')</a></h2>' +
                 '<h3>IMDB Rating: ' + movie.imdbRating + '</h3>' +
                 '<div class="movie-plot">' +
                   '<h4>Plot synopsis:</h4>' +
                   '<p>' + movie.Plot + '</p>' +
                 '</div>' +
                 '<a href="http://imdb.com/title/' + movie.imdbID + '" class="movie-imdb-link" target="_blank">View on IMDB</a>' +
               '</div>';
    return html;
  }

  // Helper function to display the rendered page detail
  function updatePageDetail(html) {
    // Remove the loading message
    $('.movie-load').remove();
    $('.movie-details').append($(html).hide().fadeIn(100));
    $('.movie-close').click(function(event) {
      event.preventDefault();
      closeMovieDetails();
    });
  }

  // Helper function to close the detail page and bring back the movie list
  function closeMovieDetails() {
    $('.movie-details').fadeOut(100).remove();
    $('#movies').fadeIn(100);
  }

  // Hide the movie list and display loading message
  $('#movies').hide();
  $('body').append(htmlLoading);

  // Make the AJAX call to fetch information for movie ID
  getMovieDetails(api, imdbID)
    .then(generatePageDetail)
    .then(updatePageDetail)
    .catch(closeMovieDetails);
}

})();
