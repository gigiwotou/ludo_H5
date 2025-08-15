import Board from './board.js';
import Player from './player.js';

class Game {
    constructor() {
        this.board = new Board();
        this.players = [
            new Player('yellow', this.board),  // 人类玩家
            new Player('red', this.board),     // AI玩家
            new Player('green', this.board),   // AI玩家
            new Player('blue', this.board)     // AI玩家
        ];
        this.currentPlayerIndex = 0;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        this.diceValue = 0;
        this.isGameOver = false;
        this.isHumanPlayer = true; // 黄色玩家是人类
        this.initializeEventListeners();
        this.updateStatus();
    }

    initializeEventListeners() {
        const rollDiceButton = document.getElementById('roll-dice');
        rollDiceButton.addEventListener('click', () => this.rollDice());

        // 为所有棋子添加点击事件
        document.querySelectorAll('.player-piece').forEach(piece => {
            piece.addEventListener('click', () => this.handlePieceClick(piece));
        });
    }

    rollDice() {
        if (this.isGameOver) return;

        // 生成1-6的随机数
        this.diceValue = Math.floor(Math.random() * 6) + 1;
        document.querySelector('.dice').textContent = this.diceValue;

        // 如果是AI玩家，自动移动棋子
        if (!this.isHumanPlayer) {
            setTimeout(() => {
                this.autoMovePiece();
            }, 1000);
            return;
        }

        // 如果掷出6，可以再掷一次
        if (this.diceValue !== 6) {
            this.switchPlayer();
        }
    }

    handlePieceClick(piece) {
        if (this.isGameOver) return;

        const color = piece.classList[1].split('-')[1];
        const pieceIndex = parseInt(piece.dataset.index);

        // 检查是否是当前玩家的棋子
        if (color !== this.currentPlayer.color) {
            alert('现在不是' + this.getColorName(color) + '玩家的回合');
            return;
        }

        // 尝试移动棋子
        if (this.currentPlayer.movePiece(pieceIndex, this.diceValue)) {
            // 检查是否获胜
            if (this.currentPlayer.hasWon()) {
                this.isGameOver = true;
                alert(this.getColorName(this.currentPlayer.color) + '玩家获胜！');
                return;
            }

            // 如果没有掷出6，切换玩家
            if (this.diceValue !== 6) {
                this.switchPlayer();
            } else {
                // 掷出6，可以再掷一次
                document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (再掷一次)`;
            }
        } else {
            alert('无法移动该棋子');
        }
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        this.isHumanPlayer = (this.currentPlayerIndex === 0); // 只有黄色玩家是人类
        this.updateStatus();

        // 如果是AI玩家，自动掷骰子
        if (!this.isHumanPlayer && !this.isGameOver) {
            setTimeout(() => {
                this.rollDice();
            }, 1000);
        }
    }

    updateStatus() {
        if (this.isHumanPlayer) {
            document.querySelector('.status').textContent = '轮到你了';
        } else {
            document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (AI)`;
        }
    }

    // AI自动移动棋子
    autoMovePiece() {
        // 尝试移动第一个可以移动的棋子
        for (let i = 0; i < 4; i++) {
            if (this.currentPlayer.canMovePiece(i, this.diceValue)) {
                if (this.currentPlayer.movePiece(i, this.diceValue)) {
                    // 检查是否获胜
                    if (this.currentPlayer.hasWon()) {
                        this.isGameOver = true;
                        alert(this.getColorName(this.currentPlayer.color) + '玩家获胜！');
                        return;
                    }

                    // 如果没有掷出6，切换玩家
                    if (this.diceValue !== 6) {
                        setTimeout(() => {
                            this.switchPlayer();
                        }, 1000);
                    } else {
                        // 掷出6，可以再掷一次
                        document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (AI) (再掷一次)`;
                        setTimeout(() => {
                            this.rollDice();
                        }, 1000);
                    }
                    return;
                }
            }
        }

        // 如果没有可以移动的棋子，切换玩家
        setTimeout(() => {
            this.switchPlayer();
        }, 1000);
    }

    getColorName(color) {
        switch(color) {
            case 'red': return '红色';
            case 'green': return '绿色';
            case 'blue': return '蓝色';
            case 'yellow': return '黄色';
            default: return color;
        }
    }
}

export default Game;