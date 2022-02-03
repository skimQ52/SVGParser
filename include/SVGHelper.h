/* SVGHelper.h
*  Includes all headers for the helper functions that are in SVGHelper.c
*  Author: Skylar Mawle 1143676
*  CIS*2750 D. Nikitenko
*
*/
#include <math.h>
#include "SVGParser.h"

void dummyDelete(void *data);

//CREATE FUNCTIONS
Attribute *createAttribute(xmlAttr *prop);

Rectangle *createRectangle(xmlNode *node);

Circle *createCircle(xmlNode *node);

Path *createPath(xmlNode *node);

Group *createGroup(xmlNode *node);

//other helpers
void parseXML(SVG* mySVG, xmlNode *node);

void parseXMLGroup(Group* myGroup, xmlNode *node);

void formGroups(Group* reGroup, List *newGroups);