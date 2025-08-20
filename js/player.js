class Player {
    constructor(color, board) {
        this.color = color;
        this.board = board;
        this.pieces = [];
        this.createPieces();
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
        // 参数有效性检查
        steps = parseInt(steps);
        if (isNaN(steps) || steps <= 0 || pieceIndex < 0 || pieceIndex >= this.pieces.length) {
            return false;
        }

        const piece = this.pieces[pieceIndex];
        const position = piece.dataset.position;

        // 快速检查：如果棋子在终点区域，不能再移动
        if (position === 'finish') {
            return false;
        }

        // 如果棋子还在家中，只有掷出6才能移动
        if (position === 'home') {
            return steps === 6;
        }

        // 如果棋子在路径上，检查移动限制
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            const targetIndex = currentIndex + steps;
            const fullPath = this.board.getPlayerFullPath(this.color);
            const pathLength = fullPath.length;
            
            // 关键规则：只有当骰子数+位置索引 <= 路径数组长度+1时，才允许移动
            if (targetIndex > pathLength || targetIndex < 0) {
                alert(`不能移动此棋子：移动后会超出路径范围\n当前位置: ${currentIndex}\n步数: ${steps}\n路径长度+1: ${pathLength + 1}`);
                return false;
            }
            
            return true;
        }

        return false;
    }

    // 方法：移动棋子
    movePiece(pieceIndex, steps, onCenterEnteredCallback = null) {
        // 参数有效性检查
        steps = parseInt(steps);
        if (isNaN(steps) || steps <= 0 || pieceIndex < 0 || pieceIndex >= this.pieces.length) {
            return false;
        }

        // 首先检查是否可以移动
        if (!this.canMovePiece(pieceIndex, steps)) {
            return false;
        }

        const piece = this.pieces[pieceIndex];
        const position = piece.dataset.position;

        // 从家区域移动到路径起点
        if (position === 'home') {
            piece.dataset.position = 'path';
            piece.dataset.pathIndex = 0;
            const pathPos = this.board.getPathPosition(this.color, 0);
            if (pathPos) {
                this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), pathPos.x, pathPos.y, 300);
                return true;
            }
            return false;
        }

        // 在路径上移动
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            const newIndex = currentIndex + steps;
            const fullPath = this.board.getPlayerFullPath(this.color);
            const pathLength = fullPath.length;
            
            // 根据不同的移动情况处理
            if (newIndex > pathLength) {
                // 超出路径范围，不能移动
                return false;
            } else if (newIndex === pathLength) {
                // 正好移动到路径长度的位置，先移动到路径终点，最后一步再进入中心区域
                this.animatePathMovement(piece, currentIndex, pathLength - 1, steps, onCenterEnteredCallback);
                piece.dataset.pathIndex = pathLength - 1;
            } else if (newIndex >= 0 && newIndex < pathLength) {
                // 新索引在路径范围内，移动到路径上的普通位置
                const targetPos = this.board.getPathPosition(this.color, newIndex);
                if (targetPos) {
                    this.animatePathMovement(piece, currentIndex, newIndex, steps, onCenterEnteredCallback);
                    piece.dataset.pathIndex = newIndex;
                } else {
                    return false;
                }
            }
            return true;
        }

        return false;
    }



    // 将棋子移动到中心区域（对应颜色的三角形内）
    moveToCenter(piece, onCenterEnteredCallback = null) {
        // 将棋子位置标记为终点
        piece.dataset.position = 'finish';
        
        // 获取当前颜色和已在终点区域的同色棋子数量
        const color = this.color;
        const finishPieces = document.querySelectorAll(`.player-piece.player-${color}[data-position="finish"]`);
        const pieceCount = finishPieces.length;
        
        // 标记棋子在终点区域的索引（0-3）
        piece.dataset.finishIndex = pieceCount % 4;
        
        // 计算目标位置
        const targetPos = this.calculateFinishPosition(color, pieceCount);
        
        // 动画移动到目标位置
        this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), targetPos.x, targetPos.y, 500);
        
        // 棋子成功进入中心区域后，调用回调函数
        if (typeof onCenterEnteredCallback === 'function') {
            setTimeout(() => {
                onCenterEnteredCallback();
            }, 500);
        }
    }
    
    // 计算棋子在终点区域的位置
    calculateFinishPosition(color, pieceCount) {
        // 计算棋盘中心位置
        const centerX = this.board.width / 2;
        const centerY = this.board.height / 2;
        
        // 终点区域大小和棋子间距
        const finishAreaSize = this.board.width * 0.2; // 终点区域占棋盘宽度的20%
        const pieceSize = finishAreaSize * 0.2; // 棋子大小
        const gap = finishAreaSize * 0.1; // 棋子间距
        
        // 2行2列排列：[0,1]第一行，[2,3]第二行
        const row = Math.floor(pieceCount % 4 / 2);
        const col = pieceCount % 2;
        
        // 根据颜色确定目标位置
        switch(color) {
            case 'red': // 红色三角形 - 直角在中心，长边向左
                return {
                    x: centerX - (finishAreaSize * 0.25) + (col * (pieceSize + gap)),
                    y: centerY - (finishAreaSize * 0.1) + (row * (pieceSize + gap))
                };
            case 'green': // 绿色三角形 - 直角在中心，长边朝上
                return {
                    x: centerX - (finishAreaSize * 0.1) + (col * (pieceSize + gap)),
                    y: centerY - (finishAreaSize * 0.25) + (row * (pieceSize + gap))
                };
            case 'blue': // 蓝色三角形 - 直角在中心，长边向右
                return {
                    x: centerX + (finishAreaSize * 0.05) + (col * (pieceSize + gap)),
                    y: centerY - (finishAreaSize * 0.1) + (row * (pieceSize + gap))
                };
            case 'yellow': // 黄色三角形 - 直角在中心，长边向下
                return {
                    x: centerX - (finishAreaSize * 0.1) + (col * (pieceSize + gap)),
                    y: centerY + (finishAreaSize * 0.05) + (row * (pieceSize + gap))
                };
            default:
                return { x: centerX, y: centerY };
        }
    }

    // 动画移动棋子经过路径上的每个格子
    animatePathMovement(piece, startIndex, endIndex, totalSteps, onCenterEnteredCallback = null) {
        // 参数有效性检查
        if (!piece || typeof startIndex !== 'number' || typeof endIndex !== 'number' || typeof totalSteps !== 'number') {
            return;
        }
        
        // 获取对应颜色的完整路径数组
        const fullPath = this.board.getPlayerFullPath(this.color);
        const pathLength = fullPath.length;
        
        // 计算实际移动的方向和动画配置
        const stepDirection = Math.sign(endIndex - startIndex);
        const animationDuration = 200; // 每个格子的动画持续时间（毫秒）

        // 获取当前位置
        let currentX = parseFloat(piece.style.left);
        let currentY = parseFloat(piece.style.top);

        // 创建动画函数，并传递中心区域进入回调函数
        this.moveThroughPathSteps(piece, startIndex, endIndex, totalSteps, stepDirection, currentX, currentY, animationDuration, 0, onCenterEnteredCallback);
    }
    
    // 递归移动棋子经过每个路径步骤
    moveThroughPathSteps(piece, startIndex, endIndex, totalSteps, stepDirection, currentX, currentY, animationDuration, currentStep = 0, onCenterEnteredCallback = null) {
        // 检查是否完成所有步骤
        if (currentStep >= Math.abs(totalSteps)) {
            this.checkAndSendBackOtherPieces(piece);
            return;
        }

        // 计算下一个格子的索引
        const nextIndex = startIndex + (currentStep + 1) * stepDirection;
        
        // 根据索引获取路径位置并移动棋子
        this.processNextPathIndex(piece, nextIndex, currentX, currentY, animationDuration, () => {
            // 移动完成后继续下一个步骤
            const nextPos = this.board.getPathPosition(this.color, nextIndex);
            if (nextPos) {
                this.moveThroughPathSteps(piece, startIndex, endIndex, totalSteps, stepDirection, nextPos.x, nextPos.y, animationDuration, currentStep + 1, onCenterEnteredCallback);
            }
        }, onCenterEnteredCallback);
    }
    
    // 处理下一个路径索引的移动逻辑
    processNextPathIndex(piece, nextIndex, currentX, currentY, animationDuration, onComplete, onCenterEnteredCallback = null) {
        const fullPath = this.board.getPlayerFullPath(this.color);
        const pathLength = fullPath.length;
        
        // 处理不同的移动情况
        if (nextIndex === pathLength) {
            // 正好移动到路径长度的位置，进入中心区域
            // 先移动到路径终点
            const endPos = this.board.getPathPosition(this.color, pathLength - 1);
            this.animatePieceMovement(piece, currentX, currentY, endPos.x, endPos.y, animationDuration);
            
            // 动画完成后进入中心区域
            setTimeout(() => {
                this.moveToCenter(piece, onCenterEnteredCallback);
                this.checkAndSendBackOtherPieces(piece);
                if (onComplete) onComplete();
            }, animationDuration);
        } else if (nextIndex === pathLength + 1) {
            // 正好移动到路径长度+1的位置，进入中心区域
            this.moveToCenter(piece, onCenterEnteredCallback);
        } else if (nextIndex > pathLength) {
            // 超出路径范围，不能移动
            this.checkAndSendBackOtherPieces(piece);
            if (onComplete) onComplete();
        } else if (nextIndex >= 0 && nextIndex < pathLength) {
            const nextPos = this.board.getPathPosition(this.color, nextIndex);
            if (nextPos) {
                // 更新棋子数据
                piece.dataset.pathIndex = nextIndex;

                // 动画移动到下一个格子
                this.animatePieceMovement(piece, currentX, currentY, nextPos.x, nextPos.y, animationDuration);

                // 动画完成后调用回调
                if (onComplete) {
                    setTimeout(onComplete, animationDuration);
                }
            } else {
                // 位置获取失败，结束移动
                this.checkAndSendBackOtherPieces(piece);
                if (onComplete) onComplete();
            }
        } else {
            // 无效索引处理，结束移动
            this.checkAndSendBackOtherPieces(piece);
            if (onComplete) onComplete();
        }
    }

    // 检查并送回其他玩家的棋子
    checkAndSendBackOtherPieces(currentPiece) {
        if (currentPiece.dataset.position !== 'path') {
            return;
        }
        
        const currentPlayerColor = this.color;
        const currentPathIndex = parseInt(currentPiece.dataset.pathIndex);
        
        // 获取当前棋子的实际像素坐标
        const currentPos = this.board.getPathPosition(currentPlayerColor, currentPathIndex);
        if (!currentPos) return;
        
        // 获取所有棋子
        const allPieces = document.querySelectorAll('.player-piece');
        
        // 遍历所有其他玩家的路径上的棋子
        allPieces.forEach(piece => {
            this.checkPieceCollision(piece, currentPiece, currentPlayerColor, currentPos);
        });
    }
    
    // 检查单个棋子的碰撞
    checkPieceCollision(piece, currentPiece, currentPlayerColor, currentPos) {
        // 跳过当前棋子和同一玩家的其他棋子
        if (piece === currentPiece || piece.classList[1].split('-')[1] === currentPlayerColor) {
            return;
        }
        
        // 检查是否是其他玩家在路径上的棋子
        if (piece.dataset.position === 'path') {
            const otherPieceColor = piece.classList[1].split('-')[1];
            const otherPathIndex = parseInt(piece.dataset.pathIndex);
            
            // 获取其他棋子的实际像素坐标
            const otherPos = this.board.getPathPosition(otherPieceColor, otherPathIndex);
            if (!otherPos) return;
            
            // 计算两个坐标之间的距离
            const distance = Math.sqrt(
                Math.pow(currentPos.x - otherPos.x, 2) + 
                Math.pow(currentPos.y - otherPos.y, 2)
            );
            
            // 如果距离非常小（小于一个阈值），则认为在同一格子
            const collisionThreshold = 5; // 碰撞检测阈值（像素）
            if (distance < collisionThreshold) {
                // 检查该位置是否是安全格子
                if (this.board.isInSafePosition(currentPos.x, currentPos.y)) {
                    // 在安全格子内，不将棋子送回营地
                    return;
                }
                
                // 获取该棋子的玩家颜色和索引
                const pieceIndex = parseInt(piece.dataset.index);
                
                // 将棋子送回营地
                this.sendPieceBackHome(piece, otherPieceColor, pieceIndex);
            }
        }
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