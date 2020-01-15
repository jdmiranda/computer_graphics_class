/***********
 * bandA.js
 * M. Laszlo
 * January 2020
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let currentMesh, currentMat, wireframeMat, geom;

let radius = 4;
let minAngle = 0.004;
let maxAngle = 0.2;
let bands = new THREE.Object3D();


function createScene() {
    currentMat = new THREE.MeshLambertMaterial({color: "blue", side: THREE.DoubleSide}); 
    wireframeMat = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, wireframeLinewidth: 1});
    updateBand();
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(bands);
}



function createSphericalBandGeometry(rad = 1, angle = Math.PI / 4, segments = 12, density = 20) {
    let h = 2 * angle / (density - 1);
    let points = [];
    for (let i = 0; i < density; i++) {
        let a = -angle + i * h;  // current angle
        let x = rad * Math.cos(a);
        let y = rad * Math.sin(a);
        let p = new THREE.Vector2(x, y);
        points.push(p);
    }
    return new THREE.LatheGeometry(points, segments);
}

var controls = new function() {
    this.angle = 0.2;
    this.segments = 20;
    this.density = 20;
    this.wireframe = false;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'angle', 0.01, 1.57).step(0.01).onChange(updateBand);
    gui.add(controls, 'segments', 3, 50).step(1).onChange(updateBand);
    gui.add(controls, 'density', 2, 50).step(1).onChange(updateBand);    
    gui.add(controls, 'wireframe').onChange(updateBand);
}

function updateBand() {
    if (currentMesh) {
        scene.remove(currentMesh);
        geom.dispose();
    }
    geom = createSphericalBandGeometry(radius, controls.angle, controls.segments, controls.density);
    if (geom) {
        currentMesh = new THREE.Object3D;
        currentMesh.add(new THREE.Mesh(geom, currentMat));
        if (controls.wireframe)
            currentMesh.add(new THREE.Mesh(geom, wireframeMat));
        scene.add(currentMesh);
    }
}



function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);
    renderer.setAnimationLoop( () => {
        renderer.render(scene, camera);
    });

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 1, 14);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}



init();
createScene();
initGui();
addToDOM();


