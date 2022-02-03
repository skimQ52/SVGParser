/* SVGParser.c
*  Includes all functions that are in SVGParser.h and in the assignment Modules 1 and 2
*  Author: Skylar Mawle 1143676
*  CIS*2750 D. Nikitenko
*  Sample code used and altered from http://www.xmlsoft.org/examples/tree1.c (in function createSVG)
*/

#include "SVGParser.h"
#include "SVGHelper.h"

//================================================= MODULE 1

SVG* createSVG(const char* fileName) {

    if (fileName == NULL) {
        return NULL;
    }

    SVG* mySVG = malloc(sizeof(SVG));
    xmlDoc *xDoc;
    xmlNode *xRoot;
    xmlNode *xRootChild;

    xDoc = xmlReadFile(fileName, NULL, 0); //creates the tree
    if (xDoc == NULL) {//if not well-formed/valid
        return NULL;
    }
    
    //initialize members to be empty!
    mySVG->namespace[0] = '\0';
    mySVG->title[0] = '\0';
    mySVG->description[0] = '\0';
    
    //initialize lists in svg
    mySVG->rectangles = initializeList(&rectangleToString, &deleteRectangle, &compareRectangles);
    mySVG->paths = initializeList(&pathToString, &deletePath, &comparePaths);
    mySVG->circles = initializeList(&circleToString, &deleteCircle, &compareCircles);
    mySVG->groups = initializeList(&groupToString, &deleteGroup, &compareGroups);
    mySVG->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);

    xRoot = xmlDocGetRootElement(xDoc);
    
    strcpy(mySVG->namespace, (const char*)xRoot->ns->href);

    if (strcmp((const char *)xRoot->name,"svg") == 0) {//should trigger if proper svg
        struct _xmlAttr *prop;
        for (prop = xRoot->properties; prop != NULL; prop = prop->next) {//to get Attributes of svg element

            Attribute *newAttribute = createAttribute(prop);
            insertBack(mySVG->otherAttributes, (void*)newAttribute);//add to list of attributes
        }
    }
    else {
        return NULL;
    }

    xRootChild = xRoot->children;
    parseXML(mySVG, xRootChild);

    xmlFreeDoc(xDoc);//Free Doc
    xmlCleanupParser();//Free the global variables that may have been allocated by the parser.
    return mySVG;
}

char* SVGToString(const SVG* img) {

    if (img == NULL) {
        return NULL;
    }

    char *oaStr = toString(img->otherAttributes);
    char *reStr = toString(img->rectangles);
    char *ciStr = toString(img->circles);
    char *paStr = toString(img->paths);
    char *grStr = toString(img->groups);
    char *str = NULL;//to be returned

    str = malloc(sizeof(char)*(strlen((const char *)img->namespace)+strlen((const char *)img->title)+strlen((const char *)img->description)+strlen(oaStr)+strlen(reStr)+strlen(ciStr)+strlen(paStr)+strlen(grStr)+104));//plus 104 for extra chars
    sprintf(str, "Namespace: |%s|\nTitle: |%s|\nDescription: |%s|\nOther Attributes:\n%s\n", img->namespace, img->title, img->description, oaStr);
    sprintf(str + strlen(str), "-RECTANGLES-\n%s\n-CIRCLES-\n%s\n-PATHS-\n%s\n-GROUPS-\n%s\n", reStr, ciStr, paStr, grStr);
    free(oaStr);
    free(reStr);
    free(ciStr);
    free(paStr);
    free(grStr);
    return str;
}

void deleteSVG(SVG* img) {

    if (img == NULL) {
        return;
    }

    freeList(img->rectangles);
    freeList(img->circles);
    freeList(img->paths);
    freeList(img->otherAttributes);
    freeList(img->groups);
    free(img);
}

//-----------------other helpers NEEDED


//ATTRIBUTE FUNCS
void deleteAttribute( void* data){
    Attribute *a = (Attribute*)data; //cast from void * to Attribute
    free(a->name);//might not need
    free(a);
}
char* attributeToString(void* data){

    Attribute *a = (Attribute*)data; //cast from void * to Attribute
    char *str = malloc(sizeof(char)*strlen(a->name)*strlen(a->value)+50);//plus 40 for other characters
    sprintf(str, "\tAttribute name: |%s| Attribute value: |%s|\n", a->name, a->value);
    return str;
}
int compareAttributes(const void *first, const void *second){
    return 0;
}

//GROUP FUNCS
void deleteGroup(void* data){
    Group *g = (Group*)data; //cast from void * to Attribute
    freeList(g->rectangles);
    freeList(g->circles);
    freeList(g->paths);
    freeList(g->otherAttributes);
    freeList(g->groups);
    free(g);
}
char* groupToString(void* data){
    Group *g = (Group*)data; //cast from void * to Attribute
    char *oaStr = toString(g->otherAttributes);
    char *reStr = toString(g->rectangles);
    char *ciStr = toString(g->circles);
    char *paStr = toString(g->paths);
    char *grStr = toString(g->groups);
    char *str = malloc(sizeof(char)*(strlen(reStr)+strlen(ciStr)+strlen(paStr)+strlen(grStr)+strlen(oaStr)+127));
    sprintf(str, "\n  GROUP:\n\tGroup Attributes:\n%s\n\tRectangles in Group:\n%s\n\tCircles in Group:\n%s\n\tPaths in Group:\n%s\n\tGroups in Group:\n%s\n--END OF GROUP--", oaStr, reStr, ciStr, paStr, grStr);
    free(oaStr);
    free(reStr);
    free(ciStr);
    free(paStr);
    free(grStr);
    return str;
}
int compareGroups(const void *first, const void *second){
    return 0;
}

//RECT FUNCS
void deleteRectangle(void* data){
    Rectangle *r = (Rectangle*)data; //cast from void * to Rectangle
    freeList(r->otherAttributes);
    free(r);
}
char* rectangleToString(void* data){
    Rectangle *r = (Rectangle*)data; //cast from void * to Rectangle
    char buff[100];
    char *oaStr = toString(r->otherAttributes);
    sprintf(buff, "%f%f%f%f", r->x, r->y, r->width, r->height);//to determine the number of chars needed to allocate for the returning string for these variables
    char *str = malloc(sizeof(char)*(strlen(r->units) + strlen(oaStr) + strlen(buff))+100);//sizes of both stirngs plus 78 for other characters
    sprintf(str, "\n\tRectangle: x = %.1f, y = %.1f, width = %.1f, height = %.1f, units = %s\n\tOther Attributes:\n%s", r->x, r->y, r->width, r->height, r->units, oaStr);
    free(oaStr);
    return str;
}
int compareRectangles(const void *first, const void *second){
    return 0;
}

//CIRCLE FUNCS
void deleteCircle(void* data){
    Circle *c = (Circle*)data; //cast from void * to Circle
    freeList(c->otherAttributes);
    free(c);
}
char* circleToString(void* data){
    Circle *c = (Circle*)data; //cast from void * to Circle
    char buff[100];
    char *oaStr = toString(c->otherAttributes);
    sprintf(buff, "%f%f%f", c->cx, c->cy, c->r);//to determine the number of chars needed to allocate for the returning string for these variables
    char *str = malloc(sizeof(char)*(strlen(c->units) + strlen(oaStr) + strlen(buff))+67);//sizes of buff, string of units and size of attributes list tostring plus 67 for other characters
    sprintf(str, "\n\tCircle: cx = %.1f, cy = %.1f, radius = %.1f, units = %s\n\tOther Attributes:\n%s", c->cx, c->cy, c->r, c->units, oaStr);
    free(oaStr);
    return str;
}
int compareCircles(const void *first, const void *second){
    return 0;
}

//PATH FUNCS
void deletePath(void* data){
    Path *p = (Path*)data; //cast from void * to Path
    freeList(p->otherAttributes);
    free(p);
}
char* pathToString(void* data){

    Path *p = (Path*)data; //cast from void * to Path
    char *oaStr = toString(p->otherAttributes);
    char *str = malloc(sizeof(char)*(strlen(p->data) + strlen(oaStr)+46));//sizes of both stirngs plus 40 for other characters
    sprintf(str, "\n\tPath: data = %s\n\tOther Attributes:\n%s", p->data, oaStr);
    free(oaStr);
    return str;
}
int comparePaths(const void *first, const void *second){
    return 0;
}


//================================================= END OF MODULE 1



//================================================= MODULE 2

//---------------------------------ACCESSORS
List* getRects(const SVG* img) {

    List* newRects = initializeList(&rectangleToString, &dummyDelete, &compareRectangles);//init with dummy delete

    if (img == NULL) {
        return newRects;
    }

    void* elem;
    void* elem2;
    ListIterator iter = createIterator(img->rectangles);

    while((elem = nextElement(&iter)) != NULL) {//get all independent rects

        insertBack(newRects, elem);
    }
    
    List* groups = getGroups(img);
    
    ListIterator iter2 = createIterator(groups);

    while ((elem = nextElement(&iter2)) != NULL) {//get rects in groups
        Group* gro = (Group*)elem;
        ListIterator iter3 = createIterator(gro->rectangles);
        while ((elem2 = nextElement(&iter3)) != NULL) {

            insertBack(newRects, elem2);
        }
    }
    freeList(groups);//free list of groups gotten
    return newRects;
}

List* getCircles(const SVG* img) {

    List* newCircles = initializeList(&circleToString, &dummyDelete, &compareCircles);//init list with dummy delete

    if (img == NULL) {//if img is null retuyrn empty list
        return newCircles;
    }

    void* elem;
    void* elem2;
    ListIterator iter = createIterator(img->circles);

    while((elem = nextElement(&iter)) != NULL) {//get independent circles

        insertBack(newCircles, elem);
    }
    
    List* groups = getGroups(img);
    ListIterator iter2 = createIterator(groups);

    while ((elem = nextElement(&iter2)) != NULL) {//get circles in all groups
        Group* gro = (Group*)elem;
        ListIterator iter3 = createIterator(gro->circles);
        while ((elem2 = nextElement(&iter3)) != NULL) {

            insertBack(newCircles, elem2);
        }
    }

    freeList(groups);
    return newCircles;
}

List* getGroups(const SVG* img) {

    List* newGroups = initializeList(&groupToString, &dummyDelete, &compareGroups);

    if (img == NULL) {
        return newGroups;
    }

    void* elem;
    ListIterator iter = createIterator(img->groups);//parent iterator

    while((elem = nextElement(&iter)) != NULL) {

        insertBack(newGroups, elem);//insert all paraent iterators
        Group* gro = (Group*)elem;
        formGroups(gro, newGroups);
    }

    return newGroups;
}

List* getPaths(const SVG* img) {

    List* newPaths = initializeList(&pathToString, &dummyDelete, &comparePaths);

    if (img == NULL) {
        return newPaths;
    }

    void* elem;
    void* elem2;
    ListIterator iter = createIterator(img->paths);

    while((elem = nextElement(&iter)) != NULL) {

        insertBack(newPaths, elem);
    }
    
    List* groups = getGroups(img);
    ListIterator iter2 = createIterator(groups);

    while ((elem = nextElement(&iter2)) != NULL) {
        Group* gro = (Group*)elem;
        ListIterator iter3 = createIterator(gro->paths);
        while ((elem2 = nextElement(&iter3)) != NULL) {

            insertBack(newPaths, elem2);
        }
    }

    freeList(groups);
    return newPaths;
}


//-----------------------------SUMMARIES
int numRectsWithArea(const SVG* img, float area) {

    if (img == NULL || area <= 0) {//if invalid parameters return 0
        return 0;
    }

    List* rects = getRects(img);//get all rects
    void* elem;
    int count = 0;
    int rArea;

    ListIterator iter = createIterator(rects);
    elem = nextElement(&iter);
    while(elem != NULL) {//search all rects for proper ones
        Rectangle* r = (Rectangle*)elem;

        rArea = ceil(r->width * r->height);

        if (rArea == ceil(area)) {
            count++;
        }
        elem = nextElement(&iter);
    }

    freeList(rects);//free the list we got
    return count;
}

int numCirclesWithArea(const SVG* img, float area) {

    if (img == NULL || area <= 0) {//if invalid parameters return 0
        return 0;
    }

    List* circs = getCircles(img);
    void* elem;
    int count = 0;
    int cArea;

    ListIterator iter = createIterator(circs);
    elem = nextElement(&iter);
    while(elem != NULL) {
        Circle* c = (Circle*)elem;

        cArea = ceil(acos(0)*2*c->r*c->r);//AREA OF CIRCLE = (pi)r^2

        if (cArea == ceil(area)) {
            count++;
        }
        elem = nextElement(&iter);
    }

    freeList(circs);
    return count;
}

int numPathsWithdata(const SVG* img, const char* data) {

    if (img == NULL) {
        return 0;
    }

    List* paths = getPaths(img);
    void* elem;
    int count = 0;

    ListIterator iter = createIterator(paths);
    elem = nextElement(&iter);
    while(elem != NULL) {
        Path* p = (Path*)elem;

        if (strcmp(p->data, data) == 0) {
            count++;
        }
        elem = nextElement(&iter);
    }

    freeList(paths);
    return count;
}

int numGroupsWithLen(const SVG* img, int len) {

    if (img == NULL || len < 0) {
        return 0;
    }

    List* groups = getGroups(img);
    void* elem;
    int count = 0;
    int gLen;

    ListIterator iter = createIterator(groups);
    elem = nextElement(&iter);
    while(elem != NULL) {
        gLen = 0;
        Group* g = (Group*)elem;

        gLen += getLength(g->rectangles);
        gLen += getLength(g->circles);
        gLen += getLength(g->paths);
        gLen += getLength(g->groups);

        if (gLen == len) {
            count++;
        }
        elem = nextElement(&iter);
    }

    freeList(groups);
    return count;
}

int numAttr(const SVG* img) {

    if (img == NULL) {
        return 0;
    }

    int count = 0;
    void* elem;
    List *rects = getRects(img);
    List *circs = getCircles(img);
    List *paths = getPaths(img);
    List* groups = getGroups(img);
    
    count += getLength(img->otherAttributes);

    ListIterator iter = createIterator(rects);
    elem = nextElement(&iter);
    while(elem != NULL) {
        Rectangle* r = (Rectangle*)elem;
        count += getLength(r->otherAttributes);
        elem = nextElement(&iter);
    }
    ListIterator iter2 = createIterator(circs);
    elem = nextElement(&iter2);
    while(elem != NULL) {
        Circle* c = (Circle*)elem;
        count += getLength(c->otherAttributes);
        elem = nextElement(&iter2);
    }
    ListIterator iter3 = createIterator(paths);
    elem = nextElement(&iter3);
    while(elem != NULL) {
        Path* p = (Path*)elem;
        count += getLength(p->otherAttributes);
        elem = nextElement(&iter3);
    }
    ListIterator iter4 = createIterator(groups);
    elem = nextElement(&iter4);
    while(elem != NULL) {
        Group* g = (Group*)elem;
        count += getLength(g->otherAttributes);
        elem = nextElement(&iter4);
    }

    freeList(rects);
    freeList(circs);
    freeList(paths);
    freeList(groups);
    return count;
}
//--------------------------------------END OF MODULE 2

