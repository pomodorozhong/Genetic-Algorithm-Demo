export class MovingSquare {
    private ctx: CanvasRenderingContext2D;
    private canvasWidth: number;
    private canvasHeight: number;
    private characterWidth: number;
    private characterHeight: number;
    x: number;
    y: number;
    moveset: Array<number>;
    movesetIndex: number = 0;
    moveSpeed: number = 5;
    isAlive: boolean = true;
    lifespan: number = 0;

    constructor(
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number,
        characterWidth: number,
        characterHeight: number,
        movesetLength: number) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.characterWidth = characterWidth;
        this.characterHeight = characterHeight;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.moveset = new Array(movesetLength);
        // this.moveset = [];
        // for (let i = 0; i < movesetLength; i++) {
        //     this.moveset.push(0);
        // }
        // this.moveSet = [0, 1, 2, 3];
    }

    setRandomMoveset(): void {
        let length = this.moveset.length;
        for (let i = 0; i < length; i++) {
            this.moveset[i] = Math.round(Math.random() * 3);
        }
    }

    move(): void {
        if (!this.isAlive) {
            return;
        }
        this.lifespan += 1;

        let direction = this.moveset[this.movesetIndex] % 4;
        let newPosX = 0;
        let newPosY = 0;

        switch (direction) {
            case 0: //up
                newPosX = this.x;
                newPosY = this.y - this.moveSpeed;
                break;
            case 1: //right
                newPosX = this.x + this.moveSpeed;
                newPosY = this.y;
                break;
            case 2: //down
                newPosX = this.x;
                newPosY = this.y + this.moveSpeed;
                break;
            case 3: //left
                newPosX = this.x - this.moveSpeed;
                newPosY = this.y;
                break;
            default:
                break;
        }

        newPosX = newPosX >= this.canvasWidth ? this.canvasWidth : newPosX;
        newPosX = newPosX <= 0 ? 0 : newPosX;
        newPosY = newPosY >= this.canvasHeight ? this.canvasHeight : newPosY;
        newPosY = newPosY <= 0 ? 0 : newPosY;

        if (newPosX === this.canvasWidth || newPosX === 0 ||
            newPosY === this.canvasHeight || newPosY === 0) {
            this.isAlive = false;
        }

        this.x = newPosX;
        this.y = newPosY;

        this.movesetIndex = this.movesetIndex + 1 === this.moveset.length ?
            0 : this.movesetIndex + 1;
    }

    draw(): void {
        if (!this.isAlive) {
            this.ctx.strokeStyle = "red";
        }
        else {
            this.ctx.strokeStyle = "black";
        }
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.x - this.characterWidth / 2,
            this.y - this.characterHeight / 2,
            this.characterWidth,
            this.characterHeight);
        this.ctx.moveTo(this.x, this.y);
        this.ctx.stroke();
    }
}