// Toast Function
// This function displays temporary notifications on the UI.


function showToast(message, type = "info") {
    const toastElement = document.getElementById("toast");
    const toastBody = toastElement.querySelector(".toast-body");

    toastBody.textContent = message;

    // Set the toast color based on the type
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

// Helper to manage dynamic book content display
function displayOutput(content) {
    document.getElementById('output').innerHTML = content;
}

// Helper to clear input fields
function clearInputs(ids) {
    ids.forEach(id => document.getElementById(id).value = '');
}

// Index Class
// Represents an individual book with its properties and actions
class Book {
    constructor(title, author, pubYear) {
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

    // Generates an HTML row representation of the book
    display_book() {
        return `<tr>
                <td>${this.title}</td>
                <td>${this.author}</td>
                <td>${this.pubYear}</td>
                <td>${this.isBorrowed ? 'Borrowed' : 'Available'}</td>
                <td>
                    <div class="text-end pd-r">
                        <!-- Button for larger screens (hidden on small screens) -->
                        <button class="btn btn-danger btn-sm d-none d-md-inline" 
                            onclick="deleteBooksByTitle('${this.title}')">
                            Delete <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-${this.isBorrowed ? 'success' : 'primary'} btn-sm d-none d-md-inline" 
                            onclick="${
            this.isBorrowed
                ? `returnBookByTitle('${this.title}')`
                : `borrowBookByTitle('${this.title}')`
        }">
                            ${this.isBorrowed ? 'Return' : 'Borrow'} 
                            <i class="bi ${this.isBorrowed ? 'bi-arrow-return-left' : 'bi-bookmark-plus'}"></i>
                        </button>

                        <!-- Icons for smaller screens -->
                        <button class="btn btn-danger btn-sm d-inline d-md-none" 
                            onclick="deleteBooksByTitle('${this.title}')">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-${this.isBorrowed ? 'success' : 'primary'} btn-sm d-inline d-md-none" 
                            onclick="${
            this.isBorrowed
                ? `returnBookByTitle('${this.title}')`
                : `borrowBookByTitle('${this.title}')`
        }">
                            <i class="bi ${this.isBorrowed ? 'bi-arrow-return-left' : 'bi-bookmark-plus'}"></i>
                        </button>
                        <button class="btn btn-warning btn-sm " onclick="editBookByTitle('${this.title}')">
                            Edit <i class="bi bi-pen"></i>
                        </button>

                    </div>
                </td>
            </tr>`;
    }
}

// Library Class
// Manages a collection of books and operations on them
class Library {
    constructor() {
        this.books = this.loadBooksFromLocalStorage();
    }

    saveBooksToLocalStorage() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.books))
    }

    loadBooksFromLocalStorage() {
        const booksJson = localStorage.getItem('libraryBooks');
        if (booksJson) {
            const booksData = JSON.parse(booksJson);
            return booksData.map(bookData => {
                const book = new Book(bookData.title, bookData.author, bookData.pubYear);
                book.isBorrowed = bookData.isBorrowed; // Ensure borrowed state is restored
                return book;
            });
        }
        return [];
    }


    add_Book(title, author, pubYear) {
        if (!title || !author || !pubYear) {
            showToast("You must enter all properties of a book", "info");
            return;
        }

        const newBook = new Book(title, author, pubYear);
        this.books.push(newBook);
        this.saveBooksToLocalStorage()
        showToast(`${title} by ${author} has been added to the library.`, "success");
    }


    delete_Book(name) {
        if (this.books.length === 0) {
            showToast("Sorry, there are no books in the library.", "info");
            return;
        }
        if (!name) {
            showToast("Enter the title of the book to delete", "info");
            return;
        }

        const index = this.books.findIndex(book => book.getTitle().toLowerCase() === name.toLowerCase());
        if (index !== -1) {
            this.books.splice(index, 1);
            this.saveBooksToLocalStorage();
            showToast(`${name} has been deleted from the library.`, "success");
            return;
        }
        showToast(`${name} does not match any books in the library.`, "error");
    }

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


    edit_Book(title) {
        const book = this.books.find(b => b.getTitle().toLowerCase() === title.toLowerCase());
        if (!book) {
            showToast('Borrow not found', 'error');
            return;
        }

        // Display edit form
        document.querySelector('.overlay').style.display = 'block'
        document.querySelector('.edit-container').style.display = 'flex'

        //Fill edit form with book's details
        document.getElementById('newTitle').value = book.getTitle();
        document.getElementById('newAuthor').value = book.getAuthor();
        document.getElementById('newYear').value = book.getPubYear();

        // Store the current book's title for reference
        document.querySelector('.edit-container').setAttribute('data-original-title', title)

        // Save changes when submit button is clicked
        document.getElementById('editSubmit').addEventListener('click',
            function (e){
                        e.preventDefault();
                        saveBookEdits();
            })

    }


    borrow_Book(title) {
        const book = this.books.find(b => b.getTitle().toLowerCase() === title.toLowerCase());
        if (!book) {
            showToast(`${title} does not match any books in the library`, 'error');
            return;
        }
        if (book.getIsBorrowed()) {
            showToast(`${title} is already borrowed`, 'info');
            return;
        }
        book.borrow_book();
        this.saveBooksToLocalStorage(); // Save state here
        showToast(`${title} has been borrowed successfully`, 'success');
    }

    return_Book(title) {
        const book = this.books.find(b => b.getTitle().toLowerCase() === title.toLowerCase());
        if (!book) {
            showToast(`${title} does not match any books in the library`, 'error');
            return;
        }
        if (!book.getIsBorrowed()) {
            showToast(`${title} is not currently borrowed`, 'info');
            return;
        }
        book.return_book();
        this.saveBooksToLocalStorage(); // Save state here
        console.log('Books after saving to storage: ', this.books)
        showToast(`${title} has been returned successfully`, 'success');
    }

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

// Initialize Library instance
const
    library = new Library();

// User Interaction Functions
function

addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = parseInt(document.getElementById('year').value);
    library.add_Book(title, author, year);
    clearInputs(['title', 'author', 'year']);
    if (library.books.length > 0 && (title && author && year)) displayBooks();
}

function

displayBooks() {
    const result = library.display_Books();
    displayOutput(result);
}

function

searchBook() {
    const query = document.getElementById('searchQuery').value;
    library.search_Book(query);
    clearInputs(['searchQuery']);
}



function saveBookEdits () {

    //Get title of original book
    const originalTitle = document
        .querySelector('.edit-container')
        .getAttribute('data-original-title')

    // Get new Book details
    const newTitle = document.getElementById('newTitle').value.trim();
    const newAuthor = document.getElementById('newAuthor').value.trim();
    const newYear = document.getElementById('newYear').value.trim();

    if(!newTitle || !newAuthor || !newYear){
        showToast('All fields must be filled', 'error')
        return;
    }

    // Find the original book
    const bookIndex = library.books.findIndex(book => book.getTitle().toLowerCase() === newTitle.toLowerCase())
    if(bookIndex === -1) {
        showToast('Original book not found', 'error');
        return;
    }

    //Update book details
    library.books[bookIndex].title = newTitle;
    library.books[bookIndex].author = newAuthor;
    library.books[bookIndex].pubYear = newYear;

    //Save to local storage

    library.saveBooksToLocalStorage();
    showToast('Book details updated!', 'success')
    displayBooks();

    //Close the edit Container
    closeEditContainer();
}

function closeEditContainer() {
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('.edit-container').style.display = 'none';
    document.querySelector('.edit-container').removeAttribute('data-original-title')
}

// close Edit container
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
    document.querySelector('.edit-container').style.display = 'none'
    document.querySelector('.overlay').style.display = 'none'
})




// Action Handlers for Buttons
function

deleteBooksByTitle(title) {
    library.delete_Book(title);
    displayBooks(); // Refresh the table after deletion
}

function borrowBookByTitle(title) {
    library.borrow_Book(title);
    displayBooks();
}

function returnBookByTitle(title) {
    library.return_Book(title);
    displayBooks();
}

function editBookByTitle(title) {
    library.edit_Book(title)
    displayBooks();
}

