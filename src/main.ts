import CanvasHandler from './CanvasHandler'
import { FPS } from './constants';
import GameMenuHandler from './GameMenuHandler';
import GameWorldHandler from './GameWorldHandler';
import InteractionHandler from './InteractionHandler';
import './style.css'
import TimeHandler from './TimeHandler';

const canvasHandler = CanvasHandler.getInstance();
const timeHandler = TimeHandler.getInstance();

const interactionHandler = InteractionHandler.getInstance(canvasHandler);

const menu: GameMenuHandler = GameMenuHandler.getInstance();
const game: GameWorldHandler = GameWorldHandler.getInstance();

const gameLoop = (timestamp: number) => {
  requestAnimationFrame(gameLoop);
  timeHandler.update(timestamp)

  if(timeHandler.getDeltaTime() > 1000 / FPS){
    canvasHandler.clean();
  
    let pointerPos = interactionHandler.getPointerPos();
    let contextmenuPointerPos = interactionHandler.getContextmenuPointerPos();
    let isScroll = interactionHandler.getIsScroll();
  
    if(menu.getIsActive()){
      if(pointerPos){
        if(pointerPos.actionType === "click" || pointerPos.actionType === "dbclick"){
          let point = canvasHandler.getPointWithCanvasOffset(pointerPos);
          pointerPos = {...pointerPos, x: point.x, y: point.y}
  
          menu.clickOnUi(
            pointerPos,
            (gameMode, gamePlayerMode) => {
              interactionHandler.cancelPointerEvent();
              interactionHandler.cancelContextmenuEvent();            

              game.reset(() => game.start(), true, undefined, gameMode, gamePlayerMode)
            }
          )
        }
      }
  
      menu.draw(canvasHandler);
    }
    else if(game.getStatus() === "pending"){
      canvasHandler.loading();
    }
    else{
      game.setAccelerate(isScroll)
      
      if(pointerPos){
        if(pointerPos.actionType === "drag")
          game.setAccelerate(true)
    
        if(pointerPos.actionType === "click" || pointerPos.actionType === "dbclick"){
          let point = canvasHandler.getPointWithCanvasOffset(pointerPos);
          pointerPos = {...pointerPos, x: point.x, y: point.y}
    
          if(game.getStatus() === "ready" || game.getStatus() === "paused"){
            interactionHandler.cancelPointerEvent();
            interactionHandler.cancelContextmenuEvent();

            if(game.isOnUi(pointerPos.y))
              game.clickOnUi(pointerPos, () => menu.reset());
            else
              game.start();
          }
          else if(game.getStatus() === "gameover" || game.getStatus() === "win"){
            interactionHandler.cancelPointerEvent();
            interactionHandler.cancelContextmenuEvent();

            if(game.isOnUi(pointerPos.y))
              game.clickOnUi(pointerPos, () => menu.reset());
          }
          else{
            if(game.isOnUi(pointerPos.y)){
              interactionHandler.cancelPointerEvent();
              interactionHandler.cancelContextmenuEvent();
  
              game.clickOnUi(pointerPos, () => menu.reset());
            }
            else
              game.clickOnTile(pointerPos);
          }
        }
      }
      
      if(contextmenuPointerPos){
        if(!(game.getStatus() === "ready" || game.getStatus() === "gameover" || game.getStatus() === "win")){
          if(game.getStatus() === "started" || game.getStatus() === "timestoped")
            game.pause()
          else
            game.start()
        }
      }
      
      game.updatePos(timeHandler.getDeltaTime());
    
      if(game.getStatus() !== "ready" && game.getStatus() !== "gameover" && game.getStatus() !== "win")
        timeHandler.updateTime();
    
      game.draw(canvasHandler);
    }
  
    timeHandler.updateFrameTime()
  }
}

window.onload = () => {
  interactionHandler.cancelPointerEvent();
  interactionHandler.cancelContextmenuEvent();

  // canvasHandler.resetDimension();
  canvasHandler.clean();
  timeHandler.resetTime();

  requestAnimationFrame(gameLoop);
}

