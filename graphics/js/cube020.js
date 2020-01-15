/***********
 * cube020.js
 * A per-face cube
 * M. Laszlo
 * February 2018
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createCube() {
    let geom = new THREE.Geometry();
    let coords = [-1.0, 1.0];
    for (let x = 0; x < 2; x++)
        for (let y = 0; y < 2; y++)
            for (let z = 0; z < 2; z++)
                geom.vertices.push(new THREE.Vector3(coords[x], coords[y], coords[z]));
    let faces = [[0, 6, 4],  // back
                 [6, 0, 2],
                 [1, 7, 3],  // front
                 [7, 1, 5],
                 [5, 6, 7],  // right
                 [6, 5, 4],
                 [1, 2, 0],  // left
                 [2, 1, 3],
                 [2, 7, 6],  // top
                 [7, 2, 3],
                 [5, 0, 4],   // bottom
                 [0, 5, 1]
                ];
    for (let i = 0; i < 12; i++)
        geom.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));
    let colorNames = ["red", "green", "blue", "yellow", "cyan", "magenta"];
    let mats = colorNames.map(function(c) {return new THREE.MeshBasicMaterial({color: c});});
    for (let i = 0; i < 6; i++)
        for (let j = 0; j < 2; j++)
            geom.faces[2*i+j].materialIndex = i;
    let mesh = new THREE.Mesh(geom, mats);
    return mesh;
}


function createScene() {
    let mesh = createCube();
    scene.add(mesh);
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}


function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

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


function showGrids() {
    // Grid step size is 1; axes meet at (0,0,0)
    // Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
    // Coordinates.drawAllAxes({axisLength:11, axisRadius:0.05});
}


function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}


// try {
    init();
    showGrids();
    createScene();
    addToDOM();
    render();
    animate();
/*
} catch(e) {
    let errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
*/