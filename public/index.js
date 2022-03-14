//FOR TESTING VEFORE SERVERSIDE
var svg1 = {
    img: "temp/quad01.svg",
    name: "quad01.svg",
    title: "Example quad01 - quadratic Bezier commands in path data",
    description: "Picture showing a \"Q\" a \"T\" command, along with annotations showing the control points and end points",
    size: "1kb",
    rectangles: [{"x": 34, "y": 32, "w": 12.2, "h": 10.2, "numAttr":1, "units":"cm"}],
    circles: [{"cx":32,"cy":32,"r":30,"numAttr":1,"units":""},{"cx":3.52,"cy":322,"r":39,"numAttr":0,"units":"cm"}],
    paths: [{"d":"m47 36c-15 0-15 0-29.9 0-2.1 0-2.1 4-.1 4","numAttr":0},{"d":"m47 36c-15 0-15 0-29.9 0-2.1 0-2.1 4-.1 4 10.4 0 19.6 0 30 0 2 0","numAttr":1}],
    groups: [{"children":2,"numAttr":1},{"children":3,"numAttr":1},{"children":2,"numAttr":1}]
};

var svg2 = {
    img: "temp/Emoji_poo.svg",
    name: "Emoji_poo.svg",
    size: "1kb",
    numRect: "3",
    numCirc: "2",
    numPaths: "1",
    numGroups: "566666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666"
};


// Put all onload AJAX calls here, and event listeners
jQuery(document).ready(function() {

    //on load, hide forms
    $('#editRect').hide();
    $('#editCirc').hide();
    $('#editPath').hide();
    $('#editGroup').hide();

    //set change function for dropdown menu
    $('#drop').change(function(e){
        $('#editRect').slideUp();
        $('#editCirc').slideUp();
        $('#editPath').slideUp();
        $('#editGroup').slideUp();
        let dropdown = document.getElementById("drop");
        let filename = dropdown.options[dropdown.selectedIndex].text;//file name selected from dropdown
        if (filename != "Select an SVG") {
            $.ajax({
                type: 'get',
                dataType: 'json',
                url: '/viewlog',
                data: {
                    file: filename
                },
                success: function(data) {

                    let svg = {
                        name: filename,
                        title: data.title,
                        description: data.description,
                        rectangles: JSON.parse(data.rectangles),
                        circles: JSON.parse(data.circles),
                        paths: JSON.parse(data.paths),
                        groups: JSON.parse(data.groups)
                    }
    
                    addSVGToViewLog(svg);//add to viewlog
                },
                fail: function(error) {
                    console.log(error); 
                }
            })
        }
    });
    //DROP DOWN FUNCTION^^


    //addSVGToFileLog(svg1);//do for all svgs found on server!
    //addSVGToFileLog(svg2);
    //addSVGToViewPanel(svg1);

    // On page-load AJAX Example
    jQuery.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/endpoint1',   //The server endpoint we are connecting to
        data: {
            data1: "Value 1",
            data2:1234.56
        },
        success: function (data) {
            /*  Do something with returned object
                Note that what we get is an object, not a string, 
                so we do not need to parse it on the server.
                JavaScript really does handle JSONs seamlessly
            */
            jQuery('#blah').html("On page load, received string '"+data.somethingElse+"' from server");
            //We write the object to the console to show that the request was successful
            console.log(data); 

        },
        fail: function(error) {
            // Non-200 return, do something with error
            $('#blah').html("On page load, received error from server");
            console.log(error); 
        }
    });

    //for getting all the file names in /uploads
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: '/files',
        data: {
            
        },
        success: function (data) {
            ajaxFilenameToJSON(data.files);
        },
        fail: function(error) {
            console.log(error);
            alert(error);
        }
    });

    // Event listener form example , we can use this instead explicitly listening for events
    // No redirects if possible
    $('#someform').submit(function(e){
        $('#blah').html("Form has data: "+$('#entryBox').val());
        e.preventDefault();
        //Pass data to the Ajax call, so it gets passed to the server
        $.ajax({
            //Create an object for connecting to another waypoint
        });
    });
});

function setAttAjax(svgName, type, index, attName, attValue) {
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: '/changeatt',
        data: {
            file: svgName,
            type: type,
            index: index,
            attName: attName,
            attValue: attValue
        },
        success: function (data) {
            
        },
        fail: function(error) {
            console.log(error);
            alert(error);
        }
    });
}

//function for onload getting all svgs into svg File Log Panel using addSVGToFileLog
function ajaxFilenameToJSON(str) {
    let files = JSON.parse(str);

    for (let i = 0; i < Object.keys(files).length; i++) {//length of files is Object.keys(files).length
        let file = files[i];

        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/onload',
            data: {
                data1: 1234,
                fileSent: file
            },
            success: function (data) {
                addSVGToFileLog(data.retu, file);
                addToSVGDropDown(file);
            },
            fail: function(error) {
                alert(error);
            }
        });
    }
}

function addToSVGDropDown(file) {
    let dropdown = document.getElementById("drop");
    let option = document.createElement('option');
    option.className = "dropdown-content";
    option.id = 'option'+file;
    option.value = file;
    option.innerHTML = file;
    dropdown.appendChild(option);
}

function addSVGToFileLog(svg, svgName) {
    let fileLogTable = document.getElementById('table');

    //document.getElementById("nofiles").innerHTML = '';

    let newRow = fileLogTable.insertRow(-1);

    let cell0 = newRow.insertCell(0);
    cell0.className = 'imgCell';
    let img = document.createElement('img');
    img.width = 200;/*MUST MAINTAIN ASPECT RATIO*/
    img.src = '/uploads/'+svgName;//set the src for image
    $(img).click(function(e){//on click, download
        e.preventDefault();
        window.location.href = '/uploads/'+svgName;
    });
    cell0.appendChild(img);

    let cell1 = newRow.insertCell(1);
    let a1 = document.createElement('a');
    a1.id = 'a1';
    a1.innerHTML = svgName;
    a1.href = '/uploads/'+svgName;
    $('a1').click(function(e){//on click, download
        e.preventDefault();
        window.location.href = '/uploads/'+svgName;
    });
    cell1.appendChild(a1);

    let cell2 = newRow.insertCell(2);
    //let filesize = document.createTextNode(someFile.size);
    //cell2.appendChild(filesize);

    let cell3 = newRow.insertCell(3);
    let recs = document.createTextNode(svg.numRect);
    cell3.appendChild(recs);

    let cell4 = newRow.insertCell(4);
    let circs = document.createTextNode(svg.numCirc);
    cell4.appendChild(circs);

    let cell5 = newRow.insertCell(5);
    let paths = document.createTextNode(svg.numPaths);
    cell5.appendChild(paths);

    let cell6 = newRow.insertCell(6);
    let groups = document.createTextNode(svg.numGroups);
    cell6.appendChild(groups);
}


function addSVGToViewLog(svg) {
    
    let viewLogTable = document.getElementById('viewLogTable');
    document.getElementById("imgVL").src = '/uploads/'+svg.name;
    document.getElementById("titleCell").innerHTML = svg.title;
    document.getElementById("titleCell").maxLength = 256;
    document.getElementById("descCell").innerHTML = svg.description;
    document.getElementById("descCell").maxLength = 256;

    //COMPONENTS
    let tbody = document.getElementById('mytbody');
    tbody.innerHTML = '';//remove all OLD components
    let tbody2 = document.getElementById('mytbody2');

    for(let i = 0; i < svg.rectangles.length; i++) {//RECTS

        let xDef = svg.rectangles[i].x;
        let yDef = svg.rectangles[i].y;
        let wDef = svg.rectangles[i].w;
        let hDef = svg.rectangles[i].h;
        let unitsDef = svg.rectangles[i].units;
        let attributes;
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Rectangle "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showRect"+(i+1);

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "Upper left corner: x = "+svg.rectangles[i].x+svg.rectangles[i].units + ", y = "+svg.rectangles[i].y+svg.rectangles[i].units + "\nWidth: "+svg.rectangles[i].w+svg.rectangles[i].units+", Height: "+svg.rectangles[i].h+svg.rectangles[i].units;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.rectangles[i].numAttr;
        cell2.id = "oaRect"+(i+1);

        $.ajax({//server req to get attribute list
            type: 'get',
            dataType: 'json',
            url: '/attributes',
            data: {
                file: svg.name,
                type: 2,//RECT IS TYPE 1
                index: i
            },
            success: function (data) {
                attributes = JSON.parse(data.str);
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });
        
        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/immediate',
            data: {
                file: svg.name,
                type: 2,
                index: i
            },
            success: function (data) {
                if (data.truth) {
                    //if immediate child
                    $('#'+cell0.id).click(function(e) {

                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }

                        //ADD EACH BUTTON PER FORM, BUT FIRST DELETE CURRENT FORM innerHTMl= ""
                        document.getElementById('editRectHeader').innerHTML = "Edit Rect " + (i+1);

                        let editForm = document.getElementById('editRectForm');
                        editForm.innerHTML = "";
                        let buttons = document.getElementById('editRect').querySelectorAll('.submitButton');
                        buttons.forEach(button => {
                            button.remove();
                        });

                        let editX = document.createElement('input');
                        editX.type = 'text';
                        editX.value = svg.rectangles[i].x;
                        editX.id = 'editX'+(i+1);
                        editX.name = 'editX'+(i+1);
                        let editXLabel = document.createElement('label');
                        editXLabel.for = 'editX'+(i+1);
                        editXLabel.innerHTML = "x: ";
                        editForm.appendChild(editXLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editX);
                        editForm.appendChild(document.createElement('br'));

                        let editY = document.createElement('input');
                        editY.value = svg.rectangles[i].y;
                        editY.id = 'editY'+(i+1);
                        editY.name = 'editY'+(i+1);
                        let editYLabel = document.createElement('label');
                        editYLabel.for = 'editY'+(i+1);
                        editYLabel.innerHTML = "y: ";
                        editForm.appendChild(editYLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editY);
                        editForm.appendChild(document.createElement('br'));

                        let editW = document.createElement('input');
                        editW.value = svg.rectangles[i].w;
                        editW.id = 'editW'+(i+1);
                        editW.name = 'editW'+(i+1);
                        let editWLabel = document.createElement('label');
                        editWLabel.for = 'editW'+(i+1);
                        editWLabel.innerHTML = "width: ";
                        editForm.appendChild(editWLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editW);
                        editForm.appendChild(document.createElement('br'));
                        
                        let editH = document.createElement('input');
                        editH.value = svg.rectangles[i].h;
                        editH.id = 'editH'+(i+1);
                        editH.name = 'editH'+(i+1);
                        let editHLabel = document.createElement('label');
                        editHLabel.for = 'editH'+(i+1);
                        editHLabel.innerHTML = "height: ";
                        editForm.appendChild(editHLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editH);
                        editForm.appendChild(document.createElement('br'));

                        let editUnits = document.createElement('input');
                        editUnits.value = svg.rectangles[i].units;
                        editUnits.id = 'editRectUnits'+(i+1);
                        editUnits.name = 'editRectUnits'+(i+1);
                        let editUnitsLabel = document.createElement('label');
                        editUnitsLabel.for = 'editRectUnits'+(i+1);
                        editUnitsLabel.innerHTML = "units: ";
                        editForm.appendChild(editUnitsLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editUnits);
                        editForm.appendChild(document.createElement('br'));
            
                        //OTHER ATTRIBUTES
                        for (let j = 0; j < attributes.length; j++) {
                            let input = document.createElement('input');
                            input.value = attributes[j].value;
                            input.name = 'rectAtt'+(i+1)+j;
                            input.id = 'rectAtt'+(i+1)+j;
                            let label = document.createElement('label');
                            label.for = input.name;
                            label.innerHTML = attributes[j].name;
                            editForm.appendChild(label);
                            editForm.appendChild(document.createElement('br'));
                            editForm.appendChild(input);
                            editForm.appendChild(document.createElement('br'));
                        }

                        //NEW ATTRIBUTE FORM
                        let editNewName = document.createElement('input');
                        editNewName.id = 'editRectNewName'+(i+1);
                        editNewName.name = 'editRectNewName'+(i+1);
                        let editNewNameLabel = document.createElement('label');
                        editNewNameLabel.for = 'editRectNewName'+(i+1);
                        editNewNameLabel.innerHTML = "New Attribute Name: ";
                        editForm.appendChild(editNewNameLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewName);
                        editForm.appendChild(document.createElement('br'));

                        let editNewValue = document.createElement('input');
                        editNewValue.id = 'editRectNewValue'+(i+1);
                        editNewValue.name = 'editRectNewValue'+(i+1);
                        let editNewValueLabel = document.createElement('label');
                        editNewValueLabel.for = 'editRectNewValue'+(i+1);
                        editNewValueLabel.innerHTML = "New Attribute Value: ";
                        editForm.appendChild(editNewValueLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewValue);
                        editForm.appendChild(document.createElement('br'));

                        let submitButton = document.createElement('button');
                        submitButton.id = 'submitRect'+(i+1);
                        submitButton.className = "submitButton";
                        submitButton.innerHTML = "Submit";
                        document.getElementById('editRect').appendChild(submitButton);

                        $("#submitRect"+(i+1)).click(function (e) {//SUBMIT BUTToN PRESSED
                            alert("pressed"+(i+1));
                            if (document.getElementById('editX'+(i+1)).value != xDef) {
                                //setAttAjax(svg.name, 2, i, "x", document.getElementById('editCX').value);
                                alert("diff X: "+document.getElementById('editX'+(i+1)).value+" and "+xDef);
                            }
                            if (document.getElementById('editY'+(i+1)).value != yDef) {
                                alert("diff Y: "+document.getElementById('editY'+(i+1)).value+" and "+yDef);
                            }
                            if (document.getElementById('editW'+(i+1)).value != wDef) {
                                alert("diff W");
                            }
                            if (document.getElementById('editH'+(i+1)).value != hDef) {
                                alert("diff H");
                            }
                            if (document.getElementById('editRectUnits'+(i+1)).value != unitsDef) {
                                alert("diff UNITS");
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('rectAtt'+(i+1)+j).value != attributes[j].value) {
                                    alert("diff OA"+j);
                                }
                            }
                            $('#editRect').slideUp();
                        });
            
                        $('#editRect').slideDown();
                    });
                }
                else {
                    //if component is not editable
                    cell0.className = "noeditButton";
                    $('#'+cell0.id).click(function(e) {
                        $('#editRect').slideUp();
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }
                    });
                }
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });
    }


    //========================================================ALL CIRCLES====================================================
    for (let i = 0; i < svg.circles.length; i++) {//CIRCLES
        let attributes;
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Circle "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showCirc"+(i+1);

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "Centre: x = "+svg.circles[i].cx+svg.circles[i].units + ", y = "+svg.circles[i].cy+svg.circles[i].units + ", radius: "+svg.circles[i].r+svg.circles[i].units;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.circles[i].numAttr;
        cell2.id = "oaCirc"+(i+1);

        tbody2.innerHTML = '';//empty tbody2 first
        $.ajax({//server req to get attribute list
            type: 'get',
            dataType: 'json',
            url: '/attributes',
            data: {
                file: svg.name,
                type: 1,//Circ IS TYPE 1
                index: i
            },
            success: function (data) {
                attributes = JSON.parse(data.str);
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });

        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/immediate',
            data: {
                file: svg.name,
                type: 1,
                index: i
            },
            success: function (data) {
                if (data.truth) {
                    //if immediate child
                    $('#'+cell0.id).click(function(e) {
            
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }

                        document.getElementById('editCircHeader').innerHTML = "Edit Circ " + (i+1);

                        let editForm = document.getElementById('editCircForm');
                        editForm.innerHTML = "";
                        let buttons = document.getElementById('editCirc').querySelectorAll('.submitButton');
                        buttons.forEach(button => {
                            button.remove();
                        });

                        let editCX = document.createElement('input');
                        editCX.type = 'text';
                        editCX.value = svg.circles[i].cx;
                        editCX.id = 'editCX'+(i+1);
                        editCX.name = 'editCX'+(i+1);
                        let editCXLabel = document.createElement('label');
                        editCXLabel.for = 'editCX'+(i+1);
                        editCXLabel.innerHTML = "cx: ";
                        editForm.appendChild(editCXLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editCX);
                        editForm.appendChild(document.createElement('br'));

                        let editCY = document.createElement('input');
                        editCY.value = svg.circles[i].cy;
                        editCY.id = 'editCY'+(i+1);
                        editCY.name = 'editCY'+(i+1);
                        let editCYLabel = document.createElement('label');
                        editCYLabel.for = 'editCY'+(i+1);
                        editCYLabel.innerHTML = "cy: ";
                        editForm.appendChild(editCYLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editCY);
                        editForm.appendChild(document.createElement('br'));

                        let editR = document.createElement('input');
                        editR.value = svg.circles[i].r;
                        editR.id = 'editR'+(i+1);
                        editR.name = 'editR'+(i+1);
                        let editRLabel = document.createElement('label');
                        editRLabel.for = 'editR'+(i+1);
                        editRLabel.innerHTML = "radius: ";
                        editForm.appendChild(editRLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editR);
                        editForm.appendChild(document.createElement('br'));

                        let editUnits = document.createElement('input');
                        editUnits.value = svg.circles[i].units;
                        editUnits.id = 'editCircUnits'+(i+1);
                        editUnits.name = 'editCircUnits'+(i+1);
                        let editUnitsLabel = document.createElement('label');
                        editUnitsLabel.for = 'editCircUnits'+(i+1);
                        editUnitsLabel.innerHTML = "units: ";
                        editForm.appendChild(editUnitsLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editUnits);
                        editForm.appendChild(document.createElement('br'));

                        //OTHER ATTRIBUTES
                        for (let j = 0; j < attributes.length; j++) {
                            let input = document.createElement('input');
                            input.value = attributes[j].value;
                            input.name = 'rectAtt'+(i+1)+j;
                            input.id = 'rectAtt'+(i+1)+j;
                            let label = document.createElement('label');
                            label.for = input.name;
                            label.innerHTML = attributes[j].name;
                            editForm.appendChild(label);
                            editForm.appendChild(document.createElement('br'));
                            editForm.appendChild(input);
                            editForm.appendChild(document.createElement('br'));
                        }

                        //NEW ATTRIBUTE FORM
                        let editNewName = document.createElement('input');
                        editNewName.id = 'editCircNewName'+(i+1);
                        editNewName.name = 'editCircNewName'+(i+1);
                        let editNewNameLabel = document.createElement('label');
                        editNewNameLabel.for = 'editCircNewName'+(i+1);
                        editNewNameLabel.innerHTML = "New Attribute Name: ";
                        editForm.appendChild(editNewNameLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewName);
                        editForm.appendChild(document.createElement('br'));

                        let editNewValue = document.createElement('input');
                        editNewValue.id = 'editCircNewValue'+(i+1);
                        editNewValue.name = 'editCircNewValue'+(i+1);
                        let editNewValueLabel = document.createElement('label');
                        editNewValueLabel.for = 'editCircNewValue'+(i+1);
                        editNewValueLabel.innerHTML = "New Attribute Value: ";
                        editForm.appendChild(editNewValueLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewValue);
                        editForm.appendChild(document.createElement('br'));

                        let submitButton = document.createElement('button');
                        submitButton.id = 'submitCirc'+(i+1);
                        submitButton.className = "submitButton";
                        submitButton.innerHTML = "Submit";
                        document.getElementById('editCirc').appendChild(submitButton);
            
                        $("#submitCirc"+(i+1)).click(function () {//SUBMIT BUTToN PRESSED
                            if (document.getElementById('editCX'+(i+1)).value != svg.circles[i].cx) {
                                //setAttAjax(svg.name, 1, i, "cx", document.getElementById('editCX'+(i+1)).value);
                                alert("diff CX");
                            }
                            if (document.getElementById('editCY'+(i+1)).value != svg.circles[i].cy) {
                                alert("diff CY");
                            }
                            if (document.getElementById('editR'+(i+1)).value != svg.circles[i].r) {
                                alert("diff R");
                            }
                            if (document.getElementById('editCircUnits'+(i+1)).value != svg.circles[i].units) {
                                alert("diff UNITS");
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('circAtt'+(i+1)+j).value != attributes[j].value) {
                                    alert("diff OA");
                                }
                            }
                            $('#editCirc').slideUp();
                        });

                        $('#editCirc').slideDown();
                    });
                }
                else {
                    //if component is not editable
                    cell0.className = "noeditButton";
                    $('#'+cell0.id).click(function(e) {
                        $('#editCirc').slideUp();
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }
                    });
                }
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });
    }

    for (let i = 0; i < svg.paths.length; i++) {//PATHS
        let attributes;
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Path "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showPath"+(i+1);

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "path data = "+svg.paths[i].d;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.paths[i].numAttr;
        cell2.id = "oaPath"+(i+1);

        $.ajax({//server req to get attribute list
            type: 'get',
            dataType: 'json',
            url: '/attributes',
            data: {
                file: svg.name,
                type: 3,//PATH IS TYPE 3
                index: i
            },
            success: function (data) {
                attributes = JSON.parse(data.str);
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });

        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/immediate',
            data: {
                file: svg.name,
                type: 3,
                index: i
            },
            success: function (data) {
                if (data.truth) {
                    //if immediate child
                    $('#'+cell0.id).click(function(e) {
            
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }

                        document.getElementById('editPathHeader').innerHTML = "Edit Path " + (i+1);

                        let editForm = document.getElementById('editPathForm');
                        editForm.innerHTML = "";
                        let buttons = document.getElementById('editPath').querySelectorAll('.submitButton');
                        buttons.forEach(button => {
                            button.remove();
                        });

                        let editD = document.createElement('input');
                        editD.type = 'text';
                        editD.value = svg.paths[i].d;
                        editD.id = 'editD'+(i+1);
                        editD.name = 'editD'+(i+1);
                        let editDLabel = document.createElement('label');
                        editDLabel.for = 'editD'+(i+1);
                        editDLabel.innerHTML = "data: ";
                        editForm.appendChild(editDLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editD);
                        editForm.appendChild(document.createElement('br'));

                        //OTHER ATTRIBUTES
                        for (let j = 0; j < attributes.length; j++) {
                            let input = document.createElement('input');
                            input.value = attributes[j].value;
                            input.name = 'pathAtt'+(i+1)+j;
                            input.id = 'pathAtt'+(i+1)+j;
                            let label = document.createElement('label');
                            label.for = input.name;
                            label.innerHTML = attributes[j].name;
                            editForm.appendChild(label);
                            editForm.appendChild(document.createElement('br'));
                            editForm.appendChild(input);
                            editForm.appendChild(document.createElement('br'));
                        }

                        //NEW ATTRIBUTE FORM
                        let editNewName = document.createElement('input');
                        editNewName.id = 'editPathNewName'+(i+1);
                        editNewName.name = 'editPathNewName'+(i+1);
                        let editNewNameLabel = document.createElement('label');
                        editNewNameLabel.for = 'editPathNewName'+(i+1);
                        editNewNameLabel.innerHTML = "New Attribute Name: ";
                        editForm.appendChild(editNewNameLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewName);
                        editForm.appendChild(document.createElement('br'));

                        let editNewValue = document.createElement('input');
                        editNewValue.id = 'editPathNewValue'+(i+1);
                        editNewValue.name = 'editPathNewValue'+(i+1);
                        let editNewValueLabel = document.createElement('label');
                        editNewValueLabel.for = 'editPathNewValue'+(i+1);
                        editNewValueLabel.innerHTML = "New Attribute Value: ";
                        editForm.appendChild(editNewValueLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewValue);
                        editForm.appendChild(document.createElement('br'));

                        let submitButton = document.createElement('button');
                        submitButton.id = 'submitPath'+(i+1);
                        submitButton.className = "submitButton";
                        submitButton.innerHTML = "Submit";
                        document.getElementById('editPath').appendChild(submitButton);
            
                        $("#submitPath"+(i+1)).click(function () {//SUBMIT BUTToN PRESSED
                            if (document.getElementById('editD'+(i+1)).value != svg.paths[i].d) {
                                //setAttAjax(svg.name, 1, i, "cx", document.getElementById('editCX'+(i+1)).value);
                                alert("diff D");
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('pathAtt'+(i+1)+j).value != attributes[j].value) {
                                    alert("diff OA");
                                }
                            }
                            $('#editPath').slideUp();
                        });

                        $('#editPath').slideDown();
                    });
                }
                else {
                    //if component is not editable
                    cell0.className = "noeditButton";
                    $('#'+cell0.id).click(function(e) {
                        $('#editPath').slideUp();
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }
                    });
                }
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });
    }

    for (let i = 0; i < svg.groups.length; i++) {//GROUPS
        let attributes;
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Group "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showGroup"+(i+1);

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = svg.groups[i].children+" child elements"
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.groups[i].numAttr;
        cell2.id = "oaGroup"+(i+1);

        $.ajax({//server req to get attribute list
            type: 'get',
            dataType: 'json',
            url: '/attributes',
            data: {
                file: svg.name,
                type: 4,//GROUP IS TYPE 4
                index: i
            },
            success: function (data) {
                attributes = JSON.parse(data.str);
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });

        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/immediate',
            data: {
                file: svg.name,
                type: 4,
                index: i
            },
            success: function (data) {
                if (data.truth) {
                    //if immediate child
                    $('#'+cell0.id).click(function(e) {
            
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }

                        document.getElementById('editGroupHeader').innerHTML = "Edit Group " + (i+1);

                        let editForm = document.getElementById('editGroupForm');
                        editForm.innerHTML = "";
                        let buttons = document.getElementById('editGroup').querySelectorAll('.submitButton');
                        buttons.forEach(button => {
                            button.remove();
                        });

                        //OTHER ATTRIBUTES
                        for (let j = 0; j < attributes.length; j++) {
                            let input = document.createElement('input');
                            input.value = attributes[j].value;
                            input.name = 'groupAtt'+(i+1)+j;
                            input.id = 'groupAtt'+(i+1)+j;
                            let label = document.createElement('label');
                            label.for = input.name;
                            label.innerHTML = attributes[j].name;
                            editForm.appendChild(label);
                            editForm.appendChild(document.createElement('br'));
                            editForm.appendChild(input);
                            editForm.appendChild(document.createElement('br'));
                        }

                        //NEW ATTRIBUTE FORM
                        let editNewName = document.createElement('input');
                        editNewName.id = 'editGroupNewName'+(i+1);
                        editNewName.name = 'editGroupNewName'+(i+1);
                        let editNewNameLabel = document.createElement('label');
                        editNewNameLabel.for = 'editGroupNewName'+(i+1);
                        editNewNameLabel.innerHTML = "New Attribute Name: ";
                        editForm.appendChild(editNewNameLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewName);
                        editForm.appendChild(document.createElement('br'));

                        let editNewValue = document.createElement('input');
                        editNewValue.id = 'editGroupNewValue'+(i+1);
                        editNewValue.name = 'editGroupNewValue'+(i+1);
                        let editNewValueLabel = document.createElement('label');
                        editNewValueLabel.for = 'editGroupNewValue'+(i+1);
                        editNewValueLabel.innerHTML = "New Attribute Value: ";
                        editForm.appendChild(editNewValueLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(editNewValue);
                        editForm.appendChild(document.createElement('br'));

                        let submitButton = document.createElement('button');
                        submitButton.id = 'submitGroup'+(i+1);
                        submitButton.className = "submitButton";
                        submitButton.innerHTML = "Submit";
                        document.getElementById('editGroup').appendChild(submitButton);
            
                        $("#submitGroup"+(i+1)).click(function () {//SUBMIT BUTToN PRESSED
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('groupAtt'+(i+1)+j).value != attributes[j].value) {
                                    alert("diff OA");
                                }
                            }
                            $('#editGroup').slideUp();
                        });

                        $('#editGroup').slideDown();
                    });
                }
                else {
                    //if component is not editable
                    cell0.className = "noeditButton";
                    $('#'+cell0.id).click(function(e) {
                        $('#editGroup').slideUp();
                        tbody2.innerHTML = '';//empty tbody2 first
                        for (let j = 0; j < attributes.length; j++) {
                            let row = tbody2.insertRow(-1);
                            let cell = row.insertCell(0);
                            cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
                        }
                    });
                }
            },
            fail: function(error) {
                console.log(error);
                alert(error);
            }
        });
    }
}
