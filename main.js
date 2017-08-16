var scene, camera, renderer, container, element;
var controls;
var clock = new THREE.Clock();
var ambientLight;
var keyboard = {};
var player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02, canShoot: 0 };
var USE_WIREFRAME = false;
var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(0.5,0.5,0.5),
        new THREE.MeshBasicMaterial({color: 0x4444ff})
    )
};
var loadingManager = null;
var RESOURCES_LOADED = false;
//Models index
var models = {
    spaceinv01: {
        obj:"models/Space_Invader_01.obj",
        mtl:"models/Space_Invader_01.mtl",
        mesh: null
    },
    spaceinv02: {
        obj:"models/Space_Invader_02.obj",
        mtl:"models/Space_Invader_02.mtl",
        mesh: null
    },
    spaceinv03: {
        obj:"models/Space_Invader_03.obj",
        mtl:"models/Space_Invader_03.mtl",
        mesh: null
    }
};
//Meshes index
var meshes = {};
//Bullets array
var bullets = []; var bullet;
function init() {
    //INITIALIZATION
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    element = renderer.domElement;
    container = document.getElementById('example');
    container.appendChild(element);
    effect = new THREE.StereoEffect(renderer);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
    camera.position.set(0,player.height,-34);
    camera.lookAt(new THREE.Vector3(0,player.height,0));
    scene.add(camera);
    //VR/ORIENTATION CONTROLS
    function setOrientationControls(e) {
        if(!e.alpha) {
            return;
        }
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();
        element.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);
    //LOADING SCREEN
    loadingScreen.box.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
        console.log(item, loaded, total);
    }
    loadingManager.onLoad = function() {
        console.log("All resources loaded");
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    }
    //LIGHTING
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    //COVER
    var geometry = new THREE.BoxGeometry( 7, 2, 5 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cov1 = new THREE.Mesh( geometry, material );
    cov1.position.set(27,player.height,-27);
    scene.add( cov1 );
    var cov2 = new THREE.Mesh( geometry, material );
    cov2.position.set(7,player.height,-27);
    scene.add( cov2 );
    var cov3 = new THREE.Mesh( geometry, material );
    cov3.position.set(-13,player.height,-27);
    scene.add( cov3 );
    var cov4 = new THREE.Mesh( geometry, material );
    cov4.position.set(-33,player.height,-27);
    scene.add( cov4 );

    //Load models dynamically
    for(var _key in models) {
    	(function(key){
    		var mtlLoader = new THREE.MTLLoader(loadingManager);
    		mtlLoader.load(models[key].mtl, function(materials){
    			materials.preload();
                var objLoader = new THREE.OBJLoader(loadingManager);
                objLoader.setMaterials(materials);
    			objLoader.load(models[key].obj, function(mesh){
                    mesh.traverse(function(node){
                        if( node instanceof THREE.Mesh ){
                            if('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;

                            if('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;
    			});
    		});
    	})(_key);
    }
    resize();
    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
    animate();
}
function resize(){
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}
//Runs when all resources are loaded
function onResourcesLoaded(){
    //INVADER ROW 3
    meshes["inv0101"] = models.spaceinv01.mesh.clone();
    meshes["inv0102"] = models.spaceinv01.mesh.clone();
    meshes["inv0103"] = models.spaceinv01.mesh.clone();
    meshes["inv0104"] = models.spaceinv01.mesh.clone();
    meshes["inv0105"] = models.spaceinv01.mesh.clone();
    meshes["inv0106"] = models.spaceinv01.mesh.clone();
    meshes["inv0107"] = models.spaceinv01.mesh.clone();
    meshes["inv0108"] = models.spaceinv01.mesh.clone();
    // Reposition individual meshes, then add meshes to scene
    meshes["inv0101"].position.set(-29, 1, 3);
    meshes["inv0101"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0101"]);
    meshes["inv0102"].position.set(-22, 1, 3);
    meshes["inv0102"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0102"]);
    meshes["inv0103"].position.set(-15, 1, 3);
    meshes["inv0103"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0103"]);
    meshes["inv0104"].position.set(-8, 1, 3);
    meshes["inv0104"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0104"]);
    meshes["inv0105"].position.set(-1, 1, 3);
    meshes["inv0105"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0105"]);
    meshes["inv0106"].position.set(6, 1, 3);
    meshes["inv0106"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0106"]);
    meshes["inv0107"].position.set(13, 1, 3);
    meshes["inv0107"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0107"]);
    meshes["inv0108"].position.set(21, 1, 3);
    meshes["inv0108"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0108"]);
    //INVADER ROW 2
    meshes["inv0201"] = models.spaceinv02.mesh.clone();
    meshes["inv0202"] = models.spaceinv02.mesh.clone();
    meshes["inv0203"] = models.spaceinv02.mesh.clone();
    meshes["inv0204"] = models.spaceinv02.mesh.clone();
    meshes["inv0205"] = models.spaceinv02.mesh.clone();
    meshes["inv0206"] = models.spaceinv02.mesh.clone();
    meshes["inv0207"] = models.spaceinv02.mesh.clone();
    meshes["inv0208"] = models.spaceinv02.mesh.clone();
    // Reposition individual meshes, then add meshes to scene
    meshes["inv0201"].position.set(-29, 0.085, -4);
    meshes["inv0201"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0201"]);
    meshes["inv0202"].position.set(-22, 0.085, -4);
    meshes["inv0202"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0202"]);
    meshes["inv0203"].position.set(-15, 0.085, -4);
    meshes["inv0203"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0203"]);
    meshes["inv0204"].position.set(-8, 0.085, -4);
    meshes["inv0204"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0204"]);
    meshes["inv0205"].position.set(-1, 0.085, -4);
    meshes["inv0205"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0205"]);
    meshes["inv0206"].position.set(6, 0.085, -4);
    meshes["inv0206"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0206"]);
    meshes["inv0207"].position.set(13, 0.085, -4);
    meshes["inv0207"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0207"]);
    meshes["inv0208"].position.set(21, 0.085, -4);
    meshes["inv0208"].scale.set(0.04,0.04,0.04);
    scene.add(meshes["inv0208"]);
    //INVADER ROW 3
    meshes["inv0301"] = models.spaceinv03.mesh.clone();
    meshes["inv0302"] = models.spaceinv03.mesh.clone();
    meshes["inv0303"] = models.spaceinv03.mesh.clone();
    meshes["inv0304"] = models.spaceinv03.mesh.clone();
    meshes["inv0305"] = models.spaceinv03.mesh.clone();
    meshes["inv0306"] = models.spaceinv03.mesh.clone();
    meshes["inv0307"] = models.spaceinv03.mesh.clone();
    meshes["inv0308"] = models.spaceinv03.mesh.clone();
    meshes["inv0309"] = models.spaceinv03.mesh.clone();
    // Reposition individual meshes, then add meshes to scene
    meshes["inv0301"].position.set(-29, 0.075, -11);
    meshes["inv0301"].scale.set(0.06,0.06,0.06);
    scene.add(meshes["inv0301"]);
    meshes["inv0302"].position.set(-22, 0.075, -11);
    meshes["inv0302"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0302"]);
    meshes["inv0303"].position.set(-15, 0.075, -11);
    meshes["inv0303"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0303"]);
    meshes["inv0304"].position.set(-8, 0.075, -11);
    meshes["inv0304"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0304"]);
    meshes["inv0305"].position.set(-1, 0.075, -11);
    meshes["inv0305"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0305"]);
    meshes["inv0306"].position.set(6, 0.075, -11);
    meshes["inv0306"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0306"]);
    meshes["inv0307"].position.set(13, 0.075, -11);
    meshes["inv0307"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0307"]);
    meshes["inv0308"].position.set(21, 0.075, -11);
    meshes["inv0308"].scale.set(0.03,0.03,0.03);
    scene.add(meshes["inv0308"]);
}
function animate() {
    if(RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);
        loadingScreen.box.position.x -= 0.05;
        if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }
    //INVADER ROW 1 - MOVEMENT
    meshes["inv0101"].position.x -= 0.15;
    if( meshes["inv0101"].position.x < -31.9 ) meshes["inv0101"].position.x = 25.39;
    meshes["inv0101"].position.y = Math.sin(meshes["inv0101"].position.x);
    meshes["inv0102"].position.x -= 0.15;
    if( meshes["inv0102"].position.x < -31.9 ) meshes["inv0102"].position.x = 25.39;
    meshes["inv0102"].position.y = Math.sin(meshes["inv0102"].position.x);
    meshes["inv0103"].position.x -= 0.15;
    if( meshes["inv0103"].position.x < -31.9 ) meshes["inv0103"].position.x = 25.39;
    meshes["inv0103"].position.y = Math.sin(meshes["inv0103"].position.x);
    meshes["inv0104"].position.x -= 0.15;
    if( meshes["inv0104"].position.x < -31.9 ) meshes["inv0104"].position.x = 25.39;
    meshes["inv0104"].position.y = Math.sin(meshes["inv0104"].position.x);
    meshes["inv0105"].position.x -= 0.15;
    if( meshes["inv0105"].position.x < -31.9 ) meshes["inv0105"].position.x = 25.39;
    meshes["inv0105"].position.y = Math.sin(meshes["inv0105"].position.x);
    meshes["inv0106"].position.x -= 0.15;
    if( meshes["inv0106"].position.x < -31.9 ) meshes["inv0106"].position.x = 25.39;
    meshes["inv0106"].position.y = Math.sin(meshes["inv0106"].position.x);
    meshes["inv0107"].position.x -= 0.15;
    if( meshes["inv0107"].position.x < -31.9 ) meshes["inv0107"].position.x = 25.39;
    meshes["inv0107"].position.y = Math.sin(meshes["inv0107"].position.x);
    meshes["inv0108"].position.x -= 0.15;
    if( meshes["inv0108"].position.x < -31.9 ) meshes["inv0108"].position.x = 25.39;
    meshes["inv0108"].position.y = Math.sin(meshes["inv0108"].position.x);
    //INVADER ROW 2 - MOVEMENT
    meshes["inv0201"].position.x += 0.15;
    if( meshes["inv0201"].position.x > 25.39 ) meshes["inv0201"].position.x = -31.9;
    meshes["inv0201"].position.y = Math.sin(meshes["inv0201"].position.x);
    meshes["inv0202"].position.x += 0.15;
    if( meshes["inv0202"].position.x > 25.39 ) meshes["inv0202"].position.x = -31.9;
    meshes["inv0202"].position.y = Math.sin(meshes["inv0202"].position.x);
    meshes["inv0203"].position.x += 0.15;
    if( meshes["inv0203"].position.x > 25.39 ) meshes["inv0203"].position.x = -31.9;
    meshes["inv0203"].position.y = Math.sin(meshes["inv0203"].position.x);
    meshes["inv0204"].position.x += 0.15;
    if( meshes["inv0204"].position.x > 25.39 ) meshes["inv0204"].position.x = -31.9;
    meshes["inv0204"].position.y = Math.sin(meshes["inv0204"].position.x);
    meshes["inv0205"].position.x += 0.15;
    if( meshes["inv0205"].position.x > 25.39 ) meshes["inv0205"].position.x = -31.9;
    meshes["inv0205"].position.y = Math.sin(meshes["inv0205"].position.x);
    meshes["inv0206"].position.x += 0.15;
    if( meshes["inv0206"].position.x > 25.39 ) meshes["inv0206"].position.x = -31.9;
    meshes["inv0206"].position.y = Math.sin(meshes["inv0206"].position.x);
    meshes["inv0207"].position.x += 0.15;
    if( meshes["inv0207"].position.x > 25.39 ) meshes["inv0207"].position.x = -31.9;
    meshes["inv0207"].position.y = Math.sin(meshes["inv0207"].position.x);
    meshes["inv0208"].position.x += 0.15;
    if( meshes["inv0208"].position.x > 25.39 ) meshes["inv0208"].position.x = -31.9;
    meshes["inv0208"].position.y = Math.sin(meshes["inv0208"].position.x);
    //INVADER ROW 3 - MOVEMENT
    meshes["inv0301"].position.x -= 0.15;
    if( meshes["inv0301"].position.x < -31.9 ) meshes["inv0301"].position.x = 25.39;
    meshes["inv0301"].position.y = Math.sin(meshes["inv0301"].position.x);
    meshes["inv0302"].position.x -= 0.15;
    if( meshes["inv0302"].position.x < -31.9 ) meshes["inv0302"].position.x = 25.39;
    meshes["inv0302"].position.y = Math.sin(meshes["inv0302"].position.x);
    meshes["inv0303"].position.x -= 0.15;
    if( meshes["inv0303"].position.x < -31.9 ) meshes["inv0303"].position.x = 25.39;
    meshes["inv0303"].position.y = Math.sin(meshes["inv0303"].position.x);
    meshes["inv0304"].position.x -= 0.15;
    if( meshes["inv0304"].position.x < -31.9 ) meshes["inv0304"].position.x = 25.39;
    meshes["inv0304"].position.y = Math.sin(meshes["inv0304"].position.x);
    meshes["inv0305"].position.x -= 0.15;
    if( meshes["inv0305"].position.x < -31.9 ) meshes["inv0305"].position.x = 25.39;
    meshes["inv0305"].position.y = Math.sin(meshes["inv0305"].position.x);
    meshes["inv0306"].position.x -= 0.15;
    if( meshes["inv0306"].position.x < -31.9 ) meshes["inv0306"].position.x = 25.39;
    meshes["inv0306"].position.y = Math.sin(meshes["inv0306"].position.x);
    meshes["inv0307"].position.x -= 0.15;
    if( meshes["inv0307"].position.x < -31.9 ) meshes["inv0307"].position.x = 25.39;
    meshes["inv0307"].position.y = Math.sin(meshes["inv0307"].position.x);
    meshes["inv0308"].position.x -= 0.15;
    if( meshes["inv0308"].position.x < -31.9 ) meshes["inv0308"].position.x = 25.39;
    meshes["inv0308"].position.y = Math.sin(meshes["inv0308"].position.x);

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta();

    for(var index=0; index<bullets.length; index+=1){
		if( bullets[index] === undefined ) continue;
		if( bullets[index].alive == false ){
            bullets.splice(index,1);
			continue;
		}
		bullets[index].position.add(bullets[index].velocity);
	}
    if(keyboard[65]){ //A key
        if(camera.position.x <= 25.39) {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
        }
    }
    if(keyboard[68]){ //D key
        if(camera.position.x >= -31.9){
            camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
        }
    }
    //BULLET CODE
    element.onclick = function(e){
        if(player.canShoot <= 9){
            bullet = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({color: 0xffffff})
            );
            bullet.position.set(
                camera.position.x,
                camera.position.y,
                camera.position.z
            );
            bullet.velocity = new THREE.Vector3(
                -Math.sin(camera.rotation.y), 0,
                -Math.cos(camera.rotation.y)
            );
            bullet.alive = true;
            setTimeout(function() {
                bullet.alive = false;
                scene.remove(bullet);
            }, 1000);
            bullets.push(bullet);
            scene.add(bullet);
            player.canShoot = 30;
        }
    }
    if(player.canShoot > 0) {player.canShoot -= 1;}
    requestAnimationFrame(animate);
    update(delta);
    render(delta);
}
function keyDown(e){
    keyboard[e.keyCode] = true;
}
function keyUp(e){
    keyboard[e.keyCode] = false;
}
function update(dt){
    resize();
    camera.updateProjectionMatrix();
    controls.update(dt);
}
function render(dt){
    effect.render(scene, camera);
}
function fullscreen() {
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen){
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen){
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen){
        container.webkitRequestFullscreen();
    }
}
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;