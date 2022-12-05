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

        let objBsp;
        let map = new THREE.TextureLoader().load(imagem);
        let materialSolid = new THREE.MeshLambertMaterial({map:map, side:THREE.DoubleSide});
        let materialTransparent = new THREE.MeshLambertMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } );
        let materials = [ materialSolid, materialTransparent, materialTransparent, materialTransparent, materialSolid, materialSolid ];
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
            that.end = new THREE.Mesh(new THREE.OctahedronGeometry( .3, 0 ), new THREE.MeshPhongMaterial({color:0xffb000}));
            cena.add(that.end);
        }

        that.end.position.set(end.x, end.y+0.3, end.z);
    }
}