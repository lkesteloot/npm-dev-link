#!/usr/bin/env node

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

// Whether the given module points to a local repo.
async function isLocal(module) {
    const pathname = path.join("node_modules", module);
    const dist = path.join(pathname, "dist");
    const distOrig = path.join(pathname, "dist-orig");

    return fs.existsSync(dist) && (await fsp.lstat(dist)).isSymbolicLink() &&
        fs.existsSync(distOrig) && (await fsp.lstat(distOrig)).isDirectory();
}

// Toggles a module from local and registry.
async function toggleModule(module) {
    const pathname = path.join("node_modules", module);
    const dist = path.join(pathname, "dist");
    const distOrig = path.join(pathname, "dist-orig");
    const localDist = path.resolve("..", module, "dist");

    if (!fs.existsSync(pathname)) {
        console.log(`${module}: No such module`);
    } else if (!fs.existsSync(dist)) {
        console.log(`${module}: Exists but has no dist directory`);
    } else if (await isLocal(module)) {
        await fsp.unlink(dist);
        await fsp.rename(distOrig, dist);
        console.log(`${module}: Now pointing to registry`);
    } else if (!fs.existsSync(localDist)) {
        console.log(`${module}: Has no local repo`);
    } else {
        await fsp.rename(dist, distOrig);
        await fsp.symlink(localDist, dist);
        console.log(`${module}: Now pointing to local repo`);
    }
}

// Main function.
async function main(modules) {
    if (modules.length === 0) {
        // List all local modules.
        const dirs = await fsp.readdir("node_modules");
        let count = 0;
        for (const dir of dirs) {
            if (await isLocal(dir)) {
                if (count === 0) {
                    console.log("These modules point to the local repo:");
                }
                console.log("    " + dir);
                count += 1;
            }
        }
        if (count === 0) {
            console.log("All modules are pointing to registry");
        }
    } else {
        for (const module of modules) {
            await toggleModule(module);
        }
    }
}

// Cut off "node" and name of script:
const modules = process.argv.slice(2);

main(modules);
