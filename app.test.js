const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

const {
    searchBooks,
    fetchBooks,
    displayResults,
    addToFavorites,
    displayTBRList
} = require('./assets/js/app.js');
const { waitFor } = require('@testing-library/dom');

describe('searchBooks', () => {
    beforeEach(() => {
        fetch.resetMocks();
        document.body.innerHTML = `
            <input type="text" id="search-input" value="test" />
            <div id="results-section"></div>
        `;
    });

    test('alerts if search term is empty', () => {
        document.body.innerHTML = '<input type="text" id="search-input" value="" />';
        window.alert = jest.fn();

        searchBooks();

        expect(window.alert).toHaveBeenCalledWith('Please enter a search term');
    });

    test('fetches and displays results', async () => {
        const mockResponse = {
            items: [
                {
                    volumeInfo: {
                        title: 'Test Book',
                        authors: ['Author 1'],
                        imageLinks: { thumbnail: 'test.jpg' },
                        infoLink: 'http://example.com'
                    }
                }
            ]
        };

        fetch.mockResponseOnce(JSON.stringify(mockResponse));

        await searchBooks();

        const resultsSection = document.getElementById('results-section');
        await waitFor(() => {
            expect(resultsSection.innerHTML).toContain('Test Book');
        });
    });

    test('handles invalid data from API gracefully', async () => {
        const mockResponse = {
            items: [
                {
                    volumeInfo: {
                        // Missing title and authors
                        imageLinks: { thumbnail: 'test.jpg' },
                        infoLink: 'http://example.com'
                    }
                }
            ]
        };

        fetch.mockResponseOnce(JSON.stringify(mockResponse));

        await searchBooks();

        const resultsSection = document.getElementById('results-section');
        await waitFor(() => {
            expect(resultsSection.innerHTML).toContain('undefined');
            expect(resultsSection.innerHTML).toContain('Unknown Author');
        });
    });
});

describe('addToFavorites', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<div id="tbr-list"></div>';
    });

    test('adds a book to TBR list', () => {
        const event = { stopPropagation: jest.fn() };
        const button = document.createElement('button');
        addToFavorites(event, 'Test Book', 'Author 1', 'test.jpg', 'http://example.com', button);

        const tbrList = JSON.parse(localStorage.getItem('tbrList'));
        expect(tbrList).toHaveLength(1);
        expect(tbrList[0].title).toBe('Test Book');
        expect(button.classList.contains('btn-success')).toBe(true);
        expect(button.disabled).toBe(true);
    });

    test('prevents duplicate books in TBR list', () => {
        const event = { stopPropagation: jest.fn() };
        const button = document.createElement('button');
        addToFavorites(event, 'Test Book', 'Author 1', 'test.jpg', 'http://example.com', button);
        addToFavorites(event, 'Test Book', 'Author 1', 'test.jpg', 'http://example.com', button);

        const tbrList = JSON.parse(localStorage.getItem('tbrList'));
        expect(tbrList).toHaveLength(1);
    });
});

describe('displayTBRList', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<div id="tbr-list"></div>';
    });

    test('displays the TBR list', () => {
        const tbrList = [
            { title: 'Test Book', author: 'Author 1', image: 'test.jpg', link: 'http://example.com' }
        ];
        localStorage.setItem('tbrList', JSON.stringify(tbrList));

        displayTBRList();

        const tbrSection = document.getElementById('tbr-list');
        expect(tbrSection.innerHTML).toContain('Test Book');
    });

    test('displays an empty list when there are no TBR items', () => {
        displayTBRList();

        const tbrSection = document.getElementById('tbr-list');
        expect(tbrSection.innerHTML).toBe('');
    });
});
