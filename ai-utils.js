function getAllMoves(piece, gamestate) {
    let legalMoves = [];
    let pieces = gamestate.pieces;

    let row = piece.row;
    let col = piece.col;

    if (piece.type === PAWN) {
        if (piece.color === 0) {
            if (getPieceOn(row + 1, col, pieces) == null) {
                // if (!(row === 6)) {
                    legalMoves.push([row + 1, col]);
                // }
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
                // if (!(row === 1)) {
                    legalMoves.push([row - 1, col]);
                // }
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

        let castlingValid = !inCheck(piece, gamestate);

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
    // return legalMoves;

    // If we're in the recursion, return all the moves
    return legalMoves;
}