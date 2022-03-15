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
    char buff[1000];
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
    char buff[1000];
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




//+++++++++++++++++++++++++++++++++++++++++++++ASSIGNMENT 2++++++++++++++++++++++++++++++++++++++++++//

SVG* createValidSVG(const char* fileName, const char* schemaFile) {

    if (fileName == NULL || schemaFile == NULL) {
        return NULL;
    }

    //VALIDATING
    xmlDoc *xDoc;
    xDoc = xmlReadFile(fileName, NULL, 0); //creates the tree
    if (xDoc == NULL) {//if not well-formed/valid
        xmlFreeDoc(xDoc);//Free Doc
        xmlCleanupParser();//Free the global variables that may have been allocated by the parser.
        return NULL;
    }

    if (!validateXMLTree(xDoc, schemaFile)) {//if xmlTree is NOT valid not pog not shy itzy
        xmlFreeDoc(xDoc);//Free Doc
        xmlCleanupParser();//Free the global variables that may have been allocated by the parser.
        return NULL;
    }

    //CREATE SVG STUFF BELOW
    SVG* mySVG = malloc(sizeof(SVG));
    xmlNode *xRoot;
    xmlNode *xRootChild;

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

bool writeSVG(const SVG* img, const char* fileName) {

    if (img == NULL || fileName == NULL) {//function params cant be null
        return false;
    }

    char *ext = NULL;
    ext = strrchr(fileName, '.');//get extension (LAST OCCURENCE OF A DOT)
    if (strcmp(ext+1, "svg") != 0) {//if file extension is not svg
        return false;
    }

    xmlDocPtr xDoc = NULL;
    xDoc = svgToXml(img);//convert to xml tree

    if (xmlSaveFormatFileEnc(fileName, xDoc, "UTF-8", 1) == -1) {//if writing to file fails return false
        xmlCleanupParser();
        xmlFreeDoc(xDoc);
        return false;
    }
    xmlCleanupParser();
    xmlFreeDoc(xDoc);
    return true;
}

bool validateSVG(const SVG* img, const char* schemaFile) {

    if (img == NULL || schemaFile == NULL || schemaFile[0] == '\0') {//all invalid pre's
        return false;
    }

    //RUN HELPER TO CONVERT TO XML TREE
    xmlDocPtr xDoc = NULL;
    xDoc = svgToXml(img);
    //THEN RUN VALIDATEXMLTREE
    if (!validateXMLTree(xDoc, schemaFile)) {//if false is returned then not valid xml -> not valid svg
        xmlCleanupParser();
        xmlFreeDoc(xDoc);
        return false;
    }

    xmlCleanupParser();
    xmlFreeDoc(xDoc);//free the xmlDoc we dont need anymore

    //THEN DO ALL THE SVGPARSER.h
    if (img->rectangles == NULL || img->circles == NULL || img->paths == NULL || img->groups == NULL || img->otherAttributes == NULL || img->namespace[0] == '\0') {//if any SVG's lists are NULL or no namespace
        return false;
    }

    void* elem;
    void* elem2;
    ListIterator iter;
    ListIterator iter2;

    //Rectangles
    List* rects = getRects(img);
    iter = createIterator(rects);
    while((elem = nextElement(&iter)) != NULL) {//for each rect
        Rectangle* rec = (Rectangle*)elem;
        if (rec->width < 0 || rec->height < 0 || rec->otherAttributes == NULL) {//if any attributes of rectangle break specification
            return false;
        }
        iter2 = createIterator(rec->otherAttributes);
        while((elem2 = nextElement(&iter2)) != NULL) {//attributes name cant be null
            Attribute* att = (Attribute*)elem2;
            if (att->name == NULL) {
                return false;
            }
        }
    }
    freeList(rects);

    //Circles
    List* circs = getCircles(img);
    iter = createIterator(circs);
    while((elem = nextElement(&iter)) != NULL) {//for each circ
        Circle* cir = (Circle*)elem;
        if (cir->otherAttributes == NULL || cir->r < 0) {//if any attributes of circle break specification
            return false;
        }
        iter2 = createIterator(cir->otherAttributes);
        while((elem2 = nextElement(&iter2)) != NULL) {//attributes name cant be null
            Attribute* att = (Attribute*)elem2;
            if (att->name == NULL) {
                return false;
            }
        }
    }
    freeList(circs);

    //Paths
    List* paths = getPaths(img);
    iter = createIterator(paths);
    while((elem = nextElement(&iter)) != NULL) {//for each path
        Path* pat = (Path*)elem;
        if (pat->data == NULL || pat->otherAttributes == NULL) {//if any attributes of path break specification
            return false;
        }
        iter2 = createIterator(pat->otherAttributes);
        while((elem2 = nextElement(&iter2)) != NULL) {//attributes name cant be null
            Attribute* att = (Attribute*)elem2;
            if (att->name == NULL) {
                return false;
            }
        }
    }
    freeList(paths);

    //GROUPS
    List* groups = getGroups(img);
    iter = createIterator(groups);
    while((elem = nextElement(&iter)) != NULL) {//for each group
        Group* gro = (Group*)elem;
        if (gro->rectangles == NULL || gro->circles == NULL || gro->paths == NULL || gro->groups == NULL || gro->otherAttributes == NULL) {//if any group lists are NULL
            return false;
        }
        iter2 = createIterator(gro->otherAttributes);
        while((elem2 = nextElement(&iter2)) != NULL) {//attributes name cant be null
            Attribute* att = (Attribute*)elem2;
            if (att->name == NULL) {
                return false;
            }
        }
    }
    freeList(groups);

    return true;
}
//END OF MODULE 1


//MODULE 2
bool setAttribute(SVG* img, elementType elemType, int elemIndex, Attribute* newAttribute) {

    if (img == NULL || elemType < 0 || elemType > 4 || newAttribute == NULL || newAttribute->name == NULL) {
        return false;
    }

    int i = 0;
    void* elem;
    ListIterator iter;
    char *ptr;

    if (elemType == 0) {//SVG_IMG is 0th

        if (strcmp((const char*)newAttribute->name, "xmlns") == 0) {
            strcpy(img->namespace, newAttribute->value);
            deleteAttribute(newAttribute);
            return true;
        }

        Node* node = NULL;
        node = img->otherAttributes->head;
        while (node != NULL) {
            Attribute* att = (Attribute*)node->data;
            if (strcmp((const char*)att->name, (const char*)newAttribute->name) == 0) {

                Attribute* att2 = NULL;//create new Attribute
                att2 = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for flexarray
                att2->name = calloc(1, (sizeof(char)*(strlen((const char*)newAttribute->name) + 1)));//malloc enough for name
                strcpy(att2->name, (const char*)newAttribute->name);//copy the name
                strcpy(att2->value, (const char*)newAttribute->value);//copy the value
                node->data = att2;
                deleteAttribute(att);//delete both attributes
                deleteAttribute(newAttribute);
                return true;
            }
            node = node->next;
        }

        //If we go through all otherAttributes and find no match we make a new and append to list.
        insertBack(img->otherAttributes, (void*)newAttribute);//append to list
    }

    else if (elemType == 1) {//CIRC is 1st

        if (elemIndex >= getLength(img->circles) || elemIndex < 0) {//out of bounds!
            return false;
        }

        iter = createIterator(img->circles);
        elem = nextElement(&iter);
        while(i < elemIndex) {//get to proper elem in list
            elem = nextElement(&iter);
            i++;
        }
        Circle* cir = (Circle*)elem;

        if (strcmp("cx", (const char*)newAttribute->name) == 0) {
            cir->cx = strtof((const char*)newAttribute->value, &ptr);
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else if (strcmp("cy", (const char*)newAttribute->name) == 0) {
            cir->cy = strtof((const char*)newAttribute->value, &ptr);
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else if (strcmp("r", (const char*)newAttribute->name) == 0) {
            cir->r = strtof((const char*)newAttribute->value, &ptr);
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else {//otherAttributes list
            Node* node = NULL;
            node = cir->otherAttributes->head;
            while (node != NULL) {
                Attribute* att = (Attribute*)node->data;
                if (strcmp((const char*)att->name, (const char*)newAttribute->name) == 0) {

                    Attribute* att2 = NULL;//create new Attribute
                    att2 = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for flexarray
                    att2->name = calloc(1, (sizeof(char)*(strlen((const char*)newAttribute->name) + 1)));//malloc enough for name
                    strcpy(att2->name, (const char*)newAttribute->name);//copy the name
                    strcpy(att2->value, (const char*)newAttribute->value);//copy the value
                    node->data = att2;
                    deleteAttribute(att);//delete both attributes
                    deleteAttribute(newAttribute);
                    return true;
                }
                node = node->next;
            }
            //If we go through all otherAttributes and find no match we make a new and append to list.
            insertBack(cir->otherAttributes, (void*)newAttribute);//append to list
        }
    }

    else if (elemType == 2) {//RECT is 2nd

        if (elemIndex >= getLength(img->rectangles) || elemIndex < 0) {//out of bounds!
            return false;
        }

        iter = createIterator(img->rectangles);
        elem = nextElement(&iter);
        while(i < elemIndex) {//get to proper elem in list
            elem = nextElement(&iter);
            i++;
        }
        Rectangle* rec = (Rectangle*)elem;

        if (strcmp("x", (const char*)newAttribute->name) == 0) {
            rec->x = strtof((const char*)newAttribute->value, &ptr);
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else if (strcmp("y", (const char*)newAttribute->name) == 0) {
            rec->y = strtof((const char*)newAttribute->value, &ptr);//string to float value
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else if (strcmp("width", (const char*)newAttribute->name) == 0) {
            rec->width = strtof((const char*)newAttribute->value, &ptr);//string to float value
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else if (strcmp("height", (const char*)newAttribute->name) == 0) {
            rec->height = strtof((const char*)newAttribute->value, &ptr);//string to float value
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else {//otherAttributes list
            Node* node = NULL;
            node = rec->otherAttributes->head;
            while (node != NULL) {
                Attribute* att = (Attribute*)node->data;
                if (strcmp((const char*)att->name, (const char*)newAttribute->name) == 0) {

                    Attribute* att2 = NULL;//create new Attribute
                    att2 = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for flexarray
                    att2->name = calloc(1, (sizeof(char)*(strlen((const char*)newAttribute->name) + 1)));//malloc enough for name
                    strcpy(att2->name, (const char*)newAttribute->name);//copy the name
                    strcpy(att2->value, (const char*)newAttribute->value);//copy the value
                    node->data = att2;
                    deleteAttribute(att);//delete both attributes
                    deleteAttribute(newAttribute);
                    return true;
                }
                node = node->next;
            }
            //If we go through all otherAttributes and find no match we make a new and append to list.
            insertBack(rec->otherAttributes, (void*)newAttribute);//append to list
        }
    }

    else if (elemType == 3) {//PATH is 3rd

        if (elemIndex >= getLength(img->paths) || elemIndex < 0) {//out of bounds!
            return false;
        }

        if (strcmp("d", (const char*)newAttribute->name) == 0) {
            Node* node2 = NULL;
            node2 = img->paths->head;
            while (i < elemIndex) {
                node2 = node2->next;
                i++;
            }
            Path* pat = (Path*)node2->data;//get path from cast
            Path *pat2 = NULL;
            pat2 = calloc(1, (sizeof(Path) + (sizeof(char)*strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for array
            strcpy(pat2->data, (const char*)newAttribute->value);
            pat2->otherAttributes = pat->otherAttributes;
            free(pat);//only free the path not the list with deletePath
            node2->data = pat2;
            deleteAttribute(newAttribute);//delete newAttribute
        }
        else {//otherAttributes list
            iter = createIterator(img->paths);
            elem = nextElement(&iter);
            while(i < elemIndex) {//get to proper elem in list
                elem = nextElement(&iter);
                i++;
            }
            Path* pat = (Path*)elem;

            Node* node = NULL;
            node = pat->otherAttributes->head;
            while (node != NULL) {
                Attribute* att = (Attribute*)node->data;
                if (strcmp((const char*)att->name, (const char*)newAttribute->name) == 0) {

                    Attribute* att2 = NULL;//create new Attribute
                    att2 = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for flexarray
                    att2->name = calloc(1, (sizeof(char)*(strlen((const char*)newAttribute->name) + 1)));//malloc enough for name
                    strcpy(att2->name, (const char*)newAttribute->name);//copy the name
                    strcpy(att2->value, (const char*)newAttribute->value);//copy the value
                    node->data = att2;
                    deleteAttribute(att);//delete both attributes
                    deleteAttribute(newAttribute);
                    return true;
                }
                node = node->next;
            }
            //If we go through all otherAttributes and find no match we make a new and append to list.
            insertBack(pat->otherAttributes, (void*)newAttribute);//append to list
        }
    }

    else {//GROUP is 4th

        if (elemIndex >= getLength(img->groups) || elemIndex < 0) {//out of bounds!
            return false;
        }

        iter = createIterator(img->groups);
        elem = nextElement(&iter);
        while(i < elemIndex) {//get to proper elem in list
            elem = nextElement(&iter);
            i++;
        }
        Group* gro = (Group*)elem;

        Node* node = NULL;
        node = gro->otherAttributes->head;
        while (node != NULL) {
            Attribute* att = (Attribute*)node->data;
            if (strcmp((const char*)att->name, (const char*)newAttribute->name) == 0) {

                Attribute* att2 = NULL;//create new Attribute
                att2 = calloc(1, (sizeof(Attribute) + sizeof(char)*(strlen((const char*)newAttribute->value) + 1)));//malloc sizeof att + size for flexarray
                att2->name = calloc(1, (sizeof(char)*(strlen((const char*)newAttribute->name) + 1)));//malloc enough for name
                strcpy(att2->name, (const char*)newAttribute->name);//copy the name
                strcpy(att2->value, (const char*)newAttribute->value);//copy the value
                node->data = att2;
                deleteAttribute(att);//delete both attributes
                deleteAttribute(newAttribute);
                return true;
            }
            node = node->next;
        }
        //If we go through all otherAttributes and find no match we make a new and append to list.
        insertBack(gro->otherAttributes, (void*)newAttribute);//append to list
    }
    return true;
}

void addComponent(SVG* img, elementType type, void* newElement) {

    if (img == NULL || type < 1 || type > 3 || newElement == NULL) {
        return;
    }

    if (type == 1) {//new CIRC
        Circle* cir = (Circle*)newElement;
        if (cir->otherAttributes == NULL || cir->r < 0) {
            return;
        }
        insertBack(img->circles, newElement);
    }
    else if (type == 2) {//new RECT
        Rectangle* rec = (Rectangle*)newElement;
        if (rec->otherAttributes == NULL || rec->width < 0 || rec->height < 0) {
            return;
        }
        insertBack(img->rectangles, newElement);
    }
    else {//new PATH
        Path* pat = (Path*)newElement;
        if (pat->otherAttributes == NULL || pat->data == NULL) {
            return;
        }
        insertBack(img->paths, newElement);
    }
}
//END OF MODULE 2

//MODULE 3
char* attrToJSON(const Attribute *a) {
    char* str = NULL;
    if (a == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }
    str = calloc(1, (sizeof(char)*((22+1) + strlen((const char*)a->name) + strlen((const char*)a->value))));
    sprintf(str, "{\"name\":\"%s\",\"value\":\"%s\"}", a->name, a->value);
    return str;
}

char* circleToJSON(const Circle *c) {
    char* str = NULL;
    if (c == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }
    char buff[1000];
    sprintf(buff, "%.2f%.2f%.2f%d", c->cx, c->cy, c->r, getLength(c->otherAttributes));//to determine the number of chars needed to allocate for the returning string for these variables
    str = calloc(1, (sizeof(char)*((40+1) + strlen(buff) + strlen(c->units))));
    sprintf(str, "{\"cx\":%.2f,\"cy\":%.2f,\"r\":%.2f,\"numAttr\":%d,\"units\":\"%s\"}", c->cx, c->cy, c->r, getLength(c->otherAttributes), c->units);
    return str;
}

char* rectToJSON(const Rectangle *r) {
    char* str = NULL;
    if (r == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }
    char buff[1000];
    sprintf(buff, "%.2f%.2f%.2f%.2f%d", r->x, r->y, r->width, r->height, getLength(r->otherAttributes));//to determine the number of chars needed to allocate for the returning string for these variables
    str = calloc(1, (sizeof(char)*((43+1) + strlen(buff) + strlen(r->units))));
    sprintf(str, "{\"x\":%.2f,\"y\":%.2f,\"w\":%.2f,\"h\":%.2f,\"numAttr\":%d,\"units\":\"%s\"}",r->x, r->y, r->width, r->height, getLength(r->otherAttributes), r->units);
    return str;
}

char* pathToJSON(const Path *p) {
    char* str = NULL;
    if (p == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }
    char buff[1000];
    sprintf(buff, "%d", getLength(p->otherAttributes));//to determine the number of chars needed to allocate for the returning string for these variables
    if (strlen(p->data) > 64) {
        char *trunc = calloc(64, sizeof(char));
        strncpy(trunc, p->data, 64);
        str = calloc(1, (sizeof(char)*((19+1) + 64 + strlen(buff))));
        sprintf(str, "{\"d\":\"%s\",\"numAttr\":%d}", trunc, getLength(p->otherAttributes));
        free(trunc);
        return str;
    }
    str = calloc(1, (sizeof(char)*((19+1) + strlen(p->data) + strlen(buff))));
    sprintf(str, "{\"d\":\"%s\",\"numAttr\":%d}", p->data, getLength(p->otherAttributes));
    return str;
}

char* groupToJSON(const Group *g) {
    char* str = NULL;
    if (g == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }
    int children = getLength(g->circles) + getLength(g->rectangles) + getLength(g->paths) + getLength(g->groups);
    char buff[1000];
    sprintf(buff, "%d%d", children, getLength(g->otherAttributes));//to determine the number of chars needed to allocate for the returning string for these variables
    str = calloc(1, (sizeof(char)*((24+1) + strlen(buff))));
    sprintf(str, "{\"children\":%d,\"numAttr\":%d}", children, getLength(g->otherAttributes));
    return str;
}

char* SVGtoJSON(const SVG* image) {

    char* str = NULL;
    if (image == NULL) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "{}");
        return str;
    }

    List* rects = getRects(image);//get all elements from svg img
    List* circs = getCircles(image);
    List* paths = getPaths(image);
    List* groups = getGroups(image);

    char buff[1000];
    sprintf(buff, "%d%d%d%d", getLength(circs), getLength(rects), getLength(paths), getLength(groups));//to determine the number of chars needed to allocate for the returning string for these variables
    str = calloc(1, (sizeof(char)*((48+1) + strlen(buff))));
    sprintf(str, "{\"numRect\":%d,\"numCirc\":%d,\"numPaths\":%d,\"numGroups\":%d}", getLength(rects), getLength(circs), getLength(paths), getLength(groups));

    freeList(rects);//free the lists we got
    freeList(circs);
    freeList(paths);
    freeList(groups);

    return str;
}

char *attrListToJSON(const List *list) {
    char *str = NULL;
    char *temp = NULL;
    int size = 0;
    if (list == NULL || getLength((List*)list) == 0) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "[]");
        return str;
    }
    ListIterator iter;
    void* elem;
    iter = createIterator((List*)list);//other attributes of path
    while((elem = nextElement(&iter)) != NULL) {
        Attribute* att = (Attribute*)elem;
        temp = attrToJSON(att);
        size += strlen(temp);
        free(temp);
    }

    int num = getLength((List*)list);
    str = calloc(1, sizeof(char)*(size + 2 + (num-1) + 1));//2 for the 2 brackets, num-1 for each comma, +1 for \0

    ListIterator iter2;
    void* elem2;
    iter2 = createIterator((List*)list);
    elem2 = nextElement(&iter2);
    strcpy(str, "[");//starts with open bracket
    for (int i = 0; i < num; i++) {
        Attribute* att = (Attribute*)elem2;
        temp = attrToJSON(att);
        strcat(str, temp);//add attribute to big str
        free(temp);
        if (i != num-1) {//if not last attr in list
            strcat(str, ",");//add comma
        }
        elem2 = nextElement(&iter2);
    }
    strcat(str, "]");//end with closed bracket
    return str;
}

char *circListToJSON(const List *list) {
    char *str = NULL;
    char *temp = NULL;
    int size = 0;
    if (list == NULL || getLength((List*)list) == 0) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "[]");
        return str;
    }
    ListIterator iter;
    void* elem;
    iter = createIterator((List*)list);//other attributes of path
    while((elem = nextElement(&iter)) != NULL) {
        Circle* cir = (Circle*)elem;
        temp = circleToJSON(cir);
        size += strlen(temp);
        free(temp);
    }

    int num = getLength((List*)list);
    str = calloc(1, sizeof(char)*(size + 2 + (num-1) + 1));//2 for the 2 brackets, num-1 for each comma, +1 for \0

    ListIterator iter2;
    void* elem2;
    iter2 = createIterator((List*)list);
    elem2 = nextElement(&iter2);
    strcpy(str, "[");//starts with open bracket
    for (int i = 0; i < num; i++) {
        Circle* cir = (Circle*)elem2;
        temp = circleToJSON(cir);
        strcat(str, temp);//add attribute to big str
        free(temp);
        if (i != num-1) {//if not last attr in list
            strcat(str, ",");//add comma
        }
        elem2 = nextElement(&iter2);
    }
    strcat(str, "]");//end with closed bracket
    return str;
}

char *rectListToJSON(const List *list) {
    char *str = NULL;
    char *temp = NULL;
    int size = 0;
    if (list == NULL || getLength((List*)list) == 0) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "[]");
        return str;
    }
    ListIterator iter;
    void* elem;
    iter = createIterator((List*)list);
    while((elem = nextElement(&iter)) != NULL) {
        Rectangle* rec = (Rectangle*)elem;
        temp = rectToJSON(rec);
        size += strlen(temp);
        free(temp);
    }

    int num = getLength((List*)list);
    str = calloc(1, sizeof(char)*(size + 2 + (num-1) + 1));//2 for the 2 brackets, num-1 for each comma, +1 for \0

    ListIterator iter2;
    void* elem2;
    iter2 = createIterator((List*)list);
    elem2 = nextElement(&iter2);
    strcpy(str, "[");//starts with open bracket
    for (int i = 0; i < num; i++) {
        Rectangle* rec = (Rectangle*)elem2;
        temp = rectToJSON(rec);
        strcat(str, temp);//add attribute to big str
        free(temp);
        if (i != num-1) {//if not last attr in list
            strcat(str, ",");//add comma
        }
        elem2 = nextElement(&iter2);
    }
    strcat(str, "]");//end with closed bracket
    return str;
}

char *pathListToJSON(const List *list) {
    char *str = NULL;
    char *temp = NULL;
    int size = 0;
    if (list == NULL || getLength((List*)list) == 0) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "[]");
        return str;
    }
    ListIterator iter;
    void* elem;
    iter = createIterator((List*)list);//other attributes of path
    while((elem = nextElement(&iter)) != NULL) {
        Path* pat = (Path*)elem;
        temp = pathToJSON(pat);
        size += strlen(temp);
        free(temp);
    }

    int num = getLength((List*)list);
    str = calloc(1, sizeof(char)*(size + 2 + (num-1) + 1));//2 for the 2 brackets, num-1 for each comma, +1 for \0

    ListIterator iter2;
    void* elem2;
    iter2 = createIterator((List*)list);
    elem2 = nextElement(&iter2);
    strcpy(str, "[");//starts with open bracket
    for (int i = 0; i < num; i++) {
        Path* pat = (Path*)elem2;
        temp = pathToJSON(pat);
        strcat(str, temp);//add attribute to big str
        free(temp);
        if (i != num-1) {//if not last attr in list
            strcat(str, ",");//add comma
        }
        elem2 = nextElement(&iter2);
    }
    strcat(str, "]");//end with closed bracket
    return str;
}

char* groupListToJSON(const List *list) {
    char *str = NULL;
    char *temp = NULL;
    int size = 0;
    if (list == NULL || getLength((List*)list) == 0) {
        str = calloc(1, sizeof(char)*(2+1));
        strcpy(str, "[]");
        return str;
    }
    ListIterator iter;
    void* elem;
    iter = createIterator((List*)list);//other attributes of path
    while((elem = nextElement(&iter)) != NULL) {
        Group* gro = (Group*)elem;
        temp = groupToJSON(gro);
        size += strlen(temp);
        free(temp);
    }

    int num = getLength((List*)list);
    str = calloc(1, sizeof(char)*(size + 2 + (num-1) + 1));//2 for the 2 brackets, num-1 for each comma, +1 for \0

    ListIterator iter2;
    void* elem2;
    iter2 = createIterator((List*)list);
    elem2 = nextElement(&iter2);
    strcpy(str, "[");//starts with open bracket
    for (int i = 0; i < num; i++) {
        Group* gro = (Group*)elem2;
        temp = groupToJSON(gro);
        strcat(str, temp);//add attribute to big str
        free(temp);
        if (i != num-1) {//if not last attr in list
            strcat(str, ",");//add comma
        }
        elem2 = nextElement(&iter2);
    }
    strcat(str, "]");//end with closed bracket
    return str;
}

//BONUS M3

SVG* JSONtoSVG(const char* svgString) {
    if (svgString == NULL) {
        return NULL;
    }

    SVG* mySVG = malloc(sizeof(SVG));

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

    strcpy(mySVG->namespace, "http://www.w3.org/2000/svg");

    char *title = NULL;
    title = strstr(svgString, "\"title\":");
    title += 9;//get to start of title

    char *desc = NULL;
    desc = strstr(svgString, "\"descr\":");
    char *end = NULL;
    end = desc - 2;//end for title

    char *temp = strndup2(title, (end-title));
    strcpy(mySVG->title, temp);
    free(temp);

    while (*end != '\0') {//get to string end
        end++;
    }
    end -= 2;//go back 2 to get to actual end
    desc += 9;//get to srat of description

    temp = strndup2(desc, (end-desc));
    strcpy(mySVG->description, temp);
    free(temp);

    return mySVG;
}

Rectangle* JSONtoRect(const char* svgString) {

    if (svgString == NULL) {
        return NULL;
    }

    Rectangle *newRectangle = calloc(1, sizeof(Rectangle));
    newRectangle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);

    char *end = NULL;
    char *temp = NULL;
    char *x = NULL;
    x = strstr(svgString, "\"x\":");//find first instance of x
    x += 4;//get to start of x

    char *y = NULL;
    y = strstr(svgString, "\"y\":");
    end = y - 1;//end for x
    temp = strndup2(x, (end-x));//get x value
    newRectangle->x = atof(temp);//conversion
    free(temp);
    y += 4;//get to start of y

    char *w = NULL;
    w = strstr(svgString, "\"w\":");
    end = w - 1;//end for y
    temp = strndup2(y, (end-y));//get y value
    newRectangle->y = atof(temp);//conversion
    free(temp);
    w += 4;//get to start of w

    char *h = NULL;
    h = strstr(svgString, "\"h\":");
    end = h - 1;//end for w
    temp = strndup2(w, (end-w));//get w value
    newRectangle->width = atof(temp);//conversion
    free(temp);
    h += 4;//get to start of h

    char *units = NULL;
    units = strstr(svgString, "\"units\":");
    end = units - 1;//end for h
    temp = strndup2(h, (end-h));//get h value
    newRectangle->height = atof(temp);//conversion
    free(temp);
    units += 9;//get to start of units

    while (*end != '\0') {//get to string end
        end++;
    }
    end -= 2;//go back 2 to get to actual end

    temp = strndup2(units, (end-units));
    strcpy(newRectangle->units, temp);
    free(temp);

    return newRectangle;
}


Circle* JSONtoCircle(const char* svgString) {

    if (svgString == NULL) {
        return NULL;
    }

    Circle *newCircle = calloc(1, sizeof(Circle));
    newCircle->otherAttributes = initializeList(&attributeToString, &deleteAttribute, &compareAttributes);

    char *end = NULL;
    char *temp = NULL;
    char *cx = NULL;
    cx = strstr(svgString, "\"cx\":");//find first instance of cx
    cx += 5;//get to start of cx

    char *cy = NULL;
    cy = strstr(svgString, "\"cy\":");
    end = cy - 1;//end for cx
    temp = strndup2(cx, (end-cx));//get cx value
    newCircle->cx = atof(temp);//conversion
    free(temp);
    cy += 5;//get to start of cy

    char *r = NULL;
    r = strstr(svgString, "\"r\":");
    end = r - 1;//end for cy
    temp = strndup2(cy, (end-cy));//get cy value
    newCircle->cy = atof(temp);//conversion
    free(temp);
    r += 4;//get to start of r

    char *units = NULL;
    units = strstr(svgString, "\"units\":");
    end = units - 1;//end for r
    temp = strndup2(r, (end-r));//get r value
    newCircle->r = atof(temp);//conversion
    free(temp);
    units += 9;//get to start of units

    while (*end != '\0') {//get to string end
        end++;
    }
    end -= 2;//go back 2 to get to actual end

    temp = strndup2(units, (end-units));
    strcpy(newCircle->units, temp);
    free(temp);

    return newCircle;
}

//END OF MODULE 3

