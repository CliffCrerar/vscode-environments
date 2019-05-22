# C# Code Snippets

This extension provides you C# code snippets.

## Why this ones and not Microsoft C# extension snippets

- TABed with your VS Code indentation settings and not like Microsoft C# extension, which indents always exactly 4 spaces.
- contains only snippets and no additional huge libraries are installed.

## When you want to use Microsoft C# extension, but only snippets from this extension (How to disable Microsoft C# extension snippets)

- Localize the Visual Studio Code extension here:
  - Windows: %USERPROFILE%\.vscode\extensions
  - Mac: ~/.vscode/extensions
  - Linux: ~/.vscode/extensions
- Go to the ms-vscode.csharp extension folder.
- Open the snippets folder.
- Rename the csharp.json to bk_csharp.json for example.
- Start Visual Studio Code if it was closed, or restart it if is running.

Now you will see the C# Code Snippets only and the rest of features of C# extension.

## Shortcuts / Commands

| Shortcut  | Description                                  |
| --------- | -------------------------------------------- |
| class     | Creates a class                              |
| ctor      | constructor                                  |
| cw        | Console.WriteLine                            |
| do        | do...while loop                              |
| else      | else statement                               |
| enum      | Creates an enum                              |
| fact      | Creates a xunit test method                  |
| for       | for loop                                     |
| foreach   | foreach statement                            |
| guid      | Creates a new instance of the Guid structure |
| if        | if statement                                 |
| ifd       | #if                                          |
| interface | Creates an interface                         |
| mbox      | MessageBox.Show                              |
| namespace | Creates a namespace                          |
| prop      | An automatically implemented property        |
| propfull  | Property with backing field                  |
| region    | #region                                      |
| svm       | void Main()                                  |
| switch    | switch statement                             |
| try       | try...catch                                  |
| tryf      | try...finally                                |
| using     | using statement                              |
| while     | while loop                                   |
