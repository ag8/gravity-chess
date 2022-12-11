const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

const depth = window.prompt("What difficulty AI do you want to play? [1: easy, 3: medium, 5: hard]", "3");

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

let lastWhiteMovedPieceFromRow = null;
let lastWhiteMovedPieceFromCol = null;
let lastWhiteMovedPieceToRow = null;
let lastWhiteMovedPieceToCol = null;

const PAWN_VALUE = 40;
const KNIGHT_VALUE = 50;
const BISHOP_VALUE = 50;
const ROOK_VALUE = 30;
const QUEEN_VALUE = 80;
const KING_VALUE = 10000;


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


function checkmate() {
    return false;
}

// The actual game code
player = 1;

// while (!checkmate()) {
//     {
//         player = 1 - player;
//
//         // Draw the board
//         drawBoard();
//     }
let turn;

// }

function loadBoard() {
    updateBoard();

    whiteMove();
    updateGravity(gamePieces);
    turn = 1 - turn;

    updateBoard();
}

function getPieceOn(row, col, allPieces) {
    for (const piece of allPieces) {
        if (piece.row === row && piece.col === col) {
            return piece;
        }
    }

    return null;
}

function onBoard(row, col) {
    return 0 <= row && row <= 7 && 0 <= col && col <= 7;
}

function getLegalMoves(piece, allPieces) {
    let legalMoves = [];

    let row = piece.row;
    let col = piece.col;

    if (piece.type === PAWN) {
        if (piece.color === 0) {
            if (getPieceOn(row + 1, col, allPieces) == null) {
                legalMoves.push([row + 1, col]);
            }

            if (row === 1) {
                if (getPieceOn(row + 2, col, allPieces) == null) {
                    legalMoves.push([row + 2, col]);
                }
            }

            if (getPieceOn(row + 1, col + 1, allPieces) != null) {
                if (getPieceOn(row + 1, col + 1, allPieces).color === 1) {
                    legalMoves.push([row + 1, col + 1]);
                }
            }

            if (getPieceOn(row + 1, col - 1, allPieces) != null) {
                if (getPieceOn(row + 1, col - 1, allPieces).color === 1) {
                    legalMoves.push([row + 1, col - 1]);
                }
            }
        } else {
            if (getPieceOn(row - 1, col, allPieces) == null) {
                legalMoves.push([row - 1, col]);
            }

            if (row === 6) {
                if (getPieceOn(row - 2, col, allPieces) == null) {
                    legalMoves.push([row - 2, col]);
                }
            }

            if (getPieceOn(row - 1, col + 1, allPieces) != null) {
                if (getPieceOn(row - 1, col + 1, allPieces).color === 0) {
                    legalMoves.push([row - 1, col + 1]);
                }
            }

            if (getPieceOn(row - 1, col - 1, allPieces) != null) {
                if (getPieceOn(row - 1, col - 1, allPieces).color === 0) {
                    legalMoves.push([row - 1, col - 1]);
                }
            }
        }
    }


    if (piece.type === ROOK) {
        for (let i = row + 1; i < 8; i++) {
            if (getPieceOn(i, col, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col, allPieces).color === piece.color) {
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
            if (getPieceOn(i, col, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col, allPieces).color === piece.color) {
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
            if (getPieceOn(row, i, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i, allPieces).color === piece.color) {
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
            if (getPieceOn(row, i, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i, allPieces).color === piece.color) {
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
        if (getPieceOn(row + 2, col + 1, allPieces) != null) {
            if (getPieceOn(row + 2, col + 1, allPieces).color !== piece.color) {
                legalMoves.push([row + 2, col + 1]);
            }
        } else {
            if (onBoard(row + 2, col + 1)) {
                legalMoves.push([row + 2, col + 1]);
            }
        }
        if (getPieceOn(row + 2, col - 1, allPieces) != null) {
            if (getPieceOn(row + 2, col - 1, allPieces).color !== piece.color) {
                legalMoves.push([row + 2, col - 1]);
            }
        } else {
            if (onBoard(row + 2, col - 1)) {
                legalMoves.push([row + 2, col - 1]);
            }
        }
        if (getPieceOn(row - 2, col + 1, allPieces) != null) {
            if (getPieceOn(row - 2, col + 1, allPieces).color !== piece.color) {
                legalMoves.push([row - 2, col + 1]);
            }
        } else {
            if (onBoard(row - 2, col + 1)) {
                legalMoves.push([row - 2, col + 1]);
            }
        }
        if (getPieceOn(row - 2, col - 1, allPieces) != null) {
            if (getPieceOn(row - 2, col - 1, allPieces).color !== piece.color) {
                legalMoves.push([row - 2, col - 1]);
            }
        } else {
            if (onBoard(row - 2, col - 1)) {
                legalMoves.push([row - 2, col - 1]);
            }
        }
        if (getPieceOn(row + 1, col + 2, allPieces) != null) {
            if (getPieceOn(row + 1, col + 2, allPieces).color !== piece.color) {
                legalMoves.push([row + 1, col + 2]);
            }
        } else {
            if (onBoard(row + 1, col + 2)) {
                legalMoves.push([row + 1, col + 2]);
            }
        }
        if (getPieceOn(row + 1, col - 2, allPieces) != null) {
            if (getPieceOn(row + 1, col - 2, allPieces).color !== piece.color) {
                legalMoves.push([row + 1, col - 2]);
            }
        } else {
            if (onBoard(row + 1, col - 2)) {
                legalMoves.push([row + 1, col - 2]);
            }
        }
        if (getPieceOn(row - 1, col + 2, allPieces) != null) {
            if (getPieceOn(row - 1, col + 2, allPieces).color !== piece.color) {
                legalMoves.push([row - 1, col + 2]);
            }
        } else {
            if (onBoard(row - 1, col + 2)) {
                legalMoves.push([row - 1, col + 2]);
            }
        }
        if (getPieceOn(row - 1, col - 2, allPieces) != null) {
            if (getPieceOn(row - 1, col - 2, allPieces).color !== piece.color) {
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

            if (getPieceOn(newRow, newCol, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, allPieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, allPieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, allPieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, allPieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, allPieces).color === piece.color) {
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
        pieceCopy = JSON.parse(JSON.stringify(piece));
        pieceCopy.type = ROOK;
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy, allPieces));
        pieceCopy2 = JSON.parse(JSON.stringify(piece));
        pieceCopy2.type = BISHOP;
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy2, allPieces));
    }
    if (piece.type === KING) {
        if (getPieceOn(row + 1, col + 1, allPieces) != null) {
            if (getPieceOn(row + 1, col + 1, allPieces).color !== piece.color) {
                legalMoves.push([row + 1, col + 1]);
            }
        } else {
            if (onBoard(row + 1, col + 1)) {
                legalMoves.push([row + 1, col + 1]);
            }
        }
        if (getPieceOn(row + 1, col - 1, allPieces) != null) {
            if (getPieceOn(row + 1, col - 1, allPieces).color !== piece.color) {
                legalMoves.push([row + 1, col - 1]);
            }
        } else {
            if (onBoard(row + 1, col - 1)) {
                legalMoves.push([row + 1, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col + 1, allPieces) != null) {
            if (getPieceOn(row - 1, col + 1, allPieces).color !== piece.color) {
                legalMoves.push([row - 1, col + 1]);
            }
        } else {
            if (onBoard(row - 1, col + 1)) {
                legalMoves.push([row - 1, col + 1]);
            }
        }
        if (getPieceOn(row - 1, col - 1, allPieces) != null) {
            if (getPieceOn(row - 1, col - 1, allPieces).color !== piece.color) {
                legalMoves.push([row - 1, col - 1]);
            }
        } else {
            if (onBoard(row - 1, col - 1)) {
                legalMoves.push([row - 1, col - 1]);
            }
        }
        if (getPieceOn(row, col + 1, allPieces) != null) {
            if (getPieceOn(row, col + 1, allPieces).color !== piece.color) {
                legalMoves.push([row, col + 1]);
            }
        } else {
            if (onBoard(row, col + 1)) {
                legalMoves.push([row, col + 1]);
            }
        }
        if (getPieceOn(row, col - 1, allPieces) != null) {
            if (getPieceOn(row, col - 1, allPieces).color !== piece.color) {
                legalMoves.push([row, col - 1]);
            }
        } else {
            if (onBoard(row, col - 1)) {
                legalMoves.push([row, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col, allPieces) != null) {
            if (getPieceOn(row - 1, col, allPieces).color !== piece.color) {
                legalMoves.push([row - 1, col]);
            }
        } else {
            if (onBoard(row - 1, col)) {
                legalMoves.push([row - 1, col]);
            }
        }
        if (getPieceOn(row + 1, col, allPieces) != null) {
            if (getPieceOn(row + 1, col, allPieces).color !== piece.color) {
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

function inCheck(king) {
    for (let piece of gamePieces) {
        for (let move of getLegalMoves(piece, gamePieces)) {
            if (move[0] === king.row && move[1] === king.col) {
                return true;
            }
        }
    }

    return false;
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
            let legalMoves = getLegalMoves(piece, gamePieces);

            function highlightLegalMove(move) {
                ctx.fillStyle = '#f7799e';
                ctx.fillRect(move[1] * SIZE, move[0] * SIZE, SIZE, SIZE);
            }

            legalMoves.forEach(highlightLegalMove)
        }

        if (piece.type === KING && inCheck(piece)) {
            ctx.fillStyle = '#ff4c4c';
            ctx.fillRect(piece.col * SIZE, piece.row * SIZE, SIZE, SIZE);
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
            if (lastWhiteMovedPieceFromCol != null) {
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

function get_image_scale(image) {
    w = (black_pawn_image.width / 128 * SIZE);
    h = (black_pawn_image.height / 128 * SIZE);

    return [w, h]
}

function drawPiece(piece) {
    if (piece.type === PAWN) {
        let image = white_pawn_image;
        if (piece.color === 1) {
            image = black_pawn_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === ROOK) {
        let image = white_rook_image;
        if (piece.color === 1) {
            image = black_rook_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === KNIGHT) {
        let image = white_knight_image;
        if (piece.color === 1) {
            image = black_knight_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === BISHOP) {
        let image = white_bishop_image;
        if (piece.color === 1) {
            image = black_bishop_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === QUEEN) {
        let image = white_queen_image;
        if (piece.color === 1) {
            image = black_queen_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
    } else if (piece.type === KING) {
        let image = white_king_image;
        if (piece.color === 1) {
            image = black_king_image;
        }

        let [w, h] = get_image_scale(image);

        offsetw = piece.col * SIZE;
        offseth = piece.row * SIZE;

        ctx.drawImage(image, offsetw + 0.2 * w, offseth + 0.1 * h, 0.8 * w, 0.8 * h);
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
        lowX = SIZE * piece.col;
        lowY = SIZE * piece.row;
        highX = lowX + SIZE;
        highY = lowY + SIZE;

        if (lowX < x && x < highX && lowY < y && y < highY) {
            return piece;
        }
    }

    return null;
}

function getSelectedSquare(x, y) {
    return [Math.floor(y / SIZE), Math.floor(x / SIZE)];
}

function updateGravity(allPieces) {
    for (let i = 0; i < 8; i++) {  // Max eight gravity updates
        for (const piece of allPieces) {
            if (piece.type === PAWN) {
                continue;
            }

            let belowRow = piece.row + 1;
            let col = piece.col;

            if (getPieceOn(belowRow, col, allPieces) == null) {
                if (onBoard(belowRow, col)) {
                    piece.row = belowRow;
                    piece.col = col;
                }
            }
        }
    }
}

let state = 0;
turn = 0;
let selectedPiece = null;

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


function movePiece(piece, toRow, toCol, allPieces) {
    let numPieces = allPieces.length;

    // First, check for immediate captures
    if (getPieceOn(toRow, toCol, allPieces) != null) {
        allPieces = allPieces.filter(piece => !(piece.row === getPieceOn(toRow, toCol, allPieces).row && piece.col === getPieceOn(toRow, toCol, allPieces).col))
    }

    let oldCol = piece.col;

    piece.row = toRow;
    piece.col = toCol;

    // Check if the piece is a promoted pawn
    if (piece.color === 0 && piece.row === 7 && piece.type === PAWN && allPieces === gamePieces) {
        piece.type = askForPromotion();
    } else if (piece.color === 1 && piece.row === 0 && piece.type === PAWN && allPieces === gamePieces) {
        piece.type = askForPromotion();
    }

    return [numPieces > allPieces.length, oldCol, allPieces];
}

var move = 1;
var gameRecord = "";

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

function recordMove(selectedPiece, row, col, capture, oldCol) {
    let pieceName = getPieceName(selectedPiece, capture, oldCol);
    let coordsName = getCoordsName(row, col);
    let captureName = capture ? "x" : "";

    if (turn === 0) {
        gameRecord += move + ". " + pieceName + "" + captureName + "" + coordsName + " ";
    } else {
        gameRecord += pieceName + "" + captureName + "" + coordsName + " ";
        move++;
    }

    document.getElementById("game-record").textContent = gameRecord;
}

function whiteKingCol() {
    for (let piece of gamePieces) {
        if (piece.type === KING && piece.color === 0) {
            return piece.col;
        }
    }

    return -1;
}

function evaluate(allPieces, color) {
    let sum = 0;

    for (let piece of allPieces) {
        switch (piece.type) {
            case PAWN:
                if (piece.col === whiteKingCol() && piece.color === 0) {
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

function getEquivalentPiece(piece, allPieces) {
    for (let aPiece of allPieces) {
        if (aPiece.row === piece.row && aPiece.col === piece.col && aPiece.type === piece.type && aPiece.color === piece.color) {
            return aPiece;
        }
    }

    return null;
}

function boardify(pieces) {
    let s = "";

    for (let piece of pieces) {
        let pieceName = getPieceName(piece);
        let coordsName = getCoordsName(piece.row, piece.col);
        let color = piece.color === 0 ? "White " : "Black ";
        s += color + pieceName + "" + coordsName + ", ";
    }

    return s;
}

function p(depth) {
    return " ".repeat(4 * (2 - depth));
}

function getPieceColor(piece) {
    return piece.color === 0 ? "White" : "Black";
}

function negamax(currentPieces, depth, alpha, beta, color) {
    // console.log(p(depth) + "Negamax depth " + depth + ".");
    // console.log(p(depth) + "Current board: " + boardify(currentPieces));

    if (depth === 0 || gameOver(currentPieces)) {
        // console.log(p(depth) + "Eval: " + evaluate(currentPieces, color));
        return [evaluate(currentPieces, color), null, null, null];
    }

    let currentPiecesString = JSON.stringify(currentPieces);
    let currentPiecesCopy = JSON.parse(currentPiecesString);
    let anotherPiecesCopy = JSON.parse(currentPiecesString);

    let bestPiece = null;
    let bestTarget = null;
    let value = Number.NEGATIVE_INFINITY;

    dance:
        for (let potentialPiece of anotherPiecesCopy) {
            if (potentialPiece.color !== color) {  // Can't move wrong pieces!
                continue;
            }

            // Save the old position of this piece
            let originalPositionRow = potentialPiece.row;
            let originalPositionCol = potentialPiece.col;

            let legalMoves = getLegalMoves(potentialPiece, currentPiecesCopy);

            for (let potentialMove of legalMoves) {
                // console.log(p(depth) + "Trying move " + getPieceColor(potentialPiece) + " " + getPieceName(potentialPiece) + " to " + getCoordsName(potentialMove[0], potentialMove[1]) + ".");

                // Make this move and see what happens
                let realPieceToMove = getEquivalentPiece(potentialPiece, currentPiecesCopy);
                let [capture, oldCol, newPieces] = movePiece(realPieceToMove, potentialMove[0], potentialMove[1], currentPiecesCopy);
                currentPiecesCopy = newPieces;

                updateGravity(currentPiecesCopy);

                // Evaluate the result
                let child_negamax = 0 - negamax(currentPiecesCopy, depth - 1, 0 - beta, 0 - alpha, 1 - color)[0];
                // let evaluation = Math.max(evaluate(gamePiecesCopy, color), child_negamax);

                hehe: if (child_negamax >= value) {
                    if (child_negamax === value) {
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
                    if (alpha >= beta) {
                        break dance;
                    }

                }

                // Reset the board
                currentPiecesCopy = JSON.parse(currentPiecesString);
            }
        }

    let piece = getEquivalentPiece(bestPiece, currentPieces);
    let moveRow = bestTarget[0];
    let moveCol = bestTarget[1];

    // console.log(p(depth) + "Best evaluation: " + value);
    return [value, piece, moveRow, moveCol];
}

function whiteMove() {
    // let gamePiecesString = JSON.stringify(gamePieces);
    // let gamePiecesCopy = JSON.parse(gamePiecesString);Ø

    let [bestEval, piece, moveRow, moveCol] = negamax(gamePieces, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0);

    lastWhiteMovedPieceFromRow = piece.row;
    lastWhiteMovedPieceFromCol = piece.col;
    lastWhiteMovedPieceToRow = moveRow;
    lastWhiteMovedPieceToCol = moveCol;

    console.log("Evaluation: " + bestEval);

    // Actually complete the move!
    let [capture, oldCol, newPieces] = movePiece(piece, moveRow, moveCol, gamePieces);
    gamePieces = newPieces;
    recordMove(piece, moveRow, moveCol, capture, oldCol);
}

function whiteMoveAndUpdateGravityAndBoard() {
    turn = 1 - turn;
    whiteMove();
    turn = 1 - turn;
    updateGravity(gamePieces);
    updateBoard();
}

const updateAndWhiteMove = async () => {
    (function (next) {
        updateBoard();
        next()
    }(function () {
        setTimeout(whiteMoveAndUpdateGravityAndBoard, 100);
    }))
};

function gameOver(pieces) {
    let numKings = 0;

    for (let piece of pieces) {
        if (piece.type === KING) {
            numKings++;
        }
    }

    return numKings !== 2;
}

canvas.addEventListener('mousedown', function (e) {
    if (gameOver(gamePieces)) {
        console.log("Game over!");
        return false;
    }

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

        // console.log(getLegalMoves(selectedPiece, gamePieces));

        if (getLegalMoves(selectedPiece, gamePieces).some(a => [row, col].every((v, i) => v === a[i]))) {
            let [capture, oldCol, newPieces] = movePiece(selectedPiece, row, col, gamePieces);
            gamePieces = newPieces;

            updateGravity(gamePieces);

            recordMove(selectedPiece, row, col, capture, oldCol);

            // turn = 1 - turn;

            updateAndWhiteMove();

            // turn = 1 - turn;
        }

        selectedPiece = null;
        state = 0;
    }


    updateBoard(selectedPiece);
});


