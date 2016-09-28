

// Module variable declaration
var api = 'http://www.omdbapi.com'; // OMDb API


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
    var queryString = '/?s=' + searchString + '&r=json';
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
    xhr.open('GET', api + '/?i=' + imdbID);
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
  // Iterates over all search results and generates an LI element for each
  for (var i = 0; i < results.Search.length; i++) {
    var movie = results.Search[i];
    html += '<li>' +
              '<div class="poster-wrap">';

    // Append image placeholder if the movie doesn't have a poster
    if (movie.Poster === 'N/A') {
      html += '<i class="material-icons poster-placeholder">crop_original</i>';
    } else {
      html += '<img class="movie-poster" src="' + movie.Poster + '">';
    }

    html +=   '</div>' +
              '<span class="movie-title">' + movie.Title + '</span>' +
              '<span class="movie-year">' + movie.Year + '</span>' +
            '</li>';
  }
  return html;
}


/**
 * Updates the page #movies element with a list of LI provided as the argument
 */
function updateMovieList(list) {
  $('#movies').empty().append(list);
}


/**
 * Generates an error message and updates the #movies page element
 */
function displayError(error) {
  var htmlError = '';
  // Generate appropriate Error message
  if (error.noResults) {
    // If no results were found matching the search string
    htmlError =
    '<li class="no-movies">' +
    '<i class="material-icons icon-help">help_outline</i>' +
    'No movies found that match: ' + error.search +
    '</li>';
  } else {
    // If an AJAX error occured
    htmlError =
    '<li class="no-movies">' +
      '<i class="material-icons icon-help">help_outline</i>' +
      'An error occurred while retrieving the information.' +
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
   var searchText = $('#search').val();
   var searchYear = $('#year').val();
   searchMovie(api, searchText, searchYear)
      .then(generateMovieList)
      .then(updateMovieList)
      .catch(displayError);
 });
