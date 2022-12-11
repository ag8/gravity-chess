let gameStates = Array();
let gameRecords = Array();

const PAWN_VALUE = 40;
const KNIGHT_VALUE = 50;
const BISHOP_VALUE = 50;
const ROOK_VALUE = 60;
const QUEEN_VALUE = 80;
const KING_VALUE = 10000;

function whiteKingCol(gamestate) {
    for (let piece of gamestate.pieces) {
        if (piece.type === KING && piece.color === 0) {
            return piece.col;
        }
    }

    return -1;
}

function evaluate(gamestate, color) {
    if (missingKing(gamestate) === color) {
        return -100000;
    } else if (missingKing(gamestate) === 1 - color) {
        return 100000;
    }

    let sum = 0;

    for (let piece of gamestate.pieces) {
        switch (piece.type) {
            case PAWN:
                if (piece.col === whiteKingCol(gamestate) && piece.color === 0) {
                    sum += piece.color === color ? 4 * PAWN_VALUE : -4 * PAWN_VALUE;
                } else {
                    sum += piece.color === color ? PAWN_VALUE : -PAWN_VALUE;
                }
                break;
            case ROOK:
                sum += piece.color === color ? ROOK_VALUE : -ROOK_VALUE;
                break;
            case KNIGHT:
                sum += piece.color === color ? KNIGHT_VALUE : -KNIGHT_VALUE;
                break;
            case BISHOP:
                sum += piece.color === color ? BISHOP_VALUE : -BISHOP_VALUE;
                break;
            case QUEEN:
                sum += piece.color === color ? QUEEN_VALUE : -QUEEN_VALUE;
                break;
            case KING:
                sum += piece.color === color ? KING_VALUE : -KING_VALUE;
                break;
            default:
                throw Error("Illegal piece");
        }
    }

    return sum;
}

function missingKing(gamestate) {
    let whiteKingPresent = false;
    let blackKingPresent = false;

    for (let piece of gamestate.pieces) {
        if (piece.type === KING) {
            if (piece.color === 0) {
                whiteKingPresent = true;
            } else {
                blackKingPresent = true;
            }
        }
    }

    if (!whiteKingPresent) {
        return 0;
    }
    if (!blackKingPresent) {
        return 1;
    }
    return 74;
}

function negamax(gamestate, depth, alpha, beta, color) {
    if (depth === 0 || missingKing(gamestate) === color || missingKing(gamestate) === 1 - color) {

        /* begin logging */
        if (logging) {
            let display = "";
            for (let i = 0; i < (maxDepth - depth + 1) * 6; i++) {
                display += " ";
            }
            display += "(" + evaluate(gamestate, color) + ")";
            console.log(display);
        }
        /* end logging */

        return [evaluate(gamestate, color), null, null, null];
    }

    let gameStateCopy = structuredClone(gamestate);
    let secondCopy = structuredClone(gamestate);

    let bestPiece = null;
    let bestTarget = null;
    let value = Number.NEGATIVE_INFINITY;

    let attempts = 0;

    dance:
        for (let potentialPiece of secondCopy.pieces) {
            if (potentialPiece.color !== color) {
                // Skip pieces of the opposite color--we can't move them!
                continue;
            }

            // Save the old position of this piece
            let originalPositionRow = potentialPiece.row;
            let originalPositionCol = potentialPiece.col;

            let legalMoves = [];
            try {
                legalMoves = getAllMoves(potentialPiece, gameStateCopy);
            } catch (e) {
                console.log("bruh");
            }

            for (let potentialMove of legalMoves) {
                // Make this move in a cloned state and see what happens!
                let nextState = structuredClone(gameStateCopy);
                let pieceToMove = getPieceOn(potentialPiece.row, potentialPiece.col, nextState.pieces);
                let [capture, oldCol, oldRow, special, newPieces] = nextState.movePiece(pieceToMove, potentialMove[0], potentialMove[1]);
                nextState.pieces = newPieces;
                nextState.updateGravity();
                attempts++;

                /* Begin logging */
                if (logging) {
                    let pieceName = getPieceName(pieceToMove, capture, oldCol, oldRow),
                        coordsName = getCoordsName(pieceToMove.row, pieceToMove.col),
                        captureName = capture ? "x" : "", currentMoveRecord;

                    let moveName = pieceName + "" + captureName + "" + coordsName + " ";

                    let display = "" + color + ": ";
                    for (let i = 0; i < (maxDepth - depth) * 6; i++) {
                        display += " ";
                    }
                    display += moveName;

                    console.log(display);
                }
                /* End logging */

                // Evaluate the result
                let child_negamax = 0 - negamax(nextState, depth - 1, 0 - beta, 0 - alpha, 1 - color)[0];

                /* Begin logging */
                if (logging) {
                    let display = "" + color + ": ";
                    for (let i = 0; i < (maxDepth - depth) * 6; i++) {
                        display += " ";
                    }
                    display += "Eval: " + child_negamax;
                    if (child_negamax >= value) {
                        display += " >= " + value;
                    } else {
                        display += " < " + value;
                    }

                    console.log(display);
                }
                /* End logging */

                hehe: if (child_negamax >= value) {
                    if (child_negamax === value) {
                        // Break ties randomly
                        if (Math.random() < 0.5) {
                            break hehe;
                        }
                    }

                    value = child_negamax;
                    bestPiece = JSON.parse(JSON.stringify(potentialPiece));
                    bestPiece.row = originalPositionRow;
                    bestPiece.col = originalPositionCol;
                    bestTarget = potentialMove;

                    alpha = Math.max(alpha, value);
                    if (speedUp) {
                        if (alpha >= beta) {
                            break dance;
                        }
                    } else {
                        if (alpha > beta) {
                            break dance;
                        }
                    }
                }
            }
        }

    if (attempts === 0) {
        return [0, null, null, null];
    }

    if (bestPiece == null) {
        console.log("ag!~");
    }
    let piece = getPieceOn(bestPiece.row, bestPiece.col, gamestate.pieces);
    let moveRow = bestTarget[0];
    let moveCol = bestTarget[1];

    return [value, piece, moveRow, moveCol];
}


function getRandomPiece(gamestate) {
    for (const piece of gamestate.pieces) {
        if (piece.color === 0 && getLegalMoves(piece, gamestate, true).length > 0) {
            return piece;
        }
    }
}

function firstMove() {
    updateBoard(whiteMove(globalGameState));
    turn = 1 - turn;
}

function startGame() {
    maxDepth = window.prompt("Search depth? (plies)", 3);
    firstMove();
}

function speedItUp() {
    speedUp = true;
}

function slowDown() {
    speedUp = false;
}

function increaseDepth() {
    maxDepth++;
}

function decreaseDepth() {
    maxDepth--;
}

function debugMode() {
    logging = true;
}

let maxDepth = 3;
let logging = false;
let speedUp = false;

// Visualization variables
let lastWhiteMovedPieceFromRow = null;
let lastWhiteMovedPieceFromCol = null;
let lastWhiteMovedPieceToRow = null;
let lastWhiteMovedPieceToCol = null;

function whiteMove(gamestate) {
    updateBoard();
    // let gamePiecesString = JSON.stringify(gamePieces);
    // let gamePiecesCopy = JSON.parse(gamePiecesString);

    let [bestEval, piece, moveRow, moveCol] = negamax(gamestate, maxDepth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0);
    if (bestEval < -9000) {
        alert("I resign!");
    }
    // if (logging) {
    console.log("Best evaluation: " + bestEval);
    // }
    // let piece = getRandomPiece(gamestate);
    // let move = getLegalMoves(piece, gamestate)[0];
    // let moveRow = move[0], moveCol = move[1];

    lastWhiteMovedPieceFromRow = piece.row;
    lastWhiteMovedPieceFromCol = piece.col;
    lastWhiteMovedPieceToRow = moveRow;
    lastWhiteMovedPieceToCol = moveCol;
    // console.log("Evaluation: " + bestEval);

    // Actually complete the move!
    let [capture, oldCol, oldRow, special, newPieces] = gamestate.movePiece(piece, moveRow, moveCol);
    gamestate.pieces = newPieces;

    gamestate.updateGravity();

    recordMove(piece, moveRow, moveCol, capture, oldCol, oldRow, special);

    return piece;
}

canvas.addEventListener('mousedown', function (e) {
    let [x, y] = getCursorPosition(canvas, e);

    // console.log("You clicked on " + x + ", " + y);

    if (state === 0) {  // Selecting a piece
        // Detect whether this selected a piece
        selectedPiece = getSelectedPiece(x, y);

        if (selectedPiece == null) {
            // console.log("you clicked nowhere");
            return;
        }
        if (selectedPiece.color !== turn) {
            // console.log("you clicked the other player's piece");
            return;
        }

        // console.log("You chose the piece " + selectedPiece.type);

        state = 1;
    } else if (state === 1) { // Selecting a square to move to
        let [row, col] = getSelectedSquare(x, y);

        // console.log(getLegalMoves(structuredClone(selectedPiece), structuredClone(gamePieces)));

        if (getLegalMoves(structuredClone(selectedPiece), structuredClone(globalGameState)).some(a => [row, col].every((v, i) => v === a[i]))) {
            let [capture, oldCol, oldRow, special, newPieces] = globalGameState.movePiece(selectedPiece, row, col);
            globalGameState.pieces = newPieces;

            globalGameState.updateGravity();

            recordMove(selectedPiece, row, col, capture, oldCol, oldRow, special);

            turn = 1 - turn;
            gameStates.push(structuredClone(globalGameState));
            gameRecords.push(structuredClone(gameRecord));

            whiteMove(globalGameState);
            turn = 1 - turn;
        }

        selectedPiece = null;
        state = 0;
    }

    updateBoard(selectedPiece);
});

function loadGameRecord() {
    console.log("Loading game record!");
    let sections = gameRecord.split(". ");
    document.getElementById("game-record-flex").innerHTML = "";
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
    console.log("Creating!");
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

function drawBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (lastWhiteMovedPieceFromCol !== null) {
                if (j === lastWhiteMovedPieceFromRow && i === lastWhiteMovedPieceFromCol) {
                    ctx.fillStyle = '#89df70';
                } else if (j === lastWhiteMovedPieceToRow && i === lastWhiteMovedPieceToCol) {
                    ctx.fillStyle = '#6db259';
                } else {
                    if ((i + j) % 2 === 1) {
                        ctx.fillStyle = '#bd663d';
                    } else {
                        ctx.fillStyle = '#f7b596';
                    }
                }
            } else {
                if ((i + j) % 2 === 1) {
                    ctx.fillStyle = '#bd663d';
                } else {
                    ctx.fillStyle = '#f7b596';
                }
            }
            ctx.fillRect(i * SIZE, j * SIZE, SIZE, SIZE);
        }
    }
}