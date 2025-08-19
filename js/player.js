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
            
            // 获取对应颜色的完整路径数组
            const fullPath = this.board.getPlayerFullPath(this.color);
            
            // 只检查移动是否有效，允许移动到有其他玩家棋子的位置
            // 碰撞检测和将其他棋子送回营地的逻辑在movePiece完成后执行
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
            piece.dataset.pathIndex = 0;
            const pathPos = this.board.getPathPosition(this.color, 0);
            this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), pathPos.x, pathPos.y, 300);
            return true;
        }

        // 在路径上移动 - 直接将当前索引加上骰子数字
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            const newIndex = currentIndex + steps;

            // 获取对应颜色的完整路径数组
            const fullPath = this.board.getPlayerFullPath(this.color);
            
            // 检查是否到达路径终点或超出范围
            if (newIndex >= fullPath.length) {
                // 直接移动到中心区域
                this.moveToCenter(piece);
            } else {
                // 直接移动到目标索引位置
                this.animatePathMovement(piece, currentIndex, newIndex, steps);
                piece.dataset.pathIndex = newIndex;
            }
            return true;
        }

        return false;
    }



    // 将棋子移动到中心区域（对应颜色的三角形内）
    moveToCenter(piece) {
        // 将棋子位置标记为终点
        piece.dataset.position = 'finish';
        
        // 获取当前颜色
        const color = this.color;
        
        // 获取所有已在终点区域的同色棋子数量
        const finishPieces = document.querySelectorAll(`.player-piece.player-${color}[data-position="finish"]`);
        const pieceCount = finishPieces.length;
        
        // 标记棋子在终点区域的索引（0-3）
        piece.dataset.finishIndex = pieceCount % 4;
        
        // 计算棋盘中心位置
        const centerX = this.board.width / 2;
        const centerY = this.board.height / 2;
        
        // 终点区域大小和棋子间距
        const finishAreaSize = this.board.width * 0.2; // 终点区域占棋盘宽度的20%
        const pieceSize = finishAreaSize * 0.2; // 棋子大小
        const gap = finishAreaSize * 0.1; // 棋子间距
        
        // 根据颜色确定三角形区域的基准位置
        let baseX = centerX;
        let baseY = centerY;
        
        // 根据颜色调整棋子在对应三角形内的位置
        // 2行2列排列：[0,1]第一行，[2,3]第二行
        const row = Math.floor(pieceCount % 4 / 2);
        const col = pieceCount % 2;
        
        let targetX, targetY;
        
        switch(color) {
            case 'red': // 红色三角形 - 直角在中心，长边向左
                // 红色三角形内的位置计算
                targetX = centerX - (finishAreaSize * 0.25) + (col * (pieceSize + gap));
                targetY = centerY - (finishAreaSize * 0.1) + (row * (pieceSize + gap));
                break;
            case 'green': // 绿色三角形 - 直角在中心，长边朝上
                // 绿色三角形内的位置计算
                targetX = centerX - (finishAreaSize * 0.1) + (col * (pieceSize + gap));
                targetY = centerY - (finishAreaSize * 0.25) + (row * (pieceSize + gap));
                break;
            case 'blue': // 蓝色三角形 - 直角在中心，长边向右
                // 蓝色三角形内的位置计算
                targetX = centerX + (finishAreaSize * 0.05) + (col * (pieceSize + gap));
                targetY = centerY - (finishAreaSize * 0.1) + (row * (pieceSize + gap));
                break;
            case 'yellow': // 黄色三角形 - 直角在中心，长边向下
                // 黄色三角形内的位置计算
                targetX = centerX - (finishAreaSize * 0.1) + (col * (pieceSize + gap));
                targetY = centerY + (finishAreaSize * 0.05) + (row * (pieceSize + gap));
                break;
            default:
                targetX = centerX;
                targetY = centerY;
        }
        
        // 动画移动到目标位置
        this.animatePieceMovement(piece, parseFloat(piece.style.left), parseFloat(piece.style.top), targetX, targetY, 500);
    }

    // 动画移动棋子经过路径上的每个格子
    animatePathMovement(piece, startIndex, endIndex, totalSteps) {
        // 获取对应颜色的完整路径数组
        const fullPath = this.board.getPlayerFullPath(this.color);
        
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

            // 计算下一个格子的索引，不支持循环
            const nextIndex = startIndex + (currentStep + 1) * stepDirection;
            
            // 检查是否超出路径范围
            if (nextIndex >= fullPath.length) {
                // 移动到中心区域
                this.moveToCenter(piece);
                return;
            }
            
            const nextPos = this.board.getPathPosition(this.color, nextIndex);

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
        
        const currentPlayerColor = this.color;
        const currentPathIndex = parseInt(currentPiece.dataset.pathIndex);
        
        // 获取当前棋子的实际像素坐标
        const currentPos = this.board.getPathPosition(currentPlayerColor, currentPathIndex);
        if (!currentPos) return;
        
        // 获取所有棋子
        const allPieces = document.querySelectorAll('.player-piece');
        
        allPieces.forEach(piece => {
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
                
                // 计算两个坐标之间的距离，判断是否在同一格子（考虑浮点精度误差）
                const distance = Math.sqrt(
                    Math.pow(currentPos.x - otherPos.x, 2) + 
                    Math.pow(currentPos.y - otherPos.y, 2)
                );
                
                // 如果距离非常小（小于一个阈值），则认为在同一格子
                const collisionThreshold = 5; // 碰撞检测阈值（像素）
                if (distance < collisionThreshold) {
                    // 获取该棋子的玩家颜色和索引
                    const pieceIndex = parseInt(piece.dataset.index);
                    
                    // 将棋子送回营地
                    this.sendPieceBackHome(piece, otherPieceColor, pieceIndex);
                }
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