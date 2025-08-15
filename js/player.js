class Player {
    constructor(color, board) {
        this.color = color;
        this.board = board;
        this.pieces = [];
        this.startIndex = this.getStartIndex();
        this.createPieces();
    }

    getStartIndex() {
        // 根据颜色确定起始路径索引（匹配新的棋盘布局）
        switch(this.color) {
            case 'red': return 22;  // 红色起点(6,1)对应的路径索引
            case 'green': return 13;  // 绿色起点(1,8)对应的路径索引
            case 'blue': return 35;  // 蓝色起点(8,13)对应的路径索引
            case 'yellow': return 45;  // 黄色起点(13,8)对应的路径索引
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
            const newIndex = (currentIndex + steps) % this.board.pathPositions.length;
            return newIndex >= 0 && newIndex < this.board.pathPositions.length;
        }

        // 如果棋子在终点区域，检查移动是否有效
        if (position === 'finish') {
            const currentIndex = parseInt(piece.dataset.finishIndex);
            const newIndex = currentIndex + steps;
            return newIndex >= 0 && newIndex < this.board.finishPositions.length;
        }

        return false;
    }

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

        // 在路径上移动
        if (position === 'path') {
            const currentIndex = parseInt(piece.dataset.pathIndex);
            let newIndex = currentIndex + steps;

            // 检查是否到达终点区域入口
            const finishEntryIndices = {
                'red': 21,  // 红色终点区域入口索引
                'green': 12,  // 绿色终点区域入口索引
                'blue': 34,  // 蓝色终点区域入口索引
                'yellow': 44  // 黄色终点区域入口索引
            };
            
            if (newIndex === finishEntryIndices[this.color]) {
                piece.dataset.position = 'finish';
                piece.dataset.finishIndex = 0;
                piece.dataset.pathIndex = '-1';
                const finishPos = this.board.getFinishPosition(0);
                const currentPos = {
                    x: parseFloat(piece.style.left),
                    y: parseFloat(piece.style.top)
                };
                this.animatePieceMovement(piece, currentPos.x, currentPos.y, finishPos.x, finishPos.y, 300);
                return true;
            }

            // 确保索引在有效范围内
            newIndex = ((newIndex % this.board.pathPositions.length) + this.board.pathPositions.length) % this.board.pathPositions.length;

            // 动画移动棋子经过每个格子
            this.animatePathMovement(piece, currentIndex, newIndex, steps);
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

    // 动画移动棋子经过路径上的每个格子
    animatePathMovement(piece, startIndex, endIndex, totalSteps) {
        // 确保路径索引是有效的
        if (startIndex < 0 || endIndex < 0 || startIndex >= this.board.pathPositions.length || endIndex >= this.board.pathPositions.length) {
            return;
        }

        // 计算移动方向（向前或向后）
        const stepDirection = Math.sign(endIndex - startIndex);
        let currentStep = 0;
        const animationDuration = 200; // 每个格子的动画持续时间（毫秒）

        // 获取当前位置
        let currentX = parseFloat(piece.style.left);
        let currentY = parseFloat(piece.style.top);

        // 创建动画函数
        const moveOneStep = () => {
            if (currentStep >= Math.abs(totalSteps)) {
                return;
            }

            // 计算下一个格子的索引
            const nextIndex = startIndex + (currentStep + 1) * stepDirection;
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
        // 检查所有棋子是否都在终点区域
        return this.pieces.every(piece => piece.dataset.position === 'finish');
    }
}

export default Player;