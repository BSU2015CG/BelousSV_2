app = {
    algorithm: undefined,
    lineWidth: 2,
    COLORS: {
        'colorFrame': 'green',
        'colorLines': ['orange', 'black', 'blue', 'yellow'],
        'canvasStrokeColor': '#505050'
    }
};

function clearCanvas(event){
    context.clearRect( 0 , 0 , c.width, c.height );
    drawGrid();
    drawAll();
};

function drawAll() {
    drawFrame();
    drawSegments(segments);
}

function drawFrame() {
    if(frame) {
        context.rect(intHalfWidth + frame.xMin, intHalfHeight - frame.yMax, frame.xMax - frame.xMin, frame.yMax - frame.yMin);
        context.strokeStyle = app.COLORS.colorFrame;
        context.lineWidth = app.lineWidth;
        context.stroke();
    }
}

function drawSegments(segments) {
    var color = app.COLORS.colorLines[Math.ceil(Math.random()*app.COLORS.colorLines.length)]
    if(segments && Array.isArray(segments)) {
        segments.forEach(function(item) {
            context.beginPath();
            context.moveTo(item.x1 + intHalfWidth, intHalfHeight - item.y1);
            context.lineTo(item.x2 + intHalfWidth, intHalfHeight - item.y2);
            context.lineWidth = app.lineWidth;
            context.strokeStyle = color;
            context.stroke();
        });
    }
}

function drawGrid(){
    //x-axis
    context.beginPath();
    context.moveTo(0, intHalfHeight);
    context.lineTo(c.width, intHalfHeight);
    context.lineWidth = app.lineWidth;
    context.stroke();

    //y-axis
    context.beginPath();
    context.moveTo(intHalfWidth, 0);
    context.lineTo(intHalfWidth, c.height);
    context.lineWidth = app.lineWidth;
    context.stroke();
};

function MiddlePoint (){
    var epsilon = 0.01,
        showSegments = [];

    this.cutSegments = function(segments, frame){
        showSegments = [];
        for (var i = 0; i < segments.length; i++){
            this.cutLine(segments[i], frame);
        }
        return showSegments;
    }

    this.cutLine = function(segment, frame){   
        var code1 = getCode(segment.x1, segment.y1, frame),
            code2 = getCode(segment.x2, segment.y2, frame);

        if (code1 === 0 && code2 === 0){
            showSegments.push(segment);
        } else if ((code1 & code2) > 0 || segment.getLength() < epsilon){
            return;
        } else {
            var centerX = (segment.x1 + segment.x2) / 2,
                centerY = (segment.y1 + segment.y2) / 2;

            this.cutLine(new Segment(segment.x1, segment.y1, centerX, centerY), frame);
            this.cutLine(new Segment(centerX, centerY, segment.x2, segment.y2), frame);
        }
    }
}

function CohenSutherland(endX, endY){
    var x1 = transformCoordToRect(X, intHalfWidth),
        x2 = transformCoordToRect(endX, intHalfWidth),
        y1 = transformCoordToRect(Y, intHalfHeight),
        y2 = transformCoordToRect(endY, intHalfHeight);
};

function setMethod(event){
    if (Boolean(this.checked) == true) {
        switch (this.id){
            case "radio1":
                app.algorithm = suther;
            break;

            case "radio2":
                app.algorithm = middlePoint;
            break;
        }
    }
};

function handleFileSelect(event) {
    var file = event.target.files[0];
    clearData();

    if(!file) {
        return;
    }

    reader = new FileReader();

    reader.onload = function (e){
        textArea.value = reader.result;
        parseCoordinates(reader.result.split('\n'));
        drawAll();
    }

    reader.readAsText(file);
}

function clearData() {
    frame = null;
    segments = [];
}

function parseCoordinates(data) {
    while(data.length > 1) {
        var segment = data.splice(0, 1)[0];
        segments.push(new Segment(segment.split(' ')));
    }
    data = data[0].split(' '); 
    frame = new Frame(data[0], data[1], data[2], data[3]);
}

function Frame(x1, y1, x2, y2) {
    this.xMin = Math.min(x1, x2);
    this.xMax = Math.max(x1, x2);
    this.yMin = Math.min(y1, y2);
    this.yMax =  Math.max(y1, y2);   
}

function Segment(x1, y1, x2, y2) {
    if(Array.isArray(x1)) {
        this.x1 = x1[0] - 0 || 0;
        this.x2 = x1[2] - 0 || 0;
        this.y1 = x1[1] - 0 || 0;
        this.y2 = x1[3] - 0 || 0;    
    }
    else {
        this.x1 = x1 - 0 || 0;
        this.x2 = x2 - 0 || 0;
        this.y1 = y1 - 0 || 0;
        this.y2 = y2 - 0 || 0;
    }

     this.getLength = function(){
        return Math.sqrt((this.x1 - this.x2)*(this.x1 - this.x2) + (this.y1 - this.y2)*(this.y1 - this.y2));
    }
}

function cutOff() {
    if(app.algorithm && frame) {
        drawSegments(app.algorithm.cutSegments(segments, frame));
    }
}

function getCode(x, y, frame) {
    var code = 0;

    if (x < frame.xMin){ 
        code += 1;
    }
    if (x > frame.xMax){ 
        code += 2;
    }
    if (y < frame.yMin){
        code += 4;
    } 
    if (y > frame.yMax){
        code += 8;
    }

    return code;
}

function getCodeSuther(x, y, frame) {
 var code = 0;

    if (x < frame.xMin){
        code += 8;
    }
    if (x > frame.xMax){
        code += 4;
    }
    if (y < frame.yMin){
        code += 2;
    }
    if (y > frame.yMax){
        code += 1;
    }

    return code;
}

function CohenSutherlandAlgorithm(){
    var result = [];

    this.cutSegments = function (segments, frame){
        var cutted, result =[];

        for (var i = 0; i < segments.length; i++) {
            cutted = this.cutSegment(segments[i], frame);
            if (typeof cutted !== "undefined")
                result.push(cutted);
            }
        return result;
    }

    this.cutSegment = function(segment, frame){
        var code1 = getCodeSuther(segment.x1, segment.y1, frame),
        code2 = getCodeSuther(segment.x2, segment.y2, frame);

        if (code1 === 0 && code2 === 0){
            return new Segment(segment.x1, segment.y1, segment.x2, segment.y2);
        }
        if ((code1 & code2) > 0){
            return undefined;
        }
        newSegment = this.getIntersection(segment, frame);
        return this.cutSegment(newSegment, frame);
    }

    this.getIntersection = function(segment, frame){
        var code, outX, outY, inX, inY, k,
        code1 = getCodeSuther(segment.x1, segment.y1, frame),
        code2 = getCodeSuther(segment.x2, segment.y2, frame);

        if (code1 != 0){
            code = code1;
            outX = segment.x1;
            outY = segment.y1;
            inX = segment.x2;
            inY = segment.y2;
        } else {
            code = code2;
            outX = segment.x2;
            outY = segment.y2;
            inX = segment.x1;
            inY = segment.x1;
        }

        if ((outX - inX) !== 0){
            k = (outY - inY) / (outX - inX);
        } else {
            k = 0;
        }
        if (code === 9 || code === 1) {
            if (k !== 0){
                outX = outX + (1 / k) * (frame.yMax - outY);
            }
            outY = frame.yMax;
        }
        else if (code === 5 || code === 4) {
            outY = outY + k * (frame.xMax - outX);
            outX = frame.xMax;
        }
        else if (code === 6 || code === 2){
            if (k !== 0) {
                outX = outX + (1 / k) * (frame.yMin - outY);
            }
            outY = frame.yMin;
        }
        else if (code === 10 || code === 8){
            outY = outY + k * (frame.xMin - outX);
            outX = frame.xMin;
        }

        return new Segment(outX, outY, inX, inY);
    }
}

window.onload = function() {

    textArea = document.querySelector('#textarea');
    fileInput = document.querySelector('#fileInput');
    c = document.querySelector('#cnv');
    r1 = document.querySelector('#radio1');
    r2 = document.querySelector('#radio2');
    tm = document.querySelector('#time');
    rst = document.querySelector('#resetBtn');
    cutBtn = document.querySelector('#cutBtn');
    frame = null;
    segments = [];

    c.width = 600;
    c.height = 400;
    intHalfWidth = Math.round(c.width/2);
    intHalfHeight = Math.round(c.height/2);

    context = c.getContext('2d');

    r1.checked = false;
    r2.checked = false;

    drawGrid();

    cutBtn.addEventListener('click', cutOff);
    fileInput.addEventListener('change', handleFileSelect);
    rst.addEventListener('click', clearCanvas);
    r1.addEventListener('change', setMethod);
    r2.addEventListener('change', setMethod);
    middlePoint = new MiddlePoint();
    suther = new CohenSutherlandAlgorithm();
};