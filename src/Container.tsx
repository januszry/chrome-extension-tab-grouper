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

async function getGroups(): Promise<Map<number, chrome.tabGroups.TabGroup>> {
  const groups = await chrome.tabGroups.query({});  // Get all groups
  return new Map(groups.map(i => [i.id, i]));
}

class Container extends React.Component<{}, { tabs: Map<string, chrome.tabs.Tab[]>, groups: Map<number, chrome.tabGroups.TabGroup> }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tabs: new Map<string, chrome.tabs.Tab[]>(),
      groups: new Map<number, chrome.tabGroups.TabGroup>(),
    }
  }

  handleRefresh(): void {
    getTabs().then(tabs => this.setState({ tabs }));
    getGroups().then(groups => this.setState({ groups }));
  }

  componentDidMount(): void {
    this.handleRefresh();
  }
  render(): React.ReactNode {
    const listItems = new Array<JSX.Element>();
    this.state.tabs.forEach((value, key) => {
      listItems.push(<HostGroup host={key} tabs={value} groups={this.state.groups} />);
    })
    return (
      <div onClick={() => this.handleRefresh()}>
        {listItems}
      </div>
    );
  }
}

export default Container;
