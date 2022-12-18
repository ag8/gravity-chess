const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

const GRAVITY_STANDARD = 101;
const GRAVITY_BIDIRECTIONAL = 102;
const GRAVITY_LEFT = 103;
const GRAVITY_RIGHT = 104;
const GRAVITY_ALTERNATING = 105;
const GRAVITY_HOKEYPOKEY = 106;

Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => {
    img.onload = img.onerror = resolve;
}))).then(() => {
    customLoadFunction();  // Each implementation can have its own custom load function
}).then(() => {
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
        this.view = this.toString();
    }

    toString() {
        let s = "";
        if (this.type === PAWN) {
            s += "P";
        } else if (this.type === KNIGHT) {
            s += "N";
        } else if (this.type === BISHOP) {
            s += "B";
        } else if (this.type === ROOK) {
            s += "R";
        } else if (this.type === QUEEN) {
            s += "Q";
        } else if (this.type === KING) {
            s += "K";
        }
        s += ["h", "g", "f", "e", "d", "c", "b", "a"][this.col];
        s += (this.row - -1);
        if (this.color === 1) {
            s = s.toLowerCase();
        }
        return s;
    }

}

class GameState {
    constructor(pieces) {
        this.pieces = structuredClone(pieces);
        this.enPassantTargetRow = -1;
        this.enPassantTargetCol = -1;
        this.enPassantVictimRow = -1;
        this.enPassantVictimCol = -1;
        this.enPassantAllowed = false;

        this.shortCastlingAllowed = true;
        this.longCastlingAllowed = true;

        if (typeof CHOSENGRAVSTYLE !== 'undefined') {
            this.gravityStyle = CHOSENGRAVSTYLE;
        } else {
            this.gravityStyle = GRAVITY_STANDARD;
        }
    }

    setGravityStyle(gravityStyle) {
        this.gravityStyle = gravityStyle;
    }

    movePieceTo(piece, toRow, toCol) {
        for (let i = 0; i < this.pieces.length; i++) {
            let tryPiece = this.pieces[i];
            if (tryPiece.row === piece.row && tryPiece.col === piece.col && tryPiece.type === piece.type) {
                tryPiece.row = toRow;
                tryPiece.col = toCol;

                return tryPiece;
            }
        }
    }

    movePiece(piece, toRow, toCol) {
        let numPieces = this.pieces.length;
        let special = "";

        // First, check for immediate captures
        if (getPieceOn(toRow, toCol, this.pieces) != null) {
            this.pieces = this.pieces.filter(piece => !(piece.row === getPieceOn(toRow, toCol, this.pieces).row && piece.col === getPieceOn(toRow, toCol, this.pieces).col))
        }
        // Then, check for the french move
        if (this.enPassantAllowed && toRow === this.enPassantTargetRow && toCol === this.enPassantTargetCol && piece.type === PAWN) {
            this.pieces = this.pieces.filter(piece => !(piece.row === this.enPassantVictimRow && piece.col === this.enPassantVictimCol))
        }
        // Next, check if this disabled castling
        if (piece.type === KING && piece.color === 0) {
            this.shortCastlingAllowed = false;
            this.longCastlingAllowed = false;
        }
        if (piece.type === ROOK && piece.color === 0) {
            if (piece.col === 0) {
                this.shortCastlingAllowed = false;
            } else if (piece.col === 7) {
                this.longCastlingAllowed = false;
            }
        }

        let oldCol = piece.col;
        let oldRow = piece.row;

        // piece.row = toRow;
        // piece.col = toCol;
        piece = this.movePieceTo(piece, toRow, toCol);

        // Check for castling
        // Long
        if (piece.type === KING && piece.col - oldCol === 2) {
            let rookPosition = getRightRookPosition(this.pieces);
            let searchRook = getPieceOn(rookPosition[0], rookPosition[1], this.pieces);
            this.movePieceTo(searchRook, rookPosition[0], rookPosition[1] - 3);
            special = "0-0-0";
        }
        // Short
        if (piece.type === KING && piece.col - oldCol === -2) {
            let rookPosition = getLeftRookPosition(this.pieces);
            let searchRook = getPieceOn(rookPosition[0], rookPosition[1], this.pieces);
            this.movePieceTo(searchRook, rookPosition[0], rookPosition[1] + 2);
            special = "0-0";
        }

        // Check if the piece is a pawn that went two squares
        if (piece.type === PAWN && Math.abs(piece.row - oldRow) === 2) {
            this.enPassantAllowed = true;
            this.enPassantTargetCol = piece.col;
            this.enPassantTargetRow = (piece.row + oldRow) / 2;
            this.enPassantVictimCol = piece.col;
            this.enPassantVictimRow = piece.row;
        } else {
            this.enPassantAllowed = false;
        }

        // Check if the piece is a promoted pawn
        if (piece.color === 0 && piece.row === 7 && piece.type === PAWN || piece.color === 1 && piece.row === 0 && piece.type === PAWN) {
            // If we're in the real game, ask the player for a promotion.
            // Otherwise, we're in a simulation, so just assume that we always promote to a queen.
            if (this === globalGameState) {
                piece.type = askForPromotion();
            } else {
                piece.type = QUEEN;
            }
            if (numPieces <= this.pieces.length) {
                special = getCoordsName(piece.row, piece.col) + "=" + getPieceName(piece, 0, 0).substring(0, 1);
            } else {
                special = getCoordsName(piece.row, oldCol).substring(0, 1) + "x" + getCoordsName(piece.row, piece.col) + "=" + getPieceName(piece, 0, 0).substring(0, 1);
            }
        }

        return [numPieces > this.pieces.length, oldCol, oldRow, special, this.pieces];
    }

    updateGravity() {
        if (this.gravityStyle === GRAVITY_STANDARD) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row + 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
        } else if (this.gravityStyle === GRAVITY_BIDIRECTIONAL) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.color === 1) {
                        continue;
                    }

                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row + 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.color === 0) {
                        continue;
                    }

                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row - 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
        } else if (this.gravityStyle === GRAVITY_LEFT) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let leftCol = piece.col - 1;
                    let row = piece.row;

                    if (getPieceOn(row, leftCol, this.pieces) == null) {
                        if (onBoard(row, leftCol)) {
                            piece.row = row;
                            piece.col = leftCol;
                        }
                    }
                }
            }
        } else if (this.gravityStyle === GRAVITY_RIGHT) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let rightCol = piece.col + 1;
                    let row = piece.row;

                    if (getPieceOn(row, rightCol, this.pieces) == null) {
                        if (onBoard(row, rightCol)) {
                            piece.row = row;
                            piece.col = rightCol;
                        }
                    }
                }
            }
        } else if (this.gravityStyle === GRAVITY_ALTERNATING) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let newRow = piece.row + 1;
                    let col = piece.col;
                    if (col % 2 === 0) {
                        newRow = piece.row - 1;
                    }

                    if (getPieceOn(newRow, col, this.pieces) == null) {
                        if (onBoard(newRow, col)) {
                            piece.row = newRow;
                            piece.col = col;
                        }
                    }
                }
            }
        } else if (this.gravityStyle === GRAVITY_HOKEYPOKEY) {
            for (let i = 0; i < 8; i++) {  // Max eight gravity updates
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row + 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (const piece of this.pieces) {
                    if (piece.color === 1) {
                        continue;
                    }

                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row + 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (const piece of this.pieces) {
                    if (piece.color === 0) {
                        continue;
                    }

                    if (piece.type === PAWN) {
                        continue;
                    }

                    let belowRow = piece.row - 1;
                    let col = piece.col;

                    if (getPieceOn(belowRow, col, this.pieces) == null) {
                        if (onBoard(belowRow, col)) {
                            piece.row = belowRow;
                            piece.col = col;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let leftCol = piece.col - 1;
                    let row = piece.row;

                    if (getPieceOn(row, leftCol, this.pieces) == null) {
                        if (onBoard(row, leftCol)) {
                            piece.row = row;
                            piece.col = leftCol;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let rightCol = piece.col + 1;
                    let row = piece.row;

                    if (getPieceOn(row, rightCol, this.pieces) == null) {
                        if (onBoard(row, rightCol)) {
                            piece.row = row;
                            piece.col = rightCol;
                        }
                    }
                }
            }
            for (let i = 0; i < 8; i++) {
                for (const piece of this.pieces) {
                    if (piece.type === PAWN) {
                        continue;
                    }

                    let newRow = piece.row + 1;
                    let col = piece.col;
                    if (col % 2 === 0) {
                        newRow = piece.row - 1;
                    }

                    if (getPieceOn(newRow, col, this.pieces) == null) {
                        if (onBoard(newRow, col)) {
                            piece.row = newRow;
                            piece.col = col;
                        }
                    }
                }
            }
        }
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

function initGameState() {
    let gamePieces = initGamePieces();

    return new GameState(gamePieces);
}

let globalGameState = initGameState();
// The actual game code
// let player = 1;


function loadBoard() {
    updateBoard();
}

function getPieceOn(row, col, pieces) {
    for (const piece of pieces) {
        if (piece.row === row && piece.col === col) {
            return piece;
        }
    }

    return null;
}

function onBoard(row, col) {
    return 0 <= row && row <= 7 && 0 <= col && col <= 7;
}

function structuredClone(a) {  // polyfill
    return _.cloneDeep(a);
    // return JSON.parse(JSON.stringify(a));
}

function getLegalMoves(piece, gamestate, simulated = false) {
    let legalMoves = [];
    let pieces = gamestate.pieces;

    let row = piece.row;
    let col = piece.col;

    if (piece.type === PAWN) {
        if (piece.color === 0) {
            if (getPieceOn(row + 1, col, pieces) == null) {
                if (!(row === 6 && simulated)) {
                    legalMoves.push([row + 1, col]);
                }
            }

            if (row === 1) {
                if (getPieceOn(row + 2, col, pieces) == null && getPieceOn(row + 1, col, pieces) == null) {
                    legalMoves.push([row + 2, col]);
                }
            }

            if (getPieceOn(row + 1, col + 1, pieces) != null || (row + 1 === gamestate.enPassantTargetRow && col + 1 === gamestate.enPassantTargetCol && gamestate.enPassantAllowed)) {
                if (getPieceOn(row + 1, col + 1, pieces) == null) { // en passant
                    legalMoves.push([row + 1, col + 1]);
                } else if (getPieceOn(row + 1, col + 1, pieces).color === 1) {
                    legalMoves.push([row + 1, col + 1]);
                }
            }

            if (getPieceOn(row + 1, col - 1, pieces) != null || (row + 1 === gamestate.enPassantTargetRow && col - 1 === gamestate.enPassantTargetCol && gamestate.enPassantAllowed)) {
                if (getPieceOn(row + 1, col - 1, pieces) == null) { // en passant
                    legalMoves.push([row + 1, col - 1]);
                } else if (getPieceOn(row + 1, col - 1, pieces).color === 1) {
                    legalMoves.push([row + 1, col - 1]);
                }
            }
        } else {
            if (getPieceOn(row - 1, col, pieces) == null) {
                if (!(row === 1 && simulated)) {
                    legalMoves.push([row - 1, col]);
                }
            }

            if (row === 6) {
                if (getPieceOn(row - 2, col, pieces) == null && getPieceOn(row - 1, col, pieces) == null) {
                    legalMoves.push([row - 2, col]);
                }
            }

            if (getPieceOn(row - 1, col + 1, pieces) != null || (row - 1 === gamestate.enPassantTargetRow && col + 1 === gamestate.enPassantTargetCol && gamestate.enPassantAllowed)) {
                if (getPieceOn(row - 1, col + 1, pieces) == null) { // en passant
                    legalMoves.push([row - 1, col + 1]);
                } else if (getPieceOn(row - 1, col + 1, pieces).color === 0) {
                    legalMoves.push([row - 1, col + 1]);
                }
            }

            if (getPieceOn(row - 1, col - 1, pieces) != null || (row - 1 === gamestate.enPassantTargetRow && col - 1 === gamestate.enPassantTargetCol && gamestate.enPassantAllowed)) {
                if (getPieceOn(row - 1, col - 1, pieces) == null) { // en passant
                    legalMoves.push([row - 1, col - 1]);
                } else if (getPieceOn(row - 1, col - 1, pieces).color === 0) {
                    legalMoves.push([row - 1, col - 1]);
                }
            }
        }
    }


    if (piece.type === ROOK) {
        for (let i = row + 1; i < 8; i++) {
            if (getPieceOn(i, col, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col, pieces).color === piece.color) {
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
            if (getPieceOn(i, col, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(i, col, pieces).color === piece.color) {
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
            if (getPieceOn(row, i, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i, pieces).color === piece.color) {
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
            if (getPieceOn(row, i, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(row, i, pieces).color === piece.color) {
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
        if (getPieceOn(row + 2, col + 1, pieces) != null) {
            if (getPieceOn(row + 2, col + 1, pieces).color !== piece.color) {
                legalMoves.push([row + 2, col + 1]);
            }
        } else {
            if (onBoard(row + 2, col + 1)) {
                legalMoves.push([row + 2, col + 1]);
            }
        }
        if (getPieceOn(row + 2, col - 1, pieces) != null) {
            if (getPieceOn(row + 2, col - 1, pieces).color !== piece.color) {
                legalMoves.push([row + 2, col - 1]);
            }
        } else {
            if (onBoard(row + 2, col - 1)) {
                legalMoves.push([row + 2, col - 1]);
            }
        }
        if (getPieceOn(row - 2, col + 1, pieces) != null) {
            if (getPieceOn(row - 2, col + 1, pieces).color !== piece.color) {
                legalMoves.push([row - 2, col + 1]);
            }
        } else {
            if (onBoard(row - 2, col + 1)) {
                legalMoves.push([row - 2, col + 1]);
            }
        }
        if (getPieceOn(row - 2, col - 1, pieces) != null) {
            if (getPieceOn(row - 2, col - 1, pieces).color !== piece.color) {
                legalMoves.push([row - 2, col - 1]);
            }
        } else {
            if (onBoard(row - 2, col - 1)) {
                legalMoves.push([row - 2, col - 1]);
            }
        }
        if (getPieceOn(row + 1, col + 2, pieces) != null) {
            if (getPieceOn(row + 1, col + 2, pieces).color !== piece.color) {
                legalMoves.push([row + 1, col + 2]);
            }
        } else {
            if (onBoard(row + 1, col + 2)) {
                legalMoves.push([row + 1, col + 2]);
            }
        }
        if (getPieceOn(row + 1, col - 2, pieces) != null) {
            if (getPieceOn(row + 1, col - 2, pieces).color !== piece.color) {
                legalMoves.push([row + 1, col - 2]);
            }
        } else {
            if (onBoard(row + 1, col - 2)) {
                legalMoves.push([row + 1, col - 2]);
            }
        }
        if (getPieceOn(row - 1, col + 2, pieces) != null) {
            if (getPieceOn(row - 1, col + 2, pieces).color !== piece.color) {
                legalMoves.push([row - 1, col + 2]);
            }
        } else {
            if (onBoard(row - 1, col + 2)) {
                legalMoves.push([row - 1, col + 2]);
            }
        }
        if (getPieceOn(row - 1, col - 2, pieces) != null) {
            if (getPieceOn(row - 1, col - 2, pieces).color !== piece.color) {
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

            if (getPieceOn(newRow, newCol, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, pieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, pieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, pieces).color === piece.color) {
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

            if (getPieceOn(newRow, newCol, pieces) != null) { //  If there's a piece in the way
                // If it's the same color piece, that's it
                if (getPieceOn(newRow, newCol, pieces).color === piece.color) {
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
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy, gamestate, true));
        let pieceCopy2 = JSON.parse(JSON.stringify(piece));
        pieceCopy2.type = BISHOP;
        legalMoves = legalMoves.concat(getLegalMoves(pieceCopy2, gamestate, true));
    }
    if (piece.type === KING) {
        if (getPieceOn(row + 1, col + 1, pieces) != null) {
            if (getPieceOn(row + 1, col + 1, pieces).color !== piece.color) {
                legalMoves.push([row + 1, col + 1]);
            }
        } else {
            if (onBoard(row + 1, col + 1)) {
                legalMoves.push([row + 1, col + 1]);
            }
        }
        if (getPieceOn(row + 1, col - 1, pieces) != null) {
            if (getPieceOn(row + 1, col - 1, pieces).color !== piece.color) {
                legalMoves.push([row + 1, col - 1]);
            }
        } else {
            if (onBoard(row + 1, col - 1)) {
                legalMoves.push([row + 1, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col + 1, pieces) != null) {
            if (getPieceOn(row - 1, col + 1, pieces).color !== piece.color) {
                legalMoves.push([row - 1, col + 1]);
            }
        } else {
            if (onBoard(row - 1, col + 1)) {
                legalMoves.push([row - 1, col + 1]);
            }
        }
        if (getPieceOn(row - 1, col - 1, pieces) != null) {
            if (getPieceOn(row - 1, col - 1, pieces).color !== piece.color) {
                legalMoves.push([row - 1, col - 1]);
            }
        } else {
            if (onBoard(row - 1, col - 1)) {
                legalMoves.push([row - 1, col - 1]);
            }
        }
        if (getPieceOn(row, col + 1, pieces) != null) {
            if (getPieceOn(row, col + 1, pieces).color !== piece.color) {
                legalMoves.push([row, col + 1]);
            }
        } else {
            if (onBoard(row, col + 1)) {
                legalMoves.push([row, col + 1]);
            }
        }
        if (getPieceOn(row, col - 1, pieces) != null) {
            if (getPieceOn(row, col - 1, pieces).color !== piece.color) {
                legalMoves.push([row, col - 1]);
            }
        } else {
            if (onBoard(row, col - 1)) {
                legalMoves.push([row, col - 1]);
            }
        }
        if (getPieceOn(row - 1, col, pieces) != null) {
            if (getPieceOn(row - 1, col, pieces).color !== piece.color) {
                legalMoves.push([row - 1, col]);
            }
        } else {
            if (onBoard(row - 1, col)) {
                legalMoves.push([row - 1, col]);
            }
        }
        if (getPieceOn(row + 1, col, pieces) != null) {
            if (getPieceOn(row + 1, col, pieces).color !== piece.color) {
                legalMoves.push([row + 1, col]);
            }
        } else {
            if (onBoard(row + 1, col)) {
                legalMoves.push([row + 1, col]);
            }
        }

        // Castling

        let castlingValid = false;

        if (simulated) {
            castlingValid = true;
        } else {
            castlingValid = !inCheck(piece, gamestate)
        }

        if (castlingValid) {
            if (piece.color !== 1) {
                // Long castling
                if (getPieceOn(row, col + 1, pieces) === null && getPieceOn(row, col + 2, pieces) === null && getPieceOn(row, col + 3, pieces) === null && gamestate.longCastlingAllowed) {
                    // Check whether rook can move right
                    let rookPos = getRightRookPosition(pieces);

                    if (rookPos[0] !== -1 && getPieceOn(rookPos[0], rookPos[1] - 1, pieces) === null && getPieceOn(rookPos[0], rookPos[1] - 2, pieces) === null && getPieceOn(rookPos[0], rookPos[1] - 3, pieces) === null) {
                        legalMoves.push([row, col + 2]);
                    }
                }

                // Short castling
                if (getPieceOn(row, col - 1, pieces) === null && getPieceOn(row, col - 2, pieces) === null && gamestate.shortCastlingAllowed) {
                    let rookPos = getLeftRookPosition(pieces);

                    // console.log("Rook position:" + rookPos);

                    if (rookPos[0] !== -1 && getPieceOn(rookPos[0], rookPos[1] + 1, pieces) === null && getPieceOn(rookPos[0], rookPos[1] + 2, pieces) === null) {
                        legalMoves.push([row, col - 2]);
                    }
                }
            }
        }
    }

    function testLegality(move, piece, gamestate) {
        let hypotheticalGamestate = structuredClone(gamestate);
        let [_, __, ___, ____, newPieces] = hypotheticalGamestate.movePiece(piece, move[0], move[1]);
        hypotheticalGamestate.pieces = newPieces;
        hypotheticalGamestate.updateGravity();

        let kingLocation = getKingLocation(turn, hypotheticalGamestate.pieces);

        for (const chPiece of hypotheticalGamestate.pieces) {
            if (chPiece.color !== turn) {  // If it's the opposite color
                let opponentPieceLegalMoves = getLegalMoves(chPiece, structuredClone(hypotheticalGamestate), true);

                for (const potentialOpponentMove of opponentPieceLegalMoves) {
                    if (potentialOpponentMove[0] === kingLocation[0] && potentialOpponentMove[1] === kingLocation[1]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // return legalMoves;

    // If we're in the recursion, return all the moves
    if (simulated) {
        return legalMoves;
    }

    // Otherwise, return only the actually legal moves
    let actuallyLegalMoves = [];

    for (let i = 0; i < legalMoves.length; i++) {
        let actuallyLegal = testLegality(legalMoves[i], structuredClone(piece), structuredClone(gamestate));

        if (actuallyLegal) {
            actuallyLegalMoves.push(legalMoves[i]);
        }
    }

    return actuallyLegalMoves;
}

function getLeftRookPosition(pieces) {
    for (const piece of pieces) {
        if (piece.type === ROOK && piece.col === 0 && piece.color === 0) {
            return [piece.row, piece.col];
        }
    }

    return [-1, -1];
}

function getRightRookPosition(pieces) {
    for (const piece of pieces) {
        if (piece.type === ROOK && piece.col === 7 && piece.color === 0) {
            return [piece.row, piece.col];
        }
    }

    return [-1, -1];
}

function getKingLocation(whichPlayer, pieces) {
    for (const piece of pieces) {
        if (piece.type === KING && piece.color === whichPlayer) {
            return [piece.row, piece.col];
        }
    }

    throw 'No king of this color on the board!';
}

function inCheck(king, state) {
    for (let piece of state.pieces) {
        for (let move of getLegalMoves(piece, state, true)) {
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
            let legalMoves = getLegalMoves(structuredClone(piece), structuredClone(globalGameState));

            function highlightLegalMove(move) {
                ctx.fillStyle = '#f7799e';
                ctx.fillRect(move[1] * SIZE, move[0] * SIZE, SIZE, SIZE);
            }

            legalMoves.forEach(highlightLegalMove);
        }

        if (piece.type === KING && inCheck(piece, globalGameState)) {
            ctx.fillStyle = '#ff4c4c';
            ctx.fillRect(piece.col * SIZE, piece.row * SIZE, SIZE, SIZE);
        }

        if (piece === selectedPiece) {
            drawPiece(piece);

            drawCircle(piece);

            highlightLegalMoves(structuredClone(piece));
        } else {
            drawPiece(piece);
        }
    }

    globalGameState.pieces.forEach(drawPieceDetailed);
    globalGameState.pieces.forEach(drawPiece);
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
    for (const piece of globalGameState.pieces) {
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

let state = 0;
let turn = 0;
let selectedPiece = null;
let move = 1;
let gameRecord = "";


function recordMove(selectedPiece, row, col, capture, oldCol, oldRow, special) {
    let pieceName = getPieceName(selectedPiece, capture, oldCol, oldRow), coordsName = getCoordsName(row, col),
        captureName = capture ? "x" : "", currentMoveRecord;

    if (turn === 0) {
        currentMoveRecord = special.length === 0 ? move + ". " + pieceName + "" + captureName + "" + coordsName + " " : move + ". " + special + " ";
    } else {
        currentMoveRecord = special.length === 0 ? pieceName + "" + captureName + "" + coordsName + " " : special + " ";
        move++;
    }

    let winner = gameOver(globalGameState);

    if (winner === 1) {
        currentMoveRecord = currentMoveRecord.slice(0, -1);
        currentMoveRecord += "# <span style=\"white-space: nowrap\">0–1</span>"
    } else if (winner === 0) {
        currentMoveRecord = currentMoveRecord.slice(0, -1);
        currentMoveRecord += "# <span style=\"white-space: nowrap\">1–0</span>"
    }

    gameRecord += currentMoveRecord;


    let div = document.createElement("div");
    div.className = "move-record";
    div.innerHTML = currentMoveRecord;

    document.getElementById("game-record-flex").appendChild(div);


    // Get the name of the opening, if there is one
    updateOpeningName();
}

function updateOpeningName() {
    httpGetAsync("https://gravity-chess.andrew.gr/game-test/get_opening.php?gravity=" + globalGameState.gravityStyle + "&record=" + gameRecord, updateOpeningDiv);
}

function updateOpeningDiv(openingName) {
    if (openingName !== "None") {
        document.getElementById("opening-name").innerHTML = openingName;
    }
}

function gameOver(gamestate) {
    /**
     * Returns the loser
     * @type {number}
     */

    let numLegalMoves = 0;
    for (let piece of gamestate.pieces) {
        if (piece.color === 1 - turn) {
            // Sooo sketchy lol
            turn = 1 - turn;
            let legalMoves = getLegalMoves(piece, gamestate)
            turn = 1 - turn;
            numLegalMoves += legalMoves.length;
        }
    }

    // console.log(numLegalMoves);
    // console.log("");
    if (numLegalMoves === 0) return turn;
}

function getPieceName(piece, capture, oldCol, oldRow) {
    if (piece.type === PAWN) {
        if (!capture) {
            return "";
        } else {
            return getCoordsName(piece.row, oldCol)[0];
        }
    } else if (piece.type === ROOK) {
        return "R(" + getCoordsName(oldRow, oldCol) + ")";
    } else if (piece.type === KNIGHT) {
        return "N(" + getCoordsName(oldRow, oldCol) + ")";
    } else if (piece.type === BISHOP) {
        return "B(" + getCoordsName(oldRow, oldCol) + ")";
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
