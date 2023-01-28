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

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  return tabs.length > 0 ? tabs[0] : undefined;
}

interface ContainerStates {
  tabs: Map<string, chrome.tabs.Tab[]>,
  groups: Map<number, chrome.tabGroups.TabGroup>,
  activeTab: chrome.tabs.Tab | undefined,
}

class Container extends React.Component<{}, ContainerStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tabs: new Map<string, chrome.tabs.Tab[]>(),
      groups: new Map<number, chrome.tabGroups.TabGroup>(),
      activeTab: undefined,
    }
  }

  handleRefresh(): void {
    getTabs().then(tabs => this.setState({ tabs }));
    getGroups().then(groups => this.setState({ groups }));
    getActiveTab().then(tab => this.setState({ activeTab: tab }));
  }

  componentDidMount(): void {
    this.handleRefresh();
  }
  render(): React.ReactNode {
    const listItems = new Array<JSX.Element>();
    this.state.tabs.forEach((tabs, host) => {
      const existingGroupIds = new Set<number>(tabs.map(tab => tab.groupId));
      const group = existingGroupIds.size == 1 && tabs[0].groupId != -1 ? this.state.groups.get(tabs[0].groupId) : undefined;
      listItems.push(<HostGroup host={host} tabs={tabs} activeTab={this.state.activeTab} groups={this.state.groups} group={group} />);
    })
    return (
      <div onClick={() => this.handleRefresh()}>
        {listItems}
      </div>
    );
  }
}

export default Container;
