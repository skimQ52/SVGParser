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
bool svgToXmlGroup(xmlNodePtr rootNode, Group* gro) {

    void* elem;
    void* elem2;
    xmlNodePtr node = NULL;

    //GET OTHERATTRIBUTES OF GRO ELEMENT
    if (gro->otherAttributes == NULL) {
        xmlCleanupParser();
        return false;
    }
    ListIterator iter = createIterator(gro->otherAttributes);

    while((elem = nextElement(&iter)) != NULL) {
        Attribute* att = (Attribute*)elem;
        xmlNewProp(rootNode, (const xmlChar *)att->name, (const xmlChar *)att->value);
    }

    //Create CHILDREN RECTS OF SVG ELEMENT
    if (gro->rectangles == NULL) {
        xmlCleanupParser();
        return false;
    }
    iter = createIterator(gro->rectangles);

    while ((elem = nextElement(&iter)) != NULL) {
        Rectangle* rec = (Rectangle*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"rect", NULL);//create rectangle

        //set all default attributes
        //formulate strings needed for property values
        char str[256];
        sprintf(str, "%f%s", rec->x, rec->units);
        xmlNewProp(node, (const xmlChar *)"x", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->y, rec->units);
        xmlNewProp(node, (const xmlChar *)"y", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->width, rec->units);
        xmlNewProp(node, (const xmlChar *)"width", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->height, rec->units);
        xmlNewProp(node, (const xmlChar *)"height", (const xmlChar *)str);

        //set otherAttributes.
        if (rec->otherAttributes == NULL) {
            xmlCleanupParser();
            return false;
        }
        ListIterator iter2 = createIterator(rec->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to rec node.
        }
    }

    //Create CHILDREN CIRCLES OF SVG ELEMENT
    if (gro->circles == NULL) {
        xmlCleanupParser();
        return false;
    }
    iter = createIterator(gro->circles);

    while ((elem = nextElement(&iter)) != NULL) {
        Circle* cir = (Circle*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"circle", NULL);//create circle

        //set all default attributes
        char str[256];
        sprintf(str, "%f%s", cir->cx, cir->units);
        xmlNewProp(node, (const xmlChar *)"cx", (const xmlChar *)str);
        sprintf(str, "%f%s", cir->cy, cir->units);
        xmlNewProp(node, (const xmlChar *)"cy", (const xmlChar *)str);
        sprintf(str, "%f%s", cir->r, cir->units);
        xmlNewProp(node, (const xmlChar *)"r", (const xmlChar *)str);

        //set otherAttributes.
        if (cir->otherAttributes == NULL) {
            xmlCleanupParser();
            return false;
        }
        ListIterator iter2 = createIterator(cir->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to circle node.
        }
    }

    //Create CHILDREN PATHS OF GROUP ELEMENT
    if (gro->paths == NULL) {
        xmlCleanupParser();
        return false;
    }
    iter = createIterator(gro->paths);

    while ((elem = nextElement(&iter)) != NULL) {
        Path* pat = (Path*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"path", NULL);//create path

        if (pat->data == NULL) {
            xmlCleanupParser();
            return false;
        }
        //set all default attributes
        xmlNewProp(node, (const xmlChar *)"d", (const xmlChar *)pat->data);

        //set otherAttributes.
        if (pat->otherAttributes == NULL) {
            xmlCleanupParser();
            return false;
        }
        ListIterator iter2 = createIterator(pat->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to path node.
        }
    }

    //CREATE CHILDREN GROUPS OF GROup ELEMENT
    if (gro->groups == NULL) {
        xmlCleanupParser();
        return false;
    }
    iter = createIterator(gro->groups);
    while ((elem = nextElement(&iter)) != NULL) {
        Group* gro2 = (Group*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"g", NULL);//create group
        if (!svgToXmlGroup(node, gro2)) {
            xmlCleanupParser();
            return false;
        }
    }
    return true;
}

//Helper function that converts an SVG into an xmlDoc struct, i.e. a libxml tree. This tree can be then be easily saved
//to disk or validated against an XSD file using libxml functionality.
xmlDocPtr svgToXml(const SVG *img) {

    xmlDocPtr xDoc = NULL;
    xmlNodePtr rootNode = NULL;
    xmlNodePtr node = NULL;
    xmlNsPtr ns = NULL;

    xDoc = xmlNewDoc((const xmlChar *)"1.0");//create new doc version 1.0
    rootNode = xmlNewNode(NULL, (const xmlChar *)"svg");//create svg root node

    //create ns pointer then set rootNode to have this ns
    ns = xmlNewNs(rootNode, (const xmlChar *)img->namespace, NULL);//need to have rootNode?
    xmlSetNs(rootNode, ns);
    
    xmlDocSetRootElement(xDoc, rootNode);

    //GET OTHERATTRIBUTES OF SVG ELEMENT
    void* elem;
    void* elem2;

    if (img->otherAttributes == NULL) {
        xmlFreeDoc(xDoc);
        xmlCleanupParser();
        return NULL;
    }
    ListIterator iter = createIterator(img->otherAttributes);

    while((elem = nextElement(&iter)) != NULL) {
        Attribute* att = (Attribute*)elem;
        xmlNewProp(rootNode, (const xmlChar *)att->name, (const xmlChar *)att->value);
    }

    //TITLE AND DESCRIPTION
    if (strlen(img->title) > 1) {//if theres a title add the title
        xmlNewChild(rootNode, NULL, (const xmlChar *)"title", (const xmlChar *)img->title);
    }
    if (strlen(img->description) > 1) {//if theres a desc add the desc
        xmlNewChild(rootNode, NULL, (const xmlChar *)"desc", (const xmlChar *)img->description);
    }
    
    //Create CHILDREN RECTS OF SVG ELEMENT
    if (img->rectangles == NULL) {
        xmlFreeDoc(xDoc);
        xmlCleanupParser();
        return NULL;
    }
    iter = createIterator(img->rectangles);

    while ((elem = nextElement(&iter)) != NULL) {
        Rectangle* rec = (Rectangle*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"rect", NULL);//create rectangle

        //set all default attributes
        //formulate strings needed for property values
        char str[256];
        sprintf(str, "%f%s", rec->x, rec->units);
        xmlNewProp(node, (const xmlChar *)"x", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->y, rec->units);
        xmlNewProp(node, (const xmlChar *)"y", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->width, rec->units);
        xmlNewProp(node, (const xmlChar *)"width", (const xmlChar *)str);
        sprintf(str, "%f%s", rec->height, rec->units);
        xmlNewProp(node, (const xmlChar *)"height", (const xmlChar *)str);

        //set otherAttributes.
        if (rec->otherAttributes == NULL) {
            xmlFreeDoc(xDoc);
            xmlCleanupParser();
            return NULL;
        }
        ListIterator iter2 = createIterator(rec->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to rec node.
        }
    }

    //Create CHILDREN CIRCLES OF SVG ELEMENT
    if (img->circles == NULL) {
        xmlFreeDoc(xDoc);
        xmlCleanupParser();
        return NULL;
    }
    iter = createIterator(img->circles);

    while ((elem = nextElement(&iter)) != NULL) {
        Circle* cir = (Circle*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"circle", NULL);//create circle

        //set all default attributes
        char str[256];
        sprintf(str, "%f%s", cir->cx, cir->units);
        xmlNewProp(node, (const xmlChar *)"cx", (const xmlChar *)str);
        sprintf(str, "%f%s", cir->cy, cir->units);
        xmlNewProp(node, (const xmlChar *)"cy", (const xmlChar *)str);
        sprintf(str, "%f%s", cir->r, cir->units);
        xmlNewProp(node, (const xmlChar *)"r", (const xmlChar *)str);

        //set otherAttributes.
        if (cir->otherAttributes == NULL) {
            xmlFreeDoc(xDoc);
            xmlCleanupParser();
            return NULL;
        }
        ListIterator iter2 = createIterator(cir->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to circle node.
        }
    }
    //Create CHILDREN PATHS OF SVG ELEMENT
    if (img->paths == NULL) {
        xmlFreeDoc(xDoc);
        xmlCleanupParser();
        return NULL;
    }
    iter = createIterator(img->paths);

    while ((elem = nextElement(&iter)) != NULL) {
        Path* pat = (Path*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"path", NULL);//create path

        //set all default attributes
        if (pat->data == NULL) {
            xmlFreeDoc(xDoc);
            xmlCleanupParser();
            return NULL;
        }
        xmlNewProp(node, (const xmlChar *)"d", (const xmlChar *)pat->data);

        //set otherAttributes.
        if (pat->otherAttributes == NULL) {
            xmlFreeDoc(xDoc);
            xmlCleanupParser();
            return NULL;
        }
        ListIterator iter2 = createIterator(pat->otherAttributes);
        while ((elem2 = nextElement(&iter2)) != NULL) {//for each other element
            Attribute* att = (Attribute*)elem2;//cast elem 2 as attribute
            xmlNewProp(node, (const xmlChar *)att->name, (const xmlChar *)att->value);//add property to path node.
        }
    }
    //CREATE CHILDREN GROUPS OF SVG ELEMENT
    if (img->groups == NULL) {
        xmlFreeDoc(xDoc);
        xmlCleanupParser();
        return NULL;
    }
    iter = createIterator(img->groups);

    while ((elem = nextElement(&iter)) != NULL) {
        Group* gro = (Group*)elem;
        node = xmlNewChild(rootNode, NULL, (const xmlChar *)"g", NULL);//create group

        if (!svgToXmlGroup(node, gro)) {
            xmlFreeDoc(xDoc);
            xmlCleanupParser();
            return NULL;
        }
    }
    xmlCleanupParser();
    return xDoc;
}

//definition of strndup function that is not a part of c99 but is used in my code
char *strndup2(const char *s, size_t n) {
    char *p;
    size_t n1;

    for (n1 = 0; n1 < n && s[n1] != '\0'; n1++)
        continue;
    p = malloc(n + 1);
    if (p != NULL) {
        memcpy(p, s, n1);
        p[n1] = '\0';
    }
    return p;
}


//NEW FOR A3:

char* createSVGtoJSON(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    char* str = SVGtoJSON(svg);
    deleteSVG(svg);
    return str;
}

char* getTitleSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    if (strlen(svg->title) < 1) {
        return "";
    }
    char* str = svg->title;
    deleteSVG(svg);
    return str;
}

char* getDescSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    if (strlen(svg->description) < 1) {
        return "";
    }
    char* str = svg->description;
    deleteSVG(svg);
    return str;
}

char* getRectsSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    List* rects = getRects(svg);
    char *str = rectListToJSON(rects);
    freeList(rects);
    deleteSVG(svg);
    return str;
}

char* getCircsSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    List* circs = getCircles(svg);
    char *str = circListToJSON(circs);
    freeList(circs);
    deleteSVG(svg);
    return str;
}

char* getPathsSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    List* paths = getPaths(svg);
    char *str = pathListToJSON(paths);
    freeList(paths);
    deleteSVG(svg);
    return str;
}

char* getGroupsSVG(const char* fileName, const char* schemaFile) {
    SVG* svg = createValidSVG(fileName, schemaFile);
    List* groups = getGroups(svg);
    char *str = groupListToJSON(groups);
    freeList(groups);
    deleteSVG(svg);
    return str;
}

char* getOtherAttributesJSON(const char* fileName, const char* schemaFile, int type, int index) {

    int i = 0;
    char* str;
    SVG* svg = createValidSVG(fileName, schemaFile);

    if (type == 0) {//svg_img
        str = attrListToJSON(svg->otherAttributes);
    }

    if (type == 1) {//circles
        List* circs = getCircles(svg);
        ListIterator iter = createIterator(circs);
        while (i < index) {//iterate to proper component
            nextElement(&iter);
            i++;
        }
        Circle* circ = (Circle*)iter.current->data;
        str = attrListToJSON(circ->otherAttributes);
        freeList(circs);
    }

    if (type == 2) {//rectangles
        List* rects = getRects(svg);
        ListIterator iter = createIterator(rects);
        while (i < index) {//iterate to proper component
            nextElement(&iter);
            i++;
        }
        Rectangle* rect = (Rectangle*)iter.current->data;
        str = attrListToJSON(rect->otherAttributes);
        freeList(rects);
    }

    if (type == 3) {//paths
        List* paths = getPaths(svg);
        ListIterator iter = createIterator(paths);
        while (i < index) {//iterate to proper component
            nextElement(&iter);
            i++;
        }
        Path* path = (Path*)iter.current->data;
        str = attrListToJSON(path->otherAttributes);
        freeList(paths);
    }

    if (type == 4) {//groups
        List* groups = getGroups(svg);
        ListIterator iter = createIterator(groups);
        while (i < index) {//iterate to proper component
            nextElement(&iter);
            i++;
        }
        Group* group = (Group*)iter.current->data;
        str = attrListToJSON(group->otherAttributes);
        freeList(groups);
    }
    deleteSVG(svg);
    return str;
}