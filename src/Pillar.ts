import {createBitmapByName} from "./utls";
import Bitmap = egret.Bitmap;

export class Pillar extends egret.DisplayObjectContainer {
    public direction: number = 0 // 柱子方向，朝上或者朝下，中心旋转

    private pillar: Bitmap

    public hitted: boolean = false // 检测是否已经碰撞过

    constructor(direction?: number) {

        super();
        this.direction = direction
        this.createPillar()
    }

    private createPillar(): void {
        const pillar = createBitmapByName('pillar_png')
        this.pillar = pillar
        pillar.anchorOffsetX = pillar.width / 2
        pillar.anchorOffsetY = pillar.height / 2
        if (this.direction === 1) {
            pillar.rotation = 180
        }
        this.addChild(pillar)
    }

    public slideHide(callback) {
        const tw = egret.Tween.get(this.pillar)
        const {stageHeight, stageWidth} = this.stage
        if (this.direction === 1) {
            tw.to({
                y: -this.pillar.height
            }, 120).call(callback, this)
        } else {
            tw.to({
                y: stageHeight
            }, 120).call(callback, this)
        }
    }
}
