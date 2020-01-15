/***********
 * cubeMatrix190B.js
 * M. Laszlo
 * September 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let mat, cubeMatrix, cubesPerSide, currentGeom;

function createCubeMatrix(geom, m, n, p, offset) {
    let root = new THREE.Object3D();
    offset = offset !== undefined ? offset : 2.0;
    // let geom = new THREE.CubeGeometry(1, 1, 1);
    mat = new THREE.MeshLambertMaterial({transparent: true})
    let xMin = -offset * ((m-1) / 2.0);
    let yMin = -offset * ((n-1) / 2.0);
    let zMin = -offset * ((p-1) / 2.0);
    for (let i = 0, x = xMin; i < m; i++, x += offset) {
        for (let j = 0, y = yMin; j < n; j++, y += offset) {
            for (let k = 0, z = zMin; k < p; k++, z += offset) {
                var box = new THREE.Mesh(geom, mat);
                box.position.set(x, y, z);
                root.add(box);
            }
        }
    }
    return root;
}

function createScene() {
    cubesPerSide = 11;
    let geom = new THREE.CubeGeometry(1, 1, 1);
    currentGeom = geom;
    cubeMatrix = createCubeMatrix(geom, cubesPerSide, cubesPerSide, cubesPerSide, 2.0);
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(cubeMatrix);
    scene.add(light);
    scene.add(ambientLight);
}

var controls = new function() {
    this.color = '#ff0000';
    this.opacity = 0.8;
    this.offset = 2.0;
    this.type = 'Cube';
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    mat.color = new THREE.Color(controls.color);
    mat.opacity = controls.opacity;
    renderer.render(scene, camera);
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
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initGui() {
    var gui = new dat.GUI();
    gui.addColor(controls, 'color');
    gui.add(controls, 'opacity', 0.0, 1.0).step(0.1);
    gui.add(controls, 'offset', 0.5, 20).onChange(updateMatrix);
    var objectTypes =  ['Cube', 'Sphere', 'Torus', 'Dodecahedron', 'Knot']
    gui.add(controls, 'type', objectTypes).onChange(updateObject);
}

function updateMatrix(offset) {
    if (cubeMatrix)
        scene.remove(cubeMatrix);
    cubeMatrix = createCubeMatrix(currentGeom, cubesPerSide, cubesPerSide, cubesPerSide, controls.offset);
    scene.add(cubeMatrix);
}

function updateObject(objectType) {
    let geom;     
    if (cubeMatrix)
        scene.remove(cubeMatrix);
    switch (objectType) {
        case 'Sphere':  geom = new THREE.SphereGeometry(0.5, 8, 8);
                        break;
        case 'Torus':   geom = new THREE.TorusGeometry(0.8, 0.25, 24, 36);
                        break;
        case 'Knot':    geom = new THREE.TorusKnotGeometry(0.8, 0.25, 45, 8, 3, 2);
                        break;
        case 'Cube': geom = new THREE.BoxGeometry(1, 1, 1);
                        break;
        case 'Dodecahedron': geom = new THREE.DodecahedronGeometry(1);
                        break;
    }
    currentGeom = geom;
    cubeMatrix = createCubeMatrix(geom, cubesPerSide, cubesPerSide, cubesPerSide, controls.offset);
    scene.add(cubeMatrix);
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
render();
animate();