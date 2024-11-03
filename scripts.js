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

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})