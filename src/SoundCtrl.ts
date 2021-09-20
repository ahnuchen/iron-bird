import {createBitmapByName} from "./utls";

export class SoundCtrl extends egret.DisplayObjectContainer {
    public voice = true
    private soundOn: egret.Bitmap;
    private soundOff: egret.Bitmap;

    constructor() {
        super();
        this.createSoundIcon()
    }

    private createSoundIcon() {
        this.soundOn = createBitmapByName('sound_on_png')
        this.soundOff = createBitmapByName('sound_off_png')
        this.addChild(this.soundOn)
        this.touchEnabled = true
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSoundClick, this, true)
    }

    private onSoundClick(e) {
        e.stopPropagation()
        if (this.voice) {
            this.removeChild(this.soundOn)
            this.addChild(this.soundOff)
            this.voice = false
        } else {
            this.removeChild(this.soundOff)
            this.addChild(this.soundOn)
            this.voice = true
        }
    }
}
