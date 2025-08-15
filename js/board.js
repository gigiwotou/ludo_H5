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
        this.initializeBoard();
    }

    initializeBoard() {
        this.createHomeAreas();
        this.createFinishArea();
        this.createPath();
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

        // 定义每个玩家的起始点和路径顺序
        const startPositions = {
            yellow: { x: 13, y: 8 },  // 黄色起点
            red: { x: 6, y: 1 },      // 红色起点
            green: { x: 1, y: 8 },    // 绿色起点
            blue: { x: 8, y: 13 }     // 蓝色起点
        };

        // 定义路径顺序（顺时针）
        this.pathOrder = {
            yellow: this.generatePath('yellow', startPositions.yellow),
            blue: this.generatePath('blue', startPositions.blue),
            green: this.generatePath('green', startPositions.green),
            red: this.generatePath('red', startPositions.red)
        };

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

            this.boardElement.appendChild(pathElement);
        });

        // 可根据 pathOrder 设置玩家起点星星等
        // this.addStartPositionStars(pathOrder); // 你可根据新顺序调整此方法
    }

    // 方法：生成玩家路径
    generatePath(color, start) {
        const path = [];
        const commonPath = [];
        const homePath = [];

        // 定义完整的公用移动路线
        const fullCommonPath = [
            { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 0, y: 8 },
            { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
            { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 },
            { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 },
            { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
            { x: 14, y: 7 }, { x: 14, y: 6 }, { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 },
            { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, { x: 8, y: 0 },
            { x: 7, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
            { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }
        ];

        switch (color) {
            case 'yellow':
                // 黄色起点(13,8)，找到在公共路径中的索引
                const yellowStartIndex = fullCommonPath.findIndex(point => point.x === start.x && point.y === start.y);
                // 从起点开始的公共路径
                if (yellowStartIndex !== -1) {
                    commonPath.push(...fullCommonPath.slice(yellowStartIndex));
                    // 添加完整公共路径剩余部分
                    commonPath.push(...fullCommonPath.slice(0, yellowStartIndex));
                }

                // 回家路径 (黄色)
                for (let y = 12; y >= 8; y--) homePath.push({ x: 6, y, type: 1 });
                break;

            case 'red':
                // 红色起点(6,1)，找到在公共路径中的索引
                const redStartIndex = fullCommonPath.findIndex(point => point.x === start.x && point.y === start.y);
                // 从起点开始的公共路径
                if (redStartIndex !== -1) {
                    commonPath.push(...fullCommonPath.slice(redStartIndex));
                    // 添加完整公共路径剩余部分
                    commonPath.push(...fullCommonPath.slice(0, redStartIndex));
                }

                // 回家路径 (红色)
                for (let x = 1; x <= 5; x++) homePath.push({ x, y: 6, type: 2 });
                break;

            case 'green':
                // 绿色起点(1,8)，找到在公共路径中的索引
                const greenStartIndex = fullCommonPath.findIndex(point => point.x === start.x && point.y === start.y);
                // 从起点开始的公共路径
                if (greenStartIndex !== -1) {
                    commonPath.push(...fullCommonPath.slice(greenStartIndex));
                    // 添加完整公共路径剩余部分
                    commonPath.push(...fullCommonPath.slice(0, greenStartIndex));
                }

                // 回家路径 (绿色)
                for (let x = 13; x >= 9; x--) homePath.push({ x, y: 6, type: 3 });
                break;

            case 'blue':
                // 蓝色起点(8,13)，找到在公共路径中的索引
                const blueStartIndex = fullCommonPath.findIndex(point => point.x === start.x && point.y === start.y);
                // 从起点开始的公共路径
                if (blueStartIndex !== -1) {
                    commonPath.push(...fullCommonPath.slice(blueStartIndex));
                    // 添加完整公共路径剩余部分
                    commonPath.push(...fullCommonPath.slice(0, blueStartIndex));
                }

                // 回家路径 (蓝色)
                for (let y = 1; y <= 5; y++) homePath.push({ x: 8, y, type: 4 });
                break;

            default:
                console.error('Unknown color:', color);
                return path;
        }

        // 合并公共路径和回家路径
        path.push(...commonPath);
        path.push(...homePath);

        return path;
    }

    addStartPositionStars() {
        // 玩家出发点索引（与player.js中的getStartIndex对应）
        const startIndices = {
            'red': 7,
            'green': 10,
            'blue': 42,
            'yellow': 39
        };

        // 为每个玩家的出发点添加星星
        Object.values(startIndices).forEach(index => {
            const pos = this.pathPositions[index];
            const star = document.createElement('div');
            star.className = 'start-star';
            star.style.left = `${pos.x - (this.width * 0.01)}px`; // 星星宽度的一半
            star.style.top = `${pos.y - (this.height * 0.01)}px`; // 星星高度的一半
            this.boardElement.appendChild(star);
        });

    }

    getHomePosition(color, index) {
        return this.homePositions[color][index];
    }

    getPathPosition(index) {
        return this.pathPositions[index];
    }

    getFinishPosition(index) {
        return this.finishPositions[index];
    }
}

export default Board;