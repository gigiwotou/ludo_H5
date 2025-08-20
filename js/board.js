class Board {
    constructor() {
        this.boardElement = document.querySelector('.game-board');
        this.width = this.boardElement.offsetWidth;
        this.height = this.boardElement.offsetHeight;
        this.pathPositions = [];
        this.homePositions = {
            red: [],
            green: [],
            blue: [],
            yellow: []
        };
        this.finishPositions = [];
        this.safePositions = []; // 存储安全格子的位置
        
        // 定义每个玩家的完整路径 - 从各自的起点开始的完整路径
        this.initializePathArrays();
        
        this.initializeBoard();
    }
    
    // 初始化路径数组
    initializePathArrays() {
        this.redFullCommonPath = [
            { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}
        ];

        this.greenFullCommonPath = [            
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}
        ];

        this.blueFullCommonPath = [
            { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, {x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}
        ];

        this.yellowFullCommonPath = [
           { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, {x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}
        ];
    }
    
    // 根据玩家颜色获取对应的完整路径数组
    getPlayerFullPath(color) {
        switch(color) {
            case 'red': return this.redFullCommonPath;
            case 'green': return this.greenFullCommonPath;
            case 'blue': return this.blueFullCommonPath;
            case 'yellow': return this.yellowFullCommonPath;
            default: return this.redFullCommonPath;
        }
    }

    initializeBoard() {
        this.createHomeAreas();
        this.createFinishArea();
        this.createPath();
        this.addSafePositionStars();
    }

    createHomeAreas() {
        // 创建红色家区域
        const redHome = document.createElement('div');
        redHome.className = 'home-area red-home';
        this.boardElement.appendChild(redHome);
        this.calculateHomePositions('red');

        // 创建绿色家区域
        const greenHome = document.createElement('div');
        greenHome.className = 'home-area green-home';
        this.boardElement.appendChild(greenHome);
        this.calculateHomePositions('green');

        // 创建蓝色家区域
        const blueHome = document.createElement('div');
        blueHome.className = 'home-area blue-home';
        this.boardElement.appendChild(blueHome);
        this.calculateHomePositions('blue');

        // 创建黄色家区域
        const yellowHome = document.createElement('div');
        yellowHome.className = 'home-area yellow-home';
        this.boardElement.appendChild(yellowHome);
        this.calculateHomePositions('yellow');
    }

    calculateHomePositions(color) {
        // 修改每个玩家的家的位置
        const positions = {
            yellow: { x: 1, y: 13, offsetX: [0, 1, 0, 1], offsetY: [-1, -1, 0, 0] },
            red: { x: 1, y: 1, offsetX: [0, 1, 0, 1], offsetY: [0, 0, 1, 1] },
            green: { x: 13, y: 1, offsetX: [-1, 0, -1, 0], offsetY: [0, 0, 1, 1] },
            blue: { x: 13, y: 13, offsetX: [-1, 0, -1, 0], offsetY: [-1, -1, 0, 0] }
        };

        const pos = positions[color];
        const cellSize = this.width / 15;  // 改为15x15网格

        // 计算每个棋子的具体像素位置
        this.homePositions[color] = pos.offsetX.map((ox, i) => ({
            x: (pos.x + ox) * cellSize,
            y: (pos.y + pos.offsetY[i]) * cellSize
        }));

        // 创建棋子起始点的视觉元素
        this.homePositions[color].forEach((position) => {
            const startPoint = document.createElement('div');
            startPoint.className = `home-point ${color}-point`;
            startPoint.style.left = `${position.x}px`;
            startPoint.style.top = `${position.y}px`;
            startPoint.style.width = `${cellSize * 0.8}px`;
            startPoint.style.height = `${cellSize * 0.8}px`;
            this.boardElement.appendChild(startPoint);
        });
    }

    createFinishArea() {
        const finishArea = document.createElement('div');
        finishArea.className = 'finish-area';
        this.boardElement.appendChild(finishArea);

        // 创建四个等边直角三角形，每个对应一个颜色的终点区域
        const colors = ['red', 'green', 'blue', 'yellow'];
        colors.forEach(color => {
            const triangle = document.createElement('div');
            triangle.className = `finish-triangle finish-triangle-${color}`;
            finishArea.appendChild(triangle);
        });

        const rect = finishArea.getBoundingClientRect();
        const boardRect = this.boardElement.getBoundingClientRect();

        const finishX = rect.left - boardRect.left;
        const finishY = rect.top - boardRect.top;
        const cellWidth = rect.width / 2;
        const cellHeight = rect.height / 2;

        // 计算终点区域内的位置
        this.finishPositions = [
            { x: finishX + cellWidth / 2, y: finishY + cellHeight / 2 },
            { x: finishX + cellWidth * 1.5, y: finishY + cellHeight / 2 },
            { x: finishX + cellWidth / 2, y: finishY + cellHeight * 1.5 },
            { x: finishX + cellWidth * 1.5, y: finishY + cellHeight * 1.5 }
        ];
    }

    createPath() {
        const grid = [
            // 修改为13x13网格，便于计算
            [null, null, null, null, null, null, 0, 0, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 3, 3, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 3, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 3, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 3, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 3, 0, null, null, null, null, null, null],
            [0, 2, 0, 0, 0, 0, null, null, null, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, null, null, null, 4, 4, 4, 4, 4, 0],
            [0, 0, 0, 0, 0, 0, null, null, null, 0, 0, 0, 0, 4, 0],
            [null, null, null, null, null, null, 0, 1, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 1, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 1, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 1, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 1, 1, 0, null, null, null, null, null, null],
            [null, null, null, null, null, null, 0, 0, 0, null, null, null, null, null, null],
        ];
        
    

        // 每个玩家的完整路径 - 从各自的起点开始的完整路径
        this.redFullCommonPath = [
            { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}
        ];

        this.greenFullCommonPath = [            
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}
        ];

        this.blueFullCommonPath = [
            { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, {x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7}, {x: 10, y: 7}, {x: 9, y: 7}
        ];

        this.yellowFullCommonPath = [
           { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
            { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
            { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
            { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
            { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
            { x: 14, y: 7 }, { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
            { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
            { x: 7, y: 14 }, {x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11}, {x: 7, y: 10}, {x: 7, y: 9}
        ];

        // 将格子映射为像素点
        const cellW = this.width / 15;
        const cellH = this.height / 15;
        this.pathPositions = [];
        let pathOrder = []; // 路径顺序（用于玩家移动）

        // 生成路径点
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                const type = grid[y][x];
                if (type !== null) {
                    this.pathPositions.push({
                        x: x * cellW + cellW / 2,
                        y: y * cellH + cellH / 2,
                        type
                    });
                    // 记录路径顺序（只记录公共路线和各自回家路线的顺序，具体顺序需根据规则调整）
                    if (type === 0 || type === 1 || type === 2 || type === 3 || type === 4) {
                        pathOrder.push({ x, y, type });
                    }
                }
            }
        }

        // 修改路径点样式
        this.pathPositions.forEach((pos, idx) => {
            const pathElement = document.createElement('div');
            pathElement.className = 'path';
            pathElement.style.width = `${cellW * 0.9}px`;
            pathElement.style.height = `${cellH * 0.9}px`;
            pathElement.style.left = `${pos.x - cellW * 0.45}px`;
            pathElement.style.top = `${pos.y - cellH * 0.45}px`;
            pathElement.style.position = 'absolute';
            pathElement.style.display = 'flex';
            pathElement.style.justifyContent = 'center';
            pathElement.style.alignItems = 'center';
            pathElement.style.fontSize = '10px';
            pathElement.style.color = 'white';
            pathElement.style.zIndex = '10';

            // 按类型添加不同颜色样式
            switch (pos.type) {
                case 1:
                    pathElement.classList.add('path-yellow');
                    break;
                case 2:
                    pathElement.classList.add('path-red');
                    break;
                case 3:
                    pathElement.classList.add('path-green');
                    break;
                case 4:
                    pathElement.classList.add('path-blue');
                    break;
                default:
                    pathElement.classList.add('path-common');
                    break;
            }

            // 获取当前路径点对应的grid数组中的行和列索引
            const gridPos = pathOrder[idx];
            const gridRow = gridPos.y; // 行索引
            const gridCol = gridPos.x; // 列索引
            
            // 添加显示行和列数字的文本节点
            const gridText = document.createElement('span');
            gridText.textContent = `(${gridCol},${gridRow})`;
            gridText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
            pathElement.appendChild(gridText);

            this.boardElement.appendChild(pathElement);
        });



        
    }
    
    // 添加安全星星格子（安全格子内的棋子不会被踢回营地）
    addSafePositionStars() {
        // 安全格子的坐标位置
        const safeGridPositions = [
            {x: 6, y: 13}, {x: 2, y: 8}, {x: 1, y: 6}, {x: 6, y: 2},
            {x: 8, y: 1}, {x: 12, y: 6}, {x: 13, y: 8}, {x: 8, y: 12}
        ];
        
        const cellW = this.width / 15;
        const cellH = this.height / 15;
        
        safeGridPositions.forEach(pos => {
            // 将网格坐标转换为像素坐标
            const pixelX = pos.x * cellW + cellW / 2;
            const pixelY = pos.y * cellH + cellH / 2;
            
            // 创建星星元素
            const star = document.createElement('div');
            star.className = 'safe-star';
            // 设置星星位置为格子的中心，确保transform: translate(-50%, -50%)在CSS中实现了居中
            star.style.left = `${pixelX}px`;
            star.style.top = `${pixelY}px`;
            this.boardElement.appendChild(star);
            
            // 存储安全格子的像素坐标
            this.safePositions.push({x: pixelX, y: pixelY});
        });
    }
    
    // 检查指定坐标是否在安全格子内
    isInSafePosition(x, y) {
        const threshold = 5; // 检查阈值
        
        return this.safePositions.some(pos => {
            const distance = Math.sqrt(
                Math.pow(x - pos.x, 2) + 
                Math.pow(y - pos.y, 2)
            );
            return distance < threshold;
        });
    }



    getHomePosition(color, index) {
        if (!this.homePositions[color] || index < 0 || index >= this.homePositions[color].length) {
            return null;
        }
        return this.homePositions[color][index];
    }

    // 获取路径上指定索引的位置，通过颜色和index获取对应颜色棋子的路径坐标
    getPathPosition(color, index) {
        // 参数有效性检查
        if (typeof color !== 'string' || typeof index !== 'number' || isNaN(index)) {
            return null;
        }
        
        // 获取对应颜色的完整路径数组
        const fullPath = this.getPlayerFullPath(color);
        if (!fullPath || fullPath.length === 0) {
            return null;
        }
        
        // 特殊处理：如果索引等于路径长度+1，表示要进入中心区域
        if (index === fullPath.length + 1) {
            return null;
        }
        
        // 检查索引是否在有效范围内（0到路径长度-1）
        if (index < 0 || index >= fullPath.length) {
            return null;
        }
        
        // 获取路径点坐标并转换为像素坐标
        const point = fullPath[index];
        if (!point) {
            return null;
        }
        
        const cellW = this.width / 15;
        const cellH = this.height / 15;
        
        return {
            x: point.x * cellW + cellW / 2,
            y: point.y * cellH + cellH / 2,
            type: 0
        };
    }

    // 根据坐标获取路径位置
    getPathPositionByCoordinates(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
            return null;
        }
        
        const cellW = this.width / 15;
        const cellH = this.height / 15;

        // 计算像素位置
        return {
            x: x * cellW + cellW / 2,
            y: y * cellH + cellH / 2
        };
    }

    getFinishPosition(index) {
        if (index < 0 || index >= this.finishPositions.length) {
            return null;
        }
        return this.finishPositions[index];
    }
}

export default Board;