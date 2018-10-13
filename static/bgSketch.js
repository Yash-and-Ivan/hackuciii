var xspacing = 10; // Distance between each horizontal location
var w; // Width of entire wave
var theta = 0.0; // Start angle at 0
var amplitude; // Height of wave
var period = 500.0; // How many pixels before the wave repeats
var dx; // Value for incrementing x
var yvalues; // Using an array to store height values for the wave
var v = 0;

var x, y = 0;

function setup() {
    colorMode(HSB);
    createCanvas(windowWidth, windowHeight);
    w = width+16;
    dx = (TWO_PI / period) * xspacing;
    yvalues = new Array(floor(w/xspacing));
    amplitude= Math.floor(Math.random() * ((2-1)+1) + 2);

    setInterval(function() {
        x += 0.01;
        y += 0.01;

        //amplitude = noise.simplex2(x, y)*100;
    }, 10);
    r = random(255);
    g = random(255);
    b = random(255);
}

function draw() {
background(0, 0, 255);
calcWave();
renderWave();
v += 0.5;
v = v % 255;
}

function calcWave() {
// Increment theta (try different values for
// 'angular velocity' here)
theta += 0.02;


// For every x value, calculate a y value with sine function
var x = theta;
    for (var i = 0; i < yvalues.length; i++) {
        yvalues[i] = (2*(i/yvalues.length))*sin(x)*amplitude*100*sin(2*x)*sin(x*5)*cos(x/2)^2;
        x+=dx;
    }
}

function renderWave() {
noStroke();
fill(v,255,255);
stroke(v, 255, 255);

// A simple way to draw the wave with an ellipse at each location
for (var x = 0; x < yvalues.length - 1; x++) {
  line(x*xspacing, height/2+(yvalues[x]*0.5), x*xspacing, height/2+(yvalues[x + 1]*0.5));
  stroke((v + 100) % 255, 255, 255);
  fill((v + 100) % 255, 255, 255);
  ellipse(x*xspacing, height/4+(yvalues[x]/4), 6, 6);
  ellipse(x*xspacing, 3*height/4+(yvalues[x]/4), 6, 6);
}
}
