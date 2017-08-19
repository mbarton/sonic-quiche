/* global Opal */

export class Engine {
    worker = null;

    compile = (rubyCode) => {
        const jsCode = Opal.compile(rubyCode);

        return `
            importScripts("${document.location.origin}/opal.min.js");
            ${jsCode}
        `;
    }

    execute = (jsCode) => {
        const blob = new Blob([jsCode], { type: "text/javascript"} );
        this.worker = new Worker(URL.createObjectURL(blob));
    }

    stop = () => {
        this.worker.terminate();
    }
}