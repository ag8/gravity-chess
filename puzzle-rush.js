let gameStates = Array();
let gameRecords = Array();
let successes = 0;
let total = 0;

canvas.addEventListener('mousedown', function (e) {
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

        // console.log(getLegalMoves(structuredClone(selectedPiece), structuredClone(gamePieces)));

        if (getLegalMoves(structuredClone(selectedPiece), structuredClone(globalGameState)).some(a => [row, col].every((v, i) => v === a[i]))) {
            let [capture, oldCol, oldRow, special, newPieces] = globalGameState.movePiece(selectedPiece, row, col);
            globalGameState.pieces = newPieces;

            globalGameState.updateGravity();

            recordMove(selectedPiece, row, col, capture, oldCol, oldRow, special);

            total++;
            if ([0, 1].indexOf(gameOver(globalGameState)) !== -1) {
                successes++;
                alert("SUCCESS! Current stats: " + successes + "/" + total);
            } else {
                alert("YOU FAILED! Current stats: " + successes + "/" + total);
            }
            document.getElementById("canvas-wrapper").style.visibility = "hidden";
            begin();


            turn = 1 - turn;
            gameStates.push(structuredClone(globalGameState));
            gameRecords.push(structuredClone(gameRecord));
        }

        selectedPiece = null;
        state = 0;
    }

    updateBoard(selectedPiece);
});

function getRandomPiece(gamestate, color) {
    for (const piece of structuredClone(gamestate.pieces).map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value)) {
        if (piece.color === color && getLegalMoves(piece, gamestate, true).length > 0) {
            return piece;
        }
    }
}

function generatePuzzle() {
    back();
    // Nasty hack to figure out which turn to set
    if (gameRecord.split(". ").slice(-1)[0].split(" ").length === 3) {
        turn = 1;
    } else {
        turn = 0;
    }
    document.getElementById("canvas-wrapper").style.visibility = "visible";
}

function runTurn() {
    let pieceHasMoves = false;
    let potentialMoves = [];
    let selectedPiece;

    while (!pieceHasMoves) {
        selectedPiece = getRandomPiece(globalGameState, turn);

        potentialMoves = getLegalMoves(selectedPiece, globalGameState);

        if (potentialMoves.length > 0) {
            pieceHasMoves = true;
        }
    }

    // console.log("Potential moves: ")
    // console.log(potentialMoves)
    let chosenMove = _.sample(potentialMoves);
    // console.log("Chose move:")
    // console.log(chosenMove)

    let [capture, oldCol, oldRow, special, newPieces] = globalGameState.movePiece(selectedPiece, chosenMove[0], chosenMove[1]);
    globalGameState.pieces = newPieces;

    globalGameState.updateGravity();

    recordMove(selectedPiece, chosenMove[0], chosenMove[1], capture, oldCol, oldRow, special);

    if (gameRecords.length > 150) {
        gameRecords = [];
        gameStates = [];
        globalGameState = initGameState();
    }

    gameStates.push(structuredClone(globalGameState));
    gameRecords.push(structuredClone(gameRecord));

    if ([0, 1].indexOf(gameOver(globalGameState)) !== -1) {
        console.log("Correct answer: " + gameRecord);
        ct();
        generatePuzzle();
    } else {
        setTimeout(runTurn, 1);
    }

    turn = 1 - turn;

    drawBoard();
    updateBoard(selectedPiece);
}

function ct() {
    turn = 1 - turn;
}

function begin() {
    globalGameState = initGameState();
    runTurn();
}

function loadGameRecord() {
    // console.log("Loading game record!");
    let sections = gameRecord.split(". ");
    document.getElementById("game-record-flex").innerHTML = "";
    for (let i = 1; i < sections.length; i++) {
        // console.log("Looking at ")
        let plies = sections[i].split(" ");
        for (let j = 0; j < Math.min(plies.length, 2); j++) {
            if (plies[j].length === 0) {
                continue;
            }
            // console.log("Loading ply " + plies[j] + ".");
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

function loadState(index) {
    if (index < 0) {
        return;
    }

    globalGameState = gameStates[index];
    gameStates = gameStates.slice(0, index);
    gameRecord = gameRecords[index];
    gameRecords = gameRecords.slice(0, index);
    turn = 1 - index % 2;
    state = 0;
    gameStates.push(structuredClone(globalGameState));
    gameRecords.push(structuredClone(gameRecord));
    updateBoard();
    loadGameRecord();
}

function back() {
    loadState(gameStates.length - 2);
}

let paramString = window.location.href.split('?')[1];
let queryString = new URLSearchParams(paramString);

for (let pair of queryString.entries()) {
    if (pair[0] === "fen") {
        globalGameState.pieces = createPiecesFromFen(pair[1]);
        updateBoard();
    }
    if (pair[0] === "turn") {
        turn = parseInt(pair[1], 10);
    }
}

// Custom game pieces
function createPiecesFromFen(fen) {
    // console.log("Creating!");
    let pieces = [];

    let row = 0;
    let col = 0;
    let index = 0;

    while (index < fen.length) {
        let current = fen[index];

        if (current === "R") {
            pieces.push(new Piece(col, row, ROOK, 0));
        } else if (current === "N") {
            pieces.push(new Piece(col, row, KNIGHT, 0));
        } else if (current === "B") {
            pieces.push(new Piece(col, row, BISHOP, 0));
        } else if (current === "K") {
            pieces.push(new Piece(col, row, KING, 0));
        } else if (current === "Q") {
            pieces.push(new Piece(col, row, QUEEN, 0));
        } else if (current === "P") {
            pieces.push(new Piece(col, row, PAWN, 0));
        } else if (current === "r") {
            pieces.push(new Piece(col, row, ROOK, 1));
        } else if (current === "n") {
            pieces.push(new Piece(col, row, KNIGHT, 1));
        } else if (current === "b") {
            pieces.push(new Piece(col, row, BISHOP, 1));
        } else if (current === "k") {
            pieces.push(new Piece(col, row, KING, 1));
        } else if (current === "q") {
            pieces.push(new Piece(col, row, QUEEN, 1));
        } else if (current === "p") {
            pieces.push(new Piece(col, row, PAWN, 1));
        } else if (current === "/") {
            col = -1;
            row++;
        } else {
            let skips = parseInt(current, 10);
            col += skips - 1;
        }

        col++;
        index++;
    }

    return pieces;
}

function getFEN() {
    let fen = "";
    let counter = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            let c = "";

            // Get the piece here, if any
            for (const piece of globalGameState.pieces) {
                if (piece.row === row && piece.col === col) {

                    if (piece.type === ROOK) {
                        c = "r";
                    } else if (piece.type === KNIGHT) {
                        c = "n";
                    } else if (piece.type === BISHOP) {
                        c = "b";
                    } else if (piece.type === QUEEN) {
                        c = "q";
                    } else if (piece.type === KING) {
                        c = "k";
                    } else if (piece.type === PAWN) {
                        c = "p";
                    }

                    if (piece.color === 0) {
                        c = c.toUpperCase();
                    }
                }
            }

            if (c.length > 0) {
                if (counter > 0) {
                    fen += counter.toString();
                }

                counter = 0;
                fen += c;
            } else {
                counter++;
            }
        }

        if (counter > 0) {
            fen += counter.toString();
        }

        counter = 0;
        fen += "/";
    }

    return fen.substring(0, fen.length - 1);
}
