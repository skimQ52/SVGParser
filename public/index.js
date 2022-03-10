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
    numRecs: "3",
    numCircs: "2",
    numPaths: "1",
    numGroups: "5"
};


// Put all onload AJAX calls here, and event listeners
jQuery(document).ready(function() {

    //on load, hide forms
    $('#editRect').hide();
    $('#editCirc').hide();
    $('#editPath').hide();
    $('#editGroup').hide();

    addSVGToFileLog(svg1);//do for all svgs found on server!
    //addSVGToFileLog(svg2);
    addSVGToViewPanel(svg1);

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


    $('#someLink').click(function(e) {
        alert("link clicked submitted\n");
        e.preventDefault();
        $.ajax({
            type: 'get',
            dataType: 'json',
            url: '/uploads/rects.svg',
            data: {
                name: "someSVG",
                value: "penis"
            },
            success: function (data) {
                jQuery('#blah').html("After uploading SVG, received string '"+data.retu+"' from server");
                //We write the object to the console to show that the request was successful
                console.log(data); 

            },
            fail: function(error) {
                // Non-200 return, do something with error
                $('#blah').html("After uploading SVG, received error from server");
                console.log(error); 
            },
        });
    });
});

function addSVGToFileLog(svg) {
    console.log("yo adding SVG to file log\m");//for testing
    let fileLogTable = document.getElementById('table');
    let check = document.getElementById('table').rows[1].cells;
    //if ($('table tr').length == 2) {//no SVGs
    if (check[0] == "No files") {
        alert("No files delete");
        fileLogTable.deleteRow(1);
        //remove "No files"
    }
    let newRow = fileLogTable.insertRow(-1);

    let cell0 = newRow.insertCell(0);
    cell0.className = 'imgCell';
    let img = document.createElement('img');
    img.width = 200;/*MUST MAINTAIN ASPECT RATIO*/
    $(img).click(function(){//on click, download
        alert("Svg "+svg.name);//for testing
    });
    img.src = svg.img;//set the src for image
    cell0.appendChild(img);

    let cell1 = newRow.insertCell(1);
    cell1.className = 'nameCell';
    let filename = document.createTextNode(svg.name);
    $(cell1).click(function(){//on click, download
        alert("Svg "+svg.name);//for testing
    });
    cell1.appendChild(filename);

    let cell2 = newRow.insertCell(2);
    let filesize = document.createTextNode(svg.size);
    cell2.appendChild(filesize);

    let cell3 = newRow.insertCell(3);
    let recs = document.createTextNode(svg.rectangles.length);
    cell3.appendChild(recs);

    let cell4 = newRow.insertCell(4);
    let circs = document.createTextNode(svg.circles.length);
    cell4.appendChild(circs);

    let cell5 = newRow.insertCell(5);
    let paths = document.createTextNode(svg.paths.length);
    cell5.appendChild(paths);

    let cell6 = newRow.insertCell(6);
    let groups = document.createTextNode(svg.groups.length);
    cell6.appendChild(groups);
}


function addSVGToViewPanel(svg) {

    let viewLogTable = document.getElementById('viewLogTable');
    document.getElementById("imgVL").src = svg.img;
    document.getElementById("titleCell").innerHTML = svg.title;
    document.getElementById("titleCell").maxLength = 256;
    document.getElementById("descCell").innerHTML = svg.description;
    document.getElementById("descCell").maxLength = 256;
    //let componentTable = document.getElementById('componentTable');
    //$("#componentTable tbody tr").remove();

    let tbody = document.getElementById('mytbody');
    tbody.innerHTML = '';//remove all OLD components

    for(let i = 0; i < svg.rectangles.length; i++) {//RECTS
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Rectangle "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showRect"+(i+1);
        $('#'+cell0.id).click(function(e) {
            $('#editRect').slideDown();
            document.getElementById('editRectHeader').innerHTML = "Edit Rect " + (i+1);
            //default to current values
            document.getElementById('editX').value = svg.rectangles[i].x;
            document.getElementById('editY').value = svg.rectangles[i].y;
            document.getElementById('editW').value = svg.rectangles[i].w;
            document.getElementById('editH').value = svg.rectangles[i].h;
            document.getElementById('editRectUnits').value = svg.rectangles[i].units;

            $("#submitRect").bind("click", (function () {//SUBMIT BUTToN PRESSED
                $('#editRect').slideUp();
            }));
        });

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "Upper left corner: x = "+svg.rectangles[i].x+svg.rectangles[i].units + ", y = "+svg.rectangles[i].y+svg.rectangles[i].units + "\nWidth: "+svg.rectangles[i].w+svg.rectangles[i].units+", Height: "+svg.rectangles[i].h+svg.rectangles[i].units;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.rectangles[i].numAttr;
        cell2.id = "oaRect"+(i+1);
        let tbody2 = document.getElementById('mytbody2');
        $('#'+cell2.id).hover(function() {
            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < 3; j++) {                       //TODO--> MAKE THIS ACTUAL COMPONENT'S ATTRIBUTES!
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+ "some rect att" + " Value: " + "some rect value";
            }
        });
         
    }

    for(let i = 0; i < svg.circles.length; i++) {//CIRCLES
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Circle "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showCirc"+(i+1);
        $('#'+cell0.id).click(function(e) {
            $('#editCirc').slideDown();
            document.getElementById('editCircHeader').innerHTML = "Edit Circ " + (i+1);
            //default to current values
            document.getElementById('editCX').value = svg.circles[i].cx;
            document.getElementById('editCY').value = svg.circles[i].cy;
            document.getElementById('editR').value = svg.circles[i].r;
            document.getElementById('editCircUnits').value = svg.circles[i].units;

            $("#submitCirc").bind("click", (function () {//SUBMIT BUTToN PRESSED
                $('#editCirc').slideUp();
            }));
        });

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "Centre: x = "+svg.circles[i].cx+svg.circles[i].units + ", y = "+svg.circles[i].cy+svg.circles[i].units + ", radius: "+svg.circles[i].r+svg.circles[i].units;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.circles[i].numAttr;
        cell2.id = "oaCirc"+(i+1);
        let tbody2 = document.getElementById('mytbody2');
        $('#'+cell2.id).hover(function() {
            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < 4; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+ "some circ att" + " Value: " + "some circ value";
            }
        });
    }

    for(let i = 0; i < svg.paths.length; i++) {//PATHS
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Path "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showPath"+(i+1);
        $('#'+cell0.id).click(function(e) {
            $('#editPath').slideDown();
            document.getElementById('editPathHeader').innerHTML = "Edit Path " + (i+1);
            //default to current values
            document.getElementById('editData').value = svg.paths[i].d;

            $("#submitPath").bind("click", (function () {//SUBMIT BUTToN PRESSED
                //svg.paths.d = document.getElementById('editData').value; //                TODO--> SETATTRIBUTE HERE
                $('#editPath').slideUp();
            }));
        });

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = "path data = "+svg.paths[i].d;
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.paths[i].numAttr;
        cell2.id = "oaPath"+(i+1);
        let tbody2 = document.getElementById('mytbody2');
        $('#'+cell2.id).hover(function() {
            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < 1; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+ "some path att" + " Value: " + "some path value";
            }
        });
    }

    for(let i = 0; i < svg.groups.length; i++) {//GROUPS
        let newRow = tbody.insertRow(-1);

        let cell0 = newRow.insertCell(0);
        cell0.innerHTML = "Group "+(i+1);
        cell0.className = "editButton";
        cell0.id = "showGroup"+(i+1);
        $('#'+cell0.id).click(function(e) {
            $('#editGroup').slideDown();
            document.getElementById('editGroupHeader').innerHTML = "Edit Group " + (i+1);
            //default to current values
            document.getElementById('editNumChildren').value = svg.groups[i].children;

            $("#submitGroup").bind("click", (function () {//SUBMIT BUTToN PRESSED
                $('#editGroup').slideUp();
            }));
        });

        let cell1 = newRow.insertCell(1);
        cell1.innerHTML = svg.groups[i].children+" child elements"
        
        let cell2 = newRow.insertCell(2);
        cell2.innerHTML = svg.groups[i].numAttr;
        cell2.id = "oaGroup"+(i+1);
        let tbody2 = document.getElementById('mytbody2');
        $('#'+cell2.id).hover(function() {
            tbody2.innerHTML = '';//empty tbody2 first
            for (let j = 0; j < 2; j++) {
                let row = tbody2.insertRow(-1);
                let cell = row.insertCell(0);
                cell.innerHTML = "Name: "+ "some group att" + " Value: " + "some group value";
            }
        });
    }
}
