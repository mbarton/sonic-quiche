import React from 'react';
import { List } from 'semantic-ui-react'

function EventItem({ icon, header, timestamp }) {
    return <List.Item>
        <List.Icon name={icon} size='large' verticalAlign='middle' />
        <List.Content>
            <List.Header as='a'>{header}</List.Header>
            <List.Description as='a'>{timestamp}</List.Description>
        </List.Content>
    </List.Item>;
}

function Event({ action, data, timestamp }) {
    switch(action) {
        case "complete":
            return <EventItem icon='check circle' header='Finished' timestamp={timestamp} />;

        case "log":
            return <EventItem icon='talk' header={data} timestamp={timestamp} />;

        default:
            return <EventItem icon='question circle' header={action} timestamp={timestamp} />;
    }
}

export function Sidebar({ events }) {
    return <List divided relaxed>
        {events.map(({ action, data, timestamp }, ix) => {
            return <Event key={ix} action={action} data={data} timestamp={timestamp} />
        })}
    </List>;
}