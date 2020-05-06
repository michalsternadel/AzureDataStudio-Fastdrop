const vscode = require("vscode");
const azdata = require("azdata");

exports.activate = function(context) {
    let disposable = vscode.commands.registerCommand("fastdrop.dropalldatabases", function(context) {
        vscode.window.showWarningMessage(`Drop all databases`, "Yes", "No").then(value => {
            if (value === "Yes") {
                dropDatabase(context.connectionProfile).then(() => {
                    refreshDatabases(context.connectionProfile.id, context.nodeInfo.nodePath);
                });
            }
        });
    });

    context.subscriptions.push(disposable);
};

function refreshDatabases(connectionId, nodePath) {
    azdata.objectexplorer.getNode(connectionId, nodePath).then(x => {
        x.getParent().then(parent => {
            parent.refresh();
        });
    });
}

function dropDatabase(connectionProfile) {
    return new Promise((resolve, reject) => {
        azdata.connection.connect(connectionProfile, false, false).then(connectionResult => {
            azdata.connection.getUriForConnection(connectionResult.connectionId).then(connectionUri => {
                let queryProvider = azdata.dataprotocol.getProvider("MSSQL", azdata.DataProviderType.QueryProvider);
                console.log("dropped");
                queryProvider.runQueryAndReturn(connectionUri, `USE [master]; EXEC sp_MSforeachdb 'IF DB_ID(''?'') > 4 BEGIN EXEC(''ALTER DATABASE [?] SET SINGLE_USER WITH ROLLBACK IMMEDIATE DROP DATABASE [?]'') END'`)
                .catch(error => {
                    //error with code 0 is thrown when query has nothing to return
                    let connectionProvider = azdata.dataprotocol.getProvider("MSSQL", azdata.DataProviderType.ConnectionProvider);
                    connectionProvider.disconnect(connectionUri);
                    
                    if (error.code === 0) {
                        resolve();
                    }
                    else{
                        vscode.window.showErrorMessage("Something is broken");
                        console.log(error);
                        reject();
                    }
                });
            });
        });
    });
}

exports.deactivate = function() {};
