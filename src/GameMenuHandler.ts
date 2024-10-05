// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import CanvasHandler from "./CanvasHandler";
import { GAME_MODE, GAME_PLAYER_MODE, MENU_STYLE, MENU_STYLE_SMALL, MENU_TEXT_COLOR, MENU_TITLE_STYLE } from "./constants";
import { TCanvasFill, TCanvasFrame, TCanvasText, TCanvasLoading, TGameMode, TGamePlayerMode, TPosition } from "./type";

const canvasHandler = CanvasHandler.getInstance();

class GameMenuHandler {
	private static instance: GameMenuHandler;

	private isActive: boolean;

	private currentGameMode: number;
	private currentPlayerMode: number;

	constructor() {
		this.isActive = true;
		this.currentGameMode = 0
		this.currentPlayerMode = 0
	}

	// static
	public static getInstance() {
		if(!GameMenuHandler.instance)
			GameMenuHandler.instance = new GameMenuHandler();
		
		return GameMenuHandler.instance;
	}

	public getIsActive() {
		return this.isActive
	}

	public reset() {
		this.isActive = true;
		this.currentGameMode = 0
		this.currentPlayerMode = 0
	}

	public clickOnUi(pointer: TPosition, callback?: (gameMode?: TGameMode, gamePlayerMode?: TGamePlayerMode) => void){
		if(pointer.y > canvasHandler.getCanvasHeight() / 3 && pointer.y < canvasHandler.getCanvasHeight() / 2){
			if(pointer.x > canvasHandler.getCanvasWidth() / 2){
				if(this.currentGameMode + 1 < GAME_MODE.length)
					this.currentGameMode++
				else
					this.currentGameMode = 0
			}
			else{
				if(this.currentGameMode - 1 >= 0)
					this.currentGameMode--
				else
					this.currentGameMode = GAME_MODE.length - 1
			}
		}
		else if(pointer.y > canvasHandler.getCanvasHeight() / 2 && pointer.y < 2 * canvasHandler.getCanvasHeight() / 3){
			if(pointer.x > canvasHandler.getCanvasWidth() / 2){
				if(this.currentPlayerMode + 1 < GAME_PLAYER_MODE.length)
					this.currentPlayerMode++
				else
					this.currentPlayerMode = 0
			}
			else{
				if(this.currentPlayerMode - 1 >= 0)
					this.currentPlayerMode--
				else
					this.currentPlayerMode = GAME_PLAYER_MODE.length - 1
			}
		}
		else if(pointer.y > 5.25 * canvasHandler.getCanvasHeight() / 6 && pointer.y < 5.75 * canvasHandler.getCanvasHeight() / 6){
			if(callback)
				callback(GAME_MODE[this.currentGameMode], GAME_PLAYER_MODE[this.currentPlayerMode]);

			this.isActive = false
		}
	}

	public draw(canvas: TCanvasFill & TCanvasFrame & TCanvasText & TCanvasLoading){
		canvas.text(`MineTower`, MENU_TITLE_STYLE, MENU_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: canvasHandler.getCanvasHeight() / 6});
		canvas.text(`<-		${GAME_MODE[this.currentGameMode].toLocaleUpperCase()}		->`, MENU_STYLE, MENU_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: 2.5 * canvasHandler.getCanvasHeight() / 6});
		canvas.text(`<-		${GAME_PLAYER_MODE[this.currentPlayerMode].toLocaleUpperCase()}		->`, MENU_STYLE, MENU_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: 3.5 * canvasHandler.getCanvasHeight() / 6});
		canvas.text(`START`, MENU_STYLE_SMALL, MENU_TEXT_COLOR, {x: canvasHandler.getCanvasWidth() / 2 , y: 5.5 * canvasHandler.getCanvasHeight() / 6});
	}

}

export default GameMenuHandler