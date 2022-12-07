import Labirinto from './labirinto.js';

// Adiciona na cena CubeoGeometry (blocos do labirinto)
export class Module {
    constructor(main){
        this.main = main;
        this.prim = new Labirinto();
        console.log("createModule");
    }

    update(data){
        let that = this;
        that.gerarParedes(data);
        that.gerarParticulas(data.particula);
        that.posicaoRespawn(data.respawnCamera);
  
    }

    // seta posições de respawn
    posicaoRespawn(respawnCamera){
        let that = this;
        let main = that.main;
        let controles = main.three.controles;

        controles.getObject().position.x = respawnCamera[0];
        controles.getObject().position.y = respawnCamera[1];
        controles.getObject().position.z = respawnCamera[2];
    }

    // gera paredes replicando uma imagem
    gerarParedes(data){
        let that = this;
        let main = that.main;
        let cena = main.three.cena;
        let relogio = main.three.relogio;

        let level = data.level+2;
        let matriz = this.prim.generate(level,level,[1,1],[(level)*2-1, (level)*2-1]);
        let imagem = data.imagem.textura;
        let imagemChao = data.imagemChao.textura;
        let imagemNotSun = data.imagemNotSun.textura;

        let objBsp;
        let map = new THREE.TextureLoader().load(imagem);
        let footer = new THREE.TextureLoader().load(imagemChao);
        let notSun = new THREE.TextureLoader().load(imagemNotSun);
        let materialSolid = new THREE.MeshLambertMaterial({map:map, side:THREE.DoubleSide});
        let materialTransparent = new THREE.MeshLambertMaterial( { color: 0xffffff, opacity: 0, transparent: true } );
        let materialFooter = new THREE.MeshLambertMaterial({map:footer, side:THREE.DoubleSide});
        let materialNotSun = new THREE.MeshLambertMaterial({map:notSun, side:THREE.DoubleSide});
        let materials = [ materialSolid, materialTransparent, materialFooter, materialNotSun ];
        
        that.atualizaCheckPoint({x:(level)*2-1, y:0, z:(level)*2-1});

        // se houver mesh, remover 
        if(that.mesh){
            that.mesh.geometry.dispose();
            cena.remove(that.mesh);
        }

        for(let i =0; i<matriz.length; i++){
            let position = matriz[i];
            let geometry = new THREE.CubeGeometry(1, 1, 1);
            let mesh;
            mesh = new THREE.Mesh(geometry, materialTransparent);
            mesh = new THREE.Mesh(geometry, materialSolid);
            
            mesh.position.set(position.x, position.y+0.5, position.z);
            //cena.add(mesh);

            let formasBsp = new ThreeBSP(mesh);

            if(i === 0){
                objBsp = formasBsp;
            }
            else{
                objBsp = objBsp.union(formasBsp);
            }
            
        }

        // obtem mesh processado pelo objeto bsp
        that.mesh = objBsp.toMesh();
        // atualiza as faces e vertices
        that.mesh.geometry.computeFaceNormals();
        that.mesh.geometry.computeVertexNormals();

        that.mesh.material = materials;
        that.mesh.name = "textura";
        let faces = that.mesh.geometry.faces;
        
        for(let i =0; i<faces.length; i++){
            // atribui para faces do teto, material transparente
            if(faces[i].vertexNormals[0].y == 1){
                faces[i].materialIndex = 1;
            }
            // atribui para faces do chao, material chão
            if(faces[i].vertexNormals[0].z == 0 && faces[i].vertexNormals[0].x == 0 && faces[i].vertexNormals[0].y == -1){
                faces[i].materialIndex = 2;
            }

            // atribui para onde o sol não incide, material com mais neve
            if(faces[i].vertexNormals[0].x == 1 && faces[i].vertexNormals[0].y == 0){
                faces[i].materialIndex = 3;
            }

            // atribui para faces do chao, material chão
            if(faces[i].vertexNormals[0].z == 1 ){
                faces[i].materialIndex = 3;
            }
        }
        cena.add(that.mesh);
        relogio.getDelta();
        document.getElementById("text").innerText = `${data.level}`;
    }

    gerarParticulas(){
    }

    // adiciona o objeto de checkpoint
    atualizaCheckPoint(end){
        let that = this;
        if(!this.end){
            let main = that.main;
            let cena = main.three.cena;
            that.end = new THREE.Mesh(new THREE.SphereGeometry( 0.25, 32, 32 ), new THREE.MeshPhongMaterial({color:0x8FA8DC}));
            cena.add(that.end);
        }

        that.end.position.set(end.x, end.y+0.3, end.z);
    }
}