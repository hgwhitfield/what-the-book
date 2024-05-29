function searchBooks() {
    const searchText = document.getElementById('search-input').value;
    if (searchText.trim() === '') {
        alert('Please enter a search term');
        return;
    }
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchText)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayResults(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayResults(data) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = '';

    if (!data.items) {
        resultsSection.innerHTML = '<p>No books found.</p>';
        return;
    }

    data.items.forEach(item => {
        const book = item.volumeInfo;
        const bookElement = document.createElement('div');
        bookElement.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'col-xs-12', 'book-item');

        // Create the HTML structure for the book item
        bookElement.innerHTML = `
            <div class="card h-100" onclick="window.open('${book.infoLink || book.previewLink}', '_blank')">
                <figure>
                    <img src="${book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x200'}" class="card-img-top" alt="${book.title} cover image">
                    <figcaption>${book.title} by ${book.authors ? book.authors.join(', ') : 'Unknown Author'}</figcaption>
                </figure>
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-outline-primary btn-block" onclick="addToFavorites(event, '${book.title}', '${book.authors ? book.authors.join(', ') : 'Unknown Author'}', '${book.imageLinks ? book.imageLinks.thumbnail : 'https://via.placeholder.com/128x200'}', '${book.infoLink || book.previewLink}')" aria-label="Add ${book.title} to To Be Read list">Add to TBR</button>
                </div>
            </div>
        `;

        resultsSection.appendChild(bookElement);
    });
}

function addToFavorites(event, title, author, image, link) {
    event.stopPropagation(); // Prevent the click event from propagating to the card
    let tbrList = JSON.parse(localStorage.getItem('tbrList')) || [];
    if (tbrList.some(book => book.title === title)) {
        alert('This book is already in your TBR list.');
        return;
    }

    tbrList.push({ title, author, image, link });
    localStorage.setItem('tbrList', JSON.stringify(tbrList));
    displayTBRList();
}

function displayTBRList() {
    const tbrList = JSON.parse(localStorage.getItem('tbrList')) || [];
    const tbrSection = document.getElementById('tbr-list');
    tbrSection.innerHTML = '';

    tbrList.forEach(book => {
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
            </div>
        `;
        tbrSection.appendChild(bookElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayTBRList();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchBooks();
        }
    });
});

module.exports = {
    searchBooks,
    displayResults,
    addToFavorites,
    displayTBRList
};