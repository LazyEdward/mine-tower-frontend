// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CLICK_RESPONSE_TIME, DB_CLICK_ERROER_RESPONSE_TIME, CLICK_MAX_SEPARATIONS, DB_CLICK_RESPONSE_TIME, CLICK_ERROER_RESPONSE_TIME } from "./constants";
import { TPointerActionPosition, TPointerPosition, TUserInteraction } from "./type";

class InteractionHandler {
	private static instance: InteractionHandler;

	private userInteractable: TUserInteraction;

	private scrollingDown: boolean;
	private prevPointerPos: TPointerPosition;
	private pointerPos: TPointerActionPosition;
	private contextmenuPointerPos: TPointerPosition;

	constructor(userInteractable: TUserInteraction) {
		this.userInteractable = userInteractable

		this.scrollingDown = false;

		this.prevPointerPos = {x: -1, y: -1, invoke: -1}
		this.pointerPos = {x: -1, y: -1, invoke: -1, actionType: "none"}
		this.contextmenuPointerPos = {x: -1, y: -1, invoke: -1}

		this.userInteractable.scrollHandler(e => {
			if(e.deltaY < 0){
				this.scrollingDown = false;
				return;
			}
			// handle scroll down
			this.scrollingDown = true;
		});

		this.userInteractable.contextmenuHandler(e => {
			this.contextmenuPointerPos = {x: e.clientX, y: e.clientY, invoke: Date.now()}
		});

		this.userInteractable.pointerdownHandler(e => {
			if(e.button === 2)
				return;

			this.pointerPos = {...this.pointerPos, x: e.clientX, y: e.clientY, invoke: Date.now()}

			if(this.prevPointerPos.invoke >= 0){
				if(Date.now() - this.prevPointerPos.invoke > DB_CLICK_RESPONSE_TIME)
					this.cancelPointerEvent();
				else if(
					Math.abs(this.pointerPos.x - this.prevPointerPos.x) > CLICK_MAX_SEPARATIONS
					|| Math.abs(this.pointerPos.y - this.prevPointerPos.y) > CLICK_MAX_SEPARATIONS
				){
					this.prevPointerPos = {x: -1, y: -1, invoke: -1}
					this.pointerPos = {...this.prevPointerPos, actionType: "click"}
				}
				else
					this.pointerPos = {...this.prevPointerPos, actionType: "dbclick"}
			}
		});

		this.userInteractable.pointermoveHandler(e => {
			if(e.button === 2)
				return;

			if(this.pointerPos.invoke < 0)
				return;

			if(Math.abs(this.pointerPos.x - e.clientX) > 50)
				return;

			if(e.clientY - this.pointerPos.y > 50)
				this.pointerPos = {...this.pointerPos, actionType: "drag"}
		});

		this.userInteractable.pointerupHandler(e => {
			if(e.button === 2)
				return;

			if(this.pointerPos.invoke < 0)
				return;

			if(Date.now() - this.pointerPos.invoke > CLICK_RESPONSE_TIME){
				if(
					Math.abs(this.pointerPos.x - e.clientX) > CLICK_MAX_SEPARATIONS
					|| Math.abs(this.pointerPos.y - e.clientY) > CLICK_MAX_SEPARATIONS
				){
					this.cancelPointerEvent();
					return;
				}
	
				this.pointerPos = {...this.pointerPos, actionType: "click"}
			}
			else if(this.prevPointerPos.invoke < 0){
				this.prevPointerPos = {...this.pointerPos}
				this.pointerPos = {...this.pointerPos, x: -1, y: -1, actionType: "none", invoke: Date.now()}
			}
		});
	}

	public static getInstance(userInteractable: TUserInteraction) {
		if(!InteractionHandler.instance)
			InteractionHandler.instance = new InteractionHandler(userInteractable);
		
		return InteractionHandler.instance;
	}

	public cancelPointerEvent(){
		this.prevPointerPos = {x: -1, y: -1, invoke: -1}
		this.pointerPos = {x: -1, y: -1, invoke: -1, actionType: "none"}
	}

	public cancelContextmenuEvent(){
		this.contextmenuPointerPos = {x: -1, y: -1, invoke: -1}
	}

	public getPointerPos(){
		if(this.pointerPos.invoke < 0)
			return null
			
		if(this.prevPointerPos.invoke < 0){
			if(this.pointerPos.actionType === "drag"){
				let event = {...this.pointerPos}
				return event
			}

			if(this.pointerPos.actionType === "click"){
				let event = {...this.pointerPos}
				this.cancelPointerEvent()

				return event
			}

			return null
		}
		else{
			if(this.pointerPos.actionType === "dbclick"){
				let event = {...this.pointerPos}
				this.cancelPointerEvent()
		
				return event
			}

			if(Date.now() - this.pointerPos.invoke > CLICK_ERROER_RESPONSE_TIME){
				this.pointerPos = {...this.prevPointerPos, actionType: "click"}
		
				let event = {...this.pointerPos}
				this.cancelPointerEvent()
				return event		
			}
			
			return null
		}

	}

	public getContextmenuPointerPos(){
		if(this.contextmenuPointerPos.invoke < 0)
			return null

		let event = {...this.contextmenuPointerPos}
		this.cancelContextmenuEvent()

		return event
	}

	public getIsScroll(){
		let scroll = this.scrollingDown
		this.scrollingDown = false
		return scroll;
	}
}

export default InteractionHandler