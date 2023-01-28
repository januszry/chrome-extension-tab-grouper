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

interface HostGroupProps {
  host: string,
  tabs: chrome.tabs.Tab[],
  activeTab: chrome.tabs.Tab | undefined,
  groups: Map<number, chrome.tabGroups.TabGroup>,
}

class HostGroup extends React.Component<HostGroupProps, {}> {
  constructor(props: HostGroupProps | Readonly<HostGroupProps>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const tabIds = this.props.tabs.map(tab => tab.id!);
    if (tabIds.length === 0) {
      return;
    }
    const existingGroupIds = new Set<number>(this.props.tabs.map(tab => tab.groupId));
    if (existingGroupIds.size == 1 && this.props.tabs[0].groupId != -1) {
      // If all tabs belong to a same group, only move the group to current window if not
      const group = this.props.groups.get(this.props.tabs[0].groupId);
      if (group && this.props.activeTab && group.windowId != this.props.activeTab.windowId) {
        await chrome.tabGroups.move(group.id, { windowId: this.props.activeTab.windowId, index: -1 });
      }
      return;
    }
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: this.props.host! });
    if (this.props.activeTab && this.props.activeTab.id && !tabIds.includes(this.props.activeTab.id)) {
      await chrome.tabs.update(tabIds[0], { active: true });
    }
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
