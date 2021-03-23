const ChessUtils = require("../utils/ChessUtils");

class FurryBot {
    getNextMove(moves) {
        let chess = new ChessUtils();
        chess.applyMoves(moves);
        let legalMoves = chess.legalMoves();
        
        let bestEval = -Infinity;
        let bestMove;
        let isWhite = chess.turn() == 'w'
        for(let i = 0; i < legalMoves.length; i++) {
            
            chess.move(legalMoves[i]);
            // let val = chess.materialEval();
            let depth = 2;
            
            // let val =  chess.mini(depth, -Infinity, Infinity, (isWhite ? 1 : -1));
            let val =  chess.mini(depth, -Infinity, Infinity, (isWhite ? 1 : -1));
            
            chess.undo();
            if(val > bestEval) {
                bestEval = val;
                bestMove = legalMoves[i];
            }
        }

        if(legalMoves.length) {
            return chess.uci(bestMove);
        }
       
    }

    getReply(chat) {
        // console.log("Chat: " + chat);
        return "FurryBot";
      }


}

module.exports = FurryBot;