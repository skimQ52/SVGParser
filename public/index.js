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

function setSizeAtt(attributes) {
    return attributes.length;
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
    //let componentTable = document.getElementById('componentTable');
    //$("#componentTable tbody tr").remove();


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

        $('#'+cell0.id).click(function(e) {

            document.getElementById('editRectHeader').innerHTML = "Edit Rect " + (i+1);
            //default to current values
            document.getElementById('editX').value = svg.rectangles[i].x;
            document.getElementById('editY').value = svg.rectangles[i].y;
            document.getElementById('editW').value = svg.rectangles[i].w;
            document.getElementById('editH').value = svg.rectangles[i].h;
            document.getElementById('editRectUnits').value = svg.rectangles[i].units;

            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < attributes.length; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
            }
            let form = document.getElementById('editRectOA');//div right before new Att stuff
            form.innerHTML = '';//clear
            for (let j = 0; j < attributes.length; j++) {
                let input = document.createElement('input');
                input.value = attributes[j].value;
                input.name = 'rectAtt'+j;
                let label = document.createElement('label');
                label.for = input.name;
                label.innerHTML = attributes[j].name;
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
                form.appendChild(input);
                form.appendChild(document.createElement('br'));
            }

            $('#editRect').slideDown();

            $("#submitRect").bind("click", (function () {//SUBMIT BUTToN PRESSED
                //for all regulars atts then for all other atts.
                $('#editRect').slideUp();
            }));
        });
    }

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

        $('#'+cell0.id).click(function(e) {
            
            document.getElementById('editCircHeader').innerHTML = "Edit Circ " + (i+1);
            //default to current values
            document.getElementById('editCX').value = svg.circles[i].cx;
            document.getElementById('editCY').value = svg.circles[i].cy;
            document.getElementById('editR').value = svg.circles[i].r;
            document.getElementById('editCircUnits').value = svg.circles[i].units;

            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < attributes.length; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
            }

            let form = document.getElementById('editCircOA');//div right before new Att stuff
            form.innerHTML = '';//clear
            for (let j = 0; j < attributes.length; j++) {
                let input = document.createElement('input');
                input.value = attributes[j].value;
                input.name = 'circAtt'+j;
                let label = document.createElement('label');
                label.for = input.name;
                label.innerHTML = attributes[j].name;
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
                form.appendChild(input);
                form.appendChild(document.createElement('br'));
            }

            $('#editCirc').slideDown();

            $("#submitCirc").bind("click", (function () {//SUBMIT BUTToN PRESSED
                $('#editCirc').slideUp();
            }));
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

        $('#'+cell0.id).click(function(e) {
            
            document.getElementById('editPathHeader').innerHTML = "Edit Path " + (i+1);
            //default to current values
            document.getElementById('editData').value = svg.paths[i].d;

            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < attributes.length; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
            }

            let form = document.getElementById('editPathOA');//div right before new Att stuff
            form.innerHTML = '';//clear
            for (let j = 0; j < attributes.length; j++) {
                let input = document.createElement('input');
                input.value = attributes[j].value;
                input.name = 'pathAtt'+j;
                let label = document.createElement('label');
                label.for = input.name;
                label.innerHTML = attributes[j].name;
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
                form.appendChild(input);
                form.appendChild(document.createElement('br'));
            }

            $('#editPath').slideDown();

            $("#submitPath").bind("click", (function () {//SUBMIT BUTToN PRESSED
                //svg.paths.d = document.getElementById('editData').value; //                TODO--> SETATTRIBUTE HERE
                $('#editPath').slideUp();
            }));
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

        $('#'+cell0.id).click(function(e) {

            document.getElementById('editGroupHeader').innerHTML = "Edit Group " + (i+1);
            //default to current values
            document.getElementById('editNumChildren').value = svg.groups[i].children;

            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < attributes.length; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+attributes[j].name+" Value: "+attributes[j].value;
            }

            let form = document.getElementById('editGroupOA');//div right before new Att stuff
            form.innerHTML = '';//clear
            for (let j = 0; j < attributes.length; j++) {
                let input = document.createElement('input');
                input.value = attributes[j].value;
                input.name = 'groupAtt'+j;
                let label = document.createElement('label');
                label.for = input.name;
                label.innerHTML = attributes[j].name;
                form.appendChild(label);
                form.appendChild(document.createElement('br'));
                form.appendChild(input);
                form.appendChild(document.createElement('br'));
            }

            $('#editGroup').slideDown();
            
            $("#submitGroup").bind("click", (function () {//SUBMIT BUTToN PRESSED
                $('#editGroup').slideUp();
            }));
        });
    }
}
