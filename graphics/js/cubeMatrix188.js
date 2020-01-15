/***********
 * cubeMatrix188.js
 * M. Laszlo
 * September 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let mat, cubeMatrix, cubesPerSide;

function createCubeMatrix(m, n, p, offset) {
    let root = new THREE.Object3D();
    offset = offset !== undefined ? offset : 2.0;
    let geom = new THREE.CubeGeometry(1, 1, 1);
    mat = new THREE.MeshLambertMaterial({transparent: true})
    let xMin = -offset * ((m-1) / 2.0);
    let yMin = -offset * ((n-1) / 2.0);
    for (let i = 0, x = xMin; i < m; i++, x += offset) {
        for (let j = 0, y = yMin; j < n; j++, y += offset) {
            var box = new THREE.Mesh(geom, mat);
            box.position.set(x, y, 0);
            root.add(box);
        }
    }
    return root;
}

function createScene() {
    cubesPerSide = 11;
    cubeMatrix = createCubeMatrix(cubesPerSide, cubesPerSide, cubesPerSide);
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
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initGui() {
    var gui = new dat.GUI();
    gui.addColor(controls, 'color');
    gui.add(controls, 'opacity', 0.0, 1.0).step(0.1);
    gui.add(controls, 'offset', 0.5, 20).onChange(updateMatrix);
}

function updateMatrix(offset) {
    if (cubeMatrix)
        scene.remove(cubeMatrix);
    cubeMatrix = createCubeMatrix(cubesPerSide, cubesPerSide, cubesPerSide, offset);
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