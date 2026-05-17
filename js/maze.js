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

// ── 10 neue Algorithmen ──────────────────────────────────────────────────────

function cellularCavesMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++)
            maze[i].push((i === 0 || j === 0 || i === height-1 || j === width-1) ? 1 : (Math.random() < 0.45 ? 1 : 0));
    }
    for (let gen = 0; gen < 5; gen++) {
        const next = maze.map(r => [...r]);
        for (let i = 1; i < height-1; i++) {
            for (let j = 1; j < width-1; j++) {
                let walls = 0;
                for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) walls += maze[i+di][j+dj];
                next[i][j] = walls >= 5 ? 1 : 0;
            }
        }
        for (let i = 0; i < height; i++) for (let j = 0; j < width; j++) maze[i][j] = next[i][j];
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function dungeonRoomsMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) maze.push(Array(width).fill(1));
    const rooms = [];
    for (let a = 0; a < 60; a++) {
        const rw = Math.floor(Math.random() * 6) + 3;
        const rh = Math.floor(Math.random() * 5) + 3;
        const rx = Math.floor(Math.random() * (width - rw - 2)) + 1;
        const ry = Math.floor(Math.random() * (height - rh - 2)) + 1;
        let ok = true;
        for (const r of rooms) {
            if (rx <= r.x+r.w+1 && rx+rw+1 >= r.x && ry <= r.y+r.h+1 && ry+rh+1 >= r.y) { ok = false; break; }
        }
        if (ok) {
            rooms.push({ x:rx, y:ry, w:rw, h:rh, cx:Math.floor(rx+rw/2), cy:Math.floor(ry+rh/2) });
            for (let i = ry; i < ry+rh; i++) for (let j = rx; j < rx+rw; j++) maze[i][j] = 0;
        }
    }
    rooms.sort((a, b) => a.cx - b.cx);
    for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i-1], b = rooms[i];
        let cy = a.cy, cx = a.cx;
        while (cx !== b.cx) { if (cx > 0 && cx < width-1) maze[cy][cx] = 0; cx += cx < b.cx ? 1 : -1; }
        while (cy !== b.cy) { if (cy > 0 && cy < height-1) maze[cy][cx] = 0; cy += cy < b.cy ? 1 : -1; }
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function drunkardWalkMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) maze.push(Array(width).fill(1));
    const target = Math.floor(width * height * 0.38);
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const walkers = [
        [Math.floor(height/2), Math.floor(width/2)],
        [Math.floor(height/4), Math.floor(width/4)],
        [Math.floor(height*3/4), Math.floor(width*3/4)],
    ];
    let carved = 0;
    walkers.forEach(w => { if (maze[w[0]][w[1]] === 1) { maze[w[0]][w[1]] = 0; carved++; } });
    let iters = 0;
    while (carved < target && iters < 200000) {
        iters++;
        for (const w of walkers) {
            const [dy, dx] = dirs[Math.floor(Math.random()*4)];
            const ny = w[0]+dy, nx = w[1]+dx;
            if (nx > 0 && nx < width-1 && ny > 0 && ny < height-1) {
                if (maze[ny][nx] === 1) { maze[ny][nx] = 0; carved++; }
                w[0] = ny; w[1] = nx;
            }
        }
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function braidedMaze(width, height) {
    const maze = backtrackingMaze(width, height);
    const h = maze.length, w = maze[0].length;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let i = 1; i < h-1; i += 2) {
        for (let j = 1; j < w-1; j += 2) {
            let exits = 0;
            const closed = [];
            for (const [di, dj] of dirs) {
                const wi = i+di, wj = j+dj, ni = i+di*2, nj = j+dj*2;
                if (wi > 0 && wi < h-1 && wj > 0 && wj < w-1) {
                    if (maze[wi][wj] === 0) exits++;
                    else if (ni > 0 && ni < h-1 && nj > 0 && nj < w-1) closed.push([di, dj]);
                }
            }
            if (exits === 1 && closed.length > 0 && Math.random() < 0.8) {
                const [di, dj] = closed[Math.floor(Math.random() * closed.length)];
                maze[i+di][j+dj] = 0;
            }
        }
    }
    return maze;
}

function growingTreeBFSMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) { maze.push([]); for (let j = 0; j < width; j++) maze[i].push(1); }
    maze[0][1] = 0;
    let r, c;
    do { r = Math.floor(Math.random()*height); } while (r % 2 === 0);
    do { c = Math.floor(Math.random()*width); } while (c % 2 === 0);
    maze[r][c] = 0;
    const cells = [[r, c]];
    while (cells.length > 0) {
        const cell = cells[0];
        const n = neighbors(maze, cell[0], cell[1]);
        if (n.length === 0) {
            cells.shift();
        } else {
            const choice = n[Math.floor(Math.random()*n.length)];
            maze[choice[0]][choice[1]] = 0;
            maze[(choice[0]+cell[0])/2][(choice[1]+cell[1])/2] = 0;
            cells.push(choice);
        }
    }
    maze[maze.length-1][maze[0].length-2] = 0;
    return maze;
}

function wormTunnelsMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) maze.push(Array(width).fill(1));
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const target = Math.floor(width * height * 0.36);
    let carved = 0;
    for (let w = 0; w < 10 && carved < target; w++) {
        let wy = 1 + Math.floor(Math.random()*(height-2));
        let wx = 1 + Math.floor(Math.random()*(width-2));
        let dir = dirs[Math.floor(Math.random()*4)];
        const maxLen = Math.floor((width + height) * 2);
        for (let step = 0; step < maxLen && carved < target; step++) {
            if (maze[wy][wx] === 1) { maze[wy][wx] = 0; carved++; }
            if (Math.random() < 0.15) dir = dirs[Math.floor(Math.random()*4)];
            const ny = wy+dir[0], nx = wx+dir[1];
            if (nx <= 0 || nx >= width-1 || ny <= 0 || ny >= height-1) dir = dirs[Math.floor(Math.random()*4)];
            else { wy = ny; wx = nx; }
        }
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function blobWorldMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) maze.push(Array(width).fill(1));
    const numBlobs = Math.floor(width * height / 70);
    for (let b = 0; b < numBlobs; b++) {
        const cy = 2 + Math.floor(Math.random()*(height-4));
        const cx = 2 + Math.floor(Math.random()*(width-4));
        const r = 2 + Math.floor(Math.random()*4);
        for (let i = Math.max(1,cy-r); i <= Math.min(height-2,cy+r); i++)
            for (let j = Math.max(1,cx-r); j <= Math.min(width-2,cx+r); j++)
                if ((i-cy)*(i-cy)+(j-cx)*(j-cx) <= r*r+Math.random()*r) maze[i][j] = 0;
    }
    for (let b = 0; b < Math.floor(numBlobs/2); b++) {
        let y1=1+Math.floor(Math.random()*(height-2)), x1=1+Math.floor(Math.random()*(width-2));
        const y2=1+Math.floor(Math.random()*(height-2)), x2=1+Math.floor(Math.random()*(width-2));
        while (y1 !== y2) { maze[y1][x1] = 0; y1 += y1 < y2 ? 1 : -1; }
        while (x1 !== x2) { maze[y1][x1] = 0; x1 += x1 < x2 ? 1 : -1; }
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function noiseFieldMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const seed = Math.floor(Math.random() * 99999);
    const scale = 4;
    function hash(x, y) {
        let h = ((x * 374761393 + y * 668265263 + seed * 1234567) | 0);
        h = ((h ^ (h >> 13)) * 1274126177) | 0;
        return ((h ^ (h >> 16)) >>> 0) / 0xffffffff;
    }
    function lerp(a, b, t) { return a + (b-a)*t; }
    function sn(x, y) {
        const gx = Math.floor(x/scale), gy = Math.floor(y/scale);
        const fx = x/scale-gx, fy = y/scale-gy;
        const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
        return lerp(lerp(hash(gx,gy), hash(gx+1,gy), ux), lerp(hash(gx,gy+1), hash(gx+1,gy+1), ux), uy);
    }
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++)
            maze[i].push((i===0||j===0||i===height-1||j===width-1) ? 1 : (sn(j,i) > 0.52 ? 1 : 0));
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function spiralMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) maze.push(Array(width).fill(1));
    const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    let y = Math.floor(height/2), x = Math.floor(width/2);
    let dirIdx = 0, steps = 1, stepCount = 0, turnCount = 0;
    for (let s = 0; s < width * height * 2; s++) {
        if (y > 0 && y < height-1 && x > 0 && x < width-1) maze[y][x] = 0;
        const [dy, dx] = dirs[dirIdx%4];
        y += dy; x += dx; stepCount++;
        if (stepCount === steps) { stepCount = 0; dirIdx++; turnCount++; if (turnCount%2===0) steps++; }
        if (x <= 0 || x >= width-1 || y <= 0 || y >= height-1) break;
    }
    for (let i = 3; i < height-2; i += 5)
        for (let j = 3; j < width-2; j += 5)
            if (maze[i][j] === 1) maze[i][j] = 0;
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

function openGridMaze(width, height) {
    width -= width % 2; width++;
    height -= height % 2; height++;
    const maze = [];
    for (let i = 0; i < height; i++) {
        maze.push([]);
        for (let j = 0; j < width; j++) {
            if (i===0||j===0||i===height-1||j===width-1) { maze[i].push(1); continue; }
            const wallRow = (i % 4 === 0), wallCol = (j % 4 === 0);
            if (wallRow && wallCol)      maze[i].push(Math.random() < 0.5 ? 1 : 0);
            else if (wallRow || wallCol) maze[i].push(Math.random() < 0.25 ? 1 : 0);
            else                         maze[i].push(0);
        }
    }
    maze[0][1] = 0; maze[height-1][width-2] = 0;
    return maze;
}

// ── Dichte-Nachbearbeitung ───────────────────────────────────────────────────

function applyDensity(maze, ratio) {
    if (ratio <= 1) return maze;
    const h = maze.length, w = maze[0].length;
    let fogCount = 0;
    const wallCells = [];
    for (let i = 1; i < h-1; i++)
        for (let j = 1; j < w-1; j++)
            maze[i][j] === 0 ? fogCount++ : wallCells.push([i, j]);
    const total = fogCount + wallCells.length;
    const targetWall = Math.max(1, Math.round(total / (ratio + 1)));
    const toRemove = wallCells.length - targetWall;
    if (toRemove <= 0) return maze;
    for (let i = wallCells.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [wallCells[i], wallCells[j]] = [wallCells[j], wallCells[i]];
    }
    for (let k = 0; k < Math.min(toRemove, wallCells.length); k++)
        maze[wallCells[k][0]][wallCells[k][1]] = 0;
    return maze;
}

// ── Algorithmen-Registry ─────────────────────────────────────────────────────

const MAZE_ALGORITHMS = {
    'Backtracking':        backtrackingMaze,
    "Prim's":              primsMaze,
    "Eller's":             ellersMaze,
    "Kruskal's":           kruskalsMaze,
    "Wilson's":            wilsonsMaze,
    'Aldous-Broder':       aldousBroderMaze,
    'Recursive Division':  recursiveDivisionMaze,
    'Hunt and Kill':       huntAndKillMaze,
    'Sidewinder':          sidewinderMaze,
    'Binary Tree':         binaryTreeMaze,
    'Cellular Caves':      cellularCavesMaze,
    'Dungeon Rooms':       dungeonRoomsMaze,
    'Drunkard Walk':       drunkardWalkMaze,
    'Braided Maze':        braidedMaze,
    'Growing Tree BFS':    growingTreeBFSMaze,
    'Worm Tunnels':        wormTunnelsMaze,
    'Blob World':          blobWorldMaze,
    'Noise Field':         noiseFieldMaze,
    'Spiral':              spiralMaze,
    'Open Grid':           openGridMaze,
};

function generateMaze(width, height, algorithm, density) {
    const genFunc = MAZE_ALGORITHMS[algorithm];
    const maze = genFunc ? genFunc(width, height) : backtrackingMaze(width, height);
    return (density && density > 1) ? applyDensity(maze, density) : maze;
}
