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

function resetDrawingBoard(dummySvg) {
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
    if (document.querySelectorAll(".kanji_panel".length > 0)) {
        var panels = document.querySelectorAll(".kanji_panel");
        for (var i = 0; i < panels.length; i++) {
            document.body.removeChild(panels[i]);
        }
    }

}

// Provided by Anonymous from the following StackOverflow question
// https://stackoverflow.com/questions/22116017/how-to-pass-a-user-entered-form-value-from-html-to-javascript/22116162
function getValue(id) {
    text = document.getElementById(id).value; //value of the text input
    var input = text.hexEncode();
    input = "0" + input;
    let XMLObject = document.getElementById('svg');
    window.dispatchEvent(new Event("load"))
    XMLObject.setAttributeNS("", 'data', `data/kanji/${input}.svg`);
    var dummySvg = document.getElementById('kvg:StrokePaths_dummy');
    if (dummySvg.firstChild || document.styleSheets.length > 1) {
        resetDrawingBoard(dummySvg);
    }

    return false;
}
// External and Internal SVG file manipulation inspired by Peter Collingridge
// in the following blog post: http://www.petercollingridge.co.uk/tutorials/svg/interactive/javascript/
window.onload = function () {

    // Only run the actual drawing of kanji characters when the 
    // window, along with the Javascript, and the external SVG
    // file have loaded
    document.getElementById("svg").addEventListener("load", function () {
        // Load the external SVG file and get ID of requested kanji
        var XMLObject = document.getElementById('svg');
        var kanjiID = XMLObject.getAttribute('data').slice(11).replace(/\.[^/.]+$/, "")
        var svgObject = XMLObject.contentDocument;
        if (svgObject != null) {
            drawKanji(svgObject, kanjiID);
        }
    });
    document.getElementById("svg").addEventListener("error", () => console.log("Please enter a valid kanji!"))
}

function drawKanji(svgObject, kanjiID) {
    var svg = svgObject.lastChild;
    // Hide original kanji such that only the animated one appears
    svg.style.visibility = "hidden";


    var strokeNumbers = svgObject.getElementById(`kvg:StrokeNumbers_${kanjiID}`);

    // Remove stroke numbers from the SVG
    if (strokeNumbers) {
        svg.removeChild(strokeNumbers);
    }


    // Get all the paths to draw individual strokes
    var strokePaths = svgObject.getElementById(`kvg:${kanjiID}`);
    var paths = strokePaths.querySelectorAll("path");

    var dummySvg = document.getElementById('kvg:StrokePaths_dummy');

    // Append each stroke individually and animate as they are added
    var currTime = 0;
    var cssLeft = 2;
    var cssTop = 22.7;
    var style = document.createElement('style');
    style.innerHTML = "";
    // CSS animation of SVG heavily inspired by Jae Johns
    // in the following blog post: 
    // https://medium.theuxblog.com/the-ultimate-guide-to-animating-drawn-text-in-html-with-css-no-jquery-needed-bcdcfdb963d8
    for (var i = 0; i < paths.length; i++) {
        currPath = paths[i]
        dummySvg.appendChild(paths[i]);

        var length = currPath.getTotalLength();
        currId = paths[i].id.replace(':', "\\:");
        style.innerHTML += `#dummy-svg #${currId} {stroke-dasharray: ${length} ; stroke-dashoffset: ${length}; animation: anim-${currId} .75s linear ${currTime}s forwards;}`;
        style.innerHTML += `@keyframes anim-${currId} {from {stroke-dasharray: ${-length};} to {stroke-dashoffset: 0;} }`;
        document.body.appendChild(style);
        currTime += 0.8;

        // stroke panels

        var div = document.createElement('div');
        div.id = `panel_${i+1}`;
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
        panelSVG.setAttribute("style", `position:fixed; width : 80px; height : 80px; top: ${cssTop}%; left: ${cssLeft}%; background-color: #00c9c8; border-radius : 7%; padding : 10px;`);
        // div.appendChild(panelSVG);
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