(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GeneticAlgorithm {
    constructor(mutationRate, crossOverRate, geneNum, population) {
        this.generationCount = 0;
        this.binaryLength = new Array();
        this.binaryLengthSum = 0;
        this.selectedChildren = new Array();
        this.crossOveredChildren = new Array();
        this.mutatedChildren = new Array();
        this.binaryChromosomes = new Array();
        if (population % 2 != 0) {
            console.log("population % 2 != 0");
            return;
        }
        this.mutationRate = mutationRate;
        this.crossOverRate = crossOverRate;
        this.population = population;
        this.geneNum = geneNum;
        this.fitness = Array(population);
        this.chromosomes = Array(population);
        this.geneUpperBound = Array(geneNum);
        this.geneLowerBound = Array(geneNum);
    }
    produceNextGeneration() {
        this.setBinaryChromosomes();
        this.selection();
        this.crossOver();
        this.mutation();
        this.setDecimalChromosomes();
        this.generationCount++;
    }
    setGeneBoundry(geneIndex, lowerBound, upperBound) {
        if (upperBound < lowerBound) {
            console.log("upperBound < lowerBound");
            return;
        }
        this.geneLowerBound[geneIndex] = lowerBound;
        this.geneUpperBound[geneIndex] = upperBound;
    }
    setBinaryEncodeParm() {
        this.binaryLength = Array(this.geneNum);
        this.binaryLengthSum = 0;
        for (let geneIndex = 0; geneIndex < this.geneNum; geneIndex++) {
            let binaryLength = 0;
            let diff = this.geneUpperBound[geneIndex] - this.geneLowerBound[geneIndex];
            if (diff < 2) {
                binaryLength = 1;
            }
            else if (diff < 4) {
                binaryLength = 2;
            }
            else if (diff < 8) {
                binaryLength = 3;
            }
            else if (diff < 16) {
                binaryLength = 4;
            }
            else if (diff < 32) {
                binaryLength = 5;
            }
            else if (diff < 64) {
                binaryLength = 6;
            }
            else if (diff < 128) {
                binaryLength = 7;
            }
            else if (diff < 256) {
                binaryLength = 8;
            }
            else {
                console.log("m_geneUpperBound[geneIndex] - m_geneLowerBound[geneIndex] >= 256");
            }
            this.binaryLength[geneIndex] = binaryLength;
            this.binaryLengthSum += binaryLength;
        }
    }
    setFitness(chromosomeIndex, fitness) {
        this.fitness[chromosomeIndex] = fitness;
    }
    setChromosome(chromosomeIndex, predefinedChromosome) {
        this.chromosomes[chromosomeIndex] = predefinedChromosome;
    }
    getChromosome(chromosomeIndex) {
        return this.chromosomes[chromosomeIndex];
    }
    setBinaryChromosomes() {
        for (let i = 0; i < this.population; i++) {
            this.binaryChromosomes[i] = this.convertToBinaryChromosome(this.chromosomes[i]);
        }
    }
    convertToBinaryChromosome(decChromosome) {
        let binaryChromosome = "";
        let intChromosomeArrayLength = decChromosome.length;
        for (let geneIndex = 0; geneIndex < intChromosomeArrayLength; geneIndex++) {
            let decDiff = decChromosome[geneIndex] - this.geneLowerBound[geneIndex];
            let binDiff = decDiff.toString(2);
            let lengthDiff = binDiff.length - this.binaryLength[geneIndex];
            let binaryGene = "";
            let prefix = "";
            if (lengthDiff != 0) {
                let lengthDiffAbs = Math.abs(lengthDiff);
                for (let i = 0; i < lengthDiffAbs; i++) {
                    prefix += "0";
                }
            }
            binaryChromosome += prefix + binDiff;
            ;
        }
        return binaryChromosome;
    }
    convertToDecimalChromosome(binChromosomes) {
        let startPoint = 0;
        let geneArray = Array(this.geneNum);
        for (let i = 0; i < this.geneNum; i++) {
            let binaryLength = this.binaryLength[i];
            let geneLowerBound = this.geneLowerBound[i];
            let geneUpperBound = this.geneUpperBound[i];
            let value = parseInt(binChromosomes.substring(startPoint, startPoint + binaryLength), 2);
            startPoint += binaryLength;
            value += geneLowerBound;
            if (value > geneUpperBound) {
                value = geneUpperBound;
            }
            else if (value < geneLowerBound) {
                value = geneLowerBound;
            }
            geneArray[i] = value;
        }
        return geneArray;
    }
    setDecimalChromosomes() {
        for (let i = 0; i < this.population; i++) {
            this.chromosomes[i] = this.convertToDecimalChromosome(this.mutatedChildren[i]);
        }
    }
    getFitnessSum() {
        let fitnessSum = 0;
        for (let chromosomeIndex = 0; chromosomeIndex < this.population; chromosomeIndex++) {
            fitnessSum += this.fitness[chromosomeIndex];
        }
        return fitnessSum;
    }
    selection() {
        this.selectedChildren = [];
        let fitnessSum = this.getFitnessSum();
        let slack = this.population;
        let copyedCount = 0;
        // To build "Resampling Wheel"
        for (let chromosomeIndex = 0; chromosomeIndex < this.population; chromosomeIndex++) {
            let copyNum = Math.round(this.fitness[chromosomeIndex] / fitnessSum * this.population);
            if (copyNum > slack) {
                copyNum = slack;
            }
            for (let i = 0; i < copyNum; i++, copyedCount++) {
                this.selectedChildren.push(this.binaryChromosomes[chromosomeIndex]);
            }
            slack -= copyNum;
        }
        // To fill the gaps in the "Resampling Wheel"
        while (copyedCount < this.population) {
            let pick1 = Math.round(Math.random() * this.population) % this.population;
            let pick2;
            do {
                pick2 = Math.round(Math.random() * this.population) % this.population;
            } while (pick1 == pick2);
            let finalPick = this.fitness[pick1] > this.fitness[pick2] ? pick1 : pick2;
            this.selectedChildren.push(this.binaryChromosomes[finalPick]);
            copyedCount++;
        }
    }
    crossOver() {
        let crossOverMax = this.population;
        let crossOverCount = 0;
        this.crossOveredChildren = [];
        // 交配直到人口足夠
        while (crossOverCount < crossOverMax) {
            let pick1 = Math.round(Math.random() * this.population) % this.population;
            let pick2;
            do {
                pick2 = Math.round(Math.random() * this.population) % this.population;
            } while (pick1 == pick2);
            if (this.crossOverRate < Math.random()) {
                // 不交配
                this.crossOveredChildren.push(this.selectedChildren[pick1]);
                this.crossOveredChildren.push(this.selectedChildren[pick2]);
            }
            else {
                // 單點交配
                let tmp = (this.binaryLengthSum - 2);
                let crossOverPoint = Math.round(Math.random() * tmp) % tmp + 1;
                let gene1 = this.selectedChildren[pick1];
                let gene2 = this.selectedChildren[pick2];
                let firstPartOfGene1 = gene1.slice(0, crossOverPoint);
                let firstPartOfGene2 = gene2.slice(0, crossOverPoint);
                let lastPartOfGene1 = gene2.slice(crossOverPoint + 1, this.binaryLengthSum);
                let lastPartOfGene2 = gene2.slice(crossOverPoint + 1, this.binaryLengthSum);
                let gene1Crossed = firstPartOfGene1 + lastPartOfGene2;
                let gene2Crossed = firstPartOfGene2 + lastPartOfGene1;
                this.crossOveredChildren.push(gene1Crossed);
                this.crossOveredChildren.push(gene2Crossed);
            }
            crossOverCount += 2;
        }
    }
    mutation() {
        String.prototype.replaceAt = function (index, replacement) {
            return this.substr(0, index) +
                replacement +
                this.substr(index +
                    replacement.length);
        };
        for (let chromosomeIndex = 0; chromosomeIndex < this.population; chromosomeIndex++) {
            if (this.mutationRate > Math.random()) {
                let tmp = (this.binaryLengthSum - 2);
                let mutationGene = Math.round(Math.random() * tmp) % tmp + 1;
                let str = this.crossOveredChildren[chromosomeIndex];
                if (str.charAt(mutationGene) == '0') {
                    str.replaceAt(mutationGene, '1');
                }
                this.mutatedChildren[chromosomeIndex] = str;
            }
            else {
                this.mutatedChildren[chromosomeIndex] =
                    this.crossOveredChildren[chromosomeIndex];
            }
        }
    }
}
exports.GeneticAlgorithm = GeneticAlgorithm;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const movingSquare_1 = require("./movingSquare");
const geneticAlgorithm_1 = require("./geneticAlgorithm");
let canvas;
let ctx;
let ga = null;
let squares = null;
let population = 10;
let movesetLength = 12;
const CHARACTER_WIDTH = 10;
const CHARACTER_HEIGHT = 10;
const FPS = 60;
const UPDATE_INTERVAL_MS = 1000 / FPS;
let generation = 0;
function initialization() {
    // Initialization of MovingSquare
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    squares = [];
    for (let i = 0; i < population; i++) {
        let mDot = new movingSquare_1.MovingSquare(ctx, canvas.width, canvas.height, CHARACTER_WIDTH, CHARACTER_HEIGHT, movesetLength);
        mDot.setRandomMoveset();
        squares.push(mDot);
        // Draw the squares.
        mDot.draw();
    }
    // Initialization of GA
    let mutationRate = 0.1;
    let crossOverRate = 0.3;
    ga = new geneticAlgorithm_1.GeneticAlgorithm(mutationRate, crossOverRate, movesetLength, population);
    for (let i = 0; i < movesetLength; i++) {
        ga.setGeneBoundry(i, 0, 3);
    }
    ga.setBinaryEncodeParm();
    for (let i = 0; i < population; i++) {
        let chromosome = new Array();
        for (let j = 0; j < movesetLength; j++) {
            chromosome.push(squares[i].moveset[j]);
        }
        ga.setChromosome(i, chromosome);
    }
    run();
}
function run() {
    updateText();
    // Wipe the canvas.
    canvas.width = canvas.width;
    // Draw the squares.
    for (let i = 0; i < population; i++) {
        squares[i].move();
        squares[i].draw();
    }
    generation++;
    let maxGeneration = 500;
    if (generation > maxGeneration) {
        generation = 0;
        // Set fitness of each gene, according to the lifespan of the square 
        // that got the gene.
        for (let i = 0; i < population; i++) {
            // 立方加權。這搭配 "Resampling Wheel"，會讓稍微多活一點的個體，產生更多的後代
            let fitness = Math.pow(squares[i].lifespan, 3);
            ga.setFitness(i, fitness);
        }
        ga.produceNextGeneration();
        // Produce new squares.
        squares = [];
        for (let j = 0; j < population; j++) {
            let mDot = new movingSquare_1.MovingSquare(ctx, canvas.width, canvas.height, CHARACTER_WIDTH, CHARACTER_HEIGHT, movesetLength);
            squares.push(mDot);
        }
        // Set new moveset using new gene.
        for (let i = 0; i < population; i++) {
            for (let j = 0; j < movesetLength; j++) {
                squares[i].moveset[j] = ga.chromosomes[i][j];
            }
        }
    }
    setTimeout(run, UPDATE_INTERVAL_MS);
}
function updateText() {
    document.getElementById('movesetLength').innerHTML = movesetLength.toString();
}
initialization();

},{"./geneticAlgorithm":1,"./movingSquare":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MovingSquare {
    constructor(ctx, canvasWidth, canvasHeight, characterWidth, characterHeight, movesetLength) {
        this.movesetIndex = 0;
        this.moveSpeed = 5;
        this.isAlive = true;
        this.lifespan = 0;
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
    setRandomMoveset() {
        let length = this.moveset.length;
        for (let i = 0; i < length; i++) {
            this.moveset[i] = Math.round(Math.random() * 3);
        }
    }
    move() {
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
        if (!this.IfCollided(newPosX, newPosY)) {
            this.x = newPosX;
            this.y = newPosY;
            this.movesetIndex = this.movesetIndex + 1 === this.moveset.length ?
                0 : this.movesetIndex + 1;
        }
    }
    draw() {
        if (!this.isAlive) {
            this.ctx.strokeStyle = "red";
        }
        else {
            this.ctx.strokeStyle = "black";
        }
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.x - this.characterWidth / 2, this.y - this.characterHeight / 2, this.characterWidth, this.characterHeight);
        this.ctx.moveTo(this.x, this.y);
        this.ctx.stroke();
    }
    IfCollided(newPosX, newPosY) {
        if (newPosX === this.canvasWidth || newPosX === 0 ||
            newPosY === this.canvasHeight || newPosY === 0) {
            this.isAlive = false;
        }
        return !this.isAlive;
    }
}
exports.MovingSquare = MovingSquare;

},{}]},{},[2]);
