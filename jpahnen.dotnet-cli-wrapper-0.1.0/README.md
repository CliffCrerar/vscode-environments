This extension is a wrapper around the `dotnet` CLI. You can invoke `dotnet` commands using the explorer.
All listed operations are done using CLI calls.

## Features

* Add new project. The project is added to the `.sln` too (if the project uses one). Works on folders.
* Add project reference (right-click `.csproj`)
* Remove project reference (right-click `.csproj`)

| ![Add new project](https://github.com/JPAhnen/VsCodeNETCoreCLIWrapper/raw/master/newproject-menu.png) | ![Manage project reference](https://github.com/JPAhnen/VsCodeNETCoreCLIWrapper/raw/master/reference-menu.png) |
## Known issues

***Add new project*** does not work on the root folder.
