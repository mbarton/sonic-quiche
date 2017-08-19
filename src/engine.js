/* global Opal */

export class Engine {
    worker = null;

    constructor(_handleEvent) {
        this.handleEvent = _handleEvent; 
    }

    compile = (rubyCode) => {
        // TODO MRB: do we need the class wrapper here?
        // It will make weird compile errors if people forget the right number of ends
        const wrappedRubyCode = `
            def puts(output)
                %x{ __reservedSPApi.log(output); }
            end

            def print(output)
                %x{ __reservedSPApi.log(output); }
            end
         
            class SonicQuicheWorker
                def self.method_missing(name, *args, &block)
                    %x{
                        const allArgs = block ? args.concat([block]) : args;
                        return __reservedSPApi[name].apply(this, allArgs);
                    }
                end

                ${rubyCode}
            end
        `;

        const jsCode = Opal.compile(wrappedRubyCode);

        return `
            importScripts("${document.location.origin}/opal.min.js");
            importScripts("${document.location.origin}/api.js");

            ${jsCode}

            __reservedSPApi.complete();
        `;
    }

    execute = (jsCode) => {
        // const self = this;
        const blob = new Blob([jsCode], { type: "text/javascript"} );
        
        if(this.worker) {
            this.worker.terminate();
        }

        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = ({ data }) => {
            this.handleEvent(data);
        }
    }

    stop = () => {
        this.worker.terminate();
    }
}