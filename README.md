# Star Wars Explorer
A simple web application that uses the Swapi.tech API to explore Star Wars characters and films.

This project was built as part of the Code the Dream Advanced Pre-Work assignment.

---

## Features
- Displays a list of Star Wars characters
- Displays a list of Star Wars films
- Click a character to view detailed information
- From a character page, navigate to films they appear in
- From a film page, navigate to its characters
- Issues new GET requests when navigating between models
- Basic error handling for failed API requests
- Clean, themed styling inspired by Star Wars

---

## API Used
This project uses the public Swapi.tech API:

https://swapi.tech/

Models used:
- People
- Films

---

## How to Run the Project
1. Clone or download this repository.
2. Open the project folder.
3. Double-click on `index.html`.
4. The project will open in your default web browser.

No additional setup or dependencies are required.

---

## Technical Notes
- The project uses the Fetch API to retrieve data.
- Linked resources (films and characters) are fetched dynamically when clicked.
- A small in-memory cache is used to avoid re-fetching the same data repeatedly.
- Linked buttons display resource names by fetching only the currently visible linked items to maintain performance.

---

## Folder Structure
- `index.html` - Main HTML file
- `styles.css` - Styling for layout and theme
- `app.js` - JavaScript logic for fetching and rendering data