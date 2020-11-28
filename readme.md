# LUA-INTERPRETER

Lua interpreter is a js interpreter that works in pair with the npm package __luaparse__ or any package that outputs the __same data__

## How to use ?

    require("lua-interpreter")
    interpret(you-ast-from-luaparse)

### Other features

Custom methods :

    var methods = {
        print:{call:(arguments,scope)=>{
            console.log(parseArguments(arguments,scope))
        }}
    }
    
    interpret(<code>,methods)

The method object contains a call function that will be called everytime the function is called and it takes 2 parameters : the arguments and the scope !

### What is the scope ?

The scope is the collection of the variables that will be passed from functions to functions: in lua those can be referenced as local variables or iterators in for loops, basically it's just the variables that are only available in the block they have been defined

### Functions to help you make custom built-in methods

This module contains various javascript functions that enables you to make functions that will be there by default when the script is being executed

Those are :

### Parse argument

Parse argument will take an argument that you have passed in a function for example and return it's value because since values can change during run time luaparse doesn't tell the value directly and those functions return the value with the currect type

    parseArgument(argument,scope) // Will parse the argument 
    parseArguments(arguments,scope) // Will call parse argument for an array

Examples :

    print:{call:(arguments,scope)=>{
        console.log(parseArguments(arguments,scope))
    }}

    Date:{call:(arguments,scope)=>{
        return {
            now : Date.now()
        }
    }}

### Parse expression 

This is a big part of the parseArgument function, it parse any expression such as val * val , val == val .... and returns the value of this expression

Use :

    parseExpression(expression,scope)

### Execute block

This is pretty self explanatory , it executes a given block 

Use :

    executeBlock(block,scope)
    executeBlocks(blocks,scope) // Will do the same but for an array of blocks

A block can be for example a function call from luaparse

# Contribute to the project

Check out the github repo !






