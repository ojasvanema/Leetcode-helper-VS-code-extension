
const vscode = require('vscode');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { execFile, exec } = require('child_process');
	

/**
 * @param {vscode.ExtensionContext} context
 */



function activate(context) {

	
	console.log('Congratulations, your extension "cph-leetcode" is now active!');



	function runPythonScript(scriptPath, args, callback) {
		const pythonProcess = spawn('python', [scriptPath].concat(args));
	 
		let data = '';
		pythonProcess.stdout.on('data', (chunk) => {
			data += chunk.toString(); 
		});
	 
		pythonProcess.stderr.on('data', (error) => {
			console.error(`stderr: ${error}`);
		});
	 
		pythonProcess.on('close', (code) => {
			if (code !== 0) {
				console.log(`Python script exited with code ${code}`);
				callback(`Error: Script exited with code ${code}`, null);
			} else {
				console.log('Python script executed successfully');
				callback(null, data);
			}
		});
	}

	const disposable = vscode.commands.registerCommand('cph-leetcode.searchSomething', function () {

		vscode.window.showInformationMessage('Hello World from First extension of vs code testing!');
	});


	async function createFileWithBoilerplate(language) {
		
		const fileExtensions = {
		  'C++': '.cpp',
		  Python: '.py',
		  Java: '.java',
		};
	  
		const boilerplateCode = {
		  'C++': `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) {
            return false;
        }

        long reverse = 0;
        int xcopy = x;

        while (x > 0) {
            reverse = (reverse * 10) + (x % 10);
            x /= 10;
        }

        return reverse == xcopy;        
    }
};


int main()
{
    int x;
    cin>>x;

    Solution solution;
    bool result = solution.isPalindrome(x);

    cout << (result ? "true" : "false") << endl; // Output must match the expected format in output files
    return 0;
}
`,
		  Python: `import sys

class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False

        reverse = 0
        xcopy = x

        while x > 0:
            reverse = (reverse * 10) + (x % 10)
            x //= 10
        
        return reverse == xcopy

def main():
    # Read input from stdin
    input_values = input().split()
 
    # Parse the input (assumed format: string numRows)
    x = input_values[0]
    x = int(x)
    
    # Create an instance of the Solution class
    sol = Solution()
    
    # Call the convert method
    result = sol.isPalindrome(x)
    
    # Print the result (this will be captured by stdout)
    print(result)

if __name__ == "__main__":
    main()
`,
		  Java: `// Your Java code here\n
import java.util.Scanner;

public class solution { // Class name matches the file name
    public boolean isPalindrome(int x) {
        if (x < 0) {
            return false;
        }

        long reverse = 0;
        int xCopy = x;

        while (x > 0) {
            reverse = (reverse * 10) + (x % 10);
            x /= 10;
        }

        return reverse == xCopy;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int x = scanner.nextInt(); // Input the number
        scanner.close();

    	solution sol = new solution();
        boolean result = sol.isPalindrome(x);

        // Output must match the expected format in output files
        System.out.println(result ? "true" : "false");
    }

}`,
		};
	  
		const fileExtension = fileExtensions[language];
		const content = boilerplateCode[language];
	  
		if (!fileExtension) {
		  vscode.window.showErrorMessage('Unsupported language selected.');
		  return;
		}
	  

		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
		  vscode.window.showErrorMessage('No workspace folder open.');
		  return;
		}
	  
		const workspacePath = workspaceFolders[0].uri.fsPath;
		const filePath = vscode.Uri.file(`${workspacePath}/solution${fileExtension}`);
	  

		try {
		  await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'));
		  const document = await vscode.workspace.openTextDocument(filePath);
		  await vscode.window.showTextDocument(document);
		  vscode.window.showInformationMessage(`File created successfully: solution${fileExtension}`);
		} catch (error) {
		  vscode.window.showErrorMessage('Error creating file: ' + error.message);
		}
	}

	let selectedLanguage;

	let disposable2 = vscode.commands.registerCommand(
		'cph-leetcode.CPH-fetch-testcases',
		async function () {
		  const editor = vscode.window.activeTextEditor;
		  const selectedText = editor ? editor.document.getText(editor.selection) : '';
	  
		  const searchQuery = await vscode.window.showInputBox({
			placeHolder: 'Enter the LeetCode problem link',
			prompt: 'Fetch testcases',
			value: selectedText,
		  });
	  
		  if (!searchQuery) {
			vscode.window.showErrorMessage('A search query is mandatory to execute this action');
			return;
		  }
	  
		  console.log(searchQuery);
		  vscode.window.showInformationMessage('Fetching testcases');

		  const workspaceFolders = vscode.workspace.workspaceFolders;
		  if (workspaceFolders && workspaceFolders.length > 0) {
            var openFolderPath = workspaceFolders[0].uri.fsPath;
            // vscode.window.showInformationMessage(`Open Folder Path: ${openFolderPath}`);
        } else {
            vscode.window.showErrorMessage('No folder is open in the current workspace.');
        }

		const hard_coded_dir = openFolderPath;
	  
		  runPythonScript(
			'D:\\Ojasv\\coding\\vs-code-extension folder\\TInkering project\\cph-leetcode\\fetching-testcases.py',
			[searchQuery , hard_coded_dir ],
			async (err) => {
				if (err) {
					console.error(err);
				} else {
					console.log(`File ran successfully`);
					vscode.window.showInformationMessage('Testcases fetched successfully');
		
				
					selectedLanguage = await vscode.window.showQuickPick(
					['C++', 'Python', 'Java'],
					{
						placeHolder: 'Select the programming language',
					}
					);

					
		
					if (selectedLanguage) {
					createFileWithBoilerplate(selectedLanguage);
					} else {
					vscode.window.showErrorMessage('No language selected.');
					}
				}

			}
		  );
		}
	  );
	  
	  context.subscriptions.push(disposable2);
	  


	

	

	  
	async function executeCppCode(userCode) {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No folder is open in the current workspace.');
			return;
		}

		const openFolderPath = workspaceFolders[0].uri.fsPath;
		const inputsDir = path.join(openFolderPath, 'inputs');
		const outputsDir = path.join(openFolderPath, 'outputs');

		if (!fs.existsSync(inputsDir) || !fs.existsSync(outputsDir)) {
			vscode.window.showErrorMessage('Inputs or outputs directory not found.');
			return;
		}

		const inputFiles = fs.readdirSync(inputsDir).filter(file => file.startsWith('input_'));
		const outputFiles = fs.readdirSync(outputsDir).filter(file => file.startsWith('output_'));

		if (inputFiles.length !== outputFiles.length) {
			vscode.window.showErrorMessage('Mismatch between number of input and output files.');
			return;
		}


		const tempFilePath = path.join(openFolderPath, 'solution.cpp');
		fs.writeFileSync(tempFilePath, userCode);

		const outputExecutable = path.join(openFolderPath, 'solution');
		const compileProcess = spawn('g++', ['-o', outputExecutable, tempFilePath]);

		compileProcess.on('close', async (code) => {
			if (code !== 0) {
				vscode.window.showErrorMessage('Compilation failed.');
				return;
			}

			const outputChannel = vscode.window.createOutputChannel('C++ Test Cases');
			outputChannel.clear();
			outputChannel.show();

			for (let testCaseIndex = 0; testCaseIndex < inputFiles.length; testCaseIndex++) {
				const inputFilePath = path.join(inputsDir, inputFiles[testCaseIndex]);
				const outputFilePath = path.join(outputsDir, outputFiles[testCaseIndex]);

				const inputJSON = fs.readFileSync(inputFilePath, 'utf-8').trim();
				const expectedOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();

				let parsedInput;
				try {
					parsedInput = JSON.parse(inputJSON);
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to parse input JSON: ${error.message}`);
					return;
				}

				const inputValues = Object.values(parsedInput).join(' ');
				const result = await new Promise((resolve) => {
					const process = spawn(outputExecutable);

					let output = '';
					process.stdin.write(inputValues + '\n');
					process.stdin.end();

					process.stdout.on('data', (data) => {
						output += data.toString();
					});

					process.on('close', () => {
						resolve(output.trim());
					});
				});

				outputChannel.appendLine(`Test Case ${testCaseIndex + 1}:`);
				outputChannel.appendLine(`Input: ${inputValues}`);
				outputChannel.appendLine(`Expected Output: ${expectedOutput}`);
				outputChannel.appendLine(`Your Output: ${result}\n`);
			}
		});

		compileProcess.stderr.on('data', (data) => {
			vscode.window.showErrorMessage(`Compilation error: ${data.toString()}`);
		});
	}
	





	async function executePythonCode(userCode) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
	
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No folder is open in the current workspace.');
			return;
		}
	
		const openFolderPath = workspaceFolders[0].uri.fsPath;
		const inputsDir = path.join(openFolderPath, 'inputs');
		const outputsDir = path.join(openFolderPath, 'outputs');
	
		if (!fs.existsSync(inputsDir) || !fs.existsSync(outputsDir)) {
			vscode.window.showErrorMessage('Inputs or outputs directory not found.');
			return;
		}
	
		const inputFiles = fs.readdirSync(inputsDir).filter(file => file.startsWith('input_'));
		const outputFiles = fs.readdirSync(outputsDir).filter(file => file.startsWith('output_'));
	
		if (inputFiles.length !== outputFiles.length) {
			vscode.window.showErrorMessage('Mismatch between number of input and output files.');
			return;
		}
	
		const tempFilePath = path.join(openFolderPath, 'temp_code.py');
		fs.writeFileSync(tempFilePath, userCode);
	
		const outputChannel = vscode.window.createOutputChannel('Python Test Cases');
		outputChannel.clear();
		outputChannel.show();
	
		for (let testCaseIndex = 0; testCaseIndex < inputFiles.length; testCaseIndex++) {
			const inputFilePath = path.join(inputsDir, inputFiles[testCaseIndex]);
			const outputFilePath = path.join(outputsDir, outputFiles[testCaseIndex]);
	
			const inputJSON = fs.readFileSync(inputFilePath, 'utf-8').trim();
			const expectedOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();
	
			let parsedInput;
			try {
				parsedInput = JSON.parse(inputJSON);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to parse input JSON: ${error.message}`);
				return;
			}
	
			const inputValues = Object.values(parsedInput).join(' ');
			const result = await new Promise((resolve) => {
				const process = spawn('python', [tempFilePath]);
	
				let output = '';
				process.stdin.write(inputValues + '\n');
				process.stdin.end();
	
				process.stdout.on('data', (data) => {
					output += data.toString();
				});
	
				process.on('close', () => {
					resolve(output.trim());
				});
			});
	
			outputChannel.appendLine(`Test Case ${testCaseIndex + 1}:`);
			outputChannel.appendLine(`Input: ${inputValues}`);
			outputChannel.appendLine(`Expected Output: ${expectedOutput}`);
			outputChannel.appendLine(`Your Output: ${result}\n`);
		}
	}
	


	async function executeJavaCode(userCode) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
	
		if (workspaceFolders && workspaceFolders.length > 0) {
			var openFolderPath = workspaceFolders[0].uri.fsPath;
		} else {
			vscode.window.showErrorMessage('No folder is open in the current workspace.');
			return;
		}
		const inputsDir = path.join(openFolderPath, 'inputs');
		const outputsDir = path.join(openFolderPath, 'outputs');
	
		if (!fs.existsSync(inputsDir) || !fs.existsSync(outputsDir)) {
			vscode.window.showErrorMessage('Inputs or outputs directory not found.');
			return;
		}
	
		const inputFiles = fs.readdirSync(inputsDir).filter(file => file.startsWith('input_'));
		const outputFiles = fs.readdirSync(outputsDir).filter(file => file.startsWith('output_'));
	
		if (inputFiles.length !== outputFiles.length) {
			vscode.window.showErrorMessage('Mismatch between number of input and output files.');
			return;
		}
	
		const tempFilePath = path.join(openFolderPath, 'solution.java');
		fs.writeFileSync(tempFilePath, userCode);
	
		const compileProcess = spawn('javac', [tempFilePath]);
	
		compileProcess.on('close', async (code) => {
			if (code !== 0) {
				vscode.window.showErrorMessage('Compilation failed.');
				return;
			}
	
			const outputChannel = vscode.window.createOutputChannel('Java Test Cases');
			outputChannel.clear();
			outputChannel.show();
	
			for (let testCaseIndex = 0; testCaseIndex < inputFiles.length; testCaseIndex++) {
				const inputFilePath = path.join(inputsDir, inputFiles[testCaseIndex]);
				const outputFilePath = path.join(outputsDir, outputFiles[testCaseIndex]);
	
				const inputJSON = fs.readFileSync(inputFilePath, 'utf-8').trim();
				const expectedOutput = fs.readFileSync(outputFilePath, 'utf-8').trim();
	
				let parsedInput;
				try {
					parsedInput = JSON.parse(inputJSON);
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to parse input JSON: ${error.message}`);
					return;
				}
	
				const inputValues = Object.values(parsedInput).join(' ');
				const result = await new Promise((resolve) => {
					const process = spawn('java', ['-cp', openFolderPath, 'solution']);
	
					let output = '';
					process.stdin.write(inputValues + '\n');
					process.stdin.end();
	
					process.stdout.on('data', (data) => {
						output += data.toString();
					});
	
					process.on('close', () => {
						resolve(output.trim());
					});
				});
	
				outputChannel.appendLine(`Test Case ${testCaseIndex + 1}:`);
				outputChannel.appendLine(`Input: ${inputValues}`);
				outputChannel.appendLine(`Expected Output: ${expectedOutput}`);
				outputChannel.appendLine(`Your Output: ${result}\n`);
			}
		});
	
		compileProcess.stderr.on('data', (data) => {
			vscode.window.showErrorMessage(`Compilation error: ${data.toString()}`);
		});
	}
	





	

	const runCodeAgainstTestCases = vscode.commands.registerCommand(
		'cph-leetcode.CPH-run-testcases',
		async function () {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found. Please write your code in an editor.');
				return;
			}

			const userCode = editor.document.getText();
			if (!userCode) {
				vscode.window.showErrorMessage('The editor is empty. Please write your code.');
				return;
			}

	
			console.log("selected language is ");
			console.log(selectedLanguage);
			if(selectedLanguage=="C++"){
				executeCppCode(userCode);
			}

			else if(selectedLanguage=="Python"){
				executePythonCode(userCode);
			}

			else if(selectedLanguage=="Java"){
				console.log("java is selected");
				executeJavaCode(userCode);
			}
		}
	);
	context.subscriptions.push(runCodeAgainstTestCases);
	


	const disposable3 = vscode.commands.registerCommand('cph-leetcode.getOpenFolderPath', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders && workspaceFolders.length > 0) {
            const openFolderPath = workspaceFolders[0].uri.fsPath;
            vscode.window.showInformationMessage(`Open Folder Path: ${openFolderPath}`);
        } else {
            vscode.window.showErrorMessage('No folder is open in the current workspace.');
        }
    });

    context.subscriptions.push(disposable3);

	context.subscriptions.push(disposable);



	const selectLanguage = vscode.commands.registerCommand('cph-leetcode.selectLanguage', async () => { 
		selectedLanguage = await vscode.window.showQuickPick(
			['C++', 'Python', 'Java'],
			{
				placeHolder: 'Select the programming language',
			}
		);
	
		if (selectedLanguage) {
			createFileWithBoilerplate(selectedLanguage);
		} else {
			vscode.window.showErrorMessage('No language selected.');
		}
	});
	
	context.subscriptions.push(selectLanguage);
	
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
