function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));


function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function getPieceRepresentationAt(row, col, pieces) {
    for (let piece of pieces) {
        if (piece.row === row && piece.col === col) {
            if (piece.type === PAWN) {
                return "p";
            } else if (piece.type === ROOK) {
                return "R";
            } else if (piece.type === KNIGHT) {
                return "N";
            } else if (piece.type === BISHOP) {
                return "B";
            } else if (piece.type === QUEEN) {
                return "Q";
            } else if (piece.type === KING) {
                return "K";
            }
        }
    }

    return ".";
}

function prettyPrint(pieces) {
    let line = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            line += getPieceRepresentationAt(row, col, pieces);
        }

        line += "\n";
    }

    console.log(line);
}