const ChessUtils = require("../utils/ChessUtils");

let turn = 0;

class FurryBot {
    getNextMove(moves) {
        let chess = new ChessUtils();
        chess.applyMoves(moves);
        let legalMoves = chess.legalMoves();
        // this.reorder(legalMoves);
        // console.log(legalMoves);
        let bestEval = -Infinity;
        let bestMove;
        let isWhite = chess.turn() == 'w'
        for(let i = 0; i < legalMoves.length; i++) {
            
            chess.move(legalMoves[i]);
            let depth = 2;

            let val =  chess.minimax(depth, (isWhite ? 1 : -1));
           console.log("move: " + chess.uci(legalMoves[i]) + " score: " + val)
            
            chess.undo();
            if(val > bestEval) {
                bestEval = val;
                bestMove = legalMoves[i];
            }
        }
        console.log("Nodes: " + chess.nodes);

        if(legalMoves.length) {
            return chess.uci(bestMove);
        }
       
    }

    reorder(moves) {
        console.log("turn: " + turn);
        let m = ['Nf6', 'Nc6', 'e5', 'Nxe5', 'Bd6', 'Nxh5']
        for(let i = moves.length-1; i > 0; i--) {
            if(moves[i].san == m[turn]) {
                moves.unshift(moves.splice(i, 1)[0]);
                console.log("YESSSS");
                turn++;
                break;
            }
        }
    }

    getReply(chat) {
        // console.log("Chat: " + chat);
        return "FurryBot";
      }


}

module.exports = FurryBot;