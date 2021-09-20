import {createBitmapByName} from "./utls";

export class Bird extends egret.DisplayObjectContainer {

    constructor() {
        super();
        this.addEventListener(egret.Event.ENTER_FRAME, this.initBird, this)
    }

    private _status: number = 1;

    public width: number = 56
    public height: number = 71

    set status(status: number) {
        this._status = status;
        if (status === 1) {
            this.addEventListener(egret.Event.ENTER_FRAME, this.initBird, this)
        }
    }

    get status(): number {
        return this._status;
    }

    private birds: Array<egret.Bitmap> = [];
    private birdStatus: number = 0;

    private initBird() {
        if (this.birds.length === 0) {
            let bird0: egret.Bitmap = createBitmapByName("zombies_json.bird0");
            let bird1: egret.Bitmap = createBitmapByName("zombies_json.bird1");
            let bird2: egret.Bitmap = createBitmapByName("zombies_json.bird2");
            this.birds.push(bird0);
            this.birds.push(bird1);
            this.birds.push(bird2);
            this.addChild(bird0)
        }
        if (this.status === 1) {

            this.birdStatus += 0.2;
            if (this.birdStatus > 3) {
                this.birdStatus = 0
            }

            let currentBirdIndex = Math.floor(this.birdStatus);

            this.birds.forEach((bird, index) => {
                if (index === currentBirdIndex) {
                    this.addChild(bird)
                } else {
                    if (bird.parent) {
                        this.removeChild(bird)
                    }
                }
            });
        } else {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.initBird, this)
        }
    }
}
