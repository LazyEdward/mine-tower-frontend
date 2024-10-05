// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

class TimeHandler {
	private static instance: TimeHandler;

	private gameTime: number;
	private currentFrameTime: number;
	private lastFrameTime: number;

	constructor() {
		this.gameTime = 0
		this.currentFrameTime = 0
		this.lastFrameTime = 0
	}

	public static getInstance() {
		if(!TimeHandler.instance)
			TimeHandler.instance = new TimeHandler();
		
		return TimeHandler.instance;
	}

	public resetTime() {
		this.gameTime = 0
		this.currentFrameTime = 0
		this.lastFrameTime = 0
	}

	public update(timestamp: number) {
		this.currentFrameTime = timestamp;

		if(this.lastFrameTime === 0)
			this.lastFrameTime = timestamp
	}

	public updateTime() {
		this.gameTime += this.currentFrameTime - this.lastFrameTime
	}

	public updateFrameTime() {
		this.lastFrameTime = this.currentFrameTime
	}

	public getGameTime() {
		return this.gameTime
	}

	public getDeltaTime() {
		return this.currentFrameTime - this.lastFrameTime
	}

	public getTextGameTime() {
		if(this.getGameTime() > 360000)
			return `${(this.getGameTime()/1000/60/60).toFixed(1)} h`

		if(this.getGameTime() > 60000)
			return `${(this.getGameTime()/1000/60).toFixed(1)} m`
		
		return `${(this.getGameTime()/1000).toFixed(1)} s`
	}
}

export default TimeHandler