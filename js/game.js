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
        
        // 新增属性用于存储多次骰子结果和当前使用的骰子结果索引
        this.diceResults = []; // 存储当前回合的所有骰子结果
        this.currentDiceIndex = 0; // 当前正在使用的骰子结果索引
        this.isRollingPhase = false; // 是否处于掷骰子阶段（还不能移动棋子）
        
        // 新增属性用于存储每个玩家是否由AI接管
        this.aiControlledPlayers = {
            'yellow': false, // 默认为人类控制
            'red': true,    // 默认为AI控制
            'green': true,  // 默认为AI控制
            'blue': true    // 默认为AI控制
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
                    if (isChecked && !this.isGameOver) {
                        // 检查是否已经是AI回合的标准掷骰子阶段
                        // 避免在游戏进行中的其他阶段（如移动棋子阶段）触发自动掷骰子
                        if (!this.isRollingPhase && this.diceValue === 0) {
                            setTimeout(() => {
                                this.rollDice(true); // 传递isAiCall=true参数
                            }, 500);
                        }
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
        // AI调用时跳过这个检查
        if (!isAiCall && isCurrentPlayerAi) return;

        // 只有人类玩家点击时才禁用按钮
        const rollDiceButton = document.getElementById('roll-dice');
        if (!isAiCall) {
            rollDiceButton.disabled = true;
        }

        const diceElement = document.querySelector('.dice');
        
        // 添加动画类
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
            
            setTimeout(() => {
                this.autoMovePiece();
            }, 1000);
            return;
        }
        
        // 启用/禁用骰子按钮
        if (!isAiCall) {
            rollDiceButton.disabled = true;
        }
        
        // 人类玩家的新逻辑
        if (this.diceValue === 6) {
            // 掷出6点，增加连续6点计数
            this.consecutiveSixCount++;
            
            if (this.consecutiveSixCount === 1) {
                // 第一次掷出6点，进入连续掷骰子阶段
                this.isRollingPhase = true;
                document.querySelector('.status').textContent = '掷出了6点，请再次掷骰子';
                
                // 启用骰子按钮让玩家可以再次掷骰子
                setTimeout(() => {
                    rollDiceButton.disabled = false;
                }, 500);
            } else if (this.consecutiveSixCount === 2) {
                // 第二次掷出6点，继续掷骰子
                document.querySelector('.status').textContent = '再次掷出6点，请第三次掷骰子';
                
                // 启用骰子按钮让玩家可以再次掷骰子
                setTimeout(() => {
                    rollDiceButton.disabled = false;
                }, 500);
            } else if (this.consecutiveSixCount === 3) {
                // 第三次掷出6点，本回合结束
                this.consecutiveSixCount = 0;
                this.diceResults = [];
                this.currentDiceIndex = 0;
                this.isRollingPhase = false;
                
                document.querySelector('.status').textContent = '连续掷出3个6点，本回合结束';
                setTimeout(() => {
                    this.switchPlayer();
                }, 1000);
            }
        } else {
            // 没有掷出6点或者是连续掷骰子阶段的非6点结果
            if (this.isRollingPhase) {
                // 连续掷骰子阶段结束，开始移动棋子阶段
                this.isRollingPhase = false;
                this.currentDiceIndex = 0;
                
                // 检查是否有可以移动的棋子
                const hasMovablePiece = this.hasMovablePiece(this.diceResults[this.currentDiceIndex]);
                
                if (!hasMovablePiece) {
                    // 没有可以移动的棋子，切换玩家
                    document.querySelector('.status').textContent = '没有可以移动的棋子，本回合结束';
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 1000);
                } else {
                    // 有可以移动的棋子，等待玩家选择
                    document.querySelector('.status').textContent = `轮到你了，请选择要移动的棋子 (剩余步数: ${this.diceResults.slice(this.currentDiceIndex).join(', ')})`;
                }
            } else {
                // 普通回合（非连续掷骰子阶段）
                // 对于人类玩家（黄色），检查棋盘上的棋子数量
                const activePiecesCount = this.getCurrentPlayerActivePiecesCount();
                
                // 检查是否有可以移动的棋子
                const hasMovablePiece = this.hasMovablePiece(this.diceValue);
                
                // 如果骰子不为6且场上没有活跃棋子，自动切换到下一个玩家
                if (activePiecesCount === 0 && this.diceValue !== 6) {
                    document.querySelector('.status').textContent = '没有活跃棋子，自动切换玩家';
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 1000);
                    return;
                }
                
                // 如果只有一个棋子在棋盘上且骰子没有6点，自动结束玩家回合
                if (activePiecesCount === 1 && this.diceValue !== 6) {
                    document.querySelector('.status').textContent = '只有一个棋子在场且非6点，自动结束回合';
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 1000);
                    return;
                }
                
                // 如果只有一个棋子在棋盘上且有可移动的棋子（只有6点的情况才会执行到这里）
                if (activePiecesCount === 1 && hasMovablePiece) {
                    setTimeout(() => {
                        this.autoMoveHumanPiece();
                    }, 500);
                } else if (hasMovablePiece) {
                    // 有多个棋子在场，等待玩家选择一个棋子移动
                    document.querySelector('.status').textContent = '轮到你了，请选择要移动的棋子';
                } else {
                    // 没有可以移动的棋子，切换玩家
                    document.querySelector('.status').textContent = '没有可以移动的棋子，自动切换玩家';
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 1000);
                }
            }
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
        if (this.isGameOver) return;

        // 检查当前玩家是否由AI接管
        const isCurrentPlayerAi = this.aiControlledPlayers[this.currentPlayer.color];
        
        // 如果是AI接管的玩家，不允许点击棋子
        if (isCurrentPlayerAi) {
            return;
        }

        const color = piece.classList[1].split('-')[1];
        const pieceIndex = parseInt(piece.dataset.index);

        // 检查是否是当前玩家的棋子
        if (color !== this.currentPlayer.color) {
            alert('现在不是' + this.getColorName(color) + '玩家的回合');
            return;
        }

        // 检查骰子是否已经掷出（diceValue > 0 或者在多次掷骰子阶段）
        if (this.diceValue === 0 && !this.isRollingPhase && this.diceResults.length === 0) {
            return;
        }
        
        // 连续掷骰子阶段，不允许移动棋子
        if (this.isRollingPhase) {
            alert('请先完成所有掷骰子操作');
            return;
        }

        // 确定当前要使用的骰子步数
        let currentSteps;
        if (this.diceResults.length > 0 && this.currentDiceIndex < this.diceResults.length) {
            // 使用多次掷骰子结果中的当前值
            currentSteps = this.diceResults[this.currentDiceIndex];
        } else {
            // 使用单次掷骰子的结果
            currentSteps = this.diceValue;
        }

        // 获取棋子当前位置
        const piecePosition = piece.dataset.position;
        
        // 尝试移动棋子
        if (this.currentPlayer.movePiece(pieceIndex, currentSteps)) {
            // 检查是否获胜
            if (this.currentPlayer.hasWon()) {
                this.isGameOver = true;
                alert(this.getColorName(this.currentPlayer.color) + '玩家获胜！');
                return;
            }

            // 处理骰子值
            if (this.diceResults.length > 0 && this.currentDiceIndex < this.diceResults.length) {
                // 在多次掷骰子阶段，移动到下一个骰子结果
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
                        setTimeout(() => {
                            if (this.currentDiceIndex >= this.diceResults.length - 1) {
                                // 所有骰子结果都已处理完，切换玩家
                                this.consecutiveSixCount = 0;
                                this.diceResults = [];
                                this.currentDiceIndex = 0;
                                this.diceValue = 0;
                                this.switchPlayer();
                            } else {
                                // 还有骰子结果未处理完，继续下一个
                                this.currentDiceIndex++;
                                const remainingSteps = this.diceResults.slice(this.currentDiceIndex).join(', ');
                                document.querySelector('.status').textContent = `轮到你了，请选择要移动的棋子 (剩余步数: ${remainingSteps})`;
                            }
                        }, 1000);
                    }
                } else {
                    // 所有骰子结果都已处理完，切换玩家
                    this.consecutiveSixCount = 0;
                    this.diceResults = [];
                    this.currentDiceIndex = 0;
                    this.diceValue = 0;
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 500);
                }
            } else {
                // 单次掷骰子的情况
                if (this.diceValue !== 6) {
                    // 不是6点，重置连续6点计数并切换玩家
                    this.consecutiveSixCount = 0;
                    const nextPlayerColor = this.players[(this.currentPlayerIndex + 1) % this.players.length].color;
                    const isNextPlayerAi = this.aiControlledPlayers[nextPlayerColor];
                    document.querySelector('.status').textContent = `轮到${this.getColorName(nextPlayerColor)}玩家 ${isNextPlayerAi ? '(AI)' : ''}`;
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 500);
                } else {
                    // 是6点，允许再掷一次
                    document.querySelector('.status').textContent = '轮到你了 (再掷一次)';
                }
            }
        } else {
            alert('无法移动该棋子');
        }
    }

    switchPlayer() {
        // 切换玩家时不需要重置连续6点计数，只有在回合结束时才会重置
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
            const currentSteps = this.diceResults[this.currentDiceIndex];
            
            // 找到可移动的棋子
            let movablePieceIndex = -1;
            for (let i = 0; i < 4; i++) {
                if (this.currentPlayer.canMovePiece(i, currentSteps)) {
                    movablePieceIndex = i;
                    break;
                }
            }
            
            if (movablePieceIndex !== -1) {
                // 移动棋子
                if (this.currentPlayer.movePiece(movablePieceIndex, currentSteps)) {
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
                        setTimeout(() => {
                            this.autoMoveHumanPiece();
                        }, 500);
                    } else {
                        // 所有骰子结果都已处理完，切换玩家
                        this.consecutiveSixCount = 0;
                        this.diceResults = [];
                        this.currentDiceIndex = 0;
                        this.diceValue = 0;
                        setTimeout(() => {
                            this.switchPlayer();
                        }, 500);
                    }
                }
            } else {
                // 没有可以移动的棋子，跳过这个骰子结果
                this.currentDiceIndex++;
                
                if (this.currentDiceIndex < this.diceResults.length) {
                    // 还有骰子结果未使用，继续自动移动
                    setTimeout(() => {
                        this.autoMoveHumanPiece();
                    }, 500);
                } else {
                    // 所有骰子结果都已处理完，切换玩家
                    this.consecutiveSixCount = 0;
                    this.diceResults = [];
                    this.currentDiceIndex = 0;
                    this.diceValue = 0;
                    setTimeout(() => {
                        this.switchPlayer();
                    }, 500);
                }
            }
        } else {
            // 普通回合，尝试移动第一个可以移动的棋子
            for (let i = 0; i < 4; i++) {
                if (this.currentPlayer.canMovePiece(i, this.diceValue)) {
                    if (this.currentPlayer.movePiece(i, this.diceValue)) {
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
                            setTimeout(() => {
                                this.switchPlayer();
                            }, 1000);
                        } else {
                            // 骰子值是6，允许再掷一次
                            document.querySelector('.status').textContent = '轮到你了 (再掷一次)';
                            const rollDiceButton = document.getElementById('roll-dice');
                            rollDiceButton.disabled = false;
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
        // AI玩家使用传统逻辑，不支持多次掷骰子规则
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

                    // 如果骰子值不是6，切换玩家
                    if (this.diceValue !== 6) {
                        setTimeout(() => {
                            this.switchPlayer();
                        }, 1000);
                    } else {
                        // 增加连续6点计数
                        this.consecutiveSixCount++;
                        
                        // 如果连续掷出3个6点，本回合结束
                        if (this.consecutiveSixCount >= 3) {
                            setTimeout(() => {
                                this.switchPlayer();
                            }, 1000);
                        } else {
                            // 掷出6点，允许再掷一次
                            document.querySelector('.status').textContent = `轮到${this.getColorName(this.currentPlayer.color)}玩家 (AI) (再掷一次)`;
                            setTimeout(() => {
                                this.rollDice(true); // 传递isAiCall=true参数
                            }, 1000);
                        }
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