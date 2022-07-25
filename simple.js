
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

            turn = 1 - turn;
        }

        selectedPiece = null;
        state = 0;
    }

    updateBoard(selectedPiece);
});

