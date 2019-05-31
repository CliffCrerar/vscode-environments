import * as vscode from 'vscode'
import { TextDocument, Position, CancellationToken, ProviderResult, Location, Uri } from 'vscode'
const path = require('path')

export class AngularUrlDefinitionProvider implements vscode.DefinitionProvider {

  urlRangeRegex = /[\w.-]+/

  provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Location> {
    const wordRange = document.getWordRangeAtPosition(position, this.urlRangeRegex)
    const clickedUri = document.getText(wordRange)
    const containingLine = document.lineAt(position.line).text

    if (!containingLine.includes('templateUrl') && !containingLine.includes('styleUrls')) {
      return null
    }

    console.log(path.resolve(path.dirname(document.fileName, clickedUri)))

    return vscode.workspace.findFiles(`**/${clickedUri}`, 'node_modules/*', 1)
      .then(files => {
        return files.length > 0 ? new Location(Uri.file(files[0].fsPath), new Position(0, 0)) : null
      })
  }
}
