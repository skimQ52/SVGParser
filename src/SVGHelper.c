/* SVGHelper.c
*  Includes all helper functions that are in SVGHelper.h
*  Author: Skylar Mawle 1143676
*  CIS*2750 D. Nikitenko
*
*/

#include "SVGHelper.h"

//DUMMY DELETE FUNCTION
void dummyDelete(void *data) {
    return;
}

//CREATE FUNCTIONS
Attribute *createAttribute(xmlAttr *prop) {

    Attribute *newAttribute = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)prop->children->content)+1)));//malloc enough space for Attribute, and two strings including name flexible array "value[]"
    newAttribute->name = calloc(1, (sizeof(char)*(strlen((const char*)prop->name)+1)));
    strcpy(newAttribute->name, (const char*)prop->name);
    strcpy(newAttribute->value, (const char*)prop->children->content);//get string value of attribute's value
    return newAttribute;
}

Rectangle *createRectangle(xmlNode *node) {//helper function to create a Rectangle item from a xmlNode

    Rectangle *newRectangle = calloc(1, sizeof(Rectangle));
    newRectangle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);
    struct _xmlAttr *prop;
    char *propStr;
    char *ptr;
    newRectangle->x = 0;
    newRectangle->y = 0;
    for (prop = node->properties; prop != NULL; prop = prop->next) {
        propStr = malloc(sizeof(char)*(strlen((const char*)prop->children->content)+1));//malloc enough space for temp string
        strcpy(propStr, (const char*)prop->children->content);//get string value of attribute's value
        
        if (strcmp((const char*)prop->name, "x") == 0) {
            newRectangle->x = strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "y") == 0) {
            newRectangle->y = strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "width") == 0) {//must be >= 0
            newRectangle->width = strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "height") == 0) {//must be >= 0
            newRectangle->height = strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else {//is a other attribute, add to other attributes.
            Attribute *newAttribute = createAttribute(prop);
            insertBack(newRectangle->otherAttributes, (void*)newAttribute);//add to list of attributes
        }
        xmlFree(propStr);//free string received
    }
    return newRectangle;
}

Circle *createCircle(xmlNode *node) {//helper function to create a Circle item from a xmlNode

    Circle *newCircle = calloc(1, sizeof(Circle));
    newCircle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);
    struct _xmlAttr *prop;
    char *propStr;
    char *ptr;
    newCircle->cx = 0;
    newCircle->cy = 0;
    for (prop = node->properties; prop != NULL; prop = prop->next) {
        propStr = malloc(sizeof(char)*(strlen((const char*)prop->children->content)+1));//malloc enough space for temp string
        strcpy(propStr, (const char*)prop->children->content);//get string value of attribute's value
        
        if (strcmp((const char*)prop->name, "cx") == 0) {
            newCircle->cx= strtof(propStr, &ptr);
            strcpy(newCircle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "cy") == 0) {
            newCircle->cy= strtof(propStr, &ptr);
            strcpy(newCircle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "r") == 0) {//must be >= 0
            newCircle->r= strtof(propStr, &ptr);
            strcpy(newCircle->units, ptr);
        }
        else {//is a other attribute, add to other attributes.
            Attribute *newAttribute = createAttribute(prop);
            insertBack(newCircle->otherAttributes, (void*)newAttribute);//add to list of attributes//
        }
        xmlFree(propStr);//free string received
    }
    return newCircle;
}

Path *createPath(xmlNode *node) {//helper function to create a Path item from a xmlNode

    Path *newPath = calloc(1, sizeof(Path));//data memebr is a flexible array!
    newPath->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);
    struct _xmlAttr *prop;

    for (prop = node->properties; prop != NULL; prop = prop->next) {
        if (strcmp((const char*)prop->name, "d") == 0) {//data
            //"struct member children holds the value of the property"
            newPath = realloc(newPath, sizeof(Path) + (strlen((const char*)prop->children->content)+1)*sizeof(char));
            strcpy(newPath->data, (const char*)prop->children->content);
        }
        else {//is a other attribute, add to other attributes.
            Attribute *newAttribute = createAttribute(prop);
            insertBack(newPath->otherAttributes, (void*)newAttribute);//add to list of attributes
        }
    }
    return newPath;
}

Group *createGroup(xmlNode *node) {//helper function to create a Path item from a xmlNode

    Group *newGroup = calloc(1, sizeof(Group));//allocate space for a Group!
    newGroup->rectangles = initializeList(&rectangleToString, &deleteRectangle, &compareRectangles);
    newGroup->paths = initializeList(&pathToString, &deletePath, &comparePaths);
    newGroup->circles = initializeList(&circleToString, &deleteCircle, &compareCircles);
    newGroup->groups = initializeList(&groupToString, &deleteGroup, &compareGroups);
    newGroup->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);

    struct _xmlAttr *prop;

    for (prop = node->properties; prop != NULL; prop = prop->next) {//for all attributes of this group node add to attribute list
        Attribute *newAttribute = createAttribute(prop);
        insertBack(newGroup->otherAttributes, (void*)newAttribute);//add to list of attributes
    }
    return newGroup;
}

//PARSEXML FUNCTION

void parseXML(SVG* mySVG, xmlNode *node) {

    xmlNode *node2 = NULL;

    for (node2 = node; node2 != NULL; node2 = node2->next) {//for all nodes
        //for each element check for circles groups rectangles and paths and CREAte for each adding to the lists of the svg
        if (node2->type == XML_ELEMENT_NODE) {

            if (strcmp((const char*)node2->name, "g") == 0) {
                Group *newGroup = createGroup(node2);//create a new group
                parseXMLGroup(newGroup, node2->children);//recursion for a group
                insertBack(mySVG->groups, (void*)newGroup);//add to list of groups
            }
            else {
                if (strcmp((const char*)node2->name, "title") == 0) {//if it is the title
                    xmlChar *title = xmlNodeGetContent(node2);//get content of the node
                    strcpy(mySVG->title, (const char*)title);//copy it into the svg struct
                    xmlFree(title);
                }
                if (strcmp((const char*)node2->name, "desc") == 0) {//if node is the description
                    xmlChar *desc = xmlNodeGetContent(node2);
                    strcpy(mySVG->description, (const char*)desc);
                    xmlFree(desc);
                }
                if (strcmp((const char*)node2->name, "rect") == 0) {
                    Rectangle *newRectangle = createRectangle(node2);
                    insertBack(mySVG->rectangles, (void*)newRectangle);//add to list of rectangles
                }
                if (strcmp((const char*)node2->name, "circle") == 0) {
                    Circle *newCircle = createCircle(node2);
                    insertBack(mySVG->circles, (void*)newCircle);//add to list of circles
                }
                if (strcmp((const char*)node2->name, "path") == 0) {
                    Path *newPath = createPath(node2);
                    insertBack(mySVG->paths, (void*)newPath);//add to list of paths
                }
                parseXML(mySVG, node2->children);//recursion for not a group
            }
        }
    }

    return;
}

void parseXMLGroup(Group* myGroup, xmlNode *node) {

    xmlNode *node2 = NULL;

    for (node2 = node; node2 != NULL; node2 = node2->next) {//for all nodes in group
        //for each element check for circles groups rectangles and paths and CREAte for each adding to the lists of the Group
        if (node2->type == XML_ELEMENT_NODE) {

            if (strcmp((const char*)node2->name, "g") == 0) {
                Group *newGroup = createGroup(node2);//create a new group
                parseXMLGroup(newGroup, node2->children);//recursion for a group
                insertBack(myGroup->groups, (void*)newGroup);//add to list of groups
            }
            else {
                if (strcmp((const char*)node2->name, "rect") == 0) {
                    Rectangle *newRectangle = createRectangle(node2);
                    insertBack(myGroup->rectangles, (void*)newRectangle);//add to list of rectangles
                }
                if (strcmp((const char*)node2->name, "circle") == 0) {
                    Circle *newCircle = createCircle(node2);
                    insertBack(myGroup->circles, (void*)newCircle);//add to list of circles
                }
                if (strcmp((const char*)node2->name, "path") == 0) {
                    Path *newPath = createPath(node2);
                    insertBack(myGroup->paths, (void*)newPath);//add to list of paths
                }
                parseXMLGroup(myGroup, node2->children);//recursion for not a new group
            }
        }
    }

    return;
}

void formGroups(Group* reGroup, List *newGroups) {

    void* elem;
    ListIterator iter = createIterator(reGroup->groups);//recursive iterator

    while((elem = nextElement(&iter)) != NULL) {
        insertBack(newGroups, elem);//insert all paraent iterators
        Group* gro = (Group*)elem;
        formGroups(gro, newGroups);
    }
    return;
}


//+++++++++++++++++++++++++++++++++++++++++++++ASSIGNMENT 2++++++++++++++++++++++++++++++++++++++++++//

// Helper function that validates a libxml tree. returns true if valid false if not
bool validateXMLTree(xmlDocPtr xDoc, const char* schemaFileName) {
    int ret;
    xmlSchemaPtr schema = NULL;
    xmlSchemaParserCtxtPtr ctxt;

    ctxt = xmlSchemaNewParserCtxt(schemaFileName);
    schema = xmlSchemaParse(ctxt);
    xmlSchemaFreeParserCtxt(ctxt);

    xmlSchemaValidCtxtPtr ctxt2;
    ctxt2 = xmlSchemaNewValidCtxt(schema);
    ret = xmlSchemaValidateDoc(ctxt2, xDoc);
    xmlSchemaFreeValidCtxt(ctxt2);

    // free the resource
    if (schema != NULL) {
        xmlSchemaFree(schema);//free schema if it went through
    }
    xmlSchemaCleanupTypes();//also needed

    if (ret == 0) {//0 means valid
        return true;
    }
    else {//either not valid or there is an error in validating
        return false;
    }
}

//Recursive version of svgToXml for groups!
void svgToXmlGroup(xmlNodePtr rootNode, Group* gro) {

    void* elem;
    void* elem2;
    xmlNodePtr node = NULL;

    //GET OTHERATTRIBUTES OF GRO ELEMENT
    ListIterator iter = createIterator(gro->otherAttributes);

    while((elem = nextElement(&iter)) != NULL) {
        Attribute* att = (Attribute*)elem;
        xmlNewProp(rootNode, att->name, att->value);
    }

    //Create CHILDREN RECTS OF SVG ELEMENT
    iter = createIterator(gro->rectangles);

    while ((elem = nextElement(&iter)) != NULL) {
        Rectangle* rec = (Rectangle*)elem;
        node = xmlNewChild(rootNode, NULL, "rect", NULL);//create rectangle

        //set all default attributes
        //formulate strings needed for property values
        char str[256];
        sprintf(str, "%f%s", rec->x, rec->units);
        xmlNewProp(node, "x", str);
        sprintf(str, "%f%s", rec->y, rec->units);
        xmlNewProp(node, "y", str);
        sprintf(str, "%f%s", rec->width, rec->units);
        xmlNewProp(node, "width", str);
        sprintf(str, "%f%s", rec->height, rec->units);
        xmlNewProp(node, "height", str);

        //set otherAttributes.
        ListIterator iter2 = createIterator(rec->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to rec node.
        }
    }

    //Create CHILDREN CIRCLES OF SVG ELEMENT
    iter = createIterator(gro->circles);

    while ((elem = nextElement(&iter)) != NULL) {
        Circle* cir = (Circle*)elem;
        node = xmlNewChild(rootNode, NULL, "circle", NULL);//create circle

        //set all default attributes
        char str[256];
        sprintf(str, "%f%s", cir->cx, cir->units);
        xmlNewProp(node, "cx", str);
        sprintf(str, "%f%s", cir->cy, cir->units);
        xmlNewProp(node, "cy", str);
        sprintf(str, "%f%s", cir->r, cir->units);
        xmlNewProp(node, "r", str);

        //set otherAttributes.
        ListIterator iter2 = createIterator(cir->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to circle node.
        }
    }

    //Create CHILDREN PATHS OF GROUP ELEMENT
    iter = createIterator(gro->paths);

    while ((elem = nextElement(&iter)) != NULL) {
        Path* pat = (Path*)elem;
        node = xmlNewChild(rootNode, NULL, "path", NULL);//create path

        //set all default attributes
        xmlNewProp(node, "d", pat->data);

        //set otherAttributes.
        ListIterator iter2 = createIterator(pat->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to path node.
        }
    }

    //CREATE CHILDREN GROUPS OF GROup ELEMENT
    iter = createIterator(gro->groups);
    while ((elem = nextElement(&iter)) != NULL) {
        Group* gro2 = (Group*)elem;
        node = xmlNewChild(rootNode, NULL, "g", NULL);//create group
        svgToXmlGroup(node, gro2);
    }
}

//Helper function that converts an SVG into an xmlDoc struct, i.e. a libxml tree. This tree can be then be easily saved
//to disk or validated against an XSD file using libxml functionality.
xmlDocPtr svgToXml(const SVG *img) {

    xmlDocPtr xDoc = NULL;
    xmlNodePtr rootNode = NULL;
    xmlNodePtr node = NULL;
    xmlNsPtr ns = NULL;

    xDoc = xmlNewDoc("1.0");//create new doc version 1.0
    rootNode = xmlNewNode(NULL, "svg");//create svg root node

    //create ns pointer then set rootNode to have this ns
    ns = xmlNewNs(rootNode, img->namespace, NULL);//need to have rootNode?\
    xmlSetNs(rootNode, ns);
    
    xmlDocSetRootElement(xDoc, rootNode);

    //GET OTHERATTRIBUTES OF SVG ELEMENT
    void* elem;
    void* elem2;
    ListIterator iter = createIterator(img->otherAttributes);

    while((elem = nextElement(&iter)) != NULL) {
        Attribute* att = (Attribute*)elem;
        xmlNewProp(rootNode, att->name, att->value);
    }

    //TITLE AND DESCRIPTION
    if (strlen(img->title) > 1) {//if theres a title add the title
        xmlNewChild(rootNode, NULL, "title", img->title);
    }
    if (strlen(img->description) > 1) {//if theres a desc add the desc
        xmlNewChild(rootNode, NULL, "desc", img->description);
    }
    
    //Create CHILDREN RECTS OF SVG ELEMENT
    iter = createIterator(img->rectangles);

    while ((elem = nextElement(&iter)) != NULL) {
        Rectangle* rec = (Rectangle*)elem;
        node = xmlNewChild(rootNode, NULL, "rect", NULL);//create rectangle

        //set all default attributes
        //formulate strings needed for property values
        char str[256];
        sprintf(str, "%f%s", rec->x, rec->units);
        xmlNewProp(node, "x", str);
        sprintf(str, "%f%s", rec->y, rec->units);
        xmlNewProp(node, "y", str);
        sprintf(str, "%f%s", rec->width, rec->units);
        xmlNewProp(node, "width", str);
        sprintf(str, "%f%s", rec->height, rec->units);
        xmlNewProp(node, "height", str);

        //set otherAttributes.
        ListIterator iter2 = createIterator(rec->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to rec node.
        }
    }
    //Create CHILDREN CIRCLES OF SVG ELEMENT
    iter = createIterator(img->circles);

    while ((elem = nextElement(&iter)) != NULL) {
        Circle* cir = (Circle*)elem;
        node = xmlNewChild(rootNode, NULL, "circle", NULL);//create circle

        //set all default attributes
        char str[256];
        sprintf(str, "%f%s", cir->cx, cir->units);
        xmlNewProp(node, "cx", str);
        sprintf(str, "%f%s", cir->cy, cir->units);
        xmlNewProp(node, "cy", str);
        sprintf(str, "%f%s", cir->r, cir->units);
        xmlNewProp(node, "r", str);

        //set otherAttributes.
        ListIterator iter2 = createIterator(cir->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to circle node.
        }
    }
    //Create CHILDREN PATHS OF SVG ELEMENT
    iter = createIterator(img->paths);

    while ((elem = nextElement(&iter)) != NULL) {
        Path* pat = (Path*)elem;
        node = xmlNewChild(rootNode, NULL, "path", NULL);//create path

        //set all default attributes
        xmlNewProp(node, "d", pat->data);

        //set otherAttributes.
        ListIterator iter2 = createIterator(pat->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, att->name, att->value);//add property to path node.
        }
    }
    //CREATE CHILDREN GROUPS OF SVG ELEMENT
    iter = createIterator(img->groups);

    while ((elem = nextElement(&iter)) != NULL) {
        Group* gro = (Group*)elem;
        node = xmlNewChild(rootNode, NULL, "g", NULL);//create group
        svgToXmlGroup(node, gro);
    }
    xmlCleanupParser();
    return xDoc;
}

