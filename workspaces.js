#!/usr/bin/env node

/**
 * VSCode Workspace Manager Script (non-recursive)
 * 
 * Usage:
 *   node workspaces.js ls
 *   node workspaces.js cd <id>
 * 
 * - `ls`: Lists all .code-workspace files in the workspace directory, 
 *         showing their indexed folders.
 * - `cd <id>`: Prints the absolute path for the given id 
 *              (to be used with `cd $(node workspaces.js cd <id>)`).
 */

const fs = require('fs');
const path = require('path');

// Determine workspace directory (default: current working directory)
const WORKSPACES_DIR = process.env.WORKSPACES_DIR || process.cwd();

// Validate the directory exists
if (!fs.existsSync(WORKSPACES_DIR)) {
    console.error(`❌ WORKSPACES_DIR does not exist: ${WORKSPACES_DIR}`);
    process.exit(1);
}

// Only find .code-workspace files in the given directory (non-recursive)
function findWorkspaceFiles(dir) {
    return fs.readdirSync(dir)
        .filter(name => name.endsWith('.code-workspace') && fs.statSync(path.join(dir, name)).isFile())
        .map(name => path.join(dir, name));
}

// Parse a workspace file and extract its folders
function parseWorkspaceFolders(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        return (data.folders || []).map(f => f.path);
    } catch (e) {
        return [];
    }
}

// List all workspace folders with IDs
function listWorkspaces() {
    const workspaces = findWorkspaceFiles(WORKSPACES_DIR);
    let id = 0;
    const allFolders = [];

    for (const wsPath of workspaces) {
        const folders = parseWorkspaceFolders(wsPath);
        for (const folder of folders) {
            allFolders.push({
                id,
                workspace: wsPath,
                folder: folder,
                fullPath: path.resolve(path.dirname(wsPath), folder),
            });
            id++;
        }
    }

    // Print results
    if (allFolders.length === 0) {
        console.log('No workspace folders found in:', WORKSPACES_DIR);
        return;
    }

    console.log('ID  | Workspace file                | Folder path');
    console.log('----|-------------------------------|-------------------------');
    for (const entry of allFolders) {
        console.log(
            String(entry.id).padEnd(3) + ' | ' +
            path.basename(entry.workspace).padEnd(29) + ' | ' +
            entry.folder
        );
    }
}

// Print the absolute path for a workspace folder by ID
function cdToWorkspace(id) {
    const workspaces = findWorkspaceFiles(WORKSPACES_DIR);
    let idx = 0;

    for (const wsPath of workspaces) {
        const folders = parseWorkspaceFolders(wsPath);
        for (const folder of folders) {
            if (idx === Number(id)) {
                console.log(path.resolve(path.dirname(wsPath), folder));
                return;
            }
            idx++;
        }
    }

    console.error('❌ Invalid id:', id);
    process.exit(1);
}

// Command-line interface
const [, , cmd, arg] = process.argv;

switch (cmd) {
    case 'ls':
        listWorkspaces();
        break;
    case 'cd':
        if (arg === undefined) {
            console.log('Usage: node workspaces.js cd <id>');
            process.exit(1);
        }
        cdToWorkspace(arg);
        break;
    default:
        console.log('Usage:');
        console.log('  node workspaces.js ls');
        console.log('  node workspaces.js cd <id>');
        process.exit(1);
}
