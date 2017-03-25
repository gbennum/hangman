// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var randomWords = require('random-words');
var uuidV4 = require('uuid/v4');

// configuration =================

mongoose.connect('mongodb://guest:guest@olympia.modulusmongo.net:27017/ze9Rapoj');     // connect to mongoDB database on modulus.io
//hangman running at hangman-96933.app.xervo.io
//mongodb://guest:guest@olympia.modulusmongo.net:27017/ze9Rapoj

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// Model
var schema = new mongoose.Schema({ 
    username: 'string', 
    gamesWon: {type: 'number', default: 0},
    gamesLost: {type: 'number', default: 0},
    currentWord: {type: String, select: false}, 
    currentlyGuessed: 'array',
    guesses: 'number',
    lettersCorrect: 'number',
    currentGameStatus: 'boolean'
});
var Game = mongoose.model('Game', schema);


// routes ======================================================================

// api ---------------------------------------------------------------------
    app.get('/api/new-game', function(req, res) {
        word = randomWords();
        var game = {
            username: uuidV4(),
            gamesWon: 0,
            gamesLost: 0,
            currentWord: word,
            currentlyGuessed: Array(word.length).join(".").split("."),
            guesses: 0,
            lettersCorrect: 0,
            currentGameStatus: true
        }
        Game.create(game, function(err, games) {
            if (err) {
                res.send(err);
            }
            else {
               res.json(game);
            }
        });
    });

    app.post('/api/check-guess', function(req, res) {
        Game.find({username:req.body.username}, '+currentWord', function(err, game) {
            if (err) {
                res.send(err)
            }
            else {
                if (game.length === 0) {
                    game.push(getNewGame(req.body.username));
                }

                var checked = checkGuess(game[0]);
                Game.update(
                    {username: checked.username},
                    {$set: checked},
                    {upsert:true},
                    function(err){
                        if(err){
                                console.log(err);
                        }else{
                            checked.currentWord = undefined;
                            res.json(checked);
                        }
                });
            }
        });

        function checkGuess(game) {
            if (game.guesses <= 8 && game.currentGameStatus && !game.currentlyGuessed.includes(req.body.currentGuess)) {
                splitArrayOnGuess = game.currentWord.split(req.body.currentGuess);
                if (splitArrayOnGuess.length === 1) {
                    game.guesses += 1;
                }
                else {
                    game.lettersCorrect += splitArrayOnGuess.length - 1;
                    var insertIndex = 0;
                    for (i = 0; splitArrayOnGuess.length - 1 > i; i++) {
                        insertIndex += splitArrayOnGuess[i].length;
                        game.currentlyGuessed[insertIndex] = req.body.currentGuess;
                        insertIndex += 1;
                    }
                    if (game.lettersCorrect === game.currentWord.length) {
                        game.gamesWon += 1
                        game.currentGameStatus = false;
                    }
                }
            }
            else if (game.guesses === 9) {
                game.guesses += 1;
                game.gamesLost += 1;
                game.currentGameStatus = false;
            }
            return game;
            
        };
    });

    app.post('/api/new-word', function(req, res) {
        Game.find({username:req.body.username}, function(err, game) {
            if (err) {
                res.send(err)
            }
            else {
                var newGame = getNewGame(req.body.username);
                Game.update(
                    {username: newGame.username},
                    {$set: newGame},
                    {upsert:true},
                    function(err){
                        if(err){
                                console.log(err);
                        }else{
                            newGame.currentWord = undefined;
                            res.json(newGame);
                        }
                });
            }
        });
    });

    app.post('/api/load-user', function(req, res) {
        Game.find({username:req.body.username}, function(err, game) {
            if (err) {
                res.send(err)
            }
            else {
                if (game.length === 0) {
                    game.push(getNewGame(req.body.username));
                }
                game[0]._id = undefined;
                game[0].__v = undefined
                Game.update(
                    {username: req.body.username.username},
                    {$set: game[0]},
                    {upsert:true},
                    function(err){
                        if(err){
                                console.log(err);
                        }else{
                            game[0].currentWord = undefined;
                            res.json(game[0]);
                        }
                });
            }
        });
    });
    

    var getNewGame = function(username) {
        if (!username) {
            username = uuidV4();
        }
        var word = randomWords();
        var newWordObject = {
            username: username,
            currentWord: word,
            currentlyGuessed: Array(word.length).join(".").split("."),
            guesses: 0,
            lettersCorrect: 0,
            currentGameStatus: true
        }
        return newWordObject;
    }


// application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });


// listen (start app with node server.js) ======================================
app.listen(8080);

