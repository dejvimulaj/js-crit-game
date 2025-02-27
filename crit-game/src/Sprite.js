import { Vector2 } from "./Vector2";

export class Sprite{
    constructor({
        resource,
        frameSize,
        hFrames,
        vFrames,
        frame,
        scale,
        position,
        flipX = false
    }){
        this.resource = resource;
        this.frameSize = frameSize;
        this.hFrames = hFrames ?? new Vector2(16,16); ;
        this.vFrames = vFrames ?? 1;
        this.frame = frame ?? 0;
        this.frameMap = new Map();
        this.scale = scale ?? 1;
        this.position = position ?? new Vector2(0,0);
        this.flipX = flipX;

        this.buildFrameMap();
    }

    buildFrameMap(){
        let frameCount = 0;
        for(let v=0; v<this.vFrames; v++){
            for(let h=0; h<this.hFrames; h++){
                this.frameMap.set(
                   frameCount,
                   new Vector2(h*this.frameSize.x, v*this.frameSize.y),
                );
                frameCount++;
            }
        }
    }

    drawImage(ctx,x,y){
        if(!this.resource.loaded) return;

        let frameCoordx = 0;
        let frameCoordy = 0;
        const frame = this.frameMap.get(this.frame);
        if(frame){
            frameCoordx = frame.x;
            frameCoordy = frame.y;
        }

        const frameSizeX = this.frameSize.x;
        const frameSizeY = this.frameSize.y;

        ctx.save();

        if(this.flipX){
            ctx.translate(x + frameSizeX * this.scale,y);
            ctx.scale(-1,1);
            x=0;
        }

        ctx.drawImage(
            this.resource.image,
            frameCoordx,
            frameCoordy,
            frameSizeX,
            frameSizeY,
            x,
            y,
            frameSizeX * this.scale,
            frameSizeY * this.scale,
        )
        ctx.restore();

}}