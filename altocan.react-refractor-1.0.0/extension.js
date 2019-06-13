// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
//const fs = require('fs');
var _ = require('lodash');
var lineColumn = require("line-column");


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    var disposable = vscode.commands.registerCommand('extension.extractInline', function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return vscode.window.showInformationMessage('no editor selected');
        }

        var selection = editor.selection;
        var original = editor.document.getText()
        var text = editor.document.getText(selection);
        const start = lineColumn(original).fromIndex(original.indexOf('extends'))
        let line = (start && start.line) ? start.line -1 : 1;

        vscode.window.showInputBox({
            prompt: 'Insert component name',
            value: ''
        }).then(function (e) {

            if (!e || e == ''){
                return;
            }
            console.log('will start creating ',e)
            vscode.window.activeTextEditor.edit(function (edit) {
                const name = capitalizeFirstLetter(_.camelCase(e))
                const Position = vscode.Position;
                let props = parseJSX(text);
                   const content = `
/*<${name} 
    ${props.params.join("\n\t\t")} />*/
class ${name}Cmp{
    render(){
        const {
            ${props.variables.join(",\n\t\t\t")}
        } = this.props;
        return(${props.content});
    }
}
${name}Cmp.propTypes = ({${props.variables.join(": PropTypes.string,\n")+": PropTypes.string,\n"}})
${name}Cmp.displayName = '${name} stateless component';
${name}Cmp.defaultProps = ({${props.variables.join(": '',\n")+",\n"}})
export const ${name} = ${name}Cmp;
`;

                vscode.window.showInformationMessage(name+' extracted');
                edit.replace(selection, "\t\t<" + name + ' ' + props.params.join("\n\t\t\t") + ' />');
                edit.insert(new Position(line, 0), content);
            })
        })
    });

    var disposable2 = vscode.commands.registerCommand('extension.extractToFn', function () {
           var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return vscode.window.showInformationMessage('no editor selected');
        }

        var selection = editor.selection;
        var original = editor.document.getText()
        var text = editor.document.getText(selection)
        let actEdit = vscode.window.activeTextEditor
        let rowInsert = 0
        let column = 0
        if (original.indexOf('render()') > -1) {
            const start = lineColumn(original).fromIndex(original.indexOf('render()'))
            rowInsert = start.line - 1
            column = start.column
        } else {
            return
        }

        vscode.window.showInputBox({
            prompt: 'Insert name method (render__NAME__)',
            value: ''
        }).then(function (e) {
            if (!e || e == '') return

            const nameMethod = capitalizeFirstLetter(_.camelCase(e))
            actEdit.edit(function (edit) {
                const Position = vscode.Position
                const newtext = `\n\trender${nameMethod}(){\nreturn (\n ${text}\n)\n}\n\n`

                edit.replace(selection, '\t\t{ this.render' + nameMethod + '() }')
                edit.insert(new Position(rowInsert, column), newtext)
            })
        })
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;


// DISABLED
function parseJSX(contents) {
    
    var match = [];
    var names = [];
    var match2 = contents.match( /this\.props\.([a-zA-Z0-9_]+)/g) || []; //all this.props in text;
    newContent2 = match2.reduce((text,r)=>{
        
        let n = r.split('this.props.').splice(1).join();
        names.push(n);
        match.push( n +'={'+r+'}')
        console.log('will split and shift and join',r,n)
        return text.split(r).join(n);
    },contents);

    ;
    match2 = contents.match( /this\.state\.([a-zA-Z0-9_]+)/g ) || []; //all this.props in text;
    newContent2 = match2.reduce((text,r)=>{
        let n = r.split('this.state.').splice(1).join();
        names.push(n);
        match.push( n +'={'+r+'}')
        return text.split(r).join(n);
    },newContent2);
    
    let exps = (contents.match( /{([^{}]+?)}/g )||[]).map(r=>r.replace('{','').replace('}',''));
    let vars = []; //this should hold all vars in text

    exps.map(x=>vars=vars.concat(x.match(/[a-zA-Z_][a-zA-Z0-9_]*\b(?=[\}\) ])/g)));
    vars.filter(Boolean).map(v=>{
        names.push(v);
        match.push(v+'={'+v+'}');
    });

    return {
        content:newContent2, 
        params:Array.from(new Set(match)).sort(), 
        variables:Array.from(new Set(names)).sort()
    };
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;