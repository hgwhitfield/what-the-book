/* global module */

/**
 * Handles the search for books based on the input from the user.
 */
function searchBooks() {
    const searchText = document.getElementById('search-input').value;
    if (searchText.trim() === '') {
        alert('Please enter a search term');
        return;
    }

    fetchBooks(searchText)
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            displayErrorMessage('Failed to fetch data. Please try again later.');
        });
}

/**
 * Fetches books from the Google Books API.
 * @param {string} searchText - The text to search for.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
function fetchBooks(searchText) {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchText)}`)
        .then(response => response.json());
}

/**
 * Displays the search results on the page.
 * @param {Object} data - The data returned from the Google Books API.
 */
function displayResults(data) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = '';

    if (!data.items) {
        resultsSection.innerHTML = '<p>No books found.</p>';
        return;
    }

    const tbrList = getTBRList();
    data.items.forEach(item => {
        const book = item.volumeInfo;
        const isAdded = tbrList.some(b => b.title === book.title);
        const bookElement = createBookElement(book, isAdded);
        resultsSection.appendChild(bookElement);
    });
}

/**
 * Creates an HTML element for a book.
 * @param {Object} book - The book information.
 * @param {boolean} isAdded - Indicates if the book is already in the TBR list.
 * @returns {HTMLElement} The created book element.
 */
function createBookElement(book, isAdded) {
    const bookElement = document.createElement('div');
    bookElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'col-xs-12', 'book-item');

    const imageUrl = book.imageLinks ? book.imageLinks.thumbnail.replace('http://', 'https://') : 'https://via.placeholder.com/128x200';

    bookElement.innerHTML = `
        <div class="card h-100" onclick="window.open('${book.infoLink || book.previewLink}', '_blank')">
            <figure>
                <img src="${imageUrl}" class="card-img-top" alt="${book.title} cover image">
                <figcaption>${book.title} by ${book.authors ? book.authors.join(', ') : 'Unknown Author'}</figcaption>
            </figure>
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text">${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
            </div>
            <div class="card-footer">
                <button class="btn ${isAdded ? 'btn-success' : 'btn-outline-primary'} btn-block" onclick="addToFavorites(event, '${book.title}', '${book.authors ? book.authors.join(', ') : 'Unknown Author'}', '${imageUrl}', '${book.infoLink || book.previewLink}', this)" aria-label="Add ${book.title} to To Be Read list" ${isAdded ? 'disabled' : ''}>${isAdded ? 'Added' : 'Add to TBR'}</button>
            </div>
        </div>
    `;

    return bookElement;
}

/**
 * Adds a book to the "To Be Read" (TBR) list.
 * @param {Event} event - The event object.
 * @param {string} title - The title of the book.
 * @param {string} author - The author(s) of the book.
 * @param {string} image - The URL of the book's cover image.
 * @param {string} link - The URL to the book's information page.
 * @param {HTMLElement} button - The button element.
 */
function addToFavorites(event, title, author, image, link, button) {
    event.stopPropagation(); // Prevent the click event from propagating to the card
    let tbrList = getTBRList();

    if (tbrList.some(book => book.title === title)) {
        alert('This book is already in your TBR list.');
        return;
    }

    tbrList.push({ title, author, image, link });
    saveTBRList(tbrList);
    updateTBRButton(button, true);
    displayTBRList();
}

/**
 * Removes a book from the "To Be Read" (TBR) list.
 * @param {string} title - The title of the book to remove.
 */
function removeFromFavorites(title) {
    let tbrList = getTBRList();
    tbrList = tbrList.filter(book => book.title !== title);
    saveTBRList(tbrList);
    displayTBRList();
    refreshSearchResults();
}

/**
 * Updates the TBR button after a book has been added or removed.
 * @param {HTMLElement} button - The button element.
 * @param {boolean} isAdded - Whether the book is being added or removed.
 */
function updateTBRButton(button, isAdded) {
    if (isAdded) {
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-success');
        button.innerText = 'Added';
        button.disabled = true;
    } else {
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-primary');
        button.innerText = 'Add to TBR';
        button.disabled = false;
    }
}

/**
 * Retrieves the TBR list from local storage.
 * @returns {Array<Object>} The TBR list.
 */
function getTBRList() {
    return JSON.parse(localStorage.getItem('tbrList')) || [];
}

/**
 * Saves the TBR list to local storage.
 * @param {Array<Object>} tbrList - The TBR list to save.
 */
function saveTBRList(tbrList) {
    localStorage.setItem('tbrList', JSON.stringify(tbrList));
}

/**
 * Displays the TBR list on the page.
 */
function displayTBRList() {
    const tbrList = getTBRList();
    const tbrSection = document.getElementById('tbr-list');
    tbrSection.innerHTML = '';

    tbrList.forEach(book => {
        const bookElement = createTBRBookElement(book);
        tbrSection.appendChild(bookElement);
    });
}

/**
 * Creates an HTML element for a TBR book.
 * @param {Object} book - The book information.
 * @returns {HTMLElement} The created TBR book element.
 */
function createTBRBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'col-xs-12', 'tbr-item');

    bookElement.innerHTML = `
        <div class="card h-100" onclick="window.open('${book.link}', '_blank')">
            <figure>
                <img src="${book.image}" class="card-img-top" alt="${book.title} cover image">
                <figcaption>${book.title} by ${book.author}</figcaption>
            </figure>
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text">${book.author}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-danger btn-block" onclick="removeFromFavorites('${book.title}'); event.stopPropagation();">Remove from List</button>
            </div>
        </div>
    `;

    return bookElement;
}

/**
 * Refreshes the search results to update the TBR button state.
 */
function refreshSearchResults() {
    const searchText = document.getElementById('search-input').value;
    if (searchText.trim() !== '') {
        fetchBooks(searchText)
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                displayErrorMessage('Failed to fetch data. Please try again later.');
            });
    }
}

/**
 * Displays an error message on the page.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = `<p class="text-danger">${message}</p>`;
}

// Set up the page when it loads
document.addEventListener('DOMContentLoaded', () => {
    displayTBRList();

    // Add event listener to the search input field for the Enter key
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchBooks();
        }
    });
});

// Exports for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        searchBooks,
        fetchBooks,
        displayResults,
        addToFavorites,
        removeFromFavorites,
        displayTBRList
    };
}
