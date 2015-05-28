'use strict';

(function() 
{
	var canvasContext;
	var canvas;
    var values = {valueR: 0, valueG: 0, valueB: 0, valueC: 0, valueM: 0, valueY: 0, valueK: 0, valueH: 0, valueS: 0, valueV: 0,
                    valueL: 0, valueU: 0, valueVluv: 0};
    var rgbR, rgbG, rgbB, cmykC, cmykM, cmykY, cmykK, hsvH, hsvS, hsvV, luvL, luvU, luvV;
    var domNodes = {rgbRInput: '', rgbGInput: '', rgbBInput: '', cmykCInput: '', cmykMInput: '', cmykYInput: '', cmykKInput: '',
                    hsvHInput: '', hsvSInput: '', hsvVInput: '', luvLInput: '', luvUInput: '', luvVInput: ''};
    var reculc = {
        HSV: 'HSV',
        RGB: 'RGB',
        LUV: 'LUV',
        CMYK: 'CMYK'
    };
    var selectScheme;
    var rgb, cmyk, hsv, luv;
    var currentColor = {
        R: 0,
        G: 0,
        B: 0
    }, panel;

	function clickCanvas(event) 
	{
		console.log("CLICK", event.target.value);
        var color = event.target.value;
        currentColor.R = parseInt('0x'+color[1]+ color[2]);
        currentColor.G = parseInt('0x'+color[3]+ color[4]);
        currentColor.B = parseInt('0x'+color[5]+ color[6]);

        recalculationResult();
        panel.setAttribute('style', 'background-color: #'+RGBToString());
	}

    function RGBToString()
    {
        var r = Number(currentColor.R).toString(16);
        var g = Number(currentColor.G).toString(16);
        var b = Number(currentColor.B).toString(16);
        if(r.length !== 2)
        {
            r = '0' + r;
        }
        if(g.length !== 2)
        {
            g = '0' + g;
        }
        if(b.length !== 2)
        {
            b = '0' + b;
        }
        return r+g+b;
    }

    function recalculationResult(scheme)
    {
        if(scheme !== reculc.RGB)
        {
            values.valueR = currentColor.R;
            values.valueG = currentColor.G;
            values.valueB = currentColor.B;

            domNodes.rgbRInput.value = values.valueR;
            domNodes.rgbGInput.value = values.valueG;
            domNodes.rgbBInput.value = values.valueB;
            rgbR.value = values.valueR;
            rgbG.value = values.valueG;
            rgbB.value = values.valueB;
        }

        if(scheme !== reculc.CMYK)
        {
            var cmykR = currentColor.R/255,
                cmykG = currentColor.G/255,
                cmykB = currentColor.B/255;

            values.valueK = (1-Math.max(cmykR, cmykG, cmykB));
            if(values.valueK === 1)
            {
                values.valueC = 0;
                values.valueM = 0;
                values.valueY = 0;
            }
            else
            {
                values.valueC = Math.round(((1 - cmykR - values.valueK) / (1 - values.valueK)) * 100);
                values.valueM = Math.round(((1 - cmykG - values.valueK) / (1 - values.valueK)) * 100);
                values.valueY = Math.round(((1 - cmykB - values.valueK) / (1 - values.valueK)) * 100);
            }
            values.valueK =Math.round( values.valueK*100);

            domNodes.cmykCInput.value = values.valueC;
            domNodes.cmykMInput.value = values.valueM;
            domNodes.cmykYInput.value = values.valueY;
            domNodes.cmykKInput.value = values.valueK;
            cmykC.value = values.valueC;
            cmykM.value = values.valueM;
            cmykY.value = values.valueY;
            cmykK.value = values.valueK;
        }

        if(scheme !== reculc.HSV)
        {
            var hsvR = currentColor.R/255,
                hsvG = currentColor.G/255,
                hsvB = currentColor.B/255,
                Cmax = Math.max(hsvR, hsvG, hsvB),
                Cmin = Math.min(hsvR, hsvG, hsvB),
                del = Cmax - Cmin;

            if ( del === 0 ) {
                values.valueH = 0;
                values.valueS = 0;
            }
            else {
                values.valueS = del / Cmax;

                var del_R = ( ( ( Cmax - hsvR ) / 6 ) + ( del / 2 ) ) / del;
                var del_G = ( ( ( Cmax - hsvG  ) / 6 ) + ( del / 2 ) ) / del;
                var del_B = ( ( ( Cmax - hsvB ) / 6 ) + ( del / 2 ) ) / del;

                if      ( hsvR === Cmax ) values.valueH = del_B - del_G;
                else if ( hsvG  === Cmax ) values.valueH = ( 1 / 3 ) + del_R - del_B;
                else if ( hsvB === Cmax ) values.valueH = ( 2 / 3 ) + del_G - del_R;

                if ( values.valueH < 0 ) values.valueH += 1;
                if ( values.valueH > 1 ) values.valueH -= 1;
            }

            values.valueV = Math.round(Cmax*100);
            values.valueH = Math.round(values.valueH* 100 / 10);
            values.valueS = Math.round(values.valueS*100);


            domNodes.hsvHInput.value = values.valueH;
            domNodes.hsvSInput.value = values.valueS;
            domNodes.hsvVInput.value = values.valueV;
            hsvH.value = values.valueH;
            hsvS.value = values.valueS;
            hsvV.value = values.valueV;
        }

        if(scheme !== reculc.LUV)
        {
            var var_R = ( currentColor.R / 255 )        //R from 0 to 255
            var var_G = ( currentColor.G / 255 )        //G from 0 to 255
            var var_B = ( currentColor.B / 255 )        //B from 0 to 255

            if ( var_R > 0.04045 ) var_R = Math.pow(( ( var_R + 0.055 ) / 1.055 ), 2.4);
            else                   var_R = var_R / 12.92;
            if ( var_G > 0.04045 ) var_G = Math.pow(( ( var_G + 0.055 ) / 1.055 ), 2.4);
            else                   var_G = var_G / 12.92;
            if ( var_B > 0.04045 ) var_B = Math.pow(( ( var_B + 0.055 ) / 1.055 ), 2.4);
            else                   var_B = var_B / 12.92;

            var_R = var_R * 100;
            var_G = var_G * 100;
            var_B = var_B * 100;

//Observer. = 2°, Illuminant = D65
            var X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
            var Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
            var Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;

            var var_U = ( 4 * X ) / ( X + ( 15 * Y ) + ( 3 * Z ) );
            var var_V = ( 9 * Y ) / ( X + ( 15 * Y ) + ( 3 * Z ) );
            var var_Y = Y / 100;

            var_U = isNaN(var_U) ? 0 : var_U;
            var_V = isNaN(var_V) ? 0 : var_V;
            var_Y = isNaN(var_Y) ? 0 : var_Y;

            if ( var_Y > 0.008856 ) var_Y = Math.pow(var_Y ,( 1/3 ));
            else                    var_Y = ( 7.787 * var_Y ) + ( 16 / 116 );

            var ref_X =  95.047;        //Observer= 2°, Illuminant= D65
            var ref_Y = 100.000;
            var ref_Z = 108.883;

            var ref_U = ( 4 * ref_X ) / ( ref_X + ( 15 * ref_Y ) + ( 3 * ref_Z ) );
            var ref_V = ( 9 * ref_Y ) / ( ref_X + ( 15 * ref_Y ) + ( 3 * ref_Z ) );

            values.valueL = ( 116 * var_Y ) - 16;
            values.valueU = 13 * values.valueL * ( var_U - ref_U );
            values.valueVluv = 13 * values.valueL * ( var_V - ref_V );

            values.valueL = Math.round(values.valueL);
            values.valueU = Math.round(values.valueU);
            values.valueVluv = Math.round(values.valueVluv);

            domNodes.luvLInput.value = values.valueL;
            domNodes.luvUInput.value = values.valueU;
            domNodes.luvVInput.value = values.valueVluv;
            luvL.value = values.valueL;
            luvU.value = values.valueU;
            luvV.value = values.valueVluv;
        }
    }

    function toRGB(n) {
        if (n < 0) { return 0; }
        if (n > 255) {return 255; }
        return Math.round(n);
    }

    function recalculation(scheme)
    {
        if(scheme === reculc.RGB)
        {
            currentColor.R = values.valueR;
            currentColor.G = values.valueG;
            currentColor.B = values.valueB;
            recalculationResult(reculc.RGB);
        }

        if(scheme === reculc.CMYK)
        {
            var C = values.valueC/100,
                M = values.valueM/100,
                Y = values.valueY/100,
                K = values.valueK/100;

            currentColor.R = Math.ceil(255 * (1-C) * (1-K));
            currentColor.G = Math.ceil(255 * (1-M) * (1-K));
            currentColor.B = Math.ceil(255 * (1-Y) * (1-K));
            recalculationResult(reculc.CMYK);
        }

        if(scheme === reculc.HSV)
        {
            var hsvC = values.valueV/100 * values.valueS/100;
            var hsvX = hsvC * (1 - Math.abs((values.valueH / 60) % 2 - 1));
            var hsvM = values.valueV/100 - hsvC;
            var hsvR, hsvG, hsvB;

            if (values.valueH >= 0 && values.valueH < 60) {
                hsvR = hsvC;
                hsvG = hsvX;
                hsvB = 0;
            } else if (values.valueH >= 60 && values.valueH < 120) {
                hsvR = hsvX;
                hsvG = hsvC;
                hsvB = 0;
            } else if (values.valueH >= 120 && values.valueH < 180) {
                hsvR = 0;
                hsvG = hsvC;
                hsvB = hsvX;
            } else if (values.valueH >= 180 && values.valueH < 240) {
                hsvR = 0;
                hsvG = hsvX;
                hsvB = hsvC;
            } else if (values.valueH >= 240 && values.valueH < 300) {
                hsvR = hsvX;
                hsvG = 0;
                hsvB = hsvC;
            } else {
                hsvR = hsvC;
                hsvG = 0;
                hsvB = hsvX;
            }
            currentColor.R = Math.round(255 * (hsvR+hsvM));
            currentColor.G = Math.round(255 * (hsvG+hsvM));
            currentColor.B = Math.round(255 * (hsvB+hsvM));
            recalculationResult(reculc.HSV);
        }

        if(scheme === reculc.LUV)
        {
            var ref_X, ref_Y, ref_Z, ref_U, ref_V, X, Y, Z;
            var l_Y = ( values.valueL + 16 ) / 116, _U, _V, result = {};

            if ( Math.pow(l_Y, 3) > 0.008856 ) { l_Y = Math.pow(l_Y, 3); }
            else { l_Y = ( l_Y - 16 / 116 ) / 7.787; }

            ref_X =  95.047;      //Observer= 2°, Illuminant= D65
            ref_Y = 100.000;
            ref_Z = 108.883;

            ref_U = ( 4 * ref_X ) / ( ref_X + ( 15 * ref_Y ) + ( 3 * ref_Z ) );
            ref_V = ( 9 * ref_Y ) / ( ref_X + ( 15 * ref_Y ) + ( 3 * ref_Z ) );

            _U = values.valueU / ( 13 * values.valueL ) + ref_U;
            _V = values.valueVluv / ( 13 * values.valueL ) + ref_V;

            Y = l_Y * 100;
            X =  - ( 9 * Y * _U ) / ( ( _U - 4 ) * _V  - _U * _V );
            Z = ( 9 * Y - ( 15 * _V * Y ) - ( _V * X ) ) / ( 3 * _V );

            // xyz to rgb
            var _X = X / 100,        //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
                _Y = Y / 100,        //Y from 0 to 100.000
                _Z = Z / 100;        //Z from 0 to 108.883

            var _R = _X *  3.2406 + _Y * -1.5372 + _Z * -0.4986,
                _G = _X * -0.9689 + _Y *  1.8758 + _Z *  0.0415,
                _B = _X *  0.0557 + _Y * -0.2040 + _Z *  1.0570;

            if ( _R > 0.0031308 ) { _R = 1.055 * Math.pow( _R, ( 1.0 / 2.4 ) ) - 0.055; }
            else { _R = 12.92 * _R; }
            if ( _G > 0.0031308 ) { _G = 1.055 * Math.pow( _G, ( 1 / 2.4 ) ) - 0.055; }
            else { _G = 12.92 * _G; }
            if ( _B > 0.0031308 ) { _B = 1.055 * Math.pow( _B, ( 1 / 2.4 ) ) - 0.055; }
            else { _B = 12.92 * _B; }

            currentColor.R = Math.round( _R * 255 );
            currentColor.G =  Math.round(_G * 255);
            currentColor.B =  Math.round(_B * 255);

            currentColor.R = toRGB(currentColor.R);
            currentColor.G = toRGB(currentColor.G);
            currentColor.B = toRGB(currentColor.B);
            recalculationResult(reculc.LUV);
        }

        panel.setAttribute('style', 'background-color: #'+RGBToString());

    };

    function onChangeSelect(event)
    {
        var value = event.target.value;
        console.log('ONCHANGE', value);
        if(value === reculc.RGB)
        {
            rgb.classList.remove('hidden');
        }
        else
        {
            rgb.classList.add('hidden');
        }

        if(value === reculc.CMYK)
        {
            cmyk.classList.remove('hidden');
        }
        else
        {
            cmyk.classList.add('hidden');
        }

        if(value === reculc.LUV)
        {
            luv.classList.remove('hidden');
        }
        else
        {
            luv.classList.add('hidden');
        }

        if(value === reculc.HSV)
        {
            hsv.classList.remove('hidden');
        }
        else
        {
            hsv.classList.add('hidden');
        }
    }

    function changeValueRGB(property, DOMNode, event)
    {
        var newValue = event.target.value - 0;
        if(typeof(newValue) !== 'number')
        {
            event.target.value = values[property];
        }
        else
        {
            if(!newValue || newValue < 0)
            {
                values[property] = 0;
            }
            else if(newValue > 255)
            {
                values[property] = 255;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.RGB);
        }
    };

    function changeValueCMYK(property, DOMNode, event)
    {
        var newValue = event.target.value - 0;
        if(typeof(newValue) !== 'number')
        {
            event.target.value = values[property];
        }
        else
        {
            if(!newValue || newValue < 0)
            {
                values[property] = 0;
            }
            else if(newValue > 100)
            {
                values[property] = 100;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.CMYK);
        }
    }

    function changeValueHSV(property, DOMNode, H, event)
    {
        var newValue = event.target.value - 0;
        if(typeof(newValue) !== 'number')
        {
            event.target.value = values[property];
        }
        else if(H)
        {
            if(!newValue || newValue < 0)
            {
                values[property] = 0;
            }
            else if(newValue > 360)
            {
                values[property] = 360;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.HSV);
        }
        else
        {
            if(!newValue || newValue < 0)
            {
                values[property] = 0;
            }
            else if(newValue > 100)
            {
                values[property] = 100;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.HSV);
        }
    }

    function changeValueLUV(property, DOMNode, H, event)
    {
        var newValue = event.target.value - 0;
        if(typeof(newValue) !== 'number')
        {
            event.target.value = values[property];
        }
        else if(H)
        {
            if(!newValue || newValue < -100)
            {
                values[property] = -100;
            }
            else if(newValue > 100)
            {
                values[property] = 100;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.LUV);
        }
        else
        {
            if(!newValue || newValue < 0)
            {
                values[property] = 0;
            }
            else if(newValue > 100)
            {
                values[property] = 100;
            }
            else
            {
                values[property] = newValue;
            }
            event.target.value = values[property];
            DOMNode.value = values[property];
            recalculation(reculc.LUV);
        }
    }

    function changeValueRGBInput(property, DOMNode, event)
    {
        values[property] = event.target.value - 0;
        DOMNode.value = values[property];
        recalculation(reculc.RGB);
    }

    function changeValueCMYKInput(property, DOMNode, event)
    {
        values[property] = event.target.value - 0;
        DOMNode.value = values[property];
        recalculation(reculc.CMYK);
    }

    function changeValueHSVInput(property, DOMNode, event)
    {
        values[property] = event.target.value - 0;
        DOMNode.value = values[property];
        recalculation(reculc.HSV);
    }

    function changeValueLUVInput(property, DOMNode, event)
    {
        values[property] = event.target.value - 0;
        DOMNode.value = values[property];
        recalculation(reculc.LUV);
    }

	window.onload = function() 
	{
        rgb = document.querySelector('#rgb');
        cmyk = document.querySelector('#cmyk');
        hsv = document.querySelector('#hsv');
        luv = document.querySelector('#luv');
        selectScheme = document.querySelector('#selectScheme');

        rgbR = document.querySelector('#rgbR');
        rgbG = document.querySelector('#rgbG');
        rgbB = document.querySelector('#rgbB');
        cmykC = document.querySelector('#cmykC');
        cmykM = document.querySelector('#cmykM');
        cmykY = document.querySelector('#cmykY');
        cmykK = document.querySelector('#cmykK');
        hsvH =  document.querySelector('#hsvH');
        hsvS =  document.querySelector('#hsvS');
        hsvV =  document.querySelector('#hsvV');
        luvL = document.querySelector('#luvL');
        luvU = document.querySelector('#luvU');
        luvV = document.querySelector('#luvV');

        domNodes.rgbRInput = document.querySelector('#rgbRInput');
        domNodes.rgbGInput = document.querySelector('#rgbGInput');
        domNodes.rgbBInput = document.querySelector('#rgbBInput');
        domNodes.cmykCInput = document.querySelector('#cmykCInput');
        domNodes.cmykMInput = document.querySelector('#cmykMInput');
        domNodes.cmykYInput = document.querySelector('#cmykYInput');
        domNodes.cmykKInput = document.querySelector('#cmykKInput');
        domNodes.hsvHInput = document.querySelector('#hsvHInput');
        domNodes.hsvSInput = document.querySelector('#hsvSInput');
        domNodes.hsvVInput = document.querySelector('#hsvVInput');
        domNodes.luvLInput = document.querySelector('#luvLInput');
        domNodes.luvUInput = document.querySelector('#luvUInput');
        domNodes.luvVInput = document.querySelector('#luvVInput');

        domNodes.rgbRInput.addEventListener('input', changeValueRGB.bind(this, 'valueR', rgbR));
        domNodes.rgbGInput.addEventListener('input', changeValueRGB.bind(this, 'valueG', rgbG));
        domNodes.rgbBInput.addEventListener('input', changeValueRGB.bind(this, 'valueB', rgbB));
        domNodes.cmykCInput.addEventListener('input', changeValueCMYK.bind(this, 'valueC', cmykC));
        domNodes.cmykMInput.addEventListener('input', changeValueCMYK.bind(this, 'valueM', cmykM));
        domNodes.cmykYInput.addEventListener('input', changeValueCMYK.bind(this, 'valueY', cmykY));
        domNodes.cmykKInput.addEventListener('input', changeValueCMYK.bind(this, 'valueK', cmykK));
        domNodes.hsvHInput.addEventListener('input', changeValueHSV.bind(this, 'valueH', hsvH, true));
        domNodes.hsvSInput.addEventListener('input', changeValueHSV.bind(this, 'valueS', hsvS, false));
        domNodes.hsvVInput.addEventListener('input', changeValueHSV.bind(this, 'valueV', hsvV, false));
        domNodes.luvLInput.addEventListener('input', changeValueLUV.bind(this, 'valueL', luvL, false));
        domNodes.luvUInput.addEventListener('input', changeValueLUV.bind(this, 'valueU', luvU, true));
        domNodes.luvVInput.addEventListener('input', changeValueLUV.bind(this, 'valueVluv', luvV, true));

        rgbR.addEventListener('input', changeValueRGBInput.bind(this, 'valueR', domNodes.rgbRInput));
        rgbG.addEventListener('input', changeValueRGBInput.bind(this, 'valueG', domNodes.rgbGInput));
        rgbB.addEventListener('input', changeValueRGBInput.bind(this, 'valueB', domNodes.rgbBInput));
        cmykC.addEventListener('input', changeValueCMYKInput.bind(this, 'valueC', domNodes.cmykCInput));
        cmykM.addEventListener('input', changeValueCMYKInput.bind(this, 'valueM', domNodes.cmykMInput));
        cmykY.addEventListener('input', changeValueCMYKInput.bind(this, 'valueY', domNodes.cmykYInput));
        cmykK.addEventListener('input', changeValueCMYKInput.bind(this, 'valueK', domNodes.cmykKInput));
        hsvH.addEventListener('input', changeValueHSVInput.bind(this, 'valueH', domNodes.hsvHInput));
        hsvS.addEventListener('input', changeValueHSVInput.bind(this, 'valueS', domNodes.hsvSInput));
        hsvV.addEventListener('input', changeValueHSVInput.bind(this, 'valueV', domNodes.hsvVInput));
        luvV.addEventListener('input', changeValueLUVInput.bind(this, 'valueVluv', domNodes.luvVInput));
        luvL.addEventListener('input', changeValueLUVInput.bind(this, 'valueL', domNodes.luvLInput));
        luvU.addEventListener('input', changeValueLUVInput.bind(this, 'valueU', domNodes.luvUInput));


        selectScheme.addEventListener('change', onChangeSelect);
		canvas = document.getElementById('color_panel');
//		canvasContext = canvas.getContext('2d');
		canvas.addEventListener('input', clickCanvas);
        panel = document.querySelector('#current_color');
        recalculation(reculc.RGB);
	};
})();
