import React from 'react';

import { Grid } from 'semantic-ui-react';
import { TopBar } from './TopBar'; 
import { Sidebar } from './Sidebar'; 
import { Editor } from './Editor'; 

import { Engine } from './engine';

import 'semantic-ui-css/semantic.min.css';
import { DEFAULT_CODE } from './util';

class App extends React.Component {
  state = {
    code: localStorage.sonicQuicheCode ? localStorage.sonicQuicheCode : DEFAULT_CODE,
    engine: new Engine((e) => this.handleEvent(e)),
    events: [],
    playing: false
  }

  setCode = (code) => {
    localStorage.sonicQuicheCode = code;
    this.setState({ code });
  }

  execCode = () => {
    const { engine, code } = this.state;

    const compiled = engine.compile(code);
    engine.execute(compiled);

    if(!this.state.playing) {
      this.setState({ playing: true });
    }
  }

  setPlayback = (playing) => {
    this.setState({ playing });

    if(!playing) {
      this.state.engine.stop();
    }
  }

  handleEvent = (rawEvent) => {
    const event = Object.assign({}, rawEvent, { timestamp: new Date().toLocaleString() });
    const events = [event].concat(this.state.events);

    if(events.length > 20) {
      events.pop();
    }

    if(event.action === "complete") {
      this.setState({ playing: false });
    }

    this.setState({ events });
  }

  render() {
    return <div onKeyPress={this.handleShortcuts}>
      <TopBar playing={this.state.playing} setPlayback={this.setPlayback} />
      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            <Editor
              code={this.state.code}
              setCode={this.setCode}
              execCode={this.execCode}
              setPlayback={this.setPlayback}
            />
          </Grid.Column>
          <Grid.Column width={4}>
            <Sidebar events={this.state.events} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>;
  }
}

export default App;
