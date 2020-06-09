import * as THREE from '../build/three.module.js';

let MyUtils = {

  getRandomInt : function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, 

  getRandomFloat : function (min, max) {
    return Math.random() * (max - min) + min;
  }, 

  getRandomPointOnSphere: function (rad) {
    rad = rad || 1.0;
    var theta = Math.random() * 2 * Math.PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var x = rad * Math.cos(theta) * Math.sin(phi);
    var y = rad * Math.sin(theta) * Math.sin(phi);
    var z = rad * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, 

  getRandomColor : function (minSaturation, minLightness, maxLightness) {
    minSaturation = minSaturation || 0.3;
    minLightness = minLightness || 0.0;
    maxLightness = maxLightness || 1.0;
    var hue = Math.random();
    var sat = this.getRandomFloat(minSaturation, 1.0);
    var lit = this.getRandomFloat(minLightness, maxLightness);
    return new THREE.Color().setHSL(hue, sat, lit);
  },

  rpsToRadians : function (rps, t) {
    return 2.0 * Math.PI * rps * t;
  }, 

  degreesToRadians : function (degrees) {
    return degrees * (Math.PI / 180);
  }, 

  makeSpin : function (indx, rps="rps") {
    return function (delta) {
        vec = this.rotation.toVector3();
        val = vec.getComponent(indx);
        val += this.rpsToRadians(this[rps], delta);
        val %= 2 * Math.PI;
        vec.setComponent(indx, val);
        this.rotation.setFromVector3(vec);
    }
  },

  mod : function (x, n) {
  return (x % n + n) % n;
  }, 

  Subject : class {
    constructor() {
        this.observers = new Set();
    }

    register(obs) {
        if (!this.observers.has(obs))
            this.observers.add(obs);
    }

    unregister(obs) {
        if (this.observers.has(obs))
            this.observers.delete(obs); 
    }

    notify(data) {
        this.observers.forEach(function (obs) {obs.update(data);});
    }

    // notify(data) {
    //     this.observers.forEach(obs => obs.update(data));
    // }


    has(obj) {
        return this.observers.has(obj);
    }
  }

};

export { MyUtils };


