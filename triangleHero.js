/*
Triangle hero interactive section for a landing page.

Project goal is to pick up on javascript, learn to use github version
control effectively, learn to create a responsive website
part from scratch (meaning pure JS).

Start date: 2021/01/26
End date: In progress

Expected features:
 [ ] Displayed in a hexagonal pattern and not square
 [X] Have margins on all sides
 [X] Adapt triangle size based on the density value
 [X] Disappear if clicked as a ripple
 [ ] Disappear/reapper on scroll
 [ ] Responsive to mouse hovering effects
 [ ] Display a picture or a video with value customization

 Expected triangle settings:
 [X] Stroke thickness
 [X] Target stroke thickness
 [X] Opacity
 [X] Corner radius

 */

 //CONSTANTS

const elementId = "canvas1";

//The variable that determines how dense the triangle hero section will be
//NOTE(justas): Not used yet and instead relying on canvas dimensions and sidelength to determine the density
const triangleDensity = 20; 

//The padding around the hero section in px.
const paddingTop = 0;
const paddingBottom = 0;
const paddingLeft = 0;
const paddingRight = 0; //TODO convert into a struct istead

//The speed at which the triangles will reach their target thickness
//NOTE(justas): The bigger the value, the less accurate triangle
//thickness is going to be.
const refreshSpeed = 0.5;
const rippleSpeed = 20; //The speed at which the ripples move away from their source in px

const defaultTargetThickness = 2; //The default target thickness for all triangles in px
const defaultTriangleColor = "#555555"; //The default color for triangles.
const borderRadius = 5; //triangle border radius
const inset = 5; //The inset/padding for each triangle in px

//VARIABLES
var canvas = document.getElementById(elementId);
var ctx = canvas.getContext("2d");

var triangleMatrix; //The triangle matrix, as a one dimensional array
var ripples; //The ripple array

var xT; //Triangle amount in x axis
var yT; //Triangle amount in y axis
var sideLength; //The length of each side of the triangles

//Mouse data
var mouse = {
    x: -500, //NOTE(justas): the negative values are to prevent
    y: -500, // a fallback to the top right corner. Find out if
             // it can be done otherwise.
}

//The maximum distance between any two points on the canvas
//used to ensure good performance
const maximumDistance = Math.sqrt((screen.width*screen.width)+(screen.height*screen.height));

class Ripple {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.radius = 0;
    }

    //returns whether a triangle within the radius of this ripple
    inRange(triangle){
        //Accounting for the triangle coordinates
        // being at the edge of the triangle and centering them
        let tX = triangle.x + (sideLength/2);
        let tY = triangle.y + (sideLength*Math.sqrt(3)/6);

        return (this.radius >= Math.sqrt((tX - this.x)*(tX - this.x) + (tY - this.y)*(tY - this.y)));
    }

    update(){
        if(this.radius < maximumDistance){
            this.radius += rippleSpeed;
        }
        else{
            ripples.pop(this); //Delete the ripple if it is irrelevant
            //TODO(justas): Destruct this instance here to increase performance.
        }
    }
}


//The triangle class
class Triangle {
    constructor(x, y, thickness, targetThickness, opacity, color){
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.targetThickness = targetThickness;
        this.opacity = opacity;
        this.color = color;
    }

    //Drawing the triangle on the canvas, takes an index in the matrix array
    render(i){

        //tr = translated coordinates in the triangle Matrix
        let trX = i % xT;
        let trY = i / xT;

        console.log("drawing the " + i + "th triangle. [" + trX + ";" + trY + "]");

        let path = new Path2D();

        //NOTE(justas): Switch the === for a != if you want to inverse the triangle orientations
        if((trY*xT)%2 * trX%2 === 0){ //draw flipped (pointing up)
            path.moveTo(this.x + (3/Math.sqrt(3)*inset), 0);
        }
        else{ //draw unflipped (pointing down)
            path.moveTo(this.x + Math.sqrt(3)*borderRadius + (3/Math.sqrt(3)*inset), this.y + inset);

            path.arcTo( this.x + sideLength - (3/Math.sqrt(3)*inset), this.y + inset,
                        this.x + sideLength - (3/Math.sqrt(3)*inset) - borderRadius, this.y + inset + 2*Math.sqrt(3)*borderRadius,
                        borderRadius);
            path.arcTo( this.x + sideLength/2, this.y + Math.sqrt(3)*sideLength - 2*inset,
                        this.x + sideLength/2 - borderRadius, this.y + Math.sqrt(3)*sideLength - 2*inset - 2*Math.sqrt(3)*borderRadius,
                        borderRadius);
            path.arcTo( this.x + (3/Math.sqrt(3)*inset), this.y + inset,
                        this.x + Math.sqrt(3)*borderRadius + (3/Math.sqrt(3)*inset), this.y + inset,
                        borderRadius);
        }

        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
        ctx.stroke(path);
    }

    update(){
        //Iterating trough every ripple and making the triangles disappear
        ripples.forEach(function(r) {
            if(r.inRange(this)){
                this.targetThickness = 0.001; //TODO(justas): A super small value or just 0?
            }
        });

        //TODO(justas): Update the opacity(or just the thickness?)
        // based on the scrolled position.

        //Updating the true stroke thickness values 
        if(this.thickness > this.targetThickness){
            this.thickness -= refreshSpeed;
        }
        else{
            this.thickness += refreshSpeed;
        }
    }
}

//FUNCTIONS

window.addEventListener('mousemove',
    function(event){
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;

        //NOTE(justas): This is to only catch mouse moves
        // while on the actual hero section.
        if(event.target.id != elementId){
            mouse.x = -500;
            mouse.y = -500;
        }
    }
);

window.addEventListener('mousedown',
    function(event){
        //NOTE(justas): Only capture clicks on the hero
        if(event.target.id === elementId){
            ripples.push(new Ripple(event.offsetX, event.offsetY));
        }
    }
);

function init(){
    triangleMatrix = [];
    ripples = [];

    //Initializing the canvas width and height
    canvas.width = screen.width - paddingLeft - paddingRight;
    canvas.height = screen.height - paddingTop - paddingBottom;

    console.log(canvas.width + "x" + canvas.height); //Logging

    sideLength = 40;//canvas.width*canvas.width / 600; // numOfPixelsOnCanvas / numOfTriangles

    xT = Math.floor(canvas.width/(sideLength/2));
    yt = 5;

    for(let i = 0; i < yT; i++){
        for(let j = 0; j < xT; j++){
            let x = j * (sideLength/2) + paddingLeft;
            let y = i * (sideLength*Math.sqrt(3)/2) + paddingTop;

            //TODO(justas): Perhaps make use of the construction with a different thickness value
            // to achieve a beautiful booting up animation?
            triangleMatrix.push(new Triangle(x, y, defaultTargetThickness, defaultTargetThickness, 0, 1, defaultTriangleColor));
        }
    }
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    triangleMatrix.forEach(function(t, i) {
        t.update();
        t.render(i);
    });

    ripples.forEach(function(r) {
        r.update();
    });
}

init();
console.log("There are " + triangleMatrix.length + " triangles created. \n xT = " + xT + " yT = " + yT);
console.log("canvas dims: " + canvas.width + ";" + canvas.height);
animate();



