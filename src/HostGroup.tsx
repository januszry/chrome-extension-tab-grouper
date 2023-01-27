import React from "react";
import styled from "styled-components";
import TabItem from "./TabItem";

const GroupTitle = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 10px 10px 0 10px;
`;

const GroupContent = styled.ul`
  list-style-type: none;
  padding-inline-start: 0;
  margin: 1rem 0;
`;

class HostGroup extends React.Component<{ host: string, tabs: chrome.tabs.Tab[], groups: Map<number, chrome.tabGroups.TabGroup> }, {}> {
  constructor(props: { host: string; tabs: chrome.tabs.Tab[]; groups: Map<number, chrome.tabGroups.TabGroup>; } | Readonly<{ host: string; tabs: chrome.tabs.Tab[]; groups: Map<number, chrome.tabGroups.TabGroup>; }>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const tabIds = this.props.tabs.map(tab => tab.id!);
    const group = await chrome.tabs.group({ tabIds });
    chrome.tabGroups.update(group, { title: this.props.host! });
  }

  render() {
    const listItems = this.props.tabs.map((tab: chrome.tabs.Tab) => <TabItem tab={tab} groups={this.props.groups} />)
    return (
      <a onClick={this.handleClick}>
        <GroupTitle>{this.props.host}</GroupTitle>
        <GroupContent>{listItems}</GroupContent>
      </a>
    );
  }
}

export default HostGroup;
