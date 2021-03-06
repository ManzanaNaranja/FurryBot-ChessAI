const Chess = require("chess.js").Chess;
const Tables = require("./piecetable.json");

/**
 * Wraps chess.js with useful extras.
 */
class ChessUtils {

  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.chess = new Chess(fen);
    this.nodes = 0;
  }

  reset() {
    this.chess.reset();
  }

  applyMoves(moves) {
    moves.forEach(move => this.chess.move(move, { sloppy: true }));
  }

  /**
   * Convert a chess.js move to a uci move
   */
  uci(move) {
    return move.from + move.to + (move.flags === "p" ? move.piece : "");
  }

  /**
   * Legal moves from current position.
   */
  legalMoves() {
    return this.chess.moves({ verbose: true });
  }

  fen() {
    return this.chess.fen();
  }

  move(move) {
    this.chess.move(move);
  }

  undo() {
    this.chess.undo();
  }

  turn() {
    return this.chess.turn();
  }

  squaresOf(colour) {
    return this.chess.SQUARES.filter(square => {
      const r = this.chess.get(square);
      return r && r.color === colour;
    });
  }

  squareOfKing() {
    return this.squaresOfPiece(this.chess.turn(), "k");
  }

  squareOfOpponentsKing() {
    return this.squaresOfPiece(this.otherPlayer(this.chess.turn()), "k");
  }

  squaresOfPiece(colour, pieceType) {
    return this.squaresOf(colour).find(square => this.chess.get(square).type.toLowerCase() === pieceType);
  }

  coordinates(square) {
    return { x: square.charCodeAt(0) - "a".charCodeAt(0) + 1, y: Number(square.substring(1, 2)) };
  }

  distance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }

  manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  euclideanDistance(a, b) {
    const dx = (a.x - b.x);
    const dy = (a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
  }

  otherPlayer(colour) {
    return colour === "w" ? "b" : "w";
  }

  pickRandomMove(moves) {
    return this.uci(moves[Math.floor(Math.random() * moves.length)]);
  }

  filterForcing(legalMoves) {
    const mates = legalMoves.filter(move => /#/.test(move.san));
    return mates.length ? mates : legalMoves.filter(move => /\+/.test(move.san));
  }

  inCheckmate() {
    return this.chess.in_checkmate();
  }

  inStalemate() {
    return this.chess.in_stalemate();
  }

  inThreeFold() {
    return this.chess.in_threefold_repetition();
  }

  materialEval() {
    return this.material("w") - this.material("b");
  }

  material(colour) {
    const valueOf = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0};
    return this.squaresOf(colour).map(square => valueOf[this.chess.get(square).type]).reduce((a, b) => a + b);
  }

  // material(colour) {
  //   const valueOf = { p: 1, n: 3, b: 3, r: 6, q: 9, k: 0 };
  //   return this.squaresOf(colour).map(square => valueOf[this.chess.get(square).type]).reduce((a, b) => a + b);
  // }

   

  minimax(depth, c) {
     let result = this.mini(depth, -Infinity, Infinity, c);     
    //  let result = this.mini(depth, c);
    //  console.log("Nodes: " + this.nodes);
     return result;
  }

  

  maxi(depth, alpha, beta, c) {
    this.nodes++;
     if(depth == 0 || this.chess.game_over()) return c * this.evaluate(depth);
    let max = -Infinity;
    let moves = this.legalMoves();
    for(let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      let score = this.mini(depth-1, alpha, beta, c);
       this.undo();
      max = Math.max(max, score);
      alpha = Math.max(alpha, max);
      if(beta <= alpha) {
        break;
      }
    }
    return max;
  }

  mini(depth, alpha, beta, c) {
    this.nodes++;
    if(depth == 0 || this.chess.game_over()) return c * this.evaluate(depth);
    let min = Infinity;
    let moves = this.legalMoves();
    for(let i = 0; i < moves.length; i++) {
      this.move(moves[i]);
      let score = this.maxi(depth-1, alpha, beta, c);
      this.undo();
      min = Math.min(min, score);
      beta = Math.min(beta, min);
      if(beta <= alpha){
        break;
      }
    }
    return min;
  }

  evaluate(depth) {
    if(this.turn() == 'b' && this.inCheckmate()) return 500000 + depth; // the more "depths" left to recursively call, means mate is short/more deadly
    if(this.turn() == 'w' && this.inCheckmate()) return -500000 - depth; // the more "depths" left to recursively call, means mate is short/more deadly
    if(this.inStalemate()) return 0;
    if(this.inThreeFold()) return -150;
    return this.materialEval() + this.pieceTableEval();
  }

  pieceTableEval() {
    let keys = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let evaluation = 0;
    keys.forEach(s => {
        for(let i = 1; i < 9; i++) {
          let square = s + i;
          let squareData = this.chess.get(square);
          if(squareData) {
            let piece = this.chess.get(square).type;
            let color = this.chess.get(square).color;
            let sqnm = this.squarenumber(square, color);
            if(color == 'w') {
              evaluation += Tables[piece][sqnm]
            } else { // black
             evaluation -= Tables[piece][sqnm]
            }
          }



        }
    })
    return evaluation;
  }

  squarenumber(square, col) { // 0 - 63
    let pos = this.coordinates(square);
    pos.x -= 1;
    pos.y -= 1;
    if(col == 'w') {
      return pos.x + 8 * pos.y;
    } else {
      return 63 - (pos.x + 8 * pos.y);
    }
    
  }


}






module.exports = ChessUtils;
