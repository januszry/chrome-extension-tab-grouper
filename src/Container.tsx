import React from 'react';
import HostGroup from './HostGroup';

async function getTabs(): Promise<Map<string, chrome.tabs.Tab[]>> {
  const tabs = await chrome.tabs.query({
    url: [
      "https://*/*"
    ],
  });

  const collator = new Intl.Collator();
  tabs.sort((a, b) => collator.compare(a.title!, b.title!));

  const map = new Map<string, chrome.tabs.Tab[]>();

  for (const tab of tabs) {
    if (undefined === tab.url) {
      continue;
    }
    const url = new URL(tab.url);
    var group = map.get(url.host);
    if (undefined === group) {
      group = new Array<chrome.tabs.Tab>();
      map.set(url.host, group);
    }
    group.push(tab);
  }
  return map;
}

class Container extends React.Component<{}, { tabs: Map<string, chrome.tabs.Tab[]> }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tabs: new Map<string, chrome.tabs.Tab[]>(),
    }
  }
  componentDidMount(): void {
    getTabs().then(tabs => this.setState({ tabs }));
  }
  render(): React.ReactNode {
    const listItems = new Array<JSX.Element>();
    this.state.tabs.forEach((value, key) => {
      listItems.push(<HostGroup host={key} tabs={value} />);
    })
    return (
      <div>
        {listItems}
      </div>
    );
  }
}

export default Container;
