let vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.scaffold', function () {
        let t = vscode.window.createTerminal();
        let controllerName = vscode.window.showInputBox({placeHolder: 'Please enter the controller name'});
        controllerName.then(function(cresult)
        {
            if(cresult == undefined || cresult == '') {
                vscode.window.showErrorMessage('Controller name should be provided');
            } else {
                let modelName = vscode.window.showInputBox({placeHolder: 'Please enter the model name'});
                modelName.then(function(mresult)
                {
                    if(mresult == undefined || mresult == '') {
                        vscode.window.showErrorMessage('Controller name should be provided');
                    } else {
                        let databaseContextClass = vscode.window.showInputBox({placeHolder: 'Please enter the database context class name'})
                        databaseContextClass.then(function(dbresult)
                        {
                            if(dbresult == undefined || dbresult == '') {
                                vscode.window.showErrorMessage('Database Context Class should be provided');
                            } else {
                                let projectPath = vscode.window.showInputBox({placeHolder: 'Please enter the path of the project or . for the curent directory'})
                                projectPath.then(function(ppath)
                                {
                                    if(ppath == undefined || ppath == '') {
                                        vscode.window.showErrorMessage('Project path should be provided');
                                    } else {
                                        t.show();
                                        t.sendText('dotnet aspnet-codegenerator --project ' + ppath + ' controller -name ' + cresult + ' -m ' + mresult + ' -dc ' + dbresult + ' -outDir Controllers/ --useDefaultLayout');
                                        t.sendText('dotnet ef migrations add ' + mresult + '_mig');
                                        t.sendText('dotnet ef database update');
                                        t.sendText('echo all done :)');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;