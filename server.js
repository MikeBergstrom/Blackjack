// require express and path
var express  =  require( "express");
var path  =  require( "path");

// create the express app
var app  =  express();
var session = require('express-session')
app.use(session({secret:'sosecret'}));
// static content 
app. use(express.static(path. join(__dirname  +  "/static")));

// setting up ejs and our views folder
app.set( 'views', path. join(__dirname,  './views'));
app.set( 'view engine',  'ejs');

// root route to render the index.ejs view
app.get( '/', function(req, res) {
 res. render( "index");
})

// tell the express app to listen on port 8000
var server = app. listen(8000, function() {
 console. log( "listening on port 8000");
});

    class Deck{
        constructor(){
            this.load();
            this.shuffle();
        }
            load(){
            this.cards = [];
            let suits = ["hearts", "spades", "clubs", "diamonds"]
            for (let i=1; i<14; i++){
                if (i ==1){
                    var card = "Ace";
                    var value = 1;
                    for (let j = 0; j < 4; j++){
                        let new_card = {"name": card + " of " + suits[j], "value": value, image:suits[j][0]+"1"};
                    this.cards.push(new_card);
                }
                }
                else if (i == 11){
                    var card = "Jack";
                    var value = 10;
                    for (let j = 0; j < 4; j++){
                    let new_card = {"name": card + " of " + suits[j], "value": value, image:suits[j][0]+"j"};
                    this.cards.push(new_card);
                }
                }
                else if (i == 12){
                    var card = "Queen";
                    var value = 10;
                    for (let j = 0; j < 4; j++){
                        let new_card = {"name": card + " of " + suits[j], "value": value, image:suits[j][0]+"q"};
                    this.cards.push(new_card);
                }
                }
                else if (i ==13){
                    var card = "King";
                    var value = 10;
                    for (let j = 0; j < 4; j++){
                    let new_card = {"name": card + " of "+ suits[j], "value": value, image:suits[j][0]+"k"};
                    this.cards.push(new_card);
                }
                }
                else{
                    var card = i;
                    var value = i;
                    for (let j = 0; j < 4; j++){
                    let new_card = {"name": card + " of "+ suits[j], "value": value,image:suits[j][0]+i};
                    this.cards.push(new_card);
                }
                }
                }
            }
            shuffle(){
                var m = this.cards.length, t, i;
                while (m){
                    i = Math.floor(Math.random() * m--);
                    t = this.cards[m];
                    this.cards[m] = this.cards[i];
                    this.cards[i] = t;
                }
                return this;
            }
            reset(){
                this.cards = [];
                this.load();
            }
            deal(){
                if (this.cards.length == 0){
                    console.log("All cards have been dealt")
                }
                else if (this.cards.length == 1){
                    console.log("This is the last card in the deck")
                    return this.cards.pop();
                }
                else{
                    return this.cards.pop();
                }
                }
            }

    class Player{
        constructor(name){
            this.hand = [];
            this.name = name;
        }
        draw(deck){
            let card = deck.deal();
            this.hand.push(card);
        }
        discard(){
            this.hand.pop();
        }
    }

var io = require('socket.io').listen(server);
var chats = [];
io.sockets.on('connection', function(socket){
    console.log('We are using sockets!');
    console.log(socket.id);

    socket. on('new_user', function(data){
        console.log("new user");
        console.log(data.name);
        // console.log(player);
        socket. emit('server_response', {});
    });
    socket.on("start_game", function(req, name){
            console.log("start game received")
            new_deck = new Deck();
            dealer = new Player();
            player = new Player(name);
            player.hand = [];
            dealer.hand = [];
            player.value = 0;
            dealer.value = 0;
            dealer.draw(new_deck);
            player.draw(new_deck);
            dealer.draw(new_deck);
            player.draw(new_deck);
            player.status = "";
            console.log(player.hand);
            // console.log(dealer.hand);
            socket.emit("deal", {dealer_hand:dealer.hand, player_hand:player.hand})
        });    
    socket.on("draw", function(data){
            // console.log(player);
            console.log("draw", data);
            player.draw(new_deck);
            // console.log(player.hand);
            player.total = 0;
            let player_ace_count = 0;
            for (let i=0; i<player.hand.length;i++){
                if(player.hand[i].value ==1){
                    player_ace_count++;
                }
                player.total += player.hand[i].value;
            }
            for(let i=0;i<player_ace_count;i++){
                if(player.total<12){
                    player.total+=10;
                }
            }
            // console.log(player.total);
            if (player.total > 21){
                player.status= "busted";
            }
            // console.log("sent",player.status);
            // console.log("sent",player.hand);
            // console.log("sent",player.total);
            socket.emit("new_card", {player_status: player.status, player_hand:player.hand, player_total:player.total, dealer_hand:dealer.hand})   
        });

})