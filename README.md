# Hangman Setup

Run `npm install` to install dependencies.

I used nodemon to get updates to the server when a file is saved.  Run `npm install -g nodemon` to install nodemon if you do not already have it.

Start your server with `nodemon server.js`

# General rules

When the game is started, the player is represented with an empty field for each letter in the word.

• When the player guesses a letter correctly, each field that represents that letter is filled with the letter.

• When the player guesses a letter incorrectly, a piece of a gallows with a hanging man is drawn.

• After 10 incorrect guesses, the game is over and the player lost.

• Thus, there should be 10 different states of the gallows to be drawn.

• If all fields are filled with their letter before 10 incorrect guesses, the player has won the game.
