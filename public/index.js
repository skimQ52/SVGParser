/* index.js
    INCLUDES CLIENT SIDE CODE!
*  Author: Skylar Mawle 1143676
*  CIS*2750 D. Nikitenko
*
*/
// Put all onload AJAX calls here, and event listeners
jQuery(document).ready(function() {

    //on load, hide forms
    $('#editRect').hide();
    $('#editCirc').hide();
    $('#editPath').hide();
    $('#editGroup').hide();

    $('#viewLog').hide();

    //CREATE SVG!
    $('#addSVGForm').hide();

    $('#addSVGHeader').click(function(e) {
        e.preventDefault();
        $('#addSVGForm').slideDown();
    });

    $('#addSVGSubmit').click(function(e) {
        e.preventDefault();
        if (!document.getElementById('newSVGName').value && !document.getElementById('newSVGTitle').value && !document.getElementById('newSVGDesc').value && !document.getElementById('newSVGView').value) {
            $('#addSVGForm').slideUp();
        }
        else if (!document.getElementById('newSVGName').value) {
            alert("Please provide a filename!");
        }
        else if (document.getElementById('newSVGName').value.split('.').pop() != "svg") {
            alert('Please provide a valid filename! (.svg)');
        }
        else {
            alert(document.getElementById('newSVGName').value+document.getElementById('newSVGTitle').value+document.getElementById('newSVGDesc').value+document.getElementById('newSVGView').value);
            $.ajax({
                type: 'get',
                dataType: 'json',
                url: '/createsvg',
                data: {
                    file: document.getElementById('newSVGName').value,
                    title: document.getElementById('newSVGTitle').value,
                    desc: document.getElementById('newSVGDesc').value,
                    viewbox: document.getElementById('newSVGView').value
                },
                success: function (data) {
                    if (data.status == 1) {
                        $('#addSVGForm').slideUp();
                        window.location.reload();
                    }
                    else {
                        alert("Unable to create this SVG...");
                    }
                },
                fail: function(error) {
                    console.log(error);
                    alert(error);
                }
            });
        }
    });

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
        $('#viewLog').slideDown();//show viewlog for first time (if needed)
    });
    //DROP DOWN FUNCTION^^

    //for getting all the file names in /uploads
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: '/files',
        data: {
            
        },
        success: function (data) {
            if (!data.status) {
                alert("One or more of the files were invalid... They have been deleted from the server.");
            }
            ajaxFilenameToJSON(data.files);
        },
        fail: function(error) {
            console.log(error);
            alert(error);
        }
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
            if (data.status == 0 || data.status == -1) {
                alert("Invalid Attribute: "+attName)
            }
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
                addSVGToFileLog(data.retu, file, data.size);
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

function addSVGToFileLog(svg, svgName, size) {
    let fileLogTable = document.getElementById('table');

    $('#noFilesRow').hide();

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
    let filesize = document.createTextNode(size+"kB");
    cell2.appendChild(filesize);

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
    

    $('#addRectForm').hide();
    $('#addCircForm').hide();
    $('#changeTitleForm').hide();
    $('#scaleAllForm').hide();
    $('#svgAttsForm').hide();

    document.getElementById("imgVL").src = '/uploads/'+svg.name;
    document.getElementById("imgVL").width = 800;

    document.getElementById("titleCell").innerHTML = svg.title;
    document.getElementById("descCell").innerHTML = svg.description;


    //COMPONENTS
    let tbody = document.getElementById('mytbody');
    tbody.innerHTML = '';//remove all OLD components
    let tbody2 = document.getElementById('mytbody2');

    for(let i = 0; i < svg.rectangles.length; i++) {//RECTS

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

                        //SCALE Rect
                        let scaleRect = document.createElement('input');
                        scaleRect.id = 'scaleRect'+(i+1);
                        scaleRect.name = 'scaleRect'+(i+1);
                        let scaleRectLabel = document.createElement('label');
                        scaleRectLabel.for = 'scaleRect'+(i+1);
                        scaleRectLabel.innerHTML = "Scale rect by factor: ";
                        editForm.appendChild(scaleRectLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(scaleRect);
                        editForm.appendChild(document.createElement('br'));

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
                            let changed = false;
                            if (document.getElementById('editX'+(i+1)).value != svg.rectangles[i].x) {
                                setAttAjax(svg.name, 2, i, "x", document.getElementById('editX'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('editY'+(i+1)).value != svg.rectangles[i].y) {
                                setAttAjax(svg.name, 2, i, "y", document.getElementById('editY'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('editW'+(i+1)).value != svg.rectangles[i].w) {
                                setAttAjax(svg.name, 2, i, "width", document.getElementById('editW'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('editH'+(i+1)).value != svg.rectangles[i].h) {
                                setAttAjax(svg.name, 2, i, "height", document.getElementById('editH'+(i+1)).value);
                                changed = true;
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('rectAtt'+(i+1)+j).value != attributes[j].value) {
                                    setAttAjax(svg.name, 2, i, attributes[j].name, document.getElementById('rectAtt'+(i+1)+j).value);
                                    changed = true;
                                }
                            }
                            if (document.getElementById('editRectNewName'+(i+1)).value && document.getElementById('editRectNewValue'+(i+1)).value) {
                                setAttAjax(svg.name, 2, i, document.getElementById('editRectNewName'+(i+1)).value, document.getElementById('editRectNewValue'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('scaleRect'+(i+1)).value) {
                                if (parseFloat(document.getElementById('scaleRect'+(i+1)).value) > 0) {
                                    $.ajax({
                                        type: 'get',
                                        dataType: 'json',
                                        url: '/scale',
                                        data: {
                                            file: svg.name,
                                            type: 2,
                                            index: i,
                                            factor: parseFloat(document.getElementById('scaleRect'+(i+1)).value)
                                        },
                                        success: function (data) {
                                            if (data.status == -1) {
                                                alert("Created invalid SVG...");
                                            }
                                            if (data.status == 0) {
                                                alert("Could not save this scaling...");
                                            }
                                        },
                                        fail: function(error) {
                                            console.log(error);
                                            alert(error);
                                        }
                                    });
                                    changed = true;
                                }
                                else {
                                    alert("Please enter a valid scaling factor.");
                                }
                            }

                            $('#editRect').slideUp();
                            if (changed) {
                                window.location.reload(); 
                            }
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

                        //OTHER ATTRIBUTES
                        for (let j = 0; j < attributes.length; j++) {
                            let input = document.createElement('input');
                            input.value = attributes[j].value;
                            input.name = 'circAtt'+(i+1)+j;
                            input.id = 'circAtt'+(i+1)+j;
                            let label = document.createElement('label');
                            label.for = input.name;
                            label.innerHTML = attributes[j].name;
                            editForm.appendChild(label);
                            editForm.appendChild(document.createElement('br'));
                            editForm.appendChild(input);
                            editForm.appendChild(document.createElement('br'));
                        }

                        //SCALE Circ
                        let scaleCirc = document.createElement('input');
                        scaleCirc.id = 'scaleCirc'+(i+1);
                        scaleCirc.name = 'scaleCirc'+(i+1);
                        let scaleCircLabel = document.createElement('label');
                        scaleCircLabel.for = 'scaleCirc'+(i+1);
                        scaleCircLabel.innerHTML = "Scale circ by factor: ";
                        editForm.appendChild(scaleCircLabel);
                        editForm.appendChild(document.createElement('br'));
                        editForm.appendChild(scaleCirc);
                        editForm.appendChild(document.createElement('br'));

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
                            let changed = false;
                            if (document.getElementById('editCX'+(i+1)).value != svg.circles[i].cx) {
                                setAttAjax(svg.name, 1, i, "cx", document.getElementById('editCX'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('editCY'+(i+1)).value != svg.circles[i].cy) {
                                setAttAjax(svg.name, 1, i, "cy", document.getElementById('editCY'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('editR'+(i+1)).value != svg.circles[i].r) {
                                setAttAjax(svg.name, 1, i, "r", document.getElementById('editR'+(i+1)).value);
                                changed = true;
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('circAtt'+(i+1)+j).value != attributes[j].value) {
                                    setAttAjax(svg.name, 1, i, attributes[j].name, document.getElementById('circAtt'+(i+1)+j).value);
                                    changed = true;
                                }
                            }
                            if (document.getElementById('editCircNewName'+(i+1)).value && document.getElementById('editCircNewValue'+(i+1)).value) {
                                setAttAjax(svg.name, 1, i, document.getElementById('editCircNewName'+(i+1)).value, document.getElementById('editCircNewValue'+(i+1)).value);
                                changed = true;
                            }
                            if (document.getElementById('scaleCirc'+(i+1)).value) {
                                if (parseFloat(document.getElementById('scaleCirc'+(i+1)).value) > 0) {
                                    $.ajax({
                                        type: 'get',
                                        dataType: 'json',
                                        url: '/scale',
                                        data: {
                                            file: svg.name,
                                            type: 1,
                                            index: i,
                                            factor: parseFloat(document.getElementById('scaleCirc'+(i+1)).value)
                                        },
                                        success: function (data) {
                                            if (data.status == -1) {
                                                alert("Created invalid SVG...");
                                            }
                                            if (data.status == 0) {
                                                alert("Could not save this scaling...");
                                            }
                                        },
                                        fail: function(error) {
                                            console.log(error);
                                            alert(error);
                                        }
                                    });
                                    changed = true;
                                }
                                else {
                                    alert("Please enter a valid scaling factor.");
                                }
                            }

                            $('#editCirc').slideUp();
                            if (changed) {
                                window.location.reload(); 
                            }
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
                            let changed = false;
                            if (document.getElementById('editD'+(i+1)).value != svg.paths[i].d) {
                                setAttAjax(svg.name, 3, i, "d", document.getElementById('editD'+(i+1)).value);
                                changed = true;
                            }
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('pathAtt'+(i+1)+j).value != attributes[j].value) {
                                    setAttAjax(svg.name, 3, i, attributes[j].name, document.getElementById('pathAtt'+(i+1)+j).value);
                                    changed = true;
                                }
                            }
                            if (document.getElementById('editPathNewName'+(i+1)).value && document.getElementById('editPathNewValue'+(i+1)).value) {
                                setAttAjax(svg.name, 3, i, document.getElementById('editPathNewName'+(i+1)).value, document.getElementById('editPathNewValue'+(i+1)).value);
                                changed = true;
                            }
                            $('#editPath').slideUp();
                            if (changed) {
                                window.location.reload();
                            }
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
                            let changed = false;
                            for (let j = 0; j < attributes.length; j++) {
                                if (document.getElementById('groupAtt'+(i+1)+j).value != attributes[j].value) {
                                    setAttAjax(svg.name, 4, i, attributes[j].name, document.getElementById('groupAtt'+(i+1)+j).value);
                                    changed = true;
                                }
                            }
                            if (document.getElementById('editGroupNewName'+(i+1)).value && document.getElementById('editGroupNewValue'+(i+1)).value) {
                                setAttAjax(svg.name, 4, i, document.getElementById('editGroupNewName'+(i+1)).value, document.getElementById('editGroupNewValue'+(i+1)).value);
                                changed = true;
                            }
                            $('#editGroup').slideUp();
                            if (changed) {
                                window.location.reload();
                            }
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


    //===================================================ADDING COMPONENT SECTION============================================
    document.getElementById('addRectHeaderDiv').innerHTML = "";//delete old header
    let addRectHeader = document.createElement('h10');
    addRectHeader.className = 'addHeader';
    addRectHeader.innerHTML = 'Add Rect';
    document.getElementById('addRectHeaderDiv').appendChild(addRectHeader);
    
    addRectHeader.onclick = function(e) {
        e.preventDefault();
        $('#addRectForm').slideDown();

        document.getElementById('addRectSubmitDiv').innerHTML = "";//delete old submit button
        let submitButton = document.createElement('button');
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Submit";
        document.getElementById('addRectSubmitDiv').appendChild(submitButton);

        submitButton.onclick = function(e) {//SUBMIT BUTToN PRESSED
            e.preventDefault();
            if (!document.getElementById('newRectX').value && !document.getElementById('newRectY').value && !document.getElementById('newRectW').value && !document.getElementById('newRectH').value) {
                $('#addRectForm').slideUp();
            }
            else if (!document.getElementById('newRectX').value || !document.getElementById('newRectY').value || !document.getElementById('newRectW').value || !document.getElementById('newRectH').value) {
                alert("Please enter values for all necessary parameters!");
            }
            else if (!parseFloat(document.getElementById('newRectX').value) || !parseFloat(document.getElementById('newRectY').value) || !parseFloat(document.getElementById('newRectW').value) || !parseFloat(document.getElementById('newRectH').value)) {
                alert("Values must be numeric...");
            }
            else if (document.getElementById('newRectW').value < 0 || document.getElementById('newRectH').value < 0) {
                alert("Width/Height of a rectangle cannot be negative.");
            }
            else {
                rectangle = {
                    x: parseFloat(document.getElementById('newRectX').value),
                    y: parseFloat(document.getElementById('newRectY').value),
                    w: parseFloat(document.getElementById('newRectW').value),
                    h: parseFloat(document.getElementById('newRectH').value),
                    units: document.getElementById('newRectUnits').value
                }
                let str = JSON.stringify(rectangle);

                $.ajax({
                    type: 'get',
                    dataType: 'json',
                    url: '/addrect',
                    data: {
                        file: svg.name,
                        str: str,
                        fill: document.getElementById('newRectFill').value
                    },
                
                    success: function (data) {
                        if (!data.status) {
                            alert("Something went wrong with adding this component...");
                        }  
                    },

                    fail: function (error) {
                        alert("error adding component "+error);
                    }
                });
                $('#addRectForm').slideUp();
                window.location.reload();
            }
        };
    };

    //add circle
    document.getElementById('addCircHeaderDiv').innerHTML = "";//delete old header
    let addCircHeader = document.createElement('h10');
    addCircHeader.className = 'addHeader';
    addCircHeader.innerHTML = 'Add Circ';
    document.getElementById('addCircHeaderDiv').appendChild(addCircHeader);
    
    addCircHeader.onclick = function(e) {
        e.preventDefault();
        
        $('#addCircForm').slideDown();

        document.getElementById('addCircSubmitDiv').innerHTML = "";//delete old submit button
        let submitButton = document.createElement('button');
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Submit";
        document.getElementById('addCircSubmitDiv').appendChild(submitButton);

        submitButton.onclick = function(e) {//SUBMIT BUTToN PRESSED
            e.preventDefault();
            if (!document.getElementById('newCircR').value && !document.getElementById('newCircCX').value && !document.getElementById('newCircCY').value) {
                $('#addCircForm').slideUp();
            }
            else if (!document.getElementById('newCircR').value || !document.getElementById('newCircCX').value || !document.getElementById('newCircCY').value) {
                alert("Please enter values for all necessary parameters!");
            }
            else if (!parseFloat(document.getElementById('newCircR').value) || !parseFloat(document.getElementById('newCircCX').value) || !parseFloat(document.getElementById('newCircCY').value)) {
                alert("Values must be numeric...");
            }
            else if (parseFloat(document.getElementById('newCircR').value) < 0) {
                alert("Radius of a circle cannot be negative.");
            }
            else {
                circle = {
                    cx: parseFloat(document.getElementById('newCircCX').value),
                    cy: parseFloat(document.getElementById('newCircCY').value),
                    r: parseFloat(document.getElementById('newCircR').value),
                    units: document.getElementById('newCircUnits').value
                };
                let str = JSON.stringify(circle);

                $.ajax({
                    type: 'get',
                    dataType: 'json',
                    url: '/addcirc',
                    data: {
                        file: svg.name,
                        str: str,
                        fill: document.getElementById('newCircFill').value
                    },
                
                    success: function (data) {
                        if (!data.status) {
                            alert("Something went wrong with adding this component...");
                        }
                    },

                    fail: function (error) {
                        alert("error adding component "+error);
                    }
                });
                $('#addCircForm').slideUp();
                window.location.reload();
            }
        };
    };

//===============================================CHANGE TITLE/DESC===================================================
    document.getElementById('changeTitleHeaderDiv').innerHTML = "";//delete old header
    let changeTitleHeader = document.createElement('h10');
    changeTitleHeader.className = 'addHeader';
    changeTitleHeader.innerHTML = 'Title/Desc';
    document.getElementById('changeTitleHeaderDiv').appendChild(changeTitleHeader);
    
    changeTitleHeader.onclick = function(e) {
        e.preventDefault();
        
        $('#changeTitleForm').slideDown();

        document.getElementById('changeTitleSubmitDiv').innerHTML = "";//delete old submit button
        let submitButton = document.createElement('button');
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Submit";
        document.getElementById('changeTitleSubmitDiv').appendChild(submitButton);

        submitButton.onclick = function(e) {//SUBMIT BUTToN PRESSED
            e.preventDefault();
            if (!document.getElementById('changeTitleValue').value && !document.getElementById('changeTitleType').value) {
                $('#changeTitleForm').slideUp();
            }
            else if(!document.getElementById('changeTitleValue').value || !document.getElementById('changeTitleType').value) {
                alert("Please enter values for both the type and the new value.");
            }
            else if(document.getElementById('changeTitleType').value != "desc" && document.getElementById('changeTitleType').value != "title") {
                alert("Type entered is not valid, please enter \"desc\" or \"title\".");
            }
            else {
    
                $.ajax({
                    type: 'get',
                    dataType: 'json',
                    url: '/titledesc',
                    data: {
                        file: svg.name,
                        text: document.getElementById('changeTitleValue').value,
                        type: document.getElementById('changeTitleType').value
                    },
                    
                    success: function (data) {
                        if (!data.status) {
                            alert("Something went wrong with changing the title...");
                        }
                    },
    
                    fail: function (error) {
                        alert("error adding component "+error);
                    }
                });
                $('#changeTitleForm').slideUp();
                window.location.reload();
            }
        };
    };

    //===============================================BONUS: SCALE ALL SHAPES===================================================
    document.getElementById('scaleAllHeaderDiv').innerHTML = "";//delete old header
    let scaleAllHeader = document.createElement('h10');
    scaleAllHeader.className = 'addHeader';
    scaleAllHeader.innerHTML = 'Scale';
    document.getElementById('scaleAllHeaderDiv').appendChild(scaleAllHeader);
    
    scaleAllHeader.onclick = function(e) {
        e.preventDefault();
        
        $('#scaleAllForm').slideDown();

        document.getElementById('scaleAllSubmitDiv').innerHTML = "";//delete old submit button
        let submitButton = document.createElement('button');
        submitButton.className = "submitButton";
        submitButton.innerHTML = "Submit";
        document.getElementById('scaleAllSubmitDiv').appendChild(submitButton);

        submitButton.onclick = function(e) {//SUBMIT BUTToN PRESSED
            e.preventDefault();
            if (!document.getElementById('scaleAllType').value && !document.getElementById('scaleAllFactor').value) {
                $('#scaleAllForm').slideUp();
            }
            else if (document.getElementById('scaleAllType').value != "rect" && document.getElementById('scaleAllType').value != "circ" && document.getElementById('scaleAllType').value != "image") {
                alert("Please enter one of the specified types.");
            }
            else {
                if (parseFloat(document.getElementById('scaleAllFactor').value) > 0) {
                    $.ajax({
                        type: 'get',
                        dataType: 'json',
                        url: '/scaleall',
                        data: {
                            file: svg.name,
                            type: document.getElementById('scaleAllType').value,
                            factor: parseFloat(document.getElementById('scaleAllFactor').value)
                        },
                        success: function (data) {
                            if (data.status == -1) {
                                alert("Created invalid SVG...");
                            }
                            if (data.status == 0) {
                                alert("Could not save this scaling...");
                            }
                        },
                        fail: function(error) {
                            console.log(error);
                            alert(error);
                        }
                    });
                    $('#scaleAllForm').slideUp();
                    window.location.reload();
                }
                else {
                    alert("Please enter a valid scaling factor.");
                }
            }
        };
    };

    //EDIT SVG ATTRIBUTES
    document.getElementById('svgAttsHeaderDiv').innerHTML = "";//delete old header
    let svgAttsHeader = document.createElement('h10');
    svgAttsHeader.className = 'addHeader';
    svgAttsHeader.innerHTML = 'Attributes';
    document.getElementById('svgAttsHeaderDiv').appendChild(svgAttsHeader);
    //CREATES CLICKABLE HEADER
    let svgAtts;

    $.ajax({//server req to get attribute list
        type: 'get',
        dataType: 'json',
        url: '/attributes',
        data: {
            file: svg.name,
            type: 0,//SVG_IMG IS TYPE 0
            index: 1//INDEX DOESNT MATTER HERE
        },
        success: function (data) {
            svgAtts = JSON.parse(data.str);

            let svgAttsForm = document.getElementById('svgAttsForm');
            svgAttsForm.innerHTML = "";//delete all old stuff
            for (let j = 0; j < svgAtts.length; j++) {
                let input = document.createElement('input');
                input.value = svgAtts[j].value;
                input.name = 'svgAtt'+j;
                input.id = 'svgAtt'+j;
                let label = document.createElement('label');
                label.for = input.name;
                label.innerHTML = svgAtts[j].name;
                svgAttsForm.appendChild(label);
                svgAttsForm.appendChild(document.createElement('br'));
                svgAttsForm.appendChild(input);
                svgAttsForm.appendChild(document.createElement('br'));
            }

            //NEW ATTRIBUTE FORM
            let editNewName = document.createElement('input');
            editNewName.id = 'svgAttsNewName';
            editNewName.name = 'svgAttsNewName';
            let editNewNameLabel = document.createElement('label');
            editNewNameLabel.for = 'svgAttsNewName';
            editNewNameLabel.innerHTML = "New Attribute Name: ";
            svgAttsForm.appendChild(editNewNameLabel);
            svgAttsForm.appendChild(document.createElement('br'));
            svgAttsForm.appendChild(editNewName);
            svgAttsForm.appendChild(document.createElement('br'));

            let editNewValue = document.createElement('input');
            editNewValue.id = 'svgAttsNewValue';
            editNewValue.name = 'svgAttsNewValue';
            let editNewValueLabel = document.createElement('label');
            editNewValueLabel.for = 'svgAttsNewValue';
            editNewValueLabel.innerHTML = "New Attribute Value: ";
            svgAttsForm.appendChild(editNewValueLabel);
            svgAttsForm.appendChild(document.createElement('br'));
            svgAttsForm.appendChild(editNewValue);
            svgAttsForm.appendChild(document.createElement('br'));

            let submitButton2 = document.createElement('button');
            submitButton2.className = "submitButton";
            submitButton2.innerHTML = "Submit";
            svgAttsForm.appendChild(submitButton2);

            svgAttsHeader.onclick = function(e) {
                e.preventDefault();
                $('#svgAttsForm').slideDown();
        
                submitButton2.onclick = function(e) {//SUBMIT BUTToN PRESSED
                    e.preventDefault();
                    let changed = false;
                    for (let j = 0; j < svgAtts.length; j++) {
                        if (document.getElementById('svgAtt'+j).value != svgAtts[j].value) {
                            setAttAjax(svg.name, 0, 1, svgAtts[j].name, document.getElementById('svgAtt'+j).value);//note INDEX IS USELESS HERE, SVG_IMG is type 0
                            changed = true;
                        }
                    }
                    if (document.getElementById('svgAttsNewName').value && document.getElementById('svgAttsNewValue').value) {
                        setAttAjax(svg.name, 0, 1, document.getElementById('svgAttsNewName').value, document.getElementById('svgAttsNewValue').value);
                        changed = true;
                    }
                    $('#svgAttsForm').slideUp();
                    if (changed) {
                        window.location.reload();
                    }
                };
                $('#svgAttsForm').slideDown();
            };
        },
        fail: function(error) {
            console.log(error);
            alert(error);
        }
    });

}
