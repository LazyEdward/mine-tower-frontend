// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { FULL_SCREEN_WIDTH, SCREEN_COLOR } from "./constants";
import { TCanvasFill, TCanvasFrame, TCanvasText, TPosition, TUserInteraction } from "./type";

class CanvasHandler implements TUserInteraction, TCanvasFill, TCanvasFrame, TCanvasText {
	private static instance: CanvasHandler;

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor() {
		this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
		let ctx = this.canvas.getContext('2d');

		if(!ctx)
				throw Error('main canvas not found')

		this.ctx = ctx;

		this.resetDimension()

		this.scrollHandler();
		this.contextmenuHandler();
		this.pointerdownHandler();
		this.pointermoveHandler();
		this.pointerupHandler();

		this.canvas.ondrag = (e) => e.preventDefault();
		this.canvas.ondragstart = (e) => e.preventDefault();
		this.canvas.ondragend = (e) => e.preventDefault();

		this.canvas.ontouchstart = (e) => e.preventDefault();
		this.canvas.ontouchmove = (e) => e.preventDefault();
		this.canvas.ontouchend = (e) => e.preventDefault();

		this.canvas.onmousedown = (e) => e.preventDefault();
		this.canvas.onmousemove = (e) => e.preventDefault();
		this.canvas.onmouseup = (e) => e.preventDefault();

	}

	// static
	public static getInstance() {
		if(!CanvasHandler.instance)
			CanvasHandler.instance = new CanvasHandler();
		
		return CanvasHandler.instance;
	}

	// private
	private resetDimension() {
		if(screen.availWidth <= FULL_SCREEN_WIDTH){
			if(screen.availWidth > screen.availHeight){
				this.canvas.height = screen.availHeight
				this.canvas.width = screen.availHeight * 9 / 16
			}
			else{
				if(screen.availWidth / screen.availHeight > 9 / 16){
					this.canvas.height = screen.availHeight
					this.canvas.width = screen.availHeight * 9 / 16
				}
				else{
					this.canvas.width = screen.availWidth
					this.canvas.height = screen.availWidth * 16 / 9
				}

			}
		}
	}

	private getOffsetTop(){
		return this.canvas.getBoundingClientRect().top;
	}

	private getOffsetLeft(){
		return this.canvas.getBoundingClientRect().left;
	}
	
	// public
	public getCanvasWidth(){
		return this.canvas.width
	}

	public getCanvasHeight(){
		return this.canvas.height
	}

	public clean(){
			this.fill(SCREEN_COLOR, {x: 0, y: 0}, this.canvas.width, this.canvas.height);
	}
	
	public loading(){
		this.ctx.beginPath();
		this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 1.5 * Math.PI, 2 * Math.PI);
		this.ctx.stroke();
	}
	
	public fill(style: string, position: TPosition, width: number, height: number){
		this.ctx.fillStyle = style;
		this.ctx.fillRect(position.x, position.y, width, height);
	}
	
	public frame(style: string, position: TPosition, width: number, height: number){
		this.ctx.strokeStyle = style;
		this.ctx.strokeRect(position.x, position.y, width, height);
	}

	public text(text: string, style: string, color: string, position: TPosition){
		this.ctx.font = style;
		this.ctx.textAlign = "center"; 
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = color;
		this.ctx.fillText(text, position.x, position.y);
	}


	public scrollHandler(callback?: (e: WheelEvent) => void){
		this.canvas.onwheel = (e) => {
			e.preventDefault();
			if(callback) callback(e);
		}
	};

	public contextmenuHandler(callback?: (e: MouseEvent) => void){
		this.canvas.oncontextmenu = (e) => {
			e.preventDefault();
			if(callback) callback(e);
		}
	};

	public pointerdownHandler(callback?: (e: MouseEvent) => void){
		this.canvas.onpointerdown = (e) => {
			e.preventDefault();
			if(callback) callback(e);
		}
	};

	public pointermoveHandler(callback?: (e: MouseEvent) => void){
		this.canvas.onpointermove = (e) => {
			e.preventDefault();
			if(callback) callback(e);
		}
	};

	public pointerupHandler(callback?: (e: MouseEvent) => void){
		this.canvas.onpointerup = (e) => {
			e.preventDefault();
			if(callback) callback(e);
		}
	};

	public getPointWithCanvasOffset(pt: TPosition): TPosition{
		return {x: pt.x - this.getOffsetLeft(), y: pt.y - this.getOffsetTop()}
	}

}

export default CanvasHandler