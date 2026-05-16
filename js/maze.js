function randCoord(width, height) {
    return [
        (Math.floor(Math.random() * Math.floor(height / 2)) * 2) + 1,
        (Math.floor(Math.random() * Math.floor(width / 2)) * 2) + 1
    ];
}

function neighbors(maze, ic, jc) {
    const final = [];
    for (let i = 0; i < 4; i++) {
        const n = [ic, jc];
        n[i % 2] += ((Math.floor(i / 2) * 2) || -2);
        if (n[0] < maze.length && n[1] < maze[0].length && n[0] > 0 && n[1] > 0) {
            if (maze[n[0]][n[1]] === 1) {
                final.push(n);
            }
        }
    }
    return final;
}

function neighborsAB(maze, ic, jc) {
    const final = [];
    for (let i = 0; i < 4; i++) {
        const n = [ic, jc];
        n[i % 2] += ((Math.floor(i / 2) * 2) || -2);
        if (n[0] < maze.length && n[1] < maze[0].length && n[0] > 0 && n[1] > 0) {
            final.push(n);
        }
    }
    return final;
}

function indexOfSet(sets, c) {
    for (let i = 0; i < sets.length; i++) {
        if (contains(sets[i], c)) return i;
    }
    return -1;
}

function contains(s, c) {
    for (let i = 0; i < s.length; i++) {
        if (s[i][0] === c[0] && s[i][1] === c[1]) return true;
    }
    return false;
}

function complete(maze) {
    for (let i = 1; i < maze.length; i += 2) {
        for (let j = 1; j < maze[0].length; j += 2) {
            if (maze[i][j] !== 0) return false;
        }
    }
    return true;
}

function horv(iDim, jDim) {
    if (iDim < jDim) return "v";
    else if (jDim < iDim) return "h";
    else return Math.floor(Math.random() * 2) ? "h" : "v";
}

function backtrackingMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(1);
        }
    }
    
    maze[0][1] = 0;
    
    const start = [];
    do { start[0] = Math.floor(Math.random() * height); } while (start[0] % 2 === 0);
    do { start[1] = Math.floor(Math.random() * width); } while (start[1] % 2 === 0);
    
    maze[start[0]][start[1]] = 0;
    const openCells = [start];
    
    while (openCells.length) {
        let cell, n;
        openCells.push([-1, -1]);
        
        do {
            openCells.pop();
            if (openCells.length === 0) break;
            cell = openCells[openCells.length - 1];
            n = neighbors(maze, cell[0], cell[1]);
        } while (n.length === 0 && openCells.length > 0);
        
        if (openCells.length === 0) break;
        
        const choice = n[Math.floor(Math.random() * n.length)];
        openCells.push(choice);
        
        maze[choice[0]][choice[1]] = 0;
        maze[(choice[0] + cell[0]) / 2][(choice[1] + cell[1]) / 2] = 0;
    }
    
    maze[maze.length - 1][maze[0].length - 2] = 0;
    return maze;
}

function primsMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(1);
        }
    }
    
    maze[0][1] = 0;
    
    const start = [];
    do { start[0] = Math.floor(Math.random() * height); } while (start[0] % 2 === 0);
    do { start[1] = Math.floor(Math.random() * width); } while (start[1] % 2 === 0);
    
    maze[start[0]][start[1]] = 0;
    const openCells = [start];
    
    while (openCells.length) {
        const index = Math.floor(Math.random() * openCells.length);
        const cell = openCells[index];
        let n = neighbors(maze, cell[0], cell[1]);
        
        while (n.length === 0) {
            openCells.splice(index, 1);
            if (openCells.length === 0) break;
            n = neighbors(maze, openCells[Math.floor(Math.random() * openCells.length)][0], openCells[Math.floor(Math.random() * openCells.length)][1]);
        }
        if (openCells.length === 0) break;

        const choice = n[Math.floor(Math.random() * n.length)];
        openCells.push(choice);
        
        if (n.length === 1) {
            openCells.splice(index, 1);
        }
        
        maze[choice[0]][choice[1]] = 0;
        maze[(choice[0] + cell[0]) / 2][(choice[1] + cell[1]) / 2] = 0;
    }
    
    maze[maze.length - 1][maze[0].length - 2] = 0;
    return maze;
}

function ellersMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(!(i % 2 === 1 && j % 2 === 1) + 0);
        }
    }
    
    maze[0][1] = 0;
    
    const sets = [];
    for (let i = 1; i < width; i += 2) {
        sets.push([[1, i]]);
    }
    
    for (let i = 1; i < height; i += 2) {
        for (let m = 0; m < sets.length; m++) {
            for (let n = sets[m].length - 1; n >= 0; n--) {
                if (sets[m][n][0] < i) sets[m].splice(n, 1);
            }
        }
        
        for (let j = 3; j < width; j += 2) {
            const set1 = indexOfSet(sets, [i, j - 2]);
            const set2 = indexOfSet(sets, [i, j]);
            if (set1 !== set2) {
                const join = (i !== height - 2) ? Math.floor(Math.random() * 2) : 1;
                if (join) {
                    const removed = sets.splice(set2, 1)[0];
                    if (set2 < set1) set1--;
                    sets[set1] = sets[set1].concat(removed);
                    maze[i][j - 1] = 0;
                }
            }
        }
        
        if (i === height - 2) break;
        
        const initialSetLength = sets.length;
        for (let j = 0; j < initialSetLength; j++) {
            let continued = false;
            const initialLength = sets[j].length;
            for (let k = 0; k < initialLength; k++) {
                const newCoord = sets[j][k].slice();
                newCoord[0] += 2;
                if (newCoord[0] !== i + 2) continue;
                
                const add = Math.floor(Math.random() * 2);
                if (add) {
                    continued = true;
                    sets[j].push(newCoord);
                    maze[newCoord[0] - 1][newCoord[1]] = 0;
                } else {
                    sets.push([newCoord]);
                }
            }
            
            if (!continued) {
                let ind;
                do { ind = Math.floor(Math.random() * sets[j].length); } while (sets[j][ind][0] !== i);
                const newC = sets[j][ind].slice();
                newC[0] += 2;
                const setIndex = indexOfSet(sets, newC);
                if (setIndex !== -1) {
                    sets.splice(setIndex, 1);
                    if (setIndex < j) j--;
                }
                sets[j].push(newC);
                maze[newC[0] - 1][newC[1]] = 0;
            }
        }
    }
    
    maze[height - 1][width - 2] = 0;
    return maze;
}

function kruskalsMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    const sets = [];
    const edges = [];
    
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            const add = !(i % 2 === 1 && j % 2 === 1);
            maze[i].push(add + 0);
            if (!add) sets.push([[i, j]]);
            if (i !== height - 2 && !add) edges.push([i + 1, j]);
            if (j !== width - 2 && !add) edges.push([i, j + 1]);
        }
    }
    
    maze[0][1] = 0;
    
    while (edges.length) {
        const index = Math.floor(Math.random() * edges.length);
        const removed = edges.splice(index, 1)[0];
        const iorj = removed[0] % 2;
        
        const cell1 = iorj ? [removed[0], removed[1] - 1] : [removed[0] - 1, removed[1]];
        const cell2 = iorj ? [removed[0], removed[1] + 1] : [removed[0] + 1, removed[1]];
        
        const i1 = indexOfSet(sets, cell1);
        const i2 = indexOfSet(sets, cell2);
        
        if (i1 !== i2) {
            const add = sets.splice(i2, 1)[0];
            if (i2 < i1) i1--;
            sets[i1] = sets[i1].concat(add);
            maze[removed[0]][removed[1]] = 0;
        }
    }
    
    maze[height - 1][width - 2] = 0;
    return maze;
}

function wilsonsMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(1);
        }
    }
    
    let s = randCoord(width, height);
    maze[s[0]][s[1]] = 0;
    
    while (!complete(maze)) {
        let c;
        do { c = randCoord(width, height); } while (maze[c[0]][c[1]] !== 1);
        
        maze[c[0]][c[1]] = 2;
        const path = [c];
        
        while (maze[path[path.length - 1][0]][path[path.length - 1][1]] !== 0) {
            const last = path[path.length - 1];
            const n = neighborsAB(maze, last[0], last[1]);
            const nb = n[Math.floor(Math.random() * n.length)];
            path.push(nb);
            
            maze[(nb[0] + last[0]) / 2][(nb[1] + last[1]) / 2] = 2;
            
            if (maze[nb[0]][nb[1]] === 0) {
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        if (maze[i][j] === 2) maze[i][j] = 0;
                    }
                }
            } else {
                maze[nb[0]][nb[1]] = 2;
                const loc = indexOfCoord(path, nb);
                if (loc !== path.length - 1) {
                    const removed = path.splice(loc + 1, path.length - loc - 1);
                    maze[(nb[0] + last[0]) / 2][(nb[1] + last[1]) / 2] = 1;
                    last = path[path.length - 1];
                    
                    for (let k = removed.length - 1; k >= 0; k--) {
                        const on = removed[k];
                        const next = k ? removed[k - 1] : last;
                        if (k !== removed.length - 1) maze[on[0]][on[1]] = 1;
                        maze[(on[0] + next[0]) / 2][(on[1] + next[1]) / 2] = 1;
                    }
                }
            }
        }
    }
    
    maze[0][1] = 0;
    maze[height - 1][width - 2] = 0;
    return maze;
}

function indexOfCoord(s, c) {
    for (let i = 0; i < s.length; i++) {
        if (s[i][0] === c[0] && s[i][1] === c[1]) return i;
    }
    return -1;
}

function aldousBroderMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    let unvisited = 0;
    
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            const add = (i % 2 === 1 && j % 2 === 1);
            if (add) unvisited++;
            maze[i].push(1);
        }
    }
    
    let on = [];
    do {
        on[0] = Math.floor(Math.random() * height);
        on[1] = Math.floor(Math.random() * width);
    } while (on[0] % 2 === 0 || on[1] % 2 === 0);
    
    maze[on[0]][on[1]] = 0;
    unvisited--;
    
    while (unvisited > 0) {
        const n = neighborsAB(maze, on[0], on[1]);
        const to = n[Math.floor(Math.random() * n.length)];
        
        if (maze[to[0]][to[1]] === 1) {
            maze[to[0]][to[1]] = 0;
            maze[(to[0] + on[0]) / 2][(to[1] + on[1]) / 2] = 0;
            unvisited--;
        }
        on = to;
    }
    
    maze[0][1] = 0;
    maze[height - 1][width - 2] = 0;
    return maze;
}

function recursiveDivisionMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push((i === 0 || j === 0 || i === height - 1 || j === width - 1) + 0);
        }
    }
    
    divide(maze, [1, height - 2], [1, width - 2], horv(1, 1));
    
    maze[0][1] = 0;
    maze[height - 1][width - 2] = 0;
    return maze;
}

function divide(maze, iCoords, jCoords, hv) {
    const iDim = iCoords[1] - iCoords[0];
    const jDim = jCoords[1] - jCoords[0];
    
    if (iDim <= 0 || jDim <= 0) return;
    
    if (hv === "h") {
        let split;
        do { split = Math.floor(Math.random() * (iDim + 1)) + iCoords[0]; } while (split % 2);
        
        let hole;
        do { hole = Math.floor(Math.random() * (jDim + 1)) + jCoords[0]; } while (!(hole % 2));
        
        for (let j = jCoords[0]; j <= jCoords[1]; j++) {
            if (j !== hole) maze[split][j] = 1;
        }
        
        divide(maze, [iCoords[0], split - 1], jCoords, horv(split - iCoords[0] - 1, jDim));
        divide(maze, [split + 1, iCoords[1]], jCoords, horv(iCoords[1] - split - 1, jDim));
    } else {
        let split;
        do { split = Math.floor(Math.random() * (jDim + 1)) + jCoords[0]; } while (split % 2);
        
        let hole;
        do { hole = Math.floor(Math.random() * (iDim + 1)) + iCoords[0]; } while (!(hole % 2));
        
        for (let i = iCoords[0]; i <= iCoords[1]; i++) {
            if (i !== hole) maze[i][split] = 1;
        }
        
        divide(maze, iCoords, [jCoords[0], split - 1], horv(iDim, split - jCoords[0] - 1));
        divide(maze, iCoords, [split + 1, jCoords[1]], horv(jCoords[0] - split - 1, iDim));
    }
}

function huntAndKillMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(1);
        }
    }
    
    maze[0][1] = 0;
    maze[1][1] = 0;
    
    let on = [1, 1];
    
    while (!complete(maze)) {
        const n = neighbors(maze, on[0], on[1]);
        if (n.length === 0) {
            const t = findCoord(maze);
            on = t[0];
            maze[on[0]][on[1]] = 0;
            maze[(on[0] + t[1][0]) / 2][(on[1] + t[1][1]) / 2] = 0;
        } else {
            const i = Math.floor(Math.random() * n.length);
            const nb = n[i];
            maze[nb[0]][nb[1]] = 0;
            maze[(nb[0] + on[0]) / 2][(nb[1] + on[1]) / 2] = 0;
            on = nb.slice();
        }
    }
    
    maze[height - 2][width - 1] = 0;
    return maze;
}

function findCoord(maze) {
    for (let i = 1; i < maze.length; i += 2) {
        for (let j = 1; j < maze[0].length; j += 2) {
            if (maze[i][j] === 1) {
                const n = neighborsAB(maze, i, j);
                for (let k = 0; k < n.length; k++) {
                    if (maze[n[k][0]][n[k][1]] === 0) return [[i, j], n[k]];
                }
            }
        }
    }
}

function sidewinderMaze(width, height) {
    width += !(width % 2);
    height += !(height % 2);
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(!(i % 2 === 1 && j % 2 === 1) + 0);
        }
    }
    
    for (let row = 1; row < height; row += 2) {
        let begin = 1;
        for (let col = 1; col < width; col += 2) {
            let ctn = (row === 1) ? 1 : Math.floor(Math.random() * 2);
            if (col === width - 2) ctn = 0;
            
            if (ctn) {
                maze[row][col + 1] = 0;
            } else if (row !== 1) {
                let up = begin + Math.floor(Math.random() * ((col - begin) / 2 + 1)) * 2;
                maze[row - 1][up] = 0;
                begin = col + 2;
            }
        }
    }
    
    maze[0][1] = 0;
    maze[height - 1][width - 2] = 0;
    return maze;
}

function binaryTreeMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            maze[i].push(!(i % 2 === 1 && j % 2 === 1) + 0);
        }
    }
    
    for (let k = 1; k < width; k += 2) {
        for (let m = 1; m < height; m += 2) {
            let south = Math.floor(Math.random() * 2);
            if (m === height - 2) south = 0;
            if (k === width - 2) south = 1;
            if (k === width - 2 && m === height - 2) break;
            
            if (south) maze[m + 1][k] = 0;
            else maze[m][k + 1] = 0;
        }
    }
    
    maze[0][1] = 0;
    maze[height - 1][width - 2] = 0;
    return maze;
}

const MAZE_ALGORITHMS = {
    'Backtracking': backtrackingMaze,
    "Prim's": primsMaze,
    "Eller's": ellersMaze,
    "Kruskal's": kruskalsMaze,
    "Wilson's": wilsonsMaze,
    'Aldous-Broder': aldousBroderMaze,
    'Recursive Division': recursiveDivisionMaze,
    'Hunt and Kill': huntAndKillMaze,
    'Sidewinder': sidewinderMaze,
    'Binary Tree': binaryTreeMaze
};

function generateMaze(width, height, algorithm) {
    const genFunc = MAZE_ALGORITHMS[algorithm];
    if (!genFunc) return backtrackingMaze(width, height);
    return genFunc(width, height);
}
