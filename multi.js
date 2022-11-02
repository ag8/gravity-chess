
function loadFromServer(gameData) {
    let parts = gameData.split("^^^");
    if (parts[0].length === 0) {
        console.log("Nothing to load (new game).");
        return;
    }
    gameRecord = parts[0].replace(/"+/g, '');
    console.log("FULL RECORD:");
    console.log(gameRecord);
    loadGameRecord();
    let gamePieces = JSON.parse(parts[1]);  // TODO get castling data etc from server
    globalGameState = new GameState(gamePieces);
    turn = 1 - parseInt(parts[2], 10);
    console.log("Setting gravity style " + parts[3] + "");
    globalGameState.setGravityStyle(parseInt(parts[3], 10));
    console.log("Data loaded from server.");
    updateBoard();
}
function loadGameRecord() {
    console.log("Loading game record!");
    let sections = gameRecord.split(". ");
    for (let i = 1; i < sections.length; i++) {
        console.log("Looking at ")
        let plies = sections[i].split(" ");
        for (let j = 0; j < Math.min(plies.length, 2); j++) {
            if (plies[j].length === 0) {
                continue;
            }
            console.log("Loading ply " + plies[j] + ".");
            let div = document.createElement("div");
            div.className = "move-record";
            if (j === 0) {
                div.innerHTML = (i) + ". ";
            } else {
                div.innerHTML = ""
            }
            div.innerHTML += plies[j];
            document.getElementById("game-record-flex").appendChild(div);
        }
    }
    move = sections.length - 1;
}

function back() {
    loadState(gameStates.length - 2);
}

function httpGetAsync(theUrl, callback) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function msToTime(duration) {
    let milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (hours > 0) {
        return hours + ":" + minutes;
    } else {
        if (minutes > 10) {
            return hours + ":" + minutes;
        } else {
            if (minutes > 1) {
                return minutes + ":" + seconds;
            } else {
                return minutes + ":" + seconds + "." + milliseconds;
            }
        }
    }
}

function getNewMoveFromServer() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            let response = xmlHttp.responseText;

            console.log("Got response " + response.length);

            if (response.length > 3) {
                document.getElementById("opp-timeh").classList.remove("active");
                document.getElementById("timeh").classList.add("active");
                updateTime();
                console.log("IMPLEMENTING RESPONSE RESULT!!!!!!!!!!!!");
                let pieces = response.split("^^^");
                let pieceToMove = JSON.parse(pieces[0]);
                let [row, col] = pieces[1].split(",");
                console.log("About to move this piece:");
                console.log(pieceToMove);
                console.log("To (row, col): (" + row + ", " + col + ")");
                otherPlayerMove(pieceToMove, parseInt(row, 10), parseInt(col, 10));
            }
        }
    }
    xmlHttp.open("GET", "poll_move.php?name=" + GAMENAME + "&color=" + YOURCOLOR, true); // true for asynchronous
    xmlHttp.send(null);
}

function pollForUpdate() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            let response = xmlHttp.responseText;

            console.log("Server says current move is " + response + ". My color is " + YOURCOLOR + ".");

            if (parseInt(response, 10) !== YOURCOLOR) {
                getNewMoveFromServer();
            }

            setTimeout(pollForUpdate, DELAY);
        }
    }
    xmlHttp.open("GET", "move_color.php?name=" + GAMENAME, true); // true for asynchronous
    xmlHttp.send(null);
}

const DELAY = 300;

setTimeout(pollForUpdate, DELAY);

function getMatch(p) {
    for (const piece of globalGameState.pieces) {
        if (p.row === piece.row && p.col === piece.col && p.color === piece.color) {
            return piece;
        }
    }
}

function otherPlayerMove(pieceToMove, row, col) {
    console.log("RUNNING OTHER PLAYER'S MOVE");
    console.log(pieceToMove);
    console.log("rc=" + row + "" + col);

    pieceToMove = getMatch(pieceToMove);

    let [capture, oldCol, oldRow, special, newPieces] = globalGameState.movePiece(pieceToMove, row, col);
    globalGameState.gamePieces = newPieces;

    globalGameState.updateGravity();

    recordMove(pieceToMove, row, col, capture, oldCol, oldRow, special);

    turn = 1 - turn;

    updateBoard();
}

function sendToServer(piece, row, col) {
    console.log("SENDING TO SERVER!!!!!!!!!!");
    document.getElementById("timeh").classList.remove("active");
    document.getElementById("opp-timeh").classList.add("active");
    updateTime();

    let url = "send_move.php?name=" + GAMENAME + "&piece=" + encodeURI(JSON.stringify(piece)) + "&row=" + row + "&col=" + col + "&pieces=" + encodeURI(JSON.stringify(globalGameState.pieces)) + "&record=" + encodeURI(JSON.stringify(gameRecord)) + "&color=" + YOURCOLOR + "";

    console.log("URL IS " + url);

    httpGetAsync(url, (() => {
        console.log("Sent to server!");
    }))
}

function updateTime() {
    httpGetAsync("get_time.php?name=" + GAMENAME, drawTimers);
}

let player1RemainingTime = 4206942069;
let player2RemainingTime = 4206942069;
let lastCalledMillis = Date.now();

function drawTime() {
    let updateAmount = Date.now() - lastCalledMillis;
    lastCalledMillis = Date.now();

    if (turn === 0) {
        player1RemainingTime -= updateAmount;
    } else {
        player2RemainingTime -= updateAmount;
    }

    // console.log("Player 1 remaining time: " + player1RemainingTime);

    drawTimers(player1RemainingTime + "^^^" + player2RemainingTime);
}

setInterval(drawTime, 100);

function drawTimers(data) {
    let parts = data.split("^^^");

    player1RemainingTime = parseInt(parts[0], 10);
    player2RemainingTime = parseInt(parts[1], 10);

    let firstTime = msToTime(parts[0]);
    let secondTime = msToTime(parts[1]);

    if (YOURCOLOR === 0) {
        document.getElementById("time").innerHTML = "<h3 id=\"timeh\">" + firstTime + "</h3>";
        document.getElementById("opp-time").innerHTML = "<h3 id=\"opp-timeh\">" + secondTime + "</h3>";
    } else {
        document.getElementById("time").innerHTML = "<h3 id=\"timeh\">" + secondTime + "</h3>";
        document.getElementById("opp-time").innerHTML = "<h3 id=\"opp-timeh\">" + firstTime + "</h3>";
    }

    if (turn !== YOURCOLOR) {
        document.getElementById("timeh").classList.remove("active");
        document.getElementById("opp-timeh").classList.add("active");
    } else {

        document.getElementById("timeh").classList.add("active");
        document.getElementById("opp-timeh").classList.remove("active");
    }
}

function eventListener() {
    canvas.addEventListener('mousedown', function (e) {
        console.log("CURENT TURN IS " + turn);

        if (turn !== YOURCOLOR) {
            return;
        } else {
            console.log("I AM CLAIMING THAT " + turn + "===" + YOURCOLOR);
        }

        let [x, y] = getCursorPosition(canvas, e);

        console.log("You clicked on " + x + ", " + y);

        if (state === 0) {  // Selecting a piece
            // Detect whether this selected a piece
            selectedPiece = getSelectedPiece(x, y);

            if (selectedPiece == null) {
                console.log("you clicked nowhere");
                return;
            }
            if (selectedPiece.color !== turn) {
                console.log("you clicked the other player's piece");
                return;
            }

            console.log("You chose the piece " + selectedPiece.type);

            state = 1;
        } else if (state === 1) { // Selecting a square to move to
            let [row, col] = getSelectedSquare(x, y);

            if (getLegalMoves(structuredClone(selectedPiece), structuredClone(globalGameState)).some(a => [row, col].every((v, i) => v === a[i]))) {
                let oldPieceCopy = JSON.parse(JSON.stringify(selectedPiece));
                let [capture, oldCol, oldRow, special, newPieces] = globalGameState.movePiece(selectedPiece, row, col);
                globalGameState.pieces = newPieces;

                globalGameState.updateGravity();

                recordMove(selectedPiece, row, col, capture, oldCol, oldRow, special);

                // Send to server after computation is done (in case of refresh)
                sendToServer(oldPieceCopy, row, col);

                turn = 1 - turn;
            }

            selectedPiece = null;
            state = 0;
        }


        updateBoard(selectedPiece);
    });
}
