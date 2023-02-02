import React, { ChangeEvent, Fragment } from 'react';
import HostGroup from './HostGroup';
import styled from 'styled-components';

const InputBox = styled.input`
  margin: 10px;
`;

const ContainerBox = styled.div`
  display: flex;
  flex-direction: column;
`;

function getDomainName(host: string, domainGroupLevel: number) {
  const split = host.split('.');
  if (split.length <= domainGroupLevel) {
    return host;
  }
  return split.slice(-domainGroupLevel).join('.');
}

async function getTabs(): Promise<Map<string, chrome.tabs.Tab[]>> {
  const tabs = await chrome.tabs.query({
    url: [
      "https://*/*"
    ],
  });

  const savedOptions = await chrome.storage.sync.get({
    domainGroupLevel: 3,
  });
  const domainGroupLevel = savedOptions.domainGroupLevel;

  const collator = new Intl.Collator();
  tabs.sort((a, b) => collator.compare(a.title!, b.title!));

  const map = new Map<string, chrome.tabs.Tab[]>();

  for (const tab of tabs) {
    if (!tab.id || tab.id == chrome.tabs.TAB_ID_NONE || undefined === tab.url) {
      continue;
    }
    const url = new URL(tab.url);
    const sld = getDomainName(url.host, domainGroupLevel);
    var group = map.get(sld);
    if (undefined === group) {
      group = new Array<chrome.tabs.Tab>();
      map.set(sld, group);
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
  textFilter: string,
}

class Container extends React.Component<{}, ContainerStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tabs: new Map<string, chrome.tabs.Tab[]>(),
      groups: new Map<number, chrome.tabGroups.TabGroup>(),
      activeTab: undefined,
      textFilter: '',
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  handleRefresh(): void {
    getTabs().then(tabs => this.setState({ tabs }));
    getGroups().then(groups => this.setState({ groups }));
    getActiveTab().then(tab => this.setState({ activeTab: tab }));
  }

  handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    this.setState({ textFilter: event.target.value });
  }

  componentDidMount(): void {
    this.handleRefresh();
  }
  render(): React.ReactNode {
    const listItems = new Array<JSX.Element>();
    const { textFilter, groups, activeTab, tabs } = this.state;
    tabs.forEach((tabs, host) => {
      const existingGroupIds = new Set<number>(tabs.map(tab => tab.groupId));
      const group = existingGroupIds.size == 1 && tabs[0].groupId != -1 ? groups.get(tabs[0].groupId) : undefined;
      if (tabs.length == 0) {
        return;
      }
      const item = <HostGroup
        host={host}
        tabs={tabs}
        activeTab={activeTab}
        groups={groups}
        group={group}
        textFilter={textFilter}
        refresh={this.handleRefresh}
      />;
      const tabIds = new Set<number | undefined>(tabs.filter(tab => tab.id != chrome.tabs.TAB_ID_NONE).map(tab => tab.id));
      if (activeTab?.id && tabIds.has(activeTab.id)) {
        listItems.unshift(item);
      } else {
        listItems.push(item);
      }
    })
    return (
      <ContainerBox>
        <InputBox autoFocus={true} onChange={this.handleInputChange}></InputBox>
        {listItems}
      </ContainerBox>
    );
  }
}

export default Container;
