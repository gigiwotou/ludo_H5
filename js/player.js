class Player {
    constructor(color, board) {
        this.color = color;
        this.board = board;
        this.pieces = [];
        this.startIndex = this.getStartIndex();
        this.createPieces();
    }

    getStartIndex() {
        // 根据颜色确定起始路径索引（与board.js中的startIndices对象保持一致）
        switch(this.color) {
            case 'red': return 42;    // 红色起点对应的路径索引（与board.js中startIndices.red保持一致）
            case 'green': return 3; // 绿色起点对应的路径索引（与board.js中startIndices.green保持一致）
            case 'blue': return 16;  // 蓝色起点对应的路径索引（与board.js中startIndices.blue保持一致）
            case 'yellow': return 29; // 黄色起点对应的路径索引（与board.js中startIndices.yellow保持一致）
            default: return 0;
        }
    }

    createPieces() {
        // 创建4个棋子
        for (let i = 0; i < 4; i++) {
            const piece = document.createElement('div');
            piece.className = `player-piece player-${this.color}`;
            piece.dataset.index = i;
            piece.dataset.position = 'home'; // home, path, finish
            piece.dataset.pathIndex = '-1';
            piece.dataset.finishIndex = '-1';

            // 为棋子添加编号
            piece.textContent = i + 1;

            // 设置初始位置在家区域
            const homePos = this.board.getHomePosition(this.color, i);
            piece.style.left = `${homePos.x}px`;
            piece.style.top = `${homePos.y}px`;

            document.querySelector('.game-board').appendChild(piece);
            this.pieces.push(piece);
        }
    }

    // 方法：检查棋子是否可以移动
    canMovePiece(pieceIndex, steps) {
        const piece = this.pieces[pieceIndex];
        const position = piece.dataset.position;

        // 如果棋子还在家中，只有掷出6才能移动
        if (position === 'home') {
            return steps === 6;
        }

        // 如果棋子在路径上，检查移动是否有效
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            const newIndex = currentIndex + steps;
            
            // 实现路径数组首尾相连，使用模运算计算实际索引
            const pathLength = this.board.pathPositions.length;
            const actualNewIndex = ((newIndex % pathLength) + pathLength) % pathLength; // 确保是正数
            
            // 检查是否到达或超过回家路径起点
            const backHomeStartIndex = this.getBackHomeStartIndex();
            if (backHomeStartIndex !== -1) {
                // 检查是否经过回家路径起点
                // 注意：现在需要考虑循环情况
                let passesBackHomeStart = false;
                if (newIndex >= currentIndex) {
                    // 正向移动
                    passesBackHomeStart = currentIndex < backHomeStartIndex && newIndex >= backHomeStartIndex;
                } else {
                    // 反向移动（循环情况下）
                    passesBackHomeStart = (currentIndex < pathLength && newIndex >= 0) && 
                                         (currentIndex > backHomeStartIndex || newIndex < backHomeStartIndex);
                }
                
                if (passesBackHomeStart) {
                    // 只要经过回家路径起点，就可以移动
                    return true;
                }
            }
            
            // 检查目标位置是否有其他玩家的棋子
            // 注意：同一玩家的多个棋子可以在同一格子
            const allPieces = document.querySelectorAll('.player-piece');
            for (let i = 0; i < allPieces.length; i++) {
                const otherPiece = allPieces[i];
                // 跳过当前棋子和同一玩家的其他棋子
                if (otherPiece === piece || otherPiece.classList[1].split('-')[1] === this.color) {
                    continue;
                }
                
                // 检查其他玩家的棋子是否在目标位置
                if (otherPiece.dataset.position === 'path' && parseInt(otherPiece.dataset.pathIndex) === actualNewIndex) {
                    // 目标位置被其他玩家的棋子占用，不能移动
                    return false;
                }
            }
            
            return true;
        }

        // 如果棋子在回家路径上，总是可以移动（因为回家路径移动不会有冲突）
        if (position === 'back-home') {
            return true;
        }

        // 如果棋子在终点区域，不能再移动
        if (position === 'finish') {
            return false;
        }

        return false;
    }

    // 方法：移动棋子 - 简化版，直接按照数组索引顺序移动
    movePiece(pieceIndex, steps) {
        // 确保steps是有效的数字
        steps = parseInt(steps);
        if (isNaN(steps) || steps <= 0) {
            return false;
        }

        if (!this.canMovePiece(pieceIndex, steps)) {
            return false;
        }

        const piece = this.pieces[pieceIndex];
        const position = piece.dataset.position;

        // 从家区域移动到路径起点
        if (position === 'home') {
            piece.dataset.position = 'path';
            piece.dataset.pathIndex = this.startIndex;
            const pathPos = this.board.getPathPosition(this.startIndex);
            this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), pathPos.x, pathPos.y, 300);
            return true;
        }

        // 在路径上移动 - 直接将当前索引加上骰子数字
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            const newIndex = currentIndex + steps;

            // 实现路径数组首尾相连，使用模运算计算实际索引
            const pathLength = this.board.pathPositions.length;
            const actualNewIndex = ((newIndex % pathLength) + pathLength) % pathLength; // 确保是正数

            // 检查是否到达或超过回家路径起点
            const backHomeStartIndex = this.getBackHomeStartIndex();
            let needsToGoBackHome = false;
            let stepsToBackHomeStart = 0;
            let remainingSteps = 0;
            
            if (backHomeStartIndex !== -1) {
                // 检查是否经过回家路径起点
                // 注意：现在需要考虑循环情况
                if (newIndex >= currentIndex) {
                    // 正向移动
                    needsToGoBackHome = currentIndex < backHomeStartIndex && newIndex >= backHomeStartIndex;
                    if (needsToGoBackHome) {
                        stepsToBackHomeStart = backHomeStartIndex - currentIndex;
                        remainingSteps = steps - stepsToBackHomeStart;
                    }
                } else {
                    // 反向移动（循环情况下）
                    needsToGoBackHome = (currentIndex < pathLength && newIndex >= 0) && 
                                       (currentIndex > backHomeStartIndex || newIndex < backHomeStartIndex);
                    if (needsToGoBackHome) {
                        // 计算从当前位置到路径末尾的步数，再加上从路径开始到回家起点的步数
                        stepsToBackHomeStart = (pathLength - currentIndex) + backHomeStartIndex;
                        remainingSteps = steps - stepsToBackHomeStart;
                    }
                }
                
                if (needsToGoBackHome) {
                    // 先动画移动到回家路径起点
                    this.animatePathMovement(piece, currentIndex, backHomeStartIndex, stepsToBackHomeStart);
                    
                    // 更新棋子数据
                    piece.dataset.pathIndex = backHomeStartIndex;
                    
                    // 使用setTimeout确保动画完成后再移动到回家路径
                    // 每个格子的动画持续时间为200毫秒
                    setTimeout(() => {
                        // 然后在回家路径上移动剩余步数
                        this.moveOnBackHomePath(piece, remainingSteps);
                    }, 200 * stepsToBackHomeStart);
                    return true;
                }
            }
            
            // 直接移动到目标索引位置（循环处理）
            this.animatePathMovement(piece, currentIndex, newIndex, steps);
            piece.dataset.pathIndex = actualNewIndex;
            return true;
        }

        // 在回家路径上移动
        if (position === 'back-home') {
            const currentBackHomeIndex = parseInt(piece.dataset.backHomeIndex) || 0;
            this.moveOnBackHomePath(piece, steps, currentBackHomeIndex);
            return true;
        }

        // 在终点区域移动
        if (position === 'finish') {
            const currentIndex = parseInt(piece.dataset.finishIndex);
            const newIndex = currentIndex + steps;

            // 检查是否超出终点区域
            if (newIndex >= this.board.finishPositions.length) {
                return false;
            }

            piece.dataset.finishIndex = newIndex;
            const finishPos = this.board.getFinishPosition(newIndex);
            const currentPos = {
                x: parseFloat(piece.style.left),
                y: parseFloat(piece.style.top)
            };
            this.animatePieceMovement(piece, currentPos.x, currentPos.y, finishPos.x, finishPos.y, 300);
            return true;
        }

        return false;
    }

    // 获取回家路径起点在公共路径中的索引
    getBackHomeStartIndex() {
        // 根据颜色确定回家路径起点在公共路径中的索引
        // 这些位置是根据board.js中的fullCommonPath数组确定的
        switch(this.color) {
            case 'red': return 40; // 红色回家路径起点对应公共路径索引，坐标{x: 0, y: 7}
            case 'green': return 1;  // 绿色回家路径起点对应公共路径索引，坐标{x: 7, y: 0}
            case 'blue': return 14; // 蓝色回家路径起点对应公共路径索引，坐标{x: 14, y: 7}
            case 'yellow': return 27; // 黄色回家路径起点对应公共路径索引，坐标{x: 7, y: 14}
            default: return -1;
        }
    }

    // 在回家路径上移动棋子
    moveOnBackHomePath(piece, steps, currentBackHomeIndex = 0) {
        // 将棋子位置标记为回家路径
        piece.dataset.position = 'back-home';
        
        // 如果步数为0，只移动到回家路径起点
        if (steps <= 0) {
            // 从路径起点移动到回家路径起点
            const startPos = this.board.getBackHomePosition(this.color, currentBackHomeIndex);
            if (startPos) {
                piece.dataset.backHomeIndex = currentBackHomeIndex;
                this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), startPos.x, startPos.y, 300);
            }
            return;
        }
        
        // 获取回家路径长度
        const backHomePathLength = 6; // 每个回家路径有6个点
        
        // 计算目标索引
        const targetIndex = currentBackHomeIndex + steps;
        
        // 检查是否超过回家路径长度
        if (targetIndex >= backHomePathLength) {
            // 步数超过回家路径长度，移动到中心区域
            this.moveToCenter(piece);
        } else {
            // 在回家路径上移动剩余步数
            const targetPos = this.board.getBackHomePosition(this.color, targetIndex);
            
            if (targetPos) {
                // 动画移动棋子经过回家路径上的每个点
                const animationDuration = 300; // 每个点的动画持续时间（毫秒）
                let currentIndex = currentBackHomeIndex;
                let currentX = parseFloat(piece.style.left);
                let currentY = parseFloat(piece.style.top);
                
                const moveStepByStep = () => {
                    if (currentIndex < targetIndex) {
                        currentIndex++;
                        const nextPos = this.board.getBackHomePosition(this.color, currentIndex);
                        
                        if (nextPos) {
                            piece.dataset.backHomeIndex = currentIndex;
                            this.animatePieceMovement(piece, currentX, currentY, nextPos.x, nextPos.y, animationDuration);
                            currentX = nextPos.x;
                            currentY = nextPos.y;
                            
                            setTimeout(moveStepByStep, animationDuration);
                        }
                    }
                };
                
                moveStepByStep();
            }
        }
    }

    // 将棋子移动到中心区域
    moveToCenter(piece) {
        // 将棋子位置标记为终点
        piece.dataset.position = 'finish';
        piece.dataset.finishIndex = 0;
        
        // 中心区域位置 - 大致位于棋盘中心
        const centerX = this.board.width / 2;
        const centerY = this.board.height / 2;
        
        this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), centerX, centerY, 500);
    }

    // 动画移动棋子经过路径上的每个格子
    animatePathMovement(piece, startIndex, endIndex, totalSteps) {
        // 获取路径长度
        const pathLength = this.board.pathPositions.length;
        
        // 计算实际移动的方向和总步数
        let stepDirection = Math.sign(endIndex - startIndex);
        let currentStep = 0;
        const animationDuration = 200; // 每个格子的动画持续时间（毫秒）

        // 获取当前位置
        let currentX = parseFloat(piece.style.left);
        let currentY = parseFloat(piece.style.top);

        // 创建动画函数
        const moveOneStep = () => {
            if (currentStep >= Math.abs(totalSteps)) {
                // 移动完成后检查目标位置是否有其他玩家的棋子
                this.checkAndSendBackOtherPieces(piece);
                return;
            }

            // 计算下一个格子的索引，支持循环
            const nextIndex = ((startIndex + (currentStep + 1) * stepDirection) % pathLength + pathLength) % pathLength;
            const nextPos = this.board.getPathPosition(nextIndex);

            // 更新棋子数据
            piece.dataset.pathIndex = nextIndex;

            // 动画移动到下一个格子
            this.animatePieceMovement(piece, currentX, currentY, nextPos.x, nextPos.y, animationDuration);

            // 更新当前位置
            currentX = nextPos.x;
            currentY = nextPos.y;
            currentStep++;

            // 安排下一步移动
            setTimeout(moveOneStep, animationDuration);
        };

        // 开始移动
        setTimeout(moveOneStep, 0);
    }

    // 检查并送回其他玩家的棋子
    checkAndSendBackOtherPieces(currentPiece) {
        if (currentPiece.dataset.position !== 'path') {
            return;
        }
        
        const currentPathIndex = parseInt(currentPiece.dataset.pathIndex);
        const currentPlayerColor = this.color;
        
        // 获取所有棋子
        const allPieces = document.querySelectorAll('.player-piece');
        
        allPieces.forEach(piece => {
            // 跳过当前棋子和同一玩家的其他棋子
            if (piece === currentPiece || piece.classList[1].split('-')[1] === currentPlayerColor) {
                return;
            }
            
            // 检查是否是其他玩家在路径上的棋子，并且在同一位置
            if (piece.dataset.position === 'path' && parseInt(piece.dataset.pathIndex) === currentPathIndex) {
                // 获取该棋子的玩家颜色和索引
                const pieceColor = piece.classList[1].split('-')[1];
                const pieceIndex = parseInt(piece.dataset.index);
                
                // 将棋子送回营地
                this.sendPieceBackHome(piece, pieceColor, pieceIndex);
            }
        });
    }

    // 将棋子送回营地
    sendPieceBackHome(piece, color, index) {
        // 获取营地位置
        const homePos = this.board.getHomePosition(color, index);
        
        if (homePos) {
            // 初始化棋子的数值
            piece.dataset.position = 'home';
            piece.dataset.pathIndex = '-1';
            piece.dataset.backHomeIndex = '-1';
            piece.dataset.finishIndex = '-1';
            
            // 动画移动回营地
            this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), homePos.x, homePos.y, 500);
        }
    }

    // 动画移动棋子从一个点到另一个点
    animatePieceMovement(piece, startX, startY, endX, endY, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // 使用缓动函数使动画更自然
            const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;

            piece.style.left = `${currentX}px`;
            piece.style.top = `${currentY}px`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    hasWon() {
        // 检查所有棋子是否都在终点区域（中心区域）
        return this.pieces.every(piece => piece.dataset.position === 'finish');
    }
}

export default Player;