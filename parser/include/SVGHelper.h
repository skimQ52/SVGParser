/* SVGHelper.h
*  Includes all headers for the helper functions that are in SVGHelper.c
*  Author: Skylar Mawle 1143676
*  CIS*2750 D. Nikitenko
*
*/
#include <math.h>
#include "SVGParser.h"
#include <stdlib.h>
#include <string.h>

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

//+++++++++++++++++++++++++++++++++++++++++++++ASSIGNMENT 2++++++++++++++++++++++++++++++++++++++++++//

bool validateXMLTree(xmlDocPtr xDoc, const char* schemaFileName);

bool svgToXmlGroup(xmlNodePtr rootNode, Group* gro);

xmlDocPtr svgToXml(const SVG *img);

char *strndup2(const char *s, size_t n);

//+++++++++++++++++++++++++++++++++++++++++++++ASSIGNMENT 3++++++++++++++++++++++++++++++++++++++++++//
char* createSVGtoJSON(const char* fileName, const char* schemaFile);

char* getTitleSVG(const char* fileName, const char* schemaFile);

char* getDescSVG(const char* fileName, const char* schemaFile);

char* getRectsSVG(const char* fileName, const char* schemaFile);

char* getCircsSVG(const char* fileName, const char* schemaFile);

char* getPathsSVG(const char* fileName, const char* schemaFile);

char* getGroupsSVG(const char* fileName, const char* schemaFile);

char* getOtherAttributesJSON(const char* fileName, const char* schemaFile, int type, int index);

int checkIfImmediateSVG(const char* fileName, const char* schemaFile, int type, int index);

int setAttributeNewSVG(const char* fileName, const char* schemaFile, int type, int index, const char* attName, const char* attValue);

int setTitleDescSVG(const char* fileName, const char* schemaFile, const char* type, const char* newValue);

int validateUploadedSVG(const char* fileName, const char* schemaFile);

int addRectToSVG(const char* fileName, const char* schemaFile, float x, float y, float width, float height, const char* units, const char* fillValue);

int addCircToSVG(const char* fileName, const char* schemaFile, float cx, float cy, float r, const char* units, const char* fillValue);
