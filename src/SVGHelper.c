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

    Attribute *newAttribute = malloc(sizeof(Attribute) + sizeof(char)*(strlen((const char*)prop->children->content)+1));//malloc enough space for Attribute, and two strings including name flexible array "value[]"
    newAttribute->name = malloc(sizeof(char)*(strlen((const char*)prop->name)+1));
    strcpy(newAttribute->name, (const char*)prop->name);
    strcpy(newAttribute->value, (const char*)prop->children->content);//get string value of attribute's value
    return newAttribute;
}

Rectangle *createRectangle(xmlNode *node) {//helper function to create a Rectangle item from a xmlNode

    Rectangle *newRectangle = malloc(sizeof(Rectangle));
    newRectangle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);
    struct _xmlAttr *prop;
    char *propStr;
    char *ptr;
    for (prop = node->properties; prop != NULL; prop = prop->next) {
        propStr = malloc(sizeof(char)*(strlen((const char*)prop->children->content)+1));//malloc enough space for temp string
        strcpy(propStr, (const char*)prop->children->content);//get string value of attribute's value
        
        if (strcmp((const char*)prop->name, "x") == 0) {
            newRectangle->x= strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "y") == 0) {
            newRectangle->y= strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "width") == 0) {//must be >= 0
            newRectangle->width= strtof(propStr, &ptr);
            strcpy(newRectangle->units, ptr);
        }
        else if (strcmp((const char*)prop->name, "height") == 0) {//must be >= 0
            newRectangle->height= strtof(propStr, &ptr);
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

    Circle *newCircle = malloc(sizeof(Circle));
    newCircle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);
    struct _xmlAttr *prop;
    char *propStr;
    char *ptr;
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

    Path *newPath = malloc(sizeof(Path));//data memebr is a flexible array!
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

    Group *newGroup = malloc(sizeof(Group));//allocate space for a Group!
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