// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ACTION_TYPE, GAME_MODE, GAME_PLAYER_MODE } from "./constants"

// Screen
export type TCanvasLoading = {
	loading: () => void
}

export type TCanvasFill = {
	fill: (style: string, position: TPosition, width: number, height: number) => void
}

export type TCanvasFrame = {
	frame: (style: string, position: TPosition, width: number, height: number) => void
}

export type TCanvasText = {
	text: (text: string, style: string, color: string, position: TPosition) => void
}

// Interaction
export type TPosition = {
	x: number,
	y: number,
}

export type TPointerPosition = {
	invoke: number,
} & TPosition

export type TPointerActionPosition = {
	actionType: (typeof ACTION_TYPE)[number]
} & TPointerPosition

export type TUserInteraction = {
	scrollHandler: (callback?: (e: WheelEvent) => void) => void,
	contextmenuHandler: (callback?: (e: MouseEvent) => void) => void,
	pointerdownHandler: (callback?: (e: MouseEvent) => void) => void,
	pointermoveHandler: (callback?: (e: MouseEvent) => void) => void,
	pointerupHandler: (callback?: (e: MouseEvent) => void) => void,
}

// Game
export type TGamePlayerMode = (typeof GAME_PLAYER_MODE)[number]
export type TGameMode = (typeof GAME_MODE)[number]

export type TTile = {
	getIsMine: () => boolean,
	getIsFlaged: () => boolean,
	getIsRevealed: () => boolean,
	getMineNearBy: () => number,
	reveal: () => void,
	flag: () => void,
}