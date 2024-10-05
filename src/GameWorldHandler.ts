// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import CanvasHandler from "./CanvasHandler";
import { ACCELERATION_SPEED, CELL_PER_FLOOR, GAME_BOARD_PAUSED_STYLE, GAME_BOARD_STYLE, GAME_SPEED, GAME_SPEED_50, GAME_SPEED_75, GAME_UI_GAME_OVER_TEXT_COLOR, GAME_UI_GAME_PAUSE_TEXT_COLOR, GAME_UI_GAME_WIN_TEXT_COLOR, GAME_UI_MENU_STYLE, GAME_UI_TEXT_COLOR, GAME_UI_TEXT_STYLE, GAME_UI_TRANS_STYLE, MAX_MINE_NEIGHBS, REVEALABLE_FLOORS, TILE_TEXT_FLOOR_COLOR, TILE_TEXT_FLOOR_STYLE, TOTAL_FLOORS, TOTAL_MARATHON_FLOORS, TOTAL_MINES } from "./constants";
import Tile from "./Tile";
import TimeHandler from "./TimeHandler";
import { TCanvasFill, TCanvasFrame, TCanvasLoading, TCanvasText, TGameMode, TGamePlayerMode, TPointerActionPosition, TPosition } from "./type";

const canvasHandler = CanvasHandler.getInstance();
const timeHandler = TimeHandler.getInstance();

class GameWorldHandler {
	private static instance: GameWorldHandler;

	private status: "pending" | "ready" | "started" | "win" | "gameover" | "paused" | "timestoped";
	private gameMode: TGameMode;
	private gamePlayerMode: TGamePlayerMode;

	private startingPosition: TPosition;
	private position: TPosition;
	private width: number;
	private height: number;

	private tileSize: number;
	private tiles: Tile[][];
	private lastTilePos: TPosition;

	private speed: number;
	private accelerating: boolean;
	private accelerationDuration: number = 0;

	private totalMines: number = 0;
	private remainingMines: number = 0;
	private currentFloor: number = 0;

	// multi
	private totalPlayers: number = 0;
	private currentRank: number = 0;

	constructor(gameMode?: TGameMode, gamePlayerMode?: TGamePlayerMode) {
		this.gameMode = gameMode ? gameMode : "normal"
		this.gamePlayerMode = gamePlayerMode ? gamePlayerMode : "single"

		this.status = "pending";
		this.currentFloor = 0;

		this.speed = 0;
		this.lastTilePos = {x: -1, y: -1};

		this.accelerating = false;
		this.accelerationDuration = 0;

		this.width = canvasHandler.getCanvasWidth();
		this.height = -1
		this.tileSize = -1
		this.tiles = []

		this.remainingMines = this.totalMines;
		
		this.startingPosition = {x: 0, y: 0}
		this.position = {...this.startingPosition};

	}

	// static
	public static getInstance(gameMode?: TGameMode, gamePlayerMode?: TGamePlayerMode) {
		if(!GameWorldHandler.instance)
			GameWorldHandler.instance = new GameWorldHandler(gameMode, gamePlayerMode);
		
		return GameWorldHandler.instance;
	}

	// private
	private getTileMapInfo(tileMap: Tile[][]){
		let infoMap: number[][] = []

		for(let y = 0; y < tileMap.length; y++){
			infoMap[y] = []
			for(let x = 0; x < tileMap[y].length; x++){
				infoMap[y][x] = 0

				if(tileMap[y][x].getIsMine())
					infoMap[y][x] = -1
				else if(tileMap[y][x].getIsRevealed()){
					infoMap[y][x] = tileMap[y][x].getMineNearBy() ? tileMap[y][x].getMineNearBy() : -2
				}
			}
		}

		console.log(infoMap);
	}

	private async genMineMap(floors: number, cleanLastFloor?: boolean, revealableCounts?: number): Promise<number[][]> {
		const mineMap: number[][] = new Array(floors).fill(false).map(_ => (Array(CELL_PER_FLOOR).fill(0)))

		const totalMines = TOTAL_MINES[this.gameMode];
		const maxNeighbs = MAX_MINE_NEIGHBS[this.gameMode];

		let remainingMines = totalMines
		const floorFit = Math.floor((canvasHandler.getCanvasHeight() - (canvasHandler.getCanvasWidth() / 8)) / (canvasHandler.getCanvasWidth() / CELL_PER_FLOOR))
		const lastFloor = cleanLastFloor ? mineMap.length - 1 : mineMap.length

		let startRow = 0;
		let endRow = Math.floor(startRow + (2 * floorFit / 3) + (Math.random() * floorFit / 3))
		
		let approxRatio = mineMap.length / (endRow - startRow)

		let partitionMine = totalMines / approxRatio
		remainingMines -= partitionMine

		let revealables: TPosition[] = []

		while(startRow !== endRow){
			this.genMineMapPartition(mineMap, startRow, endRow, partitionMine, maxNeighbs);
			startRow = endRow
			endRow = Math.floor(startRow + (2 * floorFit / 3) + (Math.random() * floorFit / 3));

			if(
				endRow > lastFloor
				|| lastFloor - endRow < floorFit / 2
			)
				endRow = lastFloor

			if(endRow === lastFloor)
				partitionMine = remainingMines
			else{
				approxRatio = mineMap.length / (endRow - startRow)
				console.log(approxRatio)
				partitionMine = totalMines / approxRatio
			}

			remainingMines -= partitionMine
		}

		for(let i = 0; i < CELL_PER_FLOOR; i++){
			if(cleanLastFloor)
				mineMap[lastFloor][i] = -2

			if(!revealableCounts || revealableCounts < 1)
				continue
			
			let revealFloor = cleanLastFloor ? 2 : 1

			while(revealFloor <= revealableCounts){
				revealables.push({x: i, y: mineMap.length - revealFloor})
				revealFloor++
			}
		}

		while(revealables.length > 0){
			let revealable = revealables.pop()

			if(!revealable)
				continue;

			let y = revealable.y
			let x = revealable.x

			if(mineMap[y][x] === -1 || mineMap[y][x] === -2)
				continue;
			
			mineMap[y][x] = -2

			let maxRevealables = 0;
			let innnerRevealables: TPosition[] = []

			if(y - 1 >= 0){
				maxRevealables++
				if(x - 1 >= 0){
					maxRevealables++
					if(mineMap[y - 1][x - 1] !== -1)
						innnerRevealables.push({x: x - 1, y: y - 1})
				}
					
				if(x + 1 < CELL_PER_FLOOR){
					maxRevealables++
					if(mineMap[y - 1][x + 1] !== -1)
						innnerRevealables.push({x: x + 1, y: y - 1})
				}

				if(mineMap[y - 1][x] !== -1)
					innnerRevealables.push({x: x, y: y - 1})
			}
			
			if(y + 1 < mineMap.length){
				maxRevealables++
				if(x - 1 >= 0){
					maxRevealables++
					if(mineMap[y + 1][x - 1] !== -1)
						innnerRevealables.push({x: x - 1, y: y + 1})
				}
	
				if(x + 1 < CELL_PER_FLOOR){
					maxRevealables++
					if(mineMap[y + 1][x + 1] !== -1)
						innnerRevealables.push({x: x + 1, y: y + 1})
				}

				if(mineMap[y + 1][x] !== -1)
					innnerRevealables.push({x: x, y: y + 1})
			}

			if(x - 1 >= 0){
				maxRevealables++
				if(mineMap[y][x - 1] !== -1)
					innnerRevealables.push({x: x - 1, y: y})
			}

			if(x + 1 < CELL_PER_FLOOR){
				maxRevealables++
				if(mineMap[y][x + 1] !== -1)
					innnerRevealables.push({x: x + 1, y: y})
			}

			if(innnerRevealables.length < maxRevealables)
				continue
			
			revealables = [...revealables, ...innnerRevealables]
		}

		return mineMap;
	}

	private genMineMapPartition(mineMap: number[][], startRow: number, endRow: number, totalMines: number, maxNeighbs: number): void {
		while(totalMines > 0){
			let yRan = Math.floor(startRow + Math.random() * (endRow - startRow))
			let xRan = Math.floor(Math.random() * CELL_PER_FLOOR)

			if(mineMap[yRan][xRan] === -1)
				continue;

			let mineCount = 0;

			if(yRan - 1 >= 0){
				if(xRan - 1 >= 0){
					if(mineMap[yRan - 1][xRan - 1] === -1)
						mineCount++
				}
					
				if(xRan + 1 < CELL_PER_FLOOR){
					if(mineMap[yRan - 1][xRan + 1] === -1)
						mineCount++
				}

				if(mineMap[yRan - 1][xRan] === -1)
					mineCount++
			}
			
			if(yRan + 1 < endRow - 1){
				if(xRan - 1 >= 0){
					if(mineMap[yRan + 1][xRan - 1] === -1)
						mineCount++
				}
	
				if(xRan + 1 < CELL_PER_FLOOR){
					if(mineMap[yRan + 1][xRan + 1] === -1)
						mineCount++
				}

				if(mineMap[yRan + 1][xRan] === -1)
					mineCount++
			}

			if(xRan - 1 >= 0){
				if(mineMap[yRan][xRan - 1] === -1)
					mineCount++
			}

			if(xRan + 1 < CELL_PER_FLOOR){
				if(mineMap[yRan][xRan + 1] === -1)
					mineCount++
			}

			if(mineCount > maxNeighbs)
				continue

			mineMap[yRan][xRan] = -1
			totalMines--;
		}

	}

	private async genTiles(mineMap: number[][]): Promise<{tiles: Tile[][], totalMines: number}> {
		let totalMines = 0;
		let tiles: Tile[][] = [];

		for(let y = 0; y < mineMap.length; y++){
			tiles[y] = []
			let top = y - 1
			let bottom = y + 1

			let hasTop = top >= 0
			let hasBottom = bottom < mineMap.length

			for(let x = 0; x < CELL_PER_FLOOR; x++){
				let left = x - 1
				let right = x + 1

				let hasLeft = left >= 0
				let hasRight = right < mineMap[y].length

				let tl = hasTop && hasLeft && mineMap[top][left] === -1 ? 1 : 0
				let bl = hasBottom && hasLeft && mineMap[bottom][left] === -1 ? 1 : 0
				let tr = hasTop && hasRight && mineMap[top][right] === -1 ? 1 : 0
				let br = hasBottom && hasRight && mineMap[bottom][right] === -1 ? 1 : 0

				let t = hasTop && mineMap[top][x] === -1 ? 1 : 0
				let l = hasLeft && mineMap[y][left] === -1 ? 1 : 0
				let b = hasBottom && mineMap[bottom][x] === -1 ? 1 : 0
				let r = hasRight && mineMap[y][right] === -1 ? 1 : 0
				
				let isMine = mineMap[y][x] === -1;
				let revealable = mineMap[y][x] === -2;

				if(revealable)
					mineMap[y][x] = 0;

				totalMines += isMine ? 1 : 0

				tiles[y][x] = new Tile(
					isMine,
					isMine ? 0 : tl + bl + tr + br + t + l + b + r,
					revealable
				)
			}
		}

		return {tiles, totalMines};
	}

	private async mergeTiles(tileMapTop:Tile[], mineMap: number[][]): Promise<{tiles: Tile[][], totalMines: number}> {
		mineMap[mineMap.length] = []
		
		for(let i = 0; i < mineMap[0].length; i++){
			mineMap[mineMap.length - 1][i] = 0

			if(tileMapTop[i].getIsMine())
				mineMap[mineMap.length - 1][i] = -1
			else if(tileMapTop[i].getIsRevealed())
				mineMap[mineMap.length - 1][i] = -2
		}

		return this.genTiles(mineMap);
	}

	private updateCurrentSpeed(){
		let y = this.position.y > 0 ? 0 : this.position.y
		let gameSpeedByDistance: Record<TGameMode, number> = GAME_SPEED;

		
		if(y / this.startingPosition.y < .25)
			gameSpeedByDistance = GAME_SPEED_75;
		else if(y / this.startingPosition.y < .5)
			gameSpeedByDistance = GAME_SPEED_50;

		switch(this.gameMode){
			case "fast":
				this.speed = gameSpeedByDistance.fast
				break;
			case "hard":
				this.speed = gameSpeedByDistance.hard
				break;
			default:
				this.speed = gameSpeedByDistance.normal
				break;
		}
	}

	private isOnBoard(y: number){
		return (
			y < this.position.y + this.height 
			&& y < canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 8
			&& y > this.position.y
		)
	}

	private getTile(x: number, y: number){
		// console.log(this.tiles[y][x])
		return this.tiles[y][x];
	}

	private getNearByTile(x: number, y: number, calcMine?: boolean): TPosition | null {
		if(calcMine){
			if(this.tiles[y][x].getIsRevealed() && !this.tiles[y][x].getIsMine())
				return null
			else
				return {x, y}
		}
		else{
			if(this.tiles[y][x].getIsUnrevealedMine())
				return null
			
			if(this.tiles[y][x].getIsRelvealable())
				return {x, y}
	
			return null
		}
	}

	private getNearByTiles(x: number, y: number, calcMine?: boolean): TPosition[]{
		let nearByTiles: TPosition[] = []

		let top = y - 1
		let bottom = y + 1
		let left = x - 1
		let right = x + 1

		let hasTop = top >= 0
		let hasBottom = bottom < this.tiles.length
		let hasLeft = left >= 0
		let hasRight = right < this.tiles[0].length

		if(hasTop && hasLeft){
			let pos = this.getNearByTile(left, top, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasBottom && hasLeft){
			let pos = this.getNearByTile(left, bottom, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasTop && hasRight){
			let pos = this.getNearByTile(right, top, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasBottom && hasRight){
			let pos = this.getNearByTile(right, bottom, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasTop){
			let pos = this.getNearByTile(x, top, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasLeft){
			let pos = this.getNearByTile(left, y, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasBottom){
			let pos = this.getNearByTile(x, bottom, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		if(hasRight){
			let pos = this.getNearByTile(right, y, calcMine);
			if(pos)
				nearByTiles.push(pos)
		}

		return nearByTiles;
	}

	private revealTile(pos: TPosition): TPosition[]{
		let tile = this.getTile(pos.x, pos.y);
		tile.reveal();

		if(tile.getMineNearBy() > 0)
			return []

		return this.getNearByTiles(pos.x, pos.y);
	}

	// public
	public getStatus(){
		return this.status
	}

	public setAccelerate(accelerating: boolean){
		if(accelerating){
			if(this.accelerationDuration - timeHandler.getGameTime() <= 0)
				this.accelerationDuration = timeHandler.getGameTime() + 150,

			this.accelerating = accelerating
		}
		else{
			if(this.accelerationDuration - timeHandler.getGameTime() > 0)
				return
		}
	}

	public isOnUi(y: number){
		return y > canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 8 && y < canvasHandler.getCanvasHeight()
	}

	public clickOnUi(pointer: TPointerActionPosition, callback?: () => void){
		if(pointer.x > 0 && pointer.x < canvasHandler.getCanvasWidth() / 3){
			console.log(callback)
			timeHandler.resetTime();

			if(callback)
					callback()

			this.reset()
			return;
		}
		else if(pointer.x > canvasHandler.getCanvasWidth() / 3 && pointer.x < 2 * canvasHandler.getCanvasWidth() / 3){
			if(this.getStatus() === "gameover" || this.getStatus() === "win"){
				timeHandler.resetTime();
				this.reset(() => this.start(), true)
				return;
			}

			if(this.status === "paused")
				this.start()
			else
				this.pause()
		}
		else{
			if(this.status !== "started")
				return

			if(this.accelerationDuration - timeHandler.getGameTime() <= 0)
				this.accelerationDuration = timeHandler.getGameTime() + 150,

			this.accelerating = true
		}
	}

	public clickOnTile(pointer: TPointerActionPosition){
		if(!this.isOnBoard(pointer.y))
			return;

		let x = Math.floor(pointer.x / this.tileSize)
		let y = Math.floor((pointer.y - this.position.y) / this.tileSize)

		let tile = this.getTile(x, y)
		this.lastTilePos = {x, y}

		if(tile.getIsRevealed() && tile.getMineNearBy() > 0){
			let flagCounts = 0;
			let revealables: TPosition[] = []
			let nextRevealables: TPosition[] = []
			let surroundings = this.getNearByTiles(x, y, true);

			for(let pos of surroundings){
				let surroundingTile = this.tiles[pos.y][pos.x];

				if(surroundingTile.getIsFlaged() || (surroundingTile.getIsRevealed() && surroundingTile.getIsMine())){
					flagCounts++
					if(flagCounts > tile.getMineNearBy())
						return;
					continue
				}

				revealables.push(pos)
			}

			if(flagCounts !== tile.getMineNearBy())
				return;

			let mines = 0;

			for(let revealable of revealables){
				let revealableTile = this.tiles[revealable.y][revealable.x];

				if(revealableTile.getIsMine())
					mines++
			
				if(mines > 0)
					revealableTile.reveal()
				else
					nextRevealables = [...nextRevealables, ...this.revealTile(revealable)]
			}

			if(mines > 0){
				this.remainingMines -= mines
				this.position.y += this.tileSize
				return
			}

			while(nextRevealables.length > 0){
				let nextPos = nextRevealables.pop();

				if(nextPos)
					nextRevealables = [...nextRevealables, ...this.revealTile(nextPos)]
			}
		}
		else{
			switch(pointer.actionType){
				case "click":
					if(tile.getIsRevealed())
						return

					tile.flag();
					
					if(tile.getIsFlaged()){
						this.remainingMines--
					}
					else{
						this.remainingMines++
					}
					break;
				case "dbclick":
					if(!tile.getIsRelvealable())
						return;
	
					tile.reveal();
	
					if(tile.getIsMine()){
						this.remainingMines--
						this.position.y += this.tileSize
					}
					else{
						let revealables = this.revealTile({x, y});
	
						while(revealables.length > 0){
							let nextPos = revealables.pop();
	
							if(nextPos)
								revealables = [...revealables, ...this.revealTile(nextPos)]
						}
					}
					break;
				default:
					break;
			}

		}
	}

	public async updatePos(deltaTime: number){
		if(this.gamePlayerMode === "single" && this.status !== "started")
			return;

		this.updateCurrentSpeed()

		if(this.accelerationDuration - timeHandler.getGameTime() <= 0)
			this.accelerating = false

		this.position.y += (this.accelerating ? ACCELERATION_SPEED : this.speed) * deltaTime

		if(this.remainingMines === 0 || this.position.y > canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 8){
			this.status = "win"
			return;
		}

		if(this.position.y + this.height > canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 8){
			let floor = Math.floor((canvasHandler.getCanvasHeight() - (canvasHandler.getCanvasWidth() / 8) - this.position.y) / this.tileSize)
			let newFloor = this.tiles.length - floor

			if(this.currentFloor !== newFloor){
				this.currentFloor = newFloor
	
				if(this.gameMode === "marathon"){
					if(
						this.tiles.length < TOTAL_MARATHON_FLOORS
						&& floor <= TOTAL_FLOORS[this.gameMode] / 2
					){
						console.log("marathon")
						let connectionTiles = this.tiles.shift() ?? []

						let hasRevealed = connectionTiles.filter(tile => tile.getIsRevealed()).length > 0

						let mineMap = await this.genMineMap(TOTAL_FLOORS[this.gameMode], false, hasRevealed ? 1 : 0);
						let newFloorHeight = mineMap.length * this.tileSize

						let {tiles, totalMines} = await this.mergeTiles(connectionTiles, mineMap);

						for(let i = 0; i < connectionTiles.length; i++){
							if(connectionTiles[i].getIsFlaged()){
								tiles[tiles.length - 1][i].flag();
							}

							if(connectionTiles[i].getIsRevealed()){
								tiles[tiles.length - 1][i].reveal();
							}

							tiles[tiles.length - 1][i].updateMineNearBy(tiles[tiles.length - 1][i].getMineNearBy() + connectionTiles[i].getMineNearBy())
						}

						this.tiles.unshift(...tiles)

						this.getTileMapInfo(tiles)

						this.totalMines += totalMines
						this.remainingMines += totalMines;

						this.height += newFloorHeight
						this.startingPosition = {x: 0, y: -this.height + (canvasHandler.getCanvasHeight() / 3)}
						this.position.y -= newFloorHeight

						floor = Math.floor((canvasHandler.getCanvasHeight() - (canvasHandler.getCanvasWidth() / 8) - this.position.y) / this.tileSize)						
					}
				}

				let mines = 0;
	
				for(let tile of this.tiles[floor]){
					if(
						(tile.getIsFlaged() && !tile.getIsMine())
						|| (!tile.getIsRevealed() && !tile.getIsMine())
					){
						this.status = "gameover"
						return;
					}
					else if(!tile.getIsFlaged() && tile.getIsMine())
						mines++
				}
				
				this.remainingMines -= mines
				
				// let hiddenMines = 0;

				// console.log(floor, upperFloor)

				// for(let startFloor = upperFloor; startFloor < floor; startFloor++){
				// 	for(let tile of this.tiles[startFloor]){
				// 		if(
				// 			(tile.getIsFlaged() && !tile.getIsMine())
				// 			|| (!tile.getIsRevealed() && !tile.getIsMine())
				// 		)
				// 			return;
				// 		else if(!tile.getIsFlaged() && tile.getIsMine())
				// 			hiddenMines++
				// 	}
				// }

				// if(this.remainingMines - hiddenMines === 0)
				// 	this.status = "win"
			}

		}
	}

	public start(){
		console.log(this.currentFloor)
		this.updateCurrentSpeed()
		this.status = "started";
	}

	public pause(){
		this.status = "paused";
	}

	public async reset(
		callback?: () => void,
		regen?: boolean,
		mineMap?: number[][],
		gameMode?: TGameMode,
		gamePlayerMode?: TGamePlayerMode,
		totalPlayers?: number,
		rank?: number
	){
		this.gameMode = gameMode ? gameMode : this.gameMode
		this.gamePlayerMode = gamePlayerMode ? gamePlayerMode : this.gamePlayerMode

		this.currentFloor = 0;

		this.speed = 0;
		this.status = "pending";

		this.lastTilePos = {x: -1, y: -1};

		this.accelerating = false;
		this.accelerationDuration = 0;

		if(this.tiles.length === 0 || regen){
			if(!mineMap){
				if(this.gamePlayerMode === "multi")
					throw Error("Must retrieve mineMap from online")

				mineMap = await this.genMineMap(TOTAL_FLOORS[this.gameMode], true, REVEALABLE_FLOORS[this.gameMode]);
			}

			this.tileSize = this.width / CELL_PER_FLOOR
			this.height = this.tileSize * mineMap.length

			let {tiles, totalMines} = await this.genTiles(mineMap)

			this.getTileMapInfo(tiles)

			this.tiles = tiles;
			this.totalMines = totalMines;
		}
		else
			this.tiles.forEach(tileRow => tileRow.forEach(tile => tile.reset()))
	
		this.remainingMines = this.totalMines;
		
		this.startingPosition = {x: 0, y: -this.height + (canvasHandler.getCanvasHeight() / 3)}
		this.position = {...this.startingPosition};

		if(this.gamePlayerMode === "multi"){
			if(!totalPlayers || !rank)
				throw Error("Must retrieve player info")

			this.totalPlayers = totalPlayers
			this.currentRank = totalPlayers
		}

		this.status = "ready";

		if(!!callback)
			callback()
	}

	public drawTiles(canvas: TCanvasFill & TCanvasFrame & TCanvasText, lastTile: TPosition, gameover: boolean){

		for(let y = 0; y < this.tiles.length; y++){
			let tileYpos = this.position.y + y * this.tileSize
			let floor = this.tiles.length - y

			for(let x = 0; x < this.tiles[y].length; x++){
				let tileXpos = this.position.x + x * this.tileSize

				if(
					tileYpos + this.tileSize < 0
					|| tileYpos > canvasHandler.getCanvasHeight()
				)
					continue

				let isLastTile = lastTile.x === x && lastTile.y === y

				if(this.status === "paused")
					this.tiles[y][x].drawHidden(canvas, {x: tileXpos, y: tileYpos}, this.tileSize, this.tileSize);
				else{
					this.tiles[y][x].draw(canvas, {x: tileXpos, y: tileYpos}, this.tileSize, this.tileSize, isLastTile, y === (this.tiles.length - this.currentFloor) && gameover);
				}
			}

			if(this.status !== "paused" && floor % 10 === 0)
				canvas.text(`${floor}`, TILE_TEXT_FLOOR_STYLE, TILE_TEXT_FLOOR_COLOR, {x: this.tileSize / 2, y: tileYpos + this.tileSize / 4});
		}
	}

	public draw(canvas: TCanvasFill & TCanvasFrame & TCanvasText & TCanvasLoading){
		if(this.status !== "ready"){
			canvas.fill(this.status === "paused" ? GAME_BOARD_PAUSED_STYLE : GAME_BOARD_STYLE, this.position, this.width, this.height);
			this.drawTiles(canvas, this.lastTilePos, this.status === "gameover");
		}

		canvas.fill(GAME_UI_TRANS_STYLE, {x: 0, y: 0}, canvasHandler.getCanvasWidth(), canvasHandler.getCanvasWidth() / 10);
		canvas.fill(GAME_UI_TRANS_STYLE, {x: 0, y: canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 8}, canvasHandler.getCanvasWidth(), canvasHandler.getCanvasWidth() / 8);

		canvas.text(`M:${this.gameMode.toLocaleUpperCase()}`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 6, y: canvasHandler.getCanvasWidth() / 20});
		canvas.text(`B:${this.gameMode === "marathon" ? "??" : this.remainingMines}`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2, y: canvasHandler.getCanvasWidth() / 20});
		canvas.text(`F:${this.currentFloor}`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: 5 * canvasHandler.getCanvasWidth() / 8, y: canvasHandler.getCanvasWidth() / 20});
		canvas.text(`T:${timeHandler.getTextGameTime()}`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() - canvasHandler.getCanvasWidth() / 8, y: canvasHandler.getCanvasWidth() / 20});


		canvas.text(`< Back`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 8, y: canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 20});

		if(this.getStatus() === "gameover" || this.getStatus() === "win")
			canvas.text(`> start`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2, y: canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 20});
		else
			canvas.text(this.status === "paused" ? `|> resume` : `|| pasue`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2, y: canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 20});
		
		if(this.status === "started")
			canvas.text(`V down`, GAME_UI_TEXT_STYLE, GAME_UI_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() - canvasHandler.getCanvasWidth() / 8, y: canvasHandler.getCanvasHeight() - canvasHandler.getCanvasWidth() / 20});

		switch(this.status){
			case "gameover":
				canvas.text(`GAME OVER`, GAME_UI_MENU_STYLE, GAME_UI_GAME_OVER_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: canvasHandler.getCanvasHeight() / 2});
				break;
			case "win":
				canvas.text(`WIN`, GAME_UI_MENU_STYLE, GAME_UI_GAME_WIN_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: canvasHandler.getCanvasHeight() / 2});
				break;
			case "paused":
				canvas.text(`PAUSED`, GAME_UI_MENU_STYLE, GAME_UI_GAME_PAUSE_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: canvasHandler.getCanvasHeight() / 2});
				break;
		}

	}

}

export default GameWorldHandler