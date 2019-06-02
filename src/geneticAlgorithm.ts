export class GeneticAlgorithm {
    public generationCount: number = 0;
    public fitness: Array<any>;
    public chromosomes: Array<any>;

    private geneUpperBound: Array<number>;
    private geneLowerBound: Array<number>;
    private mutationRate: number;
    private crossOverRate: number;
    private population: number;
    private geneNum: number;
    private binaryLength: Array<any> = new Array();
    private binaryLengthSum: number = 0;

    private selectedChildren: Array<any> = new Array();
    private crossOveredChildren: Array<any> = new Array();
    private mutatedChildren: Array<any> = new Array();
    private binaryChromosomes: Array<any> = new Array();

    public constructor(
        mutationRate: number,
        crossOverRate: number,
        geneNum: number,
        population: number) {
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
    public produceNextGeneration(): void {
        this.setBinaryChromosomes();
        this.selection();
        this.crossOver();
        this.mutation();
        this.setDecimalChromosomes()
        this.generationCount++;
    }
    public setGeneBoundry(geneIndex, lowerBound, upperBound): void {
        if (upperBound < lowerBound) {
            console.log("upperBound < lowerBound");
            return;
        }
        this.geneLowerBound[geneIndex] = lowerBound;
        this.geneUpperBound[geneIndex] = upperBound;
    }
    public setBinaryEncodeParm(): void {
        this.binaryLength = Array(this.geneNum);
        this.binaryLengthSum = 0;
        for (let geneIndex = 0; geneIndex < this.geneNum; geneIndex++) {
            let binaryLength = 0;
            let diff = this.geneUpperBound[geneIndex] - this.geneLowerBound[geneIndex];
            if (diff < 2) {
                binaryLength = 1;
            } else if (diff < 4) {
                binaryLength = 2;
            } else if (diff < 8) {
                binaryLength = 3;
            } else if (diff < 16) {
                binaryLength = 4;
            } else if (diff < 32) {
                binaryLength = 5;
            } else if (diff < 64) {
                binaryLength = 6;
            } else if (diff < 128) {
                binaryLength = 7;
            } else if (diff < 256) {
                binaryLength = 8;
            } else {
                console.log("m_geneUpperBound[geneIndex] - m_geneLowerBound[geneIndex] >= 256");
            }
            this.binaryLength[geneIndex] = binaryLength;
            this.binaryLengthSum += binaryLength;
        }
    }
    public setFitness(chromosomeIndex, fitness): void {
        this.fitness[chromosomeIndex] = fitness;
    }
    public setChromosome(chromosomeIndex, predefinedChromosome): void {
        this.chromosomes[chromosomeIndex] = predefinedChromosome;
    }
    getChromosome(chromosomeIndex): string {
        return this.chromosomes[chromosomeIndex];
    }
    setBinaryChromosomes(): void {
        for (let i = 0; i < this.population; i++) {
            this.binaryChromosomes[i] = this.convertToBinaryChromosome(this.chromosomes[i]);
        }
    }
    convertToBinaryChromosome(decChromosome): string {
        let binaryChromosome = "";
        let intChromosomeArrayLength = decChromosome.length;
        for (let geneIndex = 0; geneIndex < intChromosomeArrayLength; geneIndex++) {
            let decDiff = decChromosome[geneIndex] - this.geneLowerBound[geneIndex]
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
            binaryChromosome += prefix + binDiff;;
        }
        return binaryChromosome;
    }
    convertToDecimalChromosome(binChromosomes): Array<any> {
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
            } else if (value < geneLowerBound) {
                value = geneLowerBound;
            }

            geneArray[i] = value;
        }
        return geneArray;
    }
    setDecimalChromosomes(): void {
        for (let i = 0; i < this.population; i++) {
            this.chromosomes[i] = this.convertToDecimalChromosome(this.mutatedChildren[i])
        }
    }
    getFitnessSum(): number {
        let fitnessSum = 0;
        for (let chromosomeIndex = 0; chromosomeIndex < this.population; chromosomeIndex++) {
            fitnessSum += this.fitness[chromosomeIndex];
        }

        return fitnessSum;
    }
    private selection(): void {
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
            for (let i = 0; i < copyNum; i++ , copyedCount++) {
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
    private crossOver(): void {
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
            } else {
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
    private mutation(): void {
        (String.prototype as any).replaceAt = function (index, replacement) {
            return this.substr(0, index) +
                replacement +
                this.substr(index +
                    replacement.length);
        }
        for (let chromosomeIndex = 0;
            chromosomeIndex < this.population;
            chromosomeIndex++) {
            if (this.mutationRate > Math.random()) {
                let tmp = (this.binaryLengthSum - 2);
                let mutationGene = Math.round(Math.random() * tmp) % tmp + 1;
                let str = this.crossOveredChildren[chromosomeIndex];
                if (str.charAt(mutationGene) == '0') {
                    str.replaceAt(mutationGene, '1')
                }
                this.mutatedChildren[chromosomeIndex] = str;
            } else {
                this.mutatedChildren[chromosomeIndex] =
                    this.crossOveredChildren[chromosomeIndex];
            }
        }
    }
}