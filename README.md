# `npm-dev-link`

This tools solves the problem of having multiple NPM libraries used in
a main app, and wanting to locally develop these libraries. The NPM-recommended
way to do this is to use a `file:` URL for the library:

    npm install --save ../my-lib

The problem with this approach is that any other library used in common
between the library and the main app won't be flattened (de-duplicated) by
NPM. For example:

    A (the main tool) depends on libraries B and C
    B depends on C

If both `B` and `C` are installed from the NPM registry, NPM will hoist `C` up
to the top level so that it only appears once in the webpacked file. But if `A`
points to a local version of `B`, then `C` won't be de-duplicated and `C` will
appear twice. This can cause problems if `A` creates an object from a class in
`C` and passes it to `B`. When `B` does an `instanceof` check, it will fail
because there are two copies of the classes in `C`.

The approach taken by this tool is to first use the NPM registry-installed
version of all libraries, which results in proper flattening and
de-duplication. The tool then creates a symbolic link from the local library's
`dist` directory to the one in the main app's `node_modules` version.
Tools like webpack will grab the correct code without resulting in duplicated
common libraries.

# Installation

Install the app with:

    % npm install -g npm-dev-link

or, from its source directory:

    % npm install -g

# Usage

Run the tool without arguments to list all dependencies that are already
pointing to local repos:

    % npm-dev-link

Specify modules that you want to toggle between being used from the NPM
registry and from the local repo:

    % npm-dev-link A B C

For example:

    ~/A % npm-dev-link
    All modules are pointing to registry
    ~/A % npm-dev-link B
    B: Now pointing to local repo
    (node_modules/B/dist now points to $HOME/B/dist)
    ~/A % npm-dev-link
    These modules point to the local repo:
        B
    ~/A % npm-dev-link B
    B: Now pointing to registry

# License

Copyright &copy; Lawrence Kesteloot, [MIT license](LICENSE).

