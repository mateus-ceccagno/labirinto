"use strict";
import { Module } from './module.js';

class Main {

    constructor() {

        this.three = {
            renderer: new THREE.WebGLRenderer(),
            relogio: new THREE.Clock(),
            camera: new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 30000),
            cena: new THREE.Scene(),
            luminosidade: new THREE.PointLight(0xffffff),
            controles: null,
            translucido: document.getElementById('translucido'),
            instrucoes: document.getElementById('instrucoes'),
            textureSnow: THREE.ImageUtils.loadTexture( './../images/snowflake1.png' )
        };

        this.estado = {
            teclasLiberadas: false,
            paraFrente: false,
            paraTras: false,
            paraEsquerda: false,
            paraDireita: false,
            podePular: false,
            espacoPressionado: true, // resolve o problema da tecla espaço pressionada por longo tempo
            velocidade: new THREE.Vector3(),
            direcao: new THREE.Vector3(),
            rotacao: new THREE.Vector3(),
            count: 0
        };

        //ray casting
        this.ray = {
            upRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0, 0.3),
            eixoXRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 0.3),
            eixoYRaycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 0.3)
        };

        // linhas guias
        this.help = {
            cima: new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.1, 0x00ff00),
            horizontal: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.1, 0x00ffff),
            baixo: new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 0.1, 0xffff00),
            group: new THREE.Group()
        };

        this.configs = {
            velocidade: 35,
            aceleracao: 0,
        };

        this.dop = new Dop();

        this.desenhar();

    }

    renderizar() {
        let three = this.three;
        let renderer = three.renderer;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // não renderiza sombra
        document.body.appendChild(renderer.domElement);
    }

    propsCamera() {
        let three = this.three;
        let camera = three.camera;
        //camera.position.set(10, 0, 0.5);
    }

    propsCena() {
        let three = this.three;
        let cena = three.cena;
    }

    propsLuminosidade() {
        let three = this.three;
        let cena = three.cena;

        cena.add(new THREE.AmbientLight(0x444444));

        let luminosidade = three.luminosidade;
        luminosidade.position.set(50, 50, 50);

        cena.add(luminosidade);
    }

    sky() {
        let three = this.three;
        let cena = three.cena;
        
        let materialArray = [];
        let texture_ft = new THREE.TextureLoader().load('../images/haze_ft.jpg');
        let texture_bk = new THREE.TextureLoader().load('../images/haze_bk.jpg');
        let texture_up = new THREE.TextureLoader().load('../images/haze_up.jpg');
        let texture_dn = new THREE.TextureLoader().load('../images/haze_dn.jpg');
        let texture_rt = new THREE.TextureLoader().load('../images/haze_rt.jpg');
        let texture_lf = new THREE.TextureLoader().load('../images/haze_lf.jpg');

        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

        for (let i = 0; i < 6; i++) {
            materialArray[i].side = THREE.BackSide;
        }
        
        let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        let skybox = new THREE.Mesh(skyboxGeo, materialArray);

        cena.add(skybox);
    }

    rand( v ) {
		return (v * (Math.random() - 0.5));
	}

    snow() {
        let three = this.three;
        let cena = three.cena;
        let renderer = three.renderer;
        var 
		particleSystem,
		particleSystemHeight = 100.0,
		clock,
		controls,
		parameters,
		onParametersUpdate,
		texture = three.textureSnow;

		var numParticles = 10000,
			width = 100,
			height = particleSystemHeight,
			depth = 100,
			parameters = {
				color: 0xFFFFFF,
				height: particleSystemHeight,
				radiusX: 2.5,
				radiusZ: 2.5,
				size: 100,
				scale: 4.0,
				opacity: 0.4,
				speedH: 1.0,
				speedV: 1.0
			},
			systemGeometry = new THREE.Geometry(),
			systemMaterial = new THREE.ShaderMaterial({
				uniforms: {
					color:  { type: 'c', value: new THREE.Color( parameters.color ) },
					height: { type: 'f', value: parameters.height },
					elapsedTime: { type: 'f', value: 0 },
					radiusX: { type: 'f', value: parameters.radiusX },
					radiusZ: { type: 'f', value: parameters.radiusZ },
					size: { type: 'f', value: parameters.size },
					scale: { type: 'f', value: parameters.scale },
					opacity: { type: 'f', value: parameters.opacity },
					texture: { type: 't', value: texture },
					speedH: { type: 'f', value: parameters.speedH },
					speedV: { type: 'f', value: parameters.speedV }
				},
				vertexShader: document.getElementById( 'step07_vs' ).textContent,
				fragmentShader: document.getElementById( 'step09_fs' ).textContent,
				blending: THREE.AdditiveBlending,
				transparent: true,
				depthTest: false
			});
	 
		for( var i = 0; i < numParticles; i++ ) {
			var vertex = new THREE.Vector3(
                    width * (Math.random() - 0.5),
					Math.random() * height,
					depth * (Math.random() - 0.5)
				);

			systemGeometry.vertices.push( vertex );
		}

		particleSystem = new THREE.ParticleSystem( systemGeometry, systemMaterial );
		particleSystem.position.y = -height/2;

		cena.add( particleSystem );

		clock = new THREE.Clock();
        var elapsedTime = clock.getElapsedTime();

		particleSystem.material.uniforms.elapsedTime.value = elapsedTime * 10;
		document.body.appendChild( renderer.domElement );

		onParametersUpdate = function( v ) {
			systemMaterial.uniforms.color.value.set( parameters.color );
			systemMaterial.uniforms.height.value = parameters.height;
			systemMaterial.uniforms.radiusX.value = parameters.radiusX;
			systemMaterial.uniforms.radiusZ.value = parameters.radiusZ;
			systemMaterial.uniforms.size.value = parameters.size;
			systemMaterial.uniforms.scale.value = parameters.scale;
			systemMaterial.uniforms.opacity.value = parameters.opacity;
			systemMaterial.uniforms.speedH.value = parameters.speedH;
			systemMaterial.uniforms.speedV.value = parameters.speedV;
		}

		controls = new dat.GUI();
		controls.close();

		controls.addColor( parameters, 'color' ).onChange( onParametersUpdate );
		controls.add( parameters, 'height', 0, particleSystemHeight * 2.0 ).onChange( onParametersUpdate );
		controls.add( parameters, 'radiusX', 0, 10 ).onChange( onParametersUpdate );
		controls.add( parameters, 'radiusZ', 0, 10 ).onChange( onParametersUpdate );
		controls.add( parameters, 'size', 1, 400 ).onChange( onParametersUpdate );
		controls.add( parameters, 'scale', 1, 30 ).onChange( onParametersUpdate );
		controls.add( parameters, 'opacity', 0, 1 ).onChange( onParametersUpdate );
		controls.add( parameters, 'speedH', 0.1, 3 ).onChange( onParametersUpdate );
		controls.add( parameters, 'speedV', 0.1, 3 ).onChange( onParametersUpdate );
 
    }

    propsControles() {
        let that = this;
        let three = that.three;
        let cena = three.cena;
        let camera = three.camera;
        three.controles = new THREE.PointerLockControls(camera);
        let controles = three.controles;
        let estado = that.estado;
        let velocidade = estado.velocidade;
        let configs = that.configs;

        cena.add(controles.getObject());
        let onKeyDown = function (event) {
            switch (event.keyCode) {
                case 38: // cima
                case 87: // w
                    estado.paraFrente = true;
                    break;
                case 37: // esquerda
                case 65: // a
                    estado.paraEsquerda = true;
                    break;
                case 40: // baixo
                case 83: // s
                    estado.paraTras = true;
                    break;
                case 39: // direita
                case 68: // d
                    estado.paraDireita = true;
                    break;
                case 32: // tecla espaço
                    if (estado.podePular && estado.espacoPressionado) velocidade.y += configs.aceleracao;
                    estado.podePular = false;
                    estado.espacoPressionado = false;
                    break;
            }
        };

        let onKeyUp = function (event) {
            switch (event.keyCode) {
                case 38: // cima
                case 87: // w
                    estado.paraFrente = false;
                    break;
                case 37: // esquerda
                case 65: // a
                    estado.paraEsquerda = false;
                    break;
                case 40: // baixo
                case 83: // s
                    estado.paraTras = false;
                    break;
                case 39: // direita
                case 68: // d
                    estado.paraDireita = false;
                    break;
                case 32: // tecla espaço
                    estado.espacoPressionado = true;
                    break;
            }
        };
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
    }

    propsModule() {

        let that = this;
        let help = that.help;
        let group = that.help.group;

        //ferramenta aux
        let helper = new THREE.AxesHelper(50);
        //this.three.cena.add(helper);

        group.add(help.cima);
        group.add(help.horizontal);
        group.add(help.baixo);

        //that.three.cena.add(group);


        this.module = new Module(this);

    }

    propsPonteiro() {
        let that = this;
        let three = that.three;
        let estado = that.estado;
        let translucido = three.translucido;
        let instrucoes = three.instrucoes;

        // documentação sobre bloqueio de mouse: http://www.html5rocks.com/en/tutorials/pointerlock/intro/
        let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        if (havePointerLock) {
            var element = document.body;
            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                    estado.teclasLiberadas = true;
                    three.controles.enabled = true;
                    translucido.style.display = 'none';
                } else {
                    //estado.teclasLiberadas = false;
                    three.controles.enabled = false;
                    translucido.style.display = 'block';
                    instrucoes.style.display = '';
                }
            };
            var pointerlockerror = function (event) {
                instrucoes.style.display = '';
            };
            // ouvintes
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
            instrucoes.addEventListener('click', function (event) {
                instrucoes.style.display = 'none';
                // tela cheia
                // executaTelaCheia(renderer.domElement);
                // bloqueio do ponteiro
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            }, false);
        }
        else {
            instrucoes.innerHTML = 'Esse navegador não suporta essa funcionalidade.';
        }
    }

    controleDeTela() {
        let three = this.three;
        let camera = three.camera;
        let renderer = three.renderer;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    movimentacao() {
        let that = this;
        let three = that.three;
        let estado = that.estado;
        let camera = three.camera;
        let cena = three.cena;
        let renderer = three.renderer;
        let configs = that.configs;

        let module = that.module;

        let eixoXRaycaster = that.ray.eixoXRaycaster;
        let eixoYRaycaster = that.ray.eixoYRaycaster;

        let speed = configs.velocidade;

        let controle = three.controles.getObject();
        
        function renderiza() {
            let paraFrente = estado.paraFrente;
            let paraTras = estado.paraTras;
            let paraEsquerda = estado.paraEsquerda;
            let paraDireita = estado.paraDireita;
            let velocidade = estado.velocidade;
            let direcao = estado.direcao;
            let rotacao = estado.rotacao;
            that.snow();
            // obtem tempo de atualização
            let delta = three.relogio.getDelta();

            if (estado.teclasLiberadas) {
                velocidade.x -= velocidade.x * 30.0 * delta;
                velocidade.z -= velocidade.z * 30.0 * delta;
                velocidade.y -= 9.8 * 1.0 * delta;

                direcao.z = Number(paraFrente) - Number(paraTras);
                direcao.x = Number(paraEsquerda) - Number(paraDireita);
                // normalização
                direcao.normalize();

                rotacao.copy(controle.getWorldDirection().multiply(new THREE.Vector3(-1, 0, -1)));

                // direção do mouse
                let m = new THREE.Matrix4();
                if (direcao.z > 0) {
                    if (direcao.x > 0) {
                        m.makeRotationY(Math.PI / 4);
                    }
                    else if (direcao.x < 0) {
                        m.makeRotationY(-Math.PI / 4);
                    }
                    else {
                        m.makeRotationY(0);
                    }
                }
                else if (direcao.z < 0) {
                    if (direcao.x > 0) {
                        m.makeRotationY(Math.PI / 4 * 3);
                    }
                    else if (direcao.x < 0) {
                        m.makeRotationY(-Math.PI / 4 * 3);
                    }
                    else {
                        m.makeRotationY(Math.PI);
                    }
                }
                else {
                    if (direcao.x > 0) {
                        m.makeRotationY(Math.PI / 2);
                    }
                    else if (direcao.x < 0) {
                        m.makeRotationY(-Math.PI / 2);
                    }
                }

                // transformações
                rotacao.applyMatrix4(m);

                eixoXRaycaster.set(controle.position, rotacao);
                let horOnObject = false;

                // verifica se contato com as paredes
                if (module.mesh) {
                    let horizontalIntersections = eixoXRaycaster.intersectObject(module.mesh);
                    horOnObject = horizontalIntersections.length > 0;
                }

                // verifica se contato com checkpoint
                if (module.end) {
                    let section = eixoXRaycaster.intersectObject(module.end);
                    if (section.length > 0) {
                        that.dop.msg("Você está no caminho!");
                        that.data.level++;
                        module.update(that.data);
                    }
                }

                // posicionamento no respawn
                if (!horOnObject) {
                    if (paraFrente || paraTras) velocidade.z -= direcao.z * speed * delta;
                    if (paraEsquerda || paraDireita) velocidade.x -= direcao.x * speed * delta;
                }

                // posicao camera
                eixoYRaycaster.ray.origin.copy(controle.position);
                eixoYRaycaster.ray.origin.y -= 0.1;
                let intersections = eixoYRaycaster.intersectObjects(cena.children, true);
                let onObject = intersections.length > 0;
                if (onObject === true) {
                    velocidade.y = Math.max(0, velocidade.y);
                    estado.podePular = true;
                }

                if(that.data != undefined){
                    if(that.data.level === 3) {
                        that.snow();
                        velocidade.x = 20;
                        velocidade.y = 20;
                        velocidade.z = 20;
                        that.estado.count++;
                    }
                    if(that.estado.count > 200){
                        velocidade.x = 2000;
                        velocidade.y = 2000;
                        velocidade.z = 2000;
                        that.estado.count++;
                    }
                    if(that.estado.count > 500){
                        window.location.reload(true);
                    }
                }

                controle.translateX(velocidade.x * delta);
                controle.translateY(velocidade.y * delta);
                controle.translateZ(velocidade.z * delta);

                // controla eixo y > 10
                if (controle.position.y < 0.1) {
                    velocidade.y = 0;
                    controle.position.y = 0.1;
                    estado.podePular = true;
                }
            }
        }



        renderiza();

        renderer.render(cena, camera);
        
        cena.children.forEach(child => {
            if(child.type == 'Points')
                cena.remove(child);
        });

        requestAnimationFrame(function () {
            that.movimentacao();
        });
        //renderer.clear();
    }

    desenhar() {
        let that = this;
        // verifica compatibilidade
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        that.propsPonteiro();
        that.renderizar();
        that.propsCena();
        that.propsCamera();
        that.propsLuminosidade();
        that.propsControles();
        that.propsModule();
        that.sky();
        
        that.updateModule("./index.json");

        that.movimentacao();
        window.onresize = function () {
            that.controleDeTela();
        };
    }

    executaTelaCheia(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // Troca de cena
    updateModule(url) {
        let dop = this.dop;
        let module = this.module;
        var that = this;
        dop.get(url, function (data) {
            that.data = JSON.parse(data);
            module.update(that.data);
        });
    }

}

new Main();

