# V0.2.6

* Updated watch var name generation to avoid problems with certain expressions containing reserved characters/strings. Should fix issue [159](https://github.com/Marus/cortex-debug/issues/159) and partially fix [157](https://github.com/Marus/cortex-debug/issues/157).

# V0.2.5

* Updated PyOCD start detection to work with newer versions - Fixes issue [165](https://github.com/Marus/cortex-debug/issues/165)

# V0.2.4

* Updated some embedded SVD files (Thanks https://github.com/clementperon for your PR)
* Fixed parsing of some SVD files (Issue [126](https://github.com/Marus/cortex-debug/issues/126) - Thanks https://github.com/mryndzionek for your PR)
* Fixed issues with race condition on start up and improved OpenOCD support; Should fix issues [147](https://github.com/Marus/cortex-debug/issues/147), [149](https://github.com/Marus/cortex-debug/issues/149) and [150](https://github.com/Marus/cortex-debug/issues/150). A huge thanks to https://github.com/haneefdm for this PR, and his ongoing support on the project.
* Ability to specify port ranges used (Thanks https://github.com/blckmn for your PR)

# V0.2.2

* Fixed issues with serial port source for SWO data (Currently only working on macOS and Linux; Windows support will be restored soon)
* Extension now requires VS Code 1.29 or newer

# V0.2.1

* Fixed issues with variable substitution
* Fixed issues with blocking run if executable doesn't exist and may be created by the preLaunchTask

# V0.2.0

* Work around for some issues introduced with VSCode 1.29
* Added initial support for PE Micro Debug Interfaces (Special thanks to https://github.com/danebou for your PR)
* Fixed a number of bugs with the peripheral view - hopefully registers will be updating properly now (note that you can no longer just select a node to expand, you must click on the expand/collapse arrow)

# V0.1.21

* Fixed issue with people sometimes not being able to set new breakpoints after launching. Special thanks to @xiaoyongdong for his fix and @microwavesafe for his help in testing.

# V0.1.20

* Fixed issue with setting breakpoints while the target is running
* Fixed issues with the 'Add to Watch' and 'Copy Expression' options in the variable view
* Fixed issues with parsing some Atmel SVD files (Thanks to https://github.com/ivankravets for your PR)
* Allow overriding the armToolchainPath setting on a per lunch configuration basis

# V0.1.19

* Updated command names for JLink - newer versions of JLink rename the GDB server on Linux and macOS to JLinkGDBServerCLExe - this update searches for both the new JLinkGDBServerCLExe name and, if not found, falls back to the old JLinkGDBServer name.

# V0.1.18

* Fixed bug with the restart command if the target was currently in a running state.
* Added add a runToMain setting to launch debug requests (not applicable to attach requests).
* Added a searchDir setting for OpenOCD GDB server that allows specifying what directories to search for OpenOCD configuration files. Thanks https://github.com/KaDw

# V0.1.17

* Improved highlighting in the raw memory view
* Workaround for an issue with *enumeratedValue* having *isDefault* instead of a *value*

# V0.1.16

* Fixed a bug where it may not detect that a port is in use and get a port conflict when starting the GDB server.

# V0.1.15

* RTOS Support (configured through the rtos property in your launch.json file)
    * Depends on support from GDB Server - currently only J-Link and OpenOCD provide support for RTOS (supported RTOS varies)
	* In general if you have RTOS support enabled you should not perform stepping operations before the RTOSs data structures/scheduler have been initialized. Doing so tends to either crash the GDB server or leave it in an inconsistent state which will prevent proper functionality. If you need to debug startup code before the RTOS has been completely initialized then you should disable RTOS support.
* Some basic telemetry has been added
    * This telemetry has been added to help me determine what/how features are being used to help me better determine future feature development/improvements.
	* No information about your projects source code is collected - only information directly related to the use of cortex-debug is collected. For example the following is collected:
	    * Number/length of debugging sessions
		* Specific features used (peripheral register view, disassembly view, rtos support, memory view, SWO decoding, Graphing, etc.)
		* Certain errors within the extension are reported
		* GDB Server Used
		* Target device (if entered in launch.json)
		* Extension Version
		* Visual Studio Code Version
		* Visual Studio Code Platform
	* The information collected is not user-identifiable.
	* You can disable all telemetry reporting through the following user/workspace settings:
		* setting **telemetry.enableTelemetry** to false (this will disable telemetry for VS Code and other extensions that respect this setting)
		* setting **cortex-debug.enableTelemetry** to false (this will disable telemetry just for Cortex-Debug)
* Improved support for customizing the launch, attach and restart processes. In most cases these parameters can simply be ignored - but for added flexibility the following settings in your launch.json file can be provided
	* preLaunchCommands/preAttachCommands - these are executed near the start of the main launch/attach sequence (immediately after attaching to the target)
	* postLaunchCommands/postAttachCommands - these are executed at the end of the main launch/attachSequence
	* preRestartCommands - these are executed at the start of the restart sequence (immediately following interrupting the processor)
	* postRestartCommands - these are executed at the end of the restart sequence
* Fixes for advanced SWO Decoders

# V0.1.14

* Workaround for issues with st-util GDB server on Windows environment
* Added ability to select value for matting in the Core and Preipheral Register Views (Right click and Select "Set Value Format")
* Perserve state for Core and Peripheral Register Views (Set format and expanded) from one debug session to the next.
* Syntax highlighting for the raw memory view.

# V0.1.13

* Enabled setting breakpoints in rust code
* Improved ITM console decoder
* Fixed ITM configuration GDB macros to work properly with rust code

# V0.1.12

* Fixed issues with parsing dimIndex elements in some SVD files.

# V0.1.11

* Improved SVD parsing:
    * Fields now support bit ranges being defined with <msb> and <lsb> elements; This would have impacted SVD files supplied by Nordi Semiconductor, Fujitsu and Spansion
	* Improved support for repeating fields/registers for "array" style repeats, versus explicitly named repeats; This would have impacted SVD files supplied by Nordic Semiconductor, Microchip/Atmel, and some of NXP's LPC line
	* Support for register clusters, to group multiple closely related registers, within peripherals; This would have impacted SVD files supplied by Nordic Semiconductor and Microchip/Atmel
	* Fixed issue with values being displayed as if they were signed.
	* Improved display of Write-Only registers
* Improved behaviour with the Disassembly View:
	* Manual triggered disassembly names will now match those automatically generated by missing source/forced disassembly mode - prevents it from opening two copies of the disassembly.
	* If there are multiple functions with the same symbol name (two static functions with the same name in two different compilation units) you can now choose between them when manually opening a disassembly view.
	* If you are focused on a manual disassembly view for the current frame the debugger will use instruction level stepping, instead of source line level stepping.
* Added a "postLaunchCommands" property to the supported launch.json properties. This should be an array of GDB commands to send after the main launch/attach sequence (you do not need to include things like "target extended-remote ...", "load", or "monitor reset" as these are generated automatically).

# V0.1.10

* The update has a significant refactoring of code to make supporting the expanding list of GDB Servers more feasible. From the user side this necessitates updating your launch.json files as all debug types have now been combined into one common *cortex-debug* type
    * The typical changes needed are to replace *"type": "<server>-gdb" in your launch.json file with "type": "cortex-debug" and "servertype" : "<server>";
	* The extension will attempt to map old configurations automatically - but this may not work in all cases; additionally there launch.json editor will not recognize the old types any more
	* You no longer specify paths to the individual tools in your launch.json file; now there are settings you can set (either user level or workspace level) for paths to the individual GDB servers as well as the arm toolchain. For the arm toolchain path the setting should point to the toolchains bin directory - not an individual executable - as multiple tools from the toolchain are now used (current arm-none-eabi-gdb and arm-none-eabi-objdump; but possibly others in the future)
* A globals and static scope has been added to the variables view
* A disassembly view has been added. This can show up in three possible ways:
    * You can manually view the disassembly for a particular function by selecting the "Cortex-Debug: View Disassembly (Function) command from the command palette and entering the function name. (While you can view the disassembly in this case, stepping will still be based upon source lines currently)
	* If the source file cannot be located it will automatically disassemble and display the current function (In this case stepping is by instruction)
	* You can force it to always disassembe through the "Cortex-Debug: Set Force Disassembly" command and selecting the "Forced" option.
* SWO Decoding has been significantly overhauled
	* It is now possible to use a serial port (such as a FTDI USB to UART) to capture SWO data, allowing the use of SWO output on probes that do not support it natively or have poor performance. To use this set the "source" key under "swoConfig" to the UART device (COM port on Windows).
	* The ITM, DWT and TPIU registers needed to match the configuration in the launch.json file will be set automatically; avoiding the need for your firmware to make the configurations. SWO output will still need to be enabled in your firmware though, as this part of the configuration is microcontroller specific.
	* A number of configuration options have changed; please edit your launch.json file
* Inital support for the Black Magic Probe has been added; this server has not been tested extensively yet, so there may still be some issues. SWO output through the probe is not currently support when using the Black Magic Probe.
* Fixed issue with Peripheral Register viewer not working after the first launch request
* Fixed a bug with the variables and watches view incorrectly updating the value on a struct/array when a contained element changed
* Updated the view memory output format to match the format used by the hexdump for VSCode extension (https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-hexdump) - this will enable the syntax highlighting, and hopefully in the future the inspector, from that plugin.

# V0.1.9

* Added initial support for texane's stlink utilites st-util GDB server (https://github.com/texane/stlink) - this configuration does not support SWO output.
* Enabled updating registers and fields (Read/Write or Write-Only in the SVD defintion) in the Cortex Peripherals view - Right click on the register/field and select "Update"
* Enabled copying registers and fields values in the Cortex Peripherals and Cortex Registers Views - Right click on the register/field and select "Copy Value"

# V0.1.8

* Fixed possible freeze with memory viewer command and addresses above 0x80000000

# V0.1.6

* Improved parsing of SVD definitions (registers without fields; repeating registesr (dim, dimInteger, dimIncrement))
* Added initial support for PyOCD GDB Server (SWO not supported)

# V0.1.5

* Initial Public Preview on VS Code Market Place