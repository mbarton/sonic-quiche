import React from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/ruby';
import 'brace/theme/monokai';

export function Editor({ code, setCode, execCode, setPlayback }) {
    const editorId = "sonic-quiche-editor";
    
    const execCommand = {
        name: "executeCode",
        bindKey: "Shift+Enter",
        exec: execCode
    };

    const stopCommand = {
        name: "stopPlayback",
        bindKey: "Esc",
        exec: () => setPlayback(false)
    }

    // TODO MRB: automatically focus editor on page load

    return <AceEditor
        mode="ruby"
        theme="monokai"
        height="800px"
        width="100%"
        fontSize={16}
        showPrintMargin={false}
        commands={[execCommand, stopCommand]}
        value={code}
        onChange={setCode}
        name={editorId}
    />;
}