// Copyright (c) 2024 LazyEdward
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TGameMode } from "./type"

// Screen
export const FULL_SCREEN_WIDTH = 425 as const
export const SCREEN_COLOR = "#83A2FF" as const

// Time
export const FPS = 60 as const

// Interaction
export const ACTION_TYPE = ['click', 'dbclick', 'drag', 'none'] as const

export const DB_CLICK_ERROER_RESPONSE_TIME = 50 as const
export const DB_CLICK_RESPONSE_TIME = 500 as const
export const CLICK_MAX_SEPARATIONS = 20 as const

export const CLICK_ERROER_RESPONSE_TIME = 100 as const
export const CLICK_RESPONSE_TIME = 250 as const

// Game

export const GAME_PLAYER_MODE = ["single", "multi"] as const
export const GAME_MODE = ["normal", "hard", "fast", "marathon"] as const

export const GAME_SPEED = {
	"normal": .015,
	"hard": .015,
	"fast": .02,
	"marathon": .02,
} as const satisfies Record<TGameMode, number>

export const GAME_SPEED_50 = {
	"normal": .015,
	"hard": .02,
	"fast": .03,
	"marathon": .02,
} as const satisfies Record<TGameMode, number>

export const GAME_SPEED_75 = {
	"normal": .02,
	"hard": .035,
	"fast": .05,
	"marathon": .02,
} as const satisfies Record<TGameMode, number>

export const ACCELERATION_SPEED = .5 as const

export const CELL_PER_FLOOR = 9 as const

export const TOTAL_MARATHON_FLOORS = 1500 as const

export const TOTAL_FLOORS = {
	"normal": 150,
	"hard": 400,
	"fast": 150,
	"marathon": 100,
} as const satisfies Record<TGameMode, number>

export const REVEALABLE_FLOORS = {
	"normal": 5,
	"hard": 3,
	"fast": 2,
	"marathon": 3,
} as const satisfies Record<TGameMode, number>

export const TOTAL_MINES = {
	"normal": 100,
	"hard": 600,
	"fast": 100,
	"marathon": 50,
} as const satisfies Record<TGameMode, number>

export const MAX_MINE_NEIGHBS = {
	"normal": 0,
	"hard": 5,
	"fast": 3,
	"marathon": 0,
} as const satisfies Record<TGameMode, number>

export const MENU_TITLE_STYLE = "bold 2.5rem Arial" as const
export const MENU_STYLE = "bold 1.5rem Arial" as const
export const MENU_STYLE_SMALL = "bold 1rem Arial" as const
export const MENU_TEXT_COLOR = "#00175B" as const

export const GAME_UI_TRANS_STYLE = "#E1BD41AA" as const
export const GAME_UI_STYLE = "#E1BD41" as const
export const GAME_UI_TEXT_STYLE = "bold 1rem Arial" as const
export const GAME_UI_MENU_STYLE = "bold 3rem Arial" as const

export const GAME_UI_GAME_OVER_TEXT_COLOR = "#A90000" as const
export const GAME_UI_GAME_PAUSE_TEXT_COLOR = "#000" as const
export const GAME_UI_GAME_WIN_TEXT_COLOR = "#22A900" as const

export const GAME_UI_TEXT_COLOR = "#000" as const

export const GAME_BOARD_SCREEN_STYLE = "#4169E1" as const
export const GAME_BOARD_STYLE = "#ACACAC" as const
export const GAME_BOARD_PAUSED_STYLE = "#ACACACAA" as const

export const TILE_BORDER_STYLE = "#B5B5B5" as const
export const TILE_BORDER_HIDDEN_STYLE = "#494949" as const

export const TILE_BG_HIDDEN_STYLE = "#83A2FFAA" as const
export const TILE_BG_STYLE = "#ACACAC" as const
export const TILE_BG_GAME_OVER_STYLE = "#FF9393" as const
export const TILE_BG_REVEALED_STYLE = "#275DFF" as const
export const TILE_BG_BOMB_STYLE = "#E14141" as const

export const TILE_BG_HIGHLIGHT_STYLE = "#B941D999" as const

export const TILE_TEXT_STYLE = "bold 1.25rem Arial"
export const TILE_TEXT_FLOOR_STYLE = "bold 1rem Arial" as const

export const TILE_TEXT_FLOOR_COLOR = "#CCFF00" as const

export const TILE_TEXT_HIDDEN_COLOR = "#000" as const
export const TILE_TEXT_BOMB_COLOR = "#000" as const
export const TILE_TEXT_FLAG_COLOR = "#A90000" as const
export const TILE_TEXT_COUNT_COLORS = [
	"",
	"#00f6cb",
	"#9de24f",
	"#ffff66",
	"#ffbd55",
	"#ff6666",
	"#fb7607",
	"#9900c9",
] as const

export const TILE_TEXT_HIDDEN = "?" as const
export const TILE_TEXT_BOMB = "B" as const
export const TILE_TEXT_FLAG = "F" as const
export const TILE_TEXT_COUNTS = ["", "1", "2", "3", "4", "5", "6", "7"] as const