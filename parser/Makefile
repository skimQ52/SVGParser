UNAME := $(shell uname)
CC = gcc
CFLAGS = -Wall -std=c11 -g
LDFLAGS= -L.

INC = include/
SRC = src/
UPAPATH = ../
PARSER_SRC_FILES = $(wildcard src/SVG*.c)
PARSER_OBJ_FILES = $(patsubst src/SVG%.c,../SVG%.o,$(PARSER_SRC_FILES))

ifeq ($(UNAME), Linux)
	XML_PATH = /usr/include/libxml2
endif
ifeq ($(UNAME), Darwin)
	XML_PATH = /System/Volumes/Data/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/libxml2
endif

parser: $(UPAPATH)libsvgparser.so

$(UPAPATH)libsvgparser.so: $(PARSER_OBJ_FILES) $(UPAPATH)LinkedListAPI.o
	gcc -shared -o $(UPAPATH)libsvgparser.so $(PARSER_OBJ_FILES) $(UPAPATH)LinkedListAPI.o -lxml2 -lm

#Compiles all files named SVG*.c in src/ into object files, places all corresponding SVG*.o files in bin/
$(UPAPATH)SVG%.o: $(SRC)SVG%.c $(INC)LinkedListAPI.h $(INC)SVG*.h
	gcc $(CFLAGS) -I$(XML_PATH) -I$(INC) -c -fpic $< -o $@

$(UPAPATH)liblist.so: LinkedListAPI.o
	$(CC) -shared -o liblist.so $(UPAPATH)LinkedListAPI.o

$(UPAPATH)LinkedListAPI.o: $(SRC)LinkedListAPI.c $(INC)LinkedListAPI.h
	$(CC) $(CFLAGS) -c -fpic -I$(INC) $(SRC)LinkedListAPI.c -o $(UPAPATH)LinkedListAPI.o

clean:
	rm -rf $(UPAPATH)StructListDemo $(UPAPATH)xmlExample $(UPAPATH)*.o $(UPAPATH)*.so


