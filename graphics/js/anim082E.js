/***********
 * anim082E.js
 * Rotating, revolving box around z-axis
 *
 * M. Laszlo
 * September 2019
 ***********/


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


function createScene() {
    let boxRoot = makeRotatingRevolvingBox();
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(0, 0, 10);
    let ambientLight = new THREE.AmbientLight(0x222222);
    let axes = new THREE.AxesHelper(10);
    scene.add(light);
    scene.add(ambientLight);
    scene.add(boxRoot);    
    scene.add(axes);
    scene.add(disk());
}

function disk() {
    let circleMat = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.4});
    circleMat.side = THREE.DoubleSide;
    let circleGeom = new THREE.CircleGeometry(4, 48);
    return new THREE.Mesh(circleGeom, circleMat);
}





let subject = new Subject();

function makeRotatingRevolvingBox() {
    let geom = new THREE.CubeGeometry(4, 1, 1);
    let mat = new THREE.MeshLambertMaterial({color: 'blue'});
    let box = new THREE.Mesh(geom, mat);
    box.position.x = 4;
    box.rps = 0.5; // rotation every 2 seconds
    box.update = spinZ;  // make box an observer
    subject.register(box);
    let boxRoot = new THREE.Object3D();
    boxRoot.rps = 0.1; // revolution every 10 seconds
    boxRoot.update = spinZ; // make boxRoot an observer
    subject.register(boxRoot);
    boxRoot.add(box);
    return boxRoot;
}

function spinZ(delta) {
    this.rotation.z += rpsToRadians(this.rps, delta);
    this.rotation.z %= 2 * Math.PI;
}


// function makeSpin(indx) {
//     return function (delta) {
//         vec = this.rotation.toVector3();
//         val = vec.getComponent(indx);
//         val += rpsToRadians(this.rps, delta);
//         val %= 2 * Math.PI;
//         vec.setComponent(indx, val);
//         this.rotation.setFromVector3(vec);
//     }
// }

// let spinZ = makeSpin(2);


function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
}




function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x0, 1.0);
    renderer.setAnimationLoop(function () {
        update();
        renderer.render(scene, camera);
    });

    camera = new THREE.PerspectiveCamera(40, canvasWidth/canvasHeight, 1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}




function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}



init();
createScene();
addToDOM();


