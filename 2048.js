const ROW = 4,
    COL = 4,
    CANVAS_WIDTH = 900,
    CANVAS_HEIGHT = 900,
    WIDTH = 225,
    HEIGHT = 225,
    EXEC_DIR = [-4, 1, 4, -1],
    EXEC_STAND = [1, 4, 1, 4],
    EXEC_START = [12, 0, 0, 3],
    RECT_COLOR = ['#888888', '#00aaff', '#00dddd', '#dddd00', '#00dd00', '#ffaa00', '#dd00dd', '#aa00ff', '#b8860b', '#dd0000', '#800000', '#191970', '#2f4f4f']

let canvas,
    content,
    nums = Array.apply(null, Array(16)).map(() => { return 0 }),
    numToLoc = Array.apply(null, Array(16)).map((item, i) => { return i }),
    rects = [],
    isGameOver = false

function randInt(m, n) {
    let d = n - m,
        x = Math.random() * (d + 1)
    return Math.floor(x + m)
}

function init() {
    canvas = document.getElementById('canvas')
    content = document.getElementById('content')

    initBase()
    initRect()

    createNum()
    animateNum()
}

function onClick(e) {
    let x = e.pageX,
        y = e.pageY,
        down = CANVAS_HEIGHT - y

    if (isGameOver) {
        return
    }

    if (x >= y) {
        if (x <= down) {
            execute(0)
        } else {
            execute(1)
        }
    } else {
        if (x <= down) {
            execute(3)
        } else {
            execute(2)
        }
    }
}

function initBase() {
    for (let row = 0; row < ROW; ++row) {
        for (let col = 0; col < COL; ++col) {
            let rect = document.createElement('div')
            rect.className = 'base'
            rect.id = 'base' + (row*4+col)
            rect.style.left = (col * WIDTH) + 'px'
            rect.style.top = (row * HEIGHT) + 'px'
            canvas.appendChild(rect)
        }
    }
}

function initRect() {
    for (let row = 0; row < ROW; ++row) {
        for (let col = 0; col < COL; ++col) {
            let rect = document.createElement('div')
            rect.className = 'rect'
            rect.id = 'rect' + (row*4+col)
            rects.push(rect)
            canvas.appendChild(rect)
        }
    }
}

function createNum() {
    let zeroList = [],
        newNum = 0
    for (let i = 0; i < 16; ++i) {
        if (nums[i] === 0) {
            zeroList.push(i)
        }
    }

    if (zeroList.length >= 15) {
        newNum = 3
    } else if (zeroList.length >= 8 && zeroList.length <= 14) {
        newNum = 2
    } else if (zeroList.length > 0 && zeroList.length <= 7) {
        newNum = 1
    }

    for (let i = 0; i < newNum; ++i) {
        let index = randInt(0, zeroList.length - 1),
            rd = Math.random(),
            n = 2

        if (rd > 0.95) {
            n = 8
        } else if (rd > 0.75) {
            n = 4
        }

        nums[zeroList[index]] = n
        zeroList.splice(index, 1)
    }
}

function animateNum() {
    let toLoc
    for (let i=0; i<16; ++i) {
        toLoc = numToLoc[i]
        rects[i].className = 'rect rectTrans'
        rects[i].style.left = WIDTH * (toLoc % 4) + 'px'
        rects[i].style.top = HEIGHT * Math.floor(toLoc / 4) + 'px'
    }
    setTimeout(updateNum, 200)
}

function updateNum() {
    for (let i=0; i<16; ++i) {
        rects[i].className = 'rect'
        rects[i].style.left = WIDTH * (i % 4) + 'px'
        rects[i].style.top = HEIGHT * Math.floor(i / 4) + 'px'
        if (nums[i] !== 0) {
            rects[i].style.opacity = 1
            rects[i].style.backgroundColor = RECT_COLOR[Math.floor(Math.log2(nums[i]) - 1)]
            rects[i].innerText = nums[i]
        } else {
            rects[i].style.opacity = 0
        }
    }
}

function execute(direction) {
    // direction: 0: up, 1: right, 2: down, 3: left

    let last = 0,
        index,
        numList,
        copyNums = nums.concat(),
        currentLoc

    for (let i = 0; i < 4; ++i) {
        last = 0
        numList = []
        currentLoc = EXEC_START[direction] + 3 * EXEC_DIR[direction] + i * EXEC_STAND[direction]
        for (let j = 3; j >= 0; --j) {
            index = EXEC_START[direction] + j * EXEC_DIR[direction] + i * EXEC_STAND[direction]
            numToLoc[index] = currentLoc
            if (j === 3) {
                last = nums[index]
                if (nums[index] !== 0) {
                    numList.push(nums[index])
                    currentLoc -= EXEC_DIR[direction]
                }
            } else {
                if (nums[index] !== 0) {
                    if (nums[index] === last) {
                        numList.pop()
                        numList.push(nums[index] * 2)
                        numToLoc[index] += EXEC_DIR[direction]
                        last = 0
                    } else {
                        last = nums[index]
                        numList.push(nums[index])
                        currentLoc -= EXEC_DIR[direction]
                    }
                }
            }
        }
        for (let j = 0; j < 4; ++j) {
            index = EXEC_START[direction] + j * EXEC_DIR[direction] + i * EXEC_STAND[direction]
            if (numList.length >= 4 - j) {
                nums[index] = numList.pop()
            } else {
                nums[index] = 0
            }
        }
    }

    for (let i = 0; i < 16; ++i) {
        if (copyNums[i] !== nums[i]) {
            createNum()
            animateNum()
            judgeGameOver()
            return
        }
    }
}

function judgeGameOver() {
    let index
    for (let i=0; i<16; ++i) {
        if (nums[i] === 0) {
            return
        }
    }
    for (let dir=0; dir<4; ++dir) {
        for (let i=0; i<4; ++i) {
            for (let j=0; j<3; ++j) {
                index = EXEC_START[dir] + j * EXEC_DIR[dir] + i * EXEC_STAND[dir]
                if (nums[index] === nums[index+EXEC_DIR[dir]]) {
                    return
                }
            }
        }
    }
    isGameOver = true
    setTimeout(function() {
        content.innerText = 'GAME OVER'
        content.style.opacity = 1
    }, 300)
}
