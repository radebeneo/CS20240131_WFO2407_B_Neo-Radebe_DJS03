import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

const BookApp = {
        // Application properties
        books: books,           // Array of book objects
        authors: authors,       // Author data
        genres: genres,         // Genre data
        currentPage: 1,         // Tracks the current page in pagination
        filteredBooks: books,   // Books after applying filters

        // Initializes the application by setting up UI and event listeners
        init() {
            this.populateDropdown('[data-search-genres]', this.genres, 'All Genres');    // Populate genre dropdown
            this.populateDropdown('[data-search-authors]', this.authors, 'All Authors'); // Populate author dropdown
            this.renderBookList();    // Render initial book list
            this.setupEventListeners();    // Attach event listeners
            this.applyTheme();    // Set theme based on user preference
        },  

        // Populates a dropdown with options based on provided data
        populateDropdown(selector, data, defaultOption) {
            const dropdown = document.querySelector(selector);
            dropdown.innerHTML = `<option value="any">${defaultOption}</option>`; // Add default option
            for (const [id, name] of Object.entries(data)) {
                dropdown.innerHTML += `<option value="${id}">${name}</option>`; // Populate dropdown
            }
        },

        // Renders a list of books to the UI based on the current page
        renderBookList(page = 1) {
            const start = (page - 1) * BOOKS_PER_PAGE;
            const end = start + BOOKS_PER_PAGE;
            const fragment = document.createDocumentFragment();

            // Create book preview buttons for each book in the current page slice
            this.filteredBooks.slice(start, end).forEach(({ author, id, image, title }) => {
                const element = document.createElement('button');
                element.classList = 'preview';
                element.setAttribute('data-preview', id);
                element.innerHTML = `
                    <img class="preview__image" src="${image}" />
                    <div class="preview__info">
                        <h3 class="preview__title">${title}</h3>
                        <div class="preview__author">${this.authors[author]}</div>
                    </div>
                `;
                fragment.appendChild(element);
            });

            const listItems = document.querySelector('[data-list-items]');
            listItems.innerHTML = '';    // Clear previous items
            listItems.appendChild(fragment);    // Append new items

            // Update the "Show More" button state and remaining book count
            const listButton = document.querySelector('[data-list-button]');
            listButton.disabled = this.filteredBooks.length <= page * BOOKS_PER_PAGE;
            listButton.innerHTML = `
                <span>Show more</span>
                <span class="list__remaining"> (${Math.max(0, this.filteredBooks.length - page * BOOKS_PER_PAGE)})</span>
            `;
        },


    // Sets up event listeners for various UI actions
    setupEventListeners() {
        // Search form submission
        document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            this.applyFilters(Object.fromEntries(formData));
        });

        // Show more buttons for pagination
        document.querySelector('[data-list-button]').addEventListener('click', () => {
            this.currentPage++;
            this.renderBookList(this.currentPage);
        });

        // Book preview click event to display book details
        document.querySelector('[data-list-items]').addEventListener('click', (event) => {
            const previewId = event.target.closest('.preview')?.dataset.preview;
            if (previewId) this.showBookDetails(previewId);
        });

        // Event to close the search overlay
        document.querySelector('[data-search-cancel]').addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').open = false;
        });

        // Event to close the settings overlay
        document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').open = false;
        });

        // Event to open the search overlay
        document.querySelector('[data-header-search]').addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').open = true;
            document.querySelector('[data-search-title]').focus();
        });

        // Event to open the settings overlay
        document.querySelector('[data-header-settings]').addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').open = true;
        });

        // Settings form submission to change theme
        document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const { theme } = Object.fromEntries(formData);
            this.updateTheme(theme);
            document.querySelector('[data-settings-overlay]').open = false;
        });
    },

    // Applies filters to the book list based on user inputs
    applyFilters(filters) {
        const titleFilter = filters.title.trim().toLowerCase();
        const genreFilter = filters.genre;
        const authorFilter = filters.author;

        // Filter books based on title, genre, and author
        this.filteredBooks = this.books.filter(book => {
            const matchesTitle = !titleFilter || book.title.toLowerCase().includes(titleFilter);
            const matchesGenre = genreFilter === 'any' || book.genres.includes(genreFilter);
            const matchesAuthor = authorFilter === 'any' || book.author === authorFilter;
            return matchesTitle && matchesGenre && matchesAuthor;
        });

        this.currentPage = 1;  // Reset to the first page after applying filters
        this.renderBookList(this.currentPage);  // Render filtered book list

        // Show or hide "no results" message based on filter results
        document.querySelector('[data-list-message]').classList.toggle(
            'list__message_show', this.filteredBooks.length === 0
        );
    },

    // Displays detailed information for a selected book
    showBookDetails(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (!book) return;

        // Update the details overlay with the selected book's information
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = book.image;
        document.querySelector('[data-list-image]').src = book.image;
        document.querySelector('[data-list-title]').innerText = book.title;
        document.querySelector('[data-list-subtitle]').innerText = `${this.authors[book.author]} (${new Date(book.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = book.description;
    },

    // Applies the preferred theme based on user's system settings or previous selection
    applyTheme() {
        const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
        this.updateTheme(theme);  // Set theme based on system preference
    },

    // Updates theme colors for dark or light mode
    updateTheme(theme) {
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
    }
};

// Initialize the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => BookApp.init());