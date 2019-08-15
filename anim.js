// Abdelrahman Elsayed

// Provided by the user McDowell from the following StackOverflow question
// https://stackoverflow.com/questions/21647928/javascript-unicode-string-to-hex
String.prototype.hexEncode = function () {
    var hex, i;

    var result = "";
    for (i = 0; i < this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000" + hex).slice(-4);
    }

    return result;
}

function showErrorTooltip() {
    var tooltip = document.getElementsByClassName("error-tooltip")[0];
    tooltip.oninput = function () {
        this.cusoninput = setCustomValidity('')
    };
    tooltip.style.visibility = "visible";
    setTimeout(function () {
        tooltip.style.visibility = "hidden";
    }, 5000);
}

function resetDrawingBoard(dummySvg, erase_panels) {
    while (dummySvg.firstChild) {
        dummySvg.removeChild(dummySvg.firstChild);

    }
    if (document.styleSheets.length > 1) {
        var styles = document.querySelectorAll("style");
        var parentNode = styles[0].parentNode;
        for (let i = 0; i < styles.length; i++) {
            parentNode.removeChild(styles[i])
        }
    }
    if (document.querySelectorAll(".kanji_panel".length > 0) && erase_panels) {
        var panels = document.querySelectorAll(".kanji_panel");
        for (var i = 0; i < panels.length; i++) {
            document.body.removeChild(panels[i]);
        }
    }

}

// Provided by Anonymous from the following StackOverflow question
// https://stackoverflow.com/questions/22116017/how-to-pass-a-user-entered-form-value-from-html-to-javascript/22116162
function getValue(id) {
    var text = document.getElementById(id).value; //value of the text input
    var input = text.hexEncode();
    input = "0" + input;
    let XMLObject = document.getElementById('svg');
    // window.dispatchEvent(new Event("load"))
    XMLObject.setAttributeNS("", 'data', `data/kanji/${input}.svg`);
    var dummySvg = document.getElementById('kvg:StrokePaths_dummy');
    if (dummySvg.firstChild || document.styleSheets.length > 1) {
        resetDrawingBoard(dummySvg, true);
    }
    // Reset input box to empty after submit
    document.getElementById(id).value = "";

    return false;
}
// External and Internal SVG file manipulation inspired by Peter Collingridge
// in the following blog post: http://www.petercollingridge.co.uk/tutorials/svg/interactive/javascript/
window.onload = function () {
    // Update the current slider value (each time you drag the slider handle)
    var slider = document.getElementById("myRange");

    var output = document.getElementById("demo");

    slider.oninput = function () {
        output.innerHTML = this.value;
    }
    output.innerHTML = slider.value; // Display the default slider value
    // Only run the actual drawing of kanji characters when the 
    // window, along with the Javascript, and the external SVG
    // file have loaded
    document.getElementById("svg").addEventListener("load", function () {
        var tooltip = document.getElementsByClassName("error-tooltip")[0];
        tooltip.style.visibility = "hidden";
        // Load the external SVG file and get ID of requested kanji
        var XMLObject = document.getElementById('svg');
        var kanjiID = XMLObject.getAttribute('data').slice(11).replace(/\.[^/.]+$/, "")
        var svgObject = XMLObject.contentDocument;

        if (svgObject != null) {
            drawKanji(svgObject, kanjiID);
        }
    });
    document.getElementById("svg").addEventListener("error", function () {
        showErrorTooltip();
    })
}

function drawKanji(svgObject, kanjiID) {
    var svg = svgObject.lastChild;

    var strokeNumbers = svgObject.getElementById(`kvg:StrokeNumbers_${kanjiID}`);

    // Remove stroke numbers from the SVG
    if (strokeNumbers) {
        svg.removeChild(strokeNumbers);
    }


    // Get all the paths to draw individual strokes
    var strokePaths = svgObject.getElementById(`kvg:StrokePaths_${kanjiID}`);
    var paths = strokePaths.querySelectorAll("path");

    var dummySvg = document.getElementById('kvg:StrokePaths_dummy');

    // Append each stroke individually and animate as they are added

    var cssLeft = 2;
    var cssTop = 22.7;
    var style = document.createElement('style');
    style.innerHTML = "";

    var slider = document.getElementById("myRange");

    var output = document.getElementById("demo");

    slider.oninput = function () {
        output.innerHTML = this.value;

        if (dummySvg.firstChild || document.styleSheets.length > 1) {
            var XMLObject = document.getElementById('svg');
            resetDrawingBoard(dummySvg, false);
            XMLObject.setAttributeNS("", 'data', XMLObject.getAttributeNS("", "data"));
            var svgObjectCopy = XMLObject.contentDocument;

            drawKanji(svgObjectCopy, kanjiID);
        }
    }
    var time = slider.value;
    var currTime = 0;
    var animTime = (0.8 / 0.75) * time;

    function colorElements(currPath, style) {

    }


    // CSS animation of SVG heavily inspired by Jae Johns
    // in the following blog post: 
    // https://medium.theuxblog.com/the-ultimate-guide-to-animating-drawn-text-in-html-with-css-no-jquery-needed-bcdcfdb963d8
    for (var i = 0; i < paths.length; i++) {
        // main kanji drawing panel
        let currPath = paths[i]
        let clonedPath = currPath.cloneNode(false)
        dummySvg.appendChild(clonedPath);
        // Element highlight when clicking on individual strokes
        clonedPath.onmouseover = function () {
            var parentNode = currPath.parentNode;
            var elemChildren = parentNode.children;
            for (var i = 0; i < elemChildren.length; i++) {
                let child = document.getElementById(elemChildren[i].id)
                child.style.stroke = "red";
            }
        };
        clonedPath.onmouseout = function () {
            var parentNode = currPath.parentNode;
            var elemChildren = parentNode.children;
            for (var i = 0; i < elemChildren.length; i++) {
                let child = document.getElementById(elemChildren[i].id)
                child.style.stroke = "black";
            }
        }
        clonedPath.onclick = function () {
            var parentNode = currPath.parentNode;
            var elemChildren = parentNode.children;
            for (var i = 0; i < elemChildren.length; i++) {
                let child = document.getElementById(elemChildren[i].id)
                setTimeout(function () {
                    child.style.stroke = "red";
                }, 200);
                setTimeout(function () {
                    child.style.stroke = "black";
                }, 5000);
            }
        };
        var length = currPath.getTotalLength();
        var currId = paths[i].id.replace(':', "\\:");
        style.innerHTML += `#dummy-svg #${currId} {visibility: hidden; stroke-dasharray: ${length} ; stroke-dashoffset: ${length}; animation: anim-${currId} ${time}s linear ${currTime}s forwards;}`;
        style.innerHTML += `@keyframes anim-${currId} {from {visibility: visible; stroke-dasharray: ${-length};} to {visibility: visible; stroke-dashoffset: 0;} }`;
        document.body.appendChild(style);
        currTime += animTime;
        // stroke panels

        var panelSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        panelSVG.id = `panel_${i+1}_SVG`;
        panelSVG.setAttribute("height", 109);
        panelSVG.setAttribute("width", 109);
        panelSVG.setAttribute("viewBox", "0 0 109 109");
        panelSVG.setAttribute("class", "kanji_panel");

        var groupElem = document.createElementNS("http://www.w3.org/2000/svg", "g")
        groupElem.style = "fill:none;stroke: #000000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round";
        panelSVG.appendChild(groupElem);
        panelSVG.firstChild.innerHTML = dummySvg.innerHTML;
        // panelSVG.setAttribute("style", `position:fixed; width : 80px; height : 80px; top: ${cssTop}%; left: ${cssLeft}%; background-color: #00c9c8; border-radius : 7%; padding : 10px;`);
        panelSVG.setAttribute("style", `position:fixed; width : 80px; height : 80px; top: ${cssTop}%; left: ${cssLeft}%; background-color: #00c9c8; border-radius : 7%; padding : 10px;`);

        // document.getElementById("kanji_table").appendChild(panelSVG);
        document.body.appendChild(panelSVG);
        cssLeft += 8;

        if (cssLeft >= 30) {
            cssLeft = 2;
            cssTop += 16;
        }

    }
}

// Unusable at the moment until I figure out how to get a list of 
// all filenames in a github directory w/o node.js

// function displayKanji(kanjiList) {
//     for (let i = 0; i < kanjiList.length; i++) {
//         let item = document.createElement('li')
//         let kanjiID = kanjiList[i].slice(11).replace(/\.[^/.]+$/, "");
//         item.className = "kanjiMenu";
//         item.innerHTML += `<object id=${kanjiID} data=\"${kanjiList[i]}\" type=\"image/svg+xml\"></object>`;
//         document.getElementsByTagName('ul')[0].appendChild(item)
//         document.getElementById(kanjiID).addEventListener("load", function () {
//             var currSVG = document.getElementById(kanjiID).contentDocument;
//             var currStrokeNumbers = currSVG.getElementById(`kvg:StrokeNumbers_${kanjiID}`);
//             currSVG.lastChild.removeChild(currStrokeNumbers);
//         })
//     }
// }