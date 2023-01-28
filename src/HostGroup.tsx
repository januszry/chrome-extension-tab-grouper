import React from "react";
import styled from "styled-components";
import TabItem from "./TabItem";

const GroupTitle = styled.h2`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0px;
  flex-shrink: 0;
  flex-grow: 1;
  max-width: 270px;
`;

const Button = styled.button`
  border-width: 0;
  border-radius: 3px;
  background-color: ${props => props.color};
  color: white;
  width: 70px;
  height: 20px;
`;

const GroupTitleFlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;
  justify-content: space-between;
`;

const GroupContent = styled.ul`
  list-style-type: none;
  padding-inline-start: 0;
`;

const GroupContainer = styled.div`
`;

interface HostGroupProps {
  host: string,
  tabs: chrome.tabs.Tab[],
  activeTab: chrome.tabs.Tab | undefined,
  group: chrome.tabGroups.TabGroup | undefined,  // only exists if all tabs under the group belongs to a same group
  groups: Map<number, chrome.tabGroups.TabGroup>,
  textFilter: string,
  refresh: () => void,
}

class HostGroup extends React.Component<HostGroupProps, {}> {
  constructor(props: HostGroupProps | Readonly<HostGroupProps>) {
    super(props);
    this.handleCreateGroup = this.handleCreateGroup.bind(this);
    this.handleMoveGroupHere = this.handleMoveGroupHere.bind(this);
    this.handleUngroup = this.handleUngroup.bind(this);
  }

  fullyGroupedInCurrentWindow(): boolean | undefined {
    const { group, activeTab } = this.props;
    return group && activeTab && group.windowId == activeTab.windowId;
  }

  async handleMoveGroupHere(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const { group, activeTab } = this.props;
    await chrome.tabGroups.move(group!.id, { windowId: activeTab!.windowId, index: -1 });
    this.props.refresh();
  }

  async handleUngroup(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    await chrome.tabs.ungroup(this.props.tabs.map(tab => tab.id!));
    this.props.refresh();
  }

  async handleCreateGroup(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const { host, tabs, refresh } = this.props;
    const tabIds = tabs.map(tab => tab.id!);
    if (tabIds.length === 0) {
      return;
    }
    const newGroup = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(newGroup, { title: host! });
    refresh();
  }

  tabHit(tab: chrome.tabs.Tab): boolean {
    const { textFilter } = this.props;
    if (textFilter.length == 0) {
      return true;
    }
    return tab.title?.toLocaleLowerCase().search(textFilter.toLocaleLowerCase()) != -1
      || tab.url?.toLocaleLowerCase().search(textFilter.toLocaleLowerCase()) != -1;
  }

  render() {
    const { group, groups, host, tabs, refresh } = this.props;
    const listItems = tabs.map((tab: chrome.tabs.Tab) =>
    <TabItem
      tab={tab}
      group={groups.get(tab.groupId)}
      hit={this.tabHit(tab)}
      refresh={refresh}
    />)
    return (
      <GroupContainer>
        <GroupTitleFlexContainer>
          <GroupTitle>{host}</GroupTitle>
          {
            group == undefined
              // ? <ColorPicker host={host} tabs={tabs} refresh={refresh} />
              ? <Button onClick={this.handleCreateGroup} color='green'>Group</Button>
              : (
                this.fullyGroupedInCurrentWindow()
                  ? <Button onClick={this.handleUngroup} color='red'>Ungroup</Button>
                  : <Button onClick={this.handleMoveGroupHere} color='grey'>To Here</Button>
              )
          }
        </GroupTitleFlexContainer>
        <GroupContent>{listItems}</GroupContent>
      </GroupContainer>
    );
  }
}

export default HostGroup;
