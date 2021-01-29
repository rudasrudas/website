/*
Triangle hero interactive section for a landing page.

Project goal is to pick up on javascript, learn to use github version
control effectively, learn to create a responsive website
part from scratch (meaning pure JS).

Start date: 2021/01/26
End date: In progress

Expected features:
 [ ] Displayed in a hexagonal pattern and not square
 [ ] Have margins on all sides
 [ ] Adapt triangle size based on the density value
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

 //VARIABLES

const elementId = "canvas1";
var canvas = document.getElementById(elementId);
var ctx = canvas.getContext("2d");

var canvasWidth;
var canvasHeight;

//The variable that determines how dense the triangle hero section will be
const triangleDensity = 20;

//The padding around the hero section in px.
const paddingTop = 0;
const paddingBottom = 0;
const paddingLeft = 0;
const paddingRight = 0;

//The triangle matrix, as a one dimensional array
var triangleMatrix;

var xT; //Triangle amount in x axis
var yT; //Triangle amount in y axis
var gap; //The gap between triangles
var sideLength; //The length of each side of the triangles

//The speed at which the triangles will reach their target thickness
//NOTE(justas): The bigger the value, the less accurate triangle
//thickness is going to be.
const refreshSpeed = 0.5;

//The speed at which the ripples move away from their source in px
const rippleSpeed = 20;

//The default target thickness for all triangles
//not part of the graphics, in px
const defaultTargetThickness = 2;

//The default colour for triangles.
const defaultTriangleColor = "#555555";

//Mouse data
var mouse = {
    x: -500, //NOTE(justas): the negative values are to prevent
    y: -500, // a fallback to the top right corner. Find out if
             // it can be done otherwise.
}

//The maximum distance between any two points on the canvas
//used to ensure good performance
const maximumDistance = Math.sqrt((screen.width*screen.width)+(screen.height*screen.height));

//The ripple array
var ripples;

//TODO(justas): Perhaps a mouse click array should be introduced
// to allow fully responsive clicking experience?
class Ripple {
    constructor(x, y, radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    //returns whether a triangle within the radius of this ripple
    inRange(triangle){
        //TODO(justas):Account for the triangle coordinates
        // being at the edge of the triangle
        return (this.radius >= Math.sqrt((triangle.x - this.x)*(triangle.x - this.x) + 
                                    (triangle.y - this.y)*(triangle.y - this.y)));
    }

    update(){
        if(radius < maximumDistance){
            radius += rippleSpeed;
        }
        else{
            ripples.pop(this); //Delete the ripple if it is irrelevant
            //TODO(justas): Destruct this instance here to increase performance.
        }
    }
}


//The triangle class
class Triangle {
    constructor(x, y, thickness, targetThickness, cornerRadius, opacity, color){
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.targetThickness = targetThickness;
        this.cornerRadius = cornerRadius;
        this.opacity = opacity;
        this.color = color;
    }

    //Drawing the triangle on the canvas
    render(){
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;

        //TODO(justas): Create a path using the rounded corners and arcs
        //TODO(justas): Account for the flipping of the triangle and the height difference
        let path = new Path2D();
        ctx.stroke(path);
    }

    update(){
        //Iterating trough every ripple and making the triangles disappear
        ripples.forEach(function(rirpple) {
            if(r.inRange(this)){
                this.targetThickness = 0;
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
            //TODO(justas): implement the mouse clicking
            // and adding to the array

            var disappearingInterval = setInterval(() => {
                //TODO(justas): make triangles disappear with
                // a function here.
            })

            //TODO(justas): make use of a radius just like in the previous version
        }
    }
);

function init(){
    triangleMatrix = [];
    ripples = [];

    //TODO(justas): initialize the canvas width and height!

    //TODO(justas): calculate the number of triangles needed based on the density and the canvas dimensions.
    xT = 10;
    yT = 10;

    for(let i = 0; i < yT; i++){
        for(let j = 0; j < xT; j++){
            let x = 0;
            let y = 0;

            //TODO(justas): Perhaps make use of the construction with a different thickness value
            // to achieve a beautiful booting up animation?
            triangleMatrix.push(new Triangle(x, y, defaultTargetThickness, defaultTargetThickness, 0, 1, defaultTriangleColor));
        }
    }
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(canvas.width + "x" + canvas.height);

    for(let i = 0; i < triangleMatrix.length; i++){}
        triangleMatrix[i].update();
        triangleMatrix[i].draw();
    }

    ripples.forEach(function(r) {
        r.update();
    });
}

init();
animate();



