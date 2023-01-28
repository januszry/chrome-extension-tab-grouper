import React from "react";
import styled from "styled-components";
import TabItem from "./TabItem";

const GroupTitle = styled.h1`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0px;
  flex-shrink: 0;
`;

const GroupToCurrentWindow = styled.button`
`;

const GroupTitleFlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
`;

const GroupContent = styled.ul`
  list-style-type: none;
  padding-inline-start: 0;
`;

const GroupContainer = styled.div`
  &:not(:first-child) {
    margin-top: 20px;
  }
`;

interface HostGroupProps {
  host: string,
  tabs: chrome.tabs.Tab[],
  activeTab: chrome.tabs.Tab | undefined,
  group: chrome.tabGroups.TabGroup | undefined,  // only exists if all tabs under the group belongs to a same group
  groups: Map<number, chrome.tabGroups.TabGroup>,
}

class HostGroup extends React.Component<HostGroupProps, {}> {
  constructor(props: HostGroupProps | Readonly<HostGroupProps>) {
    super(props);
    this.handleClickGroupAction = this.handleClickGroupAction.bind(this);
  }

  async handleClickGroupAction() {
    const { group, activeTab, host, tabs } = this.props;
    const tabIds = tabs.map(tab => tab.id!);
    if (tabIds.length === 0) {
      return;
    }
    if (group) {
      // If all tabs belong to a same group, only move the group to current window if not
      if (activeTab && group.windowId != activeTab.windowId) {
        await chrome.tabGroups.move(group.id, { windowId: activeTab.windowId, index: -1 });
        await chrome.tabs.update(tabIds[0], { active: true });
      }
      return;
    }
    const newGroup = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(newGroup, { title: host! });
    if (activeTab && activeTab.id && !tabIds.includes(activeTab.id)) {
      await chrome.tabs.update(tabIds[0], { active: true });
    }
  }

  render() {
    const { group, groups, activeTab, host, tabs } = this.props;
    const listItems = tabs.map((tab: chrome.tabs.Tab) => <TabItem tab={tab} group={groups.get(tab.groupId)} />)
    const toHideButton = group && activeTab && group.windowId == activeTab.windowId;
    return (
      <GroupContainer>
        <GroupTitleFlexContainer>
          <GroupTitle>{host}</GroupTitle>
          {
            toHideButton ? undefined : <GroupToCurrentWindow onClick={this.handleClickGroupAction}>{!group ? "Group" : "Move here"}</GroupToCurrentWindow>
          }
        </GroupTitleFlexContainer>
        <GroupContent>{listItems}</GroupContent>
      </GroupContainer>
    );
  }
}

export default HostGroup;
