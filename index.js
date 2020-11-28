var data = {}
var functions = {
    print:{call:(arguments,scope)=>{
        //console.log("scope call " +JSON.stringify(scope))
        console.log(parseArguments(arguments,scope))
    }},
    Date:{call:(arguments,scope)=>{
        return {
            now : Date.now()
        }
    }},
    type:{call:(arguments,scope)=>{
        return typeof parseArgument(arguments[0],scope)
    }}
}

function parseArgument(argument,scope){
    let current;
        switch(argument.type){
            case "Identifier":
                if(scope[argument.name] != undefined){
                    current = scope[argument.name]
                }else if(data[argument.name] != undefined){
                    current = data[argument.name]
                }else{
                    current = argument.name + " is undefined"
                }
                //console.log("scope : " + current)
                break;
            case "StringLiteral":
                current = argument.raw.substr(1, argument.raw.length-2)
                break;
            case "NumericLiteral":
                current = parseInt(argument.value)
                break;
            case "Identifier":
                current = " " + scope[argument.name] || data[argument.name] 
                break;
            case "CallExpression":
                    if(functions[argument.base.name]){
                        current = functions[argument.base.name].call(argument.arguments,scope)
                    }
                break;
            case "BooleanLiteral":
                return argument.value
                break;
            case "BinaryExpression" || "LogicalExpression" :
                current = parseExpression(argument,scope)
                break;
            case "MemberExpression":
                current = parseExpression(argument,scope)
                break;
            }
    return current
}

function parseArguments(arguments,scope){
    //console.log("scope arg " +JSON.stringify(scope))
    let final;
    for(let i=0;i<arguments.length;i++){
        argument = arguments[i]
        let current = parseArgument(argument,scope)
        if(i == 0){
            final = current
        }else{
            final+=current
        }
        }
        
        return final
    }

function parseExpression(expression,scope){
    
    switch(expression.type){
        case "BooleanLiteral":
            return parseArgument(expression)
            break;
        case "BinaryExpression":
            switch(expression.operator){
                case "+":
                    return parseArgument(expression.left,scope) + parseArgument(expression.right,scope)
                    break;
                case "*" : 
                    let left = parseArgument(expression.left,scope)
                    let right = parseArgument(expression.right,scope)
                    let leftType = typeof left
                    let rightType = typeof right
                    if(leftType.toString() == "string" && rightType.toString() == "number"){
                        final = ""
                        for(let i = 0; i < right; i++){
                            final += left
                        }
                        return final
                    }else {     
                        return  left * right 
                    }
                    break;
                case ">=" || "=>" :
                    return parseArgument(expression.left,scope) >= parseArgument(expression.right,scope)
                    break;
                case "<=" || "=<" :
                    return parseArgument(expression.left,scope) <= parseArgument(expression.right,scope)
                    break;
                case "<" :
                    return parseArgument(expression.left,scope) < parseArgument(expression.right,scope)
                    break;
                case ">" :
                    return parseArgument(expression.left,scope) > parseArgument(expression.right,scope)
                    break;
                case "==" :
                    return parseArgument(expression.left,scope) == parseArgument(expression.right,scope)
                    break;
            }
        case "LogicalExpression":
            switch(expression.operator){
                case "and":
                    return parseExpression(expression.left) == true && parseExpression(expression.right) == true
                    break;
            }
            break;
        case "MemberExpression" :
            //console.log(expression)
            switch(expression.indexer){
                case ".":
                    return parseArgument(expression.base,scope)[expression.identifier.name]
                    break;
            }
            break;
    }
}

function executeBlock(block,scope){
    //console.log("scope block" +JSON.stringify(scope))
    switch(block.type){
        case "CallStatement":
            let CallStatementBlockExpression = block.expression
            switch(CallStatementBlockExpression.type){
                case "CallExpression":
                    let CallExpressionBlock = CallStatementBlockExpression
                    if(functions[CallExpressionBlock.base.name]){
                        functions[CallExpressionBlock.base.name].call(CallExpressionBlock.arguments,scope)
                    }
                    break;
            }
        break;

        case "AssignmentStatement":
            let variables = block.variables
            let inits = block.init
            for(let i = 0; i < variables.length; i++){
                let variable = variables[i]
                let init = inits[i]
                data[variable.name] = parseArguments([init],scope)
            }
            break;

        case "LocalStatement":
            let localVariables = block.variables
            let localInits = block.init
            for(let i = 0; i < localVariables.length; i++){
                let variable = localVariables[i]
                let init = localInits[i]
                console.log(scope)
                scope[variable.name] = parseArguments([init],scope)
                return {"scope":scope}
            }
            break;
        case "IfStatement" :
            let clauses = block.clauses 
            checkClauseBlock(clauses,scope)
            break;
        case "FunctionDeclaration":
            functions[block.identifier.name] = {
                call: (arguments,functionScope) => {
                    let argsScope = {}
                    for(let i = 0;i<block.parameters.length;i++){
                        let parameter = block.parameters[i]
                        argsScope[parameter.name] = parseArgument(arguments[i])
                    }
                    functionScope = {...functionScope, ...argsScope}
                    executeBlocks(block.body,functionScope)
                }
            }
            break;
        case "ForNumericStatement" :
            //console.log(scope)
            scope[block.variable.name] = parseArgument(block.start)
            for(parseArgument(block.start);  scope[block.variable.name] < parseArgument(block.end);  scope[block.variable.name] +=  parseArgument(block.step)){
                executeBlocks(block.body,scope)
            }
            scope[block.variable.name] = undefined
            break;
    }

}

function checkClause(clause,scope){
    if(parseExpression(clause.condition)==true){
        executeBlocks(clause.body,scope)
    }
}

function checkClauseBlock(clauses,scope){

    for(let i = 0; i < clauses.length; i++){
        let clause = clauses[i]
        if(clause.type != "ElseClause"){
            if(parseExpression(clause.condition)== true){
                executeBlocks(clause.body)
                break;
            }else{
                continue;
            }
        }else{
            executeBlocks(clause.body)
        }
    }

}

async function executeBlocks(blocks,scope){
    for(let i=0; i < blocks.length;i++){
        let block = blocks[i]
        if(scope == undefined){
            scope = {}
        }
        let resultScope = executeBlock(block,scope)
        if(resultScope != undefined) {
            if(resultScope.scope != undefined){
                scope = {...scope, ...resultScope.scope}
            }
        }

        //console.log("scope " +JSON.stringify(scope))

    }
}

module.exports = {
    interpret: (code, methods)=>{
        var body = code.body
        executeBlocks(body,{})
        functions = {...functions, ...methods}
    }

}