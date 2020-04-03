/***********
 * BandSphereAnimD.js
 * M. Laszlo
 * March 2020
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();
let bandSphere;



function createScene() {
    let bandArgs = {n: 60, minTheta: Math.PI/800, maxTheta: Math.PI/50, rad: 4, segments: 96, density: 10};
    let matArgs = {transparent: true, opacity: 0.7, color: getRandomColor()};
    bandArgs.material = new THREE.MeshLambertMaterial(matArgs);
    bandSphere = createBandedSphere(bandArgs);

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(bandSphere);
}

function createSphericalBandGeometry(rad = 1, theta = Math.PI / 4, segments = 12, density = 40) {
    // density is number of points
    // generate points
    let h = 2 * theta / (density - 1);
    let points = [];
    for (let i = 0; i < density; i++) {
        let a = -theta + i * h;  // current angle
        let x = rad * Math.cos(a);
        let y = rad * Math.sin(a);
        let p = new THREE.Vector2(x, y);
        points.push(p);
    }
    return new THREE.LatheGeometry(points, segments);
}




function createBandedSphere({
    n = 100,
    minTheta = 0.0001,
    maxTheta = Math.PI / 4,
    ...rest
}) {
    let root = new THREE.Object3D();
    let epsilon = rest.rad * 0.1;
    let lowerRad = rest.rad - epsilon;
    let h = (2 * epsilon) / n;
    let material = rest.material;
    for (let i = 0; i < n; i++) {
        rest.rad = lowerRad + i * h;
        rest.theta = getRandomFloat(minTheta, maxTheta);
        let mat = material.clone();
        mat.color = getRandomColor();
        rest.material = mat;
        let band = createSphericalBand(rest);
        // let theta = Math.random() * 2 * Math.PI;
        // let phi = Math.acos(2 * Math.random() - 1);
        // band.rotation.x = theta;
        band.rotation.x = 0;
        // band.rotation.z = phi;
        band.rotation.z = 0;
        root.add(band);
    }
    return root;
}

// see destructuring: 
// https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/


// we wish to pass material args instead and build the materials here!
function createSphericalBand({
    rad = 1,
    theta = Math.PI / 4,
    segments = 12,
    density = 40,
    material = new THREE.MeshBasicMaterial() 
}) {
    let geom = createSphericalBandGeometry(rad, theta, segments, density);
    let mat = material.clone();
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh(geom, mat);

}

function sequence(...fncs) {
    return function(delta) { fncs.forEach(g => g.call(this, delta)) };
}


function moveChildren(root, ...fncs) {
    let children = root.children;
    children.forEach(function (child, i, children) {
        let animFncs = fncs.map(g => g(child, i, children));
        child.update = sequence(...animFncs);
        subject.register(child);
    });
}

function makeArithRotator(indx, rpsA, rpsB, rps="rps") {
    let spin = makeSpin(indx, rps);
    return function(child, i) {
        child[rps] = rpsA + rpsB * i;
        return spin;
    }
}




function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
}

var controls = new function() {
    this.rpsA = 0.0;
    this.rpsB = 0.0;
    this.rpsZA = 0.0;
    this.rpsZB = 0.0;
    this.opacity = 0.7;
    this.Reset = reset;
}



function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'rpsA', -0.01, 0.01).step(0.001).listen().onChange(updateBands);
    gui.add(controls, 'rpsB', -0.001, 0.001).step(0.0002).listen().onChange(updateBands);
    gui.add(controls, 'rpsZA', -0.01, 0.01).step(0.001).listen().onChange(updateBands);
    gui.add(controls, 'rpsZB', -0.001, 0.001).step(0.0002).listen().onChange(updateBands);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1).onChange(updateOpacity);
    gui.add(controls, 'Reset');
}

function reset() {
    controls.rpsA = controls.rpsB = 0.0;
    controls.rpsZA = controls.rpsZB = 0.0;
    if (bandSphere) {
        bandSphere.children.forEach(function (band) {
            band.geometry.dispose();
        });
        scene.remove(bandSphere);
        bansSphere = null;
    }
    let bandArgs = {n: 60, minTheta: Math.PI/800, maxTheta: Math.PI/50, rad: 4, segments: 96, density: 10};
    let matArgs = {transparent: true, opacity: controls.opacity, color: getRandomColor()};
    bandArgs.material = new THREE.MeshLambertMaterial(matArgs);
    bandSphere = createBandedSphere(bandArgs);
    scene.add(bandSphere);
    updateBands();
}

function updateBands() {
    let rpsA = controls.rpsA;
    let rpsB = controls.rpsB;
    let rpsZA = controls.rpsZA;
    let rpsZB = controls.rpsZB;
    moveChildren(bandSphere, makeArithRotator(0, rpsA, rpsB), makeArithRotator(2, rpsZA, rpsZB, "rpsz"));
}

function updateOpacity() {
    let opacity = controls.opacity;
    bandSphere.children.forEach (function (c) {
        let mat = c.material;
        mat.opacity = opacity;
    })
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
        update();
        renderer.render(scene, camera);
    });

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 14);
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


