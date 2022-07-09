const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => {
    img.onload = img.onerror = resolve;
}))).then(() => {
    loadBoard();
});


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const canvas_width = ctx.canvas.clientWidth;
const canvas_height = ctx.canvas.clientHeight;
assert(canvas_width === canvas_height, "Weird canvas you got there");
const SIZE = canvas_width / 8;
const black_rook_image = document.getElementById('black_rook');
const black_knight_image = document.getElementById('black_knight');
const black_bishop_image = document.getElementById('black_bishop');
const black_queen_image = document.getElementById('black_queen');
const black_king_image = document.getElementById('black_king');
const black_pawn_image = document.getElementById('black_pawn');
const white_rook_image = document.getElementById('white_rook');
const white_knight_image = document.getElementById('white_knight');
const white_bishop_image = document.getElementById('white_bishop');
const white_queen_image = document.getElementById('white_queen');
const white_king_image = document.getElementById('white_king');
const white_pawn_image = document.getElementById('white_pawn');


class Piece {
    constructor(col, row, type, color) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.color = color;
    }
}

/**
 * Creates an array of pieces on a standard chess board.
 *
 * @returns {Array} the array of 32 Pieces.
 */
function initGamePieces() {
    let pieces = [];

    pieces.push(new Piece(0, 7, ROOK, 1));
    pieces.push(new Piece(1, 7, KNIGHT, 1));
    pieces.push(new Piece(2, 7, BISHOP, 1));
    pieces.push(new Piece(3, 7, KING, 1));
    pieces.push(new Piece(4, 7, QUEEN, 1));
    pieces.push(new Piece(5, 7, BISHOP, 1));
    pieces.push(new Piece(6, 7, KNIGHT, 1));
    pieces.push(new Piece(7, 7, ROOK, 1));

    for (let i = 0; i < 8; i++) {
        pieces.push(new Piece(i, 6, PAWN, 1));
    }

    pieces.push(new Piece(0, 0, ROOK, 0));
    pieces.push(new Piece(1, 0, KNIGHT, 0));
    pieces.push(new Piece(2, 0, BISHOP, 0));
    pieces.push(new Piece(3, 0, KING, 0));
    pieces.push(new Piece(4, 0, QUEEN, 0));
    pieces.push(new Piece(5, 0, BISHOP, 0));
    pieces.push(new Piece(6, 0, KNIGHT, 0));
    pieces.push(new Piece(7, 0, ROOK, 0));

    for (let i = 0; i < 8; i++) {
        pieces.push(new Piece(i, 1, PAWN, 0));
    }

    return pieces;
}

let gamePieces = initGamePieces();

// The actual game code
player = 1;

function loadBoard() {
    updateBoard();
}

function getPieceOn(row, col) {
    for (const piece of gamePieces) {
        if (piece.row === row && piece.col === col) {
            return piece;
        }
    }

    return null;
}

function onBoard(row, col) {
    return 0 <= row && row <= 7 && 0 <= col && col <= 7;
}

function getLegalMoves(piece) {
    let legalMoves = [];

    let row = piece.row;
    let col = piece.col;

    if (piece.type === PAWN) {
        if (piece.color === 0) {
            if (getPieceOn(row + 1, col) == null) {
                legalMoves.push([row + 1, col]);
            }

            if (row === 1) {
                if (getPieceOn(row + 2, col) == null) {
                    legalMoves.push([row + 2, col]);
                }
            }

            if (getPieceOn(row + 1, col + 1) != null) {
                if (getPieceOn(row + 1, col + 1).color === 1) {
                    legalMoves.push([row + 1, col + 1]);
                }
            }

            if (getPieceOn(row + 1, col - 1) != null) {
                if (getPieceOn(row + 1, col - 1).color === 1) {
                    legalMoves.push([row + 1, col - 1]);
                }
            }
        } else {
            if (getPieceOn(row - 1, col) == null) {
                legalMoves.push([row - 1, col]);
            }

            if (row === 6) {
                if (getPieceOn(row - 2, col) == null) {
                    legalMoves.push([row - 2, col]);
                }
            }

            if (getPieceOn(row - 1, col + 1) != null) {
                if (getPieceOn(row - 1, col + 1).color === 0) {
                    legalMoves.push([row - 1, col + 1]);
                }
            }

            if (getPieceOn(row - 1, col - 1) != null) {
                if (getPieceOn(row - 1, col - 1).color === 0) {
                    legalMoves.push([row - 1, col - 1]);
                }
            }
        }
    }


    if (piece.type === ROOK) {
        for (let i = row + 1; i < 8; i++) {
            if (getPieceOn(i, col) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([i, col]);
                break;
            } else {
                legalMoves.push([i, col]);
            }
        }
        for (let i = row - 1; i > -1; i--) {
            if (getPieceOn(i, col) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([i, col]);
                break;
            } else {
                legalMoves.push([i, col]);
            }
        }
        for (let i = col + 1; i < 8; i++) {
            if (getPieceOn(row, i) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([row, i]);
                break;
            } else {
                legalMoves.push([row, i]);
            }
        }
        for (let i = col - 1; i > -1; i--) {
            if (getPieceOn(row, i) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([row, i]);
                break;
            } else {
                legalMoves.push([row, i]);
            }
        }
    }

    if (piece.type === KNIGHT) {
        if (getPieceOn(row + 2, col + 1) != null) {
            if (getPieceOn(row + 2, col + 1).color !== piece.color) {
                legalMoves.push([row + 2, col + 1]);
            }
        } else {
            if (onBoard(row + 2, col + 1)) {
                legalMoves.push([row + 2, col + 1]);
            }
        }
        if (getPieceOn(row + 2, col - 1) != null) {
            if (getPieceOn(row + 2, col - 1).color !== piece.color) {
                legalMoves.push([row + 2, col - 1]);
            }
        } else {
            if (onBoard(row + 2, col - 1)) {
                legalMoves.push([row + 2, col - 1]);
            }
        }
        if (getPieceOn(row - 2, col + 1) != null) {
            if (getPieceOn(row - 2, col + 1).color !== piece.color) {
                legalMoves.push([row - 2, col + 1]);
            }
        } else {
            if (onBoard(row - 2, col + 1)) {
                legalMoves.push([row - 2, col + 1]);
            }
        }
        if (getPieceOn(row - 2, col - 1) != null) {
            if (getPieceOn(row - 2, col - 1).color !== piece.color) {
                legalMoves.push([row - 2, col - 1]);
            }
        } else {
            if (onBoard(row - 2, col - 1)) {
                legalMoves.push([row - 2, col - 1]);
            }
        }
        if (getPieceOn(row + 1, col + 2) != null) {
            if (getPieceOn(row + 1, col + 2).color !== piece.color) {
                legalMoves.push([row + 1, col + 2]);
            }
        } else {
            if (onBoard(row + 1, col + 2)) {
                legalMoves.push([row + 1, col + 2]);
            }
        }
        if (getPieceOn(row + 1, col - 2) != null) {
            if (getPieceOn(row + 1, col - 2).color !== piece.color) {
                legalMoves.push([row + 1, col - 2]);
            }
        } else {
            if (onBoard(row + 1, col - 2)) {
                legalMoves.push([row + 1, col - 2]);
            }
        }
        if (getPieceOn(row - 1, col + 2) != null) {
            if (getPieceOn(row - 1, col + 2).color !== piece.color) {
                legalMoves.push([row - 1, col + 2]);
            }
        } else {
            if (onBoard(row - 1, col + 2)) {
                legalMoves.push([row - 1, col + 2]);
            }
        }
        if (getPieceOn(row - 1, col - 2) != null) {
            if (getPieceOn(row - 1, col - 2).color !== piece.color) {
                legalMoves.push([row - 1, col - 2]);
            }
        } else {
            if (onBoard(row - 1, col - 2)) {
                legalMoves.push([row - 1, col - 2]);
            }
        }
    }
    if (piece.type === BISHOP) {
        for (let i = 1; i < 10; i++) {
            let newRow = row + i;
            let newCol = col + i;

            if (!onBoard(newRow, newCol)) {
                break;
            }

            if (getPieceOn(newRow, newCol) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([newRow, newCol]);
                break;
            } else {
                legalMoves.push([newRow, newCol]);
            }
        }
        for (let i = 1; i < 10; i++) {
            let newRow = row + i;
            let newCol = col - i;

            if (!onBoard(newRow, newCol)) {
                break;
            }

            if (getPieceOn(newRow, newCol) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([newRow, newCol]);
                break;
            } else {
                legalMoves.push([newRow, newCol]);
            }
        }
        for (let i = 1; i < 10; i++) {
            let newRow = row - i;
            let newCol = col + i;

            if (!onBoard(newRow, newCol)) {
                break;
            }

            if (getPieceOn(newRow, newCol) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([newRow, newCol]);
                break;
            } else {
                legalMoves.push([newRow, newCol]);
            }
        }
        for (let i = 1; i < 10; i++) {
            let newRow = row - i;
            let newCol = col - i;

            if (!onBoard(newRow, newCol)) {
                break;
            }

            if (getPieceOn(newRow, newCol) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol).color === piece.color) {
                    break;
                }

                // If it's the other color piece, add it but that's it
                legalMoves.push([newRow, newCol]);
                break;
            } else {
                legalMoves.push([newRow, newCol]);
            }
        }
    }
    if (piece.type === QUEEN) {
        let pieceCopy = JSON.parse(JSON.stringify(piece));
        pieceCopy.type = ROOK;
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy));
        let pieceCopy2 = JSON.parse(JSON.stringify(piece));
        pieceCopy2.type = BISHOP;
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy2));
    }
    if (piece.type === KING) {
        if (getPieceOn(row + 1, col + 1) != null) {
            if (getPieceOn(row + 1, col + 1).color !== piece.color) {
                legalMoves.push([row + 1, col + 1]);
            }
        } else {
            if (onBoard(row + 1, col + 1)) {
                legalMoves.push([row + 1, col + 1]);
            }
        }
        if (getPieceOn(row + 1, col - 1) != null) {
            if (getPieceOn(row + 1, col - 1).color !== piece.color) {
                legalMoves.push([row + 1, col - 1]);
            }
        } else {
            if (onBoard(row + 1, col - 1)) {
                legalMoves.push([row + 1, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col + 1) != null) {
            if (getPieceOn(row - 1, col + 1).color !== piece.color) {
                legalMoves.push([row - 1, col + 1]);
            }
        } else {
            if (onBoard(row - 1, col + 1)) {
                legalMoves.push([row - 1, col + 1]);
            }
        }
        if (getPieceOn(row - 1, col - 1) != null) {
            if (getPieceOn(row - 1, col - 1).color !== piece.color) {
                legalMoves.push([row - 1, col - 1]);
            }
        } else {
            if (onBoard(row - 1, col - 1)) {
                legalMoves.push([row - 1, col - 1]);
            }
        }
        if (getPieceOn(row, col + 1) != null) {
            if (getPieceOn(row, col + 1).color !== piece.color) {
                legalMoves.push([row, col + 1]);
            }
        } else {
            if (onBoard(row, col + 1)) {
                legalMoves.push([row, col + 1]);
            }
        }
        if (getPieceOn(row, col - 1) != null) {
            if (getPieceOn(row, col - 1).color !== piece.color) {
                legalMoves.push([row, col - 1]);
            }
        } else {
            if (onBoard(row, col - 1)) {
                legalMoves.push([row, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col) != null) {
            if (getPieceOn(row - 1, col).color !== piece.color) {
                legalMoves.push([row - 1, col]);
            }
        } else {
            if (onBoard(row - 1, col)) {
                legalMoves.push([row - 1, col]);
            }
        }
        if (getPieceOn(row + 1, col) != null) {
            if (getPieceOn(row + 1, col).color !== piece.color) {
                legalMoves.push([row + 1, col]);
            }
        } else {
            if (onBoard(row + 1, col)) {
                legalMoves.push([row + 1, col]);
            }
        }
    }

    return legalMoves;
}

function updateBoard(selectedPiece) {
    drawBoard();

    function drawPieceDetailed(piece) {
        function drawCircle(piece) {
            let centerX = (piece.col + 0.5) * SIZE;
            let centerY = (piece.row + 0.5) * SIZE;
            let radius = SIZE / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#7dcc11';
            ctx.stroke();
        }

        function highlightLegalMoves(piece) {
            let legalMoves = getLegalMoves(piece);

            function highlightLegalMove(move) {
                ctx.fillStyle = '#f7799e';
                ctx.fillRect(move[1] * SIZE, move[0] * SIZE, SIZE, SIZE);
            }

            legalMoves.forEach(highlightLegalMove)
        }

        if (piece === selectedPiece) {
            drawPiece(piece);

            drawCircle(piece);

            highlightLegalMoves(piece);
        } else {
            drawPiece(piece);
        }
    }

    gamePieces.forEach(drawPieceDetailed);
    gamePieces.forEach(drawPiece);
}


function drawBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                ctx.fillStyle = '#bd663d';
            } else {
                ctx.fillStyle = '#f7b596';
            }
            ctx.fillRect(i * SIZE, j * SIZE, SIZE, SIZE);
        }
    }
}

function get_image_scale() {
    let w = (black_pawn_image.width / 128 * SIZE);
    let h = (black_pawn_image.height / 128 * SIZE);

    return [w, h]
}

function drawPiece(piece) {
    if (piece.type === PAWN) {
        let image = white_pawn_image;
        if (piece.color === 1) {
            image = black_pawn_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === ROOK) {
        let image = white_rook_image;
        if (piece.color === 1) {
            image = black_rook_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === KNIGHT) {
        let image = white_knight_image;
        if (piece.color === 1) {
            image = black_knight_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === BISHOP) {
        let image = white_bishop_image;
        if (piece.color === 1) {
            image = black_bishop_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === QUEEN) {
        let image = white_queen_image;
        if (piece.color === 1) {
            image = black_queen_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === KING) {
        let image = white_king_image;
        if (piece.color === 1) {
            image = black_king_image;
        }

        let [w, h] = get_image_scale();

        let offsetW = piece.col * SIZE;
        let offsetH = piece.row * SIZE;

        ctx.drawImage(image, offsetW + 0.2 * w, offsetH + 0.1 * h, 0.8 * w, 0.8 * h);
    }
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

function getSelectedPiece(x, y) {
    for (const piece of gamePieces) {
        // Figure out this piece's square bounds
        let lowX = SIZE * piece.col;
        let lowY = SIZE * piece.row;
        let highX = lowX + SIZE;
        let highY = lowY + SIZE;

        if (lowX < x && x < highX && lowY < y && y < highY) {
            return piece;
        }
    }

    return null;
}

function getSelectedSquare(x, y) {
    return [Math.floor(y / SIZE), Math.floor(x / SIZE)];
}

function updateGravity() {
    for (let i = 0; i < 8; i++) {  // Max eight gravity updates
        for (const piece of gamePieces) {
            if (piece.type === PAWN) {
                continue;
            }

            let belowRow = piece.row + 1;
            let col = piece.col;

            if (getPieceOn(belowRow, col) == null) {
                if (onBoard(belowRow, col)) {
                    piece.row = belowRow;
                    piece.col = col;
                }
            }
        }
    }
}

let state = 0;
let turn = 0;
let selectedPiece = null;

function movePiece(piece, toRow, toCol) {
    let numPieces = gamePieces.length;
    let special = "";

    // First, check for immediate captures
    if (getPieceOn(toRow, toCol) != null) {
        gamePieces = gamePieces.filter(piece => !(piece.row === getPieceOn(toRow, toCol).row && piece.col === getPieceOn(toRow, toCol).col))
    }

    let oldCol = piece.col;

    piece.row = toRow;
    piece.col = toCol;

    // Check if the piece is a promoted pawn
    if (piece.color === 0 && piece.row === 7 && piece.type === PAWN || piece.color === 1 && piece.row === 0 && piece.type === PAWN) {
        piece.type = askForPromotion();
        if (numPieces <= gamePieces.length) {
            special = getCoordsName(piece.row, piece.col) + "=" + getPieceName(piece, 0, 0).substring(0, 1);
        } else {
            special = getCoordsName(piece.row, oldCol).substring(0, 1) + "x" + getCoordsName(piece.row, piece.col) + "=" + getPieceName(piece, 0, 0).substring(0, 1);
        }
    }

    return [numPieces > gamePieces.length, oldCol, special];
}

let move = 1;
let gameRecord = "";


function recordMove(selectedPiece, row, col, capture, oldCol, special) {
    let pieceName = getPieceName(selectedPiece, capture, oldCol), coordsName = getCoordsName(row, col),
        captureName = capture ? "x" : "", currentMoveRecord;

    if (turn === 0) {
        currentMoveRecord = special.length === 0 ? move + ". " + pieceName + "" + captureName + "" + coordsName + " " : special;
    } else {
        currentMoveRecord = special.length === 0 ? pieceName + "" + captureName + "" + coordsName + " " : special;
        move++;
    }

    let winner = gameOver();

    if (winner === 1) {
        currentMoveRecord += " 0–1"
    } else if (winner === 0) {
        currentMoveRecord += " 1–0"
    }

    gameRecord += currentMoveRecord;


    let div = document.createElement("div");
    div.className = "move-record";
    div.innerHTML = currentMoveRecord;

    document.getElementById("game-record-flex").appendChild(div);
}

function gameOver() {
    /**
     * Returns the loser
     * @type {number}
     */

    let numKings = 0;
    let winner = -1;

    for (let piece of gamePieces) {
        if (piece.type === KING) {
            numKings++;
            winner = piece.color;
        }
    }

    return numKings === 2 ? -1 : winner;
}

function getPieceName(piece, capture, oldCol) {
    if (piece.type === PAWN) {
        if (!capture) {
            return "";
        } else {
            return getCoordsName(piece.row, oldCol)[0];
        }
    } else if (piece.type === ROOK) {
        return "R(" + getCoordsName(piece.row, piece.col) + ")";
    } else if (piece.type === KNIGHT) {
        return "N(" + getCoordsName(piece.row, piece.col) + ")";
    } else if (piece.type === BISHOP) {
        return "B(" + getCoordsName(piece.row, piece.col) + ")";
    } else if (piece.type === QUEEN) {
        return "Q";
    } else if (piece.type === KING) {
        return "K";
    }
}

function getCoordsName(row, col) {
    return ["a", "b", "c", "d", "e", "f", "g", "h"].reverse()[col] + "" + (row - (0 - 1));
}

function askForPromotion() {
    console.log("PROMOTING");

    let valid = ["queen", "rook", "bishop", "knight"];
    let valid2 = ["q", "r", "b", "n"];

    let answer = "";

    do {
        answer = window.prompt("Which piece to promote to?", "Queen");
    } while (!(valid.includes(answer.toLocaleLowerCase()) || valid2.includes(answer.toLocaleLowerCase())));

    switch (answer.toLocaleLowerCase()) {
        case "queen":
            return QUEEN;
        case "q":
            return QUEEN;
        case "rook":
            return ROOK;
        case "r":
            return ROOK;
        case "bishop":
            return BISHOP;
        case "b":
            return BISHOP;
        case "knight":
            return KNIGHT;
        case "n":
            return KNIGHT;
    }
}


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

        console.log(getLegalMoves(selectedPiece));

        if (getLegalMoves(selectedPiece).some(a => [row, col].every((v, i) => v === a[i]))) {
            let [capture, oldCol, special] = movePiece(selectedPiece, row, col);

            updateGravity();

            recordMove(selectedPiece, row, col, capture, oldCol, special);

            turn = 1 - turn;
        }

        selectedPiece = null;
        state = 0;
    }


    updateBoard(selectedPiece);
});


