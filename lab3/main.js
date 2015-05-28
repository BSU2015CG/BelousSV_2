app = {
    methodFunc : undefined,
    COLORS: {
        'simpleMethod': {
            'fillColor': '#6F5499',
            'strokeColor': 'black'
        },
        'dda': {
            'fillColor': 'orange',
            'strokeColor': 'purple'
        },
        'bresenhem': {
            'fillColor': 'black',
            'strokeColor': 'yellow'
        },
        'canvasStrokeColor': '#505050'
    }
};

function checkDraw(event){
    if (!app.methodFunc) { return false; }
    if (firstClick) {
        firstClick = false;
        drawLine(event.offsetX, event.offsetY);
    } else{
        firstClick = true;
        X = event.offsetX;
        Y = event.offsetY;
        drawPixel(transformCoordToRect(X, intHalfWidth), transformCoordToRect(Y, intHalfHeight));
    };
};

function drawLine(endX, endY){
    if (!app.methodFunc) { return; }
    var start = new Date().getTime(),
        end;

    app.methodFunc(endX, endY);
    drawPixel(transformCoordToRect(endX, intHalfWidth), transformCoordToRect(endY, intHalfHeight));
    end = new Date().getTime();
    tm.innerHTML = "Time is: " + (end - start) + " ms.";
};

function drawPixel(x, y){
    var curPixels = parseInt(rn.value);
    context.beginPath();
    context.rect(intHalfWidth + x*curPixels, intHalfHeight + y*curPixels, curPixels, curPixels);
    context.fillStyle = app.COLORS[app.methodFunc.name].fillColor;
    context.fill();
    context.strokeStyle = app.COLORS[app.methodFunc.name].strokeColor;
    context.stroke();
};

function clearCanvas(event){
    context.clearRect ( 0 , 0 , c.width, c.height );
    drawGrid();
};

function drawGrid(){
    //x-axis
    var curPixels = parseInt(rn.value);
    context.beginPath();
    context.moveTo(0, intHalfHeight);
    context.lineTo(c.width, intHalfHeight);
    context.lineWidth = 3;
    context.stroke();

    //y-axis
    context.beginPath();
    context.moveTo(intHalfWidth, 0);
    context.lineTo(intHalfWidth, c.height);
    context.lineWidth = 3;
    context.stroke();

    //x-grid
    for (i = 0; i < intHalfHeight; i+= curPixels){
        //up
        context.beginPath();
        context.moveTo(0, intHalfHeight- i);
        context.lineTo(c.width,intHalfHeight- i);
        context.lineWidth = 1;
        context.strokeStyle = app.COLORS.canvasStrokeColor;
        context.stroke();

        //down
        context.beginPath();
        context.moveTo(0, intHalfHeight + i);
        context.lineTo(c.width,intHalfHeight + i);
        context.lineWidth = 1;
        context.strokeStyle = app.COLORS.canvasStrokeColor;
        context.stroke();
    }

    //y-grid
    for (i = 0; i < intHalfWidth; i+= curPixels){
        //up
        context.beginPath();
        context.moveTo(intHalfWidth - i, 0);
        context.lineTo(intHalfWidth - i, c.height);
        context.lineWidth = 1;
        context.strokeStyle = app.COLORS.canvasStrokeColor;
        context.stroke();

        //down
        context.beginPath();
        context.moveTo(intHalfWidth + i, 0);
        context.lineTo(intHalfWidth + i, c.height);
        context.lineWidth = 1;
        context.strokeStyle = app.COLORS.canvasStrokeColor;
        context.stroke();
    }
};

function transformCoordToRect(coordinate, middle){
    var curPixels = parseInt(rn.value),
        rectCoordinare = parseInt((coordinate - middle) / curPixels),
        modCoordinare = (coordinate - middle) % curPixels;

        if (modCoordinare != 0){
            if (rectCoordinare < 0) --rectCoordinare;
            else if (rectCoordinare == 0){
                if (modCoordinare < 0) --rectCoordinare;
                //else if (modCoordinare > 0) ++rectCoordinare;
            }
        //else if (rectCoordinare > 0) ++rectCoordinare;
    }
    return rectCoordinare;
};

function simpleMethod(endX, endY){
    var x, y,
        x1 = transformCoordToRect(X, intHalfWidth),
        x2 = transformCoordToRect(endX, intHalfWidth),
        y1 = transformCoordToRect(Y, intHalfHeight),
        y2 = transformCoordToRect(endY, intHalfHeight),
        dx = x2 - x1,
        dy = y2 - y1;

    if (Math.abs(y2 - y1) >= Math.abs(x2 - x1)) {

        if ((x1 == x2) && (y1 == y2)) {
            drawPixel(x1, y1);
        } else {
            if (y2 < y1) {
                var tmp = x2;
                x2 = x1;
                x1 = tmp;

                tmp = y2;
                y2 = y1;
                y1 = tmp;
            }

            var k = dx / dy,
                q = x1 - k * y1;

            for (y = y1; y < y2; y++) {
                x = Math.round(k * y + q);
                drawPixel(x, y);
            }
        }
    } else {
        if (x2 < x1) {
            var tmp = x2;
            x2 = x1;
            x1 = tmp;

            tmp = y2;
            y2 = y1;
            y1 = tmp;
        }

        var k = dy / dx;
        var q = y1 - k * x1;

        for (x = x1; x < x2; x++) {
            y = Math.round(k * x + q);
            drawPixel(x, y);
        }
    }
};

function dda(endX, endY){
    var tmp, x, y, k, cele_x, cele_y,
        x1 = transformCoordToRect(X, intHalfWidth),
        x2 = transformCoordToRect(endX, intHalfWidth),
        y1 = transformCoordToRect(Y, intHalfHeight),
        y2 = transformCoordToRect(endY, intHalfHeight),
        dx = x2-x1,
        dy = y2-y1;

    if (Math.abs(y2 - y1) <= Math.abs(x2 - x1)) {
        if ((x1 == x2) && (y1 == y2)) {
            drawPixel(x1, y1);

        } else {
            if (x2 < x1) {
                tmp = x2;
                x2 = x1;
                x1 = tmp;

                tmp = y2;
                y2 = y1;
                y1 = tmp;
            }

            k = dy/dx; 
            y = y1;

            for (x = x1 ; x <= x2 ; x++) {
                cele_y = Math.round(y);
                drawPixel(x, cele_y);
                y += k;
            }
        }
    } else {
            if (y2 < y1) {
                tmp = x2;
                x2 = x1;
                x1 = tmp;

                tmp = y2;
                y2 = y1;
                y1 = tmp;
            }

            k = dx/dy - 0.00001;
            x = x1;
            for (y = y1; y <= y2; y++) {
                cele_x = Math.round(x);
                drawPixel(cele_x, y);
                x += k;
            }
    }
};


function bresenhem(endX, endY){
    var x1 = transformCoordToRect(X, intHalfWidth),
        x2 = transformCoordToRect(endX, intHalfWidth),
        y1 = transformCoordToRect(Y, intHalfHeight),
        y2 = transformCoordToRect(endY, intHalfHeight);

    if ((x1 == x2) && (y1 == y2)) {
        drawPixel(x1, y1);
    } else {
        var posun_x, posun_y,
            dx = Math.abs(x2 - x1),
            dy = Math.abs(y2 - y1);
            rozdil = dx - dy;

        if (x1 < x2) posun_x = 1; else posun_x = -1;
        if (y1 < y2) posun_y = 1; else posun_y = -1;

        while ((x1 != x2) || (y1 != y2)) {  

            var p = 2 * rozdil;

            if (p > -dy) {
                rozdil = rozdil - dy;
                x1 = x1 + posun_x;
            }
            if (p < dx) {
                rozdil = rozdil + dx;
                y1 = y1 + posun_y;
            }
            drawPixel(x1, y1);
        }
    }
};

function setMethod(event){
    if (Boolean(this.checked) == true) {
        switch (this.id){
            case "radio1":
            app.methodFunc = simpleMethod;
            break;

            case "radio2":
            app.methodFunc = bresenhem;
            break;

            case "radio3":
            app.methodFunc = dda;
            break;

            default:
        }
    }
};


window.onload = function() {

    c = document.querySelector('#cnv');
    r1 = document.querySelector('#radio1');
    r2 = document.querySelector('#radio2');
    r3 = document.querySelector('#radio3');
    tm = document.querySelector('#time');
    rn = document.querySelector('#rng');
    rst = document.querySelector('#resetBtn');

    c.width = 600;
    c.height = 400;
    intHalfWidth = Math.round(c.width/2);
    intHalfHeight = Math.round(c.height/2);

    context = c.getContext('2d');
    firstClick = false;
    X = undefined;
    Y = undefined;

    r1.checked = false;
    r2.checked = false;
    r3.checked = false;

    drawGrid();

    c.addEventListener('mousedown', checkDraw);
    rst.addEventListener("click", clearCanvas);
    rn.addEventListener('input', clearCanvas);
    r1.addEventListener('change', setMethod);
    r2.addEventListener('change', setMethod);
    r3.addEventListener('change', setMethod);
};