# ASP.NET CORE MVC SCAFFOLD

A simple toold that will help you generate your controllers and views the same way Visual Studio IDE on Windows do.

## Requirements

This tools requires you to include the following packages in your .csproj file before you use it. You need to follow the steps below to be able to use it:

1. After creating your project open the `.csproj` file and add the following packages to it
	1. `<PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="1.1.1" />`
	2. `<PackageReference Include="Microsoft.Composition" Version="1.0.30" ExcludeAssets="All" />`
	3. `<PackageReference Include="System.Composition" Version="1.0.31" />`
2. Run `dotnet restore` and make sure your file restoration completes with no errors.
3. Now you are ready to use the tool

The `Microsoft.VisualStudio.Web.CodeGeneration.Design` will help you scaffold your application the same way you do in Visual Studio IDE.

The packages `Microsoft.Composition` and `System.Composition` will fix and error while trying to restore the `Microsoft.VisualStudio.Web.CodeGeneration.Design` Package


## Usage
1. Make sure your ApplicationDbContext is present.
2. Create the appropriate Model Class
3. Open the command palette using the `cmd+shift+p` on MacOS or `ctrl+shift+p` on windows
4. You will be asked to enter your controller name, model name, db context class name and finally the project path
5. By fulfilling the requirements a terminal window will show up with the process of scaffolding controller and views then add a new migration and finally updates your database
6. Finally build and run your application

**Enjoy!**