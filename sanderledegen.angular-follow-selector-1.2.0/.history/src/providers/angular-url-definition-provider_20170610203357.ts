import * as vscode from 'vscode'
import { TextDocument, Position, CancellationToken, ProviderResult, Location, Uri } from 'vscode'
const path = require('path')
const fs = require('fs')

export class AngularUrlDefinitionProvider implements vscode.DefinitionProvider {

  urlRangeRegex = /[\w.-]+/

  provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Location> {
    const wordRange = document.getWordRangeAtPosition(position, this.urlRangeRegex)
    const clickedUri = document.getText(wordRange)
    const containingLine = document.lineAt(position.line).text

    if (!containingLine.includes('templateUrl') && !containingLine.includes('styleUrls')) {
      return null
    }

    const fullUri = path.resolve(path.dirname(document.fileName), clickedUri)
    if (fs.existsSync(fullUri)) {
      return new Location(Uri.file(fullUri), new Position(0, 0))
    } else {
      return null
    }
  }
}
