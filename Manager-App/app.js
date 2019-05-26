/**
 * VSCODE ENVIRONMENTS CONTROLLER
 *
 * @summary short description for the file
 * @author Cliff Crerar
 *
 * Created at     : 2019-04-06 21:13:28
 * Last modified  : 2019-04-07 02:09:45
 */

// Node Modules
const
  fs = require( "fs" ),
  procArgs = require( "process" ).argv,
  path = require( "path" ),
  os = require( "os" ),
  // Packages
  moment = require( "moment" ),
  // Custom modules
  { install } = require( "./js" ),
  // Loggin switch
  logging = true,
  args = procArgs.slice( 2, procArgs.length ).join( "," );

console.log( args );
( ( ...params ) => {
  console.log("FUNCTION", "arguments", params.join().split( "," ) );
  console.log('TypeOf? :', typeof params );
  var argsPassed = params.join().split( "," );

  var thisOs = os.platform();
  var thisHomedir = os.homedir();
  var dirToWrite = "./generated_lists";
  log( { thisHomedir } );
  log( { thisOs } );

  // Run function
  argsPassed.includes( "--gl" ) && generateExtensionList( thisHomedir );
  argsPassed.includes( "--install-list" ) && installExtensions();
  argsPassed.includes( "--H" ) || argsPassed.includes( "-h" ) && help();

  function help() {
    console.log( `
    HELP ME!
    `)
  }


   function installExtensions() {
    const extList = 
    JSON.parse(fs.readFileSync( dirToWrite + "/extlist_generated_25_May_2019-201600.json",'utf8' ));
    log( `Installing ${extList.length} vscode extensions` );
    const dir = path.join( thisHomedir, ".vscode/extensions" );
    return  install( extList, dir );
  }

  function generateExtensionList( homDir ) {
    const extensionList = [];
    let extPath = getExtPath( "--gl" );
    const dirList = fs.readdirSync( extPath );
    dirList.forEach( ( fileDir, i ) => {
      var doesNotStartDot = fileDir[ 0 ] !== ".";
      var isNotReadme = !fileDir.toLowerCase().includes( "readme" );
      const isdir = fs.lstatSync( path.join( extPath, fileDir ) ).isDirectory();
      if ( isdir && doesNotStartDot && isNotReadme ) {
        extensionList.push( processList( fileDir, i ) );
      }
    } );
    console.log( extensionList );
    fs.writeFileSync(
      `${dirToWrite}/extlist_generated_${moment().format(
        "DD_MMM_YYYY-HHmmss"
      )}.json`,
      JSON.stringify( extensionList ),
      "utf8"
    );
  }

  function getExtPath( firstArg ) {
    let homeDir = thisHomedir;
    let pairedWith = getSecond( firstArg );
    return pairedWith === null
      ? path.join( homeDir, ".vscode/extensions" )
      : pairedWith;
  }

  function getSecond( firstArg ) {
    if ( argsPassed.length === 1 ) return null;
    var argIdx = argsPassed.indexOf( firstArg );
    if ( !argsPassed[ argIdx + 1 ].includes( "--" ) ) {
      return argsPassed[ argIdx + 1 ];
    } else {
      return null;
    }
  }

  var checkSameCount = 0;
  function processList( ext, ind ) {
    //console.log('ext: ', ext);

    const split1 = ext.split( "." );
    const split2 = split1[ 1 ].split( "-" );

    //console.log('split1: ', split1);
    //console.log('split2: ', split2);
    //console.log('name: ', name);

    const publisher = split1[ 0 ];
    const name = split2.slice( 0, split2.length - 1 ).join( "-" );
    const version = [
      split2.pop(),
      split1.slice( split1.length - 2 ).join( "." )
    ].join( "." );

    //console.log('{ publisher, name, version }: ', { publisher, name, version });

    const checkSame = `${publisher}.${name}-${version}` === ext;

    if ( !checkSame ) {
      checkSameCount++;
      console.log( "---------------------" );
      console.log( "EXT: ", ext, "| PROC:", `${publisher}.${name}-${version}` );
      console.log( "checkSame: ", checkSame );
      console.log( { publisher, name, version } );
      console.log( "checkSameCount: ", checkSameCount );
    }
    return { extNum: ind, publisher, name, version };
  }

  function log( ...logline ) {
    const returnLine = [];
    if ( !logging ) return;
    for ( let i = 0; i < logline.length; i++ ) {
      typeof logline[ i ];
      if ( typeof logline[ i ] === "object" ) {
        const objArr = Object.entries( logline[ i ] );
        const objArrNew = [];
        for ( let l = 0; l < objArr[ 0 ].length; l++ ) {
          objArrNew.push( objArr[ 0 ][ l ] );
        }
        objArrNew;
        var objToString = objArrNew.join( ": " );
        returnLine.push( objToString );
      } else {
        returnLine.push( logline[ i ] );
      }
    }
    return console.log( returnLine.join( " | " ) );
  }
} )( args );
