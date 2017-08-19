import React from 'react';
import { Menu, Button } from 'semantic-ui-react';

export function TopBar({ playing, setPlayback }) {
    const playbackProps = playing ?
        { content: "Stop", icon: "stop", color: "red" } :
        { content: "Play", icon: "play", color: "green" };

    return <Menu attached="top">
        <Menu.Item name="🔊🍲" active={true} />
        <Menu.Menu position='right'>
            <div className='ui right aligned category search item'>
                <Button
                    labelPosition='left'
                    onClick={() => setPlayback(!playing)}
                    {...playbackProps}
                />
            </div>
        </Menu.Menu>
    </Menu>;
}