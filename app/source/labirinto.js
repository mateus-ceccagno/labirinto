// Gerar um array útil para renderizar os cubos
export default class Labirinto {
    constructor(){
    }

    random(k) {
        return Math.floor(Math.random() * k);
    }

    generate(row, col,  start, end) {
        this.col = col;
        this.row = row;
        this.start = start;
        this.end = end;

        this.LabirintoArray = [];
        for (let i = 0; i < 2 * this.col + 1; i++) {
            let matriz = [];
            for (let j = 0; j < 2 * this.row + 1; j++) {
                // paredes
                if (i % 2 == 0 || j % 2 == 0) {
                    matriz.push({
                        value: 0,
                        i: i,
                        j: j
                    });
                }
                else {
                    matriz.push({
                        value: 1,
                        isVisited: false,
                        i: i,
                        j: j
                    });
                }
            }
            this.LabirintoArray[i] = matriz;
        }
        // Escolhe aleatoriamente um ponto
        let pontoAtual = this.LabirintoArray[2 * this.random(this.row) + 1][2 * this.random(this.col) + 1];
        pontoAtual.isVisited = true;
        
        let pontosVisitados = [];
        pontosVisitados.push(pontoAtual);
        // repete até todos serem visitados
        while (pontoAtual.isVisited) {
            // obtem pontos horizontais e verticais
            let pontoCima = this.LabirintoArray[pontoAtual.i - 2] ? this.LabirintoArray[pontoAtual.i - 2][pontoAtual.j] : {isVisited: true};
            let pontoDireita = this.LabirintoArray[pontoAtual.j + 2] ? this.LabirintoArray[pontoAtual.i][pontoAtual.j + 2] : {isVisited: true};
            let pontoBaixo = this.LabirintoArray[pontoAtual.i + 2] ? this.LabirintoArray[pontoAtual.i + 2][pontoAtual.j] : {isVisited: true};
            let pontoEsquerda = this.LabirintoArray[pontoAtual.j - 2] ? this.LabirintoArray[pontoAtual.i][pontoAtual.j - 2] : {isVisited: true};

            let proximaMatriz = [];
            if (!pontoCima.isVisited) {
                proximaMatriz.push(pontoCima);
            }
            if (!pontoDireita.isVisited) {
                proximaMatriz.push(pontoDireita);
            }
            if (!pontoBaixo.isVisited) {
                proximaMatriz.push(pontoBaixo);
            }
            if (!pontoEsquerda.isVisited) {
                proximaMatriz.push(pontoEsquerda);
            }
            // coordenadas para gerar as paredes
            if (proximaMatriz.length !== 0) {
                let proximoPonto = proximaMatriz[this.random(proximaMatriz.length)];
                this.LabirintoArray[(proximoPonto.j + pontoAtual.j) / 2][(proximoPonto.i + pontoAtual.i) / 2].value = 1;
                proximoPonto.isVisited = true;
                pontosVisitados.push(proximoPonto);
                pontoAtual = proximoPonto;
            }
            else {
                // caso todas as matrizes ja foram visitadas
                pontoAtual = pontosVisitados[this.random(pontosVisitados.length)];
                if (!pontoAtual) {
                    // finaliza o loop da geração de paredes
                    break;
                }
                pontoAtual.isVisited = true;
                let tempArr = [];
                pontosVisitados.forEach(item => {
                    if (item !== pontoAtual) {
                        tempArr.push(item);
                    }
                });
                pontosVisitados = tempArr;
            }
        }

        this.LabirintoArray[this.start[0]][this.start[1]] = {
            i: this.start[0],
            j: this.start[1],
            value: 1
        };

        this.LabirintoArray[this.end[0]][this.end[1]] = {
            i: this.end[0],
            j: this.end[1],
            value: 1
        };
        
        // percorre por todos os pontos para criar as coordenadas a serem desenhadas
        let dadosLabirinto = [];
        for(let i =0; i<this.LabirintoArray.length; i++){
            let matriz = this.LabirintoArray[i];
            for(let j =0 ; j < matriz.length; j++){
                if(matriz[j].value){
                    dadosLabirinto.push({x:matriz[j].i, y:0, z:matriz[j].j});
                }
            }
        }
         
        return dadosLabirinto;
        // var dados = [
        //     {
        //         "x": 1,
        //         "y": 0,
        //         "z": 1 
        //     },
        //     {
        //         "x": 1,
        //         "y": 0,
        //         "z": 2
        //     },
        //     {
        //         "x": 1,
        //         "y": 0,
        //         "z": 3
        //     },
        //     {
        //         "x": 1,
        //         "y": 0,
        //         "z": 4
        //     },
        //     {
        //         "x": 1,
        //         "y": 0,
        //         "z": 5
        //     },
        //     {
        //         "x": 2,
        //         "y": 0,
        //         "z": 5
        //     },
        //     {
        //         "x": 3,
        //         "y": 0,
        //         "z": 1
        //     },
        //     {
        //         "x": 3,
        //         "y": 0,
        //         "z": 2
        //     },
        //     {
        //         "x": 3,
        //         "y": 0,
        //         "z": 3
        //     },
        //     {
        //         "x": 3,
        //         "y": 0,
        //         "z": 4
        //     },
        //     {
        //         "x": 3,
        //         "y": 0,
        //         "z": 5
        //     },
        //     {
        //         "x": 4,
        //         "y": 0,
        //         "z": 1
        //     },
        //     {
        //         "x": 4,
        //         "y": 0,
        //         "z": 3
        //     },
        //     {
        //         "x": 4,
        //         "y": 0,
        //         "z": 5
        //     },
        //     {
        //         "x": 5,
        //         "y": 0,
        //         "z": 1
        //     },
        //     {
        //         "x": 5,
        //         "y": 0,
        //         "z": 3
        //     },
        //     {
        //         "x": 5,
        //         "y": 0,
        //         "z": 5
        //     }
        // ]

        // return dados
    }
}