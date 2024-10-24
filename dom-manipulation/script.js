// catch elements---
const quoteDisplayDiv = document.getElementById("quoteDisplay"),
  newQuoteBtn = document.getElementById("newQuote"),
  exportQuotesBtn = document.getElementById("exportQuotes"),
  addFormQuote = document.getElementById("addFormQuote"),
  categoryFilterSelect = document.getElementById("categoryFilter");

let quotes = [];

// variable to check if form created--
let formCreated = false;

newQuoteBtn.addEventListener("click", showRandomQuote);
exportQuotesBtn.addEventListener("click", exportQuotesToJson);

// show form to add----
addFormQuote.addEventListener(
  "click",
  () => !formCreated && createAddQuoteForm()
);

function showRandomQuote() {
  // declare randomQuote--
  let randomQuote;

  // check if there is quotes in local storage first---
  if (localStorage.quotesData) {
    quotes = JSON.parse(localStorage.quotesData);
    randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplayDiv.textContent = `${randomQuote.text} (${randomQuote.category})`;
  }
  // else if (quotes.length > 0) {
  //     randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  //     quoteDisplayDiv.textContent = `${randomQuote.text} (${randomQuote.category})`;
  // }
  else {
    quoteDisplayDiv.textContent = "No quotes available. Please add a quote.";
    !formCreated && createAddQuoteForm();
  }
}

function addQuote() {
  // get elements-----
  const newQuoteTextInput = document.getElementById("newQuoteText"),
    newQuoteCategoryInput = document.getElementById("newQuoteCategory");

  // check on values are not empty----
  if (newQuoteTextInput.value && newQuoteCategoryInput.value) {
    // free quotes array---
    quotes = [];

    // get and push values---
    quotes.push({
      text: newQuoteTextInput.value.trim(),
      category: newQuoteCategoryInput.value.trim(),
    });

    // add quotes to local storage but first check----
    if (localStorage.quotesData) {
      let localQuotes = JSON.parse(localStorage.quotesData);
      localQuotes.push(...quotes);
      localStorage.quotesData = JSON.stringify(localQuotes);
    } else {
      localStorage.setItem("quotesData", JSON.stringify(quotes));
    }

    // show showRandomQuote--
    showRandomQuote();

    // add the new category to select---
    filterQuotes();

    // clear inputs--
    newQuoteTextInput.value = "";
    newQuoteCategoryInput.value = "";
  }
}

function createAddQuoteForm() {
  let formDiv = document.createElement("div");
  formDiv.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
  document.body.appendChild(formDiv);

  // form created-----
  formCreated = true;
}

function exportQuotesToJson() {
  // check if there are quotes in local storage---
  if (localStorage.getItem("quotesData")) {
    const data = JSON.stringify(localStorage.quotesData);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    quoteDisplayDiv.textContent = "No quotes to export";
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(JSON.parse(event.target.result));
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function saveQuotes() {
  localStorage.quotesData = JSON.stringify(quotes);
}

function populateCategories() {
  const categories = ["all"];
  quotes.forEach((quote) => {
    if (!categories.includes(quote.category)) {
      categories.push(quote.category);
    }
  });
  categoryFilterSelect.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
  const selectedCategory = localStorage.selectedCategory || "all";
  categoryFilterSelect.value = selectedCategory;
}

function filterQuote() {
  const selectedCategory = categoryFilterSelect.value;
  localStorage.selectedCategory = selectedCategory;
  showRandomQuote();
}

window.onload = () => {
  if (localStorage.quotesData) {
    quotes = JSON.parse(localStorage.quotesData);
    populateCategories();
    filterQuote();
  }
};

// Define a URL to simulate the server endpoint
const Serve_URL = "https://jsonplaceholder.typicode.com/posts";

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(Serve_URL);
    const serverQuotes = await response.json();
    return serverQuotes.map((q) => ({ text: q.body, category: "General" })); // Map the server response to match our data structure
  } catch {
    console.error("Error fetching quotes from server");
    return [];
  }
}

// Periodically fetch quotes from the server and sync with local storage
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length === 0) {
    return;
  }

  // Get local quotes
  let localQuotes = JSON.parse(localStorage.getItem("quotesData")) || [];

  // Merge server quotes with local quotes
  const allQuotes = [...serverQuotes, ...localQuotes];
  const uniqueQuotes = allQuotes.filter(
    (quote, index, self) =>
      index === self.findIndex((q) => q.text === quote.text)
  );

  // Update local storage with merged quotes
  localStorage.setItem("quotesData", JSON.stringify(uniqueQuotes));

  // Notify user of sync completion
  notifyUser("Quotes synchronized with the server");
}
// Start periodic syncing
syncQuotes();

// Notify the user about data updates
function notifyUser(message) {
  const notificationDiv = document.createElement("div");
  notificationDiv.textContent = message;
  notificationDiv.style.position = "fixed";
  notificationDiv.style.bottom = "10px";
  notificationDiv.style.right = "10px";
  notificationDiv.style.padding = "10px";
  notificationDiv.style.backgroundColor = "lightblue";
  document.body.appendChild(notificationDiv);
  setTimeout(() => document.body.removeChild(notificationDiv), 3000);
}
