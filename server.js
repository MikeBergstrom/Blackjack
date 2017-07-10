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
            for (let i=0;i<6;i++){
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
        constructor(name, id){
            this.hand = [];
            this.name = name;
            this.total = 0;
            this.status = "joined";
            this.socket = id;
        }
        draw(deck){
            let card = deck.deal();
            this.hand.push(card);
        }
        discard(){
            this.hand.pop();
        }
    }
players = [];
start_status = "ready";
var io = require('socket.io').listen(server);
var chats = [];
io.sockets.on('connection', function(socket){
    console.log('We are using sockets!');
    console.log(socket.id);

    socket. on('new_user', function(data){
        console.log("new user");
        console.log(players);
        console.log(data.name);
        // console.log(player);
        let player = new Player(data.name, socket.id);
        console.log(player.name);
        players.push(player);
        console.log(players);
        for (let i=0;i<players.length;i++){
        console.log(players[i].name);
        }
        socket. emit('server_response', {players:players});
        socket.broadcast.emit('new_player', {new_player:player});
    });

    socket.on("start_game", function(req, name){
            console.log("start status", start_status)
            if (start_status == "ready" || start_status == "waiting"){
                for (let i=0;i<players.length;i++){
                    if(players[i].socket == socket.id){
                        players[i].status = "waiting";
                        console.log(players[i].status);
                    }
                }
                start_status = "ready";
                    for (let i=0;i<players.length;i++){
                        if (players[i].status == "joined" || players[i].status == "current" || players[i].status == "busted"){
                            start_status = "waiting";
                        }
                    }

                if (start_status == "waiting"){
                    io.emit("status_update", {players:players})
                } else{
                    dealer = new Player("dealer", 1);
                    new_deck = new Deck();
                    dealer.draw(new_deck);
                    dealer.draw(new_deck);
                    for (let i=0;i<players.length;i++){
                        players[i].hand = [];
                        players[i].total = 0;
                        players[i].draw(new_deck);
                        players[i].draw(new_deck);
                        let player_ace_count = 0;
                        for(let j=0;j<players[i].hand.length;j++){
                            if (players[i].hand[j].value == 1){
                                player_ace_count++;
                            }
                            players[i].total += players[i].hand[j].value;
                        }

                        for (let k=0;k<player_ace_count;k++){
                            if (players[i].total < 12){
                                players[i].total += 10;
                            }
                        }
                    }
                    players[0].status = "current";
                    start_status = "playing";
                    console.log("game status ", start_status)
                    io.emit("game_updated", {players:players, dealer:dealer})
                }
            }
            // console.log("start game received")
            // new_deck = new Deck();
            // console.log(new_deck.cards.length)
            // dealer = new Player();
            // player = new Player(name);
            // player.hand = [];
            // dealer.hand = [];
            // player.value = 0;
            // dealer.value = 0;
            // dealer.draw(new_deck);
            // player.draw(new_deck);
            // dealer.draw(new_deck);
            // player.draw(new_deck);
            // player.status = "";
            // console.log(player.hand);
            // // console.log(dealer.hand);
            // socket.emit("deal", {dealer_hand:dealer.hand, player_hand:player.hand})
        });    
    socket.on("draw", function(data){
            // console.log(player);
            console.log("draw", data);
            for (let i=0; i<players.length;i++){
                game_status = "";
                if (players[i].socket == socket.id){
                    players[i].draw(new_deck);
                    players[i].total = 0;
                    let player_ace_count = 0;
                    for (let j=0;j<players[i].hand.length;j++){
                        if (players[i].hand[j].value== 1){
                            player_ace_count++;
                        }
                        players[i].total += players[i].hand[j].value;
                    }
                    if (player_ace_count > 0){
                        if (players[i].total < 12){
                            players[i].total += 10;
                        }
                    }
                    if (players[i].total > 21){
                        players[i].status = "busted";
                        game_status = "complete"
                        for (let k=0;k<players.length;k++){
                            if (players[k].status == "waiting"){
                                players[k].status = "current";
                                game_status = "ongoing";
                            }
                        }
                    }
                }
            }
            if (game_status == "complete"){
            dealer.total = 0;
            for (let i=0; i<dealer.hand.length;i++){
                dealer.total+= dealer.hand[i].value;
            }
            if (dealer.total > 16){
                dealer.status = "stayed";
            } else {
                while (dealer.total < 17){
                    console.log("in if");
                    dealer.draw(new_deck);
                    dealer.total = 0;
                    for (let i=0; i<dealer.hand.length;i++){
                        dealer.total+= dealer.hand[i].value;
                }
                if (dealer.total > 21){
                    dealer.status = "busted";
                } else {
                    dealer.status = "stayed";
                    }    
                }
            }
            if (dealer.status == "busted"){
                for (let i=0;i<players.length;i++){
                    if (players[i].status== "busted"){
                        players[i].status == "Lost";
                    } else if (players[i].status == "stayed"){
                        players[i].status = "Won";
                    }
                }
            } else {
                for (let i=0; i< players.length;i++){
                    if (players[i].status == "busted"){
                        players[i].status = "Lost";
                    }else if (players[i].total == dealer.total){
                        players[i].status = "Push";
                    } else if ( players[i].total > dealer.total){
                        players[i].status = "Won";
                    } else {
                        players[i].status = "Lost";
                    }
                }
            }
            io.emit("game_complete", {players:players, dealer: dealer});
            start_status = "ready";
            console.log("game over", start_status)
            for (let m=0;m<players.length;m++){
                players[m].status = "joined";
            }    
        } else {
            console.log("in else io emit game update")
            io.emit("game_updated", {players:players, dealer:dealer} )
        }
        });
    socket.on("stay", function(){
        for (let i=0; i<players.length;i++){
            if(players[i].socket == socket.id){
                players[i].status = "stayed";
            }
        }
        let game_status = "complete";
        for (let i=0; i<players.length; i++){
            if(players[i].status == "waiting"){
                players[i].status = "current";
                game_status = "in progress"
                io.emit("game_updated", {players:players, dealer:dealer});
                break;
            }
        }
        if (game_status == "complete"){
            dealer.total = 0;
            for (let i=0; i<dealer.hand.length;i++){
                dealer.total+= dealer.hand[i].value;
            }
            if (dealer.total > 16){
                dealer.status = "stayed";
            } else {
                while (dealer.total < 17){
                    console.log("in if");
                    dealer.draw(new_deck);
                    dealer.total = 0;
                    for (let i=0; i<dealer.hand.length;i++){
                        dealer.total+= dealer.hand[i].value;
                }
                if (dealer.total > 21){
                    dealer.status = "busted";
                } else {
                    dealer.status = "stayed";
                    }    
                }
            }
            if (dealer.status == "busted"){
                for (let i=0;i<players.length;i++){
                    if (players[i].status == "busted"){
                        players[i].status == "Lost";
                    } else if (players[i].status == "stayed"){
                        players[i].status = "Won";
                    }
                }
            } else {
                for (let i=0; i< players.length;i++){
                    if (players[i].status = "busted"){
                        players[i].status = "Lost";
                    }else if (players[i].total == dealer.total){
                        players[i].status = "Push";
                    } else if ( players[i].total > dealer.total){
                        players[i].status = "Won";
                    } else {
                        players[i].status = "Lost";
                    }
                }
            }
            io.emit("game_complete", {players:players, dealer: dealer});
            start_status = "ready";
            console.log("game over", start_status)
            for (let m=0;m<players.length;m++){
                players[m].status = "joined";
            }  
        }

        // dealer.total = 0;
        // for (let i=0; i<dealer.hand.length;i++){
        //     dealer.total+= dealer.hand[i].value;
        // }
        // player.total = 0;
        // for (let i=0; i<player.hand.length;i++){
        //     player.total+= player.hand[i].value;
        // }
        // console.log("dealer total", dealer.total);
        // if (dealer.total > 16){
            // socket.emit("dealer_card", {dealer_total:dealer.total, dealer_hand:dealer.hand, player_total:player.total})
        // } else {
        // if (dealer.total < 17){
        //     console.log("in if");
        //     dealer.draw(new_deck);
        //     dealer.total = 0;
        //     for (let i=0; i<dealer.hand.length;i++){
        //         dealer.total+= dealer.hand[i].value;
        //     }
        //     console.log("dealer total in while", dealer.total)
        //     socket.emit("dealer_card", {dealer_total:dealer.total, dealer_hand:dealer.hand, player_total:player.total})
        // }
        // }
    });
    socket.on('disconnect', function(){
    console.log("disconnection detected")
    console.log(socket.id);
    for (let k=0; k<players.length;k++){
        if(players[k].socket == socket.id){
            players.splice(k,1);
        }
    }
    console.log(players);
});
})
