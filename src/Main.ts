//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

import Sound = egret.Sound;
import {Bird} from "./Bird";
import {LoadingUI} from "./LoadingUI";
import {createBitmapByName} from "./utls";
import {Pillar} from "./Pillar";
import TextField = egret.TextField;
import {SoundCtrl} from "./SoundCtrl";

class Main extends eui.UILayer {

    private sound: Sound;
    private bird: Bird;
    private soundChannel: egret.SoundChannel;
    private colCenter: number;
    private bgImgs: egret.Bitmap[] = [];
    private timeOnEnterFrame = 0;
    private deltaTime = 0;
    private sceneSpeed = 0.3; // 场景速度
    private pillars: Pillar[] = [];
    private totalScore = 100
    private earnScore = 0
    private scoreTextField: TextField
    private soundCtrl: SoundCtrl

    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        });

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        };

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        };

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource();
        this.createGameScene();
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onButtonClick, this);
        // 添加帧动画监听
        this.addEventListener(egret.Event.ENTER_FRAME, this.onTick, this)
    }

    private async loadResource() {
        try {

            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("loading", 0,);
            const loadingPng = createBitmapByName('loading_png');
            const loadingView = new LoadingUI({
                stageWidth: this.stage.stageWidth,
                stageHeight: this.stage.stageHeight,
                loadingPng
            });
            this.stage.addChild(loadingView);
            await this.loadTheme();
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
            egret.registerFontMapping("myFont", "resource/assets/bird-assets/font2.ttf");
            this.sound = RES.getRes('hit_ogg')
        } catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise<void>((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    private onTick() {
        let now = egret.getTimer();
        let time = this.timeOnEnterFrame;
        this.deltaTime = now - time;
        this.timeOnEnterFrame = egret.getTimer();
        this.moveBgImgs()
        this.movePillars()
        this.testBirtHitPillar()
    }


    /**
     * 创建场景界面
     * Create scene interface
     */
    protected createGameScene(): void {

        // 添加小鸟
        this.bird = new Bird;
        this.addChildAt(this.bird, 5);
        this.bird.x = 200;
        this.colCenter = 320 - this.bird.height / 2;
        this.bird.y = this.colCenter;

        // 绘制蓝天白云背景
        for (let i = 0; i < 3; i++) {
            const bgImg = createBitmapByName('bg1_jpg');
            bgImg.width = this.stage.stageWidth;
            bgImg.height = this.stage.stageHeight;
            bgImg.x = bgImg.width * i;
            bgImg.y = 0;
            this.addChildAt(bgImg, 0);
            this.bgImgs.push(bgImg)
        }

        //  绘制管子

        for (let i = 1; i < this.totalScore; i++) {
            const direction = Math.random() - 0.5 >= 0 ? 1 : 0
            const pillar = new Pillar(direction)
            pillar.x = pillar.width * (2 * i + Math.random())
            pillar.y = direction === 1 ? -10 : this.stage.stageHeight
            this.addChild(pillar)
            this.pillars.push(pillar)
        }

        // 绘制分数
        let textfield = new egret.TextField();
        textfield.fontFamily = "myFont"; //上一步映射的字体
        this.addChildAt(textfield, 1000);
        textfield.text = `0/${this.totalScore}`
        textfield.width = 200;
        textfield.textAlign = egret.HorizontalAlign.LEFT;
        textfield.size = 27;
        textfield.textColor = 0xfed600
        textfield.x = 10;
        textfield.y = 10;
        this.scoreTextField = textfield

        //    绘制声音开关
        this.soundCtrl = new SoundCtrl()
        this.addChildAt(this.soundCtrl, 1000)
        this.soundCtrl.x = this.stage.stageWidth - (this.soundCtrl.width + 10)
        this.soundCtrl.y = 10
        this.soundCtrl.width = 80
        this.soundCtrl.height = 80
    }


    /**
     * 点击按钮
     * Click the button
     */

    private onButtonClick(e: egret.TouchEvent) {
        if (this.soundCtrl.voice) {
            if (this.soundChannel) {
                this.soundChannel.stop();
                this.soundChannel = null;
            }
            this.soundChannel = this.sound.play(0, 1);
        }
        egret.Tween.removeTweens(this.bird);
        let tw = egret.Tween.get(this.bird, {
            loop: false,//设置循环播放
        });
        // 点击屏幕左边。小鸟向下俯冲
        if (e.stageX < this.stage.stageWidth / 2) {
            tw.to({y: this.colCenter - 100, rotation: -15, x: 190}, 70)
                .to({y: this.colCenter, rotation: 0, x: 200}, 30)
        } else {
            // 点击屏幕右边。小鸟抬头
            tw.to({y: this.colCenter + 103, rotation: 20, x: 210}, 70)
                .to({y: this.colCenter, rotation: 0, x: 200}, 30)
        }
    }

    private moveBgImgs() {
        for (let i = 0; i < this.bgImgs.length; i++) {
            const bgImg = this.bgImgs[i];
            bgImg.x = bgImg.x - this.deltaTime * this.sceneSpeed;
            // 当移动超过一屏，循环移动画布位置
            if (bgImg.x < (i - 1) * bgImg.width) {
                bgImg.x = bgImg.x + bgImg.width
            }
        }
    }

    private movePillars() {
        for (let i = 0; i < this.pillars.length; i++) {
            const pillar = this.pillars[i];
            if (pillar) {
                pillar.x = pillar.x - this.deltaTime * this.sceneSpeed
            }
        }
    }

    private testBirtHitPillar() {
        for (let i = 0; i < this.pillars.length; i++) {
            const pillar = this.pillars[i];
            if (pillar) {
                let pillarHitY
                if (pillar.direction === 1) {
                    pillarHitY = pillar.y + pillar.height / 2
                } else {
                    pillarHitY = pillar.y - pillar.height / 2
                }
                let hit = this.bird.hitTestPoint(pillar.x, pillarHitY)
                if (hit && !pillar.hitted) {
                    pillar.hitted = true
                    this.earnScore = this.earnScore + 1
                    this.scoreTextField.text = `${this.earnScore}/${this.totalScore}`
                    pillar.slideHide(() => {
                        this.removeChild(pillar)
                        this.pillars[i] = null
                    })
                }
            }

        }
    }
}
