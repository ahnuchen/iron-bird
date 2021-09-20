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

import Bitmap = egret.Bitmap;
import {createBitmapByName} from "./utls";

export class LoadingUI extends egret.Sprite implements RES.PromiseTaskReporter {

    private stageWidth: number;
    private stageHeight: number;
    private loadingPng: Bitmap
    private textField: egret.TextField;

    public constructor({stageWidth, stageHeight,loadingPng}: {stageWidth: number, stageHeight: number,loadingPng?:Bitmap}) {
        super();
        this.stageWidth = stageWidth
        this.stageHeight = stageHeight
        this.loadingPng = loadingPng
        this.createView();
    }



    private async createView() {
        this.addChild(this.loadingPng)
        this.loadingPng.x = (this.stageWidth - this.loadingPng.width) / 2
        this.loadingPng.y = (this.stageHeight - this.loadingPng.height) / 2 - 80
        //绘制白色背景
        let shp: egret.Shape = new egret.Shape();
        shp.graphics.beginFill(0xffffff, 1);
        shp.graphics.drawRect(0, 0, this.stageWidth, this.stageHeight);
        shp.graphics.endFill();
        this.addChildAt(shp, 0);

        // 绘制进度
        this.textField = new egret.TextField();
        this.textField.textColor = 0x1aad19;
        this.addChildAt(this.textField, 1);
        this.textField.width = 480;
        this.textField.height = 100;
        this.textField.x = (this.stageWidth - this.textField.width) / 2
        this.textField.y = 320;
        this.textField.textAlign = "center";
    }

    private createAnimation(){
        let change = () => {
            let tw = egret.Tween.get(this.textField);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };
        change();
    }

    public onProgress(current: number, total: number): void {
        this.textField.text = `小鸟正在飞过来...${current}/${total}`;
    }
}
