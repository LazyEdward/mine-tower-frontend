// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TILE_BG_BOMB_STYLE, TILE_BG_GAME_OVER_STYLE, TILE_BG_HIDDEN_STYLE, TILE_BG_HIGHLIGHT_STYLE, TILE_BG_REVEALED_STYLE, TILE_BG_STYLE, TILE_BORDER_HIDDEN_STYLE, TILE_BORDER_STYLE, TILE_TEXT_BOMB, TILE_TEXT_BOMB_COLOR, TILE_TEXT_COUNT_COLORS, TILE_TEXT_COUNTS, TILE_TEXT_FLAG, TILE_TEXT_FLAG_COLOR, TILE_TEXT_HIDDEN, TILE_TEXT_HIDDEN_COLOR, TILE_TEXT_STYLE } from "./constants";
import { TCanvasFill, TCanvasFrame, TCanvasText, TPosition, TTile } from "./type";

class Tile implements TTile {
	private isMine: boolean;
	private isFlagged: boolean;
	private defaultRevealed: boolean;
	private isRevealed: boolean;
	private mineNearBy: number;

	constructor(isMine: boolean, mineNearBy: number, isRevealed?: boolean){
		this.isMine = isMine
		this.mineNearBy = mineNearBy

		this.isFlagged = false;
		this.defaultRevealed = isRevealed ?? false;
		this.isRevealed = isRevealed ?? false;
	}

	public reset(){
		this.isFlagged = false;
		this.isRevealed = this.defaultRevealed;
	}

	public updateMineNearBy(mineNearBy: number){
		this.mineNearBy = mineNearBy
	}

	public getIsMine() {
		return this.isMine;
	};

	public getMineNearBy() {
		return this.mineNearBy;
	};

	public getIsFlaged() {
		return this.isFlagged;
	};

	public getIsRevealed() {
		return this.isRevealed;
	};

	public getIsUnrevealedMine(){
		return this.isMine && !this.isRevealed
	}

	public getIsRelvealable() {
		return !this.isFlagged && (!this.isRevealed || (this.isRevealed && this.mineNearBy > 0));
	};

	public reveal() {
		this.isRevealed = true
	};

	public flag() {
		this.isFlagged = !this.isFlagged
	};

	public draw(canvas: TCanvasFill & TCanvasFrame & TCanvasText, position: TPosition, width: number, height: number, highlighted?: boolean, gameover?: boolean){
		let bgStyle: string = TILE_BG_STYLE;

		if(this.isRevealed){
			if(this.isMine)
				bgStyle = TILE_BG_BOMB_STYLE;
			else
				bgStyle = TILE_BG_REVEALED_STYLE;
		}
		else if(!this.isMine && gameover)
			bgStyle = TILE_BG_GAME_OVER_STYLE;

		canvas.fill(bgStyle, position, width, height);
		canvas.frame(this.isRevealed ? TILE_BORDER_STYLE : TILE_BORDER_HIDDEN_STYLE, position, width, height);

		if(highlighted)
			canvas.fill(TILE_BG_HIGHLIGHT_STYLE, position, width, height);
		
		if(this.isRevealed){
			if(this.isMine)
				canvas.text(TILE_TEXT_BOMB, TILE_TEXT_STYLE, TILE_TEXT_BOMB_COLOR, {x: position.x + width / 2, y: position.y + width / 2})
			else if(this.mineNearBy > 0)
				canvas.text(TILE_TEXT_COUNTS[this.mineNearBy], TILE_TEXT_STYLE, TILE_TEXT_COUNT_COLORS[this.mineNearBy], {x: position.x + width / 2, y: position.y + width / 2})
		}
		else if(this.isFlagged)
			canvas.text(TILE_TEXT_FLAG, TILE_TEXT_STYLE, TILE_TEXT_FLAG_COLOR, {x: position.x + width / 2, y: position.y + width / 2})
	}

	public drawHidden(canvas: TCanvasFill & TCanvasFrame & TCanvasText, position: TPosition, width: number, height: number){
		canvas.fill(TILE_BG_HIDDEN_STYLE, position, width, height);
		canvas.frame(TILE_BORDER_STYLE, position, width, height);

		canvas.text(TILE_TEXT_HIDDEN, TILE_TEXT_STYLE, TILE_TEXT_HIDDEN_COLOR, {x: position.x + width / 2, y: position.y + width / 2})
	}
}

export default Tile