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
        this.consecutiveSixCount = 0; // 连续掷出6点的次数
        
        // 多次骰子结果相关属性
        this.diceResults = []; // 存储当前回合的所有骰子结果
        this.currentDiceIndex = 0; // 当前正在使用的骰子结果索引
        this.isRollingPhase = false; // 是否处于掷骰子阶段（还不能移动棋子）
        
        // AI控制相关属性
        this.aiControlledPlayers = {
            'yellow': false, // 默认为人类控制
            'red': true,     // 默认为AI控制
            'green': true,   // 默认为AI控制
            'blue': true     // 默认为AI控制
        };
        
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
        
        // 为AI接管勾选框添加事件监听器
        document.querySelectorAll('.ai-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const color = e.target.dataset.color;
                const isChecked = e.target.checked;
                this.aiControlledPlayers[color] = isChecked;
                
                // 如果当前玩家的控制方式改变，更新状态
                if (color === this.currentPlayer.color) {
                    this.updateStatus();
                    
                    // 如果被勾选为AI接管，并且游戏没有结束，立即开始掷骰子
                    if (isChecked && !this.isGameOver && !this.isRollingPhase && this.diceValue === 0) {
                        setTimeout(() => {
                            this.rollDice(true); // 传递isAiCall=true参数
                        }, 500);
                    }
                }
            });
        });
    }

    // 添加isAiCall参数，默认为false
    rollDice(isAiCall = false) {
        if (this.isGameOver) return;
        
        // 检查当前玩家是否由AI接管
        const isCurrentPlayerAi = this.aiControlledPlayers[this.currentPlayer.color];
        
        // 只有人类玩家点击按钮时才需要检查是否是玩家回合
        if (!isAiCall && isCurrentPlayerAi) return;

        // 只有人类玩家点击时才禁用按钮
        const rollDiceButton = document.getElementById('roll-dice');
        if (!isAiCall) {
            rollDiceButton.disabled = true;
        }

        const diceElement = document.querySelector('.dice');
        diceElement.classList.add('dice-rolling');
        
        // 生成最终的骰子值
        this.diceValue = Math.floor(Math.random() * 6) + 1;
        
        // 创建骰子滚动动画
        let rolls = 0;
        const maxRolls = 15; // 滚动次数
        const rollInterval = 100; // 每次滚动间隔（毫秒）
        
        const rollAnimation = setInterval(() => {
            // 显示随机值模拟滚动
            const randomValue = Math.floor(Math.random() * 6) + 1;
            this.setDiceValue(diceElement, randomValue);
            rolls++;
            
            // 动画结束，显示最终结果
            if (rolls >= maxRolls) {
                clearInterval(rollAnimation);
                this.setDiceValue(diceElement, this.diceValue);
                diceElement.classList.remove('dice-rolling');
                
                // 记录骰子结果
                if (this.isRollingPhase || this.diceResults.length === 0) {
                    this.diceResults.push(this.diceValue);
                }
                
                // 继续游戏逻辑
                this.processDiceResult(isAiCall);
            }
        }, rollInterval);
    }
    
    // 设置骰子显示的值（使用点而不是数字）
    setDiceValue(diceElement, value) {
        // 移除所有dice-*类
        for (let i = 1; i <= 6; i++) {
            diceElement.classList.remove(`dice-${i}`);
        }
        
        // 添加对应的dice-*类
        if (value >= 1 && value <= 6) {
            diceElement.classList.add(`dice-${value}`);
        }
    }
    
    // 处理骰子结果后的游戏逻辑
    processDiceResult(isAiCall = false) {
        const rollDiceButton = document.getElementById('roll-dice');
        
        // 检查当前玩家是否由AI接管
        const isCurrentPlayerAi = this.aiControlledPlayers[this.currentPlayer.color];
        
        // 如果是AI玩家，使用传统逻辑
        if (isCurrentPlayerAi) {
            // 启用/禁用骰子按钮
            if (!isAiCall) {
                rollDiceButton.disabled = isCurrentPlayerAi;
            }
            
            setTimeout(() => this.autoMovePiece(), 1000);
            return;
        }
        
        // 启用/禁用骰子按钮
        if (!isAiCall) {
            rollDiceButton.disabled = true;
        }
        
        // 人类玩家的新逻辑
        if (this.diceValue === 6) {
            this.handleSixRoll(rollDiceButton);
        } else {
            this.handleNonSixRoll();
        }
    }
    
    // 处理掷出6点的情况
    handleSixRoll(rollDiceButton) {
        // 掷出6点，增加连续6点计数
        this.consecutiveSixCount++;
        
        if (this.consecutiveSixCount <= 2) {
            // 第一次或第二次掷出6点，进入连续掷骰子阶段
            this.isRollingPhase = true;
            const phaseText = this.consecutiveSixCount === 1 ? '请再次掷骰子' : '请第三次掷骰子';
            document.querySelector('.status').textContent = `掷出了6点，${phaseText}`;
            
            // 启用骰子按钮让玩家可以再次掷骰子
            setTimeout(() => {
                rollDiceButton.disabled = false;
            }, 500);
        } else {
            // 第三次掷出6点，本回合结束
            this.resetTurnState();
            document.querySelector('.status').textContent = '连续掷出3个6点，本回合结束';
            setTimeout(() => this.switchPlayer(), 1000);
        }
    }
    
    // 处理没有掷出6点的情况
    handleNonSixRoll() {
        if (this.isRollingPhase) {
            // 连续掷骰子阶段结束，开始移动棋子阶段
            this.isRollingPhase = false;
            this.currentDiceIndex = 0;
            
            // 检查是否有可以移动的棋子
            const hasMovablePiece = this.hasMovablePiece(this.diceResults[this.currentDiceIndex]);
            
            if (!hasMovablePiece) {
                // 没有可以移动的棋子，切换玩家
                document.querySelector('.status').textContent = '没有可以移动的棋子，本回合结束';
                setTimeout(() => this.switchPlayer(), 1000);
            } else {
                // 有可以移动的棋子，等待玩家选择
                document.querySelector('.status').textContent = `轮到你了，请选择要移动的棋子 (剩余步数: ${this.diceResults.slice(this.currentDiceIndex).join(', ')})`;
            }
        } else {
            // 普通回合（非连续掷骰子阶段）
            this.handleNormalTurn();
        }
    }
    
    // 处理普通回合
    handleNormalTurn() {
        // 对于人类玩家（黄色），检查棋盘上的棋子数量
        const activePiecesCount = this.getCurrentPlayerActivePiecesCount();
        
        // 检查是否有可以移动的棋子
        const hasMovablePiece = this.hasMovablePiece(this.diceValue);
        
        // 如果骰子不为6且场上没有活跃棋子，自动切换到下一个玩家
        if (activePiecesCount === 0 && this.diceValue !== 6) {
            document.querySelector('.status').textContent = '没有活跃棋子，自动切换玩家';
            setTimeout(() => this.switchPlayer(), 1000);
            return;
        }
        
        // 如果只有一个棋子在棋盘上且有可移动的棋子（只有6点的情况才会执行到这里）
        if (activePiecesCount === 1 && hasMovablePiece) {
            setTimeout(() => this.autoMoveHumanPiece(), 500);
        } else if (hasMovablePiece) {
            // 有多个棋子在场，等待玩家选择一个棋子移动
            document.querySelector('.status').textContent = '轮到你了，请选择要移动的棋子';
        } else {
            // 没有可以移动的棋子，切换玩家
            document.querySelector('.status').textContent = '没有可以移动的棋子，自动切换玩家';
            setTimeout(() => this.switchPlayer(), 1000);
        }
    }
    
    // 检查当前玩家是否有可以移动的棋子
    hasMovablePiece(steps) {
        for (let i = 0; i < 4; i++) {
            if (this.currentPlayer.canMovePiece(i, steps)) {
                return true;
            }
        }
        return false;
    }

    // 获取当前玩家在棋盘上的活跃棋子数量
    getCurrentPlayerActivePiecesCount() {
        let count = 0;
        for (let i = 0; i < 4; i++) {
            const piece = this.currentPlayer.pieces[i];
            // 棋子不在家中就是活跃的
            if (piece.dataset.position !== 'home') {
                count++;
            }
        }
        return count;
    }

    handlePieceClick(piece) {
        // 参数有效性检查
        if (!this.isValidPieceClick(piece)) {
            return;
        }

        // 获取棋子信息
        const { color, pieceIndex } = this.getPieceInfo(piece);

        // 检查是否是当前玩家的棋子
        if (!this.isCurrentPlayerPiece(color)) {
            this.notifyWrongTurn(color);
            return;
        }

        // 检查是否可以移动棋子
        if (!this.canMoveDuringCurrentState()) {
            return;
        }

        // 确定当前要使用的骰子步数
        const currentSteps = this.getActiveDiceSteps();

        // 尝试移动棋子
        if (this.currentPlayer.movePiece(pieceIndex, currentSteps)) {
            this.handleSuccessfulPieceMove();
        } else {
            this.notifyCannotMovePiece();
        }
    }

    // 验证棋子点击的有效性
    isValidPieceClick(piece) {
        // 检查游戏状态和AI控制
        return !this.isGameOver && !this.aiControlledPlayers[this.currentPlayer.color] && piece;
    }

    // 获取棋子信息
    getPieceInfo(piece) {
        return {
            color: piece.classList[1]?.split('-')[1],
            pieceIndex: parseInt(piece.dataset.index)
        };
    }

    // 检查是否是当前玩家的棋子
    isCurrentPlayerPiece(color) {
        return color === this.currentPlayer.color;
    }

    // 通知玩家不是他们的回合
    notifyWrongTurn(color) {
        alert(`现在不是${this.getColorName(color)}玩家的回合`);
    }

    // 检查当前状态是否允许移动棋子
    canMoveDuringCurrentState() {
        // 检查骰子是否已经掷出
        if (this.diceValue === 0 && !this.isRollingPhase && this.diceResults.length === 0) {
            return false;
        }
        
        // 连续掷骰子阶段，不允许移动棋子
        if (this.isRollingPhase) {
            alert('请先完成所有掷骰子操作');
            return false;
        }
        
        return true;
    }

    // 处理成功移动棋子后的逻辑
    handleSuccessfulPieceMove() {
        // 检查是否获胜
        if (this.currentPlayer.hasWon()) {
            this.isGameOver = true;
            alert(`${this.getColorName(this.currentPlayer.color)}玩家获胜！`);
            return;
        }

        // 处理骰子值
        if (this.diceResults.length > 0 && this.currentDiceIndex < this.diceResults.length) {
            this.handleMultipleDiceResults();
        } else {
            this.handleSingleDiceResult();
        }
    }

    // 通知玩家无法移动棋子
    notifyCannotMovePiece() {
        alert('无法移动该棋子');
    }
    
    // 获取当前活跃的骰子步数
    getActiveDiceSteps() {
        if (this.diceResults.length > 0 && this.currentDiceIndex < this.diceResults.length) {
            return this.diceResults[this.currentDiceIndex];
        } else {
            return this.diceValue;
        }
    }
    
    // 处理多次骰子结果
    handleMultipleDiceResults() {
        this.currentDiceIndex++;
        
        if (this.currentDiceIndex < this.diceResults.length) {
            // 还有骰子结果未使用
            const nextSteps = this.diceResults[this.currentDiceIndex];
            
            // 检查是否有可以使用下一个骰子结果移动的棋子
            if (this.hasMovablePiece(nextSteps)) {
                document.querySelector('.status').textContent = `轮到你了，请选择要移动的棋子 (剩余步数: ${this.diceResults.slice(this.currentDiceIndex).join(', ')})`;
            } else {
                // 没有可以移动的棋子，跳过这个骰子结果
                document.querySelector('.status').textContent = `没有可以使用 ${nextSteps} 点移动的棋子，跳过此步`;
                setTimeout(() => this.continueWithNextDiceResult(), 1000);
            }
        } else {
            // 所有骰子结果都已处理完，切换玩家
            this.resetTurnState();
            setTimeout(() => this.switchPlayer(), 500);
        }
    }
    
    // 继续处理下一个骰子结果
    continueWithNextDiceResult() {
        if (this.currentDiceIndex >= this.diceResults.length - 1) {
            // 所有骰子结果都已处理完，切换玩家
            this.resetTurnState();
            this.switchPlayer();
        } else {
            // 还有骰子结果未处理完，继续下一个
            this.currentDiceIndex++;
            const remainingSteps = this.diceResults.slice(this.currentDiceIndex).join(', ');
            document.querySelector('.status').textContent = `轮到你了，请选择要移动的棋子 (剩余步数: ${remainingSteps})`;
        }
    }
    
    // 处理单次骰子结果
    handleSingleDiceResult() {
        if (this.diceValue !== 6) {
            // 不是6点，重置连续6点计数并切换玩家
            this.consecutiveSixCount = 0;
            const nextPlayerColor = this.players[(this.currentPlayerIndex + 1) % this.players.length].color;
            const isNextPlayerAi = this.aiControlledPlayers[nextPlayerColor];
            document.querySelector('.status').textContent = `轮到${this.getColorName(nextPlayerColor)}玩家 ${isNextPlayerAi ? '(AI)' : ''}`;
            setTimeout(() => this.switchPlayer(), 500);
        } else {
            // 是6点，允许再掷一次
            document.querySelector('.status').textContent = '轮到你了 (再掷一次)';
        }
    }
    
    // 重置回合状态
    resetTurnState() {
        this.consecutiveSixCount = 0;
        this.diceResults = [];
        this.currentDiceIndex = 0;
        this.diceValue = 0;
    }

    switchPlayer() {
        // 切换玩家
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        
        // 重置与当前玩家相关的状态
        this.diceValue = 0;
        this.diceResults = [];
        this.currentDiceIndex = 0;
        this.isRollingPhase = false;
        this.consecutiveSixCount = 0;
        
        // 更新棋子的z-index，确保当前玩家的棋子显示在最上层
        this.updatePlayerPiecesZIndex();
        
        this.updateStatus();
        
        // 检查当前玩家是否由AI接管
        const isCurrentPlayerAi = this.aiControlledPlayers[this.currentPlayer.color];
        
        // 如果是AI玩家，自动掷骰子
        if (isCurrentPlayerAi && !this.isGameOver) {
            setTimeout(() => {
                this.rollDice(true); // 传递isAiCall=true参数
            }, 1000);
        }
    }

    updateStatus() {
        const rollDiceButton = document.getElementById('roll-dice');
        // 检查当前玩家是否由AI接管
        const isCurrentPlayerAi = this.aiControlledPlayers[this.currentPlayer.color];
        
        if (isCurrentPlayerAi) {
            document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (AI)`;
            rollDiceButton.disabled = true; // AI玩家回合时禁用按钮
        } else {
            document.querySelector('.status').textContent = '轮到你了';
            rollDiceButton.disabled = false; // 人类玩家回合时启用按钮
        }
    }

    // 人类玩家自动移动棋子（当只有一个棋子在棋盘上时）
    autoMoveHumanPiece() {
        // 如果在多次掷骰子阶段，使用当前骰子结果
        if (this.diceResults.length > 0 && this.currentDiceIndex < this.diceResults.length) {
            this.handleMultipleDiceAutoMove();
        } else {
            this.handleSingleDiceAutoMove();
        }
    }
    
    // 处理多次骰子的自动移动
    handleMultipleDiceAutoMove() {
        const currentSteps = this.diceResults[this.currentDiceIndex];
        
        // 找到可移动的棋子
        const movablePieceIndex = this.findMovablePieceIndex(currentSteps);
        
        if (movablePieceIndex !== -1) {
            // 移动棋子
            if (this.currentPlayer.movePiece(movablePieceIndex, currentSteps)) {
                this.handleAutoMoveSuccess();
            }
        } else {
            // 没有可以移动的棋子，跳过这个骰子结果
            this.handleNoMovablePiece();
        }
    }
    
    // 处理单次骰子的自动移动
    handleSingleDiceAutoMove() {
        // 普通回合，尝试移动第一个可以移动的棋子
        const movablePieceIndex = this.findMovablePieceIndex(this.diceValue);
        
        if (movablePieceIndex !== -1) {
            // 移动棋子
            if (this.currentPlayer.movePiece(movablePieceIndex, this.diceValue)) {
                // 检查是否获胜
                if (this.currentPlayer.hasWon()) {
                    this.isGameOver = true;
                    alert(this.getColorName(this.currentPlayer.color) + '玩家获胜！');
                    return;
                }

                // 如果骰子值不是6，切换玩家
                if (this.diceValue !== 6) {
                    this.consecutiveSixCount = 0;
                    document.querySelector('.status').textContent = `轮到${this.getColorName(this.players[(this.currentPlayerIndex + 1) % this.players.length].color)}玩家 (AI)`;
                    setTimeout(() => this.switchPlayer(), 1000);
                } else {
                    // 骰子值是6，允许再掷一次
                    document.querySelector('.status').textContent = '轮到你了 (再掷一次)';
                    const rollDiceButton = document.getElementById('roll-dice');
                    rollDiceButton.disabled = false;
                }
            }
        } else {
            // 如果没有可以移动的棋子，切换玩家
            setTimeout(() => this.switchPlayer(), 1000);
        }
    }
    
    // 查找可移动棋子的索引
    findMovablePieceIndex(steps) {
        for (let i = 0; i < 4; i++) {
            if (this.currentPlayer.canMovePiece(i, steps)) {
                return i;
            }
        }
        return -1;
    }
    
    // 处理自动移动成功
    handleAutoMoveSuccess() {
        // 检查是否获胜
        if (this.currentPlayer.hasWon()) {
            this.isGameOver = true;
            alert(this.getColorName(this.currentPlayer.color) + '玩家获胜！');
            return;
        }
        
        // 移动到下一个骰子结果
        this.currentDiceIndex++;
        
        if (this.currentDiceIndex < this.diceResults.length) {
            // 还有骰子结果未使用，继续自动移动
            setTimeout(() => this.autoMoveHumanPiece(), 500);
        } else {
            // 所有骰子结果都已处理完，切换玩家
            this.resetTurnState();
            setTimeout(() => this.switchPlayer(), 500);
        }
    }
    
    // 处理没有可移动棋子的情况
    handleNoMovablePiece() {
        this.currentDiceIndex++;
        
        if (this.currentDiceIndex < this.diceResults.length) {
            // 还有骰子结果未使用，继续自动移动
            setTimeout(() => this.autoMoveHumanPiece(), 500);
        } else {
            // 所有骰子结果都已处理完，切换玩家
            this.resetTurnState();
            setTimeout(() => this.switchPlayer(), 500);
        }
    }

    // 更新棋子的z-index，确保当前玩家的棋子显示在最上层
    updatePlayerPiecesZIndex() {
        // 首先移除所有棋子的current-player类
        document.querySelectorAll('.player-piece').forEach(piece => {
            piece.classList.remove('current-player');
        });
        
        // 然后为当前玩家的棋子添加current-player类
        const currentPlayerColor = this.currentPlayer.color;
        document.querySelectorAll(`.player-${currentPlayerColor}`).forEach(piece => {
            piece.classList.add('current-player');
        });
    }
    
    // AI玩家移动棋子
    autoMovePiece() {
        // 检查游戏状态
        if (this.isGameOver) {
            return;
        }

        // 尝试找到可移动的棋子
        const movablePieceIndex = this.findMovablePieceIndex(this.diceValue);
        
        if (movablePieceIndex !== -1) {
            this.attemptAIPieceMove(movablePieceIndex);
        } else {
            // 如果没有可以移动的棋子，切换玩家
            this.handleAINoMovablePiece();
        }
    }

    // 尝试AI玩家移动棋子
    attemptAIPieceMove(pieceIndex) {
        if (this.currentPlayer.movePiece(pieceIndex, this.diceValue)) {
            // 检查是否获胜
            if (this.currentPlayer.hasWon()) {
                this.handleAIWin();
                return;
            }

            // 根据骰子值决定下一步操作
            if (this.diceValue !== 6) {
                this.handleAIMoveComplete();
            } else {
                this.handleAISixRoll();
            }
        } else {
            // 移动失败，切换玩家
            this.handleAINoMovablePiece();
        }
    }

    // 处理AI玩家获胜
    handleAIWin() {
        this.isGameOver = true;
        alert(`${this.getColorName(this.currentPlayer.color)}玩家获胜！`);
    }

    // 处理AI玩家移动完成
    handleAIMoveComplete() {
        setTimeout(() => this.switchPlayer(), 1000);
    }

    // 处理AI玩家掷出6点的情况
    handleAISixRoll() {
        // 增加连续6点计数
        this.consecutiveSixCount++;
        
        // 如果连续掷出3个6点，本回合结束
        if (this.consecutiveSixCount >= 3) {
            this.handleAINoMovablePiece();
        } else {
            // 掷出6点，允许再掷一次
            document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (AI) (再掷一次)`;
            setTimeout(() => {
                this.rollDice(true); // 传递isAiCall=true参数
            }, 1000);
        }
    }

    // 处理AI玩家没有可移动棋子的情况
    handleAINoMovablePiece() {
        setTimeout(() => this.switchPlayer(), 1000);
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