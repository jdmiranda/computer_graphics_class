/***********
 * cube020.js
 * A per-face cube
 * M. Laszlo
 * February 2018
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var currentMesh;

function createCube(isOpen, twoSided) {
    var geom = new THREE.Geometry();
    var coords = [-1.0, 1.0];
    for (var x = 0; x < 2; x++)
        for (var y = 0; y < 2; y++)
            for (var z = 0; z < 2; z++)
                geom.vertices.push(new THREE.Vector3(coords[x], coords[y], coords[z]));
    var faces = [[0, 6, 4],  // back
                 [6, 0, 2],
                 [1, 7, 3],  // front
                 [7, 1, 5],
                 [5, 6, 7],  // right
                 [6, 5, 4],
                 [1, 2, 0],  // left
                 [2, 1, 3],
                 [5, 0, 4],   // bottom
                 [0, 5, 1],
                 [2, 7, 6],  // top
                 [7, 2, 3]
                ];
    var n = isOpen ? 10 : 12;
    for (var i = 0; i < n; i++)
        geom.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));
    var sided = twoSided ? THREE.DoubleSide : THREE.FrontSide;
    var mats = ["red", "green", "blue", "yellow", "cyan", "magenta"].map(
        function(colorname) {return new THREE.MeshBasicMaterial({color: colorname, side: sided});});
    for (var i = 0; i < (n/2); i++)
        for (var j = 0; j < 2; j++)
            geom.faces[2*i+j].materialIndex = i;
    var mesh = new THREE.Mesh(geom, mats);
    return mesh;
}


function createScene() {
    currentMesh = createCube(false, true);
    scene.add(currentMesh);
}

// GUI
controls = new function() {
    this.open = false;
    this.twoSided = true;
}

function initGui() {
    gui = new dat.GUI();
    var isOpen = gui.add(controls, 'open');
    isOpen.onChange(updateObject);
    var twoSided = gui.add(controls, 'twoSided');
    twoSided.onChange(updateObject);
}

function updateObject(val) {   
    if (currentMesh) {
        scene.remove(currentMesh);
    }
    console.log(controls.open);
    console.log(controls.twoSided);
    currentMesh = createCube(controls.open, controls.twoSided);
    if (currentMesh) {
        scene.add(currentMesh);
    }
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}


function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 10);
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
render();
animate();
