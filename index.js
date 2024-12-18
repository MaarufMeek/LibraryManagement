// Toast Function
// This function displays temporary notifications on the UI.


function showToast(message, type = "info") {
    const toastElement = document.getElementById("toast");
    const toastBody = toastElement.querySelector(".toast-body");

    toastBody.textContent = message;

    // Set the toast color based on alert type
    const toastHeader = toastElement.querySelector(".toast-header");
    if (type === "success") {
        toastHeader.classList.add("bg-success");
        toastHeader.classList.remove("bg-danger", "bg-warning");
    } else if (type === "error") {
        toastHeader.classList.add("bg-danger");
        toastHeader.classList.remove("bg-success", "bg-warning");
    } else {
        toastHeader.classList.add("bg-warning");
        toastHeader.classList.remove("bg-danger", "bg-success");
    }

    // Show the toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
//----------------------------------------------------------------------------------------------------------------------

// Helper to manage dynamic book content display
function displayOutput(content) {
    document.getElementById('output').innerHTML = content;
}

// Helper to clear input fields
function clearInputs(ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}
//----------------------------------------------------------------------------------------------------------------------


// Book Class
// Represents an individual book with its properties and actions
class Book {
    constructor(title, author, pubYear) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.author = author;
        this.pubYear = pubYear;
        this.isBorrowed = false;
    }


    getTitle() {
        return this.title;
    }

    getAuthor() {
        return this.author;
    }

    getPubYear() {
        return this.pubYear;
    }

    getIsBorrowed() {
        return this.isBorrowed;
    }

    borrow_book() {
        if (!this.isBorrowed) {
            this.isBorrowed = true;
        }
    }

    return_book() {
        if (this.isBorrowed) {
            this.isBorrowed = false;
        }
    }
    //------------------------------------------------------------------------------------------------------------------

    // Generates an HTML row representation of the book
    display_book() {
        return `<tr>
                <td>${this.title}</td>
                <td>${this.author}</td>
                <td>${this.pubYear}</td>
                <td>${this.isBorrowed ? 'Borrowed' : 'Available'}</td>
                <td>
                    <div class="text-end pd-r">
                        <!-- Delete button with label & trash icon -->
                        <button class="btn btn-danger btn-sm"
                                data-action="delete"
                                data-id="${this.id}">
                            <span class="d-none d-md-inline">Delete</span>  <!-- only displays on md, lg -->
                            <i class="bi bi-trash"></i>
                        </button>
            
                        <!-- Borrow/Return button with label & icons -->
                       <button class="btn btn-${this.isBorrowed ? 'success' : 'primary'} btn-sm"
                                data-action="${this.isBorrowed ? 'return' : 'borrow'}"
                                data-id="${this.id}">
                                <span class="d-none d-md-inline">${this.isBorrowed ? 'Return' : 'Borrow'}</span>
                            <i class="bi ${this.isBorrowed ? 'bi-arrow-return-left' : 'bi-bookmark-plus'}"></i>
                        </button>

                        <!-- Edit button with label & icon -->
                         <button class="btn btn-warning btn-sm" 
                                 data-action="edit"
                                 data-id="${this.id}">
                                <span class="d-none d-md-inline">Edit</span>
                            <i class="bi bi-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }
}

// ___________________________________End of Book Class_________________________________________________________________


// Library Class
// Manages a collection of books and operations on them
class Library {
    constructor() {
        this.books = this.loadBooksFromLocalStorage();
    }

    //------------------------------------------------------------------------------------------------------------------

    saveBooksToLocalStorage() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.books))
    }

    //------------------------------------------------------------------------------------------------------------------

    loadBooksFromLocalStorage() {
        const booksJson = localStorage.getItem('libraryBooks');
        if (booksJson) {
            const booksData = JSON.parse(booksJson);
            return booksData.map(bookData => {
                const book = new Book(bookData.title, bookData.author, bookData.pubYear);
                book.id = bookData.id;
                book.isBorrowed = bookData.isBorrowed; // Ensures borrowed state is restored
                return book;
            });
        }

        return [];
    }

    //------------------------------------------------------------------------------------------------------------------


    add_Book(title, author, pubYear) {
        const inputs = document.querySelectorAll('.form-control');
        const inputFields = [
            {id: 'title', name: title},
            {id: 'author', name: author},
            {id: 'year', name: pubYear}
        ];

        let isValidInput = true;

        //Reset all input error states
        inputs.forEach(input => {
            input.classList.remove('input-error')
        });

        //validate input fields
        inputFields.forEach(field => {
            if (!field.name) {
                document.getElementById(field.id).classList.add('input-error')
                isValidInput = false;
            }
        })

        if (!isValidInput) {
            showToast("You must enter all properties of a book", "info");
            return;
        }

        //Add book
        const newBook = new Book(title, author, pubYear);
        this.books.push(newBook);
        this.saveBooksToLocalStorage()
        showToast(`${title} by ${author} has been added to the library.`, "success");
    }

    //------------------------------------------------------------------------------------------------------------------

    delete_Book(bookId) {
        if (this.books.length === 0) {
            showToast("Sorry, there are no books in the library.", "info");
            return;
        }
        if (!bookId) {
            showToast("Invalid book ID", "info");
            return;
        }

        //get index of the book to delete
        const index = this.books.findIndex(book => book.id === bookId);
        const bookName = this.books[index].title;

        if (index !== -1) {
            this.books.splice(index, 1);
            showToast(`${bookName} has been deleted from the library.`, "success");
            this.saveBooksToLocalStorage();
            return;
        }

        showToast(`Does not match any books in the library.`, "error");
    }

    //------------------------------------------------------------------------------------------------------------------


    // Pass optional book param display a specific book (for instance the result of a search)
    display_Books(books = this.books) {
        if (books.length === 0) {
            showToast("No books in the library to display.", "info");
            return '';
        }

        const tableHeader = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Year</th>
                        <th>Availability</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>`;
        const tableRows = books.map(book => book.display_book()).join('');
        const tableFooter = `
                </tbody>
            </table>
        </div>`;
        return tableHeader + tableRows + tableFooter;
    }

    //------------------------------------------------------------------------------------------------------------------


    edit_Book(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) {
            showToast('Book not found', 'error');
            return;
        }

        // Display edit form
        this.showEditContainer();

        //Populate edit form with book's details
        document.getElementById('newTitle').value = book.getTitle();
        document.getElementById('newAuthor').value = book.getAuthor();
        document.getElementById('newYear').value = book.getPubYear();

        // Store the current book's id for reference
        // document.querySelector('.edit-container')
        //     .setAttribute('data-book-id', bookId)

        // Save changes when submit button is clicked
        document.getElementById('editSubmit').addEventListener('click',
            function (e) {
                e.preventDefault();
                saveBookEdits(bookId);
            })
    }

    showEditContainer() {
        document.querySelector('.overlay').style.display = 'block'
        document.querySelector('.edit-container').style.display = 'flex'

    }

    //------------------------------------------------------------------------------------------------------------------


    borrow_Book(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) {
            showToast(`Does not match any books in the library`, 'error');
            return;
        }
        if (book.getIsBorrowed()) {
            showToast(`${book.title} is already borrowed`, 'info');
            return;
        }
        book.borrow_book();
        this.saveBooksToLocalStorage(); // Save state here
        showToast(`${book.title} has been borrowed successfully`, 'success');
    }

    //------------------------------------------------------------------------------------------------------------------

    return_Book(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) {
            showToast(`${book.title} does not match any books in the library`, 'error');
            return;
        }
        if (!book.getIsBorrowed()) {
            showToast(`${book.title} is not currently borrowed`, 'info');
            return;
        }
        book.return_book();
        this.saveBooksToLocalStorage(); // Save state here
        showToast(`${book.title} has been returned successfully`, 'success');
    }

    //------------------------------------------------------------------------------------------------------------------

    search_Book(query) {
        if (!query || query.trim === '') {
            showToast('Enter the name of the book', 'info');
            return;
        }

        const results = this.books.filter(book =>
            book.getTitle().toLowerCase().includes(query.toLowerCase()) ||
            book.getAuthor().toLowerCase().includes(query.toLowerCase())
        );

        if (results.length > 0) {
            const resultHtml = this.display_Books(results);
            displayOutput(resultHtml);
        } else {
            showToast(`No books found matching "${query}".`, "info");
        }
    }
}

//___________________________________End of Library Class_______________________________________________________________


// Initialize Library instance
const library = new Library();

//-----------------------Event Handlers---------------------------------------------------------------------------------

// Handler for saving a new book
const bookSaveHandler = document.getElementById('saveBook');
bookSaveHandler.addEventListener('click', e => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = parseInt(document.getElementById('year').value);
    library.add_Book(title, author, year);
    clearInputs(['title', 'author', 'year']);
    if (library.books.length > 0 && (title && author && year)) displayBooks();
})


//----------------------------------------------------------------------------------------------------------------------

// Handler for searching book
const searchBookHandler = document.getElementById('submitSearch');
searchBookHandler.addEventListener('click', e => {
    e.preventDefault();

    const query = document.getElementById('searchQuery').value;
    library.search_Book(query);
    clearInputs(['searchQuery']);
})


//----------------------------------------------------------------------------------------------------------------------
//Handler for displaying all books
const displayBooksHandler = document.getElementById('displayAll');
displayBooksHandler.addEventListener("click", e => {
    e.preventDefault();
    displayBooks()
})



function displayBooks() {
    const result = library.display_Books();
        displayOutput(result);
}

//----------------------------------------------------------------------------------------------------------------------


function saveBookEdits(bookId) {
    // Get new book details
    const newTitle = document.getElementById('newTitle').value.trim();
    const newAuthor = document.getElementById('newAuthor').value.trim();
    const newYear = document.getElementById('newYear').value.trim();

    // Validate fields
    if (!newTitle || !newAuthor || !newYear) {
        showToast('All fields must be filled', 'error');
        return;
    }

    if (isNaN(newYear) || newYear < 0) {
        showToast('Year must be a valid number', 'error');
        return;
    }

    // Find the book by ID
    const bookIndex = library.books.findIndex(book => book.id === bookId);
    if (bookIndex === -1) {
        showToast('Book not found', 'error');
        return;
    }

    // Update book details
    const book = library.books[bookIndex];
    book.title = newTitle;
    book.author = newAuthor;
    book.pubYear = parseInt(newYear, 10);

    // Save to local storage
    try {
        library.saveBooksToLocalStorage();
        showToast('Book details updated!', 'success');
        displayBooks();
    } catch (error) {
        console.error('Failed to save changes:', error);
        showToast('Failed to save changes. Please try again.', 'error');
        return;
    }

    // Close the edit container
    closeEditContainer();
}

//----------------------------------------------------------------------------------------------------------------------


//-----------------------Action Handlers--------------------------------------------------------------------------------
//Delete Handler
document
    .getElementById('output')
    .addEventListener("click", function (e) {
        // Find the closest button with the class 'btn-danger'
        const deleteBtn = e.target.closest('button[data-action="delete"]');
        if(!deleteBtn) return;

        const bookId = deleteBtn.getAttribute('data-id')
        deleteBookById(bookId)
    });

//Borrow/Return Handler
document
    .getElementById('output')
    .addEventListener("click", function(e) {
        const actionBtn = e.target.closest('button[data-action]');
        if(!actionBtn) return;

        const action = actionBtn.getAttribute('data-action');
        const bookId = actionBtn.getAttribute('data-id');

        if(action === 'borrow') borrowBookById(bookId)
        else if(action === 'return') returnBookById(bookId)
    })


//Edit Handler
document
    .getElementById('output')
    .addEventListener("click", function(e) {
        const editBtn = e.target.closest('button[data-action="edit"]')
        if(!editBtn) return;

        const bookId = editBtn.getAttribute('data-id');
        editBookByID(bookId)
    })

//
function closeEditContainer() {
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('.edit-container').style.display = 'none';
}

//----------------------------------------------------------------------------------------------------------------------


// close Edit container
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
    document.querySelector('.edit-container').style.display = 'none'
    document.querySelector('.overlay').style.display = 'none'
})
//----------------------------------------------------------------------------------------------------------------------

//Clear All books stored in local storage
const clearBtn = document.getElementById('clearBookData');

clearBtn.addEventListener('click', () => {
    if (library.books.length === 0) {
        showToast('No books stored in local storage', 'info');
    } else {
        localStorage.clear();
        library.books = [];
        displayBooks();
        showToast('All Book data cleared from Local Storage', 'success');
    }
});
//----------------------------------------------------------------------------------------------------------------------

//Remove 'input-error' when the user starts typing
document
    .querySelectorAll('.form-control')
    .forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '' || null) {
                input.classList.remove('input-error')
            }
        })
    })

//----------------------------------------------------------------------------------------------------------------------

function deleteBookById(bookId) {
    library.delete_Book(bookId);
    displayBooks(); // Refresh the table after deletion
}

function borrowBookById(bookId) {
    library.borrow_Book(bookId);
    displayBooks();
}

function returnBookById(bookId) {
    library.return_Book(bookId);
    displayBooks();
}

function editBookByID(bookId) {
    library.edit_Book(bookId)
    displayBooks();
}



