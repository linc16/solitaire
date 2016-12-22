# Overview


For your final programming assignment you will convert your application to a Single Page App (SPA).  This will involve touching nearly every line of code, so please make sure to set aside enough time.  You will need to ensure your application source code is structured well, builds using modern tools, and leverages cutting-edge client-side packages.  Good luck.


## Finish Game-play (20 pts)

* Be able to move 1 or 3 cards (depending on user configuration) from the Draw pile to the Discard pile.  The cards will go from face-down to face-up.  If you have less than three cards remaining, and the user has chosen three card draws, just draw all of the remaining cards.  If there are no cards remaining in the Draw pile, clicking on the Draw pile should move all of the cards from the Discard pile to the Draw pile (face-up to face-down maintaining order).
 
* State preservation: The server should always have a full recording of the game's state.  This means that the user should be able to leave the game and return to it at any point.
 
* Make face-down cards on the top of piles face-up

* Move cards to empty piles (Kings)


## Improved Source Code Layout (10 pts)

For this task you must organize your source code to for good structure and clarity.  You are required to structure both the client-side and the server-side.  Use the guidelines we developed in class:

public/
    css/
    img/
    js/
        -- nothing should be here yet ---
src/
    client/
        views/
        models/ -- optional if you are using Backbone models --
        main.js
        routes.js
    server/
        models/
        views/
        index.js
        
        
Refer to the slides if this structure is unfamiliar.  Use require and module.exports on the server-side and either ES6 import/export or require and module.exports on the client-side.  Getting all of the files in the right place with the right modularization is key to getting your build process running in the next step.



## SPA Build Process (20 pts)

Since we are writing a single page app we must have a robust build process.  Use the Webpack template developed in class as the basis for your build process.  Your application should build cleanly with no errors or warnings and should put the output file into the /public/js folder.



## Single Page Application (40pts)

Rewrite your client-side application to build as a single page app.  Use the React view framework and the starter code we developed in class as the starting point.  You will need to do the following:

* Build as a single page app
* Leverage Backbone/React router for all client-side page routing
* Server a simple Pug template from the server - very limited HTML allowed
* Rewrite all pages to be entirely React-based views

## Being Happy (10pts)

##Grading Criteria:

Point totals for each criteria are listed above.  Meet the description above and you get all of the points.  As functionality isn't working, visual styling is not as desired, or things are simply missing, points will be deducted.

##Submission:

Ensure your files are in a clean and organized folder hierarchy.  Make sure your package.json is complete and up-to-date.  Commit all necessary files (not node_modules) to your GitHub repository.  Grading will follow the same script as last assignment:

* Clone student's repo
* Run ```npm install``` and all dependencies are installed
* Run ```webpack``` to build the complete client
* Edit ```/src/server/index.js``` to point to the correct MongoDB instances
* Run ```npm start``` and the web app is running
* Navigate to localhost:8080 and the grader is on the landing page

Your repo must be compliant with these steps.  It is easy to practice this on your local machine to ensure you have everything in the right place.

